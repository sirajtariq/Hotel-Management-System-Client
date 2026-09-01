import React, { useState, useEffect } from 'react';
import { PaymentAccount, AccountTransaction } from '@/types/accounts';
import { accountService } from '../services/accountService';
import { formatPKR } from '@/lib/formatters';
import { X, Receipt, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountLedgerModalProps {
  account: PaymentAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AccountLedgerModal({
  account,
  isOpen,
  onClose,
}: AccountLedgerModalProps) {
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && account) {
      setIsLoading(true);
      accountService
        .getAccountTransactions(account.id)
        .then((data) => setTransactions(Array.isArray(data) ? data : []))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-md">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>{account.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {account.account_type}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Live transaction history & audit balance statement
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

        {/* Current Balance Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Statement Balance
            </span>
            <span className="text-xl font-extrabold text-indigo-950 font-mono">
              {formatPKR(account.current_balance)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Opening Balance
            </span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {formatPKR(account.opening_balance)}
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Loading ledger transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 font-medium">
              No transactions recorded for this account yet.
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-3">Date & Module</th>
                    <th className="p-3">Description / Ref #</th>
                    <th className="p-3 text-right">Amount (PKR)</th>
                    <th className="p-3 text-right">Balance After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {transactions.map((tx) => {
                    const typeStr = String(tx.transaction_type || (tx as any).transactionType || '').toUpperCase();
                    const isInflow = typeStr === 'INFLOW' || typeStr === 'TRANSFER_IN';
                    const rawDate = tx.created_at || (tx as any).createdAt || (tx as any).date;
                    const dateDisplay = rawDate && !isNaN(new Date(rawDate).getTime())
                      ? new Date(rawDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A';
                    const moduleStr = tx.source_module || (tx as any).sourceModule || 'TRANSACTION';
                    const refId = tx.reference_id || (tx as any).referenceId;
                    const balAfter = parseFloat(String(tx.balance_after ?? (tx as any).balanceAfter ?? 0));

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {isInflow ? (
                              <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <ArrowDownLeft className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block text-[11px]">
                                {moduleStr}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                                <Calendar className="h-2.5 w-2.5" />
                                {dateDisplay}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 max-w-xs">
                          <span className="font-semibold text-slate-800 block text-[11px]">
                            {tx.description || typeStr}
                          </span>
                          {refId && (
                            <span className="text-[10px] text-indigo-700 font-mono">
                              Ref: {refId}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-xs">
                          <span className={isInflow ? 'text-emerald-700' : 'text-rose-700'}>
                            {isInflow ? '+' : '-'} {formatPKR(parseFloat(String(tx.amount)))}
                          </span>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                          {formatPKR(balAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}
