import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'slate';
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none';
  
  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    outline: 'border border-slate-200 text-slate-700 bg-white',
    slate: 'bg-slate-900 text-white',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
