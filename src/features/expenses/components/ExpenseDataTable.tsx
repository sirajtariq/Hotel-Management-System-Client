import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { Expense, PaymentMethod } from '@/types/expenses';
import { formatPKR, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Trash2, Banknote, CreditCard, Building2, Wallet } from 'lucide-react';
import { Can } from '@/lib/rbac';
import { TablePagination } from '@/components/ui/TablePagination';

interface ExpenseDataTableProps {
  expenses: Expense[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete?: (id: string) => void;
}

const PAYMENT_METHOD_BADGES: Record<PaymentMethod, { label: string; icon: any; style: string }> = {
  CASH: { label: 'Cash Drawer', icon: Banknote, style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  BANK_TRANSFER: { label: 'Bank Transfer', icon: Building2, style: 'bg-blue-50 text-blue-800 border-blue-200' },
  CARD: { label: 'Card / POS', icon: CreditCard, style: 'bg-purple-50 text-purple-800 border-purple-200' },
  ONLINE: { label: 'Online Wallet', icon: Wallet, style: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
};

export function ExpenseDataTable({
  expenses,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
}: ExpenseDataTableProps) {
  if (!expenses.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 font-medium">No operational expenses recorded matching current filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="text-xs font-bold text-slate-700">Date</TableHead>
            <TableHead className="text-xs font-bold text-slate-700">Account Head (Khata)</TableHead>
            <TableHead className="text-xs font-bold text-slate-700">Vendor / Paid To</TableHead>
            <TableHead className="text-xs font-bold text-slate-700">Payment Mode</TableHead>
            <TableHead className="text-xs font-bold text-slate-700">Receipt / Bill #</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 text-right">Amount (PKR)</TableHead>
            <TableHead className="text-xs font-bold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => {
            const headName = exp.accountHeadName || exp.category || 'General Expense';
            const expPaidTo = exp.paidTo || 'N/A';
            const expDate = exp.date || '';
            const expReceipt = exp.receiptNumber || (exp.id ? `EXP-${String(exp.id).padStart(3, '0')}` : '-');
            const pmMeta = PAYMENT_METHOD_BADGES[exp.paymentMethod || 'CASH'] || PAYMENT_METHOD_BADGES.CASH;
            const PmIcon = pmMeta.icon;

            return (
              <TableRow key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                <TableCell className="text-xs font-medium text-slate-600 whitespace-nowrap">
                  {formatDate(expDate)}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <ExpenseCategoryBadge category={headName} />
                    {exp.notes && (
                      <p className="text-[11px] text-slate-500 font-normal line-clamp-1 max-w-[200px]">
                        {exp.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-900">{expPaidTo}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${pmMeta.style}`}>
                    <PmIcon className="h-3 w-3" />
                    <span>{pmMeta.label}</span>
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-500">{expReceipt}</TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold text-rose-700 text-sm">
                  {formatPKR(exp.amount || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <Can permission="expenses:delete">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete?.(exp.id)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Delete Expense Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        totalItems={totalCount}
      />
    </div>
  );
}
