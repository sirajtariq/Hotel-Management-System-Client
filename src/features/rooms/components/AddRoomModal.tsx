import React, { useState, useEffect } from 'react';
import { AlertCircle, Building2, BedDouble, Layers, Users, DollarSign, Clock, Sparkles, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateRoomInput } from '@/types/rooms';
import { Property } from '@/types/properties';
import { roomService, RoomTypeSelectorItem } from '../services/roomService';
import { usePropertySelector } from '@/features/properties/hooks/usePropertySelector';
import { formatPKR } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomInput) => Promise<void>;
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

export function AddRoomModal({ isOpen, onClose, onSubmit, properties: propProps = [] }: AddRoomModalProps) {
  // Use React Query in-memory property selector hook for 0ms loading
  const { data: cachedProperties = [], isLoading: isLoadingProperties } = usePropertySelector();
  const properties = propProps.length > 0 ? propProps : cachedProperties;

  const [propertyId, setPropertyId] = useState<string>('');
  const [roomCategories, setRoomCategories] = useState<RoomTypeSelectorItem[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  const [roomNumber, setRoomNumber] = useState<string>('101');
  const [floor, setFloor] = useState<string>('1');
  const [basePricePerNight, setBasePricePerNight] = useState<number>(15000);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [isHourlyAllowed, setIsHourlyAllowed] = useState<boolean>(true);
  const [capacity, setCapacity] = useState<number>(2);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'AC', 'King Bed']);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize propertyId when modal opens or properties load
  useEffect(() => {
    if (isOpen) {
      const initialPropId = properties[0]?.id ? String(properties[0].id) : '';
      setPropertyId(initialPropId);
      setSubmitError(null);
    }
  }, [isOpen, properties]);

  // Dynamically load room categories whenever propertyId changes
  useEffect(() => {
    if (!isOpen || !propertyId) {
      setRoomCategories([]);
      setSelectedRoomTypeId('');
      return;
    }

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await roomService.getRoomTypeSelector(propertyId);
        setRoomCategories(data);

        if (data.length > 0) {
          handleCategoryChange(data[0], data);
        } else {
          setSelectedRoomTypeId('');
        }
      } catch (err) {
        console.error('Failed to load room categories for property:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, propertyId]);

  const handleCategoryChange = (categoryOrId: RoomTypeSelectorItem | string, categoriesList = roomCategories) => {
    const category = typeof categoryOrId === 'string'
      ? categoriesList.find((c) => String(c.id) === String(categoryOrId))
      : categoryOrId;

    if (category) {
      setSelectedRoomTypeId(String(category.id));
      const rate = category.basePricePerNight || category.base_price_per_night || category.basePrice || 0;
      setBasePricePerNight(rate);
      setCapacity(category.maxOccupancy || category.max_occupancy || 2);

      const hAllowed = category.isHourlyAllowed ?? category.is_hourly_allowed ?? true;
      setIsHourlyAllowed(hAllowed);

      const hRate = category.hourlyRate ?? category.hourly_rate ?? (hAllowed ? Math.round(rate * 0.25) : 0);
      setHourlyRate(hRate);

      // Inheritance Model: Auto-select category's default amenities chips
      if (category.amenities && category.amenities.length > 0) {
        setSelectedAmenities(category.amenities);
      } else {
        setSelectedAmenities(['WiFi', 'AC', 'Attached Bath']);
      }
    } else if (typeof categoryOrId === 'string') {
      setSelectedRoomTypeId(categoryOrId);
    }
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!propertyId) {
      setSubmitError('Please select a target property branch.');
      return;
    }
    if (!roomNumber.trim()) {
      setSubmitError('Room number is required.');
      return;
    }
    if (!selectedRoomTypeId) {
      setSubmitError('Please select or create a Room Category for this property.');
      return;
    }

    setIsSubmitting(true);

    try {
      const pIdNum = Number(propertyId);
      const rTypeIdNum = Number(selectedRoomTypeId);

      const formattedData: CreateRoomInput = {
        property: pIdNum,
        roomType: rTypeIdNum,
        roomNumber: roomNumber.trim(),
        floor: floor.trim() || '1',
        basePrice: basePricePerNight,
        hourlyRate: isHourlyAllowed ? hourlyRate : 0,
        isHourlyAllowed: isHourlyAllowed,
        status: 'AVAILABLE',
        housekeepingStatus: 'CLEAN',
        amenities: selectedAmenities,
      };

      await onSubmit(formattedData);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.message || err.message || 'Failed to create room unit.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Add New Room Unit</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Register a new room unit, select property branch & dynamic room category
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitError && (
          <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs mt-1">
          {/* Target Property */}
          <div className="space-y-1">
            <label className="font-semibold uppercase text-[11px] text-slate-600 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              <span>Target Property Branch *</span>
            </label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={isLoadingProperties}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 font-medium text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
              required
            >
              {isLoadingProperties ? (
                <option value="">Loading property branches...</option>
              ) : properties.length > 0 ? (
                properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city})
                  </option>
                ))
              ) : (
                <option value="">No properties available</option>
              )}
            </select>
          </div>

          {/* Dynamic Room Category Selector */}
          <div className="space-y-1">
            <label className="font-semibold uppercase text-[11px] text-slate-600 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              <span>Room Category / Type *</span>
            </label>

            <select
              value={selectedRoomTypeId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isLoadingCategories || roomCategories.length === 0}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 font-medium text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 disabled:bg-slate-50 disabled:text-slate-400"
              required
            >
              {isLoadingCategories ? (
                <option value="">Loading room categories...</option>
              ) : roomCategories.length > 0 ? (
                roomCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {formatPKR(c.basePricePerNight || c.base_price_per_night || 0)}/night
                  </option>
                ))
              ) : (
                <option value="">No room categories registered for this branch</option>
              )}
            </select>
          </div>

          {/* Room Number & Floor Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold uppercase text-[11px] text-slate-600">Room Number *</label>
              <Input
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. 101"
                className="text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase text-[11px] text-slate-600">Floor Level</label>
              <Input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. 1 or Ground"
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Rate per Night, Hourly Rate & Max Capacity */}
          <div className={cn("grid gap-3", isHourlyAllowed ? "grid-cols-3" : "grid-cols-2")}>
            <div className="space-y-1">
              <label className="font-semibold uppercase text-[11px] text-slate-600 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
                <span>Base Rate / Night (PKR)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={basePricePerNight}
                onChange={(e) => setBasePricePerNight(parseFloat(e.target.value) || 0)}
                className="text-xs font-mono font-bold text-slate-900"
              />
            </div>

            {isHourlyAllowed && (
              <div className="space-y-1">
                <label className="font-semibold uppercase text-[11px] font-bold text-amber-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Hourly Rate (PKR)</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono font-bold text-slate-900 border-amber-300 focus:border-amber-500 bg-amber-50/30"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold uppercase text-[11px] text-slate-600 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-indigo-600" />
                <span>Max Capacity</span>
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                step="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Interactive Amenities Chips Grid */}
          <div className="space-y-1.5 pt-1">
            <label className="font-semibold uppercase text-[11px] text-slate-600 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Unit Specific Amenities (Inherited from Category)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer select-none',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingCategories || !selectedRoomTypeId}
              className="text-xs font-semibold bg-indigo-900 hover:bg-indigo-950 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                'Add Room Unit'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
