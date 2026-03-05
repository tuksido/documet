# Generador de Facturas y Cuentas de Cobro

Aplicación profesional para crear y gestionar facturas y cuentas de cobro con plantillas personalizables, gestión de clientes e historial de documentos.

## Características

- **Generación de Documentos**: Crea facturas y cuentas de cobro en segundos.
- **Plantillas Profesionales**: Diseño optimizado para impresión en tamaño carta (Letter).
- **Gestión de Clientes**: Directorio de clientes con estadísticas de facturación y saldos pendientes.
- **Historial**: Acceso rápido a todos tus documentos guardados.
- **Exportación**: Descarga tus documentos en PDF o exporta listados a Excel.
- **Perfiles Múltiples**: Configura diferentes perfiles de empresa con logos y firmas digitales.
- **Dashboard**: Visualización de métricas clave y facturación mensual.

## Tecnologías Utilizadas

- **Frontend**: React 19, Tailwind CSS 4, Lucide React, Recharts.
- **Backend**: Node.js, Express.
- **Base de Datos**: SQLite (Better-SQLite3).
- **Autenticación**: JWT con cookies seguras.
- **Herramientas**: Vite, TypeScript, html2canvas, jsPDF, XLSX.

## Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-del-directorio>
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` basado en `.env.example`:
   ```env
   JWT_SECRET="tu_secreto_super_seguro"
   ```

4. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```

5. **Construir para producción**:
   ```bash
   npm run build
   npm start
   ```

## Estructura del Proyecto

- `/src`: Código fuente del frontend (React).
- `/server.ts`: Servidor Express y API.
- `/invoices.db`: Base de Datos SQLite (generada automáticamente).

## Licencia

Este proyecto está bajo la Licencia Apache 2.0.
