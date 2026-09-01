import { Badge } from '@/components/ui/badge';
import { RoomStatus, HousekeepingStatus } from '@/types/rooms';
import { STATUS_STYLE_MAP } from '@/lib/formatters';

interface RoomStatusBadgeProps {
  status: RoomStatus;
  housekeepingStatus?: HousekeepingStatus;
}

export function RoomStatusBadge({ status, housekeepingStatus }: RoomStatusBadgeProps) {
  const hkUpper = String(housekeepingStatus || '').toUpperCase();
  const statusUpper = String(status || 'AVAILABLE').toUpperCase();

  if (statusUpper === 'AVAILABLE' && (hkUpper === 'DIRTY' || hkUpper === 'DIRTY_ROOM')) {
    return (
      <Badge className="bg-rose-100 text-rose-800 border-rose-200 uppercase text-[10px] px-2 py-0.5 font-bold flex items-center gap-1 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
        DIRTY
      </Badge>
    );
  }

  if (statusUpper === 'AVAILABLE' && (hkUpper === 'IN_PROGRESS' || hkUpper === 'CLEANING')) {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 uppercase text-[10px] px-2 py-0.5 font-bold flex items-center gap-1 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        CLEANING
      </Badge>
    );
  }

  const style = STATUS_STYLE_MAP[statusUpper] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Badge className={`${style} capitalize text-[10px] px-2 py-0.5 font-medium`}>
      {status}
    </Badge>
  );
}
