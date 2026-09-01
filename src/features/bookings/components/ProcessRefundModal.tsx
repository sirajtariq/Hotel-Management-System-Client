import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowUpRight, X } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { apiClient } from '@/lib/axios';

export interface ProcessRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number | string;
    bookingNumber?: string;
    bookingReference?: string;
    paidAmount?: number;
    paid_amount?: number;
    totalRefunded?: number;
    total_refunded?: number;
    guestName?: string;
    guest_name?: string;
    guest?: { fullName?: string };
  } | null;
}

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const queryClient = useQueryClient();

  const paidAmount = Number(booking?.paidAmount ?? booking?.paid_amount ?? 0);
  const totalRefunded = Number(booking?.totalRefunded ?? booking?.total_refunded ?? 0);
  const maxRefundable = Math.max(0, paidAmount - totalRefunded);

  const [refundAmount, setRefundAmount] = useState<number>(maxRefundable);
  const [paymentAccountId, setPaymentAccountId] = useState<string>('');
  const [accountHeadId, setAccountHeadId] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setRefundAmount(maxRefundable);
      setPaymentAccountId('');
      setAccountHeadId('');
      setReason('');
    }
  }, [isOpen, maxRefundable]);

  // Fetch active payment accounts (Cash Drawer / Bank)
  const { data: paymentAccounts = [] } = useQuery({
    queryKey: ['payment-accounts', 'active'],
    queryFn: async () => {
      const res = await apiClient.get('/payments/accounts/?is_active=true');
      return res.data?.results || res.data || [];
    },
    enabled: isOpen,
  });

  // Fetch active expense/refund account heads
  const { data: accountHeads = [] } = useQuery({
    queryKey: ['account-heads', 'active'],
    queryFn: async () => {
      const res = await apiClient.get('/expenses/account-heads/?is_active=true');
      return res.data?.results || res.data || [];
    },
    enabled: isOpen,
  });

  // Strict Form Validation
  const isFormValid =
    Boolean(paymentAccountId) &&
    Boolean(accountHeadId) &&
    Number(refundAmount) > 0 &&
    Number(refundAmount) <= maxRefundable;

  const refundMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      return await apiClient.post(`/bookings/${booking.id}/refund/`, {
        amount: Number(refundAmount),
        payment_account: Number(paymentAccountId),
        account_head: Number(accountHeadId),
        reason: reason.trim(),
      });
    },
    onSuccess: () => {
      toast.success('Refund Processed', 'Refund processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to process refund.';
      toast.error('Refund Failed', msg);
    },
  });

  if (!isOpen || !booking) return null;

  const guestDisplayName = booking.guestName || booking.guest_name || booking.guest?.fullName || 'Guest';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Process Booking Refund</h3>
            <p className="text-xs text-gray-500">Booking #{booking.id} • {guestDisplayName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5"/>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Refundable Balance Summary */}
          <div className="flex justify-between rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-sm">
            <span className="text-amber-800 font-medium">Max Refundable Balance:</span>
            <span className="font-bold text-amber-900">PKR {maxRefundable.toLocaleString()}</span>
          </div>

          {/* Refund Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Refund Amount (PKR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={maxRefundable}
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-3 pr-10 text-sm font-semibold focus:border-indigo-600 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">PKR</span>
            </div>
            {refundAmount > maxRefundable && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5"/> Amount cannot exceed available balance.
              </p>
            )}
          </div>

          {/* Payment Account Selector (Mandatory) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Refund From (Payment Account) <span className="text-rose-500">*</span>
            </label>
            <select
              value={paymentAccountId}
              onChange={(e) => setPaymentAccountId(e.target.value)}
              className={`w-full rounded-xl border py-2.5 px-3 text-sm focus:outline-none ${
                !paymentAccountId ? 'border-rose-300 bg-rose-50/20 text-gray-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Select Cash Drawer or Bank Account --</option>
              {paymentAccounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: PKR {Number(acc.currentBalance ?? acc.current_balance ?? 0).toLocaleString()})
                </option>
              ))}
            </select>
            {!paymentAccountId && (
              <p className="mt-1 text-xs text-rose-500">Please select an account to deduct funds from.</p>
            )}
          </div>

          {/* Account Head Selector (Mandatory) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Account Head (Ledger Category) <span className="text-rose-500">*</span>
            </label>
            <select
              value={accountHeadId}
              onChange={(e) => setAccountHeadId(e.target.value)}
              className={`w-full rounded-xl border py-2.5 px-3 text-sm focus:outline-none ${
                !accountHeadId ? 'border-rose-300 bg-rose-50/20 text-gray-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Select Accounting Head --</option>
              {accountHeads.map((head: any) => (
                <option key={head.id} value={head.id}>
                  {head.name}
                </option>
              ))}
            </select>
            {!accountHeadId && (
              <p className="mt-1 text-xs text-rose-500">Please assign an accounting category for this refund.</p>
            )}
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Reason / Cancellation Notes
            </label>
            <input
              type="text"
              placeholder="e.g., Guest flight cancelled / Emergency checkout"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-2.5 px-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isFormValid || refundMutation.isPending}
            onClick={() => refundMutation.mutate()}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all ${
              !isFormValid || refundMutation.isPending
                ? 'cursor-not-allowed bg-gray-400 opacity-60'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            <ArrowUpRight className="h-4 w-4"/>
            {refundMutation.isPending ? 'Processing Refund...' : 'Confirm & Process Refund'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessRefundModal;
