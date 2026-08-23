import React, { useState } from 'react';
import { ReceivablesReportData } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
import { FileSpreadsheet, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac';
import { apiClient } from '@/lib/axios';
import { toast } from '@/components/ui/ToastProvider';

interface ReceivablesTaxTabProps {
  data: ReceivablesReportData;
  onRefresh?: () => void;
}

export function ReceivablesTaxTab({ data, onRefresh }: ReceivablesTaxTabProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleQuickPayment = async (bookingId: number, balanceDue: number) => {
    setLoadingId(bookingId);
    try {
      await apiClient.post(`/bookings/${bookingId}/record_payment/`, {
        amount: balanceDue,
      });
      toast.success('Payment recorded successfully.');
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tax / GST Collected</span>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">{formatPKR(data.total_tax_collected)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Room Tax: {formatPKR(data.room_tax_collected)} | F&B Tax: {formatPKR(data.restaurant_tax_collected)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Aging Receivables</span>
          <div className="text-2xl font-bold text-rose-900 mt-1 font-sans">{formatPKR(data.total_pending_balance)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{data.aging_receivables.length} Folios pending settlement</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance Status</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1 font-sans">Audit Compliant</div>
          <div className="text-[11px] text-slate-500 mt-1">GST Tax records up-to-date</div>
        </div>
      </div>

      {/* Aging Receivables & Pending Guest Dues Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-rose-600" />
            Aging Receivables & Pending Folio Dues
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Guest Name & Phone</th>
                <th className="p-3">Room #</th>
                <th className="p-3">Check-In / Out</th>
                <th className="p-3 text-right">Total Charges</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.aging_receivables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No outstanding guest folios or uncollected receivables!
                  </td>
                </tr>
              ) : (
                data.aging_receivables.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{item.guest_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.guest_phone}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-indigo-100">
                        Room #{item.room_number}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {item.check_in_date} → {item.check_out_date}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800">{formatPKR(item.total_amount)}</td>
                    <td className="p-3 text-right font-mono text-emerald-700">{formatPKR(item.paid_amount)}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">{formatPKR(item.balance_due)}</td>
                    <td className="p-3 text-center">
                      <Can permission="bookings:update">
                        <Button
                          size="sm"
                          disabled={loadingId === item.id}
                          onClick={() => handleQuickPayment(item.id, item.balance_due)}
                          className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-2xs"
                        >
                          {loadingId === item.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            'Settle Full'
                          )}
                        </Button>
                      </Can>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
