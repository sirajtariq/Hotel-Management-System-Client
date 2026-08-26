import React, { useState, useEffect } from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { RoomsPage } from '@/features/rooms/pages/RoomsPage';
import { roomService, RoomTypeItem } from '@/features/rooms/services/roomService';
import { formatPKR } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/ToastProvider';
import { BedDouble, Grid3X3, Clock, Moon, Plus, CheckCircle2, Shield } from 'lucide-react';
import { Can } from '@/lib/rbac';

export function RoomConfigPage() {
  const [activeSubTab, setActiveSubTab] = useState<'types' | 'rooms'>('rooms');
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  const fetchRoomTypes = async () => {
    setIsLoadingTypes(true);
    try {
      const data = await roomService.getRoomTypes();
      setRoomTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load room types & rates.');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'types') {
      fetchRoomTypes();
    }
  }, [activeSubTab]);

  return (
    <PermissionGuard permission="rooms:view" moduleName="Room Configurations & Pricing">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="rooms"
          title="Rooms & Rate Master"
          subtitle="Configure room categories, nightly rates, hourly rates, and unit floor assignments"
        />

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('types')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'types'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Tab 1: Room Types & Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'rooms'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Tab 2: Rooms Master & Inventory</span>
          </button>
        </div>

        {/* Tab 1 Content: Room Types & Pricing Controls */}
        {activeSubTab === 'types' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Room Categories & Nightly / Hourly Rates</h2>
                <p className="text-xs text-slate-500">Base pricing strategy for nightly bookings & short stay hourly slots</p>
              </div>
            </div>

            {isLoadingTypes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : roomTypes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No room types created yet. Default room types will be seeded automatically.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roomTypes.map((rt) => (
                  <div
                    key={rt.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{rt.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {rt.capacity || 2} Persons Capacity
                        </span>
                      </div>

                      {rt.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{rt.description}</p>
                      )}

                      {/* Pricing Specs */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            <Moon className="h-3.5 w-3.5 text-indigo-700" />
                            <span>Nightly Rate</span>
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 font-mono">
                            {formatPKR(parseFloat(String(rt.baseRate || 0)))}
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            <span>Hourly Rate</span>
                          </div>
                          <div className="text-sm font-extrabold text-amber-800 font-mono">
                            {formatPKR(parseFloat(String(rt.hourlyRate || (parseFloat(String(rt.baseRate || 0)) * 0.25))))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Standard Rate Plan</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Rooms Master & Inventory Matrix */}
        {activeSubTab === 'rooms' && <RoomsPage />}
      </div>
    </PermissionGuard>
  );
}
