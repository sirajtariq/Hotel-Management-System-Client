import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const POSCatalogSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Category Pills Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* 8 Food Item Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Image Placeholder */}
              <Skeleton className="h-28 w-full rounded-none" />

              {/* Title & Description */}
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            {/* Price & Add Action */}
            <div className="p-3 pt-0 flex items-center justify-between gap-2 mt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
