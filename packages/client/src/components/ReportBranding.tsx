import { formatCurrency } from '../lib/utils';
import { Product, Sale, Customer, Supplier, Expense, Employee } from '../types';
import fullLogo from '../../assets/SVG/fulllogo.svg';

export const generateBrandedReport = (
  reportMetadata: { label: string; description: string; id: string },
  data: any[],
  settings: Record<string, string>,
  dateRange: { start: string; end: string },
  context: {
    customers: Customer[];
    products: Product[];
    totalValue?: number;
    employees?: Employee[];
    suppliers?: Supplier[];
    cashierStats?: {
      totalOpening: number;
      totalExpected: number;
      totalActual: number;
      totalVariance: number;
    };
  }
) => {
  const companyName = settings.COMPANY_NAME || 'SYSTEM_REPORT_CONSOLE';
  const companyLocation = settings.LOCATION || 'NOT_CONFIGURED';
  const companyPhone = settings.SUPPORT_PHONE || 'NOT_CONFIGURED';
  const companyEmail = settings.CONTACT_EMAIL || 'NOT_CONFIGURED';
  const companySlogan = settings.COMPANY_SLOGAN || 'Industrial Hardware Solutions';
  const companyInitials = companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);

  const stampHtml = `
    <div style="position: fixed; top: 40px; right: 60px; width: 120px; height: 120px; border: 5px double #DC2626; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(-15deg); color: #DC2626; font-family: 'Arial', sans-serif; z-index: 100; pointer-events: none; opacity: 0.6;">
      <span style="font-size: 8pt; font-weight: bold; letter-spacing: 1px;">OFFICIAL_LOGS</span>
      <span style="font-size: 14pt; font-weight: 900; background: #DC2626; color: white; padding: 2px 6px; margin: 4px 0; border-radius: 2px;">VERIFIED</span>
      <span style="font-size: 8pt; font-weight: bold;">${companyInitials}</span>
    </div>
  `;

  let tableHeader = '';
  let tableRows = '';

  // Generate Table Content based on report type
  switch (reportMetadata.id) {
    case 'SALES_SUMMARY':
      tableHeader = `
        <tr>
          <th>TX_ID</th>
          <th>TIMESTAMP</th>
          <th>CASHIER / CUSTOMER</th>
          <th>PARTICULARS</th>
          <th>METHOD</th>
          <th style="text-align: right;">TOTAL</th>
        </tr>
      `;
      tableRows = data.map((sale: Sale) => {
        const customer = context.customers.find(c => c.id === sale.customerId);
        const cashier = sale.cashierName || sale.cashierId || 'SYSTEM';
        const items = sale.items?.map(i => `${i.productName || 'Item'} (x${i.quantity})`).join(', ') || 'No content';
        return `
          <tr>
            <td style="font-family: monospace;">#${sale.id.slice(-8).toUpperCase()}</td>
            <td>${new Date(sale.createdAt || sale.timestamp).toLocaleString()}</td>
            <td>
               <div style="font-weight: bold;">${cashier}</div>
               <div style="font-size: 8pt; color: #666;">CUST: ${customer?.name || 'Walk-in'}</div>
            </td>
            <td style="font-size: 9pt;">${items}</td>
            <td>${sale.paymentMethod.toUpperCase()}</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(sale.total)}</td>
          </tr>
        `;
      }).join('');
      break;

    case 'INVENTORY_STOCK':
      tableHeader = `
        <tr>
          <th>PRODUCT_IDENTITY</th>
          <th>SKU / CATEGORY</th>
          <th style="text-align: right;">UNIT_PRICE</th>
          <th style="text-align: right;">STOCK_LEVEL</th>
          <th style="text-align: right;">VALUATION</th>
        </tr>
      `;
      tableRows = data.map((p: Product) => `
        <tr>
          <td><b style="text-transform: uppercase;">${p.name}</b></td>
          <td>${p.category}</td>
          <td style="text-align: right;">${formatCurrency(p.price)}</td>
          <td style="text-align: right;">${p.stock} ${p.unit}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(p.price * p.stock)}</td>
        </tr>
      `).join('');
      break;

    case 'PRODUCT_PERFORMANCE':
      tableHeader = `
        <tr>
          <th>RANK</th>
          <th>PRODUCT_NAME</th>
          <th style="text-align: right;">QTY_SOLD</th>
          <th style="text-align: right;">TOTAL_REVENUE</th>
          <th style="text-align: right;">CONTRIBUTION</th>
        </tr>
      `;
      const maxRev = data[0]?.revenue || 1;
      tableRows = data.map((item, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td style="text-transform: uppercase; font-weight: bold;">${item.name}</td>
          <td style="text-align: right;">${item.qty} UNITS</td>
          <td style="text-align: right;">${formatCurrency(item.revenue)}</td>
          <td style="text-align: right;">${((item.revenue / (context.totalValue || 1)) * 100).toFixed(1)}%</td>
        </tr>
      `).join('');
      break;

    case 'CREDIT_SALES':
      tableHeader = `
        <tr>
          <th>CUSTOMER_ID</th>
          <th>NAME / CONTACT</th>
          <th style="text-align: right;">BAL_LIMIT</th>
          <th style="text-align: right;">OUTSTANDING</th>
          <th>RISK_STATUS</th>
        </tr>
      `;
      tableRows = data.map((c: Customer) => `
        <tr>
          <td style="font-family: monospace;">#${c.id.slice(-6).toUpperCase()}</td>
          <td>
            <div style="font-weight: bold;">${c.name}</div>
            <div style="font-size: 8pt; color: #666;">${c.phone}</div>
          </td>
          <td style="text-align: right;">${formatCurrency(c.creditLimit)}</td>
          <td style="text-align: right; font-weight: bold; color: ${c.balance > 0 ? '#DC2626' : '#000'}">${formatCurrency(c.balance)}</td>
          <td>${c.balance > (c.creditLimit * 0.8) ? 'HIGH_RISK' : 'SECURE'}</td>
        </tr>
      `).join('');
      break;

    case 'SUPPLIER_PAYABLES':
      tableHeader = `
        <tr>
          <th>SUPPLIER_ID</th>
          <th>NAME_&amp;_CONTACT</th>
          <th style="text-align: right;">OUTSTANDING_BALANCE</th>
          <th style="text-align: right;">TOTAL_TRANSACTIONS</th>
          <th>LAST_DELIVERY</th>
          <th>STATUS</th>
        </tr>
      `;
      tableRows = data.map((s: Supplier) => `
        <tr>
          <td style="font-family: monospace;">#${s.id?.slice(-6).toUpperCase() || 'N/A'}</td>
          <td>
            <div style="font-weight: bold; text-transform: uppercase;">${s.name}</div>
            <div style="font-size: 8pt; color: #666;">${s.phone || 'NO_PHONE'}</div>
          </td>
          <td style="text-align: right; font-weight: bold; color: ${(s.balance || 0) > 0 ? '#DC2626' : '#000'}">${formatCurrency(s.balance || 0)}</td>
          <td style="text-align: right;">${s.totalOrders ?? 0}</td>
          <td>${s.lastDelivery ? new Date(s.lastDelivery).toLocaleDateString() : 'NEVER'}</td>
          <td>${(s.balance || 0) > 0 ? 'PENDING_PAYMENT' : 'SETTLED'}</td>
        </tr>
      `).join('');
      break;

    case 'CASH_FLOW':
      tableHeader = `
        <tr>
          <th>DATE</th>
          <th style="text-align: right;">INFLOW_(SALES)</th>
          <th style="text-align: right;">OUTFLOW_(EXP+REF)</th>
          <th style="text-align: right;">NET_CASH</th>
          <th>STATUS</th>
        </tr>
      `;
      // data is an array of daily rows {date, inflow, outflow}
      tableRows = data.length > 0 ? data.map((row: any) => {
        const net = row.inflow - row.outflow;
        return `
        <tr>
          <td style="font-family: monospace;">${new Date(row.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td style="text-align: right; color: #16a34a; font-weight: bold;">${formatCurrency(row.inflow)}</td>
          <td style="text-align: right; color: #DC2626;">${formatCurrency(row.outflow)}</td>
          <td style="text-align: right; font-weight: bold; color: ${net >= 0 ? '#16a34a' : '#DC2626'};">${formatCurrency(net)}</td>
          <td><span style="font-size: 8pt; font-weight: bold; color: ${net >= 0 ? '#16a34a' : '#DC2626'};">${net >= 0 ? 'SURPLUS' : 'DEFICIT'}</span></td>
        </tr>
      `}).join('') : `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">NO_TRANSACTIONS_IN_SELECTED_PERIOD</td></tr>`;
      break;

    case 'AUDIT_TRAIL':
      tableHeader = `
        <tr>
          <th>TIMESTAMP</th>
          <th>OPERATOR</th>
          <th>ACTION</th>
          <th>TARGET</th>
          <th>CHANGES_LOGGED</th>
        </tr>
      `;
      // Assuming audit logs might be in data
      tableRows = data.length > 0 ? data.map(log => `
        <tr>
          <td style="font-family: monospace; font-size: 9pt;">${new Date(log.createdAt).toLocaleString()}</td>
          <td style="text-transform: uppercase; font-weight: bold;">${log.user?.username || log.userId || 'SYSTEM'}</td>
          <td><span style="font-size: 8pt; background: #eee; padding: 2px 4px; border: 1px solid #ddd;">${log.action}</span></td>
          <td style="font-size: 9pt; text-transform: uppercase;">${log.target}</td>
          <td style="font-size: 8pt; font-family: monospace;">
             ${log.oldValue ? `<span style="color: #666; text-decoration: line-through;">${log.oldValue}</span> &rarr; ` : ''}
             ${log.newValue || ''}
          </td>
        </tr>
      `).join('') : `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">NO_AUDIT_LOGS_FOUND_IN_SELECTED_PERIOD</td></tr>`;
      break;
    case 'LOW_STOCK':
      tableHeader = `
        <tr>
          <th>CRITICAL_ITEM</th>
          <th>CATEGORY</th>
          <th style="text-align: right;">CURRENT_STOCK</th>
          <th style="text-align: right;">MIN_REQD</th>
          <th style="text-align: right;">SUGGESTED_ORDER</th>
          <th style="text-align: right;">EST_REORDER_COST</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((p: Product) => {
        const suggestedOrder = (p.minStock * 2) - p.stock;
        const estCost = suggestedOrder * p.costPrice;
        return `
        <tr>
          <td><b style="text-transform: uppercase; color: #DC2626;">${p.name}</b></td>
          <td>${p.category || 'GENERAL'}</td>
          <td style="text-align: right; color: #DC2626; font-weight: bold;">${p.stock} ${p.unit}</td>
          <td style="text-align: right;">${p.minStock} ${p.unit}</td>
          <td style="text-align: right; font-weight: bold;">+${suggestedOrder}</td>
          <td style="text-align: right;">${formatCurrency(estCost)}</td>
        </tr>
      `}).join('') : `<tr><td colspan="6" style="text-align: center; padding: 40px; font-weight: bold; color: #16a34a;">ALL_STOCK_LEVELS_SATISFACTORY</td></tr>`;
      break;


    case 'DAILY_CASHIER':
      tableHeader = `
        <tr>
          <th>CASHIER_IDENTITY</th>
          <th>SHIFT_PERIOD</th>
          <th style="text-align: right;">OPENING_CASH</th>
          <th style="text-align: right;">EXPECTED_CASH</th>
          <th style="text-align: right;">ACTUAL_CASH</th>
          <th style="text-align: right;">CASH_VARIANCE</th>
          <th>STATUS</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((s: any) => {
        const cashierName = context.employees?.find((e: any) => e.id === s.cashierId)?.name || `CASHIER_${s.cashierId.slice(0, 4).toUpperCase()}`;
        const start = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const end = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'PRESENT';
        const v = s.variance || 0;
        return `
        <tr>
          <td><b style="text-transform: uppercase;">${cashierName}</b></td>
          <td style="font-size: 8.5pt;">${start} - ${end}</td>
          <td style="text-align: right;">${formatCurrency(s.openingCash)}</td>
          <td style="text-align: right; color: #3b82f6;">${formatCurrency(s.expectedCash)}</td>
          <td style="text-align: right; color: #16a34a;">${formatCurrency(s.actualCash || 0)}</td>
          <td style="text-align: right; font-weight: bold; color: ${v < 0 ? '#DC2626' : v > 0 ? '#16a34a' : '#666'};">
            ${formatCurrency(v)}
          </td>
          <td><span style="font-size: 8pt; font-weight: bold;">${s.status}</span></td>
        </tr>
      `}).join('') : `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">NO_SHIFT_RECORDS_FOR_THIS_PERIOD</td></tr>`;
      break;

    case 'PROFIT_MARGIN':
      tableHeader = `
        <tr>
          <th>PRODUCT_NAME</th>
          <th style="text-align: right;">UNITS</th>
          <th style="text-align: right;">REVENUE</th>
          <th style="text-align: right;">COST</th>
          <th style="text-align: right;">PROFIT</th>
          <th style="text-align: right;">MARGIN_%</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((p: any) => {
        const margin = (p.profit / (p.revenue || 1)) * 100;
        return `
        <tr>
          <td><b style="text-transform: uppercase;">${p.name}</b><br/><span style="font-size: 7.5pt; color: #666;">ID: ${p.id.slice(0, 8)}</span></td>
          <td style="text-align: right;">${p.qty.toLocaleString()}</td>
          <td style="text-align: right;">${formatCurrency(p.revenue)}</td>
          <td style="text-align: right; color: #666;">${formatCurrency(p.cost)}</td>
          <td style="text-align: right; font-weight: bold; color: #16a34a;">${formatCurrency(p.profit)}</td>
          <td style="text-align: right; font-weight: bold; color: ${margin >= 20 ? '#16a34a' : margin >= 10 ? '#ea580c' : '#dc2626'};">
            ${margin.toFixed(1)}%
          </td>
        </tr>
      `}).join('') : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">NO_PROFIT_DATA_FOR_THIS_PERIOD</td></tr>`;
      break;

    case 'RETURNS_REFUNDS':
      tableHeader = `
        <tr>
          <th>TIMESTAMP</th>
          <th>PRODUCT_IDENTITY</th>
          <th style="text-align: right;">QTY_RET</th>
          <th style="text-align: right;">REFUND_AMOUNT</th>
          <th>REASON</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((r: any) => {
        const product = context.products?.find(p => p.id === r.productId);
        const name = product ? product.name : 'UNKNOWN_ITEM';
        return `
        <tr>
          <td style="font-family: monospace;">${new Date(r.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
          <td><b style="text-transform: uppercase;">${name}</b><br><span style="font-size: 7.5pt; color: #666;">ID: ${r.productId.slice(0, 8)}</span></td>
          <td style="text-align: right; color: #DC2626; font-weight: bold;">${r.quantity}</td>
          <td style="text-align: right; color: #DC2626;">${formatCurrency(r.amount || 0)}</td>
          <td><span style="font-size: 8pt; font-family: monospace; text-transform: uppercase;">${r.reason || 'UNSPECIFIED'}</span></td>
        </tr>
      `}).join('') : `<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">NO_RETURNS_RECORDED_IN_PERIOD</td></tr>`;
      break;

    case 'PURCHASE_REPORT':
      tableHeader = `
        <tr>
          <th>TIMESTAMP</th>
          <th>PRODUCT_IDENTITY</th>
          <th>SUPPLIER_REF</th>
          <th style="text-align: right;">QTY_RECEIVED</th>
          <th style="text-align: right;">UNIT_COST</th>
          <th style="text-align: right;">TOTAL_VALUATION</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((txn: any) => {
        const product = context.products?.find((p: any) => p.id === txn.productId);
        const name = product ? product.name : 'UNKNOWN_ITEM';
        const isSupplierRef = txn.referenceId && txn.referenceId.length >= 8;

        let supplierText = '';
        if (isSupplierRef) {
          const supplier = context.suppliers?.find((s: Supplier) => s.id === txn.referenceId);
          supplierText = `<b style="color: #ea580c; text-transform: uppercase;">${supplier?.name || 'UNKNOWN_SUPPLIER'}</b><br><span style="font-size: 7.5pt; color: #666;">REF: ${txn.referenceId.slice(0, 8)}</span>`;
        } else {
          supplierText = `<span style="font-size: 8pt; color: #666;">${txn.referenceId || 'INTERNAL_ADJUSTMENT'}</span>`;
        }

        const cost = txn.unitCost || product?.costPrice || 0;
        const total = cost * txn.quantity;

        return `
        <tr>
          <td style="font-family: monospace;">${new Date(txn.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
          <td><b style="text-transform: uppercase;">${name}</b><br><span style="font-size: 7.5pt; color: #666;">ID: ${txn.productId.slice(0, 8)}</span></td>
          <td>${supplierText}</td>
          <td style="text-align: right; color: #0ea5e9; font-weight: bold;">+${txn.quantity}</td>
          <td style="text-align: right; color: #666;">${formatCurrency(cost)}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(total)}</td>
        </tr>
      `}).join('') : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">NO_PROCUREMENT_RECORDS_IN_PERIOD</td></tr>`;
      break;

    case 'SALES_BY_CATEGORY':
      tableHeader = `
        <tr>
          <th>DEPARTMENT_CATEGORY</th>
          <th style="text-align: right;">ITEMS_SOLD</th>
          <th style="text-align: right;">TOTAL_REVENUE</th>
          <th style="text-align: right;">TOTAL_COST</th>
          <th style="text-align: right;">NET_PROFIT</th>
          <th style="text-align: right;">MARGIN_%</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((stat: any) => {
        const margin = stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0;
        return `
          <tr>
            <td><b style="text-transform: uppercase;">${stat.category}</b></td>
            <td style="text-align: right;">${stat.qty.toLocaleString()} UNIT(S)</td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(stat.revenue)}</td>
            <td style="text-align: right; color: #666;">${formatCurrency(stat.cost)}</td>
            <td style="text-align: right; font-weight: bold; color: #16a34a;">${formatCurrency(stat.profit)}</td>
            <td style="text-align: right; font-weight: bold; color: ${margin >= 20 ? '#16a34a' : margin >= 10 ? '#ea580c' : '#dc2626'}; text-decoration: underline; text-underline-offset: 3px;">
               ${margin.toFixed(1)}%
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">NO_DEPARTMENTAL_DATA_FOR_PERIOD</td></tr>`;
      break;

      break;

    case 'DISCOUNT_REPORT':
      tableHeader = `
        <tr>
          <th>TIMESTAMP</th>
          <th>SALE_ID</th>
          <th>CASHIER</th>
          <th style="text-align: right;">SUBTOTAL</th>
          <th>TYPE_OR_PROMOTION</th>
          <th style="text-align: right;">DISCOUNT_VALUE</th>
          <th style="text-align: right;">SAVINGS_%</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((sale: any) => {
        const discountPercent = (sale.discount / (sale.subtotal || 1)) * 100;
        const cashier = context.employees?.find((e: any) => e.id === sale.cashierId)?.name || sale.cashierName || 'SYSTEM';
        return `
          <tr>
            <td style="font-family: monospace; font-size: 8pt;">${new Date(sale.createdAt || sale.timestamp).toLocaleString()}</td>
            <td><b style="color: #0ea5e9;">#${sale.id.slice(0, 8)}</b></td>
            <td>${cashier}</td>
            <td style="text-align: right;">${formatCurrency(sale.subtotal)}</td>
            <td>
              ${sale.promoName ?
            `<span style="background: rgba(14, 165, 233, 0.1); color: #0ea5e9; padding: 2px 8px; border-radius: 10px; font-size: 8pt; border: 1px solid rgba(14, 165, 233, 0.2);">${sale.promoName}</span>` :
            `<span style="color: #666; font-style: italic;">MANUAL_OVERRIDE</span>`
          }
            </td>
            <td style="text-align: right; color: ${discountPercent > 15 ? '#dc2626' : '#000'}; font-weight: bold;">
              -${formatCurrency(sale.discount)}
            </td>
            <td style="text-align: right; font-weight: bold; color: ${discountPercent > 15 ? '#dc2626' : '#666'};">
              ${discountPercent.toFixed(1)}%
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">NO_DISCOUNT_ACTIVITY_LOGGED_FOR_PERIOD</td></tr>`;
      break;

    case 'PROMOTION_MANAGER':
      tableHeader = `
        <tr>
          <th>PROMOTION_NAME</th>
          <th>DISCOUNT_TYPE</th>
          <th>APPLICABLE_SCOPE</th>
          <th>START_DATETIME</th>
          <th>END_DATETIME</th>
          <th>CURRENT_STATUS</th>
        </tr>
      `;
      tableRows = data.length > 0 ? data.map((p: any) => `
        <tr>
          <td><b style="text-transform: uppercase;">${p.name}</b></td>
          <td>${p.type}</td>
          <td>${p.scope}</td>
          <td style="font-size: 8.5pt;">${p.startDate}</td>
          <td style="font-size: 8.5pt;">${p.endDate}</td>
          <td>
            <b style="color: ${p.status === 'LIVE' ? '#16a34a' : p.status === 'EXPIRED' ? '#dc2626' : '#666'};">
              ${p.status}
            </b>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: #999;">NO_PROMOTIONS_FOUND_IN_SYSTEM</td></tr>`;
      break;

    default:
      tableHeader = `<tr><th>DATA_KEY</th><th>VALUES_CAPTURED</th></tr>`;
      tableRows = `<tr><td colspan="2" style="text-align: center; padding: 40px;">Detailed printing for <b>${reportMetadata.label}</b> is being finalized for the production release.</td></tr>`;
  }

  const isMonetary = !['AUDIT_TRAIL', 'PROMOTION_MANAGER'].includes(reportMetadata.id);
  const totalCount = data.length;

  const totalsLabel = reportMetadata.id === 'AUDIT_TRAIL' ? 'TOTAL_ENTRIES_LOGGED' :
    reportMetadata.id === 'PROMOTION_MANAGER' ? 'ACTIVE_PROMOTION_COUNT' :
      'REPORT_CUMULATIVE_VALUE';

  const grandTotalValue = isMonetary
    ? (typeof context.totalValue === 'number' ? formatCurrency(context.totalValue) : 'N/A')
    : `${totalCount} RECORDS`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportMetadata.label} - ${companyName}</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            margin: 0; padding: 0; background: white; color: black; line-height: 1.4;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
          .brand { display: flex; flex-direction: column; gap: 4px; }
          .brand-top { display: flex; align-items: center; gap: 15px; margin-bottom: 8px; }
          .brand h1 { font-size: 22pt; margin: 0; color: #000; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
          .brand .slogan { font-size: 9pt; color: #666; font-weight: 600; text-transform: uppercase; border-left: 3px solid #DC2626; padding-left: 10px; margin-top: 4px; }
          .brand .contact { font-size: 9pt; color: #333; margin-top: 8px; font-family: monospace; }
          .report-meta { text-align: right; }
          .report-meta h2 { font-size: 14pt; margin: 0; text-transform: uppercase; color: #DC2626; letter-spacing: 1px; }
          .meta-grid { font-size: 8.5pt; margin-top: 10px; display: grid; grid-template-columns: auto auto; gap: 4px 15px; text-align: left; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
          th { background: #f8fafc; border: 1.5px solid #000; padding: 10px 8px; text-align: left; font-size: 9pt; text-transform: uppercase; font-weight: 800; color: #1e293b; }
          td { border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; word-wrap: break-word; }
          tr:nth-child(even) { background: #fdfdfd; }
          
          .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature-box { width: 240px; }
          .sig-line { border-top: 1.5px solid #000; margin-top: 45px; }
          .sig-label { font-size: 8.5pt; font-weight: 800; text-align: center; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
          
          .totals-box { text-align: right; background: #000; color: white; padding: 15px 25px; min-width: 200px; }
          .totals-label { font-size: 8.5pt; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; opacity: 0.8; }
          .totals-value { font-size: 18pt; font-weight: 800; font-family: monospace; }
        </style>
      </head>
      <body>
        ${stampHtml}
        <div class="header">
          <div class="brand">
            <div class="brand-top">
              <img src="${fullLogo}" alt="${companyName}" style="height: 50px; object-fit: contain;" />
              <h1>${companyName}</h1>
            </div>
            ${companySlogan ? `<div class="slogan">${companySlogan}</div>` : ''}
            <div class="contact">
              ${companyLocation}<br/>
              ${companyPhone} | ${companyEmail}
            </div>
          </div>
          <div class="report-meta">
            <h2>${reportMetadata.label}</h2>
            <div class="meta-grid">
              <span><b>REPORT_ID:</b></span> <span>#${new Date().getTime().toString(16).toUpperCase()}</span>
              <span><b>GENERATED_ON:</b></span> <span>${new Date().toLocaleString()}</span>
              <span><b>REPORTING_PERIOD:</b></span> <span style="font-weight: 900; color: #000; font-size: 10pt;">AS OF: ${new Date(dateRange.start).toLocaleDateString()} TO ${new Date(dateRange.end).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            ${tableHeader}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">
            <div class="sig-line"></div>
            <div class="sig-label">AUTHORIZED_ADMIN_SIGNATURE</div>
          </div>
          <div class="totals-box">
            <div class="totals-label">${totalsLabel}</div>
            <div class="totals-value">${grandTotalValue}</div>
          </div>
        </div>

        <div style="position: fixed; bottom: 20px; right: 20px; font-size: 7.5pt; color: #999; font-family: monospace;">
          SYSTEM_HASH: ${Math.random().toString(36).substring(2, 10).toUpperCase()} // PAGE_1_OF_1
        </div>
      </body>
    </html>
  `;

  return html;
};
