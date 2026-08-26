import React from 'react';
import {
  Building,
  BedDouble,
  Users,
  ShieldCheck,
  Tag,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminTabType =
  | 'properties'
  | 'rooms'
  | 'staff'
  | 'roles'
  | 'account-heads'
  | 'restaurant';

interface AdminTabItem {
  id: AdminTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ADMIN_TABS: AdminTabItem[] = [
  { id: 'properties', label: 'Properties & Branches', icon: Building },
  { id: 'rooms', label: 'Rooms & Rates', icon: BedDouble },
  { id: 'staff', label: 'Staff & Payroll', icon: Users },
  { id: 'roles', label: 'Roles & Access', icon: ShieldCheck },
  { id: 'account-heads', label: 'Account Heads', icon: Tag },
  { id: 'restaurant', label: 'Restaurant Master', icon: Utensils },
];

interface AdminTabNavigationProps {
  activeTab: AdminTabType;
  onTabChange: (tab: AdminTabType) => void;
}

export const AdminTabNavigation: React.FC<AdminTabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto font-sans">
      {ADMIN_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer',
              isActive
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
