import React, { useState, useEffect } from 'react';
import { AccountHead } from '@/types/expenses';
import { expenseService } from '@/features/expenses/services/expenseService';
import { formatPKR } from '@/lib/formatters';
import { toast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/ui/TablePagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EditAccountHeadModal } from '@/features/expenses/components/EditAccountHeadModal';
import { useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Search,
  Plus,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
} from 'lucide-react';

export function AccountHeadsAdminTab() {
  const queryClient = useQueryClient();
  const [heads, setHeads] = useState<AccountHead[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Modals state
  const [editingHead, setEditingHead] = useState<AccountHead | null>(null);
  const [deletingHead, setDeletingHead] = useState<AccountHead | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHeads = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getAccountHeads();
      setHeads(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load Account Heads catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHeads();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Account Head name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newHead = await expenseService.createAccountHead({
        name: name.trim(),
        description: description.trim(),
      });
      toast.success('Account Head Created', `Added "${newHead.name}" to Khata catalog.`);
      queryClient.invalidateQueries({ queryKey: ['accountHeads'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setName('');
      setDescription('');
      setIsCreating(false);
      fetchHeads();
    } catch (err: any) {
      toast.error('Creation Failed', err.message || 'Could not create Account Head.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean, headName: string) => {
    try {
      await expenseService.toggleAccountHeadActive(id);
      setHeads((prev) =>
        prev.map((h) => (h.id === id ? { ...h, is_active: !currentStatus } : h))
      );
      queryClient.invalidateQueries({ queryKey: ['accountHeads'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(
        !currentStatus ? 'Category Activated' : 'Category Inactivated',
        `"${headName}" status changed to ${!currentStatus ? 'Active' : 'Inactive'}.`
      );
    } catch {
      toast.error('Update Failed', 'Could not toggle Account Head status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingHead) return;
    try {
      await expenseService.deleteAccountHead(deletingHead.id);
      toast.success('Account Head Deleted', `Deleted "${deletingHead.name}".`);
      queryClient.invalidateQueries({ queryKey: ['accountHeads'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDeletingHead(null);
      fetchHeads();
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Could not delete Account Head.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredHeads = heads.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.description || '').toLowerCase().includes(q)
    );
  });

  const paginatedHeads = filteredHeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              Expense Account Heads Catalog ({heads.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Single-tier operational expense categories for property accounting and P&L financial statements
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search account head or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {!isCreating && (
              <Button
                size="sm"
                onClick={() => setIsCreating(true)}
                className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-3.5 py-2 shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Head</span>
              </Button>
            )}
          </div>
        </div>

        {/* Create Form Card */}
        {isCreating && (
          <form onSubmit={handleCreate} className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" /> Register New Expense Account Head
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Head Name *</label>
                <Input
                  placeholder="e.g. Generator Fuel & Diesel, Laundry Supplies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <Input
                  placeholder="Brief explanation of what expenses belong under this head..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="text-xs bg-white cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-3.5 py-2 shadow-2xs gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Account Head</span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Account Heads Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading Account Heads Catalog...</span>
          </div>
        ) : filteredHeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No Account Heads found matching query.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Account Head Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Recorded Expenses</th>
                    <th className="p-4 text-right">Total Spent (PKR)</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedHeads.map((head) => {
                    const recordedExpenses = head.expenses_count || 0;
                    return (
                      <tr key={head.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              <Tag className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-slate-900 text-xs">{head.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">
                          {head.description || 'No description provided'}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-bold">
                            {recordedExpenses} items
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-rose-700 text-sm">
                          {formatPKR(parseFloat(String(head.total_spent_amount || 0)))}
                        </td>
                        <td className="p-4 text-center">
                          {head.is_active ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200">
                              <XCircle className="h-3 w-3 text-slate-400" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingHead(head)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Account Head"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            {/* Status Toggle Switch Icon */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(head.id, head.is_active, head.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={head.is_active ? 'Deactivate Category' : 'Activate Category'}
                            >
                              {head.is_active ? (
                                <ToggleRight className="h-4.5 w-4.5 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="h-4.5 w-4.5 text-slate-400" />
                              )}
                            </button>

                            {/* Protected Delete Button */}
                            {recordedExpenses > 0 ? (
                              <button
                                type="button"
                                disabled
                                className="p-1.5 rounded-lg text-slate-300 cursor-not-allowed"
                                title="Cannot delete head with recorded transactions. Deactivate it instead."
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeletingHead(head)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Account Head"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={filteredHeads.length}
            />
          </div>
        )}
      </div>

      {/* Edit Account Head Modal */}
      <EditAccountHeadModal
        accountHead={editingHead}
        isOpen={!!editingHead}
        onClose={() => setEditingHead(null)}
        onSuccess={fetchHeads}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingHead}
        onClose={() => setDeletingHead(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account Head"
        description={`Are you sure you want to delete "${deletingHead?.name}"? This action cannot be undone.`}
        confirmText="Delete Head"
        variant="danger"
      />
    </div>
  );
}

