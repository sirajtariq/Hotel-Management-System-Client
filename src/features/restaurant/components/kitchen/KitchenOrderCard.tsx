import { RestaurantOrder } from '../../services/restaurantService';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Utensils, ShoppingBag, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: RestaurantOrder;
  onUpdateStatus: (orderId: number, newStatus: string, itemId?: number) => void;
}

const getElapsedMinutes = (dateString?: string) => {
  if (!dateString) return 'Just now';
  const created = new Date(dateString).getTime();
  if (isNaN(created)) return 'Just now';
  const diffMinutes = Math.max(0, Math.floor((Date.now() - created) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  const remainingMins = diffMinutes % 60;
  return `${hours}h ${remainingMins}m ago`;
};

export function KitchenOrderCard({ order, onUpdateStatus }: KitchenOrderCardProps) {
  const queryClient = useQueryClient();
  const createdTime = (order as any).createdAt || order.created_at;
  const timeAgo = getElapsedMinutes(createdTime);

  const items = order.items || [];
  const statusStr = String(order.status || 'PENDING').toUpperCase();

  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(order.id, newStatus);
    queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const getOrderTypeBadge = () => {
    if (order.order_type === 'DINE_IN') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900">
          <Utensils className="h-3 w-3" />
          Table {order.table_number || (order as any).tableNumber || 'N/A'}
        </span>
      );
    }
    if (order.order_type === 'ROOM_SERVICE') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900">
          <BellRing className="h-3 w-3" />
          Room {order.room_number || (order as any).roomNumber || 'N/A'}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900">
        <ShoppingBag className="h-3 w-3" />
        Takeaway
      </span>
    );
  };

  const getStatusBadge = () => {
    if (statusStr === 'PENDING' || statusStr === 'NEW') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase">PENDING</span>;
    }
    if (statusStr === 'PREPARING' || statusStr === 'IN_KITCHEN') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase">IN KITCHEN</span>;
    }
    if (statusStr === 'READY') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">READY</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase">{statusStr}</span>;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full font-sans',
        statusStr === 'PENDING' || statusStr === 'NEW'
          ? 'border-rose-200'
          : statusStr === 'PREPARING' || statusStr === 'IN_KITCHEN'
          ? 'border-amber-200'
          : 'border-emerald-200'
      )}
    >
      <div>
        {/* Ticket Header: Prominent Order # */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Ticket</div>
            <h3 className="text-base font-extrabold text-slate-900 font-mono">
              #{order.order_number || (order as any).orderNumber || order.id || 'N/A'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Order Location & Status Badges */}
        <div className="flex items-center justify-between my-3">
          {getOrderTypeBadge()}
          {getStatusBadge()}
        </div>

        {order.customer_name && (
          <div className="text-xs text-slate-500 mb-2 font-normal">
            Guest: <span className="text-slate-900 font-semibold">{order.customer_name}</span>
          </div>
        )}

        {/* Card Body: Itemized Food List */}
        <div className="my-3 space-y-2 border-y border-dashed border-gray-200 py-3 text-sm">
          {items && items.length > 0 ? (
            items.map((item: any, idx: number) => {
              const itemName = item.food_item_name || item.item_name || item.name || 'Food Item';
              const notes = item.notes || item.special_instructions || item.instruction;
              return (
                <div key={item.id || idx} className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-bold text-slate-800 text-xs shrink-0 mt-0.5 font-mono">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">
                        {itemName}
                        {item.variation_name && (
                          <span className="text-slate-500 font-normal text-xs"> ({item.variation_name})</span>
                        )}
                      </p>
                      {notes && (
                        <p className="text-xs text-amber-800 font-medium mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block">
                          Note: {notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic">No items details attached</p>
          )}
        </div>
      </div>

      {/* Dynamic Status Transition Buttons (KDS Workflow) */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2 font-sans">
        {(statusStr === 'PENDING' || statusStr === 'NEW') && (
          <button
            type="button"
            onClick={() => handleStatusChange('PREPARING')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <span>🔥 Start Cooking</span>
          </button>
        )}

        {(statusStr === 'PREPARING' || statusStr === 'IN_KITCHEN') && (
          <button
            type="button"
            onClick={() => handleStatusChange('READY')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <span>🔔 Mark Order Ready</span>
          </button>
        )}

        {statusStr === 'READY' && (
          <button
            type="button"
            onClick={() => handleStatusChange('SERVED')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
          >
            <span>🚀 Order Served / Delivered</span>
          </button>
        )}
      </div>
    </div>
  );
}
