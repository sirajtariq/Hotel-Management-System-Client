import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface PropertyFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
}

export function PropertyFilter({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}: PropertyFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-6">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter properties by name or city..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="text-xs"
        >
          <option value="all">All Property Types</option>
          <option value="serviced_apartment">Serviced Apartments</option>
          <option value="hotel">Boutique Hotels</option>
          <option value="resort">Resorts</option>
        </Select>
      </div>
    </div>
  );
}
