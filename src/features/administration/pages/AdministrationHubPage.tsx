import React, { useState, useEffect } from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { AdminSummaryCard } from '../components/AdminSummaryCard';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import {
  Building,
  BedDouble,
  Users,
  ShieldCheck,
  Tag,
  Utensils,
  Loader2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { propertyService } from '@/features/properties/services/propertyService';
import { roomService } from '@/features/rooms/services/roomService';
import { staffService } from '@/features/staff/services/staffService';
import { roleService } from '@/features/roles/services/roleService';
import { expenseService } from '@/features/expenses/services/expenseService';
import { restaurantService } from '@/features/restaurant/services/restaurantService';

export function AdministrationHubPage() {
  const [stats, setStats] = useState({
    propertiesCount: 0,
    roomTypesCount: 0,
    roomsCount: 0,
    staffCount: 0,
    rolesCount: 0,
    accountHeadsCount: 0,
    menuItemsCount: 0,
    tablesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const [props, roomTypes, roomsRes, staffRes, roles, heads, menuRes, tables] = await Promise.all([
          propertyService.getProperties().catch(() => []),
          roomService.getRoomTypes().catch(() => []),
          roomService.getRooms().catch(() => ({ items: [], totalCount: 0 })),
          staffService.getStaff().catch(() => ({ items: [], totalCount: 0 })),
          roleService.getRoles().catch(() => []),
          expenseService.getAccountHeads().catch(() => []),
          restaurantService.getMenuItems().catch(() => ({ items: [], totalCount: 0 })),
          restaurantService.getDiningTables().catch(() => []),
        ]);

        setStats({
          propertiesCount: props.length,
          roomTypesCount: roomTypes.length,
          roomsCount: Array.isArray(roomsRes) ? roomsRes.length : 0,
          staffCount: staffRes.totalCount || staffRes.items?.length || 0,
          rolesCount: roles.length,
          accountHeadsCount: heads.filter((h) => h.is_active).length,
          menuItemsCount: menuRes.totalCount || menuRes.items?.length || 0,
          tablesCount: tables.length,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <PermissionGuard permission="properties:view" moduleName="Company Administration Hub">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="overview"
          title="Company & Hotel Administration Center"
          subtitle="Centralized setup hub for multi-property hierarchy, room inventory, staff RBAC, account heads & POS master configuration."
        />

        {/* Quick Info Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-800/60 border border-indigo-700 text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Master Configuration Engine</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight">
              Manage Hotel Chains, Rates & Operational Master Controls
            </h2>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Select any administration module below to edit property profiles, hourly stay rates, employee payroll credentials, granular security roles, expense categories, or POS dining layouts.
            </p>
          </div>
          <Building2 className="absolute right-4 -bottom-6 h-48 w-48 text-indigo-800/20 pointer-events-none" />
        </div>

        {/* 6 Interactive Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AdminSummaryCard
            title="Properties & Branches"
            description="Manage hotel properties, branch addresses, landlord rent, city locations & active statuses."
            badgeText={`${stats.propertiesCount} Active ${stats.propertiesCount === 1 ? 'Property' : 'Properties'}`}
            to="/administration/properties"
            icon={Building}
            accentColor="indigo"
          />

          <AdminSummaryCard
            title="Room Inventory & Pricing"
            description="Configure room categories, nightly rates, hourly stay rates, and unit floor assignments."
            badgeText={`${stats.roomTypesCount} Types | ${stats.roomsCount} Rooms`}
            to="/administration/rooms"
            icon={BedDouble}
            accentColor="blue"
          />

          <AdminSummaryCard
            title="Staff Roster & Payroll"
            description="Manage staff members, roles, monthly salary payrolls, and system access credentials."
            badgeText={`${stats.staffCount} Employees`}
            to="/administration/staff"
            icon={Users}
            accentColor="emerald"
          />

          <AdminSummaryCard
            title="Roles & Access Control"
            description="Create custom security roles and grant granular permissions across all operational modules."
            badgeText={`${stats.rolesCount} Custom Roles`}
            to="/administration/roles"
            icon={ShieldCheck}
            accentColor="purple"
          />

          <AdminSummaryCard
            title="Expense Account Heads"
            description="Manage operational expense categories (Khata catalog) for property OPEX & P&L accounting."
            badgeText={`${stats.accountHeadsCount} Active Heads`}
            to="/administration/account-heads"
            icon={Tag}
            accentColor="amber"
          />

          <AdminSummaryCard
            title="Restaurant Master Setup"
            description="Manage food catalog categories, portion variations, prices, and dining table floor layouts."
            badgeText={`${stats.menuItemsCount} Items | ${stats.tablesCount} Tables`}
            to="/administration/restaurant-setup"
            icon={Utensils}
            accentColor="rose"
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
