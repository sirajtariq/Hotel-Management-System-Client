import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CreateRoomInput } from '@/types/rooms';
import { Property } from '@/types/properties';

const roomSchema = z.object({
  propertyId: z.string().min(1, 'Property required'),
  roomNumber: z.string().min(1, 'Room number required'),
  floor: z.coerce.number().min(1, 'Floor required'),
  type: z.enum(['single', 'double', 'deluxe', 'suite', 'penthouse', 'studio_apartment']),
  basePricePerNight: z.coerce.number().min(500, 'Price must be valid PKR'),
  capacity: z.coerce.number().min(1, 'Capacity required'),
  amenities: z.string(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomInput) => Promise<void>;
  properties?: Property[];
}

export function AddRoomModal({ isOpen, onClose, onSubmit, properties = [] }: AddRoomModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const defaultPropId = properties[0]?.id ? String(properties[0].id) : '1';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      propertyId: defaultPropId,
      roomNumber: '105',
      floor: 1,
      type: 'deluxe',
      basePricePerNight: 28000,
      capacity: 2,
      amenities: 'WiFi, AC, TV',
    },
  });

  const handleFormSubmit = async (values: RoomFormValues) => {
    setSubmitError(null);
    const formattedData: CreateRoomInput = {
      propertyId: values.propertyId,
      roomNumber: values.roomNumber,
      floor: values.floor,
      type: values.type,
      basePricePerNight: values.basePricePerNight,
      capacity: values.capacity,
      amenities: values.amenities.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      await onSubmit(formattedData);
      reset();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || 'Failed to create room.';
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
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Register a new room unit under selected property</DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium mt-1">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 mt-2">

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Target Property *</label>
            <Select {...register('propertyId')} className="text-xs font-medium">
              {properties.length > 0 ? (
                properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))
              ) : (
                <option value="1">Default Property</option>
              )}
            </Select>
            {errors.propertyId && <p className="text-[11px] text-rose-600">{errors.propertyId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Room Number</label>
              <Input {...register('roomNumber')} placeholder="105" className="text-xs font-mono" />
              {errors.roomNumber && <p className="text-[11px] text-rose-600">{errors.roomNumber.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Floor Level</label>
              <Input {...register('floor')} type="number" className="text-xs font-mono" />
              {errors.floor && <p className="text-[11px] text-rose-600">{errors.floor.message}</p>}
            </div>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Room Category</label>
              <Select {...register('type')} className="text-xs">
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Executive Suite</option>
                <option value="single">Single Standard</option>
                <option value="penthouse">Penthouse</option>
                <option value="studio_apartment">Studio Apartment</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Rate / Night (PKR)</label>
              <Input {...register('basePricePerNight')} type="number" className="text-xs font-mono" />
              {errors.basePricePerNight && <p className="text-[11px] text-rose-600">{errors.basePricePerNight.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Max Guest Capacity</label>
              <Input {...register('capacity')} type="number" className="text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Amenities (Comma separated)</label>
              <Input {...register('amenities')} placeholder="WiFi, AC, TV, Fridge" className="text-xs" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Room Unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
