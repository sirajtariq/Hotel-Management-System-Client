import React, { useState, useMemo } from 'react';
import { Room } from '@/types/rooms';
import { Booking } from '@/types/bookings';
import { formatPKR } from '@/lib/formatters';
import {
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  User,
  AlertTriangle,
  Building,
  Layers,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type StatusFilterKey =
  | 'ALL'
  | 'AVAILABLE_READY'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'CLEANING'
  | 'DIRTY'
  | 'MAINTENANCE';

interface RoomStatusGridProps {
  rooms: Room[];
  bookings: Booking[];
  isLoading: boolean;
  onRefresh: () => void;
  onRoomClick: (room: Room, activeBooking: Booking | null) => void;
  viewMode: 'GRID' | 'TABLE';
  onViewModeChange: (mode: 'GRID' | 'TABLE') => void;
}

export function RoomStatusGrid({
  rooms,
  bookings,
  isLoading,
  onRefresh,
  onRoomClick,
  viewMode,
  onViewModeChange,
}: RoomStatusGridProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');

  // ⚡ Requirement: Optimize room-to-booking data join using a memoized map
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking>();
    (bookings || []).forEach((b) => {
      const st = String(b.status || '').toLowerCase();
      // Match active operational bookings (checked_in, confirmed, reserved, pending)
      if (st === 'checked_in' || st === 'confirmed' || st === 'reserved' || st === 'pending') {
        const roomIdStr = String(b.roomId || (b as any).room_id || (b as any).room || '');
        const roomNumStr = String(b.roomNumber || (b as any).room_number || '').trim().toLowerCase();
        if (roomIdStr) map.set(roomIdStr, b);
        if (roomNumStr) map.set(`num_${roomNumStr}`, b);
      }
    });
    return map;
  }, [bookings]);

  // Dynamically extract unique floors from room inventory
  const availableFloors = useMemo(() => {
    const set = new Set<string>();
    rooms.forEach((r) => {
      if (r.floor !== undefined && r.floor !== null && r.floor !== '') {
        set.add(String(r.floor));
      }
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [rooms]);

  // Compute live room status counters for filter toolbar
  const counts = useMemo(() => {
    let availableReady = 0;
    let occupied = 0;
    let reserved = 0;
    let cleaning = 0;
    let dirty = 0;
    let maintenance = 0;

    rooms.forEach((r) => {
      const statusUpper = String(r.status || 'AVAILABLE').toUpperCase();
      const hkUpper = String(r.housekeeping_status || 'CLEAN').toUpperCase();

      const isCleanOrInspected = hkUpper === 'CLEAN' || hkUpper === 'INSPECTED';
      const isDirtyState = hkUpper === 'DIRTY';
      const isCleaningState = hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING';

      if (statusUpper === 'OCCUPIED') {
        occupied++;
      } else if (statusUpper === 'RESERVED') {
        reserved++;
      } else if (statusUpper === 'MAINTENANCE' || hkUpper === 'MAINTENANCE') {
        maintenance++;
      } else if (isCleaningState) {
        cleaning++;
      } else if (isDirtyState) {
        dirty++;
      } else if (statusUpper === 'AVAILABLE' && isCleanOrInspected) {
        availableReady++;
      } else if (statusUpper === 'AVAILABLE') {
        availableReady++;
      }
    });

    return {
      all: rooms.length,
      availableReady,
      occupied,
      reserved,
      cleaning,
      dirty,
      maintenance,
    };
  }, [rooms]);

  // Filter rooms based on Search, Status Filter, and Floor Selector
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Search Query Filter (Room Number, Guest Name, Room Type/Category)
      const q = search.trim().toLowerCase();
      if (q) {
        const activeBooking = bookingMap.get(String(r.id)) || bookingMap.get(`num_${String(r.roomNumber).toLowerCase()}`);
        const guestName = (
          activeBooking?.guest?.fullName ||
          (activeBooking as any)?.guestName ||
          (activeBooking as any)?.guest_name ||
          r.current_guest_name ||
          ''
        ).toLowerCase();
        const roomNum = String(r.roomNumber).toLowerCase();
        const category = (r.room_type_name || '').toLowerCase();

        const match = roomNum.includes(q) || guestName.includes(q) || category.includes(q);
        if (!match) return false;
      }

      // 2. Floor Selector Filter
      if (selectedFloor !== 'ALL') {
        if (String(r.floor) !== selectedFloor) return false;
      }

      // 3. Status Filter Pills
      if (statusFilter === 'ALL') return true;

      const statusUpper = String(r.status || 'AVAILABLE').toUpperCase();
      const hkUpper = String(r.housekeeping_status || 'CLEAN').toUpperCase();

      const isCleanOrInspected = hkUpper === 'CLEAN' || hkUpper === 'INSPECTED';
      const isDirtyState = hkUpper === 'DIRTY';
      const isCleaningState = hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING';

      if (statusFilter === 'AVAILABLE_READY') {
        return statusUpper === 'AVAILABLE' && isCleanOrInspected;
      }
      if (statusFilter === 'OCCUPIED') {
        return statusUpper === 'OCCUPIED';
      }
      if (statusFilter === 'RESERVED') {
        return statusUpper === 'RESERVED';
      }
      if (statusFilter === 'CLEANING') {
        return isCleaningState;
      }
      if (statusFilter === 'DIRTY') {
        return isDirtyState;
      }
      if (statusFilter === 'MAINTENANCE') {
        return statusUpper === 'MAINTENANCE' || hkUpper === 'MAINTENANCE';
      }

      return true;
    });
  }, [rooms, search, selectedFloor, statusFilter, bookingMap]);

  // Helper to format stay date ranges cleanly (e.g. "Sep 02 - Sep 05 (3N)")
  const formatStayDates = (b: Booking) => {
    const checkIn = b.checkInDate || b.checkIn || (b as any).check_in;
    const checkOut = b.checkOutDate || b.checkOut || (b as any).check_out;
    if (!checkIn || !checkOut) return null;

    try {
      const dateIn = new Date(checkIn);
      const dateOut = new Date(checkOut);
      if (isNaN(dateIn.getTime()) || isNaN(dateOut.getTime())) return null;

      const inStr = dateIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const outStr = dateOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const diffTime = Math.abs(dateOut.getTime() - dateIn.getTime());
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return `${inStr} - ${outStr} (${nights}N)`;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Top Header Bar */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Room Count Badge */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Front Desk & Room Inventory</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                {filteredRooms.length} of {rooms.length} Rooms
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Live operational room status matrix, guest assignments, and quick dispatch
            </p>
          </div>
        </div>

        {/* Right Action Controls: Search, Refresh & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Live Search Bar */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search room # or guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-xl h-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
            title="Refresh Live Room Status"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange('GRID')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                viewMode === 'GRID' ? 'bg-white text-indigo-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('TABLE')}
              className={cn(
                'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1',
                viewMode === 'TABLE' ? 'bg-white text-indigo-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              )}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar (Status Pills & Floor Selector) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer',
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All ({counts.all})
          </button>

          {/* Available & Ready */}
          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE_READY')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'AVAILABLE_READY'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available & Ready ({counts.availableReady})
          </button>

          {/* Occupied */}
          <button
            type="button"
            onClick={() => setStatusFilter('OCCUPIED')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'OCCUPIED'
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Occupied ({counts.occupied})
          </button>

          {/* Reserved */}
          <button
            type="button"
            onClick={() => setStatusFilter('RESERVED')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'RESERVED'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Reserved ({counts.reserved})
          </button>

          {/* Cleaning */}
          <button
            type="button"
            onClick={() => setStatusFilter('CLEANING')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'CLEANING'
                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Cleaning ({counts.cleaning})
          </button>

          {/* Dirty */}
          <button
            type="button"
            onClick={() => setStatusFilter('DIRTY')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'DIRTY'
                ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            )}
          >
            <AlertTriangle className="h-3 w-3 text-orange-600 shrink-0" />
            Dirty ({counts.dirty})
          </button>

          {/* Maintenance */}
          <button
            type="button"
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border',
              statusFilter === 'MAINTENANCE'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Maintenance ({counts.maintenance})
          </button>
        </div>

        {/* Floor Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0 self-end lg:self-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Layers className="h-3 w-3 text-slate-400" /> Floor:
          </span>
          <button
            type="button"
            onClick={() => setSelectedFloor('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              selectedFloor === 'ALL'
                ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All
          </button>

          {availableFloors.map((fl) => {
            const countForFloor = rooms.filter((r) => String(r.floor) === fl).length;
            const label = fl.toLowerCase().startsWith('fl') ? fl : `Fl ${fl}`;
            return (
              <button
                key={fl}
                type="button"
                onClick={() => setSelectedFloor(fl)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  selectedFloor === fl
                    ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {label} ({countForFloor})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Room Grid & Card UI */}
      {isLoading && rooms.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 text-slate-400 gap-2">
          <Building className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">No rooms match the selected filters</p>
          <p className="text-xs text-slate-400">Try adjusting your search or filter pills.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredRooms.map((room) => {
            const activeBooking = bookingMap.get(String(room.id)) || bookingMap.get(`num_${String(room.roomNumber).toLowerCase()}`);
            const guestName =
              activeBooking?.guest?.fullName ||
              (activeBooking as any)?.guestName ||
              (activeBooking as any)?.guest_name ||
              room.current_guest_name;

            const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
            const hkUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();

            const isDirty = hkUpper === 'DIRTY';
            const isCleaning = hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING';
            const isOccupied = statusUpper === 'OCCUPIED';
            const isReserved = statusUpper === 'RESERVED';
            const isMaintenance = statusUpper === 'MAINTENANCE' || hkUpper === 'MAINTENANCE';

            // Financial & Stay Computations for Reserved / Occupied rooms
            const totalBookingAmount = Number(activeBooking?.totalAmount || (activeBooking as any)?.total_amount || 0);
            const paidAmount = Number(activeBooking?.paidAmount || (activeBooking as any)?.paid_amount || 0);
            const pendingBalance = Math.max(0, totalBookingAmount - paidAmount);
            const stayDatesText = activeBooking ? formatStayDates(activeBooking) : null;

            // Distinct Border Accent Styling & Hover Effects
            const getCardStyle = () => {
              if (isOccupied) {
                return 'border-blue-200 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 bg-white';
              }
              if (isReserved) {
                return 'border-amber-200 hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/5 bg-white';
              }
              if (isCleaning) {
                return 'border-purple-200 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/5 bg-white';
              }
              if (isDirty) {
                return 'border-orange-200 hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/5 bg-white';
              }
              if (isMaintenance) {
                return 'border-rose-200 hover:border-rose-400 hover:shadow-md hover:shadow-rose-500/5 bg-white';
              }
              return 'border-emerald-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 bg-white';
            };

            const getBadgeUI = () => {
              if (isOccupied) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    Occupied
                  </span>
                );
              }
              if (isReserved) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Reserved
                  </span>
                );
              }
              if (isCleaning) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                    Cleaning
                  </span>
                );
              }
              if (isDirty) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200">
                    <AlertTriangle className="h-3 w-3 text-orange-600 shrink-0" />
                    Dirty
                  </span>
                );
              }
              if (isMaintenance) {
                return (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    <span className="h-2 w-2 rounded-full bg-rose-600" />
                    Maintenance
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Available
                </span>
              );
            };

            const floorLabel = room.floor ? (String(room.floor).toLowerCase().startsWith('fl') ? room.floor : `Fl ${room.floor}`) : 'Fl 1';

            return (
              <div
                key={room.id}
                onClick={() => onRoomClick(room, activeBooking || null)}
                className={cn(
                  'rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-2xs hover:-translate-y-0.5',
                  getCardStyle()
                )}
              >
                <div className="space-y-2.5">
                  {/* 1. Top Row: Room Number (#101) & Floor Tag (Static base price removed for Available rooms) */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-900 transition-colors font-mono tracking-tight">
                      #{room.roomNumber}
                    </h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/80 shrink-0">
                      {floorLabel}
                    </span>
                  </div>

                  {/* 2. Middle Row: Category Name & Status Badge */}
                  <div>
                    <p className="text-xs text-slate-500 font-medium truncate mb-1.5" title={room.room_type_name}>
                      {room.room_type_name || 'Standard Room'}
                    </p>
                    <div>{getBadgeUI()}</div>
                  </div>

                  {/* 3. Middle-Bottom Row: Stay Dates & Booking Financials (for Reserved/Occupied) */}
                  {activeBooking && (isOccupied || isReserved) ? (
                    <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/60 space-y-1.5 text-xs">
                      {/* Stay Dates */}
                      {stayDatesText && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                          <Calendar className="h-3 w-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{stayDatesText}</span>
                        </div>
                      )}

                      {/* Financial Details (Agreed Total & Balance Due) */}
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/50">
                        <span className="text-[11px] font-bold text-slate-800">
                          Total: {formatPKR(totalBookingAmount)}
                        </span>

                        {pendingBalance > 0 ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                            Due: {formatPKR(pendingBalance)}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* 4. Footer Row: Guest Name or Vacant Status */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                  {guestName ? (
                    <span className="text-slate-800 font-semibold truncate flex items-center gap-1.5 max-w-full" title={guestName}>
                      <User className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{guestName}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                      <span>Vacant & Ready</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
