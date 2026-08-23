import { MenuItem } from '../../services/restaurantService';
import { Plus, UtensilsCrossed, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const priceDisplay = Number(item.base_price).toLocaleString();

  return (
    <div
      onClick={() => item.is_available && onSelect(item)}
      className={cn(
        'group relative bg-white border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
        !item.is_available ? 'opacity-60 grayscale cursor-not-allowed border-slate-200' : 'border-slate-200/80 hover:border-indigo-500/50'
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <UtensilsCrossed className="h-5 w-5" />
            )}
          </div>

          {!item.is_available ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
              Unavailable
            </span>
          ) : item.has_variations ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              <Layers className="h-3 w-3" />
              Variants
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              Available
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-900 transition-colors">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
          <span className="text-sm font-extrabold text-slate-900">
            PKR {priceDisplay}
            {item.has_variations && <span className="text-xs text-slate-400 font-normal"> +</span>}
          </span>
        </div>

        <button
          type="button"
          disabled={!item.is_available}
          className="h-8 w-8 rounded-xl bg-indigo-900 text-white flex items-center justify-center hover:bg-indigo-800 active:scale-95 transition-all shadow-xs"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
