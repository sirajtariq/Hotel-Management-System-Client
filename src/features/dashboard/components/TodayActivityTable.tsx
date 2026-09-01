import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatPKR, STATUS_STYLE_MAP } from '@/lib/formatters';

export interface ActivityItem {
  id: string;
  guest: string;
  room: string;
  property: string;
  type: string;
  amount: number;
  status: string;
  time: string;
}

interface TodayActivityTableProps {
  activities?: ActivityItem[];
}

export function TodayActivityTable({ activities = [] }: TodayActivityTableProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Today's Arrival & Departure Schedule</CardTitle>
          <p className="text-[11px] text-slate-500 mt-0.5">Real-time room occupancy changes</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            No scheduled activities for today
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room / Property</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((act) => (
                <TableRow key={act.id}>
                  <TableCell className="font-semibold text-slate-900">{act.guest}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">{act.room}</div>
                    <div className="text-[11px] text-slate-400">{act.property}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{act.type} ({act.time})</TableCell>
                  <TableCell className="font-mono tabular-nums font-medium text-slate-900">
                    {formatPKR(act.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLE_MAP[act.status] || 'bg-slate-100'}>
                      {act.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
