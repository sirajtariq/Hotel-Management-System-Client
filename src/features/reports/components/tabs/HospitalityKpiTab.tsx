import React from 'react';
import { HospitalityKpiReportData } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';
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
import { Hotel, BarChart3, Activity, Clock, Layers } from 'lucide-react';

interface HospitalityKpiTabProps {
  data: HospitalityKpiReportData;
}

export function HospitalityKpiTab({ data }: HospitalityKpiTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
          <div className="text-2xl font-bold text-blue-900 mt-1 font-sans">{data.occupancy_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{data.occupied_room_nights} Room-Nights occupied</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Daily Rate (ADR)</span>
          <div className="text-2xl font-bold text-indigo-900 mt-1 font-sans">{formatPKR(data.adr)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Room Revenue per occupied room</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RevPAR</span>
          <div className="text-2xl font-bold text-purple-900 mt-1 font-sans">{formatPKR(data.revpar)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Revenue per available room</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Length of Stay (ALOS)</span>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">{data.alos} Nights</div>
          <div className="text-[11px] text-slate-500 mt-1">Average stay duration</div>
        </div>
      </div>

      {/* Trend Line Chart: Occupancy % vs RevPAR */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Occupancy Rate (%) vs RevPAR Performance Trajectory
          </h3>
        </div>

        <div className="h-[300px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.kpi_trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#3b82f6' }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#8b5cf6' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="occupancy_rate" name="Occupancy Rate (%)" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="revpar" name="RevPAR (PKR)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Type Performance Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Room Type Performance Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Room Type Category</th>
                <th className="p-3">Total Inventory</th>
                <th className="p-3">Nights Booked</th>
                <th className="p-3">Category Occupancy %</th>
                <th className="p-3 text-right">Revenue Generated (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.room_type_performance.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{item.room_type}</td>
                  <td className="p-3 text-slate-600">{item.total_units} Units</td>
                  <td className="p-3 text-slate-600">{item.nights_booked} Nights</td>
                  <td className="p-3 font-bold text-blue-900">{item.occupancy_rate}%</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatPKR(item.revenue_generated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
