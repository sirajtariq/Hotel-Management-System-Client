import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FinancialBreakdownItem } from '@/types/reports';
import { formatPKR } from '@/lib/formatters';

export function FinancialBreakdownTable({ items }: { items: FinancialBreakdownItem[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Line Item</TableHead>
            <TableHead>Ledger Type</TableHead>
            <TableHead>% Contribution</TableHead>
            <TableHead className="text-right">Total PKR Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-semibold text-slate-900">{item.category}</TableCell>
              <TableCell>
                {item.revenueOrExpense === 'revenue' ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Revenue</Badge>
                ) : (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200">Expense</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs font-mono text-slate-600">{item.percentage}%</TableCell>
              <TableCell className="text-right font-mono tabular-nums font-bold text-slate-900">
                {formatPKR(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
