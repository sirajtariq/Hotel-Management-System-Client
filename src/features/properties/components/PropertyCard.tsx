import React, { useState } from 'react';
import { Building, MapPin, BedDouble, ArrowUpRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/properties';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to delete property branch "${property.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(property);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const total = property.totalRooms ?? property.total_rooms ?? 0;
  const booked = property.bookedRooms ?? property.booked_rooms ?? property.occupiedRooms ?? property.occupied_rooms ?? 0;
  const cleaning = property.cleaningRooms ?? property.cleaning_rooms ?? 0;
  const free = property.availableRooms ?? property.available_rooms ?? 0;
  const revenue = property.estMonthlyRevenue ?? property.est_monthly_revenue ?? property.monthlyRevenue ?? property.monthly_rent ?? 0;
  const occupancy = property.occupancyRate ?? property.occupancy_rate ?? 0;
  const typeLabel = property.propertyType || property.property_type || property.type || 'Hotel Branch';

  const formatPKR = (amt: number | string) => `PKR ${Number(amt || 0).toLocaleString('en-PK')}`;

  return (
    <Card className="hover:border-slate-300 transition-colors flex flex-col justify-between shadow-xs border border-slate-200 rounded-xl overflow-hidden bg-white">
      <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-900 text-white shrink-0 shadow-xs mt-0.5">
              <Building className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold text-slate-900 truncate">{property.name}</CardTitle>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-medium truncate">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{property.city} {property.address ? `- ${property.address}` : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="outline" className="capitalize text-[10px] font-bold bg-indigo-50 text-indigo-800 border-indigo-200">
              {typeLabel}
            </Badge>

            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onEdit(property)}
                className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                title="Edit Property Branch"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete Property Branch"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Room Status Matrix Bar (4-grid strip) */}
        <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</div>
            <div className="text-sm font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">{total}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Booked</div>
            <div className="text-sm font-extrabold text-emerald-700 font-mono tabular-nums mt-0.5">{booked}</div>
          </div>
          <div>
            <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Clean</div>
            <div className="text-sm font-extrabold text-amber-700 font-mono tabular-nums mt-0.5">{cleaning}</div>
          </div>
          <div>
            <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Free</div>
            <div className="text-sm font-extrabold text-blue-700 font-mono tabular-nums mt-0.5">{free}</div>
          </div>
        </div>

        {/* Financial & Occupancy Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Est. Monthly Revenue</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">
              {formatPKR(revenue)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Live Occupancy</div>
            <div className="text-sm font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
              {occupancy}%
            </div>
          </div>
        </div>

        {/* Footer Navigation Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/administration?tab=rooms&propertyId=${property.id}`)}
          className="w-full text-xs font-semibold gap-1.5 mt-2 text-indigo-900 hover:text-indigo-950 hover:bg-indigo-50 border-indigo-200"
        >
          <BedDouble className="h-3.5 w-3.5 text-indigo-600" />
          <span>Manage Rooms Matrix</span>
          <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-indigo-400" />
        </Button>
      </CardContent>
    </Card>
  );
}
