import { apiClient } from '@/lib/axios';
import { RoleItem, PermissionCatalog, CreateRolePayload, UpdateRolePayload } from '@/types/roles';

const MOCK_ROLES: RoleItem[] = [
  {
    id: '1',
    name: 'Property Manager',
    description: 'Full operational control over rooms, bookings, staff, and expenses.',
    permissions: [
      'properties:view', 'properties:manage',
      'rooms:view', 'rooms:manage', 'rooms:change_status',
      'bookings:view', 'bookings:create', 'bookings:update', 'bookings:record_payment', 'bookings:cancel',
      'expenses:view', 'expenses:create', 'expenses:delete',
      'staff:view', 'staff:manage',
      'reports:view_pnl', 'reports:export'
    ],
    is_system: true,
    users_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Front Desk Receptionist',
    description: 'Check-in guests, handle reservations, and collect booking payments.',
    permissions: [
      'properties:view',
      'rooms:view', 'rooms:change_status',
      'bookings:view', 'bookings:create', 'bookings:update', 'bookings:record_payment',
      'expenses:view',
    ],
    is_system: false,
    users_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Housekeeping Supervisor',
    description: 'Manage room cleanliness status and inventory inspection.',
    permissions: [
      'rooms:view', 'rooms:change_status',
    ],
    is_system: false,
    users_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_PERMISSIONS: PermissionCatalog = {
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
      return response.data || MOCK_PERMISSIONS;
    } catch {
      return MOCK_PERMISSIONS;
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
      const newRole: RoleItem = {
        id: String(Date.now()),
        name: payload.name,
        description: payload.description || '',
        permissions: payload.permissions,
        is_system: false,
        users_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_ROLES.push(newRole);
      return newRole;
    }
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<RoleItem> {
    try {
      const response = await apiClient.patch<RoleItem>(`/roles/${id}/`, payload);
      return response.data;
    } catch (err: any) {
      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_ROLES[index] = {
          ...MOCK_ROLES[index],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        return MOCK_ROLES[index];
      }
      throw err;
    }
  },

  async deleteRole(id: string): Promise<void> {
    try {
      await apiClient.delete(`/roles/${id}/`);
    } catch {
      const index = MOCK_ROLES.findIndex((r) => r.id === id);
      if (index !== -1) {
        MOCK_ROLES.splice(index, 1);
      }
    }
  },
};
