import React from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { StaffPage } from '@/features/staff/pages/StaffPage';

export function StaffConfigPage() {
  return (
    <PermissionGuard permission="staff:view" moduleName="Staff & Payroll Management">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="staff"
          title="Staff Roster, Payroll & Access Setup"
          subtitle="Employee directory, role assignments, monthly salaries, and system login credentials"
        />

        <StaffPage />
      </div>
    </PermissionGuard>
  );
}
