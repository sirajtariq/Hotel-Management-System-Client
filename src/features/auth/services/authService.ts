import { apiClient } from '@/lib/axios';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';

function normalizeUser(data: any): User {
  const userObj = data.user || data || {};
  const tenants = userObj.availableTenants || (userObj.tenant_details ? [{
    id: String(userObj.tenant_details.id || ''),
    name: userObj.tenant_details.name || 'Main Tenant',
    code: userObj.tenant_details.code || 'MAIN',
    activePropertiesCount: 1
  }] : []);

  const customRoleData = userObj.custom_role || userObj.custom_role_details || null;
  const extractedPerms: string[] = Array.isArray(customRoleData?.permissions)
    ? customRoleData.permissions
    : Array.isArray(userObj.custom_role_permissions)
    ? userObj.custom_role_permissions
    : Array.isArray(userObj.permissions)
    ? userObj.permissions
    : [];

  return {
    id: String(userObj.id || ''),
    email: userObj.email || userObj.username || '',
    firstName: userObj.first_name || userObj.firstName || userObj.username || 'User',
    lastName: userObj.last_name || userObj.lastName || '',
    role: userObj.role || 'TENANT_ADMIN',
    tenantId: String(userObj.tenant || userObj.tenantId || tenants[0]?.id || ''),
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

      throw new Error('Unable to connect to authentication server. Please verify backend service.');
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/users/me/');
    return normalizeUser(response.data);
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
      throw err;
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

