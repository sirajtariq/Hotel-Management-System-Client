import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Booking, AddExtraChargeInput } from '@/types/bookings';
import { Plus, Receipt, Loader2, AlertCircle } from 'lucide-react';
import { formatPKR } from '@/lib/formatters';

interface AddExtraChargeModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddExtraChargeInput) => Promise<void>;
}

export function AddExtraChargeModal({ booking, isOpen, onClose, onSubmit }: AddExtraChargeModalProps) {
  const [chargeName, setChargeName] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = chargeName.trim();
    if (!name) {
      setErrorMsg('Please provide a description for the charge.');
      return;
    }

    if (chargeAmount <= 0) {
      setErrorMsg('Charge amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: String(booking.id),
        name,
        amount: chargeAmount,
      });
      // Reset form
      setChargeName('');
      setChargeAmount(0);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post extra charge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white p-0 overflow-hidden font-sans rounded-2xl border border-slate-100 shadow-2xl">
        <div className="p-5 border-b border-slate-100 flex items-start gap-4 bg-slate-50/50">
          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="pt-1">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Post Extra Charge</DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 mt-0.5">
              Room {booking.roomNumber} • {booking.guest.fullName}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Charge Description</label>
              <Input
                value={chargeName}
                onChange={(e) => setChargeName(e.target.value)}
                placeholder="e.g., Laundry, Mini-Bar, Broken Item"
                className="bg-white text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Amount (PKR)</label>
              <Input
                type="number"
                min="1"
                value={chargeAmount || ''}
                onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="bg-white font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold h-9 px-4 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-indigo-900 hover:bg-indigo-950 text-white font-bold h-9 px-5 gap-1.5 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {isSubmitting ? 'Posting...' : 'Post Charge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
