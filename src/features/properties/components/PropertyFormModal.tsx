import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreatePropertyInput } from '@/types/properties';

const propertySchema = z.object({
  name: z.string().min(2, 'Property name is required'),
  code: z.string().min(2, 'Unique code is required'),
  type: z.enum(['hotel', 'serviced_apartment', 'resort', 'guesthouse']),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  totalRooms: z.coerce.number().min(1, 'At least 1 room required'),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePropertyInput) => Promise<void>;
}

export function PropertyFormModal({ isOpen, onClose, onSubmit }: PropertyFormModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'serviced_apartment',
      address: '',
      city: 'Karachi',
      totalRooms: 10,
    },
  });

  const handleFormSubmit = async (data: PropertyFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(data as CreatePropertyInput);
      reset();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || 'Failed to create property.';
      setSubmitError(msg);
    }
  };

  const handleModalClose = () => {
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>Register a new hotel or serviced apartment block to tenant account.</DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium mt-1">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 mt-2">

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Property Name</label>
            <Input {...register('name')} placeholder="Pearl Suites Gulberg" className="text-xs" />
            {errors.name && <p className="text-[11px] text-rose-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Property Code</label>
              <Input {...register('code')} placeholder="PS-01" className="text-xs uppercase" />
              {errors.code && <p className="text-[11px] text-rose-600">{errors.code.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Property Type</label>
              <Select {...register('type')} className="text-xs">
                <option value="serviced_apartment">Serviced Apartment</option>
                <option value="hotel">Boutique Hotel</option>
                <option value="resort">Resort</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">City</label>
              <Input {...register('city')} placeholder="Lahore / Karachi" className="text-xs" />
              {errors.city && <p className="text-[11px] text-rose-600">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Total Rooms</label>
              <Input {...register('totalRooms')} type="number" className="text-xs font-mono" />
              {errors.totalRooms && <p className="text-[11px] text-rose-600">{errors.totalRooms.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Physical Address</label>
            <Input {...register('address')} placeholder="Block 4, Clifton" className="text-xs" />
            {errors.address && <p className="text-[11px] text-rose-600">{errors.address.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Register Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
