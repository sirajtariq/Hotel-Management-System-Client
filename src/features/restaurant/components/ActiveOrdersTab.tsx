import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RestaurantOrder, ReceiptData, restaurantService } from '../services/restaurantService';
import { formatDate } from '@/lib/formatters';
import { RoomServicePicker, CheckedInBooking } from './pos/RoomServicePicker';
import { KitchenReceiptPrint } from './print/KitchenReceiptPrint';
import {
  Search,
  Filter,
  CreditCard,
  Building,
  Printer,
  XCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  Utensils,
  DollarSign,
  Bed,
  Wallet
} from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';

interface ActiveOrdersTabProps {
  onRefreshTriggered?: () => void;
}

export function ActiveOrdersTab({ onRefreshTriggered }: ActiveOrdersTabProps) {
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [settleOrderTarget, setSettleOrderTarget] = useState<RestaurantOrder | null>(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState<string>('CASH');

  const [roomChargeOrderTarget, setRoomChargeOrderTarget] = useState<RestaurantOrder | null>(null);
  const [isRoomPickerOpen, setIsRoomPickerOpen] = useState<boolean>(false);

  const [printReceiptData, setPrintReceiptData] = useState<ReceiptData | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    queryClient.invalidateQueries({ queryKey: ['payment-accounts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  }, [queryClient]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterPaymentStatus !== 'ALL') {
        params.payment_status = filterPaymentStatus;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await restaurantService.getOrders(params);
      setOrders(res.items || []);
    } catch (err) {
      toast.error('Failed to load restaurant orders list.');
    } finally {
      setLoading(false);
    }
  }, [filterPaymentStatus, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      fetchOrders();
      if (onRefreshTriggered) onRefreshTriggered();
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
      fetchOrders();
      if (onRefreshTriggered) onRefreshTriggered();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to bill order to room folio.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrintReceipt = async (orderId: number) => {
    setActionLoadingId(orderId);
    try {
      const data = await restaurantService.getReceiptData(orderId);
      setPrintReceiptData(data);
    } catch (err) {
      toast.error('Failed to load receipt printing data.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOrder = async (order: RestaurantOrder) => {
    if (!confirm(`Are you sure you want to cancel Order #${order.order_number}?`)) return;
    setActionLoadingId(order.id);
    try {
      await restaurantService.cancelOrder(order.id);
      toast.success(`Order #${order.order_number} has been cancelled.`);
      invalidateQueries();
      fetchOrders();
      if (onRefreshTriggered) onRefreshTriggered();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel order.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, room, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <button
            type="button"
            onClick={() => { invalidateQueries(); fetchOrders(); }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Status:
          </span>

          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'UNPAID', label: 'Unpaid / Open' },
            { key: 'BILLED_TO_ROOM', label: 'Billed to Room' },
            { key: 'PAID', label: 'Paid / Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterPaymentStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filterPaymentStatus === tab.key
                  ? 'bg-indigo-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden font-sans">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-xs font-medium">Loading POS Orders & Running Bills...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Utensils className="h-8 w-8 text-slate-300" />
            <span className="text-sm font-semibold text-slate-600">No orders found</span>
            <span className="text-xs text-slate-400">Try adjusting your search or filter options.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order # & Time</th>
                  <th className="p-3.5">Table / Room / Customer</th>
                  <th className="p-3.5">Items Summary</th>
                  <th className="p-3.5 text-right">Total Amount</th>
                  <th className="p-3.5 text-center">Payment Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => {
                  const isUnpaid = ord.payment_status === 'UNPAID';
                  const isBilledRoom = ord.payment_status === 'BILLED_TO_ROOM';
                  const isPaid = ord.payment_status === 'PAID';
                  const isCancelled = ord.status === 'CANCELLED';

                  const total = Number((ord as any).totalAmount ?? (ord as any).total_amount ?? ord.grand_total ?? (ord as any).total ?? 0);
                  const formattedTotal = `PKR ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

                  const timeString = ((ord as any).createdAt || ord.created_at)
                    ? new Date((ord as any).createdAt || ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now';

                  const itemsSummary = ord.items && ord.items.length > 0
                    ? ord.items.map((i: any) => `${i.quantity}x ${i.food_item_name || i.name || i.item_name || 'Item'}`).join(', ')
                    : `${ord.items_count || 1} Item(s)`;

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order # & Time */}
                      <td className="p-3.5">
                        <span className="font-bold text-indigo-950 block text-xs font-mono">
                          #{ord.order_number || ord.id}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-normal">
                          <Clock className="h-2.5 w-2.5" />
                          {timeString} • {formatDate(ord.created_at)}
                        </span>
                      </td>

                      {/* Location / Guest */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800 text-xs">
                          {ord.room_number ? (
                            <span className="inline-flex items-center gap-1 text-purple-900 font-bold">
                              <Building className="h-3 w-3" /> Room {ord.room_number}
                            </span>
                          ) : ord.table_number ? (
                            <span>Table {ord.table_number}</span>
                          ) : (
                            <span>Counter / Takeaway</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {ord.customer_name || 'Walk-in Guest'}
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="p-3.5 max-w-xs">
                        <span className="text-slate-900 font-medium block truncate" title={itemsSummary}>
                          {itemsSummary}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-xs">
                        {formattedTotal}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="p-3.5 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> PAID
                          </span>
                        ) : isBilledRoom ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                            <Building className="h-3 w-3" /> BILLED TO ROOM
                          </span>
                        ) : isCancelled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse">
                            UNPAID / OPEN
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isUnpaid && !isCancelled && (
                            <>
                              {/* Settle Payment Button (Green Wallet/Dollar) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSettleOrderTarget(ord);
                                  setSettlePaymentMethod('CASH');
                                }}
                                disabled={actionLoadingId === ord.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Settle Payment (Cash Drawer / Bank)"
                              >
                                <Wallet className="h-3.5 w-3.5" />
                                <span>Settle</span>
                              </button>

                              {/* Charge to Room Button (Bed Icon) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setRoomChargeOrderTarget(ord);
                                  setIsRoomPickerOpen(true);
                                }}
                                disabled={actionLoadingId === ord.id}
                                className="px-2.5 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Charge Bill to Guest Room Folio"
                              >
                                <Bed className="h-3.5 w-3.5" />
                                <span>Charge Room</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(ord.id)}
                            disabled={actionLoadingId === ord.id}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Print KOT / Receipt"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>

                          {!isPaid && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(ord)}
                              disabled={actionLoadingId === ord.id}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
                  <Building className="h-3.5 w-3.5" />
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

      {/* KOT / Receipt Print Modal */}
      {printReceiptData && (
        <KitchenReceiptPrint
          receipt={printReceiptData}
          onClose={() => setPrintReceiptData(null)}
        />
      )}
    </div>
  );
}
