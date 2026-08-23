import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({
  firstName = '',
  lastName = '',
  email = '',
  role = '',
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const getInitials = () => {
    if (firstName || lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : '';
      const last = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${first}${last}` || first || 'U';
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getBgColor = () => {
    const r = role.toLowerCase();
    if (r.includes('super')) return 'bg-purple-900 text-purple-100 border-purple-700/50';
    if (r.includes('tenant') || r.includes('admin')) return 'bg-indigo-900 text-indigo-100 border-indigo-700/50';
    if (r.includes('manager')) return 'bg-blue-900 text-blue-100 border-blue-700/50';
    return 'bg-slate-800 text-slate-100 border-slate-700/50';
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-11 w-11 text-sm font-bold',
    xl: 'h-16 w-16 text-lg font-bold shadow-md',
  };

  return (
    <div
      className={cn(
        'rounded-full border flex items-center justify-center font-bold shrink-0 tracking-wider select-none shadow-xs',
        getBgColor(),
        sizeClasses[size],
        className
      )}
      title={`${firstName} ${lastName}`.trim() || email}
    >
      {getInitials()}
    </div>
  );
}
