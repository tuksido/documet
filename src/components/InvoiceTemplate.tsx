import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InvoiceTemplateProps {
  data: any;
  logo?: string;
  signature?: string;
  paperSize: 'letter' | 'a4' | 'legal';
  preview?: boolean;
  type?: 'payment_account' | 'invoice';
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data, logo, signature, paperSize, preview = true, type = 'payment_account' }, ref) => {
    const isInvoice = type === 'invoice';
    const title = isInvoice ? 'Factura de Venta' : 'Cuenta de Cobro';
    
    // Labels based on document type
    const detailLabel = 'Paciente';
    const procedureLabel = 'Descripción';

    const getPaperSizeStyle = () => {
      switch (paperSize) {
        case 'letter':
          return { width: '8.5in', height: '11in' };
        case 'a4':
          return { width: '210mm', height: '297mm' };
        case 'legal':
          return { width: '8.5in', height: '14in' };
        default:
          return { width: '8.5in', height: '11in' };
      }
    };

    const items = data.items || [];
    const itemsPerPageFirst = data.showConcept !== false ? 8 : 12;
    const itemsPerPageOthers = 20;

    const pages: any[][] = [];
    if (items.length === 0) {
      pages.push([]);
    } else {
      let currentItemIndex = 0;
      // First page
      const firstPageItems = items.slice(0, itemsPerPageFirst);
      pages.push(firstPageItems);
      currentItemIndex = itemsPerPageFirst;

      // Subsequent pages
      while (currentItemIndex < items.length) {
        const nextPageItems = items.slice(currentItemIndex, currentItemIndex + itemsPerPageOthers);
        pages.push(nextPageItems);
        currentItemIndex += itemsPerPageOthers;
      }
    }

    const renderPage = (pageItems: any[], pageIndex: number, totalPages: number) => {
      const isFirstPage = pageIndex === 0;
      const isLastPage = pageIndex === totalPages - 1;

      return (
        <div
          key={pageIndex}
          className={cn(
            "bg-white text-[#1a1a1a] font-sans flex flex-col overflow-hidden invoice-page",
            preview ? "shadow-2xl origin-top mb-8" : "shadow-none"
          )}
          style={{
            ...getPaperSizeStyle(),
            padding: '0.6in 0.8in',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff',
            transform: preview ? undefined : 'none',
            // In preview mode, we apply scaling in the parent or here
          }}
        >
          {/* Header Section - Always show basic header */}
          <div className="flex justify-between items-center mb-6 w-full">
            <div className="w-1/2">
              {logo ? (
                <img src={logo} alt="Logo" className="max-h-20 max-w-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-16 w-32 bg-[#f9fafb] border border-dashed border-[#d1d5db] flex items-center justify-center text-[#9ca3af] text-[10px] italic">
                  Logo de Empresa
                </div>
              )}
            </div>
            <div className="w-1/2 text-right">
              <h1 className="text-xl font-light tracking-[0.15em] uppercase text-[#9ca3af] mb-0 whitespace-nowrap">{title}</h1>
              <div className="text-xl font-bold text-[#2563eb]">No. {data.invoiceNumber || '0000'}</div>
              <div className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Página {pageIndex + 1} de {totalPages}</div>
            </div>
          </div>

          {isFirstPage && (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-10 text-[11px] mb-4 w-full">
                <div className="space-y-3">
                  <div>
                    <div className="uppercase tracking-wider text-[#9ca3af] font-bold mb-0.5 border-b border-[#f3f4f6] pb-0.5">Ciudad y Fecha</div>
                    <div className="font-medium">{data.city || 'BOGOTÁ'}, {data.date || 'DD/MM/AAAA'}</div>
                  </div>
                  
                  <div>
                    <div className="uppercase tracking-wider text-[#9ca3af] font-bold mb-0.5 border-b border-[#f3f4f6] pb-0.5">Empresa Adquirente</div>
                    <div className="font-bold text-sm text-[#111827]">{data.acquiringCompany || 'Nombre de la Empresa'}</div>
                    <div className="text-[#4b5563]">NIT: {data.acquiringCompanyNit || '---'}</div>
                    <div className="text-[#4b5563]">{data.acquiringCompanyAddress || 'Dirección'}</div>
                    <div className="text-[#4b5563]">Tel: {data.acquiringCompanyPhone || '---'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="h-6"></div>
                   <div>
                    <div className="uppercase tracking-wider text-[#9ca3af] font-bold mb-0.5 border-b border-[#f3f4f6] pb-0.5">Prestador de Servicio</div>
                    <div className="font-bold text-sm text-[#111827]">{data.serviceProvider || 'Tu Nombre'}</div>
                    <div className="text-[#4b5563]">NIT/CC: {data.serviceProviderNit || '---'}</div>
                    <div className="text-[#4b5563]">{data.serviceProviderAddress || 'Dirección'}</div>
                    <div className="text-[#4b5563]">Tel: {data.serviceProviderPhone || '---'}</div>
                  </div>
                </div>
              </div>

              {/* Concept Section */}
              {data.showConcept !== false && (
                <div className="mb-4 w-full">
                  <div className="uppercase tracking-wider text-[#9ca3af] font-bold text-[10px] mb-2">Concepto</div>
                  <div className="bg-[#f9fafb] p-4 rounded-sm border-l-4 border-[#2563eb] text-xs italic text-[#374151] leading-relaxed">
                    {data.concept || 'Descripción detallada de los servicios prestados...'}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Items Table */}
          <div className="w-full mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#2563eb] text-white text-[10px] uppercase tracking-widest">
                  <th className="py-3 px-4 text-left font-bold border-none">{detailLabel}</th>
                  <th className="py-3 px-4 text-left font-bold border-none">{procedureLabel}</th>
                  <th className="py-3 px-4 text-right font-bold border-none">Valor Total</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {pageItems.length > 0 ? (
                  pageItems.map((item: any, index: number) => {
                    const colors = [
                      'bg-white',
                      'bg-blue-50/30',
                      'bg-emerald-50/30',
                      'bg-violet-50/30',
                      'bg-amber-50/30',
                      'bg-rose-50/30'
                    ];
                    // Global index for color consistency
                    const globalIndex = isFirstPage ? index : itemsPerPageFirst + (pageIndex - 1) * itemsPerPageOthers + index;
                    const rowColor = colors[globalIndex % colors.length];
                    
                    return (
                      <tr key={index} className={cn("border-b border-[#f3f4f6]", rowColor)}>
                        <td className="py-3 px-4 text-[#1f2937] font-medium">{item.patient}</td>
                        <td className="py-3 px-4 text-[#4b5563] italic">{item.procedure}</td>
                        <td className="py-3 px-4 text-right font-bold">$ {Number(item.total).toLocaleString('es-CO')}</td>
                      </tr>
                    );
                  })
                ) : isFirstPage && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#d1d5db] italic">No se han agregado ítems</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isLastPage && (
            <>
              {/* Summary */}
              <div className="flex justify-end mt-2 w-full">
                <div className="w-1/2 space-y-2">
                  {isInvoice && (
                    <>
                      <div className="flex justify-between items-center py-2 px-6 border-b border-[#f3f4f6]">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#6b7280]">Abono</span>
                        <span className="text-sm font-bold text-[#111827]">$ {Number(data.deposit || 0).toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-6 border-b border-[#f3f4f6]">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#6b7280]">Saldo</span>
                        <span className="text-sm font-bold text-[#ef4444]">$ {Number(data.balance || 0).toLocaleString('es-CO')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center py-4 px-6 bg-[#eff6ff] rounded-sm border border-[#dbeafe]">
                    <span className="text-[10px] uppercase tracking-widest font-black text-[#1e3a8a]">Total a Pagar</span>
                    <span className="text-xl font-black text-[#2563eb]">$ {Number(data.grandTotal || 0).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="mt-8 pt-6 border-t border-[#f3f4f6] flex justify-between items-end w-full">
                <div className="w-1/2">
                  {isInvoice ? (
                    <div className="flex flex-col">
                      <p className="text-[11px] text-[#9ca3af] font-bold mb-8 uppercase tracking-widest">RECIBO</p>
                      <div className="h-[1px] w-64 bg-[#d1d5db] mb-2"></div>
                      <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">Firma del Cliente</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-[#9ca3af] italic mb-4">Atentamente,</p>
                      <div className="flex flex-col">
                        {signature ? (
                          <img src={signature} alt="Firma" className="max-h-24 w-auto object-contain mb-2 self-start" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="h-16 w-48 border-b border-[#d1d5db] mb-2"></div>
                        )}
                        <p className="text-sm font-bold text-[#111827]">{data.serviceProvider || 'Nombre del Prestador'}</p>
                        <p className="text-[10px] text-[#6b7280] uppercase tracking-widest">C.C. / NIT: {data.serviceProviderNit || '---'}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="w-1/2 text-right">
                  <div className="text-[9px] text-[#d1d5db] uppercase tracking-[0.3em] font-medium">
                    {isInvoice ? 'Factura Generada Digitalmente' : 'Documento Oficial de Cobro'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      );
    };

    return (
      <div 
        ref={ref} 
        className={cn(
          "flex flex-col items-center",
          preview ? "scale-[0.5] xs:scale-[0.6] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top" : ""
        )}
      >
        {pages.map((pageItems, index) => renderPage(pageItems, index, pages.length))}
      </div>
    );
  }
);




InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;

