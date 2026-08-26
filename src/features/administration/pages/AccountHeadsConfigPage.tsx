import React, { useState, useEffect } from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { AccountHead } from '@/types/expenses';
import { expenseService } from '@/features/expenses/services/expenseService';
import { formatPKR } from '@/lib/formatters';
import { toast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Tag,
  Search,
  Plus,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Receipt,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';

export function AccountHeadsConfigPage() {
  const [heads, setHeads] = useState<AccountHead[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

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
      toast.success(
        !currentStatus ? 'Category Activated' : 'Category Disabled',
        `"${headName}" status changed to ${!currentStatus ? 'Active' : 'Disabled'}.`
      );
    } catch {
      toast.error('Update Failed', 'Could not toggle Account Head status.');
    }
  };

  const filteredHeads = heads.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <PermissionGuard permission="expenses:view" moduleName="Account Heads Master Catalog">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="account-heads"
          title="Expense Account Heads (Khata Catalog)"
          subtitle="Single-tier operational expense categories for property accounting and P&L financial statements"
        />

        {/* Action Header & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Tag className="h-5 w-5 text-indigo-700" />
                Account Heads Directory ({heads.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active categories are available when recording daily property operational expenses
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
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
                  className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-bold shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  Add New Account Head
                </Button>
              )}
            </div>
          </div>

          {/* Create Form inline card */}
          {isCreating && (
            <form onSubmit={handleCreate} className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-700" /> Register New Expense Account Head
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Head Name *</label>
                  <Input
                    placeholder="e.g. Generator Fuel & Diesel, Swimming Pool Servicing"
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
                  className="text-xs bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs bg-indigo-900 text-white hover:bg-indigo-950 font-bold gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Account Head</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Account Heads Table Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-700" />
              <span>Loading Account Heads Catalog...</span>
            </div>
          ) : filteredHeads.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No Account Heads found matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
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
                  {filteredHeads.map((head) => (
                    <tr key={head.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
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
                          {head.expenses_count || 0} items
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-rose-700 text-sm">
                        {formatPKR(parseFloat(String(head.total_spent_amount || 0)))}
                      </td>
                      <td className="p-4 text-center">
                        {head.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200">
                            <XCircle className="h-3 w-3 text-slate-400" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(head.id, head.is_active, head.name)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            head.is_active
                              ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                          }`}
                        >
                          {head.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          <span>{head.is_active ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
