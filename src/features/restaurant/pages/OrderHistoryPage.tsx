import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { restaurantService, RestaurantOrder, ReceiptData } from '../services/restaurantService';
import { Receipt, Search, Printer, RefreshCw, X, Wallet, Bed, Loader2 } from 'lucide-react';
import { KitchenReceiptPrint } from '../components/print/KitchenReceiptPrint';
import { CustomerBillPrint } from '../components/print/CustomerBillPrint';
import { RoomServicePicker, CheckedInBooking } from '../components/pos/RoomServicePicker';
import { toast } from '@/components/ui/ToastProvider';
import { TablePagination } from '@/components/ui/TablePagination';

export function OrderHistoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { orders, totalCount, loading, refetchOrders } = useRestaurantOrders({
    search,
    status: statusFilter,
    order_type: orderTypeFilter,
    page: currentPage,
    pageSize: pageSize,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, orderTypeFilter]);

  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [printMode, setPrintMode] = useState<'KOT' | 'CUSTOMER_BILL'>('CUSTOMER_BILL');

  // Modals for Actions
  const [settleOrderTarget, setSettleOrderTarget] = useState<RestaurantOrder | null>(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<string>('CASH');

  const [roomChargeOrderTarget, setRoomChargeOrderTarget] = useState<RestaurantOrder | null>(null);
  const [isRoomPickerOpen, setIsRoomPickerOpen] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  }, [queryClient]);

  const handleSettlePayment = async () => {
    if (!settleOrderTarget) return;
    setActionLoadingId(settleOrderTarget.id);
    try {
      await restaurantService.settlePayment(settleOrderTarget.id, {
        payment_status: 'PAID',
        payment_method: settlePaymentMethod,
      });
      toast.success(`Order #${settleOrderTarget.order_number} marked as Paid & Closed.`);
      setSettleOrderTarget(null);
      invalidateQueries();
      refetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to settle order payment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleChargeToRoomSelectBooking = async (booking: CheckedInBooking) => {
    if (!roomChargeOrderTarget) return;
    setActionLoadingId(roomChargeOrderTarget.id);
    try {
      await restaurantService.settlePayment(roomChargeOrderTarget.id, {
        payment_status: 'BILLED_TO_ROOM',
        payment_method: 'ROOM_FOLIO',
        booking_id: typeof booking.id === 'string' ? parseInt(booking.id, 10) : booking.id,
      });
      toast.success(`Order #${roomChargeOrderTarget.order_number} charged to Room ${booking.room_number || booking.roomNumber || booking.room?.room_number || ''}.`);
      setRoomChargeOrderTarget(null);
      setIsRoomPickerOpen(false);
      invalidateQueries();
      refetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to bill order to room folio.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFetchReceipt = async (orderId: number, mode: 'KOT' | 'CUSTOMER_BILL') => {
    try {
      const data = await restaurantService.getReceiptData(orderId);
      setActiveReceipt(data);
      setPrintMode(mode);
    } catch (err: any) {
      toast.error('Failed to load order receipt data.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Restaurant Order History & Receipts</h1>
            <p className="text-xs text-slate-500 font-normal">
              Complete searchable order log, customer tax invoices, and settlement actions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { invalidateQueries(); refetchOrders(); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order #, Guest, Room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Order Types (Dine-In / Takeaway / Room Service)</option>
          <option value="DINE_IN">Dine-In</option>
          <option value="TAKEAWAY">Takeaway</option>
          <option value="ROOM_SERVICE">Room Service</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="SERVED">Served</option>
          <option value="COMPLETED">Completed / Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="p-4">Order #</th>
              <th className="p-4">Type & Location</th>
              <th className="p-4">Items Summary</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Time</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {orders.map((o) => {
              const oNum = o.order_number || (o as any).orderNumber || `ORD-${o.id}`;
              const oType = o.order_type || (o as any).orderType || 'DINE_IN';
              const cName = o.customer_name || (o as any).customerName || 'Walk-in Guest';
              const tNum = o.table_number || (o as any).tableNumber;
              const rNum = o.room_number || (o as any).roomNumber;

              const total = Number((o as any).totalAmount ?? (o as any).total_amount ?? o.grand_total ?? (o as any).total ?? 0);
              const formattedTotal = `PKR ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

              const timeString = ((o as any).createdAt || o.created_at)
                ? new Date((o as any).createdAt || o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now';

              const itemsSummary = o.items && o.items.length > 0
                ? o.items.map((i: any) => `${i.quantity}x ${i.food_item_name || i.name || i.item_name || 'Item'}`).join(', ')
                : `${o.items_count || 1} Item(s)`;

              const pStatus = o.payment_status || (o as any).paymentStatus || 'UNPAID';
              const statusVal = o.status || (o as any).orderStatus || 'PENDING';
              const isUnpaid = pStatus === 'UNPAID';

              return (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900 font-mono">#{oNum}</td>
                  <td className="p-4">
                    <div className="font-semibold text-indigo-900">{oType}</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {cName} ({oType === 'DINE_IN' ? `Table ${tNum || 'N/A'}` : oType === 'ROOM_SERVICE' ? `Room ${rNum || 'N/A'}` : 'Counter'})
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <span className="text-slate-800 font-medium truncate block" title={itemsSummary}>
                      {itemsSummary}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {statusVal}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        pStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pStatus === 'BILLED_TO_ROOM'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {pStatus}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 font-mono text-xs">
                    {formattedTotal}
                  </td>
                  <td className="p-4 text-slate-500 font-normal">
                    {timeString}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isUnpaid && statusVal !== 'CANCELLED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSettleOrderTarget(o);
                              setSettlePaymentMethod('CASH');
                            }}
                            disabled={actionLoadingId === o.id}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Settle Payment (Cash Drawer / Bank)"
                          >
                            <Wallet className="h-3 w-3" />
                            <span>Settle</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRoomChargeOrderTarget(o);
                              setIsRoomPickerOpen(true);
                            }}
                            disabled={actionLoadingId === o.id}
                            className="px-2 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Charge Bill to Guest Room Folio"
                          >
                            <Bed className="h-3 w-3" />
                            <span>Room Folio</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleFetchReceipt(o.id, 'CUSTOMER_BILL')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        title="Print Customer Invoice"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFetchReceipt(o.id, 'KOT')}
                        className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 transition-colors cursor-pointer"
                        title="Print Kitchen Ticket"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalCount}
        />
      </div>

      {/* Settle Order Modal */}
      {settleOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Settle Order #{settleOrderTarget.order_number}
              </h3>
              <button
                type="button"
                onClick={() => setSettleOrderTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Customer / Guest:</span>
                <span className="font-semibold text-slate-900">{settleOrderTarget.customer_name || 'Walk-in Guest'}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1.5 border-t border-slate-200">
                <span>Order Total & Balance:</span>
                <span className="font-mono text-indigo-950">
                  PKR {Number(settleOrderTarget.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Select Payment Account / Method</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSettlePaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    settlePaymentMethod === 'CASH'
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Cash Drawer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlePaymentMethod('BANK_TRANSFER')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    settlePaymentMethod === 'BANK_TRANSFER'
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Bank Account</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettleOrderTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSettlePayment}
                disabled={actionLoadingId === settleOrderTarget.id}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {actionLoadingId === settleOrderTarget.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Mark as Paid & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charge to Room Picker Modal */}
      {isRoomPickerOpen && roomChargeOrderTarget && (
        <RoomServicePicker
          isOpen={isRoomPickerOpen}
          onClose={() => {
            setIsRoomPickerOpen(false);
            setRoomChargeOrderTarget(null);
          }}
          onSelectBooking={handleChargeToRoomSelectBooking}
        />
      )}

      {/* Print Preview Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full pb-3 border-b mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                {printMode === 'CUSTOMER_BILL' ? 'Customer Invoice Preview' : 'Kitchen Order Ticket (KOT)'}
              </h3>
              <button onClick={() => setActiveReceipt(null)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto w-full p-2 bg-slate-100 rounded-xl mb-4">
              {printMode === 'CUSTOMER_BILL' ? (
                <CustomerBillPrint receipt={activeReceipt} />
              ) : (
                <KitchenReceiptPrint receipt={activeReceipt} />
              )}
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs shadow-xs"
              >
                Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
