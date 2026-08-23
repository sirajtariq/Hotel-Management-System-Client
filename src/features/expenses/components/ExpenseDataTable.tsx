import { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge';
import { Expense } from '@/types/expenses';
import { formatPKR, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium">No operational expenses recorded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Title & Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Paid To / Vendor</TableHead>
            <TableHead>Receipt / Voucher</TableHead>
            <TableHead className="text-right">Amount (PKR)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => {
            const expTitle = exp.title || (exp as any).item_name || 'Expense Item';
            const expPaidTo = exp.paidTo || (exp as any).vendor_name || 'N/A';
            const expDate = exp.date || (exp as any).expense_date || '';
            const expReceipt = exp.receiptNumber || (exp.id ? `EXP-${String(exp.id).padStart(3, '0')}` : '-');

            return (
              <TableRow key={exp.id}>
                <TableCell className="text-xs text-[#0F172A]">{formatDate(expDate)}</TableCell>
                <TableCell className="font-semibold text-slate-900">{expTitle}</TableCell>
                <TableCell>
                  <ExpenseCategoryBadge category={exp.category || 'miscellaneous'} />
                </TableCell>
                <TableCell className="text-xs text-slate-700">{expPaidTo}</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">{expReceipt}</TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold text-slate-900">
                  {formatPKR(exp.amount || 0)}
                </TableCell>
                <TableCell className="text-right">
                  <Can permission="expenses:delete">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete?.(exp.id)}
                      className="h-7 w-7 p-0 text-rose-600 hover:text-rose-900 hover:bg-rose-50"
                      title="Delete Expense"
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
