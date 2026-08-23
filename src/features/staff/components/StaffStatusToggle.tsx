import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert } from 'lucide-react';

interface StaffStatusToggleProps {
  isOnDuty: boolean;
  onToggle: () => void;
}

export function StaffStatusToggle({ isOnDuty, onToggle }: StaffStatusToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`h-7 px-2 text-[10px] gap-1 font-semibold ${
        isOnDuty
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
      }`}
    >
      {isOnDuty ? (
        <>
          <Shield className="h-3 w-3" />
          On Duty
        </>
      ) : (
        <>
          <ShieldAlert className="h-3 w-3 text-slate-400" />
          Off Duty
        </>
      )}
    </Button>
  );
}
