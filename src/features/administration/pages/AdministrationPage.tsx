import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { AdminTabNavigation, AdminTabType } from '../components/AdminTabNavigation';
import { PropertiesAdminTab } from '../components/tabs/PropertiesAdminTab';
import { RoomsAdminTab } from '../components/tabs/RoomsAdminTab';
import { StaffAdminTab } from '../components/tabs/StaffAdminTab';
import { RolesAdminTab } from '../components/tabs/RolesAdminTab';
import { AccountHeadsAdminTab } from '../components/tabs/AccountHeadsAdminTab';
import { AccountsAdminTab } from '../components/tabs/AccountsAdminTab';
import { RestaurantAdminTab } from '../components/tabs/RestaurantAdminTab';

const VALID_TABS: AdminTabType[] = [
  'properties',
  'rooms',
  'staff',
  'roles',
  'account-heads',
  'accounts',
  'restaurant',
];

export function AdministrationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as AdminTabType;
  const activeTab: AdminTabType = VALID_TABS.includes(rawTab) ? rawTab : 'properties';

  const handleTabChange = (newTab: AdminTabType) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <PermissionGuard permission="properties:manage" moduleName="Administration & Company Setup">
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Administration & Company Setup"
          description="Centralized master configurations, property branches, staff roster, RBAC security roles, payment accounts, and restaurant catalogs"
        />

        {/* Horizontal Segmented Tabs Navigation */}
        <AdminTabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Active Tab Panel */}
        <div>
          {activeTab === 'properties' && <PropertiesAdminTab />}
          {activeTab === 'rooms' && <RoomsAdminTab />}
          {activeTab === 'staff' && <StaffAdminTab />}
          {activeTab === 'roles' && <RolesAdminTab />}
          {activeTab === 'account-heads' && <AccountHeadsAdminTab />}
          {activeTab === 'accounts' && <AccountsAdminTab />}
          {activeTab === 'restaurant' && <RestaurantAdminTab />}
        </div>
      </div>
    </PermissionGuard>
  );
}
