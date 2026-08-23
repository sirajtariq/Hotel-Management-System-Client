import { Calendar } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface DateRangePickerFilterProps {
  range: string;
  onRangeChange: (val: string) => void;
}

export function DateRangePickerFilter({ range, onRangeChange }: DateRangePickerFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
      <Select value={range} onChange={(e) => onRangeChange(e.target.value)} className="text-xs h-8">
        <option value="this_month">This Month (Aug 2026)</option>
        <option value="q3">Current Quarter (Q3 2026)</option>
        <option value="ytd">Year to Date (2026)</option>
        <option value="last_year">Prior Year (2025)</option>
      </Select>
    </div>
  );
}
