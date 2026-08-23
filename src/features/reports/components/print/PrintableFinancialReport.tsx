import React from 'react';
import { FinancialPeriodFilter, FinancialReportType } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';

interface PrintableFinancialReportProps {
  reportData: any;
  activeTab: FinancialReportType;
  period: FinancialPeriodFilter;
  propertyName?: string;
  tenantName?: string;
}

export function PrintableFinancialReport({
  reportData,
  activeTab,
  period,
  propertyName = 'All Property Branches',
  tenantName = 'Hospitality Management System',
}: PrintableFinancialReportProps) {
  if (!reportData) return null;

  const timestamp = new Date().toLocaleString();

  return (
    <div className="hidden print:block print:w-full print:p-8 print:bg-white print:text-black font-sans text-xs space-y-6">
      {/* Hotel / Tenant Header */}
      <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">{tenantName}</h1>
          <p className="text-sm font-semibold text-slate-700">{propertyName}</p>
          <p className="text-xs text-slate-500 mt-1">Official Executive Financial Statement</p>
        </div>
        <div className="text-right text-xs text-slate-600 space-y-0.5">
          <div><strong className="text-slate-900">Report Scope:</strong> {activeTab.toUpperCase()}</div>
          <div><strong className="text-slate-900">Period:</strong> {period.toUpperCase()}</div>
          <div><strong className="text-slate-900">Generated:</strong> {timestamp}</div>
        </div>
      </div>

      {/* Main Content Summary per Tab */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 p-3 bg-slate-100 rounded border border-slate-300 font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Gross Revenue</div>
              <div className="text-sm font-bold">{formatPKR(reportData.gross_revenue)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Expenses</div>
              <div className="text-sm font-bold text-rose-700">{formatPKR(reportData.total_expenses)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Net Operating Profit</div>
              <div className="text-sm font-bold text-emerald-800">{formatPKR(reportData.net_profit)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Profit Margin</div>
              <div className="text-sm font-bold">{reportData.profit_margin}%</div>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                <th className="p-2 border border-slate-300">Category</th>
                <th className="p-2 border border-slate-300">Type</th>
                <th className="p-2 border border-slate-300 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.ledger?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-300 font-medium">{item.category}</td>
                  <td className="p-2 border border-slate-300 font-semibold">{item.type}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{formatPKR(item.amount)}</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-100">
                <td className="p-2 border border-slate-300" colSpan={2}>Net Operating Profit</td>
                <td className="p-2 border border-slate-300 text-right font-mono text-sm">{formatPKR(reportData.net_profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-100 rounded border border-slate-300 font-mono">
            <span className="text-xs text-slate-500 uppercase font-semibold">Total Revenue Earned: </span>
            <span className="text-sm font-bold text-slate-900">{formatPKR(reportData.total_revenue)}</span>
          </div>

          <h3 className="font-bold text-sm text-slate-900 pt-2">Revenue by Room Category</h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-bold">
                <th className="p-2 border border-slate-300">Room Type</th>
                <th className="p-2 border border-slate-300 text-right">Amount (PKR)</th>
                <th className="p-2 border border-slate-300 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.revenue_by_room_type?.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-2 border border-slate-300 font-medium">{item.room_type}</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">{formatPKR(item.amount)}</td>
                  <td className="p-2 border border-slate-300 text-right">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Signature Block */}
      <div className="pt-12 flex justify-between items-end text-xs text-slate-600">
        <div>
          <div className="border-t border-slate-400 w-48 pt-1 text-center">Prepared By (Auditor)</div>
        </div>
        <div>
          <div className="border-t border-slate-400 w-48 pt-1 text-center">Approved By (General Manager)</div>
        </div>
      </div>
    </div>
  );
}
