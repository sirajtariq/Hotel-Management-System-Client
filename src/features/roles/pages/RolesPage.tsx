import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, RefreshCw, Lock, Users, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { RoleItem, PermissionCatalog, CreateRolePayload, UpdateRolePayload } from '@/types/roles';
import { roleService } from '../services/roleService';
import { RoleFormModal } from '../components/RoleFormModal';
import { toast } from '@/components/ui/ToastProvider';
import { Can } from '@/lib/rbac';

export function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<PermissionCatalog>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        roleService.getRoles(),
        roleService.getAvailablePermissions(),
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permsData);
    } catch (err) {
      console.error('Failed to load roles & permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleItem) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (payload: CreateRolePayload | UpdateRolePayload) => {
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, payload as UpdateRolePayload);
        toast.success('Role Updated', `Successfully saved changes for '${payload.name}'`);
      } else {
        await roleService.createRole(payload as CreateRolePayload);
        toast.success('Role Created', `Custom role '${payload.name}' registered into permission matrix`);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch {
      toast.error('Action Failed', 'Could not save role configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.is_system) {
      toast.warning('Protected Role', 'System default roles cannot be deleted.');
      return;
    }
    if (role.users_count > 0) {
      toast.warning('Role In Use', `Cannot delete role '${role.name}' because it is assigned to ${role.users_count} user(s).`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role '${role.name}'?`)) {
      return;
    }

    setDeletingId(role.id);
    try {
      await roleService.deleteRole(role.id);
      toast.success('Role Deleted', `Role '${role.name}' has been deleted.`);
      await fetchData();
    } catch (err: any) {
      toast.error('Delete Failed', err.message || 'Failed to delete role.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PermissionGuard permission="roles:manage" moduleName="Roles & Access Control">
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-900 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Custom Roles & Access Control</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Single Source of Truth dynamic RBAC matrix for hotel staff & property managers
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={isLoading}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Can permission="roles:manage">
              <Button onClick={handleOpenCreate} className="text-xs font-semibold flex items-center gap-1.5 bg-indigo-900 hover:bg-indigo-950">
                <Plus className="h-4 w-4" />
                <span>Create New Role</span>
              </Button>
            </Can>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between min-h-[140px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-14 rounded-lg" />
                </div>
              </div>
            ))
          ) : roles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 font-medium text-xs">
              No roles configured yet. Click "Create New Role" to set up staff access privileges.
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{role.name}</span>
                      {role.is_system && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-300 inline-flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" /> System
                        </span>
                      )}
                    </h3>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {role.permissions.length} perms
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                    {role.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{role.users_count} user(s) assigned</span>
                  </div>

                  <Can permission="roles:manage">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(role)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                        title="Edit Role & Permissions"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      {!role.is_system && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role)}
                          disabled={deletingId === role.id || role.users_count > 0}
                          className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title={role.users_count > 0 ? "Cannot delete role assigned to users" : "Delete Role"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </Can>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Role Form Modal */}
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingRole}
          availablePermissions={availablePermissions}
          isSubmitting={isSubmitting}
        />
      </div>
    </PermissionGuard>
  );
}
