import React, { useState, useEffect } from 'react';
import { PaymentAccount, CreateTransferInput } from '@/types/accounts';
import { formatPKR } from '@/lib/formatters';
import { X, ArrowRightLeft, Calendar, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: PaymentAccount[];
  onExecuteTransfer: (data: CreateTransferInput) => Promise<void>;
}

export function TransferFundsModal({
  isOpen,
  onClose,
  accounts,
  onExecuteTransfer,
}: TransferFundsModalProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const [fromAccountId, setFromAccountId] = useState<number | ''>('');
  const [toAccountId, setToAccountId] = useState<number | ''>('');
  const [amount, setAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && activeAccounts.length >= 2) {
      setFromAccountId(activeAccounts[0].id);
      setToAccountId(activeAccounts[1].id);
      setAmount(0);
      setTransferDate(new Date().toISOString().split('T')[0]);
      setReferenceNumber('');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedFromAccount = activeAccounts.find((a) => a.id === Number(fromAccountId));
  const selectedToAccount = activeAccounts.find((a) => a.id === Number(toAccountId));

  const availableBalance = selectedFromAccount?.current_balance || 0;
  const isInsufficient = amount > availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId) {
      toast.error('Please select source and target accounts.');
      return;
    }

    if (fromAccountId === toAccountId) {
      toast.error('Source and target accounts must be different.');
      return;
    }

    if (amount <= 0) {
      toast.error('Transfer amount must be greater than zero.');
      return;
    }

    if (isInsufficient) {
      toast.error(`Insufficient balance in ${selectedFromAccount?.name}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onExecuteTransfer({
        from_account_id: Number(fromAccountId),
        to_account_id: Number(toAccountId),
        amount,
        transfer_date: transferDate,
        reference_number: referenceNumber.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      toast.error('Transfer Failed', err.message || 'Could not complete fund transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Internal Account Fund Transfer
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Move cash from drawer to bank, or transfer between operational accounts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Source Account (From) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold uppercase text-slate-500">
                From Account (Source) *
              </label>
              {selectedFromAccount && (
                <span className="text-[11px] font-bold text-slate-700 font-mono">
                  Available: {formatPKR(selectedFromAccount.current_balance)}
                </span>
              )}
            </div>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.account_type}) — Balance: PKR {a.current_balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Target Account (To) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold uppercase text-slate-500">
                To Account (Destination) *
              </label>
              {selectedToAccount && (
                <span className="text-[11px] font-bold text-slate-700 font-mono">
                  Balance: {formatPKR(selectedToAccount.current_balance)}
                </span>
              )}
            </div>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === Number(fromAccountId)}>
                  {a.name} ({a.account_type}) — Balance: PKR {a.current_balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Transfer Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="100"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                <span>Transfer Date</span>
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Insufficient Balance Alert */}
          {isInsufficient && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                Transfer amount exceeds available balance in {selectedFromAccount?.name}.
              </span>
            </div>
          )}

          {/* Reference / Slip # */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Bank Slip / Reference Number (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SLIP-99042 or Meezan Deposit Ref #881"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Transfer Purpose / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cash deposit from front counter drawer to Meezan Bank operations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0 || isInsufficient}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all hover:shadow-indigo-500/20 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Transferring...' : 'Execute Internal Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
