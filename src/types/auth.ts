export type UserRole = 'SUPERADMIN' | 'TENANT_ADMIN' | 'PROPERTY_MANAGER' | 'STAFF' | 'super_admin' | 'tenant_admin' | 'manager' | 'receptionist' | 'housekeeping';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  activePropertiesCount: number;
}

export interface UserCustomRole {
  id: string;
  name: string;
  permissions: string[];
  is_system?: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  availableTenants: Tenant[];
  custom_role?: UserCustomRole | null;
  custom_role_permissions?: string[];
  permissions?: string[];
  is_impersonated?: boolean;
  original_superadmin_id?: string;
}


export interface AuthState {
  user: User | null;
  activeTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  is_impersonated: boolean;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

