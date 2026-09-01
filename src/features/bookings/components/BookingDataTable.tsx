import { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { BookingTableRow } from './BookingTableRow';
import { Booking, BookingStatus } from '@/types/bookings';
import { TablePagination } from '@/components/ui/TablePagination';

interface BookingDataTableProps {
  bookings: Booking[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onRecordPayment: (booking: Booking) => void;
  onProcessRefund?: (booking: Booking) => void;
  onPrintInvoice: (booking: Booking) => void;
  updatingBookingId?: string | null;
}

export function BookingDataTable({
  bookings,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStatusChange,
  onRecordPayment,
  onProcessRefund,
  onPrintInvoice,
  updatingBookingId,
}: BookingDataTableProps) {
  if (!bookings.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium">No bookings found matching query.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref ID</TableHead>
            <TableHead>Guest Details</TableHead>
            <TableHead>Room Unit</TableHead>
            <TableHead>Dates / Duration</TableHead>
            <TableHead>Financials (PKR)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <BookingTableRow
              key={booking.id}
              booking={booking}
              updatingBookingId={updatingBookingId}
              onStatusChange={onStatusChange}
              onRecordPayment={onRecordPayment}
              onProcessRefund={onProcessRefund}
              onPrintInvoice={onPrintInvoice}
            />
          ))}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        totalItems={totalCount}
      />
    </div>
  );
}
