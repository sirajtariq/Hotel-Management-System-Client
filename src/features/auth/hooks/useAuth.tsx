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
  const [user, setUser] = useState<User | null>(null);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const backupAuthStr = localStorage.getItem('superadmin_backup_auth');
      
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          const isImp = Boolean(backupAuthStr || userData.is_impersonated);
          setIsImpersonated(isImp);
          setUser({ ...userData, is_impersonated: isImp });

          const savedTenantId = localStorage.getItem('active_tenant_id');
          const matchedTenant =
            userData.availableTenants?.find((t) => t.id === savedTenantId) ||
            userData.availableTenants?.[0] ||
            null;

          setActiveTenant(matchedTenant);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('superadmin_backup_auth');
          setIsImpersonated(false);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.removeItem('superadmin_backup_auth');
    setIsImpersonated(false);
    setUser(data.user);
    const tenant = data.user.availableTenants[0] || null;
    setActiveTenant(tenant);
    if (tenant) {
      localStorage.setItem('active_tenant_id', tenant.id);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('active_tenant_id');
    localStorage.removeItem('superadmin_backup_auth');
    setIsImpersonated(false);
    setUser(null);
    setActiveTenant(null);
  };

  const impersonateTenant = async (tenantId: string) => {
    const currentAccess = localStorage.getItem('access_token');
    const currentRefresh = localStorage.getItem('refresh_token');

    // Backup current SuperAdmin session
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

