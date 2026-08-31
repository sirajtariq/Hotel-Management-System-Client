import React from 'react';
import { Room } from '@/types/rooms';
import { User, ShieldAlert, Sparkles, Wrench, CalendarClock, DoorOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPKR } from '@/lib/formatters';

interface RoomGridCardProps {
  room: Room;
  onSelectRoom?: (room: Room) => void;
}

export function RoomGridCard({ room, onSelectRoom }: RoomGridCardProps) {
  const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
  const hkStatusUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();

  const getThemeClasses = () => {
    switch (statusUpper) {
      case 'OCCUPIED':
        return 'border-blue-300/90 bg-blue-50/20 hover:border-blue-500 hover:shadow-xs';
      case 'RESERVED':
        return 'border-amber-300/90 bg-amber-50/20 hover:border-amber-500 hover:shadow-xs';
      case 'CLEANING':
        return 'border-purple-300/90 bg-purple-50/20 hover:border-purple-500 hover:shadow-xs';
      case 'MAINTENANCE':
        return 'border-rose-300/90 bg-rose-50/20 hover:border-rose-500 hover:shadow-xs';
      case 'AVAILABLE':
      default:
        return 'border-emerald-300/90 bg-emerald-50/20 hover:border-emerald-500 hover:shadow-xs';
    }
  };

  const renderStatusBadge = () => {
    switch (statusUpper) {
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200/80 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Occupied
          </span>
        );
      case 'RESERVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200/80 shrink-0">
            <CalendarClock className="h-2.5 w-2.5 text-amber-700" />
            Reserved
          </span>
        );
      case 'CLEANING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200/80 shrink-0">
            <Sparkles className="h-2.5 w-2.5 text-purple-700" />
            Cleaning
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200/80 shrink-0">
            <Wrench className="h-2.5 w-2.5 text-rose-700" />
            Maintenance
          </span>
        );
      case 'AVAILABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 shrink-0">
            <DoorOpen className="h-2.5 w-2.5 text-emerald-700" />
            Available
          </span>
        );
    }
  };

  const renderHousekeepingPill = () => {
    switch (hkStatusUpper) {
      case 'DIRTY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 shrink-0">
            • Dirty
          </span>
        );
      case 'IN_PROGRESS':
      case 'CLEANING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0">
            • Cleaning
          </span>
        );
      case 'INSPECTED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 shrink-0">
            • Inspected
          </span>
        );
      case 'CLEAN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
            • Clean
          </span>
        );
    }
  };

  const isOccupiedOrReserved = statusUpper === 'OCCUPIED' || statusUpper === 'RESERVED';

  return (
    <div
      onClick={() => onSelectRoom?.(room)}
      className={cn(
        'rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.01] bg-white shadow-2xs min-h-[110px]',
        getThemeClasses()
      )}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-900 transition-colors">
              #{room.roomNumber}
            </span>
          </div>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px] font-semibold rounded-md border border-slate-200/80 shrink-0">
            Fl {room.floor}
          </span>
        </div>

        {/* Room Type Subtitle */}
        <div className="text-slate-500 text-[11px] font-medium truncate mt-0.5 mb-2" title={room.room_type_name}>
          {room.room_type_name}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
        <div className="flex items-center justify-between gap-1">
          {renderStatusBadge()}
          {!isOccupiedOrReserved && renderHousekeepingPill()}
        </div>

        <div className="min-h-[18px] flex items-center justify-between text-xs">
          {isOccupiedOrReserved && room.current_guest_name ? (
            <div className="flex items-center gap-1 text-slate-800 font-medium text-[11px] truncate" title={room.current_guest_name}>
              <User className="h-3 w-3 text-slate-500 shrink-0" />
              <span className="truncate">{room.current_guest_name}</span>
            </div>
          ) : (
            <div className="text-[11px] font-semibold text-slate-700 tracking-tight">
              {formatPKR(room.base_price)} <span className="text-[10px] font-normal text-slate-400">/nt</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
