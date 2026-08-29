import { BedDouble, Users, Clock, Moon, Sparkles } from 'lucide-react';
import { RoomStatusBadge } from './RoomStatusBadge';
import { RoomStatusDropdown } from './RoomStatusDropdown';
import { Room, RoomStatus } from '@/types/rooms';
import { formatPKR } from '@/lib/formatters';
import { Can } from '@/lib/rbac';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
  onCardClick?: (room: Room) => void;
}

export function RoomCard({ room, onStatusChange, onCardClick }: RoomCardProps) {
  const roomTypeLabel = String(
    room?.room_type_name || (room as any)?.roomTypeName || room?.type || 'Standard Room'
  ).replace(/_/g, ' ');

  const nightlyRate = Number(room?.base_price ?? room?.basePricePerNight ?? (room as any)?.basePrice ?? 0);
  const hourlyRate = Number(room?.hourly_rate ?? room?.hourlyRate ?? 0);
  const isHourly = Boolean(room?.is_hourly_allowed ?? (room as any)?.isHourlyAllowed ?? true);

  const maxOccupancy = room?.capacity || (room as any)?.max_occupancy || (room as any)?.maxOccupancy || 2;
  const amenitiesList = Array.isArray(room?.amenities) ? room.amenities : [];

  const statusBorderColor: Record<string, string> = {
    AVAILABLE: 'border-l-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/20',
    available: 'border-l-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/20',
    OCCUPIED: 'border-l-rose-500 hover:border-rose-500 hover:bg-rose-50/20',
    occupied: 'border-l-rose-500 hover:border-rose-500 hover:bg-rose-50/20',
    CLEANING: 'border-l-amber-500 hover:border-amber-500 hover:bg-amber-50/20',
    cleaning: 'border-l-amber-500 hover:border-amber-500 hover:bg-amber-50/20',
    RESERVED: 'border-l-blue-500 hover:border-blue-500 hover:bg-blue-50/20',
    reserved: 'border-l-blue-500 hover:border-blue-500 hover:bg-blue-50/20',
    MAINTENANCE: 'border-l-slate-400 hover:border-slate-400 hover:bg-slate-50/30',
    maintenance: 'border-l-slate-400 hover:border-slate-400 hover:bg-slate-50/30',
  };

  const statusKey = (room?.status || 'AVAILABLE').toUpperCase() as RoomStatus;

  return (
    <div
      onClick={() => onCardClick && onCardClick(room)}
      className={cn(
        'group relative bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-l-4 flex flex-col justify-between select-none',
        statusBorderColor[statusKey] || 'border-l-indigo-600'
      )}
    >
      <div className="space-y-3">
        {/* Top Row: Room Number, Floor Pill & Status Dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 px-2.5 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center font-bold text-slate-900 text-sm font-mono shadow-2xs group-hover:scale-105 transition-transform">
              {room?.roomNumber || 'N/A'}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/50">
              Floor {room?.floor ?? 1}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <RoomStatusBadge status={room?.status || 'AVAILABLE'} />
            <Can permission="rooms:change_status">
              <RoomStatusDropdown
                currentStatus={room?.status || 'AVAILABLE'}
                onStatusChange={(status) => onStatusChange(room.id, status)}
              />
            </Can>
          </div>
        </div>

        {/* Middle Row: Room Type Name & Capacity */}
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-900 capitalize line-clamp-1 group-hover:text-indigo-900 transition-colors">
            {roomTypeLabel}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Max {maxOccupancy} Guests</span>
          </div>

          {/* Amenities Badges with +X counter */}
          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {amenitiesList.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                >
                  {amenity}
                </span>
              ))}
              {amenitiesList.length > 3 && (
                <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                  +{amenitiesList.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Nightly & Hourly Rates */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Nightly Rate</span>
          <span className="text-xs font-extrabold text-slate-900 font-mono">
            {formatPKR(nightlyRate)} <span className="text-[10px] text-slate-400 font-normal">/night</span>
          </span>
        </div>

        {isHourly && hourlyRate > 0 && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/60 font-mono">
              <Clock className="h-2.5 w-2.5 text-amber-600" />
              <span>⚡ {formatPKR(hourlyRate)}/hr</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
