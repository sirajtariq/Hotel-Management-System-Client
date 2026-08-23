import React from 'react';
import { Skeleton } from '../Skeleton';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 6,
  className = '',
}) => {
  const widthClasses = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5'];

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <th key={cIdx} className="p-3.5 text-xs font-semibold text-slate-500">
                  <Skeleton className={`h-4 ${widthClasses[cIdx % widthClasses.length]}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/30">
                {Array.from({ length: cols }).map((_, cIdx) => {
                  const isActionCol = cIdx === cols - 1;
                  const isBadgeCol = cIdx === cols - 2;

                  return (
                    <td key={cIdx} className="p-3.5 align-middle">
                      {isActionCol ? (
                        <div className="flex items-center gap-2 justify-end">
                          <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                          <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                        </div>
                      ) : isBadgeCol ? (
                        <Skeleton className="h-5 w-20 rounded-full" />
                      ) : (
                        <Skeleton className={`h-4 ${widthClasses[(rIdx + cIdx) % widthClasses.length]}`} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
