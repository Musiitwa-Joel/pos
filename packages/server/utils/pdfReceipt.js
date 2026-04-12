import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import path from 'path';
import { formatCurrency } from './format.js';

export const generateReceiptPDF = async (sale, settings = {}) => {
  // Pre-process logos for PDF compatibility (PDFKit doesn't natively support SVG well)
  const logoDir = path.join(process.cwd(), 'public', 'logos');
  // Increase density for high-res thermal printing and explicitly resize to ensure crispness
  const wordMarkBuffer = await sharp(path.join(logoDir, 'wordlogo.svg'))
    .resize(1200) // Render internal width high
    .png({ density: 600 }) 
    .toBuffer();
    
  const waterMarkBuffer = await sharp(path.join(logoDir, 'fulllogo.svg'))
    .resize(800)
    .grayscale()
    // Bake the "faintness" into the pixels directly:
    // This maps black (0) to ~240 (very light gray) and white (255) stays white.
    .linear(0.05, 242) 
    .png({ density: 300 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [226.77, 600], // 80mm width in points (approx)
      margins: { top: 10, bottom: 10, left: 10, right: 10 }
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    // --- Branding Watermark (Faded Background) ---
    doc.save();
    // Baked-in pixels (sharp.linear) + PDFKit opacity ensure transparency on all environments
    doc.image(waterMarkBuffer, 63, 150, { width: 100, opacity: 0.08 }); 
    doc.restore();

    // --- Header Branding ---
    // Rendering at 140 points width with high-res buffer
    doc.image(wordMarkBuffer, 43, 10, { width: 140, align: 'center' });
    doc.moveDown(4.5); // Space for logo

    doc.fontSize(10).font('Helvetica-Bold').text(settings.COMPANY_NAME || 'DARLINGTON HARDWARE', { align: 'center' });
    doc.fontSize(7).font('Helvetica').text(settings.LOCATION || 'Plot 42, Kampala Industrial Area', { align: 'center' });
    doc.text(`Tel: ${settings.SUPPORT_PHONE || '+256 700 000 000'}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).dash(2, { space: 2 }).stroke().undash();
    doc.moveDown(0.5);

    doc.fontSize(7).font('Helvetica-Bold').text(`RECEIPT NO: ${sale.id}`, { align: 'center' });
    doc.fontSize(6).font('Helvetica').text(`DATE: ${new Date(sale.createdAt).toLocaleString()}`, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).dash(2, { space: 2 }).stroke().undash();
    doc.moveDown(0.5);

    // --- Items Table Header ---
    doc.fontSize(7).font('Helvetica-Bold');
    const headerY = doc.y;
    doc.text('ITEM', 10, headerY, { width: 80 });
    doc.text('QTY', 95, headerY, { width: 30, align: 'center' });
    doc.text('REM', 130, headerY, { width: 30, align: 'center' });
    doc.text('PRICE', 165, headerY, { width: 51, align: 'right' });
    
    doc.moveDown(0.2);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).stroke();
    doc.moveDown(0.3);

    // --- Items ---
    doc.fontSize(6).font('Helvetica');
    sale.items.forEach(item => {
      const startY = doc.y;
      const name = (item.productName || item.name || 'ITEM').toUpperCase();
      doc.text(name, 10, startY, { width: 80 });
      doc.text(item.quantity.toString(), 95, startY, { width: 30, align: 'center' });
      doc.text(item.remainingStock?.toString() || '-', 130, startY, { width: 30, align: 'center' });
      doc.text(formatCurrency(item.unitPrice * item.quantity), 165, startY, { width: 51, align: 'right' });
      doc.moveDown(0.5);
    });

    // --- Totals ---
    doc.moveDown(0.5);
    doc.moveTo(10, doc.y).lineTo(216, doc.y).dash(2, { space: 2 }).stroke().undash();
    doc.moveDown(0.5);

    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('SUBTOTAL:', 10, doc.y, { continued: true, width: 100 });
    doc.text(formatCurrency(sale.subtotal), 110, doc.y, { width: 106, align: 'right' });

    if (sale.discount > 0) {
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('DISCOUNT:', 10, doc.y, { continued: true, width: 100 });
      doc.text(`-${formatCurrency(sale.discount)}`, 110, doc.y, { width: 106, align: 'right' });
      doc.fontSize(7).font('Helvetica'); // Reset for next lines if any
    }

    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('GRAND TOTAL:', 10, doc.y, { continued: true, width: 100 });
    doc.text(formatCurrency(sale.total), 110, doc.y, { width: 106, align: 'right' });

    // --- Footer ---
    doc.moveDown(1.5);
    const payMethod = (sale.paymentMethod || 'CASH').toUpperCase();
    doc.fontSize(7).font('Helvetica-Bold').text(`PAYMENT: ${payMethod}`, { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(7).font('Helvetica-Bold').text(`SERVED BY: ${sale.cashierName || 'ADMIN'}`, { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(8);
    doc.text('**** THANK YOU ****', { align: 'center' });
    doc.fontSize(6);
    doc.text('PLEASE KEEP THIS RECEIPT', { align: 'center' });
    doc.text('POWERED BY TREDUMO POS', { align: 'center' });
    doc.text('www.tredumo.com', { align: 'center' });
    
    // --- Digital eStamp Watermark ---
    doc.save(); // Save state for rotation and opacity
    
    const stampX = 40; 
    const stampY = doc.y + 10;
    const stampWidth = 140;
    const stampHeight = 50;

    // Rotate and set opacity for watermark look
    doc.rotate(-12, { origin: [stampX + stampWidth / 2, stampY + stampHeight / 2] });
    doc.fillOpacity(0.6);
    doc.strokeColor('#2563EB'); // Professional Stamp Blue
    doc.fillColor('#2563EB');

    // Draw Stamp Border
    doc.rect(stampX, stampY, stampWidth, stampHeight).lineWidth(1.5).stroke();
    doc.rect(stampX + 1.5, stampY + 1.5, stampWidth - 3, stampHeight - 3).lineWidth(0.5).stroke();

    // Company Initials Logo (MGH)
    const initials = (settings.COMPANY_NAME || 'Mukono General Hardware')
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 3)
      .toUpperCase();

    const circleX = stampX + 16;
    const circleY = stampY + stampHeight / 2;
    doc.circle(circleX, circleY, 11).stroke();
    doc.fontSize(6).font('Helvetica-Bold').text(initials, circleX - 10, circleY - 3, { width: 20, align: 'center' });

    // Stamp Details
    doc.fontSize(7).font('Helvetica-Bold').text('eSTAMPED', stampX + 35, stampY + 6, { width: 100, align: 'center' });
    doc.fontSize(5).font('Helvetica').text(`Ref: ${sale.id.substring(0, 18)}...`, stampX + 35, stampY + 16, { width: 100, align: 'center' });
    doc.text(`${new Date(sale.createdAt).toISOString().split('T')[0]}`, stampX + 35, stampY + 24, { width: 100, align: 'center' });
    
    doc.fontSize(5).font('Helvetica-Bold');
    doc.text('VERIFIED STATEMENT', stampX + 35, stampY + 34, { width: 100, align: 'center' });
    doc.text(settings.SUPPORT_PHONE || '+256 703 840 326', stampX + 35, stampY + 41, { width: 100, align: 'center' });

    doc.restore(); // Restore original state (reset opacity and rotation)

    doc.end();
  });
};
