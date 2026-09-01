import React, { useState, useEffect } from 'react';
import { PropertyFilter } from '@/features/properties/components/PropertyFilter';
import { PropertyGrid } from '@/features/properties/components/PropertyGrid';
import { AddEditPropertyModal } from '@/features/properties/components/AddEditPropertyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';
import { propertyService } from '@/features/properties/services/propertyService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Property } from '@/types/properties';

export function PropertiesAdminTab() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const data = await propertyService.getProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (prop: Property) => {
    try {
      await propertyService.deleteProperty(prop.id);
      toast.success('Property Deleted', `Successfully deleted ${prop.name}`);
      setProperties((prev) => prev.filter((item) => item.id !== prop.id));
    } catch {
      toast.error('Action Failed', 'Could not delete property branch.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProperty(null);
  };

  const safeProperties = Array.isArray(properties) ? properties : [];

  const filteredProperties = safeProperties.filter((p) => {
    const nameStr = p.name || '';
    const cityStr = p.city || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      cityStr.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter || p.propertyType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-600" />
            Active Branch & Property Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage multi-tenant property locations, room counts, address details, and monthly rent metrics
          </p>
        </div>

        <Can permission="properties:manage">
          <Button
            size="sm"
            onClick={() => {
              setEditingProperty(null);
              setIsModalOpen(true);
            }}
            className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-3.5 py-2 shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Property</span>
          </Button>
        </Can>
      </div>

      <PropertyFilter
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <PropertyGrid
          properties={filteredProperties}
          onEdit={handleEditProperty}
          onDelete={handleDeleteProperty}
        />
      )}

      <AddEditPropertyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchProperties}
        propertyToEdit={editingProperty}
      />
    </div>
  );
}
