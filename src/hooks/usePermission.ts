import { useAuth } from '@/features/auth/hooks/useAuth';

const DEFAULT_STAFF_PERMISSIONS = [
  'properties:view',
  'rooms:view',
  'rooms:change_status',
  'bookings:view',
  'bookings:create',
  'expenses:view',
  'expenses:create',
  'staff:view',
];

const DEFAULT_MANAGER_PERMISSIONS = [
  'properties:view', 'properties:manage',
  'rooms:view', 'rooms:manage', 'rooms:change_status',
  'bookings:view', 'bookings:create', 'bookings:update', 'bookings:record_payment', 'bookings:cancel',
  'expenses:view', 'expenses:create', 'expenses:delete',
  'staff:view', 'staff:manage',
  'reports:view_pnl', 'reports:export',
];

export function usePermission(permissionCode: string | string[] | null): boolean;
export function usePermission(): { hasPermission: (permission?: string | string[] | null) => boolean };
export function usePermission(permissionCode?: string | string[] | null) {
  const { user } = useAuth();

  const hasPermission = (permission?: string | string[] | null): boolean => {
    if (!permission) return true;
    if (!user) return false;

    const roleUpper = String(user.role || '').toUpperCase();

    // 👑 ABSOLUTE SUPERADMIN & TENANT ADMIN FULL BYPASS
    if (
      (user as any)?.is_superuser ||
      (user as any)?.isSuperuser ||
      roleUpper === 'SUPERADMIN' ||
      roleUpper === 'SUPER_ADMIN' ||
      roleUpper === 'TENANT_ADMIN' ||
      roleUpper === 'ADMIN'
    ) {
      return true;
    }

    // Extract permissions array from state
    let userPerms: string[] = Array.isArray(user.custom_role?.permissions)
      ? user.custom_role!.permissions
      : Array.isArray(user.custom_role_permissions)
      ? user.custom_role_permissions
      : Array.isArray(user.permissions)
      ? user.permissions
      : [];

    // System role fallback when custom_role is not assigned
    if (userPerms.length === 0) {
      if (roleUpper === 'STAFF' || roleUpper === 'RECEPTIONIST' || roleUpper === 'HOUSEKEEPING') {
        userPerms = DEFAULT_STAFF_PERMISSIONS;
      } else if (roleUpper === 'PROPERTY_MANAGER' || roleUpper === 'MANAGER') {
        userPerms = DEFAULT_MANAGER_PERMISSIONS;
      }
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => userPerms.includes(p));
    }

    return userPerms.includes(permission);
  };

  if (permissionCode !== undefined) {
    return hasPermission(permissionCode);
  }

  return { hasPermission };
}

