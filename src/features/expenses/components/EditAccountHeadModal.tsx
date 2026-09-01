import React, { useState, useEffect } from 'react';
import { AccountHead } from '@/types/expenses';
import { expenseService } from '../services/expenseService';
import { toast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2, Edit3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface EditAccountHeadModalProps {
  accountHead: AccountHead | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditAccountHeadModal({
  accountHead,
  isOpen,
  onClose,
  onSuccess,
}: EditAccountHeadModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountHead) {
      setName(accountHead.name || '');
      setDescription(accountHead.description || '');
    }
  }, [accountHead]);

  if (!isOpen || !accountHead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Account Head name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await expenseService.updateAccountHead(accountHead.id, {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success('Account Head Updated', `Successfully updated "${updated.name}".`);
      queryClient.invalidateQueries({ queryKey: ['accountHeads'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update Account Head.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Edit Account Head</h2>
              <p className="text-xs text-slate-500 font-medium">Modify category name and description</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Head Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Generator Fuel & Diesel"
              className="text-xs bg-white"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of expenses under this category..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-indigo-900 hover:bg-indigo-950 text-white font-bold gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
