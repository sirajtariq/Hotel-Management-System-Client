import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between min-h-[110px]"
        >
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};
