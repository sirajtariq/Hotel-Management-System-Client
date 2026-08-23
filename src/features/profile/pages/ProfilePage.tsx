import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, Shield, Building, CheckCircle2, AlertCircle, Save, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authService } from '@/features/auth/services/authService';

export function ProfilePage() {
  const { user, activeTenant } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Security Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isSavingSecurity, setIsSavingSecurity] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhoneNumber((user as any).phone_number || (user as any).phoneNumber || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      await authService.updateProfile({
        firstName,
        lastName,
        email,
        phoneNumber,
      });
      setProfileSuccess('Profile information updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    // Validations
    if (!oldPassword) {
      setSecurityError('Current password is required to set a new password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirm password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setSecurityError('New password must be different from current password.');
      return;
    }

    setIsSavingSecurity(true);
    try {
      await authService.changePassword(oldPassword, newPassword, confirmPassword);
      setSecuritySuccess('Your password has been updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to change password. Please verify current password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const userRoleDisplay = user?.role ? user.role.replace(/_/g, ' ').toUpperCase() : 'USER';
  const tenantNameDisplay = activeTenant?.name || user?.tenantName || 'Global Platform';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <UserAvatar
          firstName={firstName}
          lastName={lastName}
          email={email}
          role={user?.role}
          size="xl"
        />

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {firstName} {lastName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
              {userRoleDisplay}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>{email}</span>
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>{tenantNameDisplay}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Tab 1: Profile Information */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Personal Details</h2>
            <p className="text-xs text-slate-500 font-medium">Update your profile information and contact details</p>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <div>{profileSuccess}</div>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>{profileError}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">First Name *</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Last Name *</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+92 300 0000000"
                className="text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSavingProfile} className="text-xs font-semibold flex items-center gap-1.5">
              <Save className="h-4 w-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Change Account Password</h2>
            <p className="text-xs text-slate-500 font-medium">
              Updating your password requires verifying your current password for security.
            </p>
          </div>

          {securitySuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <div>{securitySuccess}</div>
            </div>
          )}

          {securityError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>{securityError}</div>
            </div>
          )}

          <div className="space-y-3 max-w-md">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Current Password *</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Required to authorize password change.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">New Password (min 6 chars) *</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Confirm New Password *</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSavingSecurity} className="text-xs font-semibold flex items-center gap-1.5 bg-slate-900 text-white">
              <KeyRound className="h-4 w-4" />
              <span>{isSavingSecurity ? 'Updating Password...' : 'Update Password'}</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
