import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  BedDouble,
  Users,
  ShieldCheck,
  Tag,
  Utensils,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminTab =
  | 'overview'
  | 'properties'
  | 'rooms'
  | 'staff'
  | 'roles'
  | 'account-heads'
  | 'restaurant-setup';

interface AdminNavHeaderProps {
  currentTab: AdminTab;
  title: string;
  subtitle?: string;
}

interface NavItem {
  id: AdminTab;
  label: string;
  to: string;
  icon: any;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Hub Overview', to: '/administration', icon: Settings2 },
  { id: 'properties', label: 'Properties', to: '/administration/properties', icon: Building },
  { id: 'rooms', label: 'Rooms & Pricing', to: '/administration/rooms', icon: BedDouble },
  { id: 'staff', label: 'Staff Roster', to: '/administration/staff', icon: Users },
  { id: 'roles', label: 'Roles & Access', to: '/administration/roles', icon: ShieldCheck },
  { id: 'account-heads', label: 'Account Heads', to: '/administration/account-heads', icon: Tag },
  { id: 'restaurant-setup', label: 'Restaurant Setup', to: '/administration/restaurant-setup', icon: Utensils },
];

export function AdminNavHeader({ currentTab, title, subtitle }: AdminNavHeaderProps) {
  return (
    <div className="space-y-4 mb-6 font-sans">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <NavLink to="/administration" className="hover:text-indigo-900 flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" />
              <span>Administration</span>
            </NavLink>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="text-slate-900 font-bold">{title}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Horizontal Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0',
                isActive
                  ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
