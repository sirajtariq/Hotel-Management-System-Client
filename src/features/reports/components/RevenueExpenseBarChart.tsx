import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RevenueExpenseTrend } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';

export function RevenueExpenseBarChart({ data }: { data: RevenueExpenseTrend[] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="p-4">
        <CardTitle>Financial Performance (Revenue vs Expenses)</CardTitle>
        <p className="text-[11px] text-slate-500 mt-0.5">Comparative PKR ledger metrics per calendar month</p>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              formatter={(val: number) => [formatPKR(val), '']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#ffffff',
                fontSize: '12px',
                borderRadius: '6px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="revenue" name="Gross Revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Operating Expense" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
