import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, Download, ArrowRight, User, CreditCard, Printer, RotateCcw, X, ShieldAlert, CheckCircle2, Package, Minus, Plus, Loader2 } from 'lucide-react';
import { useHardware } from '../HardwareContext';
import { formatCurrency, cn, getLocalDateString } from '../lib/utils';
import DatePicker from './DatePicker';
import ReturnsProcessingModal from './ReturnsProcessingModal';
import { toast } from 'sonner';

export default function SalesLogs() {
  const { sales, customers, refreshSales, settings, recordReturn } = useHardware();
  const [searchQuery, setSearchQuery] = useState('');

  const today = getLocalDateString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [selectedSaleForReturn, setSelectedSaleForReturn] = useState<any | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search input to prevent API spam
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize with server when date boundaries or search query shifts
  useEffect(() => {
    refreshSales(startDate, endDate, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, debouncedSearch]);

  const filteredSales = sales; // Filtering now happens server-side

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Cashier', 'Customer', 'Items', 'Payment Method', 'Total'];
    const rows = filteredSales.map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      let cashierName = sale.cashierName || sale.cashierId;
      if (!cashierName || cashierName === 'unknown') cashierName = 'SYSTEM_AUTO';
      const stamp = new Date(sale.createdAt || sale.timestamp || new Date());
      const itemsString = sale.items?.map(i => {
        const net = (i.quantity || 0) - (i.returnedQuantity || 0);
        return `${i.productName || i.name} (x${net}${i.returnedQuantity > 0 ? ` [-${i.returnedQuantity}_RET]` : ''})`;
      }).join('; ') || '';

      return [
        sale.id,
        stamp.toLocaleString().replace(/,/g, ''),
        cashierName,
        customer?.name || 'Walk-in Customer',
        `"${itemsString}"`,
        sale.paymentMethod,
        sale.total
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Verified_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalValue = filteredSales.reduce((acc, s) => acc + s.total, 0);

  const handlePrintPDF = () => {
    // 1. Create a hidden iframe for clean printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '100%';
    iframe.style.bottom = '100%';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const companyName = settings.COMPANY_NAME || settings.company_name || settings.companyName || 'SYSTEM_OPERATOR';
    const companyLocation = settings.LOCATION || settings.companyAddress || 'Main Branch';
    const companyPhone = settings.SUPPORT_PHONE || '';
    const companyEmail = settings.CONTACT_EMAIL || '';
    const companySlogan = settings.COMPANY_SLOGAN || 'Industrial Logistics & General Hardware';
    const companyInitials = companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);

    const stampHtml = `
      <div style="position: fixed; top: 20px; right: 100px; width: 130px; height: 130px; border: 5px double #DC2626; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-12deg); color: #DC2626; font-family: sans-serif; z-index: 100; pointer-events: none; opacity: 0.8;">
        <span style="font-size: 9pt; font-weight: bold;">OFFICIAL_LOGS</span>
        <span style="font-size: 15pt; font-weight: 900; background: #DC2626; color: white; padding: 2px 6px; margin: 4px 0; border-radius: 2px;">VERIFIED</span>
        <span style="font-size: 8pt; font-weight: bold;">${companyInitials}</span>
      </div>
    `;

    const tableRows = filteredSales.map(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      const cashierName = sale.cashierName || sale.cashierId || 'SYSTEM_AUTO';
      const stamp = new Date(sale.createdAt || sale.timestamp || new Date());
      const items = sale.items?.map(i => {
        const net = (i.quantity || 0) - (i.returnedQuantity || 0);
        const name = i.productName || i.name || 'Item';
        return `${name} (x${net}${i.returnedQuantity > 0 ? ` [-${i.returnedQuantity}_RET]` : ''})`;
      }).join(', ') || 'No items';

      return `
        <tr>
          <td style="font-family: monospace; font-size: 9pt;">${sale.id.slice(0, 13)}...</td>
          <td>
            <div>${stamp.toLocaleDateString()}</div>
            <div style="font-size: 8pt; color: #666;">${stamp.toLocaleTimeString()}</div>
          </td>
          <td>
            <div>CASHIER: ${cashierName}</div>
            <div style="font-size: 8pt; color: #666;">CUST: ${customer?.name || 'Walk-in'}</div>
          </td>
          <td>${items}</td>
          <td>${sale.paymentMethod.toUpperCase()}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(sale.total)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verified Audit Trail - ${companyName}</title>
          <style>
            @page { size: landscape; margin: 15mm; }
            body { font-family: sans-serif; margin: 0; padding: 0; background: white; color: black; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 25px; position: relative; }
            .brand h1 { font-size: 26pt; margin: 0; color: #000; letter-spacing: 2px; text-transform: uppercase; }
            .brand p { font-size: 10pt; color: #333; margin: 2px 0; }
            .meta { text-align: right; font-size: 9pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
            th { background: #f0f0f0; border: 1px solid #000; padding: 10px 8px; text-align: left; text-transform: uppercase; }
            td { border: 1px solid #ccc; padding: 8px; vertical-align: top; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 20px; }
            .signature { width: 220px; border-top: 1px solid #000; margin-top: 50px; text-align: center; padding-top: 5px; font-size: 8pt; font-family: monospace; }
            .totals { text-align: right; font-weight: bold; font-size: 14pt; }
            .totals p { margin: 0; font-size: 9pt; color: #666; font-weight: normal; text-decoration: underline; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          ${stampHtml}
          <div class="header">
            <div class="brand">
              <h1>${companyName}</h1>
              <p>${companyLocation}</p>
              <p>${companyPhone} | ${companyEmail}</p>
              <p style="margin-top: 10px; font-weight: bold;">Verified Audit Trail Report</p>
            </div>
            <div class="meta">
              <p><b>REPORT_ID:</b> ${new Date().getTime().toString(16).toUpperCase()}</p>
              <p><b>GENERATED:</b> ${new Date().toLocaleString()}</p>
              <p><b>RANGE:</b> ${startDate || 'ALL_TIME'} -- ${endDate || 'PRESENT'}</p>
              <p><b>RECORDS:</b> ${filteredSales.length}</p>
              ${settings.TIN ? `<p><b>TIN:</b> ${settings.TIN}</p>` : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>TIMESTAMP</th>
                <th>CASHIER / CUSTOMER</th>
                <th>PARTICULARS</th>
                <th>METHOD</th>
                <th style="text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="footer">
            <div class="signature">AUTHORIZED_ADMIN_SIGNATURE</div>
            <div class="totals">
              <p>CUMULATIVE_TOTAL</p>
              ${formatCurrency(totalValue)}
            </div>
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-display text-[var(--text-main)] truncate">Audit Trail</h2>
          <p className="text-[9px] md:text-[10px] text-slate-900 dark:text-slate-500 font-mono mt-1 whitespace-nowrap overflow-hidden text-ellipsis">VERIFIED_TRANSACTION_LOGS // {sales.length}_RECORDS</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              label="FROM"
            />
            <ArrowRight size={10} className="text-slate-900 dark:text-slate-500 shrink-0" />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              label="TO"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleExportCSV} className="btn-industrial btn-outline flex items-center gap-2 py-1.5 px-3 text-[9px] h-9">
              <Download size={12} />
              CSV
            </button>
            <button onClick={handlePrintPDF} className="btn-industrial btn-outline flex items-center gap-2 py-1.5 px-3 text-[9px] h-9">
              <Printer size={12} />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 industrial-panel flex flex-col overflow-hidden no-print">
        <div className="industrial-panel-header flex-col sm:flex-row gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="SEARCH_BY_TRANSACTION_ID_OR_METHOD..."
              className="terminal-input w-full pl-10 py-1.5 text-[10px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-[9px] font-display text-slate-900 dark:text-slate-500 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <div className="status-indicator bg-success" />
              <span>CASH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="status-indicator bg-brand-accent" />
              <span>MOBILE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="status-indicator bg-danger" />
              <span>CREDIT</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Desktop Table - Hidden on Mobile */}
          <table className="data-table hidden md:table">
            <thead>
              <tr>
                <th>TRANSACTION_ID</th>
                <th>TIMESTAMP</th>
                <th>CUSTOMER_/_CASHIER</th>
                <th>ITEMS</th>
                <th>PAYMENT</th>
                <th className="text-right">TOTAL</th>
                <th className="text-right px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => {
                const customer = customers.find(c => c.id === sale.customerId);
                let cashierName = sale.cashierName || sale.cashierId;
                if (!cashierName || cashierName === 'unknown') cashierName = 'SYSTEM_AUTO';
                const stamp = new Date(sale.createdAt || sale.timestamp || new Date());

                return (
                  <tr key={sale.id} className="group">
                    <td>
                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-400 group-hover:text-brand-accent transition-colors">{sale.id}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--text-main)] opacity-80">{stamp.toLocaleDateString()}</span>
                        <span className="text-[9px] text-slate-900 dark:text-slate-500 font-mono">{stamp.toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-main)] opacity-80">
                          <User size={10} className="text-slate-900 dark:text-slate-500" />
                          <span className="font-display text-[9px] truncate max-w-[120px]">{customer?.name || 'WALK_IN_CUSTOMER'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-900 dark:text-slate-500 font-mono">
                          <CreditCard size={10} />
                          <span className="truncate max-w-[120px]">CASHIER: {cashierName}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--text-main)] font-bold opacity-90 transition-opacity group-hover:opacity-100">
                            {sale.items?.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) || 0} UNITS
                          </span>
                          {sale.items?.some((i: any) => (i.returnedQuantity || 0) > 0) && (
                            <span className="text-[10px] font-mono font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 animate-pulse">
                              -{sale.items?.reduce((acc: number, item: any) => acc + (item.returnedQuantity || 0), 0) || 0}_RET
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1.5">
                          {sale.items?.map((i: any) => {
                            const original = (i.quantity || 0);
                            const returned = (i.returnedQuantity || 0);
                            const net = original - returned;
                            if (net <= 0 && returned === 0) return null;
                            return (
                              <div key={i.id} className="flex items-center gap-2 group/item text-[9px] font-mono">
                                <span className="text-slate-900 dark:text-slate-500 truncate max-w-[150px]">
                                  {i.productName || i.name || 'Unknown Item'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-800 dark:text-slate-400 font-bold">x{original}</span>
                                  {returned > 0 && (
                                    <span className="text-orange-500 bg-orange-500/5 px-1 rounded border border-orange-500/10">
                                      -{returned}_RET
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "text-[9px] font-display px-2 py-0.5 border",
                        sale.paymentMethod === 'cash' ? "bg-success/10 border-success/30 text-success" :
                          sale.paymentMethod === 'credit' ? "bg-danger/10 border-danger/30 text-danger" :
                            "bg-brand-accent/10 border-brand-accent/30 text-brand-accent"
                      )}>
                        {sale.paymentMethod.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-xs font-mono font-bold text-[var(--text-main)]">{formatCurrency(sale.total)}</span>
                    </td>
                    <td className="text-right px-4">
                      {(() => {
                        const allReturned = sale.items?.every((i: any) => (i.returnedQuantity || 0) >= i.quantity);
                        return (
                          <button
                            disabled={allReturned}
                            onClick={() => {
                              setSelectedSaleForReturn(sale);
                              setIsReturnModalOpen(true);
                            }}
                            className={cn(
                              "p-1.5 rounded transition-colors group/btn",
                              allReturned
                                ? "text-slate-700 cursor-not-allowed opacity-30"
                                : "hover:bg-orange-500/10 text-slate-900 dark:text-slate-500 hover:text-orange-500"
                            )}
                            title={allReturned ? "FULLY_REFUNDED" : "PROCESS_RETURN"}
                          >
                            <RotateCcw size={14} className={cn(!allReturned && "group-hover/btn:rotate-[-45deg] transition-transform")} />
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card Stack - Hidden on Desktop */}
          <div className="md:hidden p-3 space-y-3 pb-20">
            {filteredSales.map(sale => {
              const customer = customers.find(c => c.id === sale.customerId);
              const cashierName = sale.cashierName || sale.cashierId || 'SYSTEM_AUTO';
              const stamp = new Date(sale.createdAt || sale.timestamp || new Date());
              const allReturned = sale.items?.every((i: any) => (i.returnedQuantity || 0) >= i.quantity);

              return (
                <div key={sale.id} className="industrial-panel p-4 flex flex-col gap-4 bg-brand-dark/20 border-brand-steel/20">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[8px] font-display px-1.5 py-0.5 border uppercase",
                          sale.paymentMethod === 'cash' ? "bg-success/10 border-success/30 text-success" :
                            sale.paymentMethod === 'credit' ? "bg-danger/10 border-danger/30 text-danger" :
                              "bg-brand-accent/10 border-brand-accent/30 text-brand-accent"
                        )}>
                          {sale.paymentMethod.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-400 truncate">
                          ID: {sale.id.slice(0, 8)}...{sale.id.slice(-4)}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[var(--text-main)]">
                        {formatCurrency(sale.total)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-800 dark:text-slate-400 font-mono italic">
                        {stamp.toLocaleDateString()}
                      </div>
                      <div className="text-[9px] text-slate-900 dark:text-slate-500 font-mono">
                        {stamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-brand-steel/10" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Customer</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-400 truncate uppercase">{customer?.name || 'WALK_IN_CUSTOMER'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-display text-slate-900 dark:text-slate-500 uppercase tracking-widest">Cashier</span>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-400 truncate uppercase">{cashierName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sale.items?.slice(0, 3).map((item: any) => (
                      <span key={item.id} className="text-[9px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/5 px-2 py-1 border border-brand-steel/10 flex items-center gap-1">
                        {item.productName || item.name} <span className="text-brand-accent opacity-70">x{item.quantity}</span>
                      </span>
                    ))}
                    {sale.items?.length > 3 && (
                      <span className="text-[9px] font-mono text-slate-900 dark:text-slate-500 bg-brand-steel/5 px-2 py-1 border border-dashed border-brand-steel/10">
                        +{sale.items.length - 3} OTHER
                      </span>
                    )}
                  </div>

                  {!allReturned && (
                    <button
                      onClick={() => {
                        setSelectedSaleForReturn(sale);
                        setIsReturnModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 border border-orange-600/20 text-[10px] font-display uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-sm"
                    >
                      <RotateCcw size={12} />
                      Process_Security_Return
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {filteredSales.length === 0 && (
            <div className="p-10 sm:p-20 text-center text-slate-900 dark:text-slate-500">
              <Receipt size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-display uppercase tracking-[0.1em] sm:tracking-widest max-w-[180px] mx-auto leading-relaxed">
                NO_TRANSACTION_HISTORY_FOUND
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Return Processing Modal */}
      {isReturnModalOpen && selectedSaleForReturn && (
        <ReturnsProcessingModal
          initialSale={selectedSaleForReturn}
          onClose={() => {
            setIsReturnModalOpen(false);
            setSelectedSaleForReturn(null);
          }}
          onSuccess={() => {
            refreshSales(startDate, endDate, debouncedSearch);
          }}
        />
      )}
    </div>
  );
}
