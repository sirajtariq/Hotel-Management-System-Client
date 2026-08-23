import { Badge } from '@/components/ui/badge';
import { ExpenseCategory } from '@/types/expenses';

const CATEGORY_STYLES: Record<ExpenseCategory, string> = {
  utilities: 'bg-blue-50 text-blue-700 border-blue-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  supplies: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  salaries: 'bg-purple-50 text-purple-700 border-purple-200',
  marketing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  taxes: 'bg-rose-50 text-rose-700 border-rose-200',
  miscellaneous: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function ExpenseCategoryBadge({ category }: { category: ExpenseCategory }) {
  const style = CATEGORY_STYLES[category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <Badge className={`${style} capitalize text-[10px] border font-medium`}>
      {category}
    </Badge>
  );
}
