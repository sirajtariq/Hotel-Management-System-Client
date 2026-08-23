import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { StaffDataTable } from '../components/StaffDataTable';
import { StaffFormModal } from '../components/StaffFormModal';
import { ResetPasswordModal } from '@/features/users/components/ResetPasswordModal';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, DollarSign } from 'lucide-react';
import { staffService } from '../services/staffService';
import { propertyService } from '@/features/properties/services/propertyService';
import { roleService } from '@/features/roles/services/roleService';
import { apiClient } from '@/lib/axios';
import { StaffMember } from '@/types/staff';
import { Property } from '@/types/properties';
import { RoleItem } from '@/types/roles';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { formatPKR } from '@/lib/formatters';

export function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [quotaUsage, setQuotaUsage] = useState<{ current: number; max: number | null }>({ current: 0, max: null });
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [resetTargetUser, setResetTargetUser] = useState<any | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, propsData, rolesData, tenantRes] = await Promise.all([
        staffService.getStaff({ page: currentPage, page_size: pageSize }),
        propertyService.getProperties(),
        roleService.getRoles().catch(() => []),
        apiClient.get('/tenants/me/').catch(() => null),
      ]);

      setStaffList(staffRes.items);
      setTotalCount(staffRes.totalCount);
      setProperties(Array.isArray(propsData) ? propsData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);

      if (tenantRes?.data) {
        setQuotaUsage({
          current: tenantRes.data.users_count || 0,
          max: tenantRes.data.max_users ?? null,
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]);

  const handleCreateOrUpdateStaff = async (data: any) => {
    try {
      if (editingStaff) {
        const updated = await staffService.updateStaff(editingStaff.id, data);
        setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? updated : s)));
        toast.success('Profile Updated', `Updated records for ${updated.name}`);
      } else {
        const created = await staffService.createStaff(data);
        setStaffList((prev) => [created, ...prev]);
        toast.success('Staff Member Registered', `Added ${created.name} to employee directory`);
      }
      loadData();
    } catch {
      toast.error('Action Failed', 'Could not save staff profile.');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await staffService.deleteStaff(id);
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      toast.success('Staff Profile Removed', 'Employee profile de-registered successfully.');
      loadData();
    } catch {
      toast.error('Action Failed', 'Could not delete staff profile.');
    }
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleOpenResetPassword = (staff: StaffMember) => {
    if (staff.user_id) {
      setResetTargetUser({
        id: String(staff.user_id),
        username: staff.username || staff.name,
        first_name: staff.name.split(' ')[0],
        last_name: staff.name.split(' ')[1] || '',
        email: staff.email || '',
      });
    }
  };

  const loginUsersCount = staffList.filter((s) => s.has_login_access).length;
  const totalPayroll = staffList.reduce((acc, s) => acc + (Number(s.monthly_salary) || 0), 0);

  return (
    <PermissionGuard permission="staff:view" moduleName="Staff Registry & Payroll">
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Staff Directory & Access Roster"
          description="Unified employee hub for Ground Staff and Portal Login Accounts"
          actions={
            <Can permission="staff:manage">
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950"
                onClick={() => {
                  setEditingStaff(null);
                  setIsModalOpen(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Register Staff Member
              </Button>
            </Can>
          }
        />

        {/* Quota & Payroll Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Portal Login Quota</div>
              <div className="text-sm font-bold text-slate-900">
                {loginUsersCount} / {quotaUsage.max === null ? '∞ (Unlimited)' : `${quotaUsage.max} Accounts`} Used
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Consumes plan max_users slot</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Ground Staff (No Login)</div>
              <div className="text-sm font-bold text-slate-900">
                {staffList.length - loginUsersCount} Employees
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">0 quota slots consumed (Unlimited)</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Monthly Payroll Total</div>
              <div className="text-sm font-bold text-slate-900">{formatPKR(totalPayroll)}</div>
              <div className="text-[10px] text-slate-400 font-medium">Calculated for P&L Statements</div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : (
          <StaffDataTable
            staffList={staffList}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onEdit={handleOpenEdit}
            onResetPassword={handleOpenResetPassword}
            onDelete={handleDeleteStaff}
          />
        )}

        <StaffFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStaff(null);
          }}
          onSubmit={handleCreateOrUpdateStaff}
          initialData={editingStaff}
          properties={properties}
          roles={roles}
          quotaUsage={quotaUsage}
        />

        <ResetPasswordModal
          isOpen={!!resetTargetUser}
          onClose={() => setResetTargetUser(null)}
          targetUser={resetTargetUser}
        />
      </div>
    </PermissionGuard>
  );
}
