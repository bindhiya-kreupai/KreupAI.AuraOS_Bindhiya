'use client';

import React, { useState, useEffect } from 'react';
import { Layers, TrendingUp, Users, ArrowRight, Edit2, BarChart3, Loader2, X } from 'lucide-react';
import { GradeService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface GradeForm {
  gradeCode: string;
  gradeName: string;
  level: string;
}

const EMPTY_FORM: GradeForm = {
  gradeCode: '',
  gradeName: '',
  level: '',
};

export default function SalaryBandsPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<GradeForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await GradeService.getGrades();
      setGrades(data);
    } catch (err: any) {
      console.error('Error:', err);
      error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const selectedGrade = grades[selectedIndex] || null;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModalMode('create');
  };

  const openEdit = () => {
    if (!selectedGrade) {
      error('Select a grade to edit first');
      return;
    }
    setForm({
      gradeCode: selectedGrade.gradeCode || selectedGrade.code || '',
      gradeName: selectedGrade.gradeName || selectedGrade.name || '',
      level: selectedGrade.level != null ? String(selectedGrade.level) : '',
    });
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gradeCode || !form.gradeName) {
      error('Grade code and grade name are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        gradeCode: form.gradeCode,
        gradeName: form.gradeName,
        level: Number(form.level) || 0,
      };
      if (modalMode === 'edit') {
        if (!selectedGrade?.id) {
          error('Selected grade has no id');
          return;
        }
        await GradeService.updateGrade(selectedGrade.id, payload as any);
        success('Grade updated');
      } else {
        await GradeService.createGrade(payload as any);
        success('Grade created');
      }
      closeModal();
      await fetchData();
    } catch (err) {
      console.error(err);
      error(modalMode === 'edit' ? 'Failed to update grade' : 'Failed to create grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            Salary Bands & Grades
          </h1>
          <p className="text-slate-500 text-sm">
            Define pay ranges, designations, and market positioning for each job grade.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          + Add New Grade
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 h-full min-h-0">
        {/* Grade List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="font-bold text-sm mb-4">Grade Hierarchy</h3>
            {grades.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No grades configured yet.</p>
            ) : (
              <div className="space-y-1">
                {grades.map((g: any, i: number) => (
                  <button
                    key={g.id || i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm font-bold flex items-center justify-between ${
                      i === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {g.gradeName || g.name} ({g.gradeCode || g.code})
                    <ArrowRight
                      className={`w-4 h-4 ${i === selectedIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Selected Grade</div>
              <div className="text-xl font-bold text-indigo-600">
                {selectedGrade ? selectedGrade.gradeName || selectedGrade.name : 'None selected'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {selectedGrade ? `Level ${selectedGrade.level}` : '--'}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">
                Pay Range (Annual)
              </div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {selectedGrade?.bands?.length > 0
                  ? `$${(selectedGrade.bands[0].minSalary / 1000).toFixed(0)}k - $${(selectedGrade.bands[0].maxSalary / 1000).toFixed(0)}k`
                  : 'Not configured'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {selectedGrade?.bands?.length > 0
                  ? `Midpoint: $${(selectedGrade.bands[0].midSalary / 1000).toFixed(0)}k`
                  : '--'}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Headcount</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {selectedGrade?.employeeCount ?? 0} Employees
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {selectedGrade ? selectedGrade.gradeType || '--' : '--'}
              </div>
            </div>
          </div>

          {/* Band Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" /> Band Penetration
              </h3>
              <button
                onClick={openEdit}
                className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline"
              >
                <Edit2 className="w-3 h-3" /> Edit Structure
              </button>
            </div>

            {/* Visual Range */}
            <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-xl mb-20 md:mb-12 mt-8 mx-4">
              {selectedGrade?.bands?.length > 0 ? (
                <>
                  <div className="absolute -top-6 left-0 text-xs font-bold text-slate-500">
                    ${(selectedGrade.bands[0].minSalary / 1000).toFixed(0)}k
                  </div>
                  <div className="absolute -top-6 right-0 text-xs font-bold text-slate-500">
                    ${(selectedGrade.bands[0].maxSalary / 1000).toFixed(0)}k
                  </div>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-500">
                    ${(selectedGrade.bands[0].midSalary / 1000).toFixed(0)}k (Mid)
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No band data configured
                </div>
              )}
              <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-indigo-100 dark:bg-indigo-900/30 border-x border-dashed border-indigo-300"></div>
            </div>

            {/* Sub-bands Table */}
            <div className="mt-8">
              <h4 className="text-sm font-bold mb-4">Sub-Grades / Levels</h4>
              {grades.length === 0 ? (
                <p className="text-sm text-slate-400">No grade data available.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3 pl-2">Grade</th>
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Level</th>
                      <th className="pb-3">Employees</th>
                      <th className="pb-3 text-right pr-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {grades.map((row: any, i: number) => (
                      <tr
                        key={row.id || i}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 pl-2 font-bold text-slate-700 dark:text-slate-300">
                          {row.gradeName || row.name}
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {row.gradeCode || row.code}
                        </td>
                        <td className="py-3 font-bold text-indigo-600">{row.level}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {row.employeeCount ?? 0}
                        </td>
                        <td className="py-3 text-right pr-2 text-slate-400 font-mono text-xs">
                          {row.gradeType || '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {modalMode === 'edit' ? 'Edit Grade' : 'Add New Grade'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Grade Code</span>
                <input
                  value={form.gradeCode}
                  onChange={(e) => setForm({ ...form, gradeCode: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-500 font-medium">Level</span>
                <input
                  type="number"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                />
              </label>
              <label className="text-sm col-span-2">
                <span className="text-slate-500 font-medium">Grade Name</span>
                <input
                  value={form.gradeName}
                  onChange={(e) => setForm({ ...form, gradeName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  required
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'edit' ? 'Save Changes' : 'Create Grade'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
