import { UserSession, User } from '@/types/auth';

/**
 * Instant permission check utility.
 * Evaluates permission codename in 0ms using cached user session permissions.
 */
export const checkPermission = (user: UserSession | User | null, permissionCode: string): boolean => {
  if (!user) return false;
  const roleUpper = String(user.role || '').toUpperCase();
  if (
    roleUpper === 'SUPERADMIN' ||
    roleUpper === 'SUPER_ADMIN' ||
    (user as any).isSuperuser ||
    (user as any).is_superuser ||
    (Array.isArray(user.permissions) && user.permissions.includes('*'))
  ) {
    return true;
  }
  return Array.isArray(user.permissions) && user.permissions.includes(permissionCode);
};
