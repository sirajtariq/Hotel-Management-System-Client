import React, { useState, useEffect } from 'react';
import { RoomsPage } from '@/features/rooms/pages/RoomsPage';
import { roomService, RoomTypeItem, CreateRoomTypeInput } from '@/features/rooms/services/roomService';
import { propertyService } from '@/features/properties/services/propertyService';
import { Property } from '@/types/properties';
import { RoomTypeCard } from '@/features/rooms/components/RoomTypeCard';
import { AddEditRoomCategoryModal } from '@/features/rooms/components/AddEditRoomCategoryModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/ToastProvider';
import { Grid3X3, Moon, Plus, Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoomsAdminTab() {
  const [subTab, setSubTab] = useState<'rooms' | 'types'>('rooms');
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomTypeItem | null>(null);

  const fetchRoomTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const [typesData, propsData] = await Promise.all([
        roomService.getRoomTypes(),
        propertyService.getProperties(),
      ]);
      setRoomTypes(Array.isArray(typesData) ? typesData : []);
      setProperties(Array.isArray(propsData) ? propsData : []);
    } catch {
      toast.error('Failed to load room types & rates.');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (subTab === 'types') {
      fetchRoomTypes();
    }
  }, [subTab]);

  const handleOpenAddModal = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rt: RoomTypeItem) => {
    setEditingType(rt);
    setIsModalOpen(true);
  };

  const handleSaveRoomType = async (input: CreateRoomTypeInput) => {
    try {
      if (editingType) {
        const updated = await roomService.updateRoomType(editingType.id, input);
        setRoomTypes((prev) => prev.map((item) => (item.id === editingType.id ? updated : item)));
        toast.success('Category Updated', `Updated ${updated.name} pricing and specifications`);
      } else {
        const created = await roomService.createRoomType(input);
        setRoomTypes((prev) => [created, ...prev]);
        toast.success('Category Created', `Added ${created.name} to rate strategy`);
      }
    } catch {
      toast.error('Operation Failed', 'Could not save room category.');
    }
  };

  const handleDeleteRoomType = async (id: string | number, name: string) => {
    if (!confirm(`Are you sure you want to delete room category "${name}"?`)) return;
    try {
      await roomService.deleteRoomType(id);
      setRoomTypes((prev) => prev.filter((item) => item.id !== id));
      toast.success('Category Deleted', `Removed ${name}`);
    } catch {
      toast.error('Delete Failed', 'Could not delete room category.');
    }
  };

  const filteredRoomTypes = roomTypes.filter((rt) => {
    const nameMatch = (rt.name || '').toLowerCase().includes(search.toLowerCase());
    const amenityMatch = (rt.amenities || []).some((a) => a.toLowerCase().includes(search.toLowerCase()));
    const matchesSearch = nameMatch || amenityMatch;
    const matchesProperty =
      propertyFilter === 'all' ||
      !rt.propertyId ||
      String(rt.propertyId) === propertyFilter;

    return matchesSearch && matchesProperty;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Sub-segmented Pills Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('rooms')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
            subTab === 'rooms'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          )}
        >
          <Grid3X3 className="h-3.5 w-3.5" />
          <span>Room Inventory & Units Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('types')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
            subTab === 'types'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          )}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Room Types & Pricing Strategy</span>
        </button>
      </div>

      {/* Sub-tab 1: Room Types & Nightly / Hourly Rates */}
      {subTab === 'types' && (
        <div className="space-y-5">
          {/* Header & Controls Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Header Info */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-600" />
                Room Categories & Rate Plans
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Configure room classes, occupancy limits, dual nightly & hourly pricing tiers, and amenities
              </p>
            </div>

            {/* Right Controls: Search, Filter & Action Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search room category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs font-medium bg-slate-50 rounded-xl border border-slate-200/80 text-slate-900 w-48 lg:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Property Branch Dropdown */}
              {properties.length > 0 && (
                <div className="relative">
                  <select
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    <option value="all">All Property Branches</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs px-4 py-2.5 shadow-2xs flex items-center gap-2 transition-all hover:shadow-indigo-500/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Room Category</span>
              </button>
            </div>
          </div>

          {/* Cards Matrix */}
          {isLoadingTypes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : filteredRoomTypes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <Moon className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No Room Categories Found</p>
              <p className="text-xs text-slate-400">
                {search ? 'Try clearing your search query' : 'Click "+ Add Room Category" to establish your property rate strategy.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoomTypes.map((rt) => (
                <RoomTypeCard
                  key={rt.id}
                  roomType={rt}
                  assignedRoomsCount={4}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteRoomType}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Rooms Master Matrix */}
      {subTab === 'rooms' && <RoomsPage />}

      {/* 2-Column Create / Edit Room Category Modal */}
      <AddEditRoomCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoomType}
        editingType={editingType}
        properties={properties}
      />
    </div>
  );
}
