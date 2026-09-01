import { apiClient } from '@/lib/axios';
import { TenantItem, TenantMetrics, CreateTenantPayload, UpdateTenantPayload } from '@/types/tenants';

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const tenantService = {
  async getTenants(params?: { page?: number; page_size?: number; search?: string }): Promise<{ items: TenantItem[]; totalCount: number }> {
    try {
      const response = await apiClient.get('/tenants/', { params });
      if (response.data && Array.isArray(response.data.results)) {
        return {
          items: response.data.results,
          totalCount: response.data.count ?? response.data.results.length,
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data,
          totalCount: response.data.length,
        };
      }
      return { items: [], totalCount: 0 };
    } catch {
      return { items: [], totalCount: 0 };
    }
  },

  async getTenant(id: string): Promise<TenantItem> {
    const response = await apiClient.get<TenantItem>(`/tenants/${id}/`);
    return response.data;
  },

  async getMetrics(): Promise<TenantMetrics> {
    try {
      const response = await apiClient.get('/tenants/metrics/');
      return response.data;
    } catch {
      return {
        total_tenants: 0,
        active_tenants: 0,
        inactive_tenants: 0,
        monthly_recurring_revenue: 0,
        one_time_revenue: 0,
        annual_recurring_revenue: 0,
      };
    }
  },

  async getPlatformAnalytics(): Promise<{
    metrics: {
      monthlyMrr: number;
      estimatedArr: number;
      oneTimeRevenue: number;
      activeTenantsCount: number;
      totalTenantsCount: number;
    };
    breakdown: TenantItem[];
  }> {
    const response = await apiClient.get('/tenants/platform-analytics/');
    return response.data;
  },

  async getSubscriptionHistory(id: string): Promise<{
    tenantId: string;
    tenantName: string;
    currentPlan: string;
    nextDueDate?: string | null;
    history: Array<{
      id: string;
      invoiceDate?: string;
      dueDate?: string | null;
      plan: string;
      billingType: string;
      amountPaid: number;
      paymentMethod: string;
      status?: string;
    }>;
  }> {
    const response = await apiClient.get(`/tenants/${id}/subscription-history/`);
    return response.data;
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
      throw err;
    }
  },

  async updateTenant(id: string, payload: UpdateTenantPayload): Promise<TenantItem> {
    try {
      const response = await apiClient.patch<TenantItem>(`/tenants/${id}/`, payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object' 
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : String(errorData);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async deleteTenant(id: string): Promise<void> {
    await apiClient.delete(`/tenants/${id}/`);
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
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object' 
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : String(errorData);
        throw new Error(msg);
      }
      throw err;
    }
  },

  async recordPayment(
    id: string,
    payload: { amount_paid: number; payment_method: string; months_to_extend: number }
  ): Promise<TenantItem> {
    try {
      const response = await apiClient.post<TenantItem>(`/tenants/${id}/record_subscription_payment/`, payload);
      return response.data;
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object' 
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ') 
          : String(errorData);
        throw new Error(msg);
      }
      throw err;
    }
  },
};
