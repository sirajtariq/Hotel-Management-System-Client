export interface PermissionItem {
  code: string;
  name: string;
}

export type PermissionCatalog = Record<string, PermissionItem[]>;

export interface RoleItem {
  id: string;
  tenant?: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}
