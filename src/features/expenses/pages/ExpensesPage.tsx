import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { ExpenseSummaryCards } from '../components/ExpenseSummaryCards';
import { ExpenseDataTable } from '../components/ExpenseDataTable';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { ManageAccountHeadsModal } from '../components/ManageAccountHeadsModal';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Loader2, Tag, Search, Filter, Calendar } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Expense, AccountHead, CreateExpenseInput } from '@/types/expenses';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isManageHeadsModalOpen, setIsManageHeadsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [selectedHeadId, setSelectedHeadId] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchAccountHeads = useCallback(async () => {
    try {
      const heads = await expenseService.getAccountHeads();
      setAccountHeads(heads);
    } catch {
      console.error('Failed to load Account Heads.');
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await expenseService.getExpenses({
        page: currentPage,
        page_size: pageSize,
        search: search.trim() || undefined,
        account_head_id: selectedHeadId ? Number(selectedHeadId) : undefined,
        payment_method: selectedPaymentMethod || undefined,
      });
      setExpenses(res.items);
      setTotalCount(res.totalCount);
    } catch {
      toast.error('Load Error', 'Failed to retrieve expenses.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, search, selectedHeadId, selectedPaymentMethod]);

  useEffect(() => {
    fetchAccountHeads();
  }, [fetchAccountHeads]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async (data: CreateExpenseInput) => {
    try {
      const created = await expenseService.createExpense(data);
      toast.success('Expense Logged', `Recorded PKR ${created.amount.toLocaleString()} under ${created.accountHeadName}`);
      fetchExpenses();
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not record expense item.');
      throw err;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success('Expense Removed', 'Expense item deleted successfully.');
    } catch {
      toast.error('Action Failed', 'Could not delete expense item.');
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await expenseService.exportExpensesCSV({
        account_head_id: selectedHeadId ? Number(selectedHeadId) : undefined,
        payment_method: selectedPaymentMethod || undefined,
      });
      toast.success('Export Complete', 'Expenses CSV downloaded successfully');
    } catch {
      toast.error('Export Failed', 'Could not generate CSV export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PermissionGuard permission="expenses:view" moduleName="Daily Operating Expenses">
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Operating Expenses (OPEX)"
          description="Manage property operational expenditures, Khata categories & payment ledgers"
          actions={
            <div className="flex flex-wrap items-center gap-2">

              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300 bg-white"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>Export CSV</span>
              </Button>

              <Can permission="expenses:create">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-bold shadow-xs"
                  onClick={() => setIsExpenseModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log New Expense</span>
                </Button>
              </Can>
            </div>
          }
        />

        {/* Summary Cards */}
        <ExpenseSummaryCards expenses={expenses} />

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Account Head Dropdown Filter */}
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Account Head
                </label>
                <select
                  value={selectedHeadId}
                  onChange={(e) => {
                    setSelectedHeadId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Account Heads</option>
                  {accountHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Mode Filter */}
              <div className="w-full sm:w-44">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Payment Mode
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    setSelectedPaymentMethod(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Payment Modes</option>
                  <option value="CASH">Cash Drawer</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card / POS</option>
                  <option value="ONLINE">Online Wallet</option>
                </select>
              </div>
            </div>

            {/* Search Input Box */}
            <div className="w-full md:w-72">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Search Ledger
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search vendor, bill #, description..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 text-xs bg-slate-50 border-slate-200 h-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
          <ExpenseDataTable
            expenses={expenses}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onDelete={handleDeleteExpense}
          />
        )}

        {/* Modals */}
        <AddExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSubmit={handleAddExpense}
          onOpenManageHeads={() => setIsManageHeadsModalOpen(true)}
        />

        <ManageAccountHeadsModal
          isOpen={isManageHeadsModalOpen}
          onClose={() => setIsManageHeadsModalOpen(false)}
          onHeadsUpdated={() => {
            fetchAccountHeads();
            fetchExpenses();
          }}
        />
      </div>
    </PermissionGuard>
  );
}
