import React, { useState } from 'react';
import { MenuCatalogPage } from '@/features/restaurant/pages/MenuCatalogPage';
import { TableManagementPage } from '@/features/restaurant/pages/TableManagementPage';
import { UtensilsCrossed, BookOpen, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RestaurantAdminTab() {
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'tables'>('menu');

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Sub-Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Restaurant Master Catalog & Floor Layout
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Configure menu items, variations, pricing, and dining table arrangements
            </p>
          </div>
        </div>

        {/* 2-Pill Sub-Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('menu')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
              activeSubTab === 'menu'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Menu Categories & Items</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tables')}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
              activeSubTab === 'tables'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>Dining Tables & Layout</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Active Body */}
      {activeSubTab === 'menu' && <MenuCatalogPage hideHeader={true} />}
      {activeSubTab === 'tables' && <TableManagementPage hideHeader={true} />}
    </div>
  );
}
