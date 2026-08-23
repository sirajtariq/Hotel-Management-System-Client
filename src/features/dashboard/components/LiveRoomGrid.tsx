import React, { useState, useEffect, useMemo } from 'react';
import { Room } from '@/types/rooms';
import { roomService } from '@/features/rooms/services/roomService';
import { RoomGridCard } from './RoomGridCard';
import { Search, Plus, RefreshCw, Filter, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface LiveRoomGridProps {
  activePropertyId?: string;
  onSelectRoomForBooking?: (room: Room) => void;
}

export function LiveRoomGrid({ activePropertyId, onSelectRoomForBooking }: LiveRoomGridProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');

  const navigate = useNavigate();

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await roomService.getRooms(activePropertyId);
      setRooms(data);
    } catch {
      // Fallback handled in service
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activePropertyId]);

  // Extract distinct floors dynamically
  const distinctFloors = useMemo(() => {
    const floorsSet = new Set<string>();
    rooms.forEach((r) => {
      if (r.floor !== undefined && r.floor !== null) {
        floorsSet.add(String(r.floor));
      }
    });
    return Array.from(floorsSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [rooms]);

  // Calculate live count statistics
  const stats = useMemo(() => {
    let available = 0;
    let occupied = 0;
    let reserved = 0;
    let cleaning = 0;
    let maintenance = 0;

    rooms.forEach((r) => {
      const st = String(r.status || '').toUpperCase();
      if (st === 'AVAILABLE') available++;
      else if (st === 'OCCUPIED') occupied++;
      else if (st === 'RESERVED') reserved++;
      else if (st === 'CLEANING') cleaning++;
      else if (st === 'MAINTENANCE') maintenance++;
    });

    return {
      total: rooms.length,
      available,
      occupied,
      reserved,
      cleaning,
      maintenance,
    };
  }, [rooms]);

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomStatus = String(room.status || '').toUpperCase();
      if (statusFilter !== 'ALL' && roomStatus !== statusFilter) {
        return false;
      }
      if (floorFilter !== 'ALL' && String(room.floor) !== floorFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRoom = String(room.roomNumber).toLowerCase().includes(q);
        const matchesType = String(room.room_type_name || '').toLowerCase().includes(q);
        const matchesGuest = String(room.current_guest_name || '').toLowerCase().includes(q);

        if (!matchesRoom && !matchesType && !matchesGuest) {
          return false;
        }
      }
      return true;
    });
  }, [rooms, statusFilter, floorFilter, searchQuery]);

  const handleRoomClick = (room: Room) => {
    if (onSelectRoomForBooking) {
      onSelectRoomForBooking(room);
    } else {
      navigate('/bookings');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Live Room Status & Inventory Grid
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredRooms.length} of {stats.total} Rooms
            </span>
          </div>
        </div>

        {/* Search & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room # or guest..."
              className="h-8.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchRooms}
            className="h-8.5 px-2.5 text-xs text-slate-600 border-slate-200 hover:text-slate-900 shrink-0"
            title="Refresh room grid"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filter & Floor Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            )}
          >
            All ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('AVAILABLE')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'AVAILABLE'
                ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available ({stats.available})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('OCCUPIED')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'OCCUPIED'
                ? 'bg-blue-700 text-white font-semibold shadow-2xs'
                : 'bg-blue-50 text-blue-800 border border-blue-200/80 hover:bg-blue-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Occupied ({stats.occupied})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('RESERVED')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'RESERVED'
                ? 'bg-amber-700 text-white font-semibold shadow-2xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Reserved ({stats.reserved})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('CLEANING')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'CLEANING'
                ? 'bg-purple-700 text-white font-semibold shadow-2xs'
                : 'bg-purple-50 text-purple-800 border border-purple-200/80 hover:bg-purple-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Cleaning ({stats.cleaning})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'MAINTENANCE'
                ? 'bg-rose-700 text-white font-semibold shadow-2xs'
                : 'bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100'
            )}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Maintenance ({stats.maintenance})
          </button>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1 text-xs self-end lg:self-auto bg-slate-100/80 p-1 rounded-lg border border-slate-200/70">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Layers className="h-3 w-3 text-slate-400" />
            Floor:
          </span>

          <button
            type="button"
            onClick={() => setFloorFilter('ALL')}
            className={cn(
              'px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
              floorFilter === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All
          </button>

          {distinctFloors.map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setFloorFilter(fl)}
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                floorFilter === fl
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Fl {fl}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid Matrix */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between bg-white shadow-2xs min-h-[110px]"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-10 rounded-md" />
                </div>
                <Skeleton className="h-3 w-20 mt-1 mb-2" />
              </div>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
                <div className="flex items-center justify-between gap-1">
                  <Skeleton className="h-4.5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="min-h-[160px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
          <Filter className="h-7 w-7 text-slate-300 mb-1.5" />
          <h3 className="text-sm font-semibold text-slate-700">No rooms found</h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
            No rooms match your active filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('ALL');
              setFloorFilter('ALL');
              setSearchQuery('');
            }}
            className="mt-3 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredRooms.map((room) => (
            <RoomGridCard key={room.id} room={room} onSelectRoom={handleRoomClick} />
          ))}
        </div>
      )}
    </div>
  );
}
