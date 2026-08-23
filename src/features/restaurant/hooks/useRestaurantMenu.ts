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

  const toggleAvailability = async (id: number) => {
    try {
      const res = await restaurantService.toggleItemAvailability(id);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_available: res.is_available } : item))
      );
      toast.success(`${res.name} availability toggled.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update item status.');
    }
  };

  return {
    categories,
    menuItems,
    totalCount,
    loading,
    searchQuery,
    setSearchQuery,
    fetchCategories,
    fetchMenuItems,
    toggleAvailability,
  };
}
