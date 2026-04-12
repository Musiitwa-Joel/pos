import React from 'react';
import { formatCurrency } from '../lib/utils';
import { CartItem, PaymentMethod } from '../types';
import fullLogo from '../../assets/SVG/fulllogo.svg';

interface ReceiptProps {
  sale: {
    items: any[];
    total: number;
    subtotal: number;
    discount: number;
    paymentMethod: PaymentMethod;
    id?: string;
    date?: string;
    customerName?: string;
  } | null;
  settings?: Record<string, string>;
}

export default function Receipt({ sale, settings }: ReceiptProps) {
  if (!sale) return null;

  return (
    <div className="printable-receipt text-[11px] leading-tight">
      <div className="flex justify-center mb-4">
        <img src={fullLogo} alt="Logo" className="h-16 w-auto object-contain grayscale" />
      </div>
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-[14px] font-bold uppercase">{settings?.COMPANY_NAME || 'DARLINGTON HARDWARE'}</h2>
        <p>{settings?.LOCATION || 'Plot 42, Kampala Industrial Area'}</p>
        <p>Tel: {settings?.SUPPORT_PHONE || '+256 700 000 000'}</p>
        <div className="border-b border-black border-dashed my-2" />
        <p className="font-mono text-[9px] uppercase">
          RECEIPT NO: {sale.id || 'TRX-' + Math.random().toString(36).substring(7).toUpperCase()}
        </p>
        <p className="font-mono text-[9px]">
          DATE: {sale.date || new Date().toLocaleString()}
        </p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-12 font-bold border-b border-black border-dashed pb-1 mb-1 uppercase text-[9px]">
          <div className="col-span-5">ITEM</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-center">REM</div>
          <div className="col-span-3 text-right">PRICE</div>
        </div>
        {sale.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-1 py-0.5 border-b border-black/10">
            <div className="col-span-5 truncate font-medium uppercase">{item.productName || item.name}</div>
            <div className="col-span-2 text-center">{item.quantity}</div>
            <div className="col-span-2 text-center">{item.remainingStock ?? '-'}</div>
            <div className="col-span-3 text-right">{formatCurrency(item.unitPrice * item.quantity || item.price * item.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-black border-dashed pt-2 font-mono">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="flex justify-between text-black">
            <span>DISCOUNT:</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] font-bold border-t border-black border-double pt-1">
          <span>GRAND TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-1 text-center font-mono">
        <div className="border-t border-black border-dashed pt-2" />
        <p className="uppercase">Payment: {sale.paymentMethod.replace('_', ' ')}</p>
        {sale.customerName && <p>Customer: {sale.customerName}</p>}
        <div className="mt-4 opacity-70">
          <p>********** THANK YOU **********</p>
          <p>PLEASE KEEP THIS RECEIPT</p>
          <p>POWERED BY TREDUMO POS</p>
          <p>www.tredumo.com</p>

        </div>
      </div>

      {/* Spacer for thermal tear-off */}
      <div className="h-12" />
    </div>
  );
}
