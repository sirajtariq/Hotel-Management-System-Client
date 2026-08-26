import React, { useState, useEffect } from 'react';
import { PaymentAccount, AccountType, CreateAccountInput } from '@/types/accounts';
import { X, CreditCard, Landmark, Wallet, Check, Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils';

interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAccountInput) => Promise<void>;
  editingAccount?: PaymentAccount | null;
}

export function AddEditAccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}: AddEditAccountModalProps) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('CASH');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [branchName, setBranchName] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name || '');
      setAccountType(editingAccount.account_type || 'CASH');
      setBankName(editingAccount.bank_name || '');
      setAccountNumber(editingAccount.account_number || '');
      setIban(editingAccount.iban || '');
      setBranchName(editingAccount.branch_name || '');
      setOpeningBalance(editingAccount.opening_balance || 0);
      setIsDefault(editingAccount.is_default || false);
    } else {
      setName('');
      setAccountType('CASH');
      setBankName('');
      setAccountNumber('');
      setIban('');
      setBranchName('');
      setOpeningBalance(0);
      setIsDefault(false);
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        account_type: accountType,
        bank_name: accountType === 'BANK' ? bankName.trim() : '',
        account_number: accountType === 'BANK' ? accountNumber.trim() : '',
        iban: accountType === 'BANK' ? iban.trim() : '',
        branch_name: accountType === 'BANK' ? branchName.trim() : '',
        opening_balance: openingBalance,
        is_default: isDefault,
      });
      onClose();
    } catch (err: any) {
      toast.error('Account Save Failed', err.message || 'Could not save payment account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editingAccount ? 'Edit Payment Account' : 'Add New Payment Account'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Configure cash drawers, bank accounts, or POS terminal digital wallets
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
          {/* Account Type Selector Pills */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-2">
              Account Type Classification
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('CASH')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none',
                  accountType === 'CASH'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span>Cash Drawer</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('BANK')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none',
                  accountType === 'BANK'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                <Landmark className="h-4 w-4 text-indigo-600" />
                <span>Bank Account</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('WALLET')}
                className={cn(
                  'flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none',
                  accountType === 'WALLET'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                <CreditCard className="h-4 w-4 text-amber-600" />
                <span>POS / Wallet</span>
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Account Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Front Counter Drawer, Meezan Operations Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Bank Specific Details */}
          {accountType === 'BANK' && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">
                    Branch Name / Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Boulevard, Gulberg"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0102-0104829101"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">
                    IBAN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PK36MEZN0001020104829101"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Opening Balance */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Opening Balance (PKR)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={openingBalance}
              disabled={!!editingAccount}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
            />
            {editingAccount && (
              <p className="text-[10px] text-slate-400 mt-1">
                Opening balance cannot be modified once transactions exist.
              </p>
            )}
          </div>

          {/* Default Account Checkbox */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Set as Default Payment Account
              </span>
              <p className="text-[11px] text-slate-500 font-normal">
                Auto-select this account during expense logging and POS receipts
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDefault(!isDefault)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative p-0.5 border cursor-pointer shrink-0',
                isDefault ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform shadow-xs',
                  isDefault ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
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
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition-all hover:shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Save Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
