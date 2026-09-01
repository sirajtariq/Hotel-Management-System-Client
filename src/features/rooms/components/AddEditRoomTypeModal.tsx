import React, { useState, useEffect } from 'react';
import { RoomTypeItem, CreateRoomTypeInput } from '../services/roomService';
import { Property } from '@/types/properties';
import { X, Moon, Clock, Users, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/ToastProvider';

interface AddEditRoomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoomTypeInput) => Promise<void>;
  editingType?: RoomTypeItem | null;
  properties?: Property[];
}

const AVAILABLE_AMENITIES = [
  'King Bed',
  'Single/Double Bed',
  'Balcony View',
  'Attached Luxury Bath',
  'AC',
  'WiFi',
  'TV',
  'Minibar',
  'Kitchenette',
  'Private Pool',
];

export function AddEditRoomTypeModal({
  isOpen,
  onClose,
  onSave,
  editingType,
  properties = [],
}: AddEditRoomTypeModalProps) {
  const [propertyId, setPropertyId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(2);
  const [baseRate, setBaseRate] = useState<number>(15000);
  const [isHourlyAllowed, setIsHourlyAllowed] = useState<boolean>(true);
  const [hourlyRate, setHourlyRate] = useState<number>(3750);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingType) {
      const pid = String(editingType.propertyId || (editingType as any).property_id || (editingType as any).property || properties[0]?.id || '');
      setPropertyId(pid);
      setName(editingType.name || '');
      setCode(editingType.code || '');
      setDescription(editingType.description || '');
      setCapacity(editingType.capacity || 2);
      setBaseRate(editingType.baseRate || editingType.base_price_per_night || 0);
      setIsHourlyAllowed(editingType.is_hourly_allowed ?? true);
      setHourlyRate(editingType.hourlyRate || editingType.hourly_rate || Math.round(((editingType.baseRate || editingType.base_price_per_night || 0) * 0.25)));
      setSelectedAmenities(editingType.amenities || ['WiFi', 'AC']);
    } else {
      const pid = properties[0]?.id ? String(properties[0].id) : '';
      setPropertyId(pid);
      setName('');
      setCode('');
      setDescription('');
      setCapacity(2);
      setBaseRate(15000);
      setIsHourlyAllowed(true);
      setHourlyRate(3750);
      setSelectedAmenities(['WiFi', 'AC', 'King Bed']);
    }
  }, [editingType, isOpen, properties]);

  if (!isOpen) return null;

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const pIdVal = propertyId || (properties[0]?.id ? String(properties[0].id) : undefined);
    const pIdNum = pIdVal ? Number(pIdVal) : undefined;

    setIsSubmitting(true);
    try {
    await onSave({
        property: pIdNum,
        name: name.trim(),
        code: code.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        max_occupancy: capacity,
        base_price_per_night: baseRate,
        is_hourly_allowed: isHourlyAllowed,
        hourly_rate: isHourlyAllowed ? hourlyRate : 0,
        amenities: selectedAmenities,
      });
      onClose();
    } catch (err: any) {
      toast.error('Category Save Failed', err.message || 'Could not save room category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Moon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {editingType ? 'Edit Room Category & Rates' : 'Add New Room Category'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Define room classification, base rates, capacity, and short-stay options
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Linked Property Selector */}
          {properties.length > 0 && (
            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Linked Property Branch *
              </label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Room Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deluxe Master Bed, Executive Suite"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-slate-500 mb-1">
                Code / Tag
              </label>
              <input
                type="text"
                placeholder="e.g. DLX-K"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1">
              Category Description
            </label>
            <textarea
              rows={2}
              placeholder="Summary of room layout, bed size, view, and unique guest perks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-600" />
              <span>Max Guest Capacity</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 text-xs"
              />
              <span className="text-slate-500 font-medium">Guests / Persons</span>
            </div>
          </div>

          {/* Rates Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
            <div>
              <label className="block font-semibold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span>Nightly Base Rate (PKR) *</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={baseRate}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                  setBaseRate(val);
                  setHourlyRate(Math.round(val * 0.25));
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Allow Hourly Toggle */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Allow Hourly Short Stay Booking
                </span>
                <p className="text-[11px] text-slate-500 font-normal">
                  Enable short duration hourly slot bookings for this category
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHourlyAllowed(!isHourlyAllowed)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative p-0.5 border cursor-pointer',
                  isHourlyAllowed ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-full bg-white transition-transform shadow-xs',
                    isHourlyAllowed ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Conditional Hourly Rate Input */}
            {isHourlyAllowed && (
              <div className="pt-1">
                <label className="block font-semibold uppercase text-slate-500 mb-1">
                  Hourly Rate (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                    setHourlyRate(val);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-amber-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>

          {/* Amenities Tag Picker */}
          <div>
            <label className="block font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Room Features & Amenities</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : editingType ? 'Update Category' : 'Save Room Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
