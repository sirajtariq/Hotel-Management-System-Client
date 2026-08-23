import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const KitchenKDSSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full min-h-[320px]"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4.5 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Badges */}
            <div className="flex items-center justify-between my-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Guest info */}
            <Skeleton className="h-3 w-32 mb-4" />

            {/* Items */}
            <div className="space-y-2 my-4">
              {Array.from({ length: 3 }).map((_, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-14 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-100">
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};
