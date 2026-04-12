import { enqueueMail } from './mailQueue.js';
import { generateReceiptPDF } from './pdfReceipt.js';
import path from 'path';
import sharp from 'sharp';

/**
 * HSM v2.4 Context-Aware Notification Gateway
 * @param {import('mysql2/promise').Pool} db - Institutional database pool
 * @param {Object} sale - Sale record
 */
export const notifySaleToAdmin = async (db, sale) => {
  try {
    // 1. Fetch Admin Emails and Business Settings from the private terminal cluster
    const [adminRows] = await db.query("SELECT username FROM users WHERE role IN ('admin', 'manager') AND is_active = 1");
    let adminEmails = adminRows.map(r => r.username).filter(Boolean);

    const [settingRows] = await db.query(
      "SELECT setting_key as `key`, setting_value as `value` FROM system_settings WHERE setting_key IN ('COMPANY_NAME', 'LOCATION', 'SUPPORT_PHONE', 'CONTACT_EMAIL')"
    );
    const settings = settingRows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    // Ensure the onboarding email is included if no specific admin users are found
    if (settings.CONTACT_EMAIL && !adminEmails.includes(settings.CONTACT_EMAIL)) {
      adminEmails.push(settings.CONTACT_EMAIL);
    }

    const companyName = settings.COMPANY_NAME || 'TREDPOS Institutional Terminal';

    if (adminEmails.length === 0) {
      console.warn('[sale_notifier] No active admin recipients found for cluster.');
      return;
    }

    // 1.5 Fetch Customer info from the private terminal for credit sales
    let customerInfo = null;
    if (sale.customerId && sale.paymentMethod === 'credit') {
      const [cRows] = await db.query("SELECT name, balance, credit_limit FROM customers WHERE id = ?", [sale.customerId]);
      if (cRows.length > 0) customerInfo = cRows[0];
    }

    // 2. Generate PDF Buffer
    const pdfBuffer = await generateReceiptPDF(sale, settings);

    // Prepare Items list for Email Body
    const itemsHtml = sale.items.map(item => `
      <tr>
        <td style="padding: 8px 4px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align: right;">${item.quantity}</td>
        <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align: right;">${(item.unitPrice || 0).toLocaleString()}</td>
      </tr>
    `).join('');

    // Prepare Custom Email Content
    const isCredit = sale.paymentMethod === 'credit';
    const isDiscounted = (sale.discount || 0) > 0;
    const isPromo = !!sale.promoName;
    
    let subject = isCredit && customerInfo
      ? `🚨 CREDIT SALE ALERT - ${customerInfo.name} took goods worth ${sale.total.toLocaleString()} UGX`
      : isPromo
        ? `🎁 [PROMO] SALE ALERT - ${sale.promoName} applied on Sale # ${sale.id}`
        : isDiscounted
          ? `⚠️ DISCOUNT ALERT - ${(sale.discount || 0).toLocaleString()} UGX override on Sale # ${sale.id}`
          : `NEW SALE ALERT - ${companyName} - ${sale.id}`;

    let htmlBody = `
      <div style="font-family: 'Inter', sans-serif; color: #333; max-width: 600px; padding: 25px; border: 1px solid #ddd; border-radius: 0; background: #fff;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 4px solid #000; padding-bottom: 20px;">
          <img src="cid:wordmark_logo" alt="TredPOS Wordmark" style="height: 45px; width: auto; margin-bottom: 10px;" />
          <h1 style="font-size: 14px; margin: 0; color: #000; text-transform: uppercase; font-weight: 900;">${companyName}</h1>
          <p style="font-size: 10px; margin: 4px 0 0; color: #666; text-transform: uppercase;">${settings.LOCATION || ''}</p>
          <p style="font-size: 10px; margin: 2px 0 0; color: #666;">SUPPORT: ${settings.SUPPORT_PHONE || ''}</p>
        </div>

        <h2 style="color: ${isCredit ? '#EF4444' : isPromo ? '#10B981' : isDiscounted ? '#F59E0B' : '#000'}; margin-top: 0; font-size: 18px; text-transform: uppercase; font-weight: 800;">
          ${isCredit ? 'Credit Sale Confirmation' : isPromo ? 'Promotion Applied' : isDiscounted ? 'Price Override Alert' : 'Sale Confirmation'}
        </h2>
        
        ${isPromo ? `
          <div style="background-color: #ECFDF5; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #10B981; border-left: 5px solid #10B981;">
            <p style="margin: 0 0 10px 0; color: #065F46;"><strong>💰 AUTOMATED PROMOTION SAVINGS</strong></p>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><b>Campaign Name:</b> <span style="color: #059669; font-weight: bold;">${sale.promoName}</span></p>
            <p style="margin: 0; font-size: 14px;"><b>Savings to Customer:</b> ${(sale.discount || 0).toLocaleString()} UGX</p>
          </div>
        ` : isDiscounted ? `
          <div style="background-color: #FFFBEB; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #F59E0B; border-left: 5px solid #F59E0B;">
            <p style="margin: 0 0 10px 0; color: #92400E;"><strong>⚠️ MANUAL PRICE OVERRIDE DETECTED</strong></p>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><b>Authorized By:</b> ${sale.cashierName || 'ADMIN'}</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;"><b>Discount Given:</b> <span style="color: #EF4444; font-weight: bold;">-${(sale.discount || 0).toLocaleString()} UGX</span></p>
            <p style="margin: 0; font-size: 14px;"><b>Original Subtotal:</b> ${(sale.subtotal || 0).toLocaleString()} UGX</p>
          </div>
        ` : ''}

        ${isCredit && customerInfo ? `
          <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #EF4444;">
            <p style="margin: 0 0 10px 0;"><strong>⚠️ CUSTOMER TOOK GOODS ON CREDIT</strong></p>
            <p style="margin: 0 0 5px 0;"><b>Customer Name:</b> ${customerInfo.name}</p>
            <p style="margin: 0 0 5px 0;"><b>New Outstanding Debt:</b> ${parseFloat(customerInfo.balance || 0).toLocaleString()} UGX</p>
            <p style="margin: 0;"><b>Credit Limit:</b> ${parseFloat(customerInfo.credit_limit || 0).toLocaleString()} UGX</p>
          </div>
        ` : (isDiscounted || isPromo) ? '' : `
          <p>This is an automated notification of a new successful transaction at <b>${companyName}</b>.</p>
        `}
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 4px; color: #666;"><b>Transaction ID:</b></td>
            <td style="padding: 4px; text-align: right;">${sale.id}</td>
          </tr>
          <tr>
            <td style="padding: 4px; color: #666;"><b>Payment Method:</b></td>
            <td style="padding: 4px; text-align: right;"><b>${sale.paymentMethod.replace('_', ' ').toUpperCase()}</b></td>
          </tr>
          <tr>
            <td style="padding: 4px; color: #666;"><b>Total Amount:</b></td>
            <td style="padding: 4px; text-align: right; color: ${isCredit ? '#EF4444' : '#22C55E'};"><b>${(sale.total || 0).toLocaleString()} UGX</b></td>
          </tr>
        </table>

        <h3 style="font-size: 14px; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Items Taken:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding: 4px; border-bottom: 2px solid #eee; text-align: left;">Item</th>
              <th style="padding: 4px; border-bottom: 2px solid #eee; text-align: right;">Qty</th>
              <th style="padding: 4px; border-bottom: 2px solid #eee; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;"><i>The full itemized receipt is attached as a PDF limit copy.</i></p>
      </div>
    `;

    // 2.3 Prepare High-Res Email Wordmark
    const wordMarkEmailBuffer = await sharp(path.join(process.cwd(), 'public', 'logos', 'wordlogo.svg'))
      .resize(800) // Render internal width high
      .png({ density: 300 })
      .toBuffer();

    // 3. Enqueue Email for background dispatch
    await enqueueMail({
      to: adminEmails,
      fromName: companyName,
      subject: subject,
      text: `A new sale has been processed.\n\nTransaction ID: ${sale.id}\nTotal: ${(sale.total || 0).toLocaleString()} UGX\nPayment: ${sale.paymentMethod}\n\nPlease find the detailed receipt attached.`,
      html: htmlBody,
      attachments: [
        {
          filename: `Receipt-${sale.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        },
        {
          filename: 'wordmark.png',
          content: wordMarkEmailBuffer,
          cid: 'wordmark_logo'
        }
      ],
      dbPool: db // 🛡️ Institutional Pool Injection for background routing
    });

    console.log(`[sale_notifier] Successfully sent sale notification to ${adminEmails.length} admins for sale ${sale.id}`);
  } catch (error) {
    console.error(`[sale_notifier] Failed to notify sale to admin:`, error?.message || error);
    // Don't throw - we don't want to crash the sale resolver if email fails
  }
};
