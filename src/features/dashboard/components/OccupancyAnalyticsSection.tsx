import React from 'react';
import { RoomTypeOccupancyItem, TimeSeriesPoint } from '@/types/dashboard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Building2, Percent, Layers } from 'lucide-react';
import { formatPKR } from '@/lib/formatters';

interface OccupancyAnalyticsSectionProps {
  roomTypeMatrix: RoomTypeOccupancyItem[];
  chartData: TimeSeriesPoint[];
  overallOccupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
}

export function OccupancyAnalyticsSection({
  roomTypeMatrix,
  chartData,
  overallOccupancyRate,
  totalRooms,
  occupiedRooms,
}: OccupancyAnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Overall Occupancy Rate
          </div>
          <div className="text-2xl font-black font-mono text-blue-900 mt-1">
            {overallOccupancyRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Based on active room inventory
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Currently Occupied Rooms
          </div>
          <div className="text-2xl font-black font-mono text-emerald-900 mt-1">
            {occupiedRooms} / {totalRooms}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalRooms - occupiedRooms} rooms available for check-in
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Room Type Configurations
          </div>
          <div className="text-2xl font-black font-mono text-indigo-900 mt-1">
            {roomTypeMatrix.length} Categories
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Categorized inventory distribution
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Type Utilization Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Room Type Utilization Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live room count, base pricing, and occupancy rate per category
            </p>
          </div>

          <div className="space-y-4">
            {roomTypeMatrix.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No room type categories found
              </div>
            ) : (
              roomTypeMatrix.map((item) => (
                <div key={item.room_type_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 font-bold">{item.room_type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-normal">
                        {formatPKR(item.base_price)}/nt
                      </span>
                      <span className="text-blue-900 font-bold font-mono">
                        {item.occupied_rooms} / {item.total_rooms} ({item.occupancy_rate}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.occupancy_rate >= 80
                          ? 'bg-emerald-500'
                          : item.occupancy_rate >= 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.occupancy_rate))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Occupancy Rate Trend Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Percent className="h-5 w-5 text-indigo-600" />
              Occupancy Rate (%) Time-Series
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily percentage occupancy trajectory over the period
            </p>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Occupancy Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="occupancy_rate" name="Occupancy Rate (%)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
