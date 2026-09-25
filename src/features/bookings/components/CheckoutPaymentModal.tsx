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
    extraCharges?: { name: string; amount: number }[];
    paymentAmount?: number;
    paymentAccountId?: string;
    paymentMethod?: string;
  }) => Promise<void>;
  onShowFolio?: (tempExtraCharges: { name: string; amount: number }[]) => void;
}

export function CheckoutPaymentModal({ booking, isOpen, onClose, onSubmit, onShowFolio }: CheckoutPaymentModalProps) {
  const [extraCharges, setExtraCharges] = useState<{name: string; amount: number}[]>([]);
  const [currentExtraChargeName, setCurrentExtraChargeName] = useState('');
  const [currentExtraChargeAmount, setCurrentExtraChargeAmount] = useState<number | ''>('');

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      setPaymentAmount(booking.remainingAmount || 0);
      setExtraCharges([]);
      setCurrentExtraChargeName('');
      setCurrentExtraChargeAmount('');
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

  // Update payment amount when extra charge changes
  useEffect(() => {
    if (booking) {
      const totalExtras = extraCharges.reduce((sum, charge) => sum + charge.amount, 0);
      setPaymentAmount((booking.remainingAmount || 0) + totalExtras);
    }
  }, [extraCharges, booking]);

  const handleAddExtraCharge = () => {
    if (currentExtraChargeName.trim() && currentExtraChargeAmount && currentExtraChargeAmount > 0) {
      setExtraCharges([...extraCharges, { name: currentExtraChargeName.trim(), amount: Number(currentExtraChargeAmount) }]);
      setCurrentExtraChargeName('');
      setCurrentExtraChargeAmount('');
    }
  };

  const removeExtraCharge = (index: number) => {
    setExtraCharges(extraCharges.filter((_, i) => i !== index));
  };

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: booking.id,
        extraCharges: extraCharges.length > 0 ? extraCharges : undefined,
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

          <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Add Extra Charge (Optional)</h4>
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <label className="text-[11px] font-semibold text-slate-600">Charge Name (e.g. Laundry)</label>
                <Input
                  type="text"
                  placeholder="Enter name"
                  value={currentExtraChargeName}
                  onChange={(e) => setCurrentExtraChargeName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1 w-28">
                <label className="text-[11px] font-semibold text-slate-600">Amount (PKR)</label>
                <Input
                  type="number"
                  min="0"
                  value={currentExtraChargeAmount}
                  onChange={(e) => setCurrentExtraChargeAmount(e.target.value ? Number(e.target.value) : '')}
                  className="text-xs h-8 font-mono"
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs px-3"
                onClick={handleAddExtraCharge}
                disabled={!currentExtraChargeName.trim() || !currentExtraChargeAmount}
              >
                Add
              </Button>
            </div>
            
            {extraCharges.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-indigo-100/50">
                {extraCharges.map((charge, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-md border border-indigo-50 text-xs">
                    <span className="font-medium text-slate-700">{charge.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-900">{formatPKR(charge.amount)}</span>
                      <button 
                        type="button" 
                        onClick={() => removeExtraCharge(idx)}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Total To Collect:</span>
              <span className="text-sm font-black text-rose-700 font-mono">
                {formatPKR((booking.remainingAmount || 0) + extraCharges.reduce((sum, c) => sum + c.amount, 0))}
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
                    {a.name} [{(a.propertyName || a.property_name) ? (a.propertyName || a.property_name) : 'Global'}] — Balance: PKR {Number(a.current_balance !== undefined ? a.current_balance : (a.currentBalance !== undefined ? a.currentBalance : 0)).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {onShowFolio ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onShowFolio(extraCharges)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                Print Bill (Show Folio)
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting || paymentAmount < 0}>
                {isSubmitting ? 'Processing...' : 'Collect & Check-Out'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
