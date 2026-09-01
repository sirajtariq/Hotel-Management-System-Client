import { MoreHorizontal, Printer, DollarSign, LogIn, LogOut, XCircle, Clock, Moon, Loader2, ArrowUpRight } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking, BookingStatus } from '@/types/bookings';
import { formatPKR, formatDate } from '@/lib/formatters';
import { Can } from '@/lib/rbac';

interface BookingTableRowProps {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onRecordPayment: (booking: Booking) => void;
  onProcessRefund?: (booking: Booking) => void;
  onPrintInvoice: (booking: Booking) => void;
  updatingBookingId?: string | null;
}

export function BookingTableRow({
  booking,
  onStatusChange,
  onRecordPayment,
  onProcessRefund,
  onPrintInvoice,
  updatingBookingId,
}: BookingTableRowProps) {
  const isUpdating = updatingBookingId === booking.id;
  const guestName = booking?.guest?.fullName || (booking as any)?.guestName || (booking as any)?.guest_name || 'Guest';
  const guestPhone = booking?.guest?.phone || (booking as any)?.guestPhone || (booking as any)?.guest_phone || 'N/A';
  const bookingRef = booking?.bookingReference || booking?.invoiceNumber || (booking as any)?.invoice_number || `BK-2026-${booking?.id || '000'}`;
  const remainingAmt = booking?.remainingAmount ?? (booking as any)?.remainingBalance ?? (booking as any)?.remaining_balance ?? Math.max(0, (booking?.totalAmount || 0) - (booking?.paidAmount || 0));

  const statusUpper = String(booking?.status || '').toUpperCase();
  const isCanCheckIn = statusUpper === 'RESERVED' || statusUpper === 'CONFIRMED' || statusUpper === 'PENDING';
  const isCheckedIn = statusUpper === 'CHECKED_IN' || statusUpper === 'CHECK_IN';
  const isCheckedOut = statusUpper === 'CHECKED_OUT' || statusUpper === 'CHECK_OUT';
  const isCancelled = statusUpper === 'CANCELLED' || statusUpper === 'CANCEL';

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      <TableCell className="font-mono text-xs font-semibold text-slate-900">
        {bookingRef}
      </TableCell>
      <TableCell>
        <div className="font-bold text-slate-900 text-xs">{guestName}</div>
        <div className="text-[11px] text-slate-400 font-mono">{guestPhone}</div>
      </TableCell>
      <TableCell className="text-xs font-bold text-indigo-950 font-mono">
        {booking?.roomNumber || 'Room N/A'}
      </TableCell>
      <TableCell className="text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-900">
          <span>{formatDate(booking?.checkInDate || booking?.check_in)}</span>
          <span className="text-slate-400">→</span>
          <span>{formatDate(booking?.checkOutDate || booking?.check_out)}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {String(booking?.booking_type || booking?.bookingType || 'NIGHTLY').toUpperCase() === 'HOURLY' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/70">
              <Clock className="h-3 w-3 text-purple-600" />
              <span>{booking?.total_duration || booking?.totalDuration || 'Hourly Stay'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              <Moon className="h-3 w-3 text-indigo-600" />
              <span>{booking?.total_duration || `${booking?.totalNights || 1} Nights`}</span>
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono tabular-nums">
        <div className="font-bold text-slate-900">{formatPKR(booking?.totalAmount || 0)}</div>
        {remainingAmt > 0 && (
          <div className="text-[10px] text-rose-600 font-semibold">Due: {formatPKR(remainingAmt)}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 items-start">
          <BookingStatusBadge status={booking?.status || 'confirmed'} />
          <BookingStatusBadge paymentStatus={booking?.paymentStatus || 'unpaid'} />
        </div>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Can permission="bookings:update">
            {isCanCheckIn && (
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange(booking.id, 'checked_in' as any)}
                className="h-7 px-2.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogIn className="h-3.5 w-3.5" />
                )}
                <span>{isUpdating ? 'Checking In...' : 'Check In'}</span>
              </Button>
            )}
            {isCheckedIn && (
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange(booking.id, 'checked_out' as any)}
                className="h-7 px-2.5 text-[11px] font-bold bg-indigo-900 hover:bg-indigo-950 text-white gap-1 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>{isUpdating ? 'Checking Out...' : 'Check Out'}</span>
              </Button>
            )}
          </Can>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-slate-900">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-sans">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Booking Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Can permission="bookings:update">
                <>
                  {isCanCheckIn && (
                    <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'checked_in' as any)} className="gap-2 text-emerald-700 font-semibold cursor-pointer">
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Check In Guest</span>
                    </DropdownMenuItem>
                  )}
                  {isCheckedIn && (
                    <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'checked_out' as any)} className="gap-2 text-indigo-700 font-semibold cursor-pointer">
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Check Out Guest</span>
                    </DropdownMenuItem>
                  )}
                </>
              </Can>
              {remainingAmt > 0 && (
                <Can permission="bookings:record_payment">
                  <DropdownMenuItem onClick={() => onRecordPayment(booking)} className="gap-2 text-blue-700 font-semibold cursor-pointer">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Record Payment</span>
                  </DropdownMenuItem>
                </Can>
              )}
              {((booking.paidAmount || (booking as any).paid_amount || 0) - ((booking as any).total_refunded || booking.totalRefunded || 0)) > 0 && (
                <Can permission="bookings:cancel">
                  <DropdownMenuItem onClick={() => onProcessRefund?.(booking)} className="gap-2 text-amber-700 font-semibold cursor-pointer">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    <span>Process Refund</span>
                  </DropdownMenuItem>
                </Can>
              )}
              {!isCancelled && !isCheckedOut && (
                <Can permission="bookings:cancel">
                  <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'cancelled' as any)} className="gap-2 text-rose-700 font-semibold cursor-pointer">
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Booking</span>
                  </DropdownMenuItem>
                </Can>
              )}
              <DropdownMenuItem onClick={() => onPrintInvoice(booking)} className="gap-2 font-medium cursor-pointer">
                <Printer className="h-3.5 w-3.5" />
                <span>Print Invoice</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
