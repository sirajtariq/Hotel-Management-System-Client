import { Building2 } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface PropertySelectFilterProps {
  selectedProperty: string;
  onPropertyChange: (val: string) => void;
}

export function PropertySelectFilter({ selectedProperty, onPropertyChange }: PropertySelectFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
      <Select
        value={selectedProperty}
        onChange={(e) => onPropertyChange(e.target.value)}
        className="text-xs h-8"
      >
        <option value="all">All Tenant Properties</option>
        <option value="prop_01">Pearl Continental & Serviced Suites</option>
        <option value="prop_02">Grand Horizon Luxury Apartments</option>
        <option value="prop_03">Margalla View Boutique Hotel</option>
      </Select>
    </div>
  );
}
