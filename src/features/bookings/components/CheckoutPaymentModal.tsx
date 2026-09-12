import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Booking } from '@/types/bookings';
import { PaymentAccount } from '@/types/accounts';
import { accountService } from '@/features/accounts/services/accountService';
import { formatPKR } from '@/lib/formatters';

interface CheckoutPaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    bookingId: string;
    extraChargeName?: string;
    extraChargeAmount?: number;
    paymentAmount?: number;
    paymentAccountId?: string;
    paymentMethod?: string;
  }) => Promise<void>;
}

export function CheckoutPaymentModal({ booking, isOpen, onClose, onSubmit }: CheckoutPaymentModalProps) {
  const [extraChargeName, setExtraChargeName] = useState('');
  const [extraChargeAmount, setExtraChargeAmount] = useState<number>(0);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setPaymentAmount(booking.remainingAmount || 0);
      setExtraChargeName('');
      setExtraChargeAmount(0);
      accountService.getPaymentAccounts().then((accs) => {
        const active = accs.filter((a) => a.is_active);
        setPaymentAccounts(active);
        const defAcc = active.find((a) => a.is_default);
        if (defAcc) setSelectedAccountId(defAcc.id);
        else if (active.length > 0) setSelectedAccountId(active[0].id);
      });
    }
  }, [isOpen, booking]);

  // Update payment amount when extra charge changes
  useEffect(() => {
    if (booking) {
      setPaymentAmount((booking.remainingAmount || 0) + (extraChargeAmount || 0));
    }
  }, [extraChargeAmount, booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: booking.id,
        extraChargeName: extraChargeName || undefined,
        extraChargeAmount: extraChargeAmount > 0 ? extraChargeAmount : undefined,
        paymentAmount: Number(paymentAmount),
        paymentMethod: method,
        paymentAccountId: selectedAccountId ? String(selectedAccountId) : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout & Settle Balance</DialogTitle>
          <DialogDescription>
            Reference: <span className="font-mono font-semibold">{booking.bookingReference}</span> ({booking.guest.fullName})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2 font-sans">
          
          {/* Bill Summary */}
          <div className="rounded-md bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Current Total Bill:</span>
              <span className="font-mono tabular-nums">{formatPKR(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Already Paid:</span>
              <span className="font-mono tabular-nums text-emerald-700">{formatPKR(booking.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Current Outstanding Due:</span>
              <span className="font-mono tabular-nums text-rose-600">{formatPKR(booking.remainingAmount)}</span>
            </div>
          </div>

          {/* Extra Charges Section */}
          <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Add Extra Charge (Optional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Charge Name (e.g. Laundry)</label>
                <Input
                  type="text"
                  placeholder="Leave empty if none"
                  value={extraChargeName}
                  onChange={(e) => setExtraChargeName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Amount (PKR)</label>
                <Input
                  type="number"
                  min="0"
                  value={extraChargeAmount || ''}
                  onChange={(e) => setExtraChargeAmount(Number(e.target.value))}
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Total To Collect:</span>
              <span className="text-sm font-black text-rose-700 font-mono">
                {formatPKR((booking.remainingAmount || 0) + (extraChargeAmount || 0))}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Payment Amount</label>
                <Input
                  type="number"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="text-xs font-mono font-semibold"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                <Select value={method} onChange={(e) => setMethod(e.target.value as any)} className="text-xs">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Transfer</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Deposit To Account</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                <option value="">-- Select Account --</option>
                {paymentAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.account_type}) — Balance: PKR {a.current_balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || paymentAmount < 0}>
              {isSubmitting ? 'Processing...' : 'Collect & Check-Out'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
