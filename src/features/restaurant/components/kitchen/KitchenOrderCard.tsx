import { RestaurantOrder } from '../../services/restaurantService';
import { Clock, CheckCircle2, Flame, Utensils, ShoppingBag, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: RestaurantOrder;
  onUpdateStatus: (orderId: number, newStatus: string, itemId?: number) => void;
}

export function KitchenOrderCard({ order, onUpdateStatus }: KitchenOrderCardProps) {
  // Elapsed time calculation
  const createdDate = new Date(order.created_at);
  const now = new Date();
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - createdDate.getTime()) / 60000));

  const items = order.items || [];

  const getOrderTypeBadge = () => {
    if (order.order_type === 'DINE_IN') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900">
          <Utensils className="h-3 w-3" />
          Table {order.table_number || 'N/A'}
        </span>
      );
    }
    if (order.order_type === 'ROOM_SERVICE') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900">
          <BellRing className="h-3 w-3" />
          Room {order.room_number || 'N/A'}
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
    if (order.status === 'PENDING') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">PENDING</span>;
    }
    if (order.status === 'PREPARING') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">IN KITCHEN</span>;
    }
    if (order.status === 'READY') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">READY</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{order.status}</span>;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full',
        order.status === 'PENDING'
          ? 'border-rose-200'
          : order.status === 'PREPARING'
          ? 'border-amber-200'
          : 'border-emerald-200'
      )}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order Ticket</div>
            <h3 className="text-sm font-bold text-slate-900">{order.order_number}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>{diffMinutes}m ago</span>
          </div>
        </div>

        {/* Order Info Bar */}
        <div className="flex items-center justify-between my-3">
          {getOrderTypeBadge()}
          {getStatusBadge()}
        </div>

        {order.customer_name && (
          <div className="text-xs text-slate-500 mb-3 font-normal">
            Guest: <span className="text-slate-900 font-medium">{order.customer_name}</span>
          </div>
        )}

        {/* Item Checklist */}
        <div className="space-y-2 my-4">
          {items.map((item) => (
            <div
              key={item.id || item.item_name}
              className="flex items-start justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  <span className="text-indigo-900 font-bold mr-1.5">{item.quantity}x</span>
                  {item.item_name}
                  {item.variation_name && <span className="text-slate-500 font-normal"> ({item.variation_name})</span>}
                </div>
                {item.special_instructions && (
                  <p className="text-[11px] italic text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1 font-normal">
                    Note: "{item.special_instructions}"
                  </p>
                )}
              </div>

              <span
                className={cn(
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase',
                  item.status === 'READY'
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.status === 'PREPARING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-600'
                )}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
        {order.status === 'PENDING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Flame className="h-4 w-4" />
            <span>Start Cooking</span>
          </button>
        )}

        {order.status === 'PREPARING' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Mark Ready</span>
          </button>
        )}

        {order.status === 'READY' && (
          <button
            type="button"
            onClick={() => onUpdateStatus(order.id, 'SERVED')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Utensils className="h-4 w-4" />
            <span>Mark Served</span>
          </button>
        )}
      </div>
    </div>
  );
}
