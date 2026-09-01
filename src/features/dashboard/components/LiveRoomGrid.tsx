import React, { useState, useEffect, useMemo } from 'react';
import { Room, RoomStatus, HousekeepingStatus } from '@/types/rooms';
import { roomService } from '@/features/rooms/services/roomService';
import { RoomGridCard } from './RoomGridCard';
import { RoomDetailsModal } from '@/features/rooms/components/RoomDetailsModal';
import { Search, Plus, RefreshCw, Filter, Layers, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';

interface LiveRoomGridProps {
  activePropertyId?: string;
  onSelectRoomForBooking?: (room: Room) => void;
}

export function LiveRoomGrid({ activePropertyId, onSelectRoomForBooking }: LiveRoomGridProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchRooms = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await roomService.getRooms(activePropertyId, forceRefresh);
      setRooms(data);
    } catch {
      // Fallback handled in service
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [activePropertyId]);

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    try {
      const updated = await roomService.updateRoomStatus(roomId, newStatus);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(updated);
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room Status Updated', `Room ${updated.roomNumber || roomId} status is now ${newStatus}`);
    } catch {
      toast.error('Update Failed', 'Could not change room status.');
    }
  };

  const handleHousekeepingChange = async (roomId: string, newHkStatus: HousekeepingStatus) => {
    try {
      const updated = await roomService.updateHousekeepingStatus(roomId, newHkStatus);
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(updated);
      }
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Housekeeping Updated', `Room ${updated.roomNumber || roomId} is now ${newHkStatus}`);
    } catch {
      toast.error('Update Failed', 'Could not change housekeeping status.');
    }
  };

  // Extract distinct floors dynamically & count rooms per floor
  const { distinctFloors, floorCounts } = useMemo(() => {
    const floorsSet = new Set<string>();
    const counts: Record<string, number> = {};

    rooms.forEach((r) => {
      if (r.floor !== undefined && r.floor !== null) {
        const fl = String(r.floor);
        floorsSet.add(fl);
        counts[fl] = (counts[fl] || 0) + 1;
      }
    });

    const sortedFloors = Array.from(floorsSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });

    return { distinctFloors: sortedFloors, floorCounts: counts };
  }, [rooms]);

  // Calculate live count statistics
  const stats = useMemo(() => {
    let available = 0;
    let occupied = 0;
    let reserved = 0;
    let cleaning = 0;
    let dirty = 0;
    let maintenance = 0;

    rooms.forEach((r) => {
      const st = String(r.status || '').toUpperCase();
      const hk = String(r.housekeeping_status || '').toUpperCase();

      const isClean = hk === 'CLEAN' || hk === 'INSPECTED' || hk === '';
      const isDirty = hk === 'DIRTY' || hk === 'DIRTY_ROOM';
      const isCleaning = st === 'CLEANING' || hk === 'IN_PROGRESS' || hk === 'CLEANING';

      if (st === 'OCCUPIED') {
        occupied++;
      } else if (st === 'RESERVED') {
        reserved++;
      } else if (st === 'MAINTENANCE') {
        maintenance++;
      } else if (isCleaning) {
        cleaning++;
      } else if (isDirty) {
        dirty++;
      } else if (st === 'AVAILABLE' && isClean) {
        available++;
      } else if (st === 'AVAILABLE') {
        available++;
      }
    });

    return {
      total: rooms.length,
      available,
      occupied,
      reserved,
      cleaning,
      dirty,
      maintenance,
    };
  }, [rooms]);

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomStatus = String(room.status || '').toUpperCase();
      const hkStatus = String(room.housekeeping_status || '').toUpperCase();

      const isClean = hkStatus === 'CLEAN' || hkStatus === 'INSPECTED' || hkStatus === '';
      const isDirty = hkStatus === 'DIRTY' || hkStatus === 'DIRTY_ROOM';
      const isCleaning = roomStatus === 'CLEANING' || hkStatus === 'IN_PROGRESS' || hkStatus === 'CLEANING';

      if (statusFilter !== 'ALL') {
        if (statusFilter === 'AVAILABLE') {
          if (roomStatus !== 'AVAILABLE' || !isClean) return false;
        } else if (statusFilter === 'DIRTY') {
          if (!isDirty) return false;
        } else if (statusFilter === 'CLEANING') {
          if (!isCleaning) return false;
        } else if (roomStatus !== statusFilter) {
          return false;
        }
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
      setSelectedRoom(room);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4 font-sans">
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
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors font-sans"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRooms(true)}
            title="Refresh Grid"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-indigo-600')} />
          </Button>

          <Can permission="rooms:manage">
            <Button
              size="sm"
              onClick={() => navigate('/rooms')}
              className="h-8 text-xs gap-1 bg-indigo-900 text-white hover:bg-indigo-950 shadow-2xs font-semibold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Manage Rooms
            </Button>
          </Can>
        </div>
      </div>

      {/* Filter Tabs & Floor Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
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
            Available & Ready ({stats.available})
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
            onClick={() => setStatusFilter('DIRTY')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              statusFilter === 'DIRTY'
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            )}
          >
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Dirty ({stats.dirty})
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
        <div className="flex items-center gap-1 text-xs self-end lg:self-auto bg-slate-100/80 p-1 rounded-lg border border-slate-200/70 font-sans">
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
              Fl {fl} ({floorCounts[fl] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid Matrix - Grid Cols 1 -> 2 -> 3 -> 4 -> 5 */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-between bg-white shadow-2xs min-h-[120px]"
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
            className="mt-3 text-xs cursor-pointer"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredRooms.map((room) => (
            <RoomGridCard key={room.id} room={room} onSelectRoom={handleRoomClick} />
          ))}
        </div>
      )}

      {/* Room Details Modal for Dashboard Live Grid */}
      <RoomDetailsModal
        room={selectedRoom}
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onStatusChange={handleStatusChange}
        onHousekeepingChange={handleHousekeepingChange}
      />
    </div>
  );
}

