import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatPKR, STATUS_STYLE_MAP } from '@/lib/formatters';

const mockActivities = [
  {
    id: 'act_1',
    guest: 'Muhammad Ali',
    room: 'Suite 402',
    property: 'Pearl Continental',
    type: 'Check-In',
    amount: 120000,
    status: 'confirmed',
    time: '11:30 AM',
  },
  {
    id: 'act_2',
    guest: 'Sarah Khan',
    room: 'Apt 204',
    property: 'Grand Horizon',
    type: 'Check-Out',
    amount: 85000,
    status: 'checked_out',
    time: '01:00 PM',
  },
  {
    id: 'act_3',
    guest: 'Usman Malik',
    room: 'Deluxe 108',
    property: 'Pearl Continental',
    type: 'Check-In',
    amount: 45000,
    status: 'pending',
    time: '03:15 PM',
  },
];

export function TodayActivityTable() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Today's Arrival & Departure Schedule</CardTitle>
          <p className="text-[11px] text-slate-500 mt-0.5">Real-time room occupancy changes</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
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
            {mockActivities.map((act) => (
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
      </CardContent>
    </Card>
  );
}
