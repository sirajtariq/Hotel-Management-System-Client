import React, { useState } from 'react';
import { AdminNavHeader } from '../components/AdminNavHeader';
import { PermissionGuard } from '@/components/layout/PermissionGuard';
import { MenuCatalogPage } from '@/features/restaurant/pages/MenuCatalogPage';
import { TableManagementPage } from '@/features/restaurant/pages/TableManagementPage';
import { Utensils, Grid3X3, BookOpen } from 'lucide-react';

export function RestaurantConfigPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'tables'>('catalog');

  return (
    <PermissionGuard permission="restaurant:menu_manage" moduleName="Restaurant Master Setup">
      <div className="space-y-6 font-sans">
        <AdminNavHeader
          currentTab="restaurant-setup"
          title="Restaurant Master Setup & Dining Floor Controls"
          subtitle="Manage food categories, pricing variations, menu items, and POS dining table layouts"
        />

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tab 1: Menu Catalog & Variations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-indigo-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span>Tab 2: Dining Tables & Floor Layout</span>
          </button>
        </div>

        {/* Tab 1 Content: Food Catalog & Items */}
        {activeTab === 'catalog' && <MenuCatalogPage />}

        {/* Tab 2 Content: Dining Tables Layout */}
        {activeTab === 'tables' && <TableManagementPage />}
      </div>
    </PermissionGuard>
  );
}
