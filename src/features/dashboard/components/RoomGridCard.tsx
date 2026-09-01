import React from 'react';
import { Room } from '@/types/rooms';
import { User, Sparkles, Wrench, CalendarClock, DoorOpen, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPKR } from '@/lib/formatters';

interface RoomGridCardProps {
  room: Room;
  onSelectRoom?: (room: Room) => void;
}

export function RoomGridCard({ room, onSelectRoom }: RoomGridCardProps) {
  const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
  const hkStatusUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();
  const isDirty = hkStatusUpper === 'DIRTY' || hkStatusUpper === 'DIRTY_ROOM';
  const isCleaning = statusUpper === 'CLEANING' || hkStatusUpper === 'IN_PROGRESS' || hkStatusUpper === 'CLEANING';
  const isOccupiedOrReserved = statusUpper === 'OCCUPIED' || statusUpper === 'RESERVED';

  const getThemeClasses = () => {
    switch (statusUpper) {
      case 'OCCUPIED':
        return 'border-blue-300 bg-blue-50/30 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5';
      case 'RESERVED':
        return 'border-amber-300 bg-amber-50/30 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5';
      case 'MAINTENANCE':
        return 'border-rose-300 bg-rose-50/30 hover:border-rose-500 hover:shadow-md hover:-translate-y-0.5';
      case 'CLEANING':
        return 'border-purple-300 bg-purple-50/30 hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5';
      case 'AVAILABLE':
      default:
        if (isCleaning) {
          return 'border-purple-300 bg-purple-50/30 hover:border-purple-500 hover:shadow-md hover:-translate-y-0.5';
        }
        if (isDirty) {
          return 'border-amber-400 bg-amber-50/40 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5';
        }
        return 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5';
    }
  };

  const renderUnifiedBadge = () => {
    if (statusUpper === 'OCCUPIED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-blue-100 text-blue-900 border border-blue-200 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Occupied
        </span>
      );
    }
    if (statusUpper === 'RESERVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
          <CalendarClock className="h-3 w-3 text-amber-700" />
          Reserved
        </span>
      );
    }
    if (statusUpper === 'MAINTENANCE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-rose-100 text-rose-900 border border-rose-200 shrink-0">
          <Wrench className="h-3 w-3 text-rose-700" />
          Maintenance
        </span>
      );
    }
    if (isCleaning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
          <Sparkles className="h-3 w-3 text-purple-700" />
          Cleaning In-Progress
        </span>
      );
    }
    if (isDirty) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-50 text-amber-900 border border-amber-400 shrink-0">
          <AlertTriangle className="h-3 w-3 text-amber-600" />
          Dirty / Needs Cleaning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
        <DoorOpen className="h-3 w-3 text-emerald-700" />
        Available & Ready
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelectRoom?.(room)}
      className={cn(
        'rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer group bg-white shadow-2xs min-h-[120px] relative overflow-hidden',
        getThemeClasses()
      )}
    >
      {/* Top Accent Strip for Dirty Rooms */}
      {statusUpper === 'AVAILABLE' && isDirty && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
      )}

      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-900 transition-colors">
              #{room.roomNumber}
            </span>
          </div>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold rounded-lg border border-slate-200 shrink-0">
            Fl {room.floor}
          </span>
        </div>

        {/* Room Type Subtitle */}
        <div className="text-slate-500 text-xs font-medium truncate mt-0.5 mb-2" title={room.room_type_name}>
          {room.room_type_name}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="pt-2 border-t border-slate-100/80 flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between gap-1">
          {renderUnifiedBadge()}
        </div>

        <div className="min-h-[18px] flex items-center justify-between text-xs pt-0.5">
          {isOccupiedOrReserved && room.current_guest_name ? (
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px] truncate" title={room.current_guest_name}>
              <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{room.current_guest_name}</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-800 tracking-tight">
              {formatPKR(room.base_price)} <span className="text-[10px] font-normal text-slate-400">/night</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
