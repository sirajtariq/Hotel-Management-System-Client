import { apiClient } from '@/lib/axios';
import { TenantItem, TenantMetrics, CreateTenantPayload, UpdateTenantPayload } from '@/types/tenants';

const MOCK_TENANTS: TenantItem[] = [
  {
    id: '1',
    name: 'Pearl Continental & Serviced Suites',
    slug: 'pearl-continental',
    subscription_plan: 'PREMIUM',
    billing_type: 'MONTHLY',
    price_amount: 150000,
    is_active: true,
    contact_email: 'management@pcss.com',
    contact_phone: '+92 300 1234567',
    notes: 'Premium enterprise tenant with 4 active properties in Karachi & Lahore.',
    max_properties: null,
    max_rooms: null,
    max_users: null,
    current_properties_count: 3,
    current_rooms_count: 10,
    current_users_count: 8,
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-01-15T10:30:00Z',
    users_count: 8,
  },
  {
    id: '2',
    name: 'Grand Horizon Apartments',
    slug: 'grand-horizon',
    subscription_plan: 'STANDARD',
    billing_type: 'MONTHLY',
    price_amount: 85000,
    is_active: true,
    contact_email: 'info@grandhorizon.pk',
    contact_phone: '+92 321 9876543',
    notes: 'Standard 2-property hospitality agreement.',
    max_properties: 5,
    max_rooms: 20,
    max_users: 5,
    current_properties_count: 2,
    current_rooms_count: 14,
    current_users_count: 4,
    created_at: '2026-02-01T14:15:00Z',
    updated_at: '2026-02-01T14:15:00Z',
    users_count: 4,
  },
  {
    id: '3',
    name: 'Margalla Heights Boutique',
    slug: 'margalla-heights',
    subscription_plan: 'BASIC',
    billing_type: 'ONE_TIME',
    price_amount: 500000,
    is_active: true,
    contact_email: 'owner@margallaheights.com',
    contact_phone: '+92 333 5554433',
    notes: 'Lifetime one-time license purchase with single property limit.',
    max_properties: 1,
    max_rooms: 5,
    max_users: 2,
    current_properties_count: 1,
    current_rooms_count: 5,
    current_users_count: 2,
    created_at: '2026-03-10T09:00:00Z',
    updated_at: '2026-03-10T09:00:00Z',
    users_count: 3,
  },
];

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const tenantService = {
  async getTenants(): Promise<TenantItem[]> {
    try {
      const response = await apiClient.get('/tenants/');
      return extractArray<TenantItem>(response.data, MOCK_TENANTS);
    } catch {
      return MOCK_TENANTS;
    }
  },

  async getMetrics(): Promise<TenantMetrics> {
    try {
      const response = await apiClient.get('/tenants/metrics/');
      return response.data;
    } catch {
      const activeCount = MOCK_TENANTS.filter((t) => t.is_active).length;
      const mrr = MOCK_TENANTS.filter((t) => t.is_active && t.billing_type === 'MONTHLY').reduce(
        (acc, t) => acc + Number(t.price_amount),
        0
      );
      const oneTime = MOCK_TENANTS.filter((t) => t.billing_type === 'ONE_TIME').reduce(
        (acc, t) => acc + Number(t.price_amount),
        0
      );
      const annual = MOCK_TENANTS.filter((t) => t.is_active && t.billing_type === 'ANNUAL').reduce(
        (acc, t) => acc + Number(t.price_amount),
        0
      );
      return {
        total_tenants: MOCK_TENANTS.length,
        active_tenants: activeCount,
        inactive_tenants: MOCK_TENANTS.length - activeCount,
        monthly_recurring_revenue: mrr,
        one_time_revenue: oneTime,
        annual_recurring_revenue: annual,
      };
    }
  },

  async createTenant(payload: CreateTenantPayload): Promise<TenantItem> {
    try {
      const response = await apiClient.post<TenantItem>('/tenants/', payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object' 
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : String(errorData);
        throw new Error(msg);
      }
      // Fallback
      const newTenant: TenantItem = {
        id: String(Date.now()),
        name: payload.name,
        slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subscription_plan: payload.subscription_plan,
        billing_type: payload.billing_type,
        price_amount: payload.price_amount,
        is_active: payload.is_active ?? true,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone || '',
        notes: payload.notes || '',
        max_properties: payload.max_properties ?? null,
        max_rooms: payload.max_rooms ?? null,
        max_users: payload.max_users ?? null,
        current_properties_count: 0,
        current_rooms_count: 0,
        current_users_count: payload.admin_username ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        users_count: payload.admin_username ? 1 : 0,
      };
      MOCK_TENANTS.unshift(newTenant);
      return newTenant;
    }
  },


  async updateTenant(id: string, payload: UpdateTenantPayload): Promise<TenantItem> {
    try {
      const response = await apiClient.patch<TenantItem>(`/tenants/${id}/`, payload);
      return response.data;
    } catch (err: any) {
      const index = MOCK_TENANTS.findIndex((t) => t.id === id);
      if (index !== -1) {
        MOCK_TENANTS[index] = {
          ...MOCK_TENANTS[index],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        return MOCK_TENANTS[index];
      }
      throw err;
    }
  },

  async deleteTenant(id: string): Promise<void> {
    try {
      await apiClient.delete(`/tenants/${id}/`);
    } catch {
      const index = MOCK_TENANTS.findIndex((t) => t.id === id);
      if (index !== -1) {
        MOCK_TENANTS.splice(index, 1);
      }
    }
  },

  async impersonateTenant(id: string): Promise<{
    access: string;
    refresh: string;
    user: any;
    is_impersonated: boolean;
    original_superadmin_id?: number | string;
    tenant_name?: string;
  }> {
    try {
      const response = await apiClient.post(`/tenants/${id}/impersonate/`);
      return response.data;
    } catch {
      const target = MOCK_TENANTS.find((t) => t.id === id) || MOCK_TENANTS[0];
      return {
        access: `mock_impersonated_access_token_${Date.now()}`,
        refresh: `mock_impersonated_refresh_token_${Date.now()}`,
        user: {
          id: `imp_user_${id}`,
          email: target.contact_email || 'admin@tenant.com',
          firstName: target.name.split(' ')[0] || 'Tenant',
          lastName: 'Admin',
          role: 'tenant_admin',
          tenantId: target.id,
          tenantName: target.name,
          availableTenants: [
            {
              id: target.id,
              name: target.name,
              code: target.slug.toUpperCase(),
              activePropertiesCount: 2,
            },
          ],
          is_impersonated: true,
        },
        is_impersonated: true,
        original_superadmin_id: 'super_admin_1',
        tenant_name: target.name,
      };
    }
  },

  async recordPayment(
    id: string,
    payload: { amount_paid: number; payment_method: string; months_to_extend: number }
  ): Promise<TenantItem> {
    try {
      const response = await apiClient.post<TenantItem>(`/tenants/${id}/record_subscription_payment/`, payload);
      return response.data;
    } catch {
      const target = MOCK_TENANTS.find((t) => t.id === id);
      if (target) {
        target.subscription_status = 'PAID';
        const currentDue = target.next_due_date ? new Date(target.next_due_date) : new Date();
        currentDue.setDate(currentDue.getDate() + payload.months_to_extend * 30);
        target.next_due_date = currentDue.toISOString().split('T')[0];
        return { ...target };
      }
      throw new Error('Tenant not found');
    }
  },
};

