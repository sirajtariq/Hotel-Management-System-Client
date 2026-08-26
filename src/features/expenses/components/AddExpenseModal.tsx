import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateExpenseInput, AccountHead, PaymentMethod } from '@/types/expenses';
import { PaymentAccount } from '@/types/accounts';
import { expenseService } from '../services/expenseService';
import { accountService } from '@/features/accounts/services/accountService';
import { propertyService } from '@/features/properties/services/propertyService';
import { Property } from '@/types/properties';
import { toast } from '@/components/ui/ToastProvider';
import { Banknote, CreditCard, Building2, Wallet, Plus, Tag, Calendar, Receipt, FileText, Loader2 } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  onOpenManageHeads?: () => void;
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: any }[] = [
  { key: 'CASH', label: 'Cash Drawer', icon: Banknote },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
  { key: 'CARD', label: 'Card / POS', icon: CreditCard },
  { key: 'ONLINE', label: 'Online Wallet', icon: Wallet },
];

export function AddExpenseModal({ isOpen, onClose, onSubmit, onOpenManageHeads }: AddExpenseModalProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  // Form State
  const [propertyId, setPropertyId] = useState<string>('');
  const [accountHeadId, setAccountHeadId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidTo, setPaidTo] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadMetadata = async () => {
    setIsLoadingMeta(true);
    try {
      const [props, heads, accs] = await Promise.all([
        propertyService.getProperties(),
        expenseService.getAccountHeads(),
        accountService.getPaymentAccounts(),
      ]);
      setProperties(props);
      if (props.length > 0) {
        setPropertyId(props[0].id);
      }
      setAccountHeads(heads.filter((h) => h.is_active));
      if (heads.length > 0) {
        const activeFirst = heads.find((h) => h.is_active);
        if (activeFirst) setAccountHeadId(activeFirst.id);
      }
      setPaymentAccounts(accs.filter((a) => a.is_active));
      const defAcc = accs.find((a) => a.is_default && a.is_active);
      if (defAcc) {
        setSelectedAccountId(defAcc.id);
      } else if (accs.length > 0) {
        setSelectedAccountId(accs[0].id);
      }
    } catch {
      toast.error('Failed to load expense properties or Account Heads.');
    } finally {
      setIsLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMetadata();
      setAmount('');
      setPaidTo('');
      setReceiptNumber('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('CASH');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      toast.error('Validation Error', 'Please select a hotel property.');
      return;
    }
    if (!accountHeadId) {
      toast.error('Validation Error', 'Please select an Account Head.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Validation Error', 'Expense amount must be greater than PKR 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        propertyId,
        accountHeadId: Number(accountHeadId),
        amount: numAmount,
        date,
        paymentMethod,
        paidTo: paidTo.trim(),
        receiptNumber: receiptNumber.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'Could not record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">
                Record Operating Expense
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Log Operational Outflow (OPEX) under specific Account Head
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
          {/* Property Select */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Property / Branch *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          {/* Account Head Select */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Account Head (Expense Khata) *</label>

            <select
              value={accountHeadId}
              onChange={(e) => setAccountHeadId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              {accountHeads.length === 0 ? (
                <option value="">No Active Account Heads Found</option>
              ) : (
                accountHeads.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Amount (PKR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">Rs</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-xs font-mono font-bold text-rose-700 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Expense Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs bg-white"
                required
              />
            </div>
          </div>

          {/* Payment Method Pills */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">Payment Mode *</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.key;
                return (
                  <button
                    key={pm.key}
                    type="button"
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-bold">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid From Payment Account */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Paid From Account *</label>
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

          {/* Paid To / Vendor & Receipt # */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Paid To / Vendor</label>
              <Input
                placeholder="e.g. PSO Station, Metro Cash"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Receipt / Bill #</label>
              <Input
                placeholder="e.g. INV-9901"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="text-xs font-mono bg-white"
              />
            </div>
          </div>

          {/* Description / Notes */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Additional expense breakdown or comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingMeta}
              className="text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-bold px-4 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Posting Expense...' : 'Post Expense'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
