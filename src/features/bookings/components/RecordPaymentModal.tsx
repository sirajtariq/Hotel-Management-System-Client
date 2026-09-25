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
  const [extraChargeName, setExtraChargeName] = useState('');
  const [extraChargeAmount, setExtraChargeAmount] = useState<number>(0);

  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setAmount(booking.remainingAmount || 0);
      setExtraChargeName('');
      setExtraChargeAmount(0);
      accountService.getPaymentAccounts(undefined, String(booking.propertyId || (booking as any).property)).then((accs) => {
        const active = accs.filter((a) => a.is_active);
        setPaymentAccounts(active);
        const localDef = active.find((a) => a.is_default && a.property);
        const globalDef = active.find((a) => a.is_default && !a.property);
        const defAcc = localDef || globalDef;
        if (defAcc) setSelectedAccountId(defAcc.id);
        else if (active.length > 0) setSelectedAccountId(active[0].id);
      });
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (booking) {
      setAmount((booking.remainingAmount || 0) + (extraChargeAmount || 0));
    }
  }, [extraChargeAmount, booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: booking.id,
        amount: Number(amount),
        paymentMethod: method,
        paymentAccountId: selectedAccountId ? Number(selectedAccountId) : undefined,
        accountId: selectedAccountId ? Number(selectedAccountId) : undefined,
        extraChargeName: extraChargeName || undefined,
        extraChargeAmount: extraChargeAmount > 0 ? extraChargeAmount : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
                  {a.name} [{(a.propertyName || a.property_name) ? (a.propertyName || a.property_name) : 'Global'}] — Balance: PKR {Number(a.current_balance !== undefined ? a.current_balance : (a.currentBalance !== undefined ? a.currentBalance : 0)).toLocaleString()}
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
