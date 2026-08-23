import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';

export const ReportTabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top 4 KPI Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* High-Chart Visualizer Skeleton Box */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      {/* Bottom Ledger Accounting Table Skeleton */}
      <TableSkeleton rows={5} cols={6} />
    </div>
  );
};
