import { useState, useEffect, useCallback } from 'react';
import { restaurantService, RestaurantOrder, CreateOrderPayload } from '../services/restaurantService';
import { toast } from '@/components/ui/ToastProvider';

export function useRestaurantOrders(filters?: {
  property_id?: number;
  status?: string;
  order_type?: string;
  payment_status?: string;
  active_kitchen?: boolean;
  search?: string;
  date?: string;
  autoRefreshMs?: number;
  page?: number;
  pageSize?: number;
}) {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getOrders({
        property_id: filters?.property_id,
        status: filters?.status,
        order_type: filters?.order_type,
        payment_status: filters?.payment_status,
        active_kitchen: filters?.active_kitchen,
        search: filters?.search,
        date: filters?.date,
        page: filters?.page,
        page_size: filters?.pageSize,
      });
      setOrders(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to fetch restaurant orders.');
    } finally {
      setLoading(false);
    }
  }, [
    filters?.property_id,
    filters?.status,
    filters?.order_type,
    filters?.payment_status,
    filters?.active_kitchen,
    filters?.search,
    filters?.date,
    filters?.page,
    filters?.pageSize,
  ]);

  useEffect(() => {
    fetchOrders();

    if (filters?.autoRefreshMs && filters.autoRefreshMs > 0) {
      const interval = setInterval(() => {
        fetchOrders();
      }, filters.autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetchOrders, filters?.autoRefreshMs]);

  const createOrder = async (payload: CreateOrderPayload): Promise<RestaurantOrder | null> => {
    try {
      const order = await restaurantService.createOrder(payload);
      toast.success(`Order #${order.order_number} created successfully!`);
      fetchOrders();
      return order;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to place order.');
      return null;
    }
  };

  const updateKitchenStatus = async (orderId: number, status: string, itemId?: number) => {
    try {
      const updated = await restaurantService.updateKitchenStatus(orderId, status, itemId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success(`Order status updated to ${status}.`);
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update order status.');
      return null;
    }
  };

  const settlePayment = async (orderId: number, paymentStatus: string, paymentMethod: string, bookingId?: number) => {
    try {
      const updated = await restaurantService.settlePayment(orderId, {
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        booking_id: bookingId,
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast.success('Payment settled successfully!');
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to settle payment.');
      return null;
    }
  };

  return {
    orders,
    totalCount,
    loading,
    refetchOrders: fetchOrders,
    createOrder,
    updateKitchenStatus,
    settlePayment,
  };
}
