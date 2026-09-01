import React from 'react';
import { PaymentAccount, AccountType } from '@/types/accounts';
import { formatPKR } from '@/lib/formatters';
import { toast } from '@/components/ui/ToastProvider';
import {
  Wallet,
  Landmark,
  CreditCard,
  Star,
  Copy,
  Receipt,
  Edit3,
  MapPin,
  UserCheck,
  Smartphone,
  Building,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccountCardProps {
  account: PaymentAccount;
  onViewLedger: (account: PaymentAccount) => void;
  onEdit: (account: PaymentAccount) => void;
  onSetDefault: (id: number, name: string) => void;
  onToggleActive: (account: PaymentAccount) => void;
  onDelete: (account: PaymentAccount) => void;
  isToggling?: boolean;
}

export function AccountCard({
  account,
  onViewLedger,
  onEdit,
  onSetDefault,
  onToggleActive,
  onDelete,
  isToggling = false,
}: AccountCardProps) {
  // Normalize account object properties to handle both camelCase and snake_case API representations
  const isActive = typeof account.is_active === 'boolean' ? account.is_active : typeof account.isActive === 'boolean' ? account.isActive : true;
  const isDefault = typeof account.is_default === 'boolean' ? account.is_default : typeof account.isDefault === 'boolean' ? account.isDefault : false;
  const accountType = (account.accountType ?? account.account_type ?? 'CASH').toUpperCase() as AccountType;

  const bankName = (account.bankName ?? account.bank_name ?? '').trim();
  const accountNumber = (account.accountNumber ?? account.account_number ?? '').trim();
  const iban = (account.iban ?? account.iban ?? '').trim();
  const branchName = (account.branchName ?? account.branch_name ?? '').trim();
  const currentBalance = parseFloat(String(account.currentBalance ?? account.current_balance ?? 0));
  const transactionsCount = account.transactionsCount ?? account.transactions_count ?? 0;

  const isCash = accountType === 'CASH';
  const isBank = accountType === 'BANK';
  const isWallet = accountType === 'WALLET';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to Clipboard', label);
  };

  // Mask account number to last 4 digits if present
  const maskedAccNo = accountNumber
    ? `•••• ${accountNumber.slice(-4)}`
    : '•••• 5678';

  return (
    <div
      className={cn(
        'border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden group font-sans select-none',
        !isActive
          ? 'bg-slate-100/95 border-slate-300 opacity-75 hover:opacity-90 grayscale-[20%] text-slate-500 shadow-2xs'
          : isDefault
          ? 'bg-white border-amber-300/80 ring-1 ring-amber-200/60 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
      )}
    >
      {/* Top Banner when Inactive */}
      {!isActive && (
        <div className="bg-slate-200/90 text-slate-600 text-[10px] font-bold uppercase tracking-wider py-1 px-3 -mx-5 -mt-5 mb-3 border-b border-slate-300 flex items-center justify-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 text-slate-500" />
          <span>Account Deactivated / Inactive</span>
        </div>
      )}

      {/* Default Top Accent Line when Active */}
      {isDefault && isActive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
      )}

      <div>
        {/* Card Header: Badge & Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isCash && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Cash Drawer</span>
              </span>
            )}
            {isBank && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Landmark className="h-3.5 w-3.5 text-blue-600" />
                <span>Bank Account</span>
              </span>
            )}
            {isWallet && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                <span>POS / Wallet</span>
              </span>
            )}

            {isDefault ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>Default Account</span>
              </span>
            ) : null}

            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                <XCircle className="h-3 w-3 text-slate-500" /> Inactive
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSetDefault(account.id, account.name)}
            className={cn(
              'p-1.5 rounded-lg transition-colors cursor-pointer shrink-0',
              isDefault
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
            )}
            title={isDefault ? 'Default Account' : 'Click to set as default payment account'}
          >
            <Star className={cn('h-4 w-4', isDefault ? 'fill-amber-400 text-amber-500' : '')} />
          </button>
        </div>

        {/* Account Title */}
        <h3 className={cn('text-base font-bold transition-colors line-clamp-1', isActive ? 'text-slate-900 group-hover:text-indigo-900' : 'text-slate-600')}>
          {account.name}
        </h3>

        {/* Financial Balance Display (Hero Area) */}
        <div className="mt-2.5">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
            Available Balance
          </span>
          <div className={cn('text-2xl font-extrabold tracking-tight font-mono mt-0.5', isActive ? 'text-slate-900' : 'text-slate-500')}>
            {formatPKR(currentBalance)}
          </div>
        </div>

        {/* Structured Metadata Details Section (Clean Empty State Handling) */}
        <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 my-3 space-y-1.5 text-xs text-slate-600 min-h-[82px] flex flex-col justify-center">
          {isBank && (!bankName && !accountNumber) ? (
            <div className="text-center py-1 px-2">
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                No bank details configured. Click edit to set bank name & account number.
              </p>
            </div>
          ) : isBank ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">Bank Name:</span>
                <span className="font-bold text-slate-900 truncate">
                  {bankName || 'Commercial Bank'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium">Account Number:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  {accountNumber ? maskedAccNo : '•••• 5678'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium">Branch / IBAN:</span>
                <div className="flex items-center gap-1 max-w-[150px] truncate">
                  <span className="font-mono text-[11px] font-semibold text-slate-700 truncate">
                    {iban || branchName || 'Main Branch'}
                  </span>
                  {iban && (
                    <button
                      type="button"
                      onClick={() => handleCopy(iban, 'IBAN Number')}
                      className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors cursor-pointer"
                      title="Copy IBAN"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : isCash && (!branchName && !bankName && !accountNumber) ? (
            <div className="text-center py-1 px-2">
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                No drawer location set. Click edit to configure linked property or counter tag.
              </p>
            </div>
          ) : isCash ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> Linked Property:
                </span>
                <span className="font-bold text-slate-900 truncate">
                  {branchName || 'Main Hotel Property'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-slate-400" /> Cashier / Counter:
                </span>
                <span className="font-semibold text-slate-800 text-[11px] truncate">
                  {bankName || accountNumber || 'Front Desk Counter 1'}
                </span>
              </div>
            </>
          ) : isWallet && (!bankName && !accountNumber) ? (
            <div className="text-center py-1 px-2">
              <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                No POS terminal details set. Click edit to configure device TID or settlement link.
              </p>
            </div>
          ) : isWallet ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-slate-400" /> Provider / Device TID:
                </span>
                <span className="font-mono font-bold text-slate-900 truncate">
                  {bankName ? `${bankName} (${accountNumber || 'TID-4402'})` : 'POS Terminal #4402'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Building className="h-3 w-3 text-slate-400" /> Settlement Link:
                </span>
                <span className="font-semibold text-slate-800 text-[11px] truncate">
                  {branchName || iban || 'Main Bank Settlement'}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Card Footer (Micro-Actions Toolbar) */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
        {/* Ledger Button */}
        <button
          type="button"
          onClick={() => onViewLedger(account)}
          className="bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Receipt className="h-3.5 w-3.5 text-indigo-600" />
          <span>Ledger</span>
        </button>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Edit Account Details"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          {/* Status Toggle Button with Loading State */}
          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggleActive(account)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={isToggling ? 'Updating status...' : isActive ? 'Deactivate Account' : 'Activate Account'}
          >
            {isToggling ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-600" />
            ) : isActive ? (
              <ToggleRight className="h-4.5 w-4.5 text-emerald-600" />
            ) : (
              <ToggleLeft className="h-4.5 w-4.5 text-slate-400" />
            )}
          </button>

          {/* Delete Button */}
          {transactionsCount > 0 ? (
            <button
              type="button"
              disabled
              className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
              title="Cannot delete account with transactions. Deactivate it instead."
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(account)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Payment Account"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


