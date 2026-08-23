import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreateStaffInput } from '@/types/staff';

const staffSchema = z.object({
  propertyId: z.string().min(1, 'Property required'),
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Phone number required'),
  role: z.enum(['manager', 'receptionist', 'housekeeping', 'maintenance', 'security']),
  salary: z.coerce.number().min(10000, 'Salary must be valid PKR'),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffInput) => Promise<void>;
}

export function AddStaffModal({ isOpen, onClose, onSubmit }: AddStaffModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      propertyId: 'prop_01',
      role: 'receptionist',
      salary: 60000,
    },
  });

  const handleFormSubmit = async (data: StaffFormValues) => {
    await onSubmit(data as CreateStaffInput);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register Staff Member</DialogTitle>
          <DialogDescription>Add hotel staff member to duty roster</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 mt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <Input {...register('fullName')} placeholder="Tariq Mahmood" className="text-xs" />
            {errors.fullName && <p className="text-[11px] text-rose-600">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <Input {...register('email')} type="email" placeholder="tariq@hotel.com" className="text-xs" />
              {errors.email && <p className="text-[11px] text-rose-600">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <Input {...register('phone')} placeholder="+92 300 0000000" className="text-xs font-mono" />
              {errors.phone && <p className="text-[11px] text-rose-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Role / Position</label>
              <Select {...register('role')} className="text-xs">
                <option value="manager">Property Manager</option>
                <option value="receptionist">Front Desk Receptionist</option>
                <option value="housekeeping">Housekeeping Staff</option>
                <option value="maintenance">Maintenance Engineer</option>
                <option value="security">Security Officer</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Monthly Salary (PKR)</label>
              <Input {...register('salary')} type="number" className="text-xs font-mono font-semibold" />
              {errors.salary && <p className="text-[11px] text-rose-600">{errors.salary.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
