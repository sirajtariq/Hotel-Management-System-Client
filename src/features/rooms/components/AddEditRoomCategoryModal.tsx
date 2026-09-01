import React, { useState, useEffect } from 'react';
import { RoomTypeItem, CreateRoomTypeInput } from '../services/roomService';
import { Property } from '@/types/properties';
import { formatPKR } from '@/lib/formatters';
import { X, Moon, Clock, Users, Sparkles, Check, Building2, AlignLeft, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils';

import { usePropertySelector } from '@/features/properties/hooks/usePropertySelector';

interface AddEditRoomCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRoomTypeInput) => Promise<void>;
  editingType?: RoomTypeItem | null;
  properties?: Property[];
}

const PRESET_AMENITIES = [
  'King Bed',
  'Single Bed',
  'Attached Bath',
  'Jacuzzi',
  'AC',
  'WiFi',
  'Balcony',
  'Mini Fridge',
  'Room Heater',
  'City View',
  'Smart TV',
  'Kitchenette',
];

export function AddEditRoomCategoryModal({
  isOpen,
  onClose,
  onSave,
  editingType,
  properties: propProps = [],
}: AddEditRoomCategoryModalProps) {
  const { data: cachedProperties = [] } = usePropertySelector();
  const properties = propProps.length > 0 ? propProps : cachedProperties;

  const [propertyId, setPropertyId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(2);
  const [baseRate, setBaseRate] = useState<number>(18000);
  const [isHourlyAllowed, setIsHourlyAllowed] = useState<boolean>(true);
  const [hourlyRate, setHourlyRate] = useState<number>(4500);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingType) {
      const pid = String(editingType.propertyId || (editingType as any).property_id || (editingType as any).property || properties[0]?.id || '');
      setPropertyId(pid);
      setName(editingType.name || '');
      setCode(editingType.code || '');
      setDescription(editingType.description || '');
      setCapacity(editingType.capacity || editingType.maxOccupancy || 2);
      const baseP = editingType.baseRate || editingType.basePrice || editingType.basePricePerNight || editingType.base_price_per_night || 0;
      setBaseRate(baseP);
      setIsHourlyAllowed(editingType.is_hourly_allowed ?? editingType.isHourlyAllowed ?? true);
      setHourlyRate(editingType.hourlyRate || editingType.hourly_rate || Math.round(baseP * 0.25));
      setSelectedAmenities(editingType.amenities || ['WiFi', 'AC', 'King Bed']);
    } else {
      const pid = properties[0]?.id ? String(properties[0].id) : '';
      setPropertyId(pid);
      setName('');
      setCode('');
      setDescription('');
      setCapacity(2);
      setBaseRate(18000);
      setIsHourlyAllowed(true);
      setHourlyRate(4500);
      setSelectedAmenities(['WiFi', 'AC', 'King Bed', 'Attached Bath']);
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
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {editingType ? 'Edit Room Category & Rate Plan' : 'Create Room Category'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Configure room classification, occupancy limits, dual nightly & hourly pricing tiers, and amenities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Column Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Pricing & Occupancy */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Moon className="h-4 w-4 text-indigo-600" />
                <span>Basic Specs & Pricing Tiers</span>
              </h4>

              {/* Linked Property Selector */}
              {properties.length > 0 && (
                <div>
                  <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Linked Property Branch *</span>
                  </label>
                  <select
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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

              {/* Category Name & Code */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Presidential Suite"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-1">
                    Code / Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EXEC-P"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Max Occupancy */}
              <div>
                <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Max Guest Occupancy</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                    className="w-28 px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 text-xs text-center"
                  />
                  <span className="text-xs text-slate-500 font-medium">Persons / Guests</span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold uppercase text-[11px] text-slate-700 flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Base Nightly Rate (PKR) *</span>
                    </label>
                    <span className="text-xs font-extrabold text-indigo-900 font-mono">
                      {formatPKR(baseRate)}
                    </span>
                  </div>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Enable Hourly Short-Stay Toggle */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Enable Hourly Short-Stay
                    </span>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Allow short-duration slot bookings for this category
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsHourlyAllowed(!isHourlyAllowed)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative p-0.5 border cursor-pointer shrink-0',
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold uppercase text-[11px] text-amber-900">
                        Hourly Short-Stay Rate (PKR)
                      </label>
                      <span className="text-xs font-bold text-amber-900 font-mono">
                        {formatPKR(hourlyRate)} /hr
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={hourlyRate}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                        setHourlyRate(val);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-amber-950 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Amenities & Description */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Features & Category Perks</span>
              </h4>

              {/* Amenities Tags Selector Grid */}
              <div>
                <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-2">
                  Amenities Preset Chips
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleToggleAmenity(amenity)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none',
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

              {/* Category Description */}
              <div>
                <label className="block font-semibold uppercase text-[11px] text-slate-500 mb-1 flex items-center gap-1">
                  <AlignLeft className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Category Overview & Features</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Summarize room layout, bed size, scenic view, and executive perks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition-all hover:shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : editingType ? 'Save Category & Rates' : 'Create Room Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
