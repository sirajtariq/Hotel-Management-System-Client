import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, ShieldCheck } from 'lucide-react';
import { Booking } from '@/types/bookings';
import { formatPKR, formatDate } from '@/lib/formatters';

interface InvoicePrintModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePrintModal({ booking, isOpen, onClose }: InvoicePrintModalProps) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
            <DialogTitle className="text-sm font-bold">Apex Hotel & Suites - Guest Invoice</DialogTitle>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </DialogHeader>

        {/* Invoice Printable View */}
        <div className="space-y-4 text-xs pt-2">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="font-bold text-slate-900 text-sm">{booking.propertyName}</div>
              <div className="text-slate-500">Ref: {booking.bookingReference}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-800">Date: {formatDate(new Date())}</div>
              <div className="text-slate-500">Status: {booking.paymentStatus.toUpperCase()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-md bg-slate-50 p-3 border border-slate-100">
            <div>
              <span className="font-semibold text-slate-700 block">Billed To:</span>
              <div className="text-slate-900 font-medium">{booking.guest.fullName}</div>
              <div className="text-slate-500">{booking.guest.phone}</div>
              <div className="text-slate-500">CNIC: {booking.guest.cnicOrPassport}</div>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-700 block">Stay Details:</span>
              <div>Room {booking.roomNumber}</div>
              <div className="text-slate-500">{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</div>
              <div className="text-slate-500 font-mono">{booking.totalNights} Nights Stay</div>
            </div>
          </div>

          {/* Line items */}
          {(() => {
            const restaurantOrders = booking.restaurant_orders || booking.restaurantOrders || [];
            const totalRestaurantCharges = Number(booking.total_restaurant_charges || booking.totalRestaurantCharges) || 
              restaurantOrders.reduce((sum: number, o: any) => sum + (Number(o.grand_total || o.grandTotal) || 0), 0);
            const roomStayCharges = Math.max(0, booking.totalAmount - totalRestaurantCharges);

            return (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-medium text-slate-800">Room Accommodation ({booking.totalNights} Nights)</td>
                    <td className="py-2 text-right font-mono tabular-nums">{formatPKR(roomStayCharges)}</td>
                  </tr>
                  {restaurantOrders.map((ord: any) => (
                    <tr key={ord.id}>
                      <td className="py-2 font-medium text-indigo-900">
                        Restaurant Order #{ord.order_number || ord.orderNumber} ({ord.order_type || ord.orderType})
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums">{formatPKR(ord.grand_total || ord.grandTotal || 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 font-bold text-slate-900">
                    <td className="py-2 pt-3">Total Payable</td>
                    <td className="py-2 pt-3 text-right font-mono tabular-nums text-sm">{formatPKR(booking.totalAmount)}</td>
                  </tr>
                  <tr className="text-emerald-700 font-semibold">
                    <td className="py-1">Amount Paid</td>
                    <td className="py-1 text-right font-mono tabular-nums">{formatPKR(booking.paidAmount)}</td>
                  </tr>
                  <tr className="text-rose-600 font-bold">
                    <td className="py-1">Balance Remaining</td>
                    <td className="py-1 text-right font-mono tabular-nums">{formatPKR(booking.remainingAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            );
          })()}

          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Thank you for staying with Apex Hotel & Suites. Computer generated invoice.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
