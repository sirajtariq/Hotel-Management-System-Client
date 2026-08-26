import React from 'react';
import { PaymentAccount } from '@/types/accounts';
import { formatPKR } from '@/lib/formatters';
import { toast } from '@/components/ui/ToastProvider';
import {
  Wallet,
  Landmark,
  CreditCard,
  Star,
  Copy,
  Receipt,
  Edit,
  MapPin,
  UserCheck,
  Smartphone,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: PaymentAccount;
  onViewLedger: (account: PaymentAccount) => void;
  onEdit: (account: PaymentAccount) => void;
  onSetDefault: (id: number, name: string) => void;
}

export function AccountCard({
  account,
  onViewLedger,
  onEdit,
  onSetDefault,
}: AccountCardProps) {
  const isCash = account.account_type === 'CASH';
  const isBank = account.account_type === 'BANK';
  const isWallet = account.account_type === 'WALLET';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to Clipboard', label);
  };

  // Mask account number to last 4 digits if present
  const maskedAccNo = account.account_number
    ? `•••• ${account.account_number.slice(-4)}`
    : '•••• 9101';

  return (
    <div
      className={cn(
        'bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group font-sans select-none',
        account.is_default
          ? 'border-amber-300/80 ring-1 ring-amber-200/60'
          : 'border-slate-200/90 hover:border-indigo-300'
      )}
    >
      {/* Default Top Accent Line */}
      {account.is_default && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
      )}

      <div>
        {/* Card Header: Badge & Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
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
                <span>POS Terminal</span>
              </span>
            )}
          </div>

          {account.is_default ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Default
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSetDefault(account.id, account.name)}
              className="text-slate-300 hover:text-amber-500 transition-colors p-1"
              title="Set as default account"
            >
              <Star className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Account Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors line-clamp-1">
          {account.name}
        </h3>

        {/* Financial Balance Display (Hero Area) */}
        <div className="mt-3">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">
            Available Balance
          </span>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono mt-0.5">
            {formatPKR(account.current_balance)}
          </div>
        </div>

        {/* Metadata Details Section (Uniform Height) */}
        <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 my-3 space-y-1.5 text-xs text-slate-600 min-h-[76px] flex flex-col justify-center">
          {isBank && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Bank:</span>
                <span className="font-bold text-slate-900">
                  {account.bank_name || 'Meezan Bank'} <span className="text-slate-400 font-mono text-[11px]">({maskedAccNo})</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium">IBAN:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[11px] font-semibold text-slate-800 max-w-[130px] truncate">
                    {account.iban || 'PK36MEZN0001020104829101'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(account.iban || 'PK36MEZN0001020104829101', 'IBAN Number')}
                    className="text-slate-400 hover:text-indigo-600 p-0.5 transition-colors"
                    title="Copy IBAN"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </>
          )}

          {isCash && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> Location:
                </span>
                <span className="font-bold text-slate-900">Front Desk Counter 1</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-slate-400" /> Custodian:
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">Shift Receptionist (Active Till)</span>
              </div>
            </>
          )}

          {isWallet && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-slate-400" /> Device / TID:
                </span>
                <span className="font-mono font-bold text-slate-900">POS-TID-4402</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Building className="h-3 w-3 text-slate-400" /> Settlement:
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">Meezan Bank Link</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Footer (Micro-Actions) */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onViewLedger(account)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Receipt className="h-3.5 w-3.5 text-slate-500" />
          <span>Ledger</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit Account"
          >
            <Edit className="h-4 w-4" />
          </button>

          {!account.is_default && (
            <button
              type="button"
              onClick={() => onSetDefault(account.id, account.name)}
              className="text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              Set Default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
