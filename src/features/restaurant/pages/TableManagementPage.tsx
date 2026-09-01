import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiningTables } from '../hooks/useDiningTables';
import { DiningTable, restaurantService } from '../services/restaurantService';
import { formatPKR } from '@/lib/formatters';
import { Grid3X3, Plus, Users, LayoutGrid, Trash2, Pencil, ShoppingBag, X, Lock, Receipt, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/ToastProvider';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface TableManagementPageProps {
  hideHeader?: boolean;
}

export function TableManagementPage({ hideHeader = false }: TableManagementPageProps) {
  const navigate = useNavigate();
  const { tables, loading, refetchTables } = useDiningTables();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [floorSection, setFloorSection] = useState<string>('Ground Floor');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; number: string } | null>(null);

  const openAddModal = () => {
    setEditingTable(null);
    setTableNumber('');
    setCapacity(4);
    setFloorSection('Ground Floor');
    setIsModalOpen(true);
  };

  const openEditModal = (tbl: DiningTable) => {
    const tName = tbl.table_number ?? tbl.name ?? tbl.number ?? `Table #${tbl.id}`;
    setEditingTable(tbl);
    setTableNumber(tName);
    setCapacity(tbl.capacity || 4);
    setFloorSection(tbl.floor_or_section || 'Ground Floor');
    setIsModalOpen(true);
  };

  const handleSaveTable = async () => {
    if (!tableNumber.trim()) {
      toast.error('Table number / name is required.');
      return;
    }
    try {
      if (editingTable) {
        await restaurantService.updateDiningTable(editingTable.id, {
          table_number: tableNumber.trim(),
          capacity,
          floor_or_section: floorSection.trim() || 'Ground Floor',
        });
        toast.success(`Table ${tableNumber} updated.`);
      } else {
        await restaurantService.createDiningTable({
          table_number: tableNumber.trim(),
          capacity,
          floor_or_section: floorSection.trim() || 'Ground Floor',
          status: 'AVAILABLE',
        });
        toast.success(`Table ${tableNumber} created.`);
      }
      setIsModalOpen(false);
      refetchTables();
    } catch (err: any) {
      const errData = err.response?.data;
      let errMsg = editingTable ? 'Failed to update table.' : 'Failed to create table.';
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

  const handleDeleteTable = (id: number, number: string) => {
    setDeleteTarget({ id, number });
  };

  const confirmDeleteTable = async () => {
    if (!deleteTarget) return;
    try {
      await restaurantService.deleteDiningTable(deleteTarget.id);
      toast.success(`Table ${deleteTarget.number} deleted.`);
      refetchTables();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete table.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStartOrder = (table: DiningTable) => {
    const tName = table.table_number ?? table.name ?? table.number ?? String(table.id);
    navigate(`/restaurant/pos?tableId=${table.id}&tableName=${encodeURIComponent(tName)}`);
  };

  const sections = Array.from(new Set(tables.map((t) => t.floor_or_section || 'Ground Floor')));

  return (
    <div className="space-y-5 font-sans">
      {/* Top Header */}
      {!hideHeader ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
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
            onClick={openAddModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Dining Table
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Dining Floor Sections & Occupancy</h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Live view of all registered tables across hotel sections
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Dining Table</span>
          </button>
        </div>
      )}

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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sectionTables.map((tbl) => {
                  const tableName = tbl.table_number ?? tbl.name ?? tbl.number ?? `Table #${tbl.id}`;
                  const isAvailable = tbl.status === 'AVAILABLE';
                  const isOccupied = tbl.status === 'OCCUPIED';
                  const activeOrder = tbl.active_order;

                  return (
                    <div
                      key={tbl.id}
                      className={cn(
                        'bg-white rounded-2xl border p-3.5 shadow-xs transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group',
                        isAvailable
                          ? 'border-emerald-200/80 hover:border-emerald-500 hover:shadow-md'
                          : isOccupied
                          ? 'border-rose-200/80 hover:border-rose-400 bg-rose-50/20'
                          : 'border-amber-200/80 hover:border-amber-400'
                      )}
                    >
                      {/* Top Bar: Identifier & Status/Actions */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Table</span>
                          <h3 className="text-base font-bold text-gray-900 truncate" title={tableName}>
                            {tableName}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : isOccupied
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            )}
                          >
                            {tbl.status}
                          </span>

                          {/* Action Buttons */}
                          {isOccupied ? (
                            /* Protected Occupied Table: Disable / Hide Delete with Tooltip */
                            <button
                              type="button"
                              disabled
                              className="p-1 text-slate-300 cursor-not-allowed"
                              title="Active dining session in progress"
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            /* Available Table: Edit & Delete Actions */
                            <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openEditModal(tbl)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                title="Edit Table Details"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTable(tbl.id, tableName)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Delete Table"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body: Active Order Summary vs Capacity info */}
                      <div className="my-2 text-xs">
                        {isOccupied && activeOrder ? (
                          <div className="bg-rose-100/60 rounded-xl p-2 border border-rose-200/80 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-rose-950">
                              <span className="flex items-center gap-1 font-mono">
                                <Receipt className="h-3 w-3 text-rose-700" /> #{activeOrder.order_number || activeOrder.id}
                              </span>
                              <span className="font-mono text-rose-900 font-extrabold">
                                {formatPKR(parseFloat(String(activeOrder.grand_total || 0)))}
                              </span>
                            </div>
                            <div className="text-[10px] text-rose-800 font-medium truncate flex items-center gap-1">
                              <Utensils className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{activeOrder.customer_name || activeOrder.server_name || 'Guest'}</span>
                            </div>
                          </div>
                        ) : isOccupied ? (
                          <div className="bg-rose-50 rounded-xl p-2 border border-rose-100 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <Lock className="h-3 w-3 shrink-0" />
                            <span>Active Guest Session</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium py-1">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{tbl.capacity} Capacity Seats</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: + Start Order button for Available Tables */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium truncate">{tbl.floor_or_section}</span>

                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => handleStartOrder(tbl)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs"
                            title="Start New POS Order"
                          >
                            <ShoppingBag className="h-3 w-3" />
                            <span>+ Start Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Add / Edit Table Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingTable ? `Edit Table: ${tableNumber}` : 'Add New Dining Table'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Floor / Section</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, Rooftop"
                  value={floorSection}
                  onChange={(e) => setFloorSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={handleSaveTable} className="px-4 py-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold transition-colors">
                {editingTable ? 'Update Table' : 'Save Table'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteTable}
          title="Delete Dining Table"
          description={`Are you sure you want to remove Table ${deleteTarget.number}? This action cannot be undone.`}
          confirmText="Delete Table"
          variant="danger"
        />
      )}
    </div>
  );
}
