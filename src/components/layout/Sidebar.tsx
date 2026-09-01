import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Receipt,
  BarChart3,
  ShieldCheck,
  Building2,
  TrendingUp,
  UserCog,
  X,
  UtensilsCrossed,
  ChefHat,
  Settings2,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';

interface NavItemData {
  name: string;
  to: string;
  icon: any;
  perm?: string;
}

function SidebarNavItem({ item, onClick }: { item: NavItemData; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
          isActive
            ? 'bg-indigo-900 text-white font-semibold shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.name}</span>
    </NavLink>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, activeTenant, is_impersonated } = useAuth();
  const { hasPermission } = usePermission();

  const roleUpper = String(user?.role || '').toUpperCase();
  const isPureSuperAdmin = (roleUpper === 'SUPERADMIN' || roleUpper === 'SUPER_ADMIN') && !is_impersonated;

  const displayOrgName = isPureSuperAdmin
    ? 'SaaS Platform Control'
    : (activeTenant?.name || user?.availableTenants?.[0]?.name || 'Hotel Management System');

  // SuperAdmin Navigation
  const saNavItems: NavItemData[] = [
    { name: 'Tenants & Subscriptions', to: '/tenants', icon: Building2 },
    { name: 'Platform Analytics & MRR', to: '/platform-analytics', icon: TrendingUp },
    { name: 'System Users', to: '/users', icon: UserCog },
  ];

  // Operations Navigation Group
  const operationsNavItems: NavItemData[] = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookings & Front Desk', to: '/bookings', icon: CalendarCheck, perm: 'bookings:view' },
    { name: 'Restaurant POS', to: '/restaurant/pos', icon: UtensilsCrossed, perm: 'restaurant:pos' },
    { name: 'Kitchen Display', to: '/restaurant/kitchen', icon: ChefHat, perm: 'restaurant:kitchen' },
    { name: 'Daily Expenses', to: '/expenses', icon: Receipt, perm: 'expenses:view' },
    { name: 'Financial Reports', to: '/reports', icon: BarChart3, perm: 'reports:view_pnl' },
  ];

  // Administration Check: Single entry point
  const isTenantAdmin =
    isPureSuperAdmin ||
    roleUpper === 'TENANT_ADMIN' ||
    roleUpper === 'SUPERADMIN' ||
    hasPermission('properties:manage') ||
    hasPermission('roles:manage') ||
    hasPermission('staff:manage') ||
    hasPermission('properties:view');

  const visibleOps = operationsNavItems.filter((item) => hasPermission(item.perm));

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full font-sans">
      <div className="flex flex-col gap-4 p-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-7 w-7 rounded-lg bg-indigo-900 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight truncate" title={displayOrgName}>
                {displayOrgName}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {isPureSuperAdmin ? 'SuperAdmin Portal' : 'Hotel Operations Hub'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-4 mt-2">
          {isPureSuperAdmin ? (
            <div className="space-y-1">
              {saNavItems.map((item) => (
                <SidebarNavItem key={item.to} item={item} onClick={onClose} />
              ))}
            </div>
          ) : (
            <>
              {/* Operations Section */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  Operations
                </div>
                {visibleOps.map((item) => (
                  <SidebarNavItem key={item.to} item={item} onClick={onClose} />
                ))}
              </div>

              {/* Single Entry Administration Link */}
              {isTenantAdmin && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <SidebarNavItem
                    item={{
                      name: 'Administration',
                      to: '/administration',
                      icon: Settings2,
                    }}
                    onClick={onClose}
                  />
                </div>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700">System Mode</div>
          <div>{isPureSuperAdmin ? 'Platform Management' : 'PKR Currency Standard'}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-slate-200 bg-white flex-col justify-between h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
          <aside className="relative z-50 w-64 max-w-[80%] bg-white h-full shadow-2xl flex flex-col justify-between">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
