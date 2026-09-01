import { OrderTypeSelector, OrderType } from './OrderTypeSelector';
import { MenuItem, MenuItemVariation, DiningTable } from '../../services/restaurantService';
import { CheckedInBooking } from './RoomServicePicker';
import { Trash2, Plus, Minus, Printer, Settings2, Table, BedDouble, User, DollarSign } from 'lucide-react';

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  variation?: MenuItemVariation | null;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
}

interface POSCartSidebarProps {
  cartItems: CartItem[];
  orderType: OrderType;
  selectedTable: DiningTable | null;
  selectedBooking: CheckedInBooking | null;
  customerName?: string;
  customerPhone?: string;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  taxPercentage: number;
  onSelectOrderType: (type: OrderType) => void;
  onOpenTableModal: () => void;
  onOpenRoomModal: () => void;
  onCustomerNameChange?: (name: string) => void;
  onCustomerPhoneChange?: (phone: string) => void;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onOpenBillingModal: () => void;
  onPlaceOrder: (printKot: boolean) => void;
  isSubmitting?: boolean;
}

export function POSCartSidebar({
  cartItems,
  orderType,
  selectedTable,
  selectedBooking,
  customerName = '',
  customerPhone = '',
  discountType,
  discountValue,
  taxPercentage,
  onSelectOrderType,
  onOpenTableModal,
  onOpenRoomModal,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onUpdateQuantity,
  onRemoveItem,
  onOpenBillingModal,
  onPlaceOrder,
  isSubmitting,
}: POSCartSidebarProps) {
  // Helper for safe monetary formatting
  const formatPKRVal = (val: number) => {
    const num = Number(val);
    const safe = isNaN(num) ? 0 : num;
    return safe.toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  // Safe Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const p = Number(item.unitPrice ?? 0);
    const safeP = isNaN(p) ? 0 : p;
    const q = Number(item.quantity ?? 1);
    const safeQ = isNaN(q) ? 1 : q;
    return acc + safeP * safeQ;
  }, 0);

  const safeSubtotal = isNaN(subtotal) ? 0 : subtotal;

  const rawDiscount =
    discountType === 'PERCENTAGE' ? (safeSubtotal * discountValue) / 100 : Math.min(discountValue, safeSubtotal);
  const discountAmount = isNaN(rawDiscount) ? 0 : Math.max(0, rawDiscount);

  const taxableAmount = Math.max(0, safeSubtotal - discountAmount);
  const rawTax = (taxableAmount * taxPercentage) / 100;
  const taxAmount = isNaN(rawTax) ? 0 : Math.max(0, rawTax);

  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="w-full h-full bg-white border-l border-slate-200 flex flex-col justify-between overflow-hidden font-sans">
      {/* Header & Order Type */}
      <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Order Cart</h2>
        <OrderTypeSelector selectedType={orderType} onSelectType={onSelectOrderType} />

        {/* Dynamic Destination Selector based on Order Type */}
        {orderType === 'DINE_IN' && (
          <button
            type="button"
            onClick={onOpenTableModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-700 truncate">
              <Table className="h-4 w-4 text-indigo-900 shrink-0" />
              <span className="truncate">
                {selectedTable
                  ? `Table ${selectedTable.table_number || (selectedTable as any).name || (selectedTable as any).number} (${selectedTable.floor_or_section || 'Ground Floor'})`
                  : 'Select Dining Table...'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0">
              {selectedTable ? 'Change' : 'Choose'}
            </span>
          </button>
        )}

        {orderType === 'ROOM_SERVICE' && (
          <button
            type="button"
            onClick={onOpenRoomModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-700 truncate">
              <BedDouble className="h-4 w-4 text-indigo-900 shrink-0" />
              <span className="truncate">
                {selectedBooking
                  ? `Room ${selectedBooking.room?.room_number || selectedBooking.room_number || (selectedBooking as any).roomNumber} - ${selectedBooking.guest_name || selectedBooking.guestName || (selectedBooking as any).guest?.fullName || 'Guest'}`
                  : 'Select Checked-In Room...'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0">
              {selectedBooking ? 'Change' : 'Choose'}
            </span>
          </button>
        )}

        {orderType === 'TAKEAWAY' && (
          <div className="space-y-2 p-2 rounded-xl border border-slate-200/90 bg-slate-50 text-xs font-sans">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <User className="h-3.5 w-3.5 text-indigo-900" />
              <span>Takeaway Customer Info (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => onCustomerNameChange && onCustomerNameChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Mobile #"
                value={customerPhone}
                onChange={(e) => onCustomerPhoneChange && onCustomerPhoneChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-600">Cart is Empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click food items from the catalog to add to order.</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const safeP = isNaN(Number(item.unitPrice)) ? 0 : Number(item.unitPrice);
            const lineTotal = safeP * item.quantity;
            return (
              <div
                key={item.cartId}
                className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.menuItem.name}</h4>
                    {item.variation && (
                      <span className="inline-block text-[10px] font-medium text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded-md mt-0.5">
                        {item.variation.name}
                      </span>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[10px] italic text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded-md mt-1 border border-amber-200/60">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.cartId)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartId, -1)}
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.cartId, 1)}
                      className="p-1 rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-900 font-mono">
                    PKR {formatPKRVal(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Dual Operational Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3 shrink-0 font-sans">
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900 font-mono">
              PKR {formatPKRVal(safeSubtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount ({discountType === 'PERCENTAGE' ? `${discountValue}%` : 'FLAT'}):</span>
              <span className="font-semibold font-mono">- PKR {formatPKRVal(discountAmount)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between">
              <span>GST Tax ({taxPercentage}%):</span>
              <span className="font-semibold text-slate-900 font-mono">+ PKR {formatPKRVal(taxAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-indigo-900 text-sm font-bold font-mono">
              PKR {formatPKRVal(grandTotal)}
            </span>
          </div>
        </div>

        {/* Dual Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-1 font-sans">
          <button
            type="button"
            onClick={onOpenBillingModal}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-all shrink-0 cursor-pointer"
            title="Configure Billing, Tax & Discounts"
          >
            <Settings2 className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 gap-2 flex-1">
            <button
              type="button"
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={() => onPlaceOrder(true)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-indigo-600 text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-bold text-xs disabled:opacity-50 transition-all shadow-2xs cursor-pointer"
              title="Send KOT to Kitchen & Create Order"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Send KOT</span>
            </button>

            <button
              type="button"
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={onOpenBillingModal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              title="Quick Pay & Settle Order"
            >
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Quick Pay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
