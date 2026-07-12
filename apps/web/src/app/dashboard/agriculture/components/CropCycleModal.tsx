import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { CropCycle, CropStage } from '../types';

interface CropCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cycle: Partial<CropCycle>) => Promise<void>;
  cycle?: CropCycle | null;
}

export function CropCycleModal({ isOpen, onClose, onSave, cycle }: CropCycleModalProps) {
  const [formData, setFormData] = useState<Partial<CropCycle>>({
    cropName: '',
    cropType: '',
    currentStage: 'planting',
    status: 'planting',
    totalAcreage: 10,
    expectedYield: 1000,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cycle) {
      setFormData(cycle);
    } else {
      setFormData({
        cropName: '',
        cropType: '',
        currentStage: 'planting',
        status: 'planting',
        totalAcreage: 10,
        expectedYield: 1000,
      });
    }
  }, [cycle, isOpen]);

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
            {cycle ? 'Edit Crop Cycle' : 'Add New Crop Cycle'}
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
                Crop Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Tomatoes"
                value={formData.cropName || ''}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Crop Type
              </label>
              <input
                required
                type="text"
                placeholder="e.g., Vegetable"
                value={formData.cropType || ''}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Acreage
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.totalAcreage || 10}
                onChange={(e) =>
                  setFormData({ ...formData, totalAcreage: parseInt(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Yield
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.expectedYield || 1000}
                onChange={(e) =>
                  setFormData({ ...formData, expectedYield: parseInt(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Stage
              </label>
              <select
                value={formData.currentStage || 'planning'}
                onChange={(e) =>
                  setFormData({ ...formData, currentStage: e.target.value as CropStage })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="planning">Planning</option>
                <option value="land_preparation">Land Preparation</option>
                <option value="planting">Planting</option>
                <option value="germination">Germination</option>
                <option value="vegetative_growth">Vegetative Growth</option>
                <option value="flowering">Flowering</option>
                <option value="fruit_development">Fruit Development</option>
                <option value="maturation">Maturation</option>
                <option value="harvesting">Harvesting</option>
                <option value="post_harvest">Post Harvest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'planning'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="planning">Planning</option>
                <option value="planting">Planting</option>
                <option value="growing">Growing</option>
                <option value="harvesting">Harvesting</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
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
              {loading ? 'Saving...' : cycle ? 'Save Changes' : 'Add Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
