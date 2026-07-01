'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Activity,
  Eye,
  Dumbbell,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { BenefitPlanService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
  HEALTH_INSURANCE: { icon: HeartPulse, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' },
  DENTAL: { icon: Activity, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
  VISION: { icon: Eye, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  WELLNESS: { icon: Dumbbell, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  LIFE_INSURANCE: { icon: Shield, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  DISABILITY: { icon: Shield, color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  RETIREMENT: { icon: Shield, color: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' },
  FSA_HSA: { icon: Shield, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' },
};

const CATEGORY_OPTIONS = [
  'HEALTH_INSURANCE',
  'DENTAL',
  'VISION',
  'LIFE_INSURANCE',
  'DISABILITY',
  'RETIREMENT',
  'FSA_HSA',
  'WELLNESS',
  'EDUCATION',
  'TRANSPORTATION',
  'OTHER',
];

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ARCHIVED'];

interface BenefitFormState {
  planCode: string;
  planName: string;
  category: string;
  carrierName: string;
  description: string;
  employeePremium: string;
  employerPremium: string;
  effectiveFrom: string;
  status: string;
}

const EMPTY_FORM: BenefitFormState = {
  planCode: '',
  planName: '',
  category: 'HEALTH_INSURANCE',
  carrierName: '',
  description: '',
  employeePremium: '',
  employerPremium: '',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  status: 'DRAFT',
};

const toDateInput = (value: any): string => {
  if (!value) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

export default function BenefitTypesPage() {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BenefitFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const response = await BenefitPlanService.getPlans();
      const data = response?.data || response || [];
      setBenefits(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching benefits:', err);
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, effectiveFrom: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEditModal = (benefit: any) => {
    setEditingId(benefit.id);
    setForm({
      planCode: benefit.planCode || '',
      planName: benefit.planName || benefit.name || '',
      category: benefit.category || 'HEALTH_INSURANCE',
      carrierName: benefit.carrierName || benefit.provider || '',
      description: benefit.description || '',
      employeePremium: benefit.employeePremium != null ? String(benefit.employeePremium) : '',
      employerPremium: benefit.employerPremium != null ? String(benefit.employerPremium) : '',
      effectiveFrom: toDateInput(benefit.effectiveFrom),
      status: benefit.status || 'DRAFT',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleFieldChange = (field: keyof BenefitFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const basePayload: Record<string, any> = {
        planName: form.planName.trim(),
        category: form.category,
        carrierName: form.carrierName.trim(),
        description: form.description.trim() || undefined,
        employeePremium: form.employeePremium !== '' ? Number(form.employeePremium) : undefined,
        employerPremium: form.employerPremium !== '' ? Number(form.employerPremium) : undefined,
        effectiveFrom: new Date(form.effectiveFrom).toISOString(),
        status: form.status,
      };

      if (editingId) {
        const response = await BenefitPlanService.updatePlan(editingId, basePayload);
        if (response?.success) {
          success('Benefit plan updated successfully');
          closeModal();
          await fetchBenefits();
        } else {
          error('Failed to update benefit plan');
        }
      } else {
        const createPayload = { ...basePayload, planCode: form.planCode.trim() };
        const response = await BenefitPlanService.createPlan(createPayload as any);
        if (response?.success) {
          success('Benefit plan created successfully');
          closeModal();
          await fetchBenefits();
        } else {
          error('Failed to create benefit plan');
        }
      }
    } catch (err: any) {
      console.error('Error saving benefit plan:', err);
      error('An error occurred while saving the benefit plan');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    try {
      const response = await BenefitPlanService.deletePlan(deleteTarget.id);
      if (response?.success) {
        success('Benefit plan archived successfully');
        setDeleteTarget(null);
        await fetchBenefits();
      } else {
        error('Failed to archive benefit plan');
      }
    } catch (err: any) {
      console.error('Error deleting benefit plan:', err);
      error('An error occurred while archiving the benefit plan');
    } finally {
      setDeleting(false);
    }
  };

  const getName = (b: any) => b.name || b.planName || 'Unknown Plan';
  const getProvider = (b: any) => b.provider || b.carrierName || 'Unknown Provider';
  const getCategory = (b: any) => {
    const c = b.category || 'OTHER';
    return c.replace(/_/g, ' ').replace(/\b\w/g, (ch: string) => ch.toUpperCase());
  };
  const getCoverage = (b: any) => {
    if (b.coverageLimit) return b.coverageLimit;
    if (b.outOfPocketMax) return `$${b.outOfPocketMax.toLocaleString()} OOP Max`;
    return 'See plan details';
  };
  const getEmployeeCost = (b: any) => {
    if (b.employeeCost) return b.employeeCost;
    const cost = b.employeePremium || 0;
    return cost === 0 ? '$0' : `$${cost}/mo`;
  };
  const getIconConfig = (b: any) => {
    const cat = b.category || 'OTHER';
    return (
      CATEGORY_ICONS[cat] || {
        icon: Shield,
        color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/20',
      }
    );
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            Benefit Types
          </h1>
          <p className="text-slate-500 text-sm">
            Configure available benefit plans and categories.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <Plus className="w-4 h-4" /> Add New Benefit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pb-20">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
        ) : benefits.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Shield className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">
              No Benefit Plans Found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Add benefit plans to configure available options for employees.
            </p>
          </div>
        ) : (
          benefits.map((benefit) => {
            const iconConfig = getIconConfig(benefit);
            const IconComponent = iconConfig.icon;

            return (
              <div
                key={benefit.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconConfig.color}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(benefit)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(benefit)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1">{getName(benefit)}</h3>
                <p className="text-sm text-slate-500 mb-4">{getProvider(benefit)}</p>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-bold">{getCategory(benefit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Coverage</span>
                    <span className="font-bold text-emerald-600">{getCoverage(benefit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Employee Cost</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {getEmployeeCost(benefit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                {editingId ? 'Edit Benefit Plan' : 'Add New Benefit'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Plan Code</label>
                  <input
                    type="text"
                    required
                    value={form.planCode}
                    readOnly={Boolean(editingId)}
                    onChange={(e) => handleFieldChange('planCode', e.target.value)}
                    className={`${inputClass} ${editingId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="e.g. HLTH-001"
                  />
                </div>
                <div>
                  <label className={labelClass}>Plan Name</label>
                  <input
                    type="text"
                    required
                    value={form.planName}
                    onChange={(e) => handleFieldChange('planName', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Premium Health Plan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Carrier Name</label>
                  <input
                    type="text"
                    required
                    value={form.carrierName}
                    onChange={(e) => handleFieldChange('carrierName', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Aetna"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="Optional plan description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Employee Premium ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.employeePremium}
                    onChange={(e) => handleFieldChange('employeePremium', e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelClass}>Employer Premium ($/mo)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.employerPremium}
                    onChange={(e) => handleFieldChange('employerPremium', e.target.value)}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Effective From</label>
                  <input
                    type="date"
                    required
                    value={form.effectiveFrom}
                    onChange={(e) => handleFieldChange('effectiveFrom', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingId ? 'Save Changes' : 'Create Benefit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-900/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Archive Benefit Plan</h2>
                <p className="text-sm text-slate-500">
                  This action can be reversed by an administrator.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to archive{' '}
              <span className="font-bold">{getName(deleteTarget)}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Archive
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
