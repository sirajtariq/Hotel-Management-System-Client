import React, { useState } from 'react';
import { RoomTypeItem } from '../services/roomService';
import { formatPKR } from '@/lib/formatters';
import {
  Moon,
  Clock,
  Users,
  Edit,
  Trash2,
  Building2,
  Sparkles,
  BedDouble,
  Bath,
  Wind,
  Wifi,
  Tv,
  Eye,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomTypeCardProps {
  roomType: RoomTypeItem;
  assignedRoomsCount?: number;
  onEdit: (roomType: RoomTypeItem) => void;
  onDelete: (id: string | number, name: string) => void;
  onToggleActive?: (id: string | number, active: boolean) => void;
}

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
  'King Bed': <BedDouble className="h-3 w-3 text-indigo-500" />,
  'Single/Double Bed': <BedDouble className="h-3 w-3 text-indigo-500" />,
  'Single Bed': <BedDouble className="h-3 w-3 text-indigo-500" />,
  'Attached Luxury Bath': <Bath className="h-3 w-3 text-cyan-500" />,
  'Attached Bath': <Bath className="h-3 w-3 text-cyan-500" />,
  'Jacuzzi': <Bath className="h-3 w-3 text-cyan-600" />,
  'AC': <Wind className="h-3 w-3 text-blue-500" />,
  'WiFi': <Wifi className="h-3 w-3 text-emerald-500" />,
  'TV': <Tv className="h-3 w-3 text-purple-500" />,
  'Smart TV': <Tv className="h-3 w-3 text-purple-500" />,
  'Balcony View': <Eye className="h-3 w-3 text-amber-500" />,
  'Balcony': <Eye className="h-3 w-3 text-amber-500" />,
  'City View': <Eye className="h-3 w-3 text-amber-500" />,
  'Minibar': <Coffee className="h-3 w-3 text-orange-500" />,
  'Mini Fridge': <Coffee className="h-3 w-3 text-orange-500" />,
  'Kitchenette': <Coffee className="h-3 w-3 text-orange-500" />,
};

export function RoomTypeCard({
  roomType,
  assignedRoomsCount = 4,
  onEdit,
  onDelete,
  onToggleActive,
}: RoomTypeCardProps) {
  const [isActive, setIsActive] = useState(roomType.is_active !== false);

  const amenitiesList = Array.isArray(roomType.amenities) ? roomType.amenities : [];
  const baseRateVal = Number(
    roomType.basePricePerNight ||
    roomType.baseRate ||
    roomType.basePrice ||
    roomType.base_price_per_night ||
    roomType.base_price ||
    0
  );

  const hourlyRateVal = Number(
    roomType.hourlyRate ||
    roomType.hourly_rate ||
    Math.round(baseRateVal * 0.25)
  );
  const isHourlyAllowed = roomType.is_hourly_allowed !== false && roomType.isHourlyAllowed !== false;

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    if (onToggleActive) {
      onToggleActive(roomType.id, nextState);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative select-none font-sans">
      <div className="space-y-3.5">
        {/* A. Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                {roomType.name}
              </h3>
              {roomType.code && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 font-mono border border-slate-200/60 uppercase">
                  {roomType.code}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {roomType.description || 'Standard luxury guest accommodations with modern amenities.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Max Capacity Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>Max {roomType.capacity || roomType.maxOccupancy || 2} Guests</span>
            </span>

            {/* Edit / Delete Icon Buttons */}
            <div className="flex items-center gap-0.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => onEdit(roomType)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white shadow-2xs transition-all cursor-pointer"
                title="Edit Category & Rates"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(roomType.id, roomType.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white shadow-2xs transition-all cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* B. Amenities Chips */}
        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {amenitiesList.map((amenity, i) => {
              const icon = AMENITY_ICON_MAP[amenity] || <Sparkles className="h-3 w-3 text-indigo-500" />;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200/60 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                >
                  {icon}
                  <span>{amenity}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* C. Dual Rate Comparison Box */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 my-3 grid grid-cols-2 gap-3">
          {/* Column 1: Nightly Rate */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200/50 shadow-2xs">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Moon className="h-3 w-3 text-indigo-600" />
              <span>NIGHTLY STAY</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                {formatPKR(parseFloat(String(baseRateVal)))}
              </span>
              <span className="text-[11px] font-medium text-slate-500">/night</span>
            </div>
          </div>

          {/* Column 2: Hourly Rate */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200/50 shadow-2xs">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-600" />
              <span>HOURLY SHORT-STAY</span>
            </div>
            {isHourlyAllowed ? (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {formatPKR(parseFloat(String(hourlyRateVal)))}
                </span>
                <span className="text-[11px] font-medium text-slate-500">/hr</span>
              </div>
            ) : (
              <span className="text-xs font-medium text-slate-400 italic block pt-0.5">
                Not Allowed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* D. Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        {/* Left: Active Toggle Switch */}
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 cursor-pointer group/toggle select-none"
        >
          <span
            className={cn(
              'w-8 h-4.5 rounded-full transition-colors relative p-0.5 border',
              isActive ? 'bg-emerald-600 border-emerald-600' : 'bg-slate-200 border-slate-300'
            )}
          >
            <div
              className={cn(
                'w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-xs',
                isActive ? 'translate-x-3.5' : 'translate-x-0'
              )}
            />
          </span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            {isActive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-700">Active</span>
              </>
            ) : (
              <span className="text-slate-400 font-medium">Inactive</span>
            )}
          </span>
        </button>

        {/* Right: Assigned Rooms Badge & Edit Rates Button */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{assignedRoomsCount} Rooms</span>
          </span>

          <button
            type="button"
            onClick={() => onEdit(roomType)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Edit Rates
          </button>
        </div>
      </div>
    </div>
  );
}
