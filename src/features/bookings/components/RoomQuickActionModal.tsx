import React, { useState } from 'react';
import { Room, HousekeepingStatus, RoomStatus } from '@/types/rooms';
import { Booking } from '@/types/bookings';
import { formatPKR } from '@/lib/formatters';
import {
  X,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  LogOut,
  LogIn,
  Plus,
  Sparkles,
  FileText,
  AlertTriangle,
  Building,
  Bed,
  Receipt,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoomQuickActionModalProps {
  room: Room | null;
  activeBooking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onNewBooking: (roomId?: string) => void;
  onCheckIn: (bookingId: string) => void | Promise<any>;
  onCheckOut: (booking: Booking) => void | Promise<any>;
  onRecordPayment: (booking: Booking) => void | Promise<any>;
  onViewFolio: (booking: Booking) => void | Promise<any>;
  onMarkHousekeeping: (roomId: string, status: HousekeepingStatus) => void | Promise<any>;
  onUpdateRoomStatus: (roomId: string, status: RoomStatus) => void | Promise<any>;
  onCheckOutWithPayment?: (booking: Booking) => void | Promise<any>;
  onAddExtraCharge?: (booking: Booking) => void | Promise<any>;
}

export function RoomQuickActionModal({
  room,
  activeBooking,
  isOpen,
  onClose,
  onNewBooking,
  onCheckIn,
  onCheckOut,
  onRecordPayment,
  onViewFolio,
  onMarkHousekeeping,
  onUpdateRoomStatus,
  onCheckOutWithPayment,
  onAddExtraCharge,
}: RoomQuickActionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !room) return null;

  const totalAmount = Number(activeBooking?.totalAmount || (activeBooking as any)?.total_amount || 0);
  const paidAmount = Number(activeBooking?.paidAmount || (activeBooking as any)?.paid_amount || 0);
  const pendingBalance = Math.max(0, totalAmount - paidAmount);

  const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
  const hkUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();

  const isDirty = hkUpper === 'DIRTY';
  const isCleaning = hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING';
  const isOccupied = statusUpper === 'OCCUPIED';
  const isReserved = statusUpper === 'RESERVED';
  const isMaintenance = statusUpper === 'MAINTENANCE';

  const guestName =
    activeBooking?.guest?.fullName ||
    (activeBooking as any)?.guestName ||
    (activeBooking as any)?.guest_name ||
    room.current_guest_name ||
    'Walk-in Guest';

  const getStatusTheme = () => {
    if (isOccupied) return { label: 'Occupied', bg: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600' };
    if (isReserved) return { label: 'Reserved', bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
    if (isCleaning) return { label: 'Cleaning In Progress', bg: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-600' };
    if (isDirty) return { label: 'Dirty / Needs Housekeeping', bg: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-600' };
    if (isMaintenance) return { label: 'Out of Service / Maintenance', bg: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-600' };
    return { label: 'Available & Ready', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' };
  };

  const theme = getStatusTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Room #{room.roomNumber}</h2>
                <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                  Fl {room.floor}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{room.room_type_name}</p>
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

        {/* Current Status Badge */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${theme.bg}`}>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${theme.dot} animate-pulse`} />
            <span>{theme.label}</span>
          </div>
          {activeBooking ? (
            <span className="font-mono text-slate-900 font-bold">
              Total: {formatPKR(totalAmount)}
            </span>
          ) : (
            <span className="text-[11px] font-normal text-slate-500">
              Dynamic Pricing at Reservation
            </span>
          )}
        </div>

        {/* Guest & Booking Info Box (if reserved or occupied) */}
        {(activeBooking || room.current_guest_name) && (
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-indigo-600" /> Primary Guest:
              </span>
              <span className="font-bold text-slate-900">{guestName}</span>
            </div>

            {activeBooking && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-indigo-600" /> Booking Ref:
                  </span>
                  <span className="font-mono font-bold text-indigo-950">
                    {activeBooking.bookingReference || `#${activeBooking.id}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Stay Dates:
                  </span>
                  <span className="font-medium text-slate-700">
                    {activeBooking.checkInDate} → {activeBooking.checkOutDate}
                  </span>
                </div>

                {/* Pending Folio Balance Warning */}
                {pendingBalance > 0 ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" /> Pending Folio Balance:
                      </span>
                      <span className="font-mono text-xs text-rose-700">{formatPKR(pendingBalance)}</span>
                    </div>
                    <p className="text-[10px] text-amber-800 font-normal">
                      Please record payment or settle balance before executing checkout.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Folio Balance Settled
                    </span>
                    <span className="font-mono text-emerald-900">PKR 0.00</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons Workflow */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Operational Actions
          </label>

          {/* Context 1: AVAILABLE Room */}
          {statusUpper === 'AVAILABLE' && (
            <div className="grid grid-cols-1 gap-2">
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onNewBooking(room.id);
                }}
                className="w-full justify-center gap-2 bg-indigo-900 text-white hover:bg-indigo-950 font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Reservation / Walk-In Check-In</span>
              </Button>

              {!isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onMarkHousekeeping(room.id, 'DIRTY');
                    onClose();
                  }}
                  className="w-full justify-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mark as Needs Cleaning (Dirty)</span>
                </Button>
              )}
            </div>
          )}

          {/* Context 2: RESERVED Room */}
          {isReserved && (
            <div className="grid grid-cols-1 gap-2">
              {activeBooking ? (
                <>
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await onCheckIn(activeBooking.id);
                        onClose();
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    <span>Check-In Guest Now</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onViewFolio(activeBooking);
                        onClose();
                      }}
                      className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>View Folio</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onRecordPayment(activeBooking);
                        onClose();
                      }}
                      className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Record Payment</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      onNewBooking(room.id);
                      onClose();
                    }}
                    className="w-full justify-center gap-2 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create / Manage Reservation</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await onUpdateRoomStatus(room.id, 'AVAILABLE');
                        onClose();
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    <span>Mark as Vacant & Available</span>
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Context 3: OCCUPIED Room */}
          {isOccupied && (
            <div className="space-y-2">
              {activeBooking ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onViewFolio(activeBooking);
                        onClose();
                      }}
                      className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>View Folio / Invoice</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onRecordPayment(activeBooking);
                        onClose();
                      }}
                      className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Record Payment</span>
                    </Button>
                  </div>
                  
                  {onAddExtraCharge && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onAddExtraCharge(activeBooking);
                        onClose();
                      }}
                      className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 rounded-xl cursor-pointer"
                    >
                      <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Post Extra Charge</span>
                    </Button>
                  )}

                  {/* Direct Checkout Button */}
                  <Button
                    type="button"
                    onClick={() => {
                      if (pendingBalance > 0 && onCheckOutWithPayment) {
                        onCheckOutWithPayment(activeBooking);
                        onClose();
                        return;
                      }
                      onCheckOut(activeBooking);
                      onClose();
                    }}
                    className={`w-full justify-center gap-2 font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer ${
                      pendingBalance > 0
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Check-Out Guest {pendingBalance > 0 ? '(Pending Balance)' : ''}</span>
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await onUpdateRoomStatus(room.id, 'AVAILABLE');
                      onClose();
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full justify-center gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>Mark as Vacant & Available</span>
                </Button>
              )}
            </div>
          )}

          {/* Context 4: DIRTY or CLEANING or MAINTENANCE */}
          {(isDirty || isCleaning || isMaintenance) && (
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await onMarkHousekeeping(room.id, 'CLEAN');
                    await onUpdateRoomStatus(room.id, 'AVAILABLE');
                    onClose();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs cursor-pointer"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Mark as Ready / Inspected (Clean)</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
