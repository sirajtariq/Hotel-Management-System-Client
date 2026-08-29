import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { BookingDataTable } from '../components/BookingDataTable';
import { BookingFormDrawer } from '../components/BookingFormDrawer';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { GuestInvoiceModal } from '../components/GuestInvoiceModal';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { bookingService } from '../services/bookingService';
import { Can } from '@/lib/rbac';
import { toast } from '@/components/ui/ToastProvider';
import { Booking, BookingStatus, CreateBookingInput, RecordPaymentInput } from '@/types/bookings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';

export function BookingsPage() {
  const { user, is_impersonated } = useAuth();
  const role = user?.role?.toLowerCase();
  const isPureSuperAdmin = (role === 'super_admin' || role === 'superadmin') && !is_impersonated;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  // Reset pagination back to Page 1 on search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setIsLoading(true);
    bookingService
      .getBookings({ page: currentPage, page_size: pageSize, search: debouncedSearch })
      .then((res) => {
        setBookings(res.items);
        setTotalCount(res.totalCount);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearch]);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    if (isPureSuperAdmin) return;
    try {
      const updated = await bookingService.updateBookingStatus(id, status);
      setBookings((prev) => (Array.isArray(prev) ? prev : []).map((b) => (b.id === id ? updated : b)));
      toast.success('Reservation Updated', `Booking status changed to ${status.toUpperCase().replace('_', ' ')}`);
    } catch {
      toast.error('Update Failed', 'Could not update booking status.');
    }
  };

  const handleAddBooking = async (data: CreateBookingInput) => {
    if (isPureSuperAdmin) return;
    try {
      const created = await bookingService.createBooking(data);
      setBookings((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      toast.success('Reservation Created', `Booking ${created.bookingReference || 'confirmed'}`);
    } catch {
      toast.error('Booking Failed', 'Could not create new reservation.');
    }
  };

  const handleRecordPayment = async (input: RecordPaymentInput) => {
    if (isPureSuperAdmin) return;
    try {
      const updated = await bookingService.recordPayment(input);
      setBookings((prev) => (Array.isArray(prev) ? prev : []).map((b) => (b.id === input.bookingId ? updated : b)));
      toast.success('Payment Recorded', `Payment of PKR ${input.amount.toLocaleString()} received.`);
    } catch {
      toast.error('Payment Failed', 'Could not record payment transaction.');
    }
  };

  return (
    <PermissionGuard permission="bookings:view" moduleName="Reservations & Bookings">
      <div className="space-y-6">
        {isPureSuperAdmin && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Platform Overview (Read-Only)</strong> — You are viewing live bookings across tenants. Use <strong>'Login as Tenant'</strong> from the Tenants page to perform operations.
              </span>
            </div>
          </div>
        )}

        <PageHeader
          title="Reservations & Bookings"
          description="Guest booking ledger, check-in dispatch, payments in PKR, and printable invoices"
          actions={
            !isPureSuperAdmin ? (
              <Can permission="bookings:create">
                <Button size="sm" className="gap-1.5 text-xs bg-indigo-900 text-white hover:bg-indigo-950" onClick={() => setIsDrawerOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  New Reservation
                </Button>
              </Can>
            ) : undefined
          }
        />

        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search booking ref, guest name, or room..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : (
          <BookingDataTable
            bookings={bookings}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            onStatusChange={handleStatusChange}
            onRecordPayment={(b) => setPaymentBooking(b)}
            onPrintInvoice={(b) => setInvoiceBooking(b)}
          />
        )}

        <BookingFormDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSubmit={handleAddBooking}
        />

        <RecordPaymentModal
          booking={paymentBooking}
          isOpen={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSubmit={handleRecordPayment}
        />

        <GuestInvoiceModal
          booking={invoiceBooking}
          isOpen={!!invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />
      </div>
    </PermissionGuard>
  );
}
