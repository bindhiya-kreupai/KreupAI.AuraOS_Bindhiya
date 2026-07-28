import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SalesPerson } from '../types';

interface SalesPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Partial<SalesPerson>) => Promise<void>;
  person?: SalesPerson | null;
}

export function SalesPersonModal({ isOpen, onClose, onSave, person }: SalesPersonModalProps) {
  const [formData, setFormData] = useState<Partial<SalesPerson>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'new_vehicles',
    status: 'active',
    yearlySalesTarget: 1000000,
    monthlySalesTarget: 100000,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData(person);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'new_vehicles',
        status: 'active',
        yearlySalesTarget: 1000000,
        monthlySalesTarget: 100000,
      });
    }
  }, [person, isOpen]);

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
            {person ? 'Edit Salesperson' : 'Add Salesperson'}
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
                First Name
              </label>
              <input
                required
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name
              </label>
              <input
                required
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                required
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone
              </label>
              <input
                required
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={formData.department || 'new_vehicles'}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="new_vehicles">New Vehicles</option>
                <option value="used_vehicles">Used Vehicles</option>
                <option value="service">Service</option>
                <option value="parts">Parts</option>
                <option value="finance">Finance</option>
              </select>
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
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Target
              </label>
              <input
                required
                type="number"
                value={formData.monthlySalesTarget || 0}
                onChange={(e) =>
                  setFormData({ ...formData, monthlySalesTarget: parseInt(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yearly Target
              </label>
              <input
                required
                type="number"
                value={formData.yearlySalesTarget || 0}
                onChange={(e) =>
                  setFormData({ ...formData, yearlySalesTarget: parseInt(e.target.value) })
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
              {loading ? 'Saving...' : person ? 'Save Changes' : 'Add Salesperson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
