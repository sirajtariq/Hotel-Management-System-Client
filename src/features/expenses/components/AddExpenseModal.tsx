import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreateExpenseInput } from '@/types/expenses';

const expenseSchema = z.object({
  propertyId: z.string().min(1, 'Property required'),
  title: z.string().min(2, 'Title required'),
  category: z.enum(['utilities', 'maintenance', 'supplies', 'salaries', 'marketing', 'taxes', 'miscellaneous']),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date required'),
  paidTo: z.string().min(2, 'Vendor/Payee required'),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
}

export function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      propertyId: 'prop_01',
      category: 'utilities',
      date: new Date().toISOString().split('T')[0],
      amount: 15000,
    },
  });

  const handleFormSubmit = async (data: ExpenseFormValues) => {
    await onSubmit(data as CreateExpenseInput);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Operating Expense</DialogTitle>
          <DialogDescription>Record property operational expenditure in PKR</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Expense Title</label>
            <Input {...register('title')} placeholder="Electricity Bill / AC Servicing" className="text-xs" />
            {errors.title && <p className="text-[11px] text-rose-600">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <Select {...register('category')} className="text-xs">
                <option value="utilities">Power & Utilities</option>
                <option value="maintenance">Facility Maintenance</option>
                <option value="supplies">Housekeeping Supplies</option>
                <option value="salaries">Staff Wages / Salary</option>
                <option value="marketing">Marketing & OTA Ads</option>
                <option value="taxes">Local Property Taxes</option>
                <option value="miscellaneous">Miscellaneous</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Amount (PKR)</label>
              <Input {...register('amount')} type="number" className="text-xs font-mono font-semibold" />
              {errors.amount && <p className="text-[11px] text-rose-600">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Paid To / Vendor</label>
              <Input {...register('paidTo')} placeholder="Vendor Name" className="text-xs" />
              {errors.paidTo && <p className="text-[11px] text-rose-600">{errors.paidTo.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Receipt / Ref #</label>
              <Input {...register('receiptNumber')} placeholder="OPT-1029" className="text-xs font-mono" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Date Paid</label>
            <Input {...register('date')} type="date" className="text-xs" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
