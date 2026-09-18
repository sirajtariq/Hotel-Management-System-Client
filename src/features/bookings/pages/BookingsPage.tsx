import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { RoomStatusGrid } from '../components/RoomStatusGrid';
import { RoomQuickActionModal } from '../components/RoomQuickActionModal';
import { BookingDataTable } from '../components/BookingDataTable';
import { BookingFormDrawer } from '../components/BookingFormDrawer';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { ProcessRefundModal } from '../components/ProcessRefundModal';
import { GuestInvoiceModal } from '../components/GuestInvoiceModal';
import { CheckoutPaymentModal } from '../components/CheckoutPaymentModal';
import { AddExtraChargeModal } from '../components/AddExtraChargeModal';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { formatPKR } from '@/lib/formatters';
import { Shield } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { roomService } from '@/features/rooms/services/roomService';
import { toast } from '@/components/ui/ToastProvider';
import { Booking, BookingStatus, CreateBookingInput, RecordPaymentInput } from '@/types/bookings';
import { Room, HousekeepingStatus, RoomStatus } from '@/types/rooms';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function BookingsPage() {
  const queryClient = useQueryClient();
  const { user, is_impersonated } = useAuth();
  const role = user?.role?.toLowerCase();
  const isPureSuperAdmin = (role === 'super_admin' || role === 'superadmin') && !is_impersonated;

  // View state
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Rooms Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Bookings Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Modal / Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [preselectedRoomId, setPreselectedRoomId] = useState<string | undefined>(undefined);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomActiveBooking, setSelectedRoomActiveBooking] = useState<Booking | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [checkoutWithPaymentBooking, setCheckoutWithPaymentBooking] = useState<Booking | null>(null);
  const [extraChargeBooking, setExtraChargeBooking] = useState<Booking | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  // Load Rooms
  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const data = await roomService.getRooms(undefined, true);
      setRooms(data);
    } catch {
      toast.error('Failed to load room inventory.');
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  // Load Bookings
  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await bookingService.getBookings({
        page: currentPage,
        page_size: pageSize,
      });
      setBookings(res.items || []);
      setTotalCount(res.totalCount || 0);
    } catch {
      toast.error('Failed to load bookings ledger.');
    } finally {
      setIsLoadingBookings(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, [fetchRooms, fetchBookings]);

  // Combined Refresh
  const handleRefreshAll = async () => {
    queryClient.invalidateQueries({ queryKey: ['rooms'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    await Promise.all([fetchRooms(), fetchBookings()]);
    toast.success('Refreshed', 'Front desk & room statuses updated.');
  };

  // Status Changes for Bookings (Check-In, Check-Out, Cancel)
  const handleStatusChange = async (id: string, status: BookingStatus) => {
    if (isPureSuperAdmin || updatingBookingId === id) return;
    setUpdatingBookingId(id);
    try {
      const updated = await bookingService.updateBookingStatus(id, status);
      setBookings((prev) => (Array.isArray(prev) ? prev : []).map((b) => (b.id === id ? { ...b, ...updated } : b)));
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await fetchRooms();
      toast.success('Status Updated', `Booking changed to ${String(status).toUpperCase().replace('_', ' ')}`);
      
      if (status === 'checked_out' && updated) {
        setInvoiceBooking(updated);
      }
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update booking status.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Housekeeping update
  const handleMarkHousekeeping = async (roomId: string, hkStatus: HousekeepingStatus) => {
    try {
      await roomService.updateHousekeepingStatus(roomId, hkStatus);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await fetchRooms();
      toast.success('Housekeeping Updated', `Room housekeeping status set to ${hkStatus}`);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update housekeeping status.');
    }
  };

  // Operational Room Status update
  const handleUpdateRoomStatus = async (roomId: string, status: RoomStatus) => {
    try {
      await roomService.updateRoomStatus(roomId, status);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      await fetchRooms();
      toast.success('Room Status Updated', `Room status set to ${status}`);
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update room status.');
    }
  };

  // Handle New Booking Creation (supports Create Reservation vs Instant Check-In)
  const handleAddBooking = async (data: CreateBookingInput, autoCheckIn = false) => {
    if (isPureSuperAdmin) return;
    try {
      const created = await bookingService.createBooking(data);
      if (autoCheckIn && created?.id) {
        await bookingService.updateBookingStatus(created.id, 'checked_in');
        toast.success('Instant Check-In Completed', `Guest checked in immediately.`);
      } else {
        toast.success('Reservation Created', `Booking ${created.bookingReference || 'confirmed'}`);
      }
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await Promise.all([fetchRooms(), fetchBookings()]);
    } catch (err: any) {
      toast.error('Booking Failed', err?.message || 'Could not create reservation.');
    }
  };

  // Handle Recording Payment
  const handleRecordPayment = async (input: RecordPaymentInput) => {
    if (isPureSuperAdmin) return;
    try {
      const updated = await bookingService.recordPayment(input);
      setBookings((prev) => (Array.isArray(prev) ? prev : []).map((b) => (b.id === input.bookingId ? updated : b)));
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Payment Recorded', `Payment of PKR ${input.amount.toLocaleString()} received.`);
    } catch {
      toast.error('Payment Failed', 'Could not record payment transaction.');
    }
  };

  const handleCheckoutWithPayment = async (input: any) => {
    if (isPureSuperAdmin) return;
    try {
      const updated = await bookingService.checkoutWithPayment(input);
      setBookings((prev) => (Array.isArray(prev) ? prev : []).map((b) => (b.id === input.bookingId ? { ...b, ...updated } : b)));
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await fetchRooms();
      toast.success('Checkout Successful', 'Guest checked out and payment settled.');
      if (updated && updated.id) {
        setInvoiceBooking(updated);
      }
    } catch (err: any) {
      toast.error('Checkout Failed', err?.message || 'Could not process checkout with payment.');
    }
  };

  const handleAddExtraCharge = async (data: any) => {
    try {
      await bookingService.addExtraCharge(data);
      toast.success(
        'Charge Posted',
        `Successfully posted ${formatPKR(data.amount)} charge to the bill.`
      );
      await fetchBookings();
    } catch (err: any) {
      toast.error('Posting Failed', err?.message || 'Could not post extra charge.');
    }
  };

  // Card Click Handler
  const handleRoomClick = (room: Room, activeBooking: Booking | null) => {
    const statusUpper = String(room.status || 'AVAILABLE').toUpperCase();
    const hkUpper = String(room.housekeeping_status || 'CLEAN').toUpperCase();
    const isAvailable = statusUpper === 'AVAILABLE' && (hkUpper === 'CLEAN' || hkUpper === 'INSPECTED');

    if (isAvailable && !activeBooking) {
      // ⚡ Direct In-Room Reservation & Booking Modal on Card Click
      setPreselectedRoomId(room.id);
      setIsDrawerOpen(true);
    } else {
      // Open QuickActionModal for reserved/occupied/dirty/maintenance rooms
      setSelectedRoom(room);
      setSelectedRoomActiveBooking(activeBooking);
      setIsQuickActionOpen(true);
    }
  };

  return (
    <PermissionGuard permission="bookings:view" moduleName="Reservations & Bookings">
      <div className="space-y-6">
        {isPureSuperAdmin && (
          <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3.5 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Platform Overview (Read-Only)</strong> — You are viewing live front desk inventory across tenants. Use <strong>'Login as Tenant'</strong> from the Tenants page to perform operations.
              </span>
            </div>
          </div>
        )}

        {/* Primary Operational View: Live Room Status Grid */}
        {viewMode === 'GRID' ? (
          <RoomStatusGrid
            rooms={rooms}
            bookings={bookings}
            isLoading={isLoadingRooms || isLoadingBookings}
            onRefresh={handleRefreshAll}
            onRoomClick={handleRoomClick}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        ) : (
          /* Alternate View: Tabular Booking Ledger */
          <div className="space-y-4 font-sans">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bookings & Reservations Ledger</h2>
                <p className="text-xs text-slate-500">Tabular ledger of guest reservations, stay dates, and check-in statuses</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-900 text-white font-bold text-xs hover:bg-indigo-950 shadow-xs cursor-pointer"
              >
                Switch to Live Room Grid
              </button>
            </div>

            {isLoadingBookings ? (
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
                onProcessRefund={(b) => setRefundBooking(b)}
                onPrintInvoice={(b) => setInvoiceBooking(b)}
                updatingBookingId={updatingBookingId}
              />
            )}
          </div>
        )}

        {/* Quick Action Modal for Room Card Clicks */}
        <RoomQuickActionModal
          room={selectedRoom}
          activeBooking={selectedRoomActiveBooking}
          isOpen={isQuickActionOpen}
          onClose={() => {
            setIsQuickActionOpen(false);
            setSelectedRoom(null);
            setSelectedRoomActiveBooking(null);
          }}
          onNewBooking={(roomId) => {
            setPreselectedRoomId(roomId);
            setIsDrawerOpen(true);
          }}
          onCheckIn={(bookingId) => handleStatusChange(bookingId, 'checked_in')}
          onCheckOut={(booking) => handleStatusChange(booking.id, 'checked_out')}
          onCheckOutWithPayment={(booking) => setCheckoutWithPaymentBooking(booking)}
          onRecordPayment={(b) => setPaymentBooking(b)}
          onViewFolio={(b) => setInvoiceBooking(b)}
          onMarkHousekeeping={handleMarkHousekeeping}
          onUpdateRoomStatus={handleUpdateRoomStatus}
          onAddExtraCharge={(b) => setExtraChargeBooking(b)}
        />

        {/* Drawer & Action Modals */}
        <BookingFormDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setPreselectedRoomId(undefined);
          }}
          onSubmit={handleAddBooking}
          preselectedRoomId={preselectedRoomId}
        />

        <RecordPaymentModal
          booking={paymentBooking}
          isOpen={!!paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSubmit={handleRecordPayment}
        />

        <ProcessRefundModal
          booking={refundBooking as any}
          isOpen={!!refundBooking}
          onClose={() => setRefundBooking(null)}
        />

        <GuestInvoiceModal
          booking={invoiceBooking}
          isOpen={!!invoiceBooking}
          onClose={() => setInvoiceBooking(null)}
        />

        <CheckoutPaymentModal
          booking={checkoutWithPaymentBooking}
          isOpen={!!checkoutWithPaymentBooking}
          onClose={() => setCheckoutWithPaymentBooking(null)}
          onSubmit={handleCheckoutWithPayment}
          onShowFolio={(tempExtraCharges) => {
            if (!checkoutWithPaymentBooking) return;
            const tempBooking = { ...checkoutWithPaymentBooking };
            if (tempExtraCharges && tempExtraCharges.length > 0) {
              tempBooking.extra_charges = [
                ...(tempBooking.extra_charges || tempBooking.extraCharges || []),
                ...tempExtraCharges
              ];
            }
            setInvoiceBooking(tempBooking);
          }}
        />

        <AddExtraChargeModal
          booking={extraChargeBooking}
          isOpen={!!extraChargeBooking}
          onClose={() => setExtraChargeBooking(null)}
          onSubmit={handleAddExtraCharge}
        />
      </div>
    </PermissionGuard>
  );
}
