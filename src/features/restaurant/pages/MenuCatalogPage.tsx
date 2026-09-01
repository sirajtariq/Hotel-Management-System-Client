import { useState, useEffect } from 'react';
import { useRestaurantMenu } from '../hooks/useRestaurantMenu';
import { restaurantService, MenuItem } from '../services/restaurantService';
import { BookOpen, Plus, Search, Layers, ToggleLeft, ToggleRight, Trash2, Edit, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { TablePagination } from '@/components/ui/TablePagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface MenuCatalogPageProps {
  hideHeader?: boolean;
}

export function MenuCatalogPage({ hideHeader = false }: MenuCatalogPageProps) {
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const { categories, menuItems, totalCount, loading, togglingId, searchQuery, setSearchQuery, fetchCategories, fetchMenuItems, toggleAvailability } =
    useRestaurantMenu(selectedCatId || undefined, currentPage, pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCatId]);
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catOrder, setCatOrder] = useState<number>(0);

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState<string>('');
  const [itemCatId, setItemCatId] = useState<number>(0);
  const [itemDesc, setItemDesc] = useState<string>('');
  const [itemBasePrice, setItemBasePrice] = useState<number>(0);
  const [itemVariations, setItemVariations] = useState<Array<{ name: string; price: number }>>([]);

  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemName('');
    setItemCatId(categories[0]?.id || 0);
    setItemDesc('');
    setItemBasePrice(0);
    setItemVariations([]);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCatId(typeof item.category === 'object' ? item.category?.id || 0 : item.category);
    setItemDesc(item.description || '');
    setItemBasePrice(Number(item.basePrice ?? item.base_price ?? item.price ?? 0));
    setItemVariations(
      item.variations?.map((v) => ({ name: v.name, price: Number(v.price) })) || []
    );
    setIsItemModalOpen(true);
  };

  const handleAddVariationRow = () => {
    setItemVariations((prev) => [...prev, { name: '', price: 0 }]);
  };

  const handleRemoveVariationRow = (idx: number) => {
    setItemVariations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      toast.error('Category name is required.');
      return;
    }
    try {
      await restaurantService.createCategory({ name: catName, display_order: catOrder });
      toast.success('Category created.');
      setCatName('');
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create category.');
    }
  };

  const handleSaveItem = async () => {
    if (!itemName.trim() || !itemCatId) {
      toast.error('Name and Category are required.');
      return;
    }

    const payload: Partial<MenuItem> = {
      category: itemCatId,
      name: itemName,
      description: itemDesc,
      base_price: itemBasePrice,
      has_variations: itemVariations.length > 0,
      variations: itemVariations.map((v) => ({ name: v.name, price: v.price, is_available: true })),
    };

    try {
      if (editingItem) {
        await restaurantService.updateMenuItem(editingItem.id, payload);
        toast.success('Menu item updated.');
      } else {
        await restaurantService.createMenuItem(payload);
        toast.success('Menu item created.');
      }
      setIsItemModalOpen(false);
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save menu item.');
    }
  };

  const handleDeleteItem = (id: number) => {
    setDeleteItemId(id);
  };

  const confirmDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await restaurantService.deleteMenuItem(deleteItemId);
      toast.success('Menu item deleted.');
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete menu item.');
    } finally {
      setDeleteItemId(null);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Header (Rendered only when hideHeader is false) */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Food Menu & Variations Manager</h1>
              <p className="text-xs text-slate-500 font-normal">
                Configure food items, dynamic portion sizes, base prices, and live availability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
            <button
              type="button"
              onClick={handleOpenCreateItem}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Food Item
            </button>
          </div>
        </div>
      )}

      {/* Filter, Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCatId(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === null ? 'bg-indigo-900 text-white shadow-2xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCatId === c.id ? 'bg-indigo-900 text-white shadow-2xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search food catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
            />
          </div>

          {hideHeader && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Category</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateItem}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>+ Food Item</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <th className="p-4">Item & Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Variations</th>
              <th className="p-4">Live Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {menuItems.map((item) => {
              const price = Number(item.basePrice ?? item.base_price ?? item.price ?? 0);
              const formattedPrice = `PKR ${isNaN(price) ? '0' : price.toLocaleString()}`;

              const categoryName = typeof item.category === 'object' && item.category?.name
                ? item.category.name
                : item.category_name ?? item.categoryName ?? 'Uncategorized';

              const isAvailable = item.isAvailable ?? item.is_available ?? item.isActive ?? item.is_active ?? true;

              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    {item.name}
                    {item.description && <p className="text-[11px] font-normal text-slate-500 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="p-4 font-medium text-slate-600">{categoryName}</td>
                  <td className="p-4 font-bold text-slate-900 font-mono text-sm">{formattedPrice}</td>
                  <td className="p-4">
                    {item.variations && item.variations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.variations.map((v) => {
                          const vPrice = Number(v.price ?? 0);
                          return (
                            <span key={v.id || v.name} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-semibold text-[10px]">
                              {v.name}: PKR {isNaN(vPrice) ? '0' : vPrice.toLocaleString()}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      disabled={togglingId === item.id}
                      onClick={() => toggleAvailability(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                      }`}
                      title={togglingId === item.id ? 'Updating status...' : isAvailable ? 'Mark as Unavailable' : 'Mark as Available'}
                    >
                      {togglingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                      ) : isAvailable ? (
                        <ToggleRight className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-slate-400" />
                      )}
                      <span>{togglingId === item.id ? 'Updating...' : isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditItem(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-900 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit Menu Item"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Menu Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalCount}
        />
      </div>

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Add Menu Category</h3>
              <button onClick={() => setIsCatModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Appetizers"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Display Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border text-xs"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsCatModalOpen(false)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold">Cancel</button>
              <button onClick={handleSaveCategory} className="px-4 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Food Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-sm">{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</h3>
              <button onClick={() => setIsItemModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Item Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zinger Burger"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, dietary info..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Base Price (PKR)</label>
                <input
                  type="number"
                  value={itemBasePrice}
                  onChange={(e) => setItemBasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border font-bold"
                />
              </div>

              {/* Variations Builder */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold uppercase text-slate-500 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> Portion Variations (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariationRow}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-semibold text-[10px]"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {itemVariations.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Variant (e.g. Single / Double)"
                        value={v.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItemVariations((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, name: val } : row))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Price (PKR)"
                        value={v.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setItemVariations((prev) =>
                            prev.map((row, idx) => (idx === i ? { ...row, price: val } : row))
                          );
                        }}
                        className="w-28 px-3 py-1.5 rounded-lg border text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariationRow(i)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setIsItemModalOpen(false)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-semibold">Save Food Item</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        onConfirm={confirmDeleteItem}
        title="Delete Menu Item"
        description="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmText="Delete Item"
        variant="danger"
      />
    </div>
  );
}
