import { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { BookingTableRow } from './BookingTableRow';
import { Booking, BookingStatus } from '@/types/bookings';
import { TablePagination } from '@/components/ui/TablePagination';

interface BookingDataTableProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
  onRecordPayment: (booking: Booking) => void;
  onPrintInvoice: (booking: Booking) => void;
}

export function BookingDataTable({
  bookings,
  onStatusChange,
  onRecordPayment,
  onPrintInvoice,
}: BookingDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 when data/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookings.length]);

  if (!bookings.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 font-medium">No bookings found matching query.</p>
      </div>
    );
  }

  const paginatedBookings = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          {paginatedBookings.map((booking) => (
            <BookingTableRow
              key={booking.id}
              booking={booking}
              onStatusChange={onStatusChange}
              onRecordPayment={onRecordPayment}
              onPrintInvoice={onPrintInvoice}
            />
          ))}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={bookings.length}
      />
    </div>
  );
}
