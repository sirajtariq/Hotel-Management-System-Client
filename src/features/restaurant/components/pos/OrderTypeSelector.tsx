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
    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedType === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectType(opt.id as OrderType)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all',
              isSelected
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
