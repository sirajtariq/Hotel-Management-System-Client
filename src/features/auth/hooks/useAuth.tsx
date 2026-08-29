import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant } from '@/types/auth';
import { authService } from '../services/authService';
import { tenantService } from '@/features/tenants/services/tenantService';

interface AuthContextType {
  user: User | null;
  activeTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  is_impersonated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => void;
  impersonateTenant: (tenantId: string) => Promise<void>;
  exitImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getInitialUser = (): User | null => {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('user_session');
      }
    }
    return null;
  };

  const initialUser = getInitialUser();
  const [user, setUser] = useState<User | null>(initialUser);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(() => {
    if (initialUser && Array.isArray(initialUser.availableTenants) && initialUser.availableTenants.length > 0) {
      const savedTenantId = localStorage.getItem('active_tenant_id');
      return initialUser.availableTenants.find((t) => t.id === savedTenantId) || initialUser.availableTenants[0];
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = localStorage.getItem('access_token');
    if (token && initialUser) return false;
    if (token) return true;
    return false;
  });
  const [isImpersonated, setIsImpersonated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('superadmin_backup_auth') || initialUser?.is_impersonated);
  });

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('active_tenant_id');
    localStorage.removeItem('superadmin_backup_auth');
    setIsImpersonated(false);
    setUser(null);
    setActiveTenant(null);
  };

  useEffect(() => {
    const syncAuthSession = async () => {
      const token = localStorage.getItem('access_token');
      const backupAuthStr = localStorage.getItem('superadmin_backup_auth');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUserSession();
        const isImp = Boolean(backupAuthStr || userData.is_impersonated);
        const updatedUser = { ...userData, is_impersonated: isImp };

        setIsImpersonated(isImp);
        setUser(updatedUser);
        localStorage.setItem('user_session', JSON.stringify(updatedUser));

        const savedTenantId = localStorage.getItem('active_tenant_id');
        const matchedTenant =
          updatedUser.availableTenants?.find((t) => t.id === savedTenantId) ||
          updatedUser.availableTenants?.[0] ||
          null;

        setActiveTenant(matchedTenant);
        if (matchedTenant) {
          localStorage.setItem('active_tenant_id', matchedTenant.id);
        }
      } catch (err: any) {
        if (err.response?.status === 401 || !localStorage.getItem('access_token')) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    syncAuthSession();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_session', JSON.stringify(data.user));
    localStorage.removeItem('superadmin_backup_auth');
    setIsImpersonated(false);
    setUser(data.user);
    const tenant = data.user.availableTenants?.[0] || null;
    setActiveTenant(tenant);
    if (tenant) {
      localStorage.setItem('active_tenant_id', tenant.id);
    }
  };

  const impersonateTenant = async (tenantId: string) => {
    const currentAccess = localStorage.getItem('access_token');
    const currentRefresh = localStorage.getItem('refresh_token');

    if (currentAccess && user) {
      localStorage.setItem(
        'superadmin_backup_auth',
        JSON.stringify({
          access: currentAccess,
          refresh: currentRefresh,
          user: user,
          activeTenantId: activeTenant?.id,
        })
      );
    }

    const impData = await tenantService.impersonateTenant(tenantId);
    localStorage.setItem('access_token', impData.access);
    localStorage.setItem('refresh_token', impData.refresh);
    setIsImpersonated(true);

    const tenantUser: User = {
      ...impData.user,
      is_impersonated: true,
      original_superadmin_id: impData.original_superadmin_id,
    };

    setUser(tenantUser);
    localStorage.setItem('user_session', JSON.stringify(tenantUser));
    const impTenant: Tenant = {
      id: tenantId,
      name: impData.tenant_name || 'Tenant Hotel',
      code: 'TENANT',
      activePropertiesCount: 1,
    };
    setActiveTenant(impTenant);
    localStorage.setItem('active_tenant_id', tenantId);
  };

  const exitImpersonation = () => {
    const backupAuthStr = localStorage.getItem('superadmin_backup_auth');
    if (backupAuthStr) {
      try {
        const backup = JSON.parse(backupAuthStr);
        localStorage.setItem('access_token', backup.access);
        localStorage.setItem('refresh_token', backup.refresh);
        if (backup.user) {
          localStorage.setItem('user_session', JSON.stringify(backup.user));
        }
        if (backup.activeTenantId) {
          localStorage.setItem('active_tenant_id', backup.activeTenantId);
        }
        setUser(backup.user);
        setIsImpersonated(false);
        localStorage.removeItem('superadmin_backup_auth');
        window.location.href = '/tenants';
        return;
      } catch {
        // Fallback clear
      }
    }
    logout();
    window.location.href = '/login';
  };

  const switchTenant = (tenantId: string) => {
    if (!user) return;
    const target = user.availableTenants.find((t) => t.id === tenantId);
    if (target) {
      setActiveTenant(target);
      localStorage.setItem('active_tenant_id', target.id);
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant,
        isAuthenticated: !!user,
        isLoading,
        is_impersonated: isImpersonated,
        login,
        logout,
        switchTenant,
        impersonateTenant,
        exitImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

