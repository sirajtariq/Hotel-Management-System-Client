import React, { useState } from 'react';
import { Room, RoomStatus, HousekeepingStatus } from '@/types/rooms';
import { RoomStatusBadge } from './RoomStatusBadge';
import { formatPKR } from '@/lib/formatters';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
  X,
  BedDouble,
  Users,
  Moon,
  Clock,
  Sparkles,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkle,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Can } from '@/lib/rbac';

interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (roomId: string, newStatus: RoomStatus) => void;
  onHousekeepingChange?: (roomId: string, newHkStatus: HousekeepingStatus) => void;
  onDeleteRoom?: (roomId: string) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  isOpen,
  onClose,
  onStatusChange,
  onHousekeepingChange,
  onDeleteRoom,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  if (!isOpen || !room) return null;

  const roomTypeLabel = String(room?.room_type_name || room?.type || 'Standard Room').replace(/_/g, ' ');
  const roomPrice = room?.base_price ?? room?.basePricePerNight ?? 0;
  const hourlyRateVal = room?.hourly_rate ?? room?.hourlyRate ?? 0;
  const amenitiesList = Array.isArray(room?.amenities) ? room.amenities : [];
  const isOccupiedOrReserved = room.status === 'OCCUPIED' || room.status === 'RESERVED';
  const isAvailable = room.status === 'AVAILABLE';

  const hkStatusColors: Record<string, string> = {
    CLEAN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    clean: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    DIRTY: 'bg-rose-100 text-rose-800 border-rose-200',
    dirty: 'bg-rose-100 text-rose-800 border-rose-200',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
    INSPECTED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    inspected: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-mono font-bold text-lg shadow-xs shrink-0">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Room #{room.roomNumber}</h3>
                <RoomStatusBadge status={room.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Floor {room.floor} • {room.propertyName || 'Pearl Continental'}
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

        {/* Section 1: Specs & Pricing Strategy */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BedDouble className="h-4 w-4 text-indigo-600" />
            <span>Room Classification & Rates</span>
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Room Category
              </span>
              <span className="text-xs font-bold text-slate-900 capitalize block">
                {roomTypeLabel}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                <Users className="h-3 w-3 text-slate-400" />
                <span>Max {room.capacity || 2} Guests</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Housekeeping Status
              </span>
              <span
                className={cn(
                  'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border mt-0.5',
                  hkStatusColors[room.housekeeping_status || 'CLEAN'] || hkStatusColors.CLEAN
                )}
              >
                {room.housekeeping_status || 'CLEAN'}
              </span>
            </div>

            <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5 text-indigo-600" /> Nightly Rate
                </span>
              </div>
              <div className="text-sm font-extrabold text-indigo-950 font-mono">
                {formatPKR(roomPrice)} <span className="text-[10px] font-normal text-indigo-800">/night</span>
              </div>
            </div>

            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-600" /> Hourly Slot
                </span>
              </div>
              <div className="text-sm font-extrabold text-amber-950 font-mono">
                {room.is_hourly_allowed !== false
                  ? `${formatPKR(hourlyRateVal)} /hr`
                  : 'Disabled'}
              </div>
            </div>
          </div>

          {/* Amenities Tags */}
          {amenitiesList.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-indigo-500" /> Features & Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {amenitiesList.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200/60"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Current Occupancy & Guest Details (Conditional) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="h-4 w-4 text-indigo-600" />
            <span>Current Occupancy State</span>
          </h4>

          {isOccupiedOrReserved ? (
            <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">
                      {room.current_guest_name || 'In-House Guest'}
                    </h5>
                    <span className="text-[10px] font-semibold text-rose-700">
                      Booking #{room.active_booking_id || 'RES-1042'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                  {room.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-200/60 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Check-In</span>
                  <span className="font-bold flex items-center gap-1 text-slate-900">
                    <Calendar className="h-3 w-3 text-slate-400" /> Today, 02:00 PM
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Check-Out</span>
                  <span className="font-bold flex items-center gap-1 text-slate-900">
                    <Calendar className="h-3 w-3 text-slate-400" /> Tomorrow, 12:00 PM
                  </span>
                </div>
              </div>
            </div>
          ) : isAvailable ? (
            <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-emerald-950">Ready for Immediate Booking</h5>
                <p className="text-[11px] text-emerald-800 font-normal">
                  This room is clean and ready for instant front desk check-in or online reservation.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-amber-950">Room Out of Order / In Service</h5>
                <p className="text-[11px] text-amber-800 font-normal">
                  Currently undergoing housekeeping turnaround or maintenance work.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Quick Housekeeping Switcher */}
        {onHousekeepingChange && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Sparkle className="h-3 w-3 text-amber-500" /> Quick Housekeeping Status Switcher
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED'] as HousekeepingStatus[]).map((hk) => {
                const isSelected = room.housekeeping_status === hk;
                return (
                  <button
                    key={hk}
                    type="button"
                    onClick={() => onHousekeepingChange(room.id, hk)}
                    className={cn(
                      'py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer',
                      isSelected
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {hk.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Can permission="rooms:manage">
            {onDeleteRoom && (
              <>
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Delete Room</span>
                </button>
                <ConfirmModal
                  isOpen={isConfirmOpen}
                  onClose={() => setIsConfirmOpen(false)}
                  onConfirm={() => {
                    onDeleteRoom(room.id);
                  }}
                  title="Delete Room"
                  description={`Are you sure you want to delete Room #${room.roomNumber}? This action cannot be undone.`}
                  confirmText="Delete Room"
                  variant="danger"
                />
              </>
            )}
          </Can>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
