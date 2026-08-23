import { apiClient } from '@/lib/axios';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';

const MOCK_USER: User = {
  id: 'usr_101',
  email: 'admin@apexhotels.com',
  firstName: 'Tariq',
  lastName: 'Manager',
  role: 'tenant_admin',
  tenantId: 'tenant_01',
  tenantName: 'Pearl Continental & Serviced Suites',
  availableTenants: [
    {
      id: 'tenant_01',
      name: 'Pearl Continental & Serviced Suites',
      code: 'PCSS',
      activePropertiesCount: 4,
    },
    {
      id: 'tenant_02',
      name: 'Grand Horizon Apartments & Spa',
      code: 'GHAS',
      activePropertiesCount: 2,
    },
  ],
};

function normalizeUser(data: any): User {
  if (!data) return MOCK_USER;

  const userObj = data.user || data;
  const tenants = userObj.availableTenants || (userObj.tenant_details ? [{
    id: String(userObj.tenant_details.id || 'tenant_01'),
    name: userObj.tenant_details.name || 'Main Tenant',
    code: userObj.tenant_details.code || 'MAIN',
    activePropertiesCount: 1
  }] : MOCK_USER.availableTenants);

  // Preserve permissions from custom_role or custom_role_details or direct array
  const customRoleData = userObj.custom_role || userObj.custom_role_details || null;
  const extractedPerms: string[] = Array.isArray(customRoleData?.permissions)
    ? customRoleData.permissions
    : Array.isArray(userObj.custom_role_permissions)
    ? userObj.custom_role_permissions
    : Array.isArray(userObj.permissions)
    ? userObj.permissions
    : [];

  return {
    id: String(userObj.id || MOCK_USER.id),
    email: userObj.email || userObj.username || MOCK_USER.email,
    firstName: userObj.first_name || userObj.firstName || userObj.username || 'User',
    lastName: userObj.last_name || userObj.lastName || '',
    role: userObj.role || 'TENANT_ADMIN',
    tenantId: String(userObj.tenant || userObj.tenantId || tenants[0]?.id || 'tenant_01'),
    tenantName: userObj.tenant_details?.name || tenants[0]?.name || 'Hotel Management System',
    availableTenants: Array.isArray(tenants) ? tenants : [],
    custom_role: customRoleData ? {
      id: String(customRoleData.id),
      name: customRoleData.name,
      permissions: extractedPerms,
      is_system: customRoleData.is_system,
    } : null,
    custom_role_permissions: extractedPerms,
    permissions: extractedPerms,
  };
}

export function parseErrorMessage(errorData: any): string {
  if (!errorData) return 'Invalid credentials provided.';
  if (typeof errorData === 'string') return errorData;

  if (typeof errorData === 'object') {
    // Standard Envelope: { success: false, message: "...", code: "...", errors: ... }
    if (errorData.message && typeof errorData.message === 'string') {
      if (errorData.errors && typeof errorData.errors === 'object' && errorData.code === 'validation_error') {
        const fieldMsgs = Object.entries(errorData.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : String(v)}`)
          .join(', ');
        if (fieldMsgs) return `${errorData.message} (${fieldMsgs})`;
      }
      return errorData.message;
    }

    if (errorData.detail && typeof errorData.detail === 'string') {
      return errorData.detail;
    }

    if (errorData.error) {
      return parseErrorMessage(errorData.error);
    }

    const messages: string[] = [];
    for (const [key, val] of Object.entries(errorData)) {
      if (key === 'code' || key === 'success' || key === 'errors') continue;
      const prefix = key === 'non_field_errors' || key === 'detail' ? '' : `${key}: `;
      if (Array.isArray(val)) {
        messages.push(`${prefix}${val.map(item => (typeof item === 'object' ? parseErrorMessage(item) : String(item))).join(' ')}`);
      } else if (typeof val === 'string') {
        messages.push(`${prefix}${val}`);
      } else if (val && typeof val === 'object') {
        messages.push(`${prefix}${parseErrorMessage(val)}`);
      }
    }
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }

  return String(errorData);
}


export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/users/token/', {
        username: credentials.email,
        password: credentials.password,
      });

      const access = response.data.access;
      const refresh = response.data.refresh;
      const user = normalizeUser(response.data);

      return { access, refresh, user };
    } catch (err: any) {
      if (err.response?.data) {
        const msg = parseErrorMessage(err.response.data);
        throw new Error(msg || 'Invalid username or password credentials.');
      }

      // If backend is completely offline and using default mock admin demo credentials
      if (credentials.email === 'admin' && credentials.password === 'Admin!@#') {
        return {
          access: 'mock_jwt_access_token_12345',
          refresh: 'mock_jwt_refresh_token_67890',
          user: {
            ...MOCK_USER,
            email: credentials.email || MOCK_USER.email,
          },
        };
      }

      throw new Error('Unable to connect to authentication server. Please verify backend service.');
    }
  },



  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/users/me/');
      return normalizeUser(response.data);
    } catch {
      return MOCK_USER;
    }
  },

  async updateProfile(data: { firstName: string; lastName: string; email: string; phoneNumber?: string }): Promise<User> {
    try {
      const response = await apiClient.patch('/users/me/', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phoneNumber,
      });
      return normalizeUser(response.data);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object'
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(errorData);
        throw new Error(msg);
      }
      return {
        ...MOCK_USER,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };
    }
  },

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      await apiClient.post('/users/change_password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object'
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(errorData);
        throw new Error(msg);
      }
      throw new Error('Failed to change password.');
    }
  },

  async adminResetPassword(userId: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/reset_password/`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'object'
          ? Object.entries(errorData).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(errorData);
        throw new Error(msg);
      }
      throw new Error('Failed to reset password.');
    }
  },
};

