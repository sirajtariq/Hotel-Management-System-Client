import React from 'react';
import { RestaurantReportData } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
import { UtensilsCrossed, Award, ShoppingCart } from 'lucide-react';

interface RestaurantReportTabProps {
  data: RestaurantReportData;
}

export function RestaurantReportTab({ data }: RestaurantReportTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* 3 Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total F&B Sales</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">{formatPKR(data.total_sales)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Dine-in, Takeaway & Room Service</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discounts Given</span>
          <div className="text-2xl font-bold text-amber-900 mt-1 font-sans">{formatPKR(data.total_discount)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Promos & concessions</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GST Tax Collected</span>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">{formatPKR(data.total_tax)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Food tax portion</div>
        </div>
      </div>

      {/* Order Type Split Grid */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            F&B Sales by Channel & Order Type
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.order_type_split.map((split, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500">{split.order_type}</span>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{formatPKR(split.amount)}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{split.count} Total Orders</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Best Sellers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Top 10 Best-Selling Menu Items
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Rank & Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Quantity Sold</th>
                <th className="p-3 text-right">Total Revenue (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.top_sellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    No restaurant order data logged for this period
                  </td>
                </tr>
              ) : (
                data.top_sellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">
                      <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded text-[10px] mr-2">
                        #{idx + 1}
                      </span>
                      {item.item_name}
                    </td>
                    <td className="p-3 text-slate-600">{item.category_name}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{item.quantity_sold} Units</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatPKR(item.total_revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
