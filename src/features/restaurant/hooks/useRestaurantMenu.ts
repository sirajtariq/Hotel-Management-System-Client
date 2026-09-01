import { useState, useEffect, useCallback } from 'react';
import { restaurantService, Category, MenuItem } from '../services/restaurantService';
import { toast } from '@/components/ui/ToastProvider';

export function useRestaurantMenu(categoryId?: number, page: number = 1, pageSize: number = 10) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await restaurantService.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load menu categories.');
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getMenuItems({
        category_id: categoryId,
        search: searchQuery,
        page,
        page_size: pageSize,
      });
      setMenuItems(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, searchQuery, page, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  const toggleAvailability = async (id: number) => {
    if (togglingId === id) return;
    setTogglingId(id);
    try {
      const res = await restaurantService.toggleItemAvailability(id);
      const nextVal = typeof res.is_available === 'boolean' ? res.is_available : typeof res.isAvailable === 'boolean' ? res.isAvailable : false;
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              ...res,
              is_available: nextVal,
              isAvailable: nextVal,
              is_active: nextVal,
              isActive: nextVal,
            };
          }
          return item;
        })
      );
      toast.success(`${res.name || 'Food item'} status changed to ${nextVal ? 'Available' : 'Unavailable'}.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Failed to update item status.');
    } finally {
      setTogglingId(null);
    }
  };

  return {
    categories,
    menuItems,
    totalCount,
    loading,
    togglingId,
    searchQuery,
    setSearchQuery,
    fetchCategories,
    fetchMenuItems,
    toggleAvailability,
  };
}
