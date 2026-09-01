import React, { useState } from 'react';
import { Room, RoomStatus, HousekeepingStatus } from '@/types/rooms';
import { RoomStatusBadge } from './RoomStatusBadge';
import { formatPKR } from '@/lib/formatters';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useNavigate } from 'react-router-dom';
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
  Sparkle,
  Trash2,
  PlusCircle,
  Wrench,
  ArrowRight,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';

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
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showDirtyWarningPrompt, setShowDirtyWarningPrompt] = useState(false);

  if (!isOpen || !room) return null;

  const roomTypeLabel = String(room?.room_type_name || room?.type || 'Standard Room').replace(/_/g, ' ');
  const roomPrice = room?.base_price ?? room?.basePricePerNight ?? 0;
  const hourlyRateVal = room?.hourly_rate ?? room?.hourlyRate ?? 0;
  const amenitiesList = Array.isArray(room?.amenities) ? room.amenities : [];
  
  const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
  const hkUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();
  const isOccupiedOrReserved = statusUpper === 'OCCUPIED' || statusUpper === 'RESERVED';
  const isAvailable = statusUpper === 'AVAILABLE';
  const isDirty = hkUpper === 'DIRTY' || hkUpper === 'DIRTY_ROOM';
  const isMaintenance = statusUpper === 'MAINTENANCE';

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

  const handleStartBookingClick = () => {
    if (isDirty) {
      setShowDirtyWarningPrompt(true);
    } else {
      onClose();
      navigate(`/bookings?roomId=${room.id}`);
    }
  };

  const handleMarkCleanAndProceed = async () => {
    if (onHousekeepingChange) {
      await onHousekeepingChange(room.id, 'CLEAN');
      toast.success('Room Marked Clean', `Room #${room.roomNumber} is now Clean.`);
    }
    setShowDirtyWarningPrompt(false);
    onClose();
    navigate(`/bookings?roomId=${room.id}`);
  };

  const handleProceedOverride = () => {
    setShowDirtyWarningPrompt(false);
    onClose();
    navigate(`/bookings?roomId=${room.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-mono font-bold text-lg shadow-sm shrink-0">
              {room.roomNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Room #{room.roomNumber}</h3>
                <RoomStatusBadge status={room.status} housekeepingStatus={room.housekeeping_status} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Floor {room.floor} • {room.propertyName || 'Pearl Continental'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Operational Warning Prompt when attempting Check-In on a Dirty Room */}
        {showDirtyWarningPrompt && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-300 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <h5 className="font-extrabold text-xs text-amber-950">Room Needs Housekeeping (Dirty)</h5>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed font-medium">
                  Room #{room.roomNumber} is currently marked as <strong>DIRTY</strong>. Front desk policy recommends marking rooms clean before guest check-in.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-amber-200/80">
              <button
                type="button"
                onClick={handleMarkCleanAndProceed}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer flex-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Clean & Check-In</span>
              </button>
              <button
                type="button"
                onClick={handleProceedOverride}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>Proceed Anyway</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDirtyWarningPrompt(false)}
                className="px-3 py-2 rounded-xl border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100/60 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Primary Operational Action Flow Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Operational Quick Action
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {isAvailable && (
              <>
                <button
                  type="button"
                  onClick={handleStartBookingClick}
                  className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer flex-1 justify-center"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Book / Check-In Room #{room.roomNumber}</span>
                </button>

                {onStatusChange && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(room.id, 'MAINTENANCE')}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Set Maintenance</span>
                  </button>
                )}
              </>
            )}

            {isOccupiedOrReserved && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer w-full"
              >
                <span>View Booking & Guest Ledger</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {isMaintenance && onStatusChange && (
              <button
                type="button"
                onClick={() => onStatusChange(room.id, 'AVAILABLE')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer w-full"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Restore Room to Operational / Available</span>
              </button>
            )}
          </div>
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
              <span className="text-xs font-bold text-slate-900 capitalize block truncate">
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
                {String(room.housekeeping_status).toUpperCase() === 'IN_PROGRESS' ? 'CLEANING' : (room.housekeeping_status || 'CLEAN')}
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

        {/* Section 2: Current Occupancy & Guest Details */}
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
                    <Calendar className="h-3 w-3 text-slate-400" /> Active Stay
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Check-Out</span>
                  <span className="font-bold flex items-center gap-1 text-slate-900">
                    <Calendar className="h-3 w-3 text-slate-400" /> Scheduled
                  </span>
                </div>
              </div>
            </div>
          ) : isAvailable && isDirty ? (
            <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200/80 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-rose-950">Room Requires Housekeeping (Dirty)</h5>
                <p className="text-[11px] text-rose-800 font-normal">
                  This room is currently dirty. Housekeeping turnaround is required before front desk check-in.
                </p>
              </div>
            </div>
          ) : isAvailable && (hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING') ? (
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-amber-950">Housekeeping Cleaning In-Progress</h5>
                <p className="text-[11px] text-amber-800 font-normal">
                  Housekeeping staff is currently cleaning this room unit.
                </p>
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
                <h5 className="font-bold text-xs text-amber-950">Room Out of Order / Maintenance</h5>
                <p className="text-[11px] text-amber-800 font-normal">
                  Currently undergoing maintenance or technical repairs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Dual Status Quick Switchers */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Housekeeping Switcher */}
          {onHousekeepingChange && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkle className="h-3 w-3 text-amber-500" /> Housekeeping Status Switcher
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED'] as HousekeepingStatus[]).map((hk) => {
                  const isSelected = room.housekeeping_status === hk;
                  const label = hk === 'IN_PROGRESS' || hk === 'in_progress' ? 'CLEANING' : hk.replace('_', ' ');
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
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Room Operational Status Switcher */}
          {onStatusChange && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Wrench className="h-3 w-3 text-indigo-500" /> Room Status Switcher
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['AVAILABLE', 'CLEANING', 'MAINTENANCE'] as RoomStatus[]).map((st) => {
                  const isSelected = statusUpper === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onStatusChange(room.id, st)}
                      className={cn(
                        'py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer',
                        isSelected
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

