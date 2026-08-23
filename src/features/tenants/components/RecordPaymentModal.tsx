import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantItem } from '@/types/tenants';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { amount_paid: number; payment_method: string; months_to_extend: number }) => Promise<void>;
  tenant: TenantItem | null;
  isSubmitting: boolean;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  tenant,
  isSubmitting,
}: RecordPaymentModalProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [monthsToExtend, setMonthsToExtend] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setAmountPaid(String(tenant.price_amount || '50000'));
      setPaymentMethod('BANK_TRANSFER');
      setMonthsToExtend(tenant.billing_type === 'ANNUAL' ? 12 : 1);
      setError(null);
    }
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseFloat(amountPaid);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    try {
      await onSubmit({
        amount_paid: numericAmount,
        payment_method: paymentMethod,
        months_to_extend: monthsToExtend,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record subscription payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Record Subscription Payment</h2>
              <p className="text-xs text-slate-500 font-medium">Extend subscription & update status to PAID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hotel / Client Tenant</label>
            <div className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center text-xs font-bold text-slate-900">
              {tenant.name} ({tenant.slug})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Amount Received (PKR) *</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="pl-8 text-xs font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Extension Duration *</label>
              <select
                value={monthsToExtend}
                onChange={(e) => setMonthsToExtend(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:outline-hidden"
              >
                <option value={1}>+1 Month (Monthly)</option>
                <option value={3}>+3 Months (Quarterly)</option>
                <option value={6}>+6 Months (Bi-Annual)</option>
                <option value={12}>+12 Months (Annual)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Channel / Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 font-medium focus:outline-hidden"
            >
              <option value="BANK_TRANSFER">Direct Bank Transfer</option>
              <option value="CASH">Cash Payment</option>
              <option value="CREDIT_CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Cheque / Pay Order</option>
            </select>
          </div>

          <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3 text-[11px] text-emerald-800">
            <div className="font-bold flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Next Due Date Update</span>
            </div>
            <div className="mt-1 font-medium">
              Extending by {monthsToExtend} month(s) will set status to <strong className="uppercase">Paid</strong> and push the next due date accordingly.
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? 'Recording...' : 'Confirm & Extend Subscription'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
