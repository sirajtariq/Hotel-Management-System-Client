import { useState, useEffect, useCallback } from 'react';
import { restaurantService, DiningTable } from '../services/restaurantService';
import { toast } from '@/components/ui/ToastProvider';

export function useDiningTables(propertyId?: number) {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getDiningTables({ property_id: propertyId });
      setTables(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load dining tables.');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    refetchTables: fetchTables,
  };
}
