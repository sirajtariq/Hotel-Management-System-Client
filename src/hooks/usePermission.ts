import { useAuth } from '@/features/auth/hooks/useAuth';
import { checkPermission } from '@/utils/permissions';

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

    if (Array.isArray(permission)) {
      return permission.some((p) => checkPermission(user, p));
    }

    return checkPermission(user, permission);
  };

  if (permissionCode !== undefined) {
    return hasPermission(permissionCode);
  }

  return { hasPermission };
}

