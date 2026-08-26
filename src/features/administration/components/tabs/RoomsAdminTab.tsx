import React, { useState, useEffect } from 'react';
import { RoomsPage } from '@/features/rooms/pages/RoomsPage';
import { roomService, RoomTypeItem } from '@/features/rooms/services/roomService';
import { formatPKR } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/ToastProvider';
import { Grid3X3, Clock, Moon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoomsAdminTab() {
  const [subTab, setSubTab] = useState<'types' | 'rooms'>('rooms');
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
    if (subTab === 'types') {
      fetchRoomTypes();
    }
  }, [subTab]);

  return (
    <div className="space-y-6 font-sans">
      {/* Sub-segmented Pills Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('rooms')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
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
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
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
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">Room Categories & Base Rate Strategy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nightly base pricing and short stay hourly slot rate configurations across room types
            </p>
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
              No room types created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {roomTypes.map((rt) => (
                <div
                  key={rt.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{rt.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {rt.capacity || 2} Max Persons
                      </span>
                    </div>

                    {rt.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{rt.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          <Moon className="h-3.5 w-3.5 text-indigo-600" />
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

      {/* Sub-tab 2: Rooms Master Matrix */}
      {subTab === 'rooms' && <RoomsPage />}
    </div>
  );
}
