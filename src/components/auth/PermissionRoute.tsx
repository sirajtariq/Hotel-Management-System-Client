import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { toast } from '@/components/ui/ToastProvider';

interface PermissionRouteProps {
  permission: string | string[];
  children: React.ReactElement;
  fallbackPath?: string;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  permission,
  children,
  fallbackPath = '/dashboard',
}) => {
  const { isLoading, user } = useAuth();
  const { hasPermission } = usePermission();
  const hasAccess = hasPermission(permission);

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      toast.error('Access Denied: You do not have permission to view this module.', { id: 'auth-access-denied' });
    }
  }, [isLoading, user, hasAccess]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-xs text-slate-500 font-medium">Loading access...</div>;
  }

  if (!hasAccess) {
    return <Navigate replace to={fallbackPath} />;
  }

  return children;
};

