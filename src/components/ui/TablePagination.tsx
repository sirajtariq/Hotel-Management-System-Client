import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TablePaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  pageSizeOptions?: number[];
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600 ${className}`}
    >
      {/* Left: Page Size Selector & Total Counter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="h-7 rounded-md border border-slate-200 bg-white px-2 py-0 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-400 font-normal">|</span>

        <span className="font-medium text-slate-700">
          Showing <span className="font-bold text-slate-900">{startItem}</span> to{' '}
          <span className="font-bold text-slate-900">{endItem}</span> of{' '}
          <span className="font-bold text-slate-900">{totalItems}</span> entries
        </span>
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <span className="text-xs text-slate-500 font-medium mr-1">
          Page <strong className="text-slate-900">{safePage}</strong> of{' '}
          <strong className="text-slate-900">{totalPages}</strong>
        </span>

        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          className="h-7 w-7 p-0 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5 text-slate-600" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="h-7 w-7 p-0 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
        </Button>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="h-7 w-7 p-0 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-7 w-7 p-0 rounded-md border-slate-200 hover:bg-slate-50 cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5 text-slate-600" />
        </Button>
      </div>
    </div>
  );
};
