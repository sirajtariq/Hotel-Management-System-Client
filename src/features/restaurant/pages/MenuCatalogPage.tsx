import { useState, useEffect } from 'react';
import { useRestaurantMenu } from '../hooks/useRestaurantMenu';
import { restaurantService, MenuItem, Category, MenuItemVariation } from '../services/restaurantService';
import { RestaurantHeaderNav } from '../components/RestaurantHeaderNav';
import { BookOpen, Plus, Search, Layers, ToggleLeft, ToggleRight, Trash2, Edit, X } from 'lucide-react';
import { toast } from '@/components/ui/ToastProvider';
import { TablePagination } from '@/components/ui/TablePagination';

export function MenuCatalogPage() {
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const { categories, menuItems, loading, searchQuery, setSearchQuery, fetchCategories, fetchMenuItems, toggleAvailability } =
    useRestaurantMenu(selectedCatId || undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCatId, menuItems.length]);

  const paginatedMenuItems = menuItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
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
    setItemCatId(item.category);
    setItemDesc(item.description || '');
    setItemBasePrice(Number(item.base_price));
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

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await restaurantService.deleteMenuItem(id);
      toast.success('Menu item deleted.');
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete menu item.');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Restaurant Navigation Bar */}
      <RestaurantHeaderNav />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
          <button
            type="button"
            onClick={handleOpenCreateItem}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Food Item
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCatId(null)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCatId === null ? 'bg-indigo-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCatId === c.id ? 'bg-indigo-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="p-4">Item & Description</th>
              <th className="p-4">Category</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Variations</th>
              <th className="p-4">Live Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMenuItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 font-semibold text-slate-900">
                  {item.name}
                  {item.description && <p className="text-[11px] font-normal text-slate-500">{item.description}</p>}
                </td>
                <td className="p-4 font-normal text-slate-600">{item.category_name}</td>
                <td className="p-4 font-bold text-slate-900">PKR {Number(item.base_price).toLocaleString()}</td>
                <td className="p-4">
                  {item.variations && item.variations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.variations.map((v) => (
                        <span key={v.id || v.name} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-900 font-medium text-[10px]">
                          {v.name}: PKR {Number(v.price).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] uppercase transition-all ${
                      item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.is_available ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    <span>{item.is_available ? 'Available' : 'Disabled'}</span>
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-900 hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={menuItems.length}
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
    </div>
  );
}
