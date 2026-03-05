import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

const db = new Database("invoices.db");
const JWT_SECRET = process.env.JWT_SECRET || "docugen-secret-key-2024";

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    reset_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT DEFAULT 'payment_account',
    invoice_number TEXT,
    date TEXT,
    client_name TEXT,
    total REAL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    is_default INTEGER DEFAULT 0,
    logo TEXT,
    signature TEXT,
    provider_name TEXT,
    provider_nit TEXT,
    provider_address TEXT,
    provider_phone TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    nit TEXT,
    address TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration helper
const addColumnIfNotExists = (table: string, column: string, type: string) => {
  try {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    if (!info.find(c => c.name === column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
      console.log(`Added column ${column} to ${table}`);
    }
  } catch (e) {
    console.error(`Error adding column ${column} to ${table}:`, e);
  }
};

async function startServer() {
  // Run migrations
  addColumnIfNotExists('users', 'reset_token', 'TEXT');
  addColumnIfNotExists('invoices', 'user_id', 'INTEGER');
  addColumnIfNotExists('settings', 'user_id', 'INTEGER');
  addColumnIfNotExists('settings', 'is_default', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('settings', 'logo', 'TEXT');
  addColumnIfNotExists('settings', 'signature', 'TEXT');
  addColumnIfNotExists('settings', 'provider_name', 'TEXT');
  addColumnIfNotExists('settings', 'provider_nit', 'TEXT');
  addColumnIfNotExists('settings', 'provider_address', 'TEXT');
  addColumnIfNotExists('settings', 'provider_phone', 'TEXT');
  addColumnIfNotExists('clients', 'user_id', 'INTEGER');

  try {
    db.prepare("UPDATE settings SET is_default = 0 WHERE is_default IS NULL").run();
    db.prepare("UPDATE invoices SET type = 'payment_account' WHERE type IS NULL").run();
    
    // Data migration: Assign orphan records to the first user (ID 1)
    const firstUser = db.prepare("SELECT id FROM users ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
    if (firstUser) {
      db.prepare("UPDATE settings SET user_id = ? WHERE user_id IS NULL").run(firstUser.id);
      db.prepare("UPDATE clients SET user_id = ? WHERE user_id IS NULL").run(firstUser.id);
      db.prepare("UPDATE invoices SET user_id = ? WHERE user_id IS NULL").run(firstUser.id);
    }
  } catch (e) {
    console.error("Migration error:", e);
  }

  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true);
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms - Cookies: ${JSON.stringify(req.cookies)}`);
    });
    next();
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies?.token;
    if (!token) {
      console.log(`[AUTH] No token for ${req.method} ${req.url}. Cookies:`, req.cookies);
      return res.status(401).json({ 
        error: "Unauthorized", 
        details: "No session token found. Please login.",
        debug: { hasCookies: !!req.cookies, cookieKeys: Object.keys(req.cookies || {}) }
      });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.log("Token verification failed:", err.message);
        return res.status(403).json({ error: "Forbidden", details: err.message });
      }
      if (!user || !user.id) {
        console.log("Token missing user ID:", user);
        return res.status(401).json({ error: "Unauthorized", details: "Session invalid, please login again" });
      }
      req.user = user;
      next();
    });
  };

  // Auth Endpoints
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
      const info = stmt.run(email, hashedPassword);
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET);
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/',
        partitioned: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      res.json({ user: { id: info.lastInsertRowid, email } });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      path: '/',
      partitioned: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ user: { id: user.id, email: user.email } });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      path: '/',
      partitioned: true
    });
    res.json({ status: "success" });
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.json({ user: null });
      res.json({ user });
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // In a real app, send an email. Here we just return a mock token for demo.
    const resetToken = Math.random().toString(36).substring(7);
    db.prepare("UPDATE users SET reset_token = ? WHERE id = ?").run(resetToken, user.id);
    res.json({ message: "Reset link sent to email", debug_token: resetToken });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE reset_token = ?").get(token);
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password = ?, reset_token = NULL WHERE id = ?").run(hashedPassword, user.id);
    res.json({ message: "Password reset successful" });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/debug/db", (req, res) => {
    try {
      const settingsSchema = db.prepare("PRAGMA table_info(settings)").all();
      const clientsSchema = db.prepare("PRAGMA table_info(clients)").all();
      const invoicesSchema = db.prepare("PRAGMA table_info(invoices)").all();
      res.json({ settings: settingsSchema, clients: clientsSchema, invoices: invoicesSchema });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Settings (Company Profiles) Endpoints
  app.get("/api/settings", authenticateToken, (req: any, res) => {
    try {
      const settings = db.prepare("SELECT * FROM settings WHERE user_id = ? ORDER BY is_default DESC, id ASC").all(req.user.id);
      console.log(`Fetched ${settings.length} settings for user ${req.user.id}`);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/settings", authenticateToken, (req: any, res) => {
    const { id, logo, signature, provider_name, provider_nit, provider_address, provider_phone, is_default } = req.body;
    console.log("Saving settings for user:", req.user.id, "Body:", { ...req.body, logo: logo ? 'exists' : 'none', signature: signature ? 'exists' : 'none' });
    try {
      if (is_default) {
        db.prepare("UPDATE settings SET is_default = 0 WHERE user_id = ?").run(req.user.id);
      }
      
      if (id) {
        const stmt = db.prepare(`
          UPDATE settings SET
            logo = ?, signature = ?, provider_name = ?, provider_nit = ?, 
            provider_address = ?, provider_phone = ?, is_default = ?
          WHERE id = ? AND user_id = ?
        `);
        const result = stmt.run(logo, signature, provider_name, provider_nit, provider_address, provider_phone, is_default ? 1 : 0, id, req.user.id);
        console.log("Update result:", result);
        res.json({ id });
      } else {
        const stmt = db.prepare(`
          INSERT INTO settings (user_id, logo, signature, provider_name, provider_nit, provider_address, provider_phone, is_default)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(req.user.id, logo, signature, provider_name, provider_nit, provider_address, provider_phone, is_default ? 1 : 0);
        console.log("Insert result:", info);
        res.json({ id: info.lastInsertRowid });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ error: "Failed to save settings", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete("/api/settings/:id", authenticateToken, (req: any, res) => {
    try {
      db.prepare("DELETE FROM settings WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
      res.json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete profile" });
    }
  });

  // Clients Endpoints
  app.get("/api/clients", authenticateToken, (req: any, res) => {
    try {
      const clients = db.prepare("SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC").all(req.user.id);
      console.log(`Fetched ${clients.length} clients for user ${req.user.id}`);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/clients", authenticateToken, (req: any, res) => {
    const { id, name, nit, address, phone } = req.body;
    try {
      if (id) {
        db.prepare("UPDATE clients SET name = ?, nit = ?, address = ?, phone = ? WHERE id = ? AND user_id = ?")
          .run(name, nit, address, phone, id, req.user.id);
        res.json({ id });
      } else {
        const info = db.prepare("INSERT OR REPLACE INTO clients (user_id, name, nit, address, phone) VALUES (?, ?, ?, ?, ?)")
          .run(req.user.id, name, nit, address, phone);
        res.json({ id: info.lastInsertRowid });
      }
    } catch (error) {
      console.error("Error saving client:", error);
      res.status(500).json({ error: "Failed to save client" });
    }
  });

  app.post("/api/invoices", authenticateToken, (req: any, res) => {
    const { id, type, invoiceNumber, date, acquiringCompany, grandTotal, data } = req.body;
    try {
      if (id) {
        const stmt = db.prepare(`
          UPDATE invoices 
          SET type = ?, invoice_number = ?, date = ?, client_name = ?, total = ?, data = ?
          WHERE id = ? AND user_id = ?
        `);
        stmt.run(type || 'payment_account', invoiceNumber, date, acquiringCompany, grandTotal, JSON.stringify(data), id, req.user.id);
        res.json({ id });
      } else {
        const stmt = db.prepare(`
          INSERT INTO invoices (user_id, type, invoice_number, date, client_name, total, data)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(req.user.id, type || 'payment_account', invoiceNumber, date, acquiringCompany, grandTotal, JSON.stringify(data));
        res.json({ id: info.lastInsertRowid });
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      res.status(500).json({ error: "Failed to save invoice" });
    }
  });

  app.get("/api/invoices/next-number/:type", authenticateToken, (req: any, res) => {
    const { type } = req.params;
    try {
      const result = db.prepare(`
        SELECT invoice_number 
        FROM invoices 
        WHERE type = ? AND user_id = ?
        ORDER BY CAST(invoice_number AS INTEGER) DESC 
        LIMIT 1
      `).get(type, req.user.id);
      
      const lastNumber = result ? parseInt(result.invoice_number.replace(/\D/g, '')) : 0;
      const nextNumber = (isNaN(lastNumber) ? 0 : lastNumber) + 1;
      res.json({ nextNumber: String(nextNumber).padStart(4, '0') });
    } catch (error) {
      console.error("Error fetching next number:", error);
      res.status(500).json({ error: "Failed to fetch next number" });
    }
  });

  app.get("/api/invoices", authenticateToken, (req: any, res) => {
    try {
      const invoices = db.prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
      res.json(invoices.map((inv: any) => ({
        ...inv,
        data: JSON.parse(inv.data)
      })));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
