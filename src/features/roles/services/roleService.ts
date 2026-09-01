import { apiClient } from '@/lib/axios';
import { RoleItem, PermissionCatalog, CreateRolePayload, UpdateRolePayload } from '@/types/roles';

const DEFAULT_PERMISSIONS: PermissionCatalog = {
  "Properties": [
    { code: "properties:view", name: "View Properties" },
    { code: "properties:manage", name: "Create, Edit & Delete Properties" },
  ],
  "Rooms": [
    { code: "rooms:view", name: "View Rooms & Inventory" },
    { code: "rooms:manage", name: "Create, Edit & Delete Rooms" },
    { code: "rooms:change_status", name: "Change Live Status (Clean/Dirty/Maintenance)" },
  ],
  "Bookings": [
    { code: "bookings:view", name: "View Bookings & Calendar" },
    { code: "bookings:create", name: "Create Bookings & Walk-ins" },
    { code: "bookings:update", name: "Edit Booking Details & Dates" },
    { code: "bookings:record_payment", name: "Record Payments & Collect Cash" },
    { code: "bookings:cancel", name: "Cancel Bookings" },
  ],
  "Expenses": [
    { code: "expenses:view", name: "View Daily Expenses" },
    { code: "expenses:create", name: "Add Daily Expenses & Purchases" },
    { code: "expenses:delete", name: "Delete Expense Records" },
  ],
  "Staff": [
    { code: "staff:view", name: "View Staff Profiles" },
    { code: "staff:manage", name: "Add, Edit & Manage Staff" },
  ],
  "Reports": [
    { code: "reports:view_pnl", name: "View P&L and Financial Analytics" },
    { code: "reports:export", name: "Export Financial & Occupancy Data" },
  ],
  "Roles & Access": [
    { code: "roles:manage", name: "Create & Manage Custom Roles & Permissions" },
  ]
};

function extractArray<T>(data: any, fallback: T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return fallback;
}

export const roleService = {
  async getRoles(): Promise<RoleItem[]> {
    try {
      const response = await apiClient.get('/roles/');
      return extractArray<RoleItem>(response.data, []);
    } catch {
      return [];
    }
  },

  async getAvailablePermissions(): Promise<PermissionCatalog> {
    try {
      const response = await apiClient.get('/roles/available-permissions/');
      return response.data || DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  },

  async createRole(payload: CreateRolePayload): Promise<RoleItem> {
    try {
      const response = await apiClient.post<RoleItem>('/roles/', payload);
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

  async updateRole(id: string, payload: UpdateRolePayload): Promise<RoleItem> {
    try {
      const response = await apiClient.patch<RoleItem>(`/roles/${id}/`, payload);
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

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}/`);
  },
};
