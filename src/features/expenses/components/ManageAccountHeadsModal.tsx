import React, { useState, useEffect } from 'react';
import { AccountHead } from '@/types/expenses';
import { expenseService } from '../services/expenseService';
import { toast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/ui/TablePagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EditAccountHeadModal } from './EditAccountHeadModal';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  X,
  Tag,
  ToggleLeft,
  ToggleRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
} from 'lucide-react';

interface ManageAccountHeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHeadsUpdated?: () => void;
}

export function ManageAccountHeadsModal({
  isOpen,
  onClose,
  onHeadsUpdated,
}: ManageAccountHeadsModalProps) {
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

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHeads = async () => {
    setIsLoading(true);
    try {
      const data = await expenseService.getAccountHeads();
      setHeads(data);
    } catch {
      toast.error('Failed to load Account Heads.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHeads();
      setIsCreating(false);
      setName('');
      setDescription('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      await fetchHeads();
      onHeadsUpdated?.();
    } catch (err: any) {
      toast.error('Creation Failed', err.message || 'Could not create Account Head.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean, headName: string) => {
    try {
      const updated = await expenseService.toggleAccountHeadActive(id);
      setHeads((prev) =>
        prev.map((h) => (h.id === id ? updated : h))
      );
      queryClient.invalidateQueries({ queryKey: ['accountHeads'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(
        updated.is_active ? 'Category Activated' : 'Category Inactivated',
        `"${headName}" status changed to ${updated.is_active ? 'Active' : 'Inactive'}.`
      );
      onHeadsUpdated?.();
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
      await fetchHeads();
      onHeadsUpdated?.();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Account Heads / Khata Catalog</h2>
              <p className="text-xs text-slate-500 font-medium">
                Single-tier expense categories for property OPEX & P&L accounting
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
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
              className="w-full sm:w-auto gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950 shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Account Head
            </Button>
          )}
        </div>

        {/* Create Inline Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-indigo-700" /> Add New Account Head
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name *</label>
                <Input
                  placeholder="e.g. Generator Fuel & Diesel, Laundry Soap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief note explaining what expenses belong under this head..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-indigo-900 text-white hover:bg-indigo-950 gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Account Head</span>
              </Button>
            </div>
          </form>
        )}

        {/* Catalog List */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Loading Account Heads...</span>
              </div>
            ) : filteredHeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                No Account Heads found matching query.
              </div>
            ) : (
              paginatedHeads.map((head) => {
                const recordedExpenses = head.expenses_count || 0;
                return (
                  <div
                    key={head.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-0.5 max-w-[60%]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{head.name}</span>
                        {head.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                            <XCircle className="h-3 w-3 text-slate-400" /> Inactive
                          </span>
                        )}
                      </div>
                      {head.description && (
                        <p className="text-[11px] text-slate-500 font-normal line-clamp-1">{head.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Expenses</div>
                        <div className="text-xs font-bold text-slate-700">{recordedExpenses} items</div>
                      </div>

                      <div className="flex items-center gap-1">
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
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <TablePagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalItems={filteredHeads.length}
          />
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-between items-center text-xs text-slate-400 font-medium">
          <span>Total {heads.length} Account Heads configured</span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Done / Close
          </Button>
        </div>
      </div>

      {/* Edit Account Head Modal */}
      <EditAccountHeadModal
        accountHead={editingHead}
        isOpen={!!editingHead}
        onClose={() => setEditingHead(null)}
        onSuccess={() => {
          fetchHeads();
          onHeadsUpdated?.();
        }}
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

