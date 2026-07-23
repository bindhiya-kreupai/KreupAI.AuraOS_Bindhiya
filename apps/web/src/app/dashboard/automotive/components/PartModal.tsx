import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Part } from '../types';

interface PartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: Partial<Part>) => Promise<void>;
  part?: Part | null;
}

export function PartModal({ isOpen, onClose, onSave, part }: PartModalProps) {
  const [formData, setFormData] = useState<Partial<Part>>({
    partNumber: '',
    partName: '',
    description: '',
    category: 'Engine',
    manufacturer: '',
    unitOfMeasure: 'each',
    cost: 0,
    retailPrice: 0,
    markup: 30,
    quantityOnHand: 0,
    minStockLevel: 5,
    maxStockLevel: 20,
    status: 'in_stock',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData(part);
    } else {
      setFormData({
        partNumber: '',
        partName: '',
        description: '',
        category: 'Engine',
        manufacturer: '',
        unitOfMeasure: 'each',
        cost: 0,
        retailPrice: 0,
        markup: 30,
        quantityOnHand: 0,
        minStockLevel: 5,
        maxStockLevel: 20,
        status: 'in_stock',
      });
    }
  }, [part, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {part ? 'Edit Part' : 'Add New Part'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Part Number
              </label>
              <input
                required
                type="text"
                value={formData.partNumber || ''}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Part Name
              </label>
              <input
                required
                type="text"
                value={formData.partName || ''}
                onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                required
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer
              </label>
              <input
                required
                type="text"
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.cost || 0}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Retail Price
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.retailPrice || 0}
                onChange={(e) =>
                  setFormData({ ...formData, retailPrice: parseFloat(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stock
              </label>
              <input
                required
                type="number"
                value={formData.quantityOnHand || 0}
                onChange={(e) =>
                  setFormData({ ...formData, quantityOnHand: parseInt(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'in_stock'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="on_order">On Order</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Stock Level
              </label>
              <input
                required
                type="number"
                value={formData.minStockLevel || 0}
                onChange={(e) =>
                  setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : part ? 'Save Changes' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
