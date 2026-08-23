import { RoomCard } from './RoomCard';
import { Room, RoomStatus } from '@/types/rooms';

interface RoomGridProps {
  rooms: Room[];
  onStatusChange: (roomId: string, status: RoomStatus) => void;
}

export function RoomGrid({ rooms, onStatusChange }: RoomGridProps) {
  if (!rooms.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium">No rooms found matching current status/search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}
