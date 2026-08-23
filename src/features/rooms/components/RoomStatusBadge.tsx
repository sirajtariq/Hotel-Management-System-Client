import { Badge } from '@/components/ui/badge';
import { RoomStatus } from '@/types/rooms';
import { STATUS_STYLE_MAP } from '@/lib/formatters';

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const style = STATUS_STYLE_MAP[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Badge className={`${style} capitalize text-[10px] px-2 py-0.5 font-medium`}>
      {status}
    </Badge>
  );
}
