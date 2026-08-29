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

export interface AssignedPropertyItem {
  id: number | string;
  name: string;
  city: string;
}

export interface UserSession {
  id: number | string;
  username: string;
  email: string;
  fullName: string;
  role: 'SUPERADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'STAFF' | UserRole;
  isSuperuser: boolean;
  tenant: number | string | null;
  tenantName: string | null;
  assignedProperties: AssignedPropertyItem[];
  permissions: string[];
}

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  isSuperuser?: boolean;
  is_superuser?: boolean;
  tenantId: string;
  tenant?: number | string | null;
  tenantName: string;
  availableTenants: Tenant[];
  assignedProperties?: AssignedPropertyItem[];
  assigned_properties?: AssignedPropertyItem[];
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

