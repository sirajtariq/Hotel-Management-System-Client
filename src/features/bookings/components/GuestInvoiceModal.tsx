import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Receipt, ShieldCheck, CheckCircle2, Clock, MapPin, Phone, Mail, User } from 'lucide-react';
import { Booking } from '@/types/bookings';
import { formatPKR, formatDate } from '@/lib/formatters';

interface GuestInvoiceModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GuestInvoiceModal({ booking, isOpen, onClose }: GuestInvoiceModalProps) {
  const [printMode, setPrintMode] = useState<'a4' | 'thermal'>('a4');

  if (!booking) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const isThermal = printMode === 'thermal';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Guest Invoice - ${booking.invoiceNumber || booking.id}</title>
          <style>
            @page {
              size: ${isThermal ? '80mm auto' : 'A4 portrait'};
              margin: ${isThermal ? '2mm' : '10mm'};
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: ${isThermal ? "'Courier New', Courier, monospace" : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
              margin: 0;
              padding: ${isThermal ? '4px' : '0'};
              background: #ffffff;
              color: #000000;
            }
            .w-full { width: 100%; }
            .max-w-2xl { max-width: 44rem; margin: 0 auto; }
            .w-\\\[310px\\\] { width: 310px; margin: 0 auto; }
            .bg-white { background-color: #ffffff; }
            .p-8 { padding: 2rem; }
            .p-4 { padding: 1rem; }
            .p-3\\.5 { padding: 0.875rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-md { border-radius: 0.375rem; }
            .rounded { border-radius: 0.25rem; }
            .border { border: 1px solid #cbd5e1; }
            .border-b { border-bottom: 1px solid #e2e8f0; }
            .border-b-2 { border-bottom: 2px solid #cbd5e1; }
            .border-t { border-top: 1px solid #e2e8f0; }
            .border-dashed { border-style: dashed; }
            .border-slate-200 { border-color: #e2e8f0; }
            .border-slate-300 { border-color: #cbd5e1; }
            .border-slate-400 { border-color: #94a3b8; }
            .bg-slate-50\\/80, .bg-slate-50 { background-color: #f8fafc; }
            .bg-indigo-900 { background-color: #312e81 !important; color: #ffffff !important; }
            .bg-emerald-100 { background-color: #d1fae5 !important; color: #065f46 !important; }
            .bg-rose-100 { background-color: #ffe4e6 !important; color: #9f1239 !important; }
            .text-slate-900 { color: #0f172a; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-700 { color: #334155; }
            .text-slate-600 { color: #475569; }
            .text-slate-500 { color: #64748b; }
            .text-slate-400 { color: #94a3b8; }
            .text-indigo-900 { color: #312e81; }
            .text-emerald-700 { color: #047857; }
            .text-emerald-800 { color: #065f46; }
            .text-rose-700 { color: #be123c; }
            .text-white { color: #ffffff !important; }
            .text-black { color: #000000; }
            .font-mono { font-family: monospace; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .text-\\[11px\\] { font-size: 11px; line-height: 14px; }
            .text-\\[10px\\] { font-size: 10px; line-height: 13px; }
            .text-\\[9px\\] { font-size: 9px; line-height: 12px; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-8 { gap: 2rem; }
            .gap-6 { gap: 1.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-1 { gap: 0.25rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-2.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .pt-8 { padding-top: 2rem; }
            .pt-4 { padding-top: 1rem; }
            .pt-2 { padding-top: 0.5rem; }
            .pt-1 { padding-top: 0.25rem; }
            .pb-5 { padding-bottom: 1.25rem; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .tracking-tight { letter-spacing: -0.025em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .tracking-widest { letter-spacing: 0.1em; }
            .leading-none { line-height: 1; }
            .leading-relaxed { line-height: 1.625; }
            .leading-tight { line-height: 1.25; }
            .inline-block { display: inline-block; }
            .w-72 { width: 18rem; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; }
            svg { display: inline-block; vertical-align: middle; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  };

  const invoiceNum = booking.invoiceNumber || `INV-RS-2026-${String(booking.id).padStart(4, '0')}`;
  const totalAmount = Number(booking.totalAmount) || 0;
  const paidAmount = Number(booking.paidAmount) || 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const roomType = booking.roomTypeName || 'Executive Deluxe Suite';
  const nightlyRate = booking.rate_applied || booking.rateApplied || booking.nightlyRate || Math.round(totalAmount / Math.max(1, booking.totalNights || 1));
  const taxRate = typeof booking.tax_rate !== 'undefined' && booking.tax_rate !== null ? Number(booking.tax_rate) : (typeof booking.taxRate !== 'undefined' ? Number(booking.taxRate) : 0);
  const subtotal = Number(booking.subtotal_amount || booking.subtotalAmount) || (taxRate > 0 ? Math.round(totalAmount / (1 + taxRate / 100)) : totalAmount);
  const gstTax = Number(booking.tax_amount || booking.taxAmount) || (totalAmount - subtotal);

  const discountAmount = Number(booking.discount_amount || booking.discountAmount) || 0;
  const isPaidInFull = remainingAmount === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-slate-100 max-h-[92vh] flex flex-col">

        {/* Controls Header (Hidden in Print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-white">Print Guest Invoice & Receipt</DialogTitle>
              <p className="text-[11px] text-slate-300">Dual A4 Tax Invoice and 80mm POS Thermal Slip formats</p>
            </div>
          </div>

          {/* Mode Switcher & Print Button */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintMode('a4')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  printMode === 'a4'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Executive A4</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('thermal')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  printMode === 'thermal'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>80mm Thermal</span>
              </button>
            </div>

            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/60 print:p-0 print:bg-white print:overflow-visible">
          <div id="printable-invoice" className="w-full flex justify-center">

            {printMode === 'a4' ? (
              /* EXECUTIVE A4 LAYOUT */
              <div className="w-full max-w-2xl bg-white p-8 rounded-xl border border-slate-300 shadow-sm text-slate-800 font-sans space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                      {booking.propertyName || 'Pearl Continental & Serviced Suites'}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {booking.propertyAddress || 'Block 4, Clifton, Club Road'} • {booking.propertyCity || 'Karachi, Pakistan'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +92 21 111 505 505</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> info@{(booking.tenantName || booking.propertyName || 'hotel').toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                    </div>

                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-indigo-900 text-white text-xs font-black tracking-widest uppercase rounded">
                      TAX INVOICE
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-2">{invoiceNum}</div>
                    <div className="text-[11px] text-slate-400">Ref: {booking.bookingReference}</div>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50/80 rounded-lg p-4 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      BILLED TO (GUEST)
                    </span>
                    <div className="font-bold text-slate-900 text-sm">{booking.guest.fullName}</div>
                    <div className="text-slate-600 font-mono mt-0.5">{booking.guest.phone}</div>
                    {booking.guest.email && <div className="text-slate-500">{booking.guest.email}</div>}
                    <div className="text-slate-500 font-mono text-[11px] mt-1">CNIC/Passport: {booking.guest.cnicOrPassport || 'N/A'}</div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      STAY SUMMARY
                    </span>
                    <div><strong className="text-slate-700">Check-in:</strong> {formatDate(booking.checkInDate || booking.check_in)}</div>
                    <div><strong className="text-slate-700">Check-out:</strong> {formatDate(booking.checkOutDate || booking.check_out)}</div>
                    <div>
                      <strong className="text-slate-700">Duration:</strong>{' '}
                      <span className="font-bold text-indigo-900 font-mono">
                        {booking.total_duration || booking.totalDuration || `${booking.totalNights || 1} Nights`}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-700">Type:</strong>{' '}
                      <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        String(booking.booking_type || booking.bookingType).toUpperCase() === 'HOURLY'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {String(booking.booking_type || booking.bookingType).toUpperCase() === 'HOURLY' ? 'Hourly Short Stay' : 'Nightly Stay'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Itemized Charges Table */}
                <div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-300 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5">Item Description</th>
                        <th className="py-2.5 text-center">Duration</th>
                        <th className="py-2.5 text-right">Applied Rate</th>
                        <th className="py-2.5 text-right">Total (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      <tr>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{booking.roomNumber} — {roomType}</div>
                          <div className="text-[11px] text-slate-500">
                            {String(booking.booking_type || booking.bookingType).toUpperCase() === 'HOURLY'
                              ? 'Hourly Short Stay Use'
                              : 'Nightly Stay & Room Services'}
                          </div>
                        </td>
                        <td className="py-3 text-center font-mono font-medium">
                          {booking.total_duration || booking.totalDuration || `${booking.totalNights} Nights`}
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums">
                          {formatPKR(booking.rate_applied || booking.rateApplied || nightlyRate)}
                        </td>
                        <td className="py-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          {formatPKR(subtotal)}
                        </td>
                      </tr>
                      {discountAmount > 0 && (
                        <tr className="text-emerald-700">
                          <td className="py-2 font-medium">Special Promotional Discount</td>
                          <td className="py-2 text-center text-slate-400">-</td>
                          <td className="py-2 text-right text-slate-400 font-mono text-[11px]">
                            {String(booking.discount_type || booking.discountType).toUpperCase() === 'PERCENTAGE'
                              ? `${booking.discount_value || booking.discountValue}%`
                              : 'Flat'}
                          </td>
                          <td className="py-2 text-right font-mono tabular-nums font-semibold">-{formatPKR(discountAmount)}</td>
                        </tr>
                      )}
                      {taxRate > 0 && (
                        <tr>
                          <td className="py-2 text-slate-600 font-medium">Hotel Luxury & Government Service Tax ({taxRate}%)</td>
                          <td className="py-2 text-center text-slate-400">-</td>
                          <td className="py-2 text-right text-slate-400 font-mono text-[11px]">{taxRate}%</td>
                          <td className="py-2 text-right font-mono tabular-nums text-slate-700">+{formatPKR(gstTax)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary Ledger */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Stay Charges:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{formatPKR(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Total Amount Paid:</span>
                      <span className="font-mono font-bold tabular-nums">-{formatPKR(paidAmount)}</span>
                    </div>
                    <hr className="border-slate-200" />
                    <div className="flex justify-between items-center text-sm font-black">
                      <span className={isPaidInFull ? 'text-emerald-800' : 'text-rose-700'}>
                        {isPaidInFull ? 'Balance Paid:' : 'Balance Due:'}
                      </span>
                      <span className={`font-mono tabular-nums ${isPaidInFull ? 'text-emerald-800' : 'text-rose-700'}`}>
                        {formatPKR(remainingAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms & Signature Footer */}
                <div className="pt-8 border-t border-slate-200 space-y-6">
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    <strong>Hotel Policy Terms:</strong> Standard check-out time is 12:00 PM. Late check-out is subject to room availability and additional tariff charges. All guest payments in PKR. Thank you for staying with us!
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="border-t border-dashed border-slate-400 text-center pt-2 text-[11px] font-semibold text-slate-600">
                      Guest Signature
                    </div>
                    <div className="border-t border-dashed border-slate-400 text-center pt-2 text-[11px] font-semibold text-slate-600">
                      Authorized Receptionist Signature
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 80mm POS THERMAL RECEIPT LAYOUT */
              <div className="w-[310px] bg-white p-4 rounded-md border border-slate-300 shadow-sm font-mono text-[11px] leading-tight text-black space-y-2 select-none">
                {/* Header */}
                <div className="text-center space-y-1">
                  <div className="font-bold text-sm uppercase">{booking.propertyName || 'Pearl Continental'}</div>
                  <div className="text-[10px]">{booking.propertyAddress || 'Clifton Club Road, Karachi'}</div>
                  <div className="text-[10px]">TEL: +92 21 111 505 505</div>
                  <div className="text-[10px] tracking-widest pt-1">********************************</div>
                  <div className="font-bold text-xs uppercase">RECEIPT / INVOICE</div>
                  <div className="text-[10px] tracking-widest">********************************</div>
                </div>

                {/* Receipt Metadata */}
                <div className="space-y-0.5 text-[10px]">
                  <div>INV #: {invoiceNum}</div>
                  <div>DATE: {formatDate(new Date())}</div>
                  <div>GUEST: {booking.guest.fullName}</div>
                  <div>TEL: {booking.guest.phone}</div>
                  <div>CNIC: {booking.guest.cnicOrPassport || 'N/A'}</div>
                  <div>ROOM: {booking.roomNumber}</div>
                  <div>DATES: {booking.checkInDate} to {booking.checkOutDate} ({booking.totalNights}N)</div>
                </div>

                <div className="text-[10px] tracking-widest">--------------------------------</div>

                {/* Charges */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>STAY TOTAL ({booking.totalNights}N):</span>
                    <span>{formatPKR(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAID ADVANCE:</span>
                    <span>-{formatPKR(paidAmount)}</span>
                  </div>
                  <div className="text-[10px] tracking-widest">--------------------------------</div>
                  <div className="flex justify-between font-bold text-xs">
                    <span>{isPaidInFull ? 'BALANCE PAID:' : 'BALANCE DUE:'}</span>
                    <span>{formatPKR(remainingAmount)}</span>
                  </div>
                  <div className="text-[10px] font-bold text-center pt-1 uppercase">
                    STATUS: [{booking.paymentStatus}]
                  </div>
                </div>

                <div className="text-[10px] tracking-widest">********************************</div>

                {/* QR Code / Barcode Simulation */}
                <div className="text-center py-2 space-y-1">
                  <div className="inline-block font-mono text-[9px] bg-slate-100 border border-black px-3 py-1 font-bold">
                    ||| | |||| | ||||| ||| || | ||||
                  </div>
                  <div className="text-[9px]">{invoiceNum}</div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-[10px] pt-1">
                  Thank you for your stay!<br />
                  Please present receipt at checkout.
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
