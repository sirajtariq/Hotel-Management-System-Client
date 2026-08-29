import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
      onClose();
    }
  };

  const loading = isLoading || internalLoading;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <Trash2 className="h-5 w-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            <AlertTriangle className="h-5 w-5" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
            <Info className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-md p-6 gap-5 rounded-2xl border border-slate-200 shadow-2xl">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="space-y-1.5 pt-0.5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg text-slate-700 font-medium hover:bg-slate-50 border-slate-200"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'destructive' : 'default'}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg font-semibold shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
