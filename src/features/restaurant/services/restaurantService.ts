import { apiClient } from '@/lib/axios';

export interface Category {
  id: number;
  tenant?: number;
  name: string;
  display_order: number;
  is_active: boolean;
  items_count?: number;
}

export interface MenuItemVariation {
  id?: number;
  menu_item?: number;
  name: string;
  price: number | string;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  category: number;
  category_name?: string;
  name: string;
  description?: string;
  base_price: number | string;
  has_variations: boolean;
  is_available: boolean;
  image_url?: string;
  variations?: MenuItemVariation[];
}

export interface DiningTable {
  id: number;
  property: number;
  property_name?: string;
  table_number: string;
  capacity: number;
  floor_or_section: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

export interface RestaurantOrderItem {
  id?: number;
  menu_item: number;
  menu_item_name?: string;
  variation?: number | null;
  item_name: string;
  variation_name?: string;
  unit_price: number | string;
  quantity: number;
  total_price: number | string;
  special_instructions?: string;
  status: 'PENDING' | 'PREPARING' | 'READY';
}

export interface RestaurantOrder {
  id: number;
  property?: number;
  property_name?: string;
  order_number: string;
  order_type: 'DINE_IN' | 'TAKEAWAY' | 'ROOM_SERVICE';
  table?: number | null;
  table_number?: string;
  booking?: number | null;
  room_number?: string;
  customer_name?: string;
  customer_phone?: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PAID' | 'BILLED_TO_ROOM';
  payment_method?: string;
  subtotal: number | string;
  discount_type: 'FLAT' | 'PERCENTAGE';
  discount_value: number | string;
  discount_amount: number | string;
  tax_percentage: number | string;
  tax_amount: number | string;
  grand_total: number | string;
  notes?: string;
  created_by_name?: string;
  created_at: string;
  items_count?: number;
  items?: RestaurantOrderItem[];
}

export interface CreateOrderItemInput {
  menu_item_id: number;
  variation_id?: number | null;
  unit_price: number;
  quantity: number;
  special_instructions?: string;
}

export interface CreateOrderPayload {
  property_id: number;
  order_type: 'DINE_IN' | 'TAKEAWAY' | 'ROOM_SERVICE';
  table_id?: number | null;
  booking_id?: number | null;
  room_number?: string;
  customer_name?: string;
  customer_phone?: string;
  payment_status?: 'UNPAID' | 'PAID' | 'BILLED_TO_ROOM';
  payment_method?: string;
  discount_type?: 'FLAT' | 'PERCENTAGE';
  discount_value?: number;
  tax_percentage?: number;
  notes?: string;
  items: CreateOrderItemInput[];
}

export interface ReceiptData {
  header: {
    tenant_name: string;
    property_name: string;
    property_address: string;
    property_phone: string;
  };
  order: {
    id: number;
    order_number: string;
    order_type: string;
    order_type_code: string;
    table_number?: string | null;
    room_number?: string;
    customer_name?: string;
    customer_phone?: string;
    status: string;
    payment_status: string;
    payment_method: string;
    created_at: string;
    created_by: string;
  };
  financials: {
    subtotal: string;
    discount_type: string;
    discount_value: string;
    discount_amount: string;
    tax_percentage: string;
    tax_amount: string;
    grand_total: string;
  };
  items: Array<{
    id: number;
    item_name: string;
    variation_name: string;
    unit_price: string;
    quantity: number;
    total_price: string;
    special_instructions: string;
    status: string;
  }>;
  notes?: string;
}

export const restaurantService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/restaurant/categories/');
    return res.data.results || res.data;
  },
  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post('/restaurant/categories/', data);
    return res.data;
  },
  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    const res = await apiClient.patch(`/restaurant/categories/${id}/`, data);
    return res.data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurant/categories/${id}/`);
  },

  // Menu Items
  getMenuItems: async (params?: { category_id?: number; search?: string; available_only?: boolean }): Promise<MenuItem[]> => {
    const res = await apiClient.get('/restaurant/items/', { params });
    return res.data.results || res.data;
  },
  createMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await apiClient.post('/restaurant/items/', data);
    return res.data;
  },
  updateMenuItem: async (id: number, data: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await apiClient.patch(`/restaurant/items/${id}/`, data);
    return res.data;
  },
  deleteMenuItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurant/items/${id}/`);
  },
  toggleItemAvailability: async (id: number): Promise<{ id: number; name: string; is_available: boolean }> => {
    const res = await apiClient.post(`/restaurant/items/${id}/toggle_availability/`);
    return res.data;
  },

  // Dining Tables
  getDiningTables: async (params?: { property_id?: number; status?: string }): Promise<DiningTable[]> => {
    const res = await apiClient.get('/restaurant/tables/', { params });
    return res.data.results || res.data;
  },
  createDiningTable: async (data: Partial<DiningTable>): Promise<DiningTable> => {
    const res = await apiClient.post('/restaurant/tables/', data);
    return res.data;
  },
  updateDiningTable: async (id: number, data: Partial<DiningTable>): Promise<DiningTable> => {
    const res = await apiClient.patch(`/restaurant/tables/${id}/`, data);
    return res.data;
  },
  deleteDiningTable: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurant/tables/${id}/`);
  },

  // Restaurant Orders
  getOrders: async (params?: {
    property_id?: number;
    status?: string;
    order_type?: string;
    payment_status?: string;
    search?: string;
    active_kitchen?: boolean;
    date?: string;
  }): Promise<RestaurantOrder[]> => {
    const res = await apiClient.get('/restaurant/orders/', { params });
    return res.data.results || res.data;
  },
  getOrderDetail: async (id: number): Promise<RestaurantOrder> => {
    const res = await apiClient.get(`/restaurant/orders/${id}/`);
    return res.data;
  },
  createOrder: async (data: CreateOrderPayload): Promise<RestaurantOrder> => {
    const res = await apiClient.post('/restaurant/orders/', data);
    return res.data;
  },
  updateKitchenStatus: async (id: number, status: string, item_id?: number): Promise<RestaurantOrder> => {
    const res = await apiClient.post(`/restaurant/orders/${id}/update_kitchen_status/`, { status, item_id });
    return res.data;
  },
  settlePayment: async (id: number, payload: { payment_status: string; payment_method: string; booking_id?: number }): Promise<RestaurantOrder> => {
    const res = await apiClient.post(`/restaurant/orders/${id}/settle_payment/`, payload);
    return res.data;
  },
  getReceiptData: async (id: number): Promise<ReceiptData> => {
    const res = await apiClient.get(`/restaurant/orders/${id}/receipt_data/`);
    return res.data;
  },
};
