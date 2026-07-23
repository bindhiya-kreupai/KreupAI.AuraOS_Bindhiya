import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { HousingFacility } from '../types';

interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facility: Partial<HousingFacility>) => Promise<void>;
  facility?: HousingFacility | null;
}

export function FacilityModal({ isOpen, onClose, onSave, facility }: FacilityModalProps) {
  const [formData, setFormData] = useState<Partial<HousingFacility>>({
    facilityName: '',
    facilityType: 'dormitory',
    totalBeds: 10,
    address: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (facility) {
      setFormData(facility);
    } else {
      setFormData({
        facilityName: '',
        facilityType: 'dormitory',
        totalBeds: 10,
        address: '',
        status: 'active',
      });
    }
  }, [facility, isOpen]);

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
            {facility ? 'Edit Facility' : 'Add New Facility'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800 dark:text-slate-200">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Facility Name
            </label>
            <input
              required
              type="text"
              value={formData.facilityName || ''}
              onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <input
              required
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facility Type
              </label>
              <select
                value={formData.facilityType || 'dormitory'}
                onChange={(e) => setFormData({ ...formData, facilityType: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="dormitory">Dormitory</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="trailer">Trailer</option>
                <option value="barracks">Barracks</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Beds
              </label>
              <input
                required
                type="number"
                min="1"
                value={formData.totalBeds || 10}
                onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="condemned">Condemned</option>
            </select>
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
              {loading ? 'Saving...' : facility ? 'Save Changes' : 'Add Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
