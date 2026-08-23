import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { RoomFilterBar } from '../components/RoomFilterBar';
import { RoomGrid } from '../components/RoomGrid';
import { AddRoomModal } from '../components/AddRoomModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import { roomService } from '../services/roomService';
import { propertyService } from '@/features/properties/services/propertyService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Room, RoomStatus, CreateRoomInput } from '@/types/rooms';
import { Property } from '@/types/properties';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function RoomsPage() {
  const { user, is_impersonated } = useAuth();
  const role = user?.role?.toLowerCase();
  const isPureSuperAdmin = (role === 'super_admin' || role === 'superadmin') && !is_impersonated;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      roomService.getRooms().then((data) => setRooms(Array.isArray(data) ? data : [])),
      propertyService.getProperties().then((props) => setProperties(Array.isArray(props) ? props : [])),
    ]).finally(() => setIsLoading(false));
  }, []);

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    if (isPureSuperAdmin) return;
    try {
      const updated = await roomService.updateRoomStatus(roomId, newStatus);
      setRooms((prev) => (Array.isArray(prev) ? prev : []).map((r) => (r.id === roomId ? updated : r)));
      toast.success('Room Status Updated', `Room ${updated.roomNumber || roomId} is now ${newStatus.toUpperCase()}`);
    } catch {
      toast.error('Update Failed', 'Could not change room status.');
    }
  };

  const handleAddRoom = async (data: CreateRoomInput) => {
    if (isPureSuperAdmin) return;
    try {
      const created = await roomService.createRoom(data);
      setRooms((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      toast.success('Room Created', `Room ${created.roomNumber} added successfully`);
    } catch {
      toast.error('Action Failed', 'Could not create room unit.');
    }
  };

  const safeRooms = Array.isArray(rooms) ? rooms : [];

  const filteredRooms = safeRooms.filter((r) => {
    const numStr = r.roomNumber || '';
    const matchesSearch = numStr.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusTab === 'all' || r.status === statusTab;
    const matchesFloor = floorFilter === 'all' || r.floor === Number(floorFilter);
    const matchesProperty =
      propertyFilter === 'all' ||
      r.propertyId === propertyFilter ||
      String((r as any).property) === propertyFilter;

    return matchesSearch && matchesStatus && matchesFloor && matchesProperty;
  });

  return (
    <PermissionGuard permission="rooms:view" moduleName="Rooms & Inventory">
      <div className="space-y-6">
        {isPureSuperAdmin && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Platform Overview (Read-Only)</strong> — Viewing live room inventory. Use <strong>'Login as Tenant'</strong> from the Tenants page to perform operations.
              </span>
            </div>
          </div>
        )}

        <PageHeader
          title="Rooms & Visual Matrix"
          description="Live occupancy state, housekeeping workflow, and room inventory"
          actions={
            !isPureSuperAdmin ? (
              <Can permission="rooms:manage">
                <Button size="sm" className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950" onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Room Unit
                </Button>
              </Can>
            ) : undefined
          }
        />

        <RoomFilterBar
          search={search}
          onSearchChange={setSearch}
          statusTab={statusTab}
          onStatusTabChange={setStatusTab}
          floorFilter={floorFilter}
          onFloorFilterChange={setFloorFilter}
          propertyFilter={propertyFilter}
          onPropertyFilterChange={setPropertyFilter}
          properties={properties}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between min-h-[120px]"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-28" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <RoomGrid rooms={filteredRooms} onStatusChange={handleStatusChange} />
        )}

        <AddRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddRoom}
          properties={properties}
        />
      </div>
    </PermissionGuard>
  );
}
