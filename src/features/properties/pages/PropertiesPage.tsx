import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { PropertyFilter } from '../components/PropertyFilter';
import { PropertyGrid } from '../components/PropertyGrid';
import { AddEditPropertyModal } from '../components/AddEditPropertyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Property } from '@/types/properties';

export function PropertiesPage() {
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
    <PermissionGuard permission="properties:view" moduleName="Properties & Locations">
      <div className="space-y-6 pb-12 font-sans">
        <PageHeader
          title="Properties & Branches"
          description="Multi-tenant property registry, room counts, live occupancy and revenue metrics"
          actions={
            <Can permission="properties:manage">
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950 shadow-xs"
                onClick={() => {
                  setEditingProperty(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Property</span>
              </Button>
            </Can>
          }
        />

        <PropertyFilter
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4"
              >
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
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
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
    </PermissionGuard>
  );
}
