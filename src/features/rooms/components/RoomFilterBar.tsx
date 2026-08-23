import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/properties';

interface RoomFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusTab: string;
  onStatusTabChange: (val: string) => void;
  floorFilter: string;
  onFloorFilterChange: (val: string) => void;
  propertyFilter: string;
  onPropertyFilterChange: (val: string) => void;
  properties: Property[];
}

export function RoomFilterBar({
  search,
  onSearchChange,
  statusTab,
  onStatusTabChange,
  floorFilter,
  onFloorFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  properties,
}: RoomFilterBarProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        <Tabs value={statusTab} onValueChange={onStatusTabChange} className="w-full lg:w-auto">
          <TabsList className="grid grid-cols-5 w-full lg:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
            <TabsTrigger value="reserved">Reserved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
          {properties.length > 0 && (
            <Select
              value={propertyFilter}
              onChange={(e) => onPropertyFilterChange(e.target.value)}
              className="w-full sm:w-48 text-xs font-semibold bg-white border-slate-200"
            >
              <option value="all">All Properties ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}

          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search room..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={floorFilter}
            onChange={(e) => onFloorFilterChange(e.target.value)}
            className="w-28 text-xs"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

