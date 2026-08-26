import { Badge } from '@/components/ui/badge';

function getCategoryColor(name: string): string {
  const str = (name || '').toLowerCase();
  if (str.includes('fuel') || str.includes('diesel') || str.includes('generator')) {
    return 'bg-amber-50 text-amber-800 border-amber-300';
  }
  if (str.includes('util') || str.includes('electric') || str.includes('water') || str.includes('gas')) {
    return 'bg-blue-50 text-blue-800 border-blue-300';
  }
  if (str.includes('grocery') || str.includes('food') || str.includes('kitchen') || str.includes('suppl')) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-300';
  }
  if (str.includes('maint') || str.includes('repair') || str.includes('plumb') || str.includes('hvac')) {
    return 'bg-indigo-50 text-indigo-800 border-indigo-300';
  }
  if (str.includes('staff') || str.includes('welfare') || str.includes('tea') || str.includes('salary')) {
    return 'bg-purple-50 text-purple-800 border-purple-300';
  }
  if (str.includes('laundry') || str.includes('clean') || str.includes('linen')) {
    return 'bg-cyan-50 text-cyan-800 border-cyan-300';
  }
  if (str.includes('market') || str.includes('ad') || str.includes('print')) {
    return 'bg-violet-50 text-violet-800 border-violet-300';
  }
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export function ExpenseCategoryBadge({ category }: { category: string }) {
  const style = getCategoryColor(category);

  return (
    <Badge className={`${style} text-[10px] border font-semibold px-2 py-0.5 rounded-md`}>
      {category}
    </Badge>
  );
}
