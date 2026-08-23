import { apiClient } from '@/lib/axios';
import { StaffMember, CreateStaffInput, UpdateStaffInput } from '@/types/staff';

const MOCK_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Tariq Mahmood',
    phone_number: '+92 300 1234567',
    position: 'Hotel Manager',
    department: 'Management',
    property: '1',
    property_name: 'Pearl Continental & Serviced Suites',
    monthly_salary: 150000,
    hired_date: '2025-06-01',
    is_active: true,
    has_login_access: true,
    user_id: '10',
    username: 'pc_manager',
    email: 'tariq@pcss.com',
    custom_role: { id: '1', name: 'Property Manager' },
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bilal Ahmed',
    phone_number: '+92 333 4445556',
    position: 'Front Desk Receptionist',
    department: 'Front Office',
    property: '1',
    property_name: 'Pearl Continental & Serviced Suites',
    monthly_salary: 65000,
    hired_date: '2025-09-15',
    is_active: true,
    has_login_access: true,
    user_id: '11',
    username: 'bilal_reception',
    email: 'bilal@pcss.com',
    custom_role: { id: '2', name: 'Front Desk Agent' },
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Zubair Khan',
    phone_number: '+92 345 1112223',
    position: 'Head Housekeeper',
    department: 'Housekeeping',
    property: '1',
    property_name: 'Pearl Continental & Serviced Suites',
    monthly_salary: 45000,
    hired_date: '2026-01-10',
    is_active: true,
    has_login_access: false,
    created_at: new Date().toISOString(),
  },
];

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
      const newStaff: StaffMember = {
        id: String(Date.now()),
        name: input.name,
        phone_number: input.phone_number || '',
        position: input.position,
        property: input.property ? String(input.property) : null,
        property_name: 'Hotel Property',
        monthly_salary: input.monthly_salary,
        hired_date: input.hired_date || new Date().toISOString().split('T')[0],
        is_active: input.is_active ?? true,
        has_login_access: input.enable_login,
        username: input.login_username || '',
        email: input.login_email || '',
        created_at: new Date().toISOString(),
      };
      MOCK_STAFF.unshift(newStaff);
      return newStaff;
    }
  },

  async updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    try {
      const response = await apiClient.patch<StaffMember>(`/staff/${id}/`, input);
      return normalizeStaff(response.data);
    } catch (err: any) {
      const index = MOCK_STAFF.findIndex((s) => s.id === id);
      if (index !== -1) {
        MOCK_STAFF[index] = {
          ...MOCK_STAFF[index],
          ...input,
          has_login_access: input.enable_login ?? MOCK_STAFF[index].has_login_access,
        };
        return MOCK_STAFF[index];
      }
      throw err;
    }
  },

  async deleteStaff(id: string): Promise<void> {
    try {
      await apiClient.delete(`/staff/${id}/`);
    } catch {
      const index = MOCK_STAFF.findIndex((s) => s.id === id);
      if (index !== -1) {
        MOCK_STAFF.splice(index, 1);
      }
    }
  },
};
