import { Category } from '../../services/restaurantService';
import { cn } from '@/lib/utils';
import { Utensils } from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function CategoryPills({ categories, selectedCategoryId, onSelectCategory }: CategoryPillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs',
          selectedCategoryId === null
            ? 'bg-indigo-900 text-white shadow-indigo-900/20'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        )}
      >
        <Utensils className="h-3.5 w-3.5" />
        All Items
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs',
            selectedCategoryId === cat.id
              ? 'bg-indigo-900 text-white shadow-indigo-900/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          )}
        >
          <span>{cat.name}</span>
          {typeof cat.items_count === 'number' && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                selectedCategoryId === cat.id ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-500'
              )}
            >
              {cat.items_count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
