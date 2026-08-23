import { useState } from 'react';
import { MenuItem, MenuItemVariation } from '../../services/restaurantService';
import { X, Check, MessageSquare } from 'lucide-react';

interface VariationModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, variation: MenuItemVariation | null, specialInstructions: string) => void;
}

export function VariationModal({ item, isOpen, onClose, onConfirm }: VariationModalProps) {
  const variations = item.variations || [];
  const [selectedVariation, setSelectedVariation] = useState<MenuItemVariation | null>(
    variations.length > 0 ? variations[0] : null
  );
  const [instructions, setInstructions] = useState<string>('');

  if (!isOpen) return null;

  const handleAdd = () => {
    onConfirm(item, selectedVariation, instructions);
    setInstructions('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
            <p className="text-xs text-slate-500">Select variant and special instructions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {variations.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Variation
            </label>
            <div className="grid grid-cols-1 gap-2">
              {variations.map((v) => {
                const isSelected = selectedVariation?.id === v.id;
                return (
                  <button
                    key={v.id || v.name}
                    type="button"
                    onClick={() => setSelectedVariation(v)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-900 bg-indigo-50/60 text-indigo-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{v.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        PKR {Number(v.price).toLocaleString()}
                      </span>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-indigo-900 text-white flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            <MessageSquare className="h-3.5 w-3.5" />
            Special Instructions / Kitchen Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Extra spicy, no onions, sauce on the side..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 shadow-md shadow-indigo-900/20 transition-all"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
