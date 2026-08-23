import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const mockData = [
  { day: 'Mon', rate: 72 },
  { day: 'Tue', rate: 78 },
  { day: 'Wed', rate: 85 },
  { day: 'Thu', rate: 82 },
  { day: 'Fri', rate: 94 },
  { day: 'Sat', rate: 98 },
  { day: 'Sun', rate: 88 },
];

export function OccupancyMiniChart() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>7-Day Occupancy Trend</CardTitle>
          <p className="text-[11px] text-slate-500 mt-0.5">Daily occupancy percentage across properties</p>
        </div>
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Avg 85.3%
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#ffffff',
                fontSize: '12px',
                borderRadius: '6px',
              }}
              formatter={(val: number) => [`${val}%`, 'Occupancy']}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#0f172a"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#occupancyGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
