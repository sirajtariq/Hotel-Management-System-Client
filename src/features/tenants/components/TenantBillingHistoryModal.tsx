import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  CreditCard,
  Plus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tenantService } from '../services/tenantService';

interface TenantBillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
  onOpenRecordPayment?: () => void;
}

export function TenantBillingHistoryModal({
  isOpen,
  onClose,
  tenantId,
  onOpenRecordPayment,
}: TenantBillingHistoryModalProps) {
  const [data, setData] = useState<{
    tenantId: string;
    tenantName: string;
    currentPlan: string;
    nextDueDate?: string | null;
    history: Array<{
      id: string;
      invoiceDate?: string;
      dueDate?: string | null;
      plan: string;
      billingType: string;
      amountPaid: number;
      paymentMethod: string;
      status?: string;
    }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const res = await tenantService.getSubscriptionHistory(tenantId);
          setData(res);
        } catch (err) {
          console.error('Failed to fetch subscription history:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else {
      setData(null);
    }
  }, [isOpen, tenantId]);

  if (!isOpen || !tenantId) return null;

  const formatPKR = (amount: number) => `Rs. ${(amount || 0).toLocaleString('en-PK')}`;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const totalLifetimePaid = data?.history.reduce((acc, item) => acc + (item.amountPaid || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {data?.tenantName || 'Tenant Billing History'}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                  {data?.currentPlan || 'BASIC'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Next Renewal Due Date: {formatDate(data?.nextDueDate)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Fetching subscription invoices & payment ledger...</span>
            </div>
          ) : data ? (
            <>
              {/* Summary Strip */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Total Lifetime Subscription Paid</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">{formatPKR(totalLifetimePaid)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Active Subscription Status</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{data.history[0]?.status || 'PAID'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscription Invoices & Receipts</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3.5">Invoice #</th>
                        <th className="py-2.5 px-3.5">Billing Date</th>
                        <th className="py-2.5 px-3.5">Plan / Cycle</th>
                        <th className="py-2.5 px-3.5">Amount Paid</th>
                        <th className="py-2.5 px-3.5">Payment Method</th>
                        <th className="py-2.5 px-3.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {data.history.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-indigo-900">{inv.id}</td>
                          <td className="py-3 px-3.5 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-slate-800">{inv.plan}</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1">({inv.billingType})</span>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-900">{formatPKR(inv.amountPaid)}</td>
                          <td className="py-3 px-3.5 text-slate-500">{inv.paymentMethod}</td>
                          <td className="py-3 px-3.5 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {inv.status || 'PAID'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="h-36 flex items-center justify-center text-slate-400 text-xs">
              No subscription history records found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {onOpenRecordPayment ? (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onOpenRecordPayment();
              }}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Manual Renewal / Payment</span>
            </Button>
          ) : <div />}

          <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
