import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/axios';
import { X, Search, BedDouble, User } from 'lucide-react';

export interface CheckedInBooking {
  id: number;
  guest_name: string;
  guest_phone: string;
  room?: {
    id: number;
    room_number: string;
  };
  room_number?: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

interface RoomServicePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBooking: (booking: CheckedInBooking) => void;
}

export function RoomServicePicker({ isOpen, onClose, onSelectBooking }: RoomServicePickerProps) {
  const [bookings, setBookings] = useState<CheckedInBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiClient
        .get('/bookings/', { params: { status: 'CHECKED_IN' } })
        .then((res) => {
          setBookings(res.data.results || res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = bookings.filter((b) => {
    const roomNum = b.room?.room_number || b.room_number || '';
    const q = search.toLowerCase();
    return roomNum.toLowerCase().includes(q) || b.guest_name.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Checked-In Room</h2>
            <p className="text-xs text-slate-500">Pick in-house guest room for Room Service</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Room # or Guest Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading active room bookings...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No checked-in guests found matching search.</div>
          ) : (
            filtered.map((b) => {
              const rNum = b.room?.room_number || b.room_number || 'N/A';
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    onSelectBooking(b);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-500/50 hover:bg-indigo-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                      <BedDouble className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">Room {rNum}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{b.guest_name}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    Checked In
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
