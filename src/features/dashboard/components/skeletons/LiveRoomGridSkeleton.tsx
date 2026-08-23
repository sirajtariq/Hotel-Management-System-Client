import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const LiveRoomGridSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8.5 w-full sm:w-60 rounded-lg" />
          <Skeleton className="h-8.5 w-8.5 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Filter & Floor Bar Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Filter Pills (6 pill shapes) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-7 w-20 rounded-md" />
          ))}
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-6 w-12 rounded-md" />
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-6 w-10 rounded-md" />
        </div>
      </div>

      {/* 6-Column Responsive Room Cards Matrix (18 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between bg-white shadow-2xs min-h-[110px]"
          >
            <div>
              <div className="flex items-center justify-between gap-1.5">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10 rounded-md" />
              </div>
              <Skeleton className="h-3 w-20 mt-1 mb-2" />
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
              <div className="flex items-center justify-between gap-1">
                <Skeleton className="h-4.5 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
