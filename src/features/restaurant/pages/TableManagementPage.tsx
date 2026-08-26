import { useState } from 'react';
import { useDiningTables } from '../hooks/useDiningTables';
import { restaurantService } from '../services/restaurantService';
import { Grid3X3, Plus, Users, LayoutGrid, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/ToastProvider';

export function TableManagementPage() {
  const { tables, loading, refetchTables } = useDiningTables();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [floorSection, setFloorSection] = useState<string>('Ground Floor');

  const handleAddTable = async () => {
    if (!tableNumber.trim()) {
      toast.error('Table number is required.');
      return;
    }
    try {
      await restaurantService.createDiningTable({
        table_number: tableNumber.trim(),
        capacity,
        floor_or_section: floorSection.trim() || 'Ground Floor',
        status: 'AVAILABLE',
      });
      toast.success(`Table ${tableNumber} created.`);
      setTableNumber('');
      setIsModalOpen(false);
      refetchTables();
    } catch (err: any) {
      const errData = err.response?.data;
      let errMsg = 'Failed to create table.';
      if (errData?.errors) {
        errMsg = Object.entries(errData.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      } else if (errData?.detail || errData?.message) {
        errMsg = errData.detail || errData.message;
      }
      toast.error(errMsg);
    }
  };

  const handleDeleteTable = async (id: number, number: string) => {
    if (!confirm(`Are you sure you want to remove Table ${number}?`)) return;
    try {
      await restaurantService.deleteDiningTable(id);
      toast.success(`Table ${number} deleted.`);
      refetchTables();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete table.');
    }
  };

  const sections = Array.from(new Set(tables.map((t) => t.floor_or_section || 'Ground Floor')));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
            <Grid3X3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Dining Table Floor Grid</h1>
            <p className="text-xs text-slate-500 font-normal">
              Manage dining sections, seating capacities, and real-time live occupancy statuses
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Dining Table
        </button>
      </div>

      {/* Floor Sections & Cards Grid */}
      {tables.length === 0 && !loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Grid3X3 className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-xs font-semibold text-slate-700">No Dining Tables Configured</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Add Dining Table" to register tables for Dine-In POS.</p>
        </div>
      ) : (
        sections.map((section) => {
          const sectionTables = tables.filter((t) => (t.floor_or_section || 'Ground Floor') === section);
          return (
            <div key={section} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                {section} Section ({sectionTables.length} Tables)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sectionTables.map((tbl) => {
                  const isAvailable = tbl.status === 'AVAILABLE';
                  const isOccupied = tbl.status === 'OCCUPIED';

                  return (
                    <div
                      key={tbl.id}
                      className={cn(
                        'bg-white rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between h-32 relative overflow-hidden group',
                        isAvailable
                          ? 'border-emerald-200/80 hover:border-emerald-500 hover:shadow-sm'
                          : isOccupied
                          ? 'border-rose-200/80 hover:border-rose-400'
                          : 'border-amber-200/80 hover:border-amber-400'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Table</span>
                          <h3 className="text-lg font-bold text-slate-900">{tbl.table_number}</h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOccupied
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            {tbl.status}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteTable(tbl.id, tbl.table_number)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{tbl.capacity} Seats</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal">{tbl.floor_or_section}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Add Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add New Dining Table</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Table Number / Code</label>
                <input
                  type="text"
                  placeholder="e.g. T-05, Rooftop-2"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Floor / Section</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, Rooftop"
                  value={floorSection}
                  onChange={(e) => setFloorSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleAddTable} className="px-4 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-semibold">
                Save Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
