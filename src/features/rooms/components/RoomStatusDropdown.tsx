import { ChevronDown, Check, Sparkles, AlertTriangle, Lock } from 'lucide-react';
import { RoomStatus } from '@/types/rooms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoomStatusDropdownProps {
  currentStatus: RoomStatus;
  onStatusChange: (newStatus: RoomStatus) => void;
}

export function RoomStatusDropdown({ currentStatus, onStatusChange }: RoomStatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 focus:outline-none cursor-pointer">
        <ChevronDown className="h-3 w-3 text-slate-400 hover:text-slate-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => onStatusChange('available')} className="gap-2 text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          <span>Available</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('cleaning')} className="gap-2 text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Cleaning</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('maintenance')} className="gap-2 text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Maintenance</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('reserved')} className="gap-2 text-blue-700">
          <Lock className="h-3.5 w-3.5" />
          <span>Reserved</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
