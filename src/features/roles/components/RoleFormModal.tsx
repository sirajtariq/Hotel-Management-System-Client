import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, CheckSquare, Square, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleItem, PermissionCatalog, CreateRolePayload, UpdateRolePayload } from '@/types/roles';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRolePayload | UpdateRolePayload) => Promise<void>;
  initialData?: RoleItem | null;
  availablePermissions: PermissionCatalog;
  isSubmitting: boolean;
}

export function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  availablePermissions,
  isSubmitting,
}: RoleFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setSelectedPermissions(new Set(initialData.permissions || []));
    } else {
      setName('');
      setDescription('');
      setSelectedPermissions(new Set());
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleTogglePermission = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleToggleCategory = (categoryCodes: string[]) => {
    const allSelected = categoryCodes.every((code) => selectedPermissions.has(code));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        categoryCodes.forEach((code) => next.delete(code));
      } else {
        categoryCodes.forEach((code) => next.add(code));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }

    if (selectedPermissions.size === 0) {
      setError('Please select at least one permission for this role.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        permissions: Array.from(selectedPermissions),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save role.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {initialData ? 'Edit Custom Role & Permissions' : 'Create New Custom Staff Role'}
                {initialData?.is_system && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> System Role
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configure module-level view & mutation permissions dynamically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Role details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Role Title / Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Senior Receptionist"
                className="text-xs font-semibold"
                disabled={initialData?.is_system}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Description / Responsibilities</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Can view rooms, create walk-ins, and record payments."
                className="text-xs"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Permission Matrix Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Module Permission Matrix ({selectedPermissions.size} selected)
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(availablePermissions).map(([category, items]) => {
                const categoryCodes = items.map((item) => item.code);
                const allSelected = categoryCodes.every((code) => selectedPermissions.has(code));
                const someSelected = categoryCodes.some((code) => selectedPermissions.has(code));

                return (
                  <div key={category} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/70 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">{category}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(categoryCodes)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        {allSelected ? (
                          <CheckSquare className="h-3.5 w-3.5" />
                        ) : (
                          <Square className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                      </button>
                    </div>

                    {/* Permissions list */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white">
                      {items.map((item) => {
                        const isChecked = selectedPermissions.has(item.code);
                        return (
                          <label
                            key={item.code}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(item.code)}
                              className="mt-0.5 rounded-xs border-slate-300 text-indigo-600 focus:ring-indigo-600 h-3.5 w-3.5"
                            />
                            <div className="text-xs leading-tight">
                              <div className="font-semibold text-slate-900">{item.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Selected: <span className="font-bold text-slate-900">{selectedPermissions.size} permissions</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs font-semibold bg-indigo-900 hover:bg-indigo-950">
                {isSubmitting ? 'Saving...' : initialData ? 'Update Role' : 'Create Custom Role'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
