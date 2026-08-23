import { BedDouble, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RoomStatusBadge } from './RoomStatusBadge';
import { RoomStatusDropdown } from './RoomStatusDropdown';
import { Room, RoomStatus } from '@/types/rooms';
import { formatPKR } from '@/lib/formatters';
import { Can } from '@/lib/rbac';

interface RoomCardProps {
  room: Room;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
}

export function RoomCard({ room, onStatusChange }: RoomCardProps) {
  const amenitiesList = Array.isArray(room?.amenities) ? room.amenities : [];
  const roomTypeLabel = String(room?.room_type_name || room?.type || 'standard').replace(/_/g, ' ');
  const roomPrice = room?.base_price ?? room?.basePricePerNight ?? 0;

  return (
    <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
      <CardHeader className="p-3.5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs font-mono">
              {room?.roomNumber || 'N/A'}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 capitalize">
                {roomTypeLabel}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <RoomStatusBadge status={room?.status || 'available'} />
            <Can permission="rooms:change_status">
              <RoomStatusDropdown
                currentStatus={room?.status || 'available'}
                onStatusChange={(status) => onStatusChange(room.id, status)}
              />
            </Can>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Max {room?.capacity || 2} Guests</span>
          </div>
          <div className="font-bold text-slate-900 font-mono tabular-nums">
            {formatPKR(roomPrice)} <span className="text-[10px] font-normal text-slate-400">/night</span>
          </div>
        </div>

        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {amenitiesList.map((amenity, i) => (
              <span
                key={i}
                className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

