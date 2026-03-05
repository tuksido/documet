/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect, FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Image as ImageIcon, 
  PenTool, 
  FileText, 
  Settings,
  ChevronRight,
  ChevronDown,
  Layout,
  Save,
  History as HistoryIcon,
  Search,
  ExternalLink,
  X,
  Eye,
  LogOut,
  User as UserIcon,
  Loader2,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  LabelList
} from 'recharts';
import InvoiceTemplate from './components/InvoiceTemplate';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';

// Utility for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">DocuGen</span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 ml-4">
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link to="/create" className="hover:text-blue-600 transition-colors">Generador</Link>
                <Link to="/history" className="hover:text-blue-600 transition-colors">Historial</Link>
                <Link to="/clients" className="hover:text-blue-600 transition-colors">Clientes</Link>
                <Link to="/settings" className="hover:text-blue-600 transition-colors">Perfil</Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/settings"
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all md:hidden"
                title="Configuración de Perfil"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-600 max-w-[120px] truncate">{user.email}</span>
              </div>
              <button 
                onClick={() => logout()}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <Link 
                to="/create" 
                className="hidden sm:flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateInvoice />} />
          <Route path="/history" element={<History />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-between items-center z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <Layout className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Inicio</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Stats</span>
        </Link>
        <Link to="/create" className="flex flex-col items-center -mt-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter mt-1 text-blue-600">Crear</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <HistoryIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Docs</span>
        </Link>
        <Link to="/clients" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Clientes</span>
        </Link>
      </nav>
    </div>
  );
}

function Dashboard() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/invoices', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/clients', { credentials: 'include' }).then(res => res.json())
    ]).then(([invoicesData, clientsData]) => {
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh] bg-[#0a0b14]">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  // --- Data Processing ---

  // 1. Monthly Billing
  const monthlyData = invoices.reduce((acc: any[], inv) => {
    const date = new Date(inv.created_at);
    const month = date.toLocaleString('es-ES', { month: 'short' });
    const existing = acc.find(d => d.name === month);
    if (existing) {
      existing.total += Number(inv.total || 0);
    } else {
      acc.push({ name: month, total: Number(inv.total || 0) });
    }
    return acc;
  }, []).slice(-6);

  // 2. Document Distribution (Count)
  const typeData = [
    { name: 'Facturas', value: invoices.filter(i => i.type === 'invoice').length },
    { name: 'Cuentas Cobro', value: invoices.filter(i => i.type === 'payment_account').length }
  ];

  // 3. Accumulated Values
  const accumulatedInvoices = invoices
    .filter(i => i.type === 'invoice')
    .reduce((acc, inv) => acc + Number(inv.total || 0), 0);
  const accumulatedPaymentAccounts = invoices
    .filter(i => i.type === 'payment_account')
    .reduce((acc, inv) => acc + Number(inv.total || 0), 0);

  // 4. Client Stats (Deposit, Balance, Count)
  const clientStatsMap = invoices.reduce((acc: any, inv) => {
    const name = inv.client_name || 'Sin Nombre';
    if (!acc[name]) {
      acc[name] = { name, count: 0, total: 0, deposit: 0, balance: 0 };
    }
    acc[name].count += 1;
    acc[name].total += Number(inv.total || 0);
    acc[name].deposit += Number(inv.data?.deposit || 0);
    acc[name].balance += Number(inv.data?.balance || 0);
    return acc;
  }, {});

  const clientStatsArray = Object.values(clientStatsMap) as any[];
  
  // 5. Top Client (Most Invoices)
  const topClient = [...clientStatsArray].sort((a, b) => b.count - a.count)[0] || { name: 'N/A', total: 0, count: 0 };

  // 6. Top Clients by Balance (for chart)
  const topClientsByBalance = [...clientStatsArray]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const NEON_COLORS = ['#00f2ff', '#7000ff', '#ff00c8', '#ffea00', '#00ff44'];

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white p-4 sm:p-8 space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            BUSINESS INTELLIGENCE
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Panel de Control Avanzado</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-2xl shadow-blue-500/10">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-black text-blue-400">LIVE FEED ACTIVE</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Client Highlight */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <UserIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cliente Estrella</span>
          </div>
          <div className="text-xl font-black truncate mb-1">{topClient.name}</div>
          <div className="text-xs text-gray-400 font-bold mb-3">{topClient.count} Documentos Generados</div>
          <div className="text-lg font-black text-blue-400">$ {topClient.total.toLocaleString('es-CO')}</div>
        </div>

        {/* Accumulated Invoices */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Acumulado Facturas</span>
          </div>
          <div className="text-2xl font-black mb-1">$ {accumulatedInvoices.toLocaleString('es-CO')}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Valor total en facturación</div>
        </div>

        {/* Accumulated Payment Accounts */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Acumulado Cuentas Cobro</span>
          </div>
          <div className="text-2xl font-black mb-1">$ {accumulatedPaymentAccounts.toLocaleString('es-CO')}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Valor total en cuentas de cobro</div>
        </div>

        {/* Total Balance */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-rose-500/20 rounded-xl">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Saldo por Cobrar</span>
          </div>
          <div className="text-2xl font-black text-rose-400 mb-1">$ {clientStatsArray.reduce((a, b) => a + b.balance, 0).toLocaleString('es-CO')}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cartera pendiente total</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Billing - Large Chart */}
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl shadow-black/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-tighter">
              <BarChart2 className="w-5 h-5 text-blue-400" /> Facturación Mensual
            </h3>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Últimos 6 meses</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                  tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[10, 10, 0, 0]}>
                  <LabelList dataKey="total" position="top" fill="#fff" fontSize={10} formatter={(val: any) => `$${(val/1000).toFixed(0)}k`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Document Distribution - Circular Chart */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl shadow-black/50">
          <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-tighter mb-8">
            <PieChartIcon className="w-5 h-5 text-purple-400" /> Documentos
          </h3>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-[10px] font-black uppercase text-gray-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-black">{invoices.length}</div>
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">Total Docs</div>
            </div>
          </div>
        </div>

        {/* Client Balances - Horizontal Bar Chart */}
        <div className="lg:col-span-12 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl shadow-black/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black flex items-center gap-3 uppercase tracking-tighter">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Cartera por Cliente (Top 5)
            </h3>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saldos vs Abonos</div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topClientsByBalance} 
                layout="vertical"
                margin={{ left: 40, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#fff', fontWeight: 'bold'}} 
                  width={100}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
                  formatter={(val: number) => `$ ${val.toLocaleString('es-CO')}`}
                />
                <Legend verticalAlign="top" align="right" height={36} />
                <Bar dataKey="deposit" name="Abonos" fill="#10b981" radius={[0, 5, 5, 0]} barSize={20}>
                  <LabelList dataKey="deposit" position="right" fill="#10b981" fontSize={9} formatter={(val: any) => `$${(val/1000).toFixed(0)}k`} />
                </Bar>
                <Bar dataKey="balance" name="Saldos" fill="#ef4444" radius={[0, 5, 5, 0]} barSize={20}>
                  <LabelList dataKey="balance" position="right" fill="#ef4444" fontSize={9} formatter={(val: any) => `$${(val/1000).toFixed(0)}k`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8 md:py-20 px-4 text-center">
      <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-6">
        <Layout className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Documentos Profesionales en <span className="text-blue-600">Segundos</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
        Crea cuentas de cobro y facturas con diseño sofisticado, listas para imprimir en tamaño carta. 
        Personaliza cada detalle, guarda tus documentos y exporta a PDF al instante.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/create" 
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-3"
        >
          Empezar Ahora
          <ChevronRight className="w-5 h-5" />
        </Link>
        <Link 
          to="/history" 
          className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
        >
          Ver Historial
          <HistoryIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

function History() {
  const { logout } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'invoice' | 'payment_account'>('invoice');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
    fetch('/api/invoices', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401) {
             // Handle unauthorized
          }
          throw new Error('Error al cargar facturas');
        }
        return res.json();
      })
      .then(data => {
        if (data) setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching invoices:', err);
        setInvoices([]);
        setLoading(false);
      });
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.type === activeTab && (
      (inv.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inv.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  );

  const totalInvoices = invoices.filter(i => i.type === 'invoice').reduce((acc, inv) => acc + Number(inv.total), 0);
  const totalPayments = invoices.filter(i => i.type === 'payment_account').reduce((acc, inv) => acc + Number(inv.total), 0);

  const exportToExcel = () => {
    const dataToExport = filteredInvoices.map(inv => ({
      'No. Documento': inv.invoice_number,
      'Fecha': new Date(inv.created_at).toLocaleDateString(),
      'Cliente': inv.client_name,
      'NIT': inv.data?.acquiringCompanyNit || '',
      'Total': inv.total,
      'Saldo': inv.data?.balance || 0,
      'Tipo': inv.type === 'invoice' ? 'Factura' : 'Cuenta de Cobro'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documentos");
    XLSX.writeFile(wb, `Reporte_Documentos_${activeTab}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Historial de Documentos</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Gestiona tus facturas y cuentas de cobro guardadas.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-emerald-600 text-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-emerald-100 flex flex-col justify-center">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Facturado</span>
              <span className="text-sm sm:text-xl font-black truncate">$ {totalInvoices.toLocaleString('es-CO')}</span>
            </div>
            <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-blue-100 flex flex-col justify-center">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Cuentas Cobro</span>
              <span className="text-sm sm:text-xl font-black truncate">$ {totalPayments.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('invoice')}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                activeTab === 'invoice' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FileText className="w-4 h-4" /> Facturas
            </button>
            <button 
              onClick={() => setActiveTab('payment_account')}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                activeTab === 'payment_account' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <HistoryIcon className="w-4 h-4" /> Cuentas de Cobro
            </button>
          </div>
          <button 
            onClick={exportToExcel}
            className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No hay documentos</h3>
          <p className="text-gray-500 text-sm mb-6">Aún no has guardado ninguna {activeTab === 'invoice' ? 'factura' : 'cuenta de cobro'}.</p>
          <Link to="/create" className="text-blue-600 font-bold hover:underline">Crear mi primer documento</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  inv.type === 'invoice' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  No. {inv.invoice_number}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                  {new Date(inv.created_at).toLocaleDateString()}
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{inv.client_name || 'Sin Cliente'}</h4>
              <p className="text-sm text-gray-500 mb-6 font-mono">$ {Number(inv.total).toLocaleString('es-CO')}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate('/create', { state: { initialData: { ...inv.data, id: inv.id } } })}
                  className="flex-grow bg-gray-50 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" /> Editar / Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsList() {
  const { logout } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientDocs, setSelectedClientDocs] = useState<{name: string, type: string} | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchClients = () => {
    setLoading(true);
    const handleRes = async (res: Response) => {
      if (!res.ok) {
        if (res.status === 401) {
          // Could trigger logout here if needed
        }
        throw new Error(`Error ${res.status}`);
      }
      return res.json();
    };

    Promise.all([
      fetch('/api/clients', { credentials: 'include' }).then(handleRes),
      fetch('/api/invoices', { credentials: 'include' }).then(handleRes)
    ]).then(([clientsData, invoicesData]) => {
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching history data:', err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSaveClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingClient.name) return alert('El nombre es obligatorio');
    setIsSaving(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClient),
        credentials: 'include'
      });
      if (response.ok) {
        setEditingClient(null);
        fetchClients();
      } else {
        alert('Error al guardar el cliente');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const getClientStats = (clientName: string) => {
    const clientInvoices = invoices.filter(inv => 
      inv.client_name?.toLowerCase() === clientName?.toLowerCase()
    );

    const stats = {
      invoiceCount: clientInvoices.filter(i => i.type === 'invoice').length,
      paymentAccountCount: clientInvoices.filter(i => i.type === 'payment_account').length,
      totalBilled: clientInvoices.reduce((acc, inv) => acc + Number(inv.total || 0), 0),
      totalPaid: clientInvoices.reduce((acc, inv) => {
        const deposit = Number(inv.data?.deposit || 0);
        // If it's a payment account, we assume it's fully paid or use deposit if provided
        // For invoices, we use the deposit field
        return acc + (inv.type === 'invoice' ? deposit : Number(inv.total || 0));
      }, 0),
      pendingBalance: 0
    };

    stats.pendingBalance = clientInvoices.reduce((acc, inv) => {
      if (inv.type === 'invoice') {
        return acc + Number(inv.data?.balance || 0);
      }
      return acc;
    }, 0);

    return stats;
  };

  const filteredClients = clients.filter(client => 
    (client.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.nit?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (client.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const dataToExport = filteredClients.map(client => {
      const stats = getClientStats(client.name);
      return {
        'Nombre': client.name,
        'NIT': client.nit || '',
        'Teléfono': client.phone || '',
        'Dirección': client.address || '',
        'Facturas': stats.invoiceCount,
        'Cuentas Cobro': stats.paymentAccountCount,
        'Total Facturado': stats.totalBilled,
        'Saldo Pendiente': stats.pendingBalance
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "Listado_Clientes.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Directorio de Clientes</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Consulta estadísticas y saldos por cada cliente registrado.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => setEditingClient({ name: '', nit: '', address: '', phone: '' })}
              className="flex-grow bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
            <button 
              onClick={exportToExcel}
              className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all"
              title="Exportar Clientes a Excel"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Buscar por nombre, NIT, teléfono o dirección..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
          <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No se encontraron clientes</h3>
          <p className="text-gray-500 text-sm">Intenta con otro término de búsqueda o crea un nuevo documento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">NIT</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Teléfono</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden xl:table-cell">Dirección</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Docs</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Saldo Pendiente</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => {
                  const stats = getClientStats(client.name);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-sm">{client.name}</div>
                        <div className="text-[10px] text-gray-400 lg:hidden flex flex-wrap gap-x-2">
                          {client.nit && <span className="whitespace-nowrap">NIT: {client.nit}</span>}
                          {client.phone && <span className="whitespace-nowrap">Tel: {client.phone}</span>}
                          {client.address && <span className="whitespace-nowrap">Dir: {client.address}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell font-mono whitespace-nowrap">
                        NIT: {client.nit || '---'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                        Tel: {client.phone || '---'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden xl:table-cell max-w-[200px] truncate" title={client.address}>
                        Dir: {client.address || '---'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setSelectedClientDocs({ name: client.name, type: 'invoice' })}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold hover:bg-emerald-100 transition-colors" 
                            title="Ver Facturas"
                          >
                            F: {stats.invoiceCount}
                          </button>
                          <button 
                            onClick={() => setSelectedClientDocs({ name: client.name, type: 'payment_account' })}
                            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors" 
                            title="Ver Cuentas de Cobro"
                          >
                            C: {stats.paymentAccountCount}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={cn(
                          "text-sm font-black",
                          stats.pendingBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                          $ {stats.pendingBalance.toLocaleString('es-CO')}
                        </div>
                        <div className="text-[9px] text-gray-400">Total: $ {stats.totalBilled.toLocaleString('es-CO')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => setEditingClient(client)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Datos del Cliente"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Client Documents */}
      {selectedClientDocs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedClientDocs.name}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  {selectedClientDocs.type === 'invoice' ? 'Facturas Guardadas' : 'Cuentas de Cobro Guardadas'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedClientDocs(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 scrollbar-thin">
              {invoices.filter(inv => 
                inv.client_name?.toLowerCase() === selectedClientDocs.name.toLowerCase() && 
                inv.type === selectedClientDocs.type
              ).length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">No hay documentos de este tipo para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices
                    .filter(inv => 
                      inv.client_name?.toLowerCase() === selectedClientDocs.name.toLowerCase() && 
                      inv.type === selectedClientDocs.type
                    )
                    .map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">No. {inv.invoice_number}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{new Date(inv.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col items-end mr-4">
                          <span className="text-sm font-bold text-gray-900">$ {Number(inv.total).toLocaleString('es-CO')}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedClientDocs(null);
                            navigate('/create', { state: { initialData: { ...inv.data, id: inv.id } } });
                          }}
                          className="bg-white text-blue-600 p-2 rounded-xl shadow-sm border border-gray-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                        >
                          <Eye className="w-4 h-4" /> Ver / Editar
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedClientDocs(null)}
                className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding/Editing Client */}
      {editingClient && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">{editingClient.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button 
                onClick={() => setEditingClient(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo / Razón Social</label>
                <input 
                  required
                  value={editingClient.name || ''}
                  onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: Juan Perez o Empresa S.A.S"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">NIT / C.C.</label>
                <input 
                  value={editingClient.nit || ''}
                  onChange={e => setEditingClient({...editingClient, nit: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: 123.456.789-0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
                <input 
                  value={editingClient.phone || ''}
                  onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: 300 123 4567"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Dirección</label>
                <input 
                  value={editingClient.address || ''}
                  onChange={e => setEditingClient({...editingClient, address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Ej: Calle 123 # 45-67"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-grow py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-grow py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const { logout } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = () => {
    setLoading(true);
    fetch('/api/settings', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          try {
            const err = JSON.parse(text);
            throw new Error(err.details || err.error || `Error ${res.status}: ${res.statusText}`);
          } catch (e) {
            throw new Error(`Error ${res.status}: ${res.statusText} - ${text.substring(0, 100)}`);
          }
        }
        return res.json();
      })
      .then(data => {
        setProfiles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profiles:', err);
        alert(`Error al cargar perfiles: ${err.message}`);
        setProfiles([]);
        setLoading(false);
      });
  };

  const handleSave = async () => {
    if (!editingProfile.provider_name) return alert('El nombre es obligatorio');
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfile),
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Perfil guardado correctamente');
        setEditingProfile(null);
        fetchProfiles();
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.error || 'Error desconocido'}${errorData.details ? '\nDetalles: ' + errorData.details : ''}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este perfil?')) return;
    try {
      await fetch(`/api/settings/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchProfiles();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setEditingProfile({ ...editingProfile, [field]: ev.target?.result });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 px-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfiles de Empresa</h2>
          <p className="text-gray-500 mt-1 text-sm">Gestiona múltiples perfiles para tus documentos.</p>
        </div>
        {!editingProfile && (
          <button 
            onClick={() => setEditingProfile({ provider_name: '', provider_nit: '', provider_address: '', provider_phone: '', logo: '', signature: '', is_default: profiles.length === 0 ? 1 : 0 })}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" /> Nuevo Perfil
          </button>
        )}
      </div>

      {editingProfile ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900">{editingProfile.id ? 'Editar Perfil' : 'Nuevo Perfil'}</h3>
            <button onClick={() => setEditingProfile(null)} className="text-gray-400 hover:text-gray-600">Cancelar</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Nombre o Razón Social</label>
                <input 
                  placeholder="Nombre Completo" 
                  value={editingProfile.provider_name || ''}
                  onChange={e => setEditingProfile({...editingProfile, provider_name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">NIT / C.C.</label>
                <input 
                  placeholder="NIT / C.C." 
                  value={editingProfile.provider_nit || ''}
                  onChange={e => setEditingProfile({...editingProfile, provider_nit: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Dirección</label>
                <input 
                  placeholder="Dirección" 
                  value={editingProfile.provider_address || ''}
                  onChange={e => setEditingProfile({...editingProfile, provider_address: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Teléfono de Contacto</label>
                <input 
                  placeholder="Teléfono" 
                  value={editingProfile.provider_phone || ''}
                  onChange={e => setEditingProfile({...editingProfile, provider_phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is_default"
                  checked={editingProfile.is_default === 1}
                  onChange={e => setEditingProfile({...editingProfile, is_default: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700">Perfil por defecto</label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Logotipo</label>
                  <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                    {editingProfile.logo ? (
                      <img src={editingProfile.logo} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Subir Logo</span>
                      </div>
                    )}
                    <input type="file" onChange={e => handleFileUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Firma</label>
                  <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                    {editingProfile.signature ? (
                      <img src={editingProfile.signature} className="h-full w-full object-contain p-4" />
                    ) : (
                      <div className="text-center">
                        <PenTool className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400">Subir Firma</span>
                      </div>
                    )}
                    <input type="file" onChange={e => handleFileUpload(e, 'signature')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={() => setEditingProfile(null)}
              className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editingProfile.id ? 'Actualizar Perfil' : 'Guardar Perfil'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(profiles) && profiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-3xl border border-gray-200 p-6 flex items-start gap-4 hover:shadow-md transition-all relative group">
              {profile.is_default === 1 && (
                <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                  Defecto
                </div>
              )}
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                {profile.logo ? (
                  <img src={profile.logo} className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{profile.provider_name}</h4>
                <p className="text-xs text-gray-500 mt-1">NIT: {profile.provider_nit}</p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => setEditingProfile(profile)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No hay perfiles creados.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateInvoice() {
  const { logout } = useAuth();
  const [paperSize, setPaperSize] = useState<'letter' | 'a4' | 'legal'>('letter');
  const [docType, setDocType] = useState<'payment_account' | 'invoice'>('payment_account');
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const templateRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [invoiceData, setInvoiceData] = useState<any>({
    invoiceNumber: '',
    city: 'BOGOTÁ',
    date: new Date().toLocaleDateString('es-CO'),
    acquiringCompany: '',
    acquiringCompanyNit: '',
    acquiringCompanyAddress: '',
    acquiringCompanyPhone: '',
    serviceProvider: '',
    serviceProviderNit: '',
    serviceProviderAddress: '',
    serviceProviderPhone: '',
    concept: '',
    showConcept: true,
    items: [],
    grandTotal: 0,
    deposit: 0,
    balance: 0,
  });

  useEffect(() => {
    // Fetch profiles and clients
    fetch('/api/settings', { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          try {
            const err = JSON.parse(text);
            throw new Error(err.details || err.error || `Error ${res.status}: ${res.statusText}`);
          } catch (e) {
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          }
        }
        return res.json();
      })
      .then(data => setProfiles(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching profiles:', err);
        if (err.message !== 'Unexpected end of JSON input') {
          alert(`Error al cargar perfiles: ${err.message}`);
        }
      });
      
    fetch('/api/clients', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.details || err.error || 'Error al cargar clientes');
          }).catch(() => {
            throw new Error('Error al cargar clientes');
          });
        }
        return res.json();
      })
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching clients:', err);
        if (err.message !== 'Unexpected end of JSON input') {
          alert(`Error al cargar clientes: ${err.message}`);
        }
      });
  }, []);

  useEffect(() => {
    if (!location.state?.initialData) {
      // Load default profile
      const defaultProfile = Array.isArray(profiles) ? (profiles.find(p => p.is_default === 1) || profiles[0]) : null;
      if (defaultProfile) {
        setInvoiceData(prev => ({
          ...prev,
          serviceProvider: defaultProfile.provider_name || '',
          serviceProviderNit: defaultProfile.provider_nit || '',
          serviceProviderAddress: defaultProfile.provider_address || '',
          serviceProviderPhone: defaultProfile.provider_phone || '',
        }));
        setLogo(defaultProfile.logo);
        setSignature(defaultProfile.signature);
      }
      
      // Fetch next consecutive number
      fetch(`/api/invoices/next-number/${docType}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setInvoiceData(prev => ({ ...prev, invoiceNumber: data.nextNumber }));
        });
    } else {
      const { logo: initialLogo, signature: initialSignature, type: initialType, ...rest } = location.state.initialData;
      setInvoiceData(rest);
      setLogo(initialLogo);
      setSignature(initialSignature);
      if (initialType) setDocType(initialType);
    }
  }, [location.state, docType, profiles]);

  const handleProfileSelect = (profileId: string) => {
    const profile = Array.isArray(profiles) ? profiles.find(p => String(p.id) === profileId) : null;
    if (profile) {
      setInvoiceData(prev => ({
        ...prev,
        serviceProvider: profile.provider_name || '',
        serviceProviderNit: profile.provider_nit || '',
        serviceProviderAddress: profile.provider_address || '',
        serviceProviderPhone: profile.provider_phone || '',
      }));
      setLogo(profile.logo);
      setSignature(profile.signature);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = Array.isArray(clients) ? clients.find(c => String(c.id) === clientId) : null;
    if (client) {
      setInvoiceData(prev => ({
        ...prev,
        acquiringCompany: client.name || '',
        acquiringCompanyNit: client.nit || '',
        acquiringCompanyAddress: client.address || '',
        acquiringCompanyPhone: client.phone || '',
      }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setInvoiceData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'grandTotal' || field === 'deposit') {
        newData.balance = Number(newData.grandTotal) - Number(newData.deposit || 0);
      }
      return newData;
    });
  };

  const addItem = () => {
    const newItems = [...invoiceData.items, { patient: '', procedure: '', total: 0 }];
    handleInputChange('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = invoiceData.items.filter((_: any, i: number) => i !== index);
    const newTotal = newItems.reduce((acc: number, item: any) => acc + Number(item.total), 0);
    setInvoiceData(prev => ({ 
      ...prev, 
      items: newItems, 
      grandTotal: newTotal,
      balance: newTotal - Number(prev.deposit || 0)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const newTotal = newItems.reduce((acc: number, item: any) => acc + Number(item.total), 0);
    setInvoiceData(prev => ({ 
      ...prev, 
      items: newItems, 
      grandTotal: newTotal,
      balance: newTotal - Number(prev.deposit || 0)
    }));
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setter(e.target?.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const saveInvoice = async () => {
    if (!invoiceData.invoiceNumber) return alert('El número de documento es obligatorio');
    setIsSaving(true);
    try {
      // Automatically save/update client data
      if (invoiceData.acquiringCompany) {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: invoiceData.acquiringCompany,
            nit: invoiceData.acquiringCompanyNit,
            address: invoiceData.acquiringCompanyAddress,
            phone: invoiceData.acquiringCompanyPhone
          }),
          credentials: 'include'
        });
        // Refresh clients list in background
        fetch('/api/clients', { credentials: 'include' }).then(res => res.json()).then(setClients);
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoiceData.id,
          type: docType,
          invoiceNumber: invoiceData.invoiceNumber,
          date: invoiceData.date,
          acquiringCompany: invoiceData.acquiringCompany,
          grandTotal: invoiceData.grandTotal,
          data: { ...invoiceData, logo, signature, type: docType }
        }),
        credentials: 'include'
      });
      if (response.ok) {
        alert(invoiceData.id ? 'Documento actualizado exitosamente' : 'Documento guardado exitosamente');
        navigate('/history');
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar el documento');
    } finally {
      setIsSaving(false);
    }
  };

  const exportPDF = async () => {
    if (!templateRef.current) return;
    setIsExporting(true);
    
    try {
      const element = templateRef.current;
      const pages = element.querySelectorAll('.invoice-page');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200
        });
        
        const imgData = canvas.toDataURL('image/png');
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      }
      
      pdf.save(`${docType === 'invoice' ? 'Factura' : 'Cuenta_Cobro'}_${invoiceData.invoiceNumber || 'doc'}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-grow overflow-hidden h-[calc(100vh-128px)] md:h-[calc(100vh-64px)]">
      {/* Mobile Toggle Preview */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-2 flex gap-2 shadow-sm">
        <button 
          onClick={() => setShowPreviewMobile(false)}
          className={cn(
            "flex-grow py-2 text-xs font-bold rounded-lg transition-all",
            !showPreviewMobile ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500"
          )}
        >
          Editar Datos
        </button>
        <button 
          onClick={() => setShowPreviewMobile(true)}
          className={cn(
            "flex-grow py-2 text-xs font-bold rounded-lg transition-all",
            showPreviewMobile ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500"
          )}
        >
          Vista Previa
        </button>
      </div>

      {/* Left Panel: Form */}
      <div className={cn(
        "w-full lg:w-[450px] flex-grow lg:flex-grow-0 bg-white border-r border-gray-200 overflow-y-auto p-4 sm:p-6 scrollbar-thin",
        showPreviewMobile ? "hidden lg:block" : "block"
      )}>
        <div className="space-y-8 pb-10">
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings className="w-3 h-3" /> Configuración del Documento
            </h3>
            <div className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setDocType('payment_account')}
                  className={cn(
                    "flex-grow py-2 text-xs font-bold rounded-lg transition-all",
                    docType === 'payment_account' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Cuenta de Cobro
                </button>
                <button 
                  onClick={() => setDocType('invoice')}
                  className={cn(
                    "flex-grow py-2 text-xs font-bold rounded-lg transition-all",
                    docType === 'invoice' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Factura
                </button>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase">Perfil de Empresa (Emisor)</label>
                <select 
                  onChange={(e) => handleProfileSelect(e.target.value)}
                  value={Array.isArray(profiles) ? (profiles.find(p => p.provider_name === invoiceData.serviceProvider)?.id || '') : ''}
                  className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Seleccionar Perfil...</option>
                  {Array.isArray(profiles) && profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.provider_name}</option>
                  ))}
                </select>
                <p className="text-[9px] text-gray-400 mt-1 italic">Los datos de tu empresa se cargarán automáticamente desde este perfil.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">No. Documento</label>
                  <input 
                    type="text" 
                    value={invoiceData.invoiceNumber || ''}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Fecha</label>
                  <input 
                    type="text" 
                    value={invoiceData.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Información del Cliente</h3>
            <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-emerald-600 uppercase">Datos del Cliente</label>
              </div>
              <select 
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Seleccionar Cliente Guardado...</option>
                {Array.isArray(clients) && clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input 
                placeholder="Nombre de la Empresa / Cliente"
                value={invoiceData.acquiringCompany || ''}
                onChange={(e) => handleInputChange('acquiringCompany', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="NIT" value={invoiceData.acquiringCompanyNit || ''} onChange={(e) => handleInputChange('acquiringCompanyNit', e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                <input placeholder="Teléfono" value={invoiceData.acquiringCompanyPhone || ''} onChange={(e) => handleInputChange('acquiringCompanyPhone', e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <input placeholder="Dirección" value={invoiceData.acquiringCompanyAddress || ''} onChange={(e) => handleInputChange('acquiringCompanyAddress', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </section>

          <details className="group border border-gray-100 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors list-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-3 h-3" /> Configuración Avanzada (Perfil y Logos)
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 space-y-6 border-t border-gray-100">
              <section>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Identidad Visual
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Logotipo</label>
                    <div className="relative group/logo">
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, setLogo)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 group-hover/logo:border-blue-400 transition-colors">
                        {logo ? (
                          <img src={logo} className="h-full w-full object-contain p-2" />
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                            <span className="text-[9px] text-gray-400">Subir Logo</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Firma</label>
                    <div className="relative group/sig">
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, setSignature)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 group-hover/sig:border-blue-400 transition-colors">
                        {signature ? (
                          <img src={signature} className="h-full w-full object-contain p-2" />
                        ) : (
                          <>
                            <PenTool className="w-5 h-5 text-gray-300" />
                            <span className="text-[9px] text-gray-400">Subir Firma</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Datos del Emisor (Manual)</label>
                <input 
                  placeholder="Tu Nombre Completo"
                  value={invoiceData.serviceProvider || ''}
                  onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="NIT / C.C." value={invoiceData.serviceProviderNit || ''} onChange={(e) => handleInputChange('serviceProviderNit', e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                  <input placeholder="Teléfono" value={invoiceData.serviceProviderPhone || ''} onChange={(e) => handleInputChange('serviceProviderPhone', e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
                </div>
                <input placeholder="Dirección" value={invoiceData.serviceProviderAddress || ''} onChange={(e) => handleInputChange('serviceProviderAddress', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
          </details>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Concepto y Detalle
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={invoiceData.showConcept !== false}
                  onChange={(e) => handleInputChange('showConcept', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Mostrar</span>
              </label>
            </div>
            {invoiceData.showConcept !== false && (
              <textarea 
                placeholder="Descripción del servicio..."
                value={invoiceData.concept || ''}
                onChange={(e) => handleInputChange('concept', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 mb-4 animate-in fade-in slide-in-from-top-2"
              />
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Ítems de Cobro</label>
                <button 
                  onClick={addItem}
                  className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Añadir Ítem
                </button>
              </div>
              
              {invoiceData.items.map((item: any, index: number) => {
                const itemColors = [
                  'bg-blue-50/50 border-blue-100',
                  'bg-emerald-50/50 border-emerald-100',
                  'bg-violet-50/50 border-violet-100',
                  'bg-amber-50/50 border-amber-100',
                  'bg-rose-50/50 border-rose-100',
                  'bg-indigo-50/50 border-indigo-100'
                ];
                const colorClass = itemColors[index % itemColors.length];
                
                return (
                  <div key={index} className={cn("p-3 rounded-lg border space-y-2 relative group transition-all", colorClass)}>
                    <button 
                      onClick={() => removeItem(index)}
                      className="absolute -top-2 -right-2 bg-white text-red-600 p-1 rounded-full shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <input 
                      placeholder="Paciente"
                      value={item.patient || ''}
                      onChange={(e) => updateItem(index, 'patient', e.target.value)}
                      className="w-full px-2 py-1 bg-white/80 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Descripción"
                        value={item.procedure || ''}
                        onChange={(e) => updateItem(index, 'procedure', e.target.value)}
                        className="px-2 py-1 bg-white/80 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <input 
                        type="number"
                        placeholder="Valor"
                        value={item.total || 0}
                        onChange={(e) => updateItem(index, 'total', e.target.value)}
                        className="px-2 py-1 bg-white/80 border border-gray-200 rounded text-xs outline-none font-mono focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {docType === 'invoice' && (
              <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-4">
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Resumen de Pago</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-emerald-700">Abono</label>
                    <input 
                      type="number"
                      value={invoiceData.deposit || 0}
                      onChange={(e) => handleInputChange('deposit', e.target.value)}
                      className="w-32 px-2 py-1 bg-white border border-emerald-200 rounded text-xs outline-none font-mono text-right"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                    <span className="text-xs font-bold text-emerald-800">Saldo Pendiente</span>
                    <span className="text-sm font-black text-emerald-900">$ {Number(invoiceData.balance).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8">
              <button 
                onClick={saveInvoice}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {invoiceData.id ? 'Actualizar Documento' : 'Guardar en Historial'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className={cn(
        "flex-grow bg-[#e9ecef] overflow-y-auto p-4 sm:p-8 md:p-12 flex flex-col items-center relative",
        !showPreviewMobile ? "hidden lg:flex" : "flex"
      )}>
        <div className="sticky top-0 z-20 w-full flex justify-center mb-8 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-xl border border-white flex flex-wrap justify-center gap-2 sm:gap-3 pointer-events-auto">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Printer className="w-4 h-4" /> <span className="hidden xs:inline">Imprimir</span>
            </button>
            <button 
              onClick={saveInvoice}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden xs:inline">Guardar</span>
            </button>
            <button 
              onClick={exportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar PDF
            </button>
          </div>
        </div>

        {/* The Actual Template */}
        <div className="relative">
          <InvoiceTemplate 
            ref={templateRef}
            data={invoiceData} 
            logo={logo} 
            signature={signature}
            paperSize={paperSize} 
            preview={true}
            type={docType}
          />
        </div>
      </div>
    </div>
  );
}


