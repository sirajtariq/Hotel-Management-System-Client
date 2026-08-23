import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { ExpenseSummaryCards } from '../components/ExpenseSummaryCards';
import { ExpenseDataTable } from '../components/ExpenseDataTable';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Download, Loader2 } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Expense, CreateExpenseInput } from '@/types/expenses';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    expenseService
      .getExpenses({ page: currentPage, page_size: pageSize })
      .then((res) => {
        setExpenses(res.items);
        setTotalCount(res.totalCount);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, pageSize]);

  const handleAddExpense = async (data: CreateExpenseInput) => {
    try {
      const created = await expenseService.createExpense(data);
      setExpenses((prev) => [created, ...prev]);
      toast.success('Expense Logged', `PKR ${created.amount.toLocaleString()} for ${created.title}`);
    } catch {
      toast.error('Action Failed', 'Could not record expense item.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('Expense Removed', 'Expense item deleted successfully.');
    } catch {
      toast.error('Action Failed', 'Could not delete expense item.');
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await expenseService.exportExpensesCSV();
      toast.success('Export Started', 'Expenses CSV statement downloaded successfully');
    } catch {
      toast.error('Export Failed', 'Could not generate CSV export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PermissionGuard permission="expenses:view" moduleName="Daily Operating Expenses">
      <div className="space-y-6">
        <PageHeader
          title="Operating Expenses"
          description="Property operational costs, utility bills, maintenance expenditures in PKR"
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="gap-1.5 text-xs text-slate-700 hover:text-slate-900 border-slate-300"
              >
                {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-slate-500" />}
                <span>Export CSV</span>
              </Button>
              <Can permission="expenses:create">
                <Button size="sm" className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Log New Expense
                </Button>
              </Can>
            </div>
          }
        />

        <ExpenseSummaryCards expenses={expenses} />

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
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

        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddExpense}
        />
      </div>
    </PermissionGuard>
  );
}
