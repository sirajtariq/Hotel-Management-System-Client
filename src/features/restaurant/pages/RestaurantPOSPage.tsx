import { POSCatalogSkeleton } from '../components/skeletons/POSCatalogSkeleton';
import { useState, useMemo } from 'react';
import { useRestaurantMenu } from '../hooks/useRestaurantMenu';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { useDiningTables } from '../hooks/useDiningTables';
import { CategoryPills } from '../components/pos/CategoryPills';
import { MenuItemCard } from '../components/pos/MenuItemCard';
import { VariationModal } from '../components/pos/VariationModal';
import { POSCartSidebar, CartItem } from '../components/pos/POSCartSidebar';
import { OrderType } from '../components/pos/OrderTypeSelector';
import { TableSelectorModal } from '../components/pos/TableSelectorModal';
import { RoomServicePicker, CheckedInBooking } from '../components/pos/RoomServicePicker';
import { POSBillingModal } from '../components/pos/POSBillingModal';
import { KitchenReceiptPrint } from '../components/print/KitchenReceiptPrint';
import { RestaurantHeaderNav } from '../components/RestaurantHeaderNav';
import { MenuItem, MenuItemVariation, DiningTable, ReceiptData, restaurantService } from '../services/restaurantService';
import { Search, Loader2, UtensilsCrossed } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';

export function RestaurantPOSPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { categories, menuItems, loading: menuLoading, searchQuery, setSearchQuery } = useRestaurantMenu(selectedCategoryId || undefined);
  const { tables } = useDiningTables();
  const { createOrder } = useRestaurantOrders();

  // POS Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CheckedInBooking | null>(null);

  // Billing Adjustments State
  const [discountType, setDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Modals
  const [activeVariationItem, setActiveVariationItem] = useState<MenuItem | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Thermal Print Modal
  const [printReceipt, setPrintReceipt] = useState<ReceiptData | null>(null);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategoryId ? item.category === selectedCategoryId : true;
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategoryId, searchQuery]);

  const handleSelectItem = (item: MenuItem) => {
    if (item.has_variations && item.variations && item.variations.length > 0) {
      setActiveVariationItem(item);
    } else {
      addToCart(item, null, '');
    }
  };

  const addToCart = (item: MenuItem, variation: MenuItemVariation | null, instructions: string) => {
    const unitPrice = variation ? Number(variation.price) : Number(item.base_price);
    const cartId = `${item.id}-${variation?.id || 'base'}-${instructions}`;

    setCartItems((prev) => {
      const existing = prev.find((c) => c.cartId === cartId);
      if (existing) {
        return prev.map((c) => (c.cartId === cartId ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [
        ...prev,
        {
          cartId,
          menuItem: item,
          variation,
          unitPrice,
          quantity: 1,
          specialInstructions: instructions,
        },
      ];
    });

    toast.success(`Added ${item.name} to cart.`);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((c) => {
          if (c.cartId === cartId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((c) => c.cartId !== cartId));
  };

  const handlePlaceOrder = async (printKot: boolean, paymentStatusOverride?: 'UNPAID' | 'PAID' | 'BILLED_TO_ROOM') => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty.');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable) {
      toast.error('Please select a dining table for Dine-In orders.');
      setIsTableModalOpen(true);
      return;
    }

    if (orderType === 'ROOM_SERVICE' && !selectedBooking) {
      toast.error('Please select a checked-in guest room for Room Service.');
      setIsRoomModalOpen(true);
      return;
    }

    const firstPropertyId = selectedTable?.property || 1;

    const payload = {
      property_id: firstPropertyId,
      order_type: orderType,
      table_id: orderType === 'DINE_IN' ? selectedTable?.id : null,
      booking_id: orderType === 'ROOM_SERVICE' ? selectedBooking?.id : null,
      room_number: orderType === 'ROOM_SERVICE' ? (selectedBooking?.room?.room_number || selectedBooking?.room_number || '') : '',
      customer_name: customerName || (selectedBooking ? selectedBooking.guest_name : 'Walk-in Guest'),
      customer_phone: customerPhone || (selectedBooking ? selectedBooking.guest_phone : ''),
      payment_status: paymentStatusOverride || (orderType === 'ROOM_SERVICE' ? 'BILLED_TO_ROOM' : 'UNPAID'),
      payment_method: paymentMethod,
      discount_type: discountType,
      discount_value: discountValue,
      tax_percentage: taxPercentage,
      items: cartItems.map((c) => ({
        menu_item_id: c.menuItem.id,
        variation_id: c.variation?.id || null,
        unit_price: c.unitPrice,
        quantity: c.quantity,
        special_instructions: c.specialInstructions || '',
      })),
    };

    setIsSubmitting(true);
    const created = await createOrder(payload);
    setIsSubmitting(false);

    if (created) {
      setCartItems([]);
      setSelectedTable(null);
      setSelectedBooking(null);
      setDiscountValue(0);
      setTaxPercentage(0);
      setCustomerName('');
      setCustomerPhone('');

      if (printKot) {
        try {
          const receiptData = await restaurantService.getReceiptData(created.id);
          setPrintReceipt(receiptData);
        } catch {
          toast.success('Order placed successfully.');
        }
      }
    }
  };

  const handleTriggerBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Catalog & Menu Left Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        {/* Top Restaurant Navigation Bar */}
        <RestaurantHeaderNav />

        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-indigo-900" />
              Restaurant & POS Terminal
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Order processing, catalog selection, table assignment, and KOT printing
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Selector Pills */}
        <div className="mb-4">
          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>

        {/* Food Items Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {menuLoading ? (
            <POSCatalogSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <UtensilsCrossed className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Food Items Found</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting a different category or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onSelect={handleSelectItem} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Cart Sidebar */}
      <div className="w-full md:w-96 shrink-0 h-full">
        <POSCartSidebar
          cartItems={cartItems}
          orderType={orderType}
          selectedTable={selectedTable}
          selectedBooking={selectedBooking}
          discountType={discountType}
          discountValue={discountValue}
          taxPercentage={taxPercentage}
          onSelectOrderType={setOrderType}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          onOpenRoomModal={() => setIsRoomModalOpen(true)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOpenBillingModal={() => setIsBillingModalOpen(true)}
          onPlaceOrder={(printKot) => handlePlaceOrder(printKot)}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Variation Selection Modal */}
      {activeVariationItem && (
        <VariationModal
          item={activeVariationItem}
          isOpen={!!activeVariationItem}
          onClose={() => setActiveVariationItem(null)}
          onConfirm={addToCart}
        />
      )}

      {/* Dining Table Selector Modal */}
      <TableSelectorModal
        tables={tables}
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onSelectTable={(table) => setSelectedTable(table)}
      />

      {/* Room Service Guest Selector Modal */}
      <RoomServicePicker
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSelectBooking={(b) => setSelectedBooking(b)}
      />

      {/* Billing & Tax Setup Modal */}
      <POSBillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        subtotal={cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)}
        discountType={discountType}
        discountValue={discountValue}
        taxPercentage={taxPercentage}
        paymentMethod={paymentMethod}
        customerName={customerName}
        customerPhone={customerPhone}
        onUpdateBilling={(data) => {
          setDiscountType(data.discountType);
          setDiscountValue(data.discountValue);
          setTaxPercentage(data.taxPercentage);
          setPaymentMethod(data.paymentMethod);
          setCustomerName(data.customerName);
          setCustomerPhone(data.customerPhone);
        }}
        onConfirmOrder={(statusOverride) => handlePlaceOrder(true, statusOverride)}
      />

      {/* Thermal Receipt Print Modal */}
      {printReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Thermal KOT Ticket Preview
            </h3>

            <div className="max-h-[60vh] overflow-y-auto w-full p-2 bg-slate-100 rounded-xl mb-4">
              <KitchenReceiptPrint receipt={printReceipt} />
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setPrintReceipt(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleTriggerBrowserPrint}
                className="flex-1 py-2 rounded-xl bg-indigo-900 text-white font-semibold text-xs hover:bg-indigo-800"
              >
                Print KOT Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
