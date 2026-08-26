import { apiClient } from '@/lib/axios';
import { StaffMember, CreateStaffInput, UpdateStaffInput } from '@/types/staff';

export function normalizeStaff(s: any): StaffMember {
  const sal = parseFloat(s.monthly_salary || s.salary || '0');
  const hasLogin = Boolean(s.has_login_access || s.user || s.username);

  return {
    id: String(s.id),
    name: s.name || s.fullName || 'Staff Member',
    phone_number: s.phone_number || s.phone || '',
    position: s.position || 'Staff',
    department: s.department || '',
    property: s.property ? String(s.property) : null,
    property_name: s.property_name || s.propertyName || 'All Properties',
    monthly_salary: isNaN(sal) ? 0 : sal,
    hired_date: s.hired_date || s.joinedDate || s.created_at || null,
    is_active: s.is_active !== false,
    has_login_access: hasLogin,
    user_id: s.user_id || s.user?.id || null,
    username: s.username || s.user?.username || '',
    email: s.email || s.user?.email || '',
    custom_role: s.custom_role ? { id: s.custom_role.id, name: s.custom_role.name } : null,
    created_at: s.created_at || new Date().toISOString(),
  };
}

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const staffService = {
  async getStaff(params?: { page?: number; page_size?: number; search?: string }): Promise<{ items: StaffMember[]; totalCount: number }> {
    try {
      const response = await apiClient.get('/staff/', { params });
      if (response.data && Array.isArray(response.data.results)) {
        return {
          items: response.data.results.map(normalizeStaff),
          totalCount: response.data.count ?? response.data.results.length,
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data.map(normalizeStaff),
          totalCount: response.data.length,
        };
      }
      return { items: [], totalCount: 0 };
    } catch {
      return { items: [], totalCount: 0 };
    }
  },

  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    try {
      const response = await apiClient.post<StaffMember>('/staff/', input);
      return normalizeStaff(response.data);
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

  async updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    try {
      const response = await apiClient.patch<StaffMember>(`/staff/${id}/`, input);
      return normalizeStaff(response.data);
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

  async deleteStaff(id: string): Promise<void> {
    await apiClient.delete(`/staff/${id}/`);
  },
};
