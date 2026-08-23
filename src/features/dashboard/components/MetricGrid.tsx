import { DollarSign, Percent, CalendarCheck, Sparkles } from 'lucide-react';
import { QuickStatCard } from './QuickStatCard';
import { formatPKR } from '@/lib/formatters';

export function MetricGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickStatCard
        title="Monthly Revenue"
        value={formatPKR(4850000)}
        trend="+14.2%"
        subtext="vs last month"
        isPositive={true}
        icon={DollarSign}
      />
      <QuickStatCard
        title="Occupancy Rate"
        value="84.5%"
        trend="+6.1%"
        subtext="42/50 rooms booked"
        isPositive={true}
        icon={Percent}
      />
      <QuickStatCard
        title="Active Bookings"
        value="38"
        subtext="12 check-ins today"
        icon={CalendarCheck}
      />
      <QuickStatCard
        title="Cleaning Required"
        value="6 Rooms"
        trend="Pending"
        subtext="Housekeeping assigned"
        isPositive={false}
        icon={Sparkles}
      />
    </div>
  );
}
