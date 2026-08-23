import { Building, MapPin, BedDouble, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/properties';
import { formatPKR } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:border-slate-300 transition-colors flex flex-col justify-between">
      <CardHeader className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-slate-900 text-white">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">{property.name}</CardTitle>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>{property.city}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="capitalize text-[10px]">
            {(property.type || 'hotel').replace('_', ' ')}
          </Badge>

        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Rooms Breakdown Grid */}
        <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-md bg-slate-50 border border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">{property.totalRooms}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-600 font-semibold uppercase">Booked</div>
            <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">{property.occupiedRooms}</div>
          </div>
          <div>
            <div className="text-[10px] text-amber-600 font-semibold uppercase">Clean</div>
            <div className="text-sm font-bold text-amber-700 font-mono tabular-nums">{property.cleaningRooms}</div>
          </div>
          <div>
            <div className="text-[10px] text-blue-600 font-semibold uppercase">Free</div>
            <div className="text-sm font-bold text-blue-700 font-mono tabular-nums">{property.availableRooms}</div>
          </div>
        </div>

        {/* Revenue & Occupancy */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-[11px] text-slate-400">Est. Monthly Revenue</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {formatPKR(property.monthlyRevenue)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Occupancy</div>
            <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
              {property.occupancyRate}%
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/rooms')}
          className="w-full text-xs gap-1.5 mt-2"
        >
          <BedDouble className="h-3.5 w-3.5" />
          Manage Rooms Matrix
          <ArrowUpRight className="h-3 w-3 ml-auto text-slate-400" />
        </Button>
      </CardContent>
    </Card>
  );
}
