import { Utensils, ShoppingBag, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'ROOM_SERVICE';

interface OrderTypeSelectorProps {
  selectedType: OrderType;
  onSelectType: (type: OrderType) => void;
}

export function OrderTypeSelector({ selectedType, onSelectType }: OrderTypeSelectorProps) {
  const options = [
    { id: 'DINE_IN', label: 'Dine-In', icon: Utensils },
    { id: 'TAKEAWAY', label: 'Takeaway', icon: ShoppingBag },
    { id: 'ROOM_SERVICE', label: 'Room Service', icon: BellRing },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl font-sans">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedType === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectType(opt.id as OrderType)}
            className={cn(
              'flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer',
              isSelected
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
