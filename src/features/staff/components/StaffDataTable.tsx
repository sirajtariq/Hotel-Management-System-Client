import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Edit2, KeyRound, Trash2 } from 'lucide-react';
import { StaffMember } from '@/types/staff';
import { formatPKR } from '@/lib/formatters';
import { Can } from '@/lib/rbac';
import { TablePagination } from '@/components/ui/TablePagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface StaffDataTableProps {
  staffList: StaffMember[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (staff: StaffMember) => void;
  onResetPassword: (staff: StaffMember) => void;
  onDelete: (id: string) => void;
}

export function StaffDataTable({
  staffList,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onResetPassword,
  onDelete,
}: StaffDataTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  if (!staffList.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-xs">
        <p className="text-xs text-slate-500 font-medium">No employee records in staff directory.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <TableHead className="py-3 text-xs font-bold text-slate-700">Employee & Contact</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700">Position / Title</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700">Assigned Property</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700">Monthly Salary</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700">Portal Access</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700 text-center">Status</TableHead>
            <TableHead className="py-3 text-xs font-bold text-slate-700 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 text-xs">
          {staffList.map((staff) => {
            const hasLogin = staff.has_login_access;
            const roleName = staff.custom_role?.name || 'Staff User';

            return (
              <TableRow key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                <TableCell className="py-3">
                  <div className="font-semibold text-slate-900">{staff.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {staff.phone_number || 'No phone'}
                    {staff.username ? ` • @${staff.username}` : ''}
                  </div>
                </TableCell>

                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 text-slate-700">
                    {staff.position}
                  </Badge>
                </TableCell>

                <TableCell className="py-3 text-slate-700 font-medium">
                  {staff.property_name || 'All Properties'}
                </TableCell>

                <TableCell className="py-3 font-mono tabular-nums font-semibold text-slate-900">
                  {formatPKR(Number(staff.monthly_salary) || 0)}
                </TableCell>

                <TableCell className="py-3">
                  {hasLogin ? (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck className="h-3 w-3 text-emerald-600" />
                        Login ({roleName})
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      <UserX className="h-3 w-3 text-slate-400" />
                      Ground Staff (No Login)
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      staff.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>

                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Can permission="staff:manage">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(staff)}
                        className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                        title="Edit Employee & Portal Access"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      {hasLogin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onResetPassword(staff)}
                          className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                          title="Reset Password"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget({ id: staff.id, name: staff.name })}
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-900 hover:bg-rose-50"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Can>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        totalItems={totalCount}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete Staff"
        variant="danger"
      />
    </div>
  );
}
