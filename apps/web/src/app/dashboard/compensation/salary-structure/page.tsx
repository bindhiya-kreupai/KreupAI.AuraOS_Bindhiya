'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, PieChart, Plus, Edit2, CheckCircle2, Loader2, Trash2, X } from 'lucide-react';
import { SalaryComponentService, SalaryStructureService } from '../services';
import SalaryStructureBuilder from '@/components/payroll/SalaryStructureBuilder';

export default function SalaryStructurePage() {
  const [structures, setStructures] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedComp, setSelectedComp] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'earning' | 'deduction'>('earning');
  const [calcType, setCalcType] = useState<any>('fixed');
  const [amount, setAmount] = useState<number>(0);
  const [isTaxable, setIsTaxable] = useState(true);
  const [isStatutory, setIsStatutory] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const [structData, compData] = await Promise.all([
        SalaryStructureService.getStructures(),
        SalaryComponentService.getComponents(),
      ]);
      setStructures(structData);
      setComponents(compData);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedComp(null);
    setName('');
    setCode('');
    setType('earning');
    setCalcType('fixed');
    setAmount(0);
    setIsTaxable(true);
    setIsStatutory(false);
    setIsModalOpen(true);
  };

  const openEditModal = (comp: any) => {
    setModalMode('edit');
    setSelectedComp(comp);
    setName(comp.componentName || comp.name || '');
    setCode(comp.componentCode || comp.code || '');
    setType(comp.type || comp.componentType || 'earning');
    setCalcType(comp.calculationType || 'fixed');
    setAmount(Number(comp.amount) || Number(comp.defaultValue) || 0);
    setIsTaxable(comp.isTaxable ?? true);
    setIsStatutory(comp.isStatutory ?? false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      componentName: name,
      componentCode: code,
      componentType: type,
      type,
      calculationType: calcType,
      amount,
      defaultValue: amount,
      isTaxable,
      isStatutory,
      isPartOfCTC: true,
      isActive: true,
      displayOrder: 1,
    };

    try {
      if (modalMode === 'create') {
        await SalaryComponentService.createComponent(payload);
      } else {
        await SalaryComponentService.updateComponent(selectedComp.id, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving component:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      try {
        await SalaryComponentService.deleteComponent(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting component:', err);
      }
    }
  };

  const handleSaved = async () => {
    setBuilderOpen(false);
    await fetchData();
  };

  const earnings = components.filter(
    (c: any) => c.type === 'earning' || c.componentType === 'earning'
  );
  const deductions = components.filter(
    (c: any) => c.type === 'deduction' || c.componentType === 'deduction'
  );

  // Calculate CTC from components
  const totalCTC = components.reduce(
    (sum: number, c: any) => sum + (Number(c.defaultValue) || Number(c.amount) || 0),
    0
  );
  const fixedPay = earnings.reduce(
    (sum: number, c: any) => sum + (Number(c.defaultValue) || Number(c.amount) || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-500" />
            Salary Structure Configuration
          </h1>
          <p className="text-slate-500 text-sm">
            Define components, formulas, and deduction rules.
          </p>
        </div>
        <button
onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Component
        </button>
        <button
          onClick={() => setBuilderOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Structure
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Components List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Earnings</h3>
            {earnings.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No earning components configured yet.</p>
            ) : (
              <div className="space-y-3">
                {earnings.map((comp: any, i: number) => (
                  <div
                    key={comp.id || i}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${comp.isActive !== false ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}
                      >
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {comp.componentName || comp.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                          <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {comp.calculationType}
                          </span>
                          <span>{comp.componentCode || comp.code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${comp.isTaxable ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}
                      >
                        {comp.isTaxable ? 'Taxable' : 'Exempt'}
                      </span>
                      <button
onClick={() => openEditModal(comp)}
                        className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
<button
                        onClick={() => handleDelete(comp.id)}
                        className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="font-bold text-lg mb-4 mt-8">Deductions</h3>
            {deductions.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No deduction components configured yet.</p>
            ) : (
              <div className="space-y-3">
                {deductions.map((comp: any, i: number) => (
                  <div
                    key={comp.id || i}
className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                        <MinusIcon />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {comp.componentName || comp.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                          <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {comp.isStatutory ? 'Statutory' : 'Custom'}
                          </span>
                          <span>{comp.calculationType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-rose-50 text-rose-700">
                        {comp.isStatutory ? 'Mandatory' : 'Optional'}
                      </span>
<button
                        onClick={() => openEditModal(comp)}
                        className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comp.id)}
                        className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-bold mb-6">Structure Preview</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center opacity-80">
                <span>Total CTC</span>
                <span className="font-bold text-lg">
                  ${totalCTC > 0 ? totalCTC.toLocaleString() : '--'}
                </span>
              </div>
              <div className="h-px bg-white/20"></div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Earnings ({earnings.length})</span>
                  <span>${fixedPay > 0 ? fixedPay.toLocaleString() : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions ({deductions.length})</span>
                  <span>--</span>
                </div>
                <div className="flex justify-between">
                  <span>Structures</span>
                  <span>{structures.length}</span>
                </div>
              </div>
              <div className="h-px bg-white/20 mt-4"></div>
              <div className="pt-2 text-indigo-100 text-xs">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                {components.length} components configured
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {modalMode === 'create' ? 'Add Salary Component' : 'Edit Salary Component'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Component Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Component Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                >
                  <option value="earning">Earning</option>
                  <option value="deduction">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Calculation Type
                </label>
                <select
                  value={calcType}
                  onChange={(e: any) => setCalcType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage_of_basic">Percentage of Basic</option>
                  <option value="percentage_of_gross">Percentage of Gross</option>
                  <option value="percentage_of_ctc">Percentage of CTC</option>
                  <option value="formula">Formula</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Default Value / Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTaxable}
                    onChange={(e) => setIsTaxable(e.target.checked)}
                  />
                  Taxable
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isStatutory}
                    onChange={(e) => setIsStatutory(e.target.checked)}
                  />
                  Statutory
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Structure Builder — modal overlay */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-7xl my-4 rounded-2xl bg-gray-50 shadow-2xl">
            <button
              onClick={() => setBuilderOpen(false)}
              aria-label="Close builder"
              className="absolute right-4 top-4 z-10 rounded-lg bg-white/80 p-2 text-slate-500 hover:bg-white hover:text-slate-800 shadow"
            >
              <X className="w-5 h-5" />
            </button>
            <SalaryStructureBuilder onSaved={handleSaved} />
          </div>
        </div>
      )}
    </div>
  );
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}
