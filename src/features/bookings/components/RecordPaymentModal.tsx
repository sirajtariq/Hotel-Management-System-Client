import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Booking, RecordPaymentInput } from '@/types/bookings';
import { PaymentAccount } from '@/types/accounts';
import { accountService } from '@/features/accounts/services/accountService';
import { formatPKR } from '@/lib/formatters';

interface RecordPaymentModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: RecordPaymentInput) => Promise<void>;
}

export function RecordPaymentModal({ booking, isOpen, onClose, onSubmit }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(booking?.remainingAmount || 0);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      accountService.getPaymentAccounts().then((accs) => {
        const active = accs.filter((a) => a.is_active);
        setPaymentAccounts(active);
        const defAcc = active.find((a) => a.is_default);
        if (defAcc) setSelectedAccountId(defAcc.id);
        else if (active.length > 0) setSelectedAccountId(active[0].id);
      });
    }
  }, [isOpen]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({
      bookingId: booking.id,
      amount: Number(amount),
      paymentMethod: method,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Reference: <span className="font-mono font-semibold">{booking.bookingReference}</span> ({booking.guest.fullName})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2 font-sans">
          <div className="rounded-md bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Total Bill:</span>
              <span className="font-mono tabular-nums">{formatPKR(booking.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Already Paid:</span>
              <span className="font-mono tabular-nums text-emerald-700">{formatPKR(booking.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Outstanding Due:</span>
              <span className="font-mono tabular-nums text-rose-600">{formatPKR(booking.remainingAmount)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Payment Amount (PKR)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-xs font-mono font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as any)} className="text-xs">
              <option value="cash">Cash Received</option>
              <option value="card">Credit / Debit Card</option>
              <option value="bank_transfer">Direct Bank Transfer</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Deposit To Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              {paymentAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.account_type}) — Balance: PKR {a.current_balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
