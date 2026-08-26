import React from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { RolesPage } from '@/features/roles/pages/RolesPage';

export function RolesConfigPage() {
  return (
    <PermissionGuard permission="roles:manage" moduleName="Roles & Security Access">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="roles"
          title="Security Roles & Granular RBAC Permissions"
          subtitle="Define custom user roles and assign precise read/write permission matrix"
        />

        <RolesPage />
      </div>
    </PermissionGuard>
  );
}
