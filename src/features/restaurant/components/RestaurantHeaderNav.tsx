import { useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ChefHat, BookOpen, Grid3X3, Receipt } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/utils';

export function RestaurantHeaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermission();

  const tabs = [
    {
      name: 'POS Terminal',
      path: '/restaurant/pos',
      icon: UtensilsCrossed,
      perm: 'restaurant:pos',
    },
    {
      name: 'Kitchen Display',
      path: '/restaurant/kitchen',
      icon: ChefHat,
      perm: 'restaurant:kitchen',
    },
    {
      name: 'Menu Catalog',
      path: '/restaurant/menu',
      icon: BookOpen,
      perm: 'restaurant:menu_manage',
    },
    {
      name: 'Dining Tables',
      path: '/restaurant/tables',
      icon: Grid3X3,
      perm: 'restaurant:tables_manage',
    },
    {
      name: 'Order History',
      path: '/restaurant/orders',
      icon: Receipt,
      perm: 'restaurant:orders_view',
    },
  ];

  const visibleTabs = tabs.filter((t) => hasPermission(t.perm));

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1.5 rounded-xl border border-slate-200 mb-4">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
              isActive
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
}
