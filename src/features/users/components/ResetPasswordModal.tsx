import React, { useState, useEffect } from 'react';
import { X, KeyRound, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/features/auth/services/authService';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; username: string; email?: string } | null;
}

export function ResetPasswordModal({ isOpen, onClose, targetUser }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let rand = '';
    for (let i = 0; i < 10; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(rand);
    setConfirmPassword(rand);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.adminResetPassword(targetUser.id, newPassword, confirmPassword);
      setSuccess(`Password for "${targetUser.username}" reset successfully.`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset user password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Admin Password Reset</h2>
              <p className="text-xs text-slate-500 font-medium">Reset password for user account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <div>{success}</div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Target Account</label>
            <div className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 flex items-center text-xs font-bold text-slate-900">
              {targetUser.username} {targetUser.email ? `(${targetUser.email})` : ''}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Admin reset does not require old password verification.</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">New Password *</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Generate Password</span>
              </button>
            </div>

            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter or generate new password"
              className="text-xs font-mono"
              required
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password *</label>
              <Input
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs font-semibold bg-slate-900 text-white">
              {isSubmitting ? 'Resetting...' : 'Reset User Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
