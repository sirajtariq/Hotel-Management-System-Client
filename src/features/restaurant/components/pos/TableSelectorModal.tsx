import { DiningTable } from '../../services/restaurantService';
import { X, Users, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableSelectorModalProps {
  tables: DiningTable[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (table: DiningTable) => void;
}

export function TableSelectorModal({ tables, isOpen, onClose, onSelectTable }: TableSelectorModalProps) {
  if (!isOpen) return null;

  const sections = Array.from(new Set(tables.map((t) => t.floor_or_section || 'Ground Floor')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Dining Table</h2>
            <p className="text-xs text-slate-500">Pick an available table for Dine-In order</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-6 pr-1">
          {sections.map((section) => {
            const sectionTables = tables.filter((t) => (t.floor_or_section || 'Ground Floor') === section);
            return (
              <div key={section}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {section}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sectionTables.map((tbl) => {
                    const isAvailable = tbl.status === 'AVAILABLE';
                    const isOccupied = tbl.status === 'OCCUPIED';
                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => {
                          onSelectTable(tbl);
                          onClose();
                        }}
                        className={cn(
                          'p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 relative overflow-hidden group',
                          isAvailable
                            ? 'bg-emerald-50/50 border-emerald-200/80 hover:border-emerald-500 hover:shadow-md'
                            : isOccupied
                            ? 'bg-rose-50/50 border-rose-200/80 hover:border-rose-400'
                            : 'bg-amber-50/50 border-amber-200/80 hover:border-amber-400'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-base font-extrabold text-slate-900">Table {tbl.table_number}</span>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOccupied
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            {tbl.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{tbl.capacity} Seats</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
