import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/bookings';
import { formatPKR, formatDate } from '@/lib/formatters';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, AlertTriangle, Shield, Building } from 'lucide-react';
import { BookingStatusBadge } from './BookingStatusBadge';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!booking) return null;

  const isHourly = String(booking.booking_type || booking.bookingType).toUpperCase() === 'HOURLY';
  const guestName = booking.guest?.fullName || (booking as any).guest_name || 'Guest';
  const guestPhone = booking.guest?.phone || (booking as any).guest_phone || 'N/A';
  const guestEmail = booking.guest?.email || (booking as any).guest_email || 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-lg">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Reservation Details</span>
              <span className="font-mono text-xs text-slate-500 font-normal">
                ({booking.bookingReference || `BK-${booking.id}`})
              </span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs mt-3">
          {/* Mode & Status Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              {isHourly ? (
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] flex items-center gap-1 font-bold">
                  <Clock className="h-3 w-3" />
                  Hourly Short Stay
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] flex items-center gap-1 font-bold">
                  <Calendar className="h-3 w-3" />
                  Nightly Stay
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <BookingStatusBadge status={booking.status} />
              <BookingStatusBadge paymentStatus={booking.paymentStatus} />
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              GUEST CONTACT & IDENTIFICATION
            </span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
              <span>{guestName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1 font-mono"><Phone className="h-3 w-3 text-slate-400" /> {guestPhone}</span>
              <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {guestEmail}</span>
            </div>
          </div>

          {/* Stay Timeline & Room */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ACCOMMODATION TIMELINE
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Unit:</span>
                <span className="font-bold text-slate-900 text-sm">Room {booking.roomNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Duration:</span>
                <span className="font-bold text-indigo-900 font-mono">
                  {booking.total_duration || booking.totalDuration || `${booking.totalNights || 1} Nights`}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">CHECK-IN</span>
                <span className="font-semibold">{formatDate(booking.checkInDate || booking.check_in)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">CHECK-OUT</span>
                <span className="font-semibold">{formatDate(booking.checkOutDate || booking.check_out)}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              PAYMENT & BILLING LEDGER
            </span>
            <div className="flex justify-between text-slate-700">
              <span>Applied Rate:</span>
              <span className="font-mono font-semibold">
                {formatPKR(booking.rate_applied || booking.rateApplied || booking.nightlyRate || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Subtotal Stay Charges:</span>
              <span className="font-mono font-semibold">
                {formatPKR(booking.subtotal_amount || booking.subtotalAmount || booking.totalAmount)}
              </span>
            </div>
            {(Number(booking.tax_rate || booking.taxRate) || 0) > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Tax ({booking.tax_rate || booking.taxRate}%):</span>
                <span className="font-mono font-semibold text-indigo-900">
                  +{formatPKR(booking.tax_amount || booking.taxAmount || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold">
              <span>Grand Total Amount:</span>
              <span className="font-mono font-bold">{formatPKR(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Amount Paid:</span>
              <span className="font-mono font-bold">-{formatPKR(booking.paidAmount)}</span>
            </div>
            <hr className="border-indigo-200" />
            <div className="flex justify-between text-sm font-bold">
              <span>Balance Due:</span>
              <span className="font-mono text-rose-600">{formatPKR(booking.remainingAmount)}</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Close Window
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
