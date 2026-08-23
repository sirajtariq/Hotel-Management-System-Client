import { useState, useEffect } from 'react';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { restaurantService, RestaurantOrder, ReceiptData } from '../services/restaurantService';
import { RestaurantHeaderNav } from '../components/RestaurantHeaderNav';
import { Receipt, Search, Printer, RefreshCw, X } from 'lucide-react';
import { KitchenReceiptPrint } from '../components/print/KitchenReceiptPrint';
import { CustomerBillPrint } from '../components/print/CustomerBillPrint';
import { toast } from '@/components/ui/ToastProvider';
import { TablePagination } from '@/components/ui/TablePagination';

export function OrderHistoryPage() {
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
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Restaurant Navigation Bar */}
      <RestaurantHeaderNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Restaurant Order History & Receipts</h1>
            <p className="text-xs text-slate-500 font-normal">
              Complete searchable order log, customer tax invoices, and KOT reprints
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetchOrders()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
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
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none"
        >
          <option value="">All Order Types (Dine-In / Takeaway / Room Service)</option>
          <option value="DINE_IN">Dine-In</option>
          <option value="TAKEAWAY">Takeaway</option>
          <option value="ROOM_SERVICE">Room Service</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none"
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
              <th className="p-4">Type</th>
              <th className="p-4">Customer / Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Grand Total</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4 text-right">Receipt Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 font-bold text-slate-900">{o.order_number}</td>
                <td className="p-4 font-semibold text-indigo-900">{o.order_type}</td>
                <td className="p-4">
                  <div className="font-semibold text-slate-900">
                    {o.customer_name || 'Walk-in Guest'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    {o.order_type === 'DINE_IN' && `Table ${o.table_number || 'N/A'}`}
                    {o.order_type === 'ROOM_SERVICE' && `Room ${o.room_number || 'N/A'}`}
                    {o.order_type === 'TAKEAWAY' && 'Counter Pick-up'}
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                    {o.status}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      o.payment_status === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : o.payment_status === 'BILLED_TO_ROOM'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {o.payment_status}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-900">
                  PKR {Number(o.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-4 text-slate-500 font-normal">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleFetchReceipt(o.id, 'CUSTOMER_BILL')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      <span>Bill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFetchReceipt(o.id, 'KOT')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-medium text-indigo-900"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>KOT</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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

      {/* Print Modal */}
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
                className="flex-1 py-2 rounded-xl border text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2 rounded-xl bg-indigo-900 text-white font-semibold text-xs shadow-xs"
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
