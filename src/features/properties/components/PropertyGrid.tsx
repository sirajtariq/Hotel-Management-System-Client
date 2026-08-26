import React from 'react';
import { PropertyCard } from './PropertyCard';
import { Property } from '@/types/properties';

interface PropertyGridProps {
  properties: Property[];
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export function PropertyGrid({ properties, onEdit, onDelete }: PropertyGridProps) {
  if (!properties.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-xs">
        <p className="text-xs text-slate-500 font-medium">No properties match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
