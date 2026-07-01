'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  Users,
  ArrowRight,
  Edit2,
  BarChart3,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { GradeService } from '../services';

export default function SalaryBandsPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGradeItem, setSelectedGradeItem] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [level, setLevel] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await GradeService.getGrades();
      setGrades(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGrade = grades[selectedIndex] || null;

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedGradeItem(null);
    setName('');
    setCode('');
    setLevel(1);
    setIsModalOpen(true);
  };

  const openEditModal = (grade: any) => {
    setModalMode('edit');
    setSelectedGradeItem(grade);
    setName(grade.gradeName || grade.name || '');
    setCode(grade.gradeCode || grade.code || '');
    setLevel(Number(grade.level) || 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      gradeName: name,
      name,
      gradeCode: code,
      code,
      level,
    };

    try {
      if (modalMode === 'create') {
        await GradeService.createGrade(payload);
      } else {
        await GradeService.updateGrade(selectedGradeItem.id, payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving grade:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this grade?')) {
      try {
        await GradeService.deleteGrade(id);
        setIsModalOpen(false);
        fetchData();
      } catch (err) {
        console.error('Error deleting grade:', err);
      }
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
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] relative text-slate-900 dark:text-slate-100">
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
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Grade
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Grade List */}
        <div className="lg:col-span-1 space-y-4">
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

        {/* Summary Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3 h-fit">
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
      </div>

      {/* Band Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-400" /> Band Penetration
          </h3>
          {selectedGrade && (
            <button
              onClick={() => openEditModal(selectedGrade)}
              className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:underline"
            >
              <Edit2 className="w-3 h-3" /> Edit Grade
            </button>
          )}
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
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-indigo-100 dark:bg-indigo-900/30 border-x border-dashed border-indigo-300"></div>
        </div>

        {/* Sub-bands Table */}
        <div className="mt-8">
          <h4 className="text-sm font-bold mb-4">Sub-Grades / Levels</h4>
          {grades.length === 0 ? (
            <p className="text-sm text-slate-400">No grade data available.</p>
          ) : (
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 pl-2 w-1/5">Grade</th>
                  <th className="pb-3 w-1/5">Code</th>
                  <th className="pb-3 w-1/5">Level</th>
                  <th className="pb-3 w-1/5">Employees</th>
                  <th className="pb-3 text-right pr-2 w-1/5">Type</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {grades.map((row: any, i: number) => (
                  <tr
                    key={row.id || i}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 pl-2 font-bold text-slate-700 dark:text-slate-300 w-1/5 truncate">
                      {row.gradeName || row.name}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 w-1/5 truncate">
                      {row.gradeCode || row.code}
                    </td>
                    <td className="py-3 font-bold text-indigo-600 w-1/5">{row.level}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 w-1/5">
                      {row.employeeCount ?? 0}
                    </td>
                    <td className="py-3 text-right pr-2 text-slate-400 font-mono text-xs w-1/5">
                      {row.gradeType || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {modalMode === 'create' ? 'Add Job Grade' : 'Edit Job Grade'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Grade Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Grade Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Grade Level</label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                {modalMode === 'edit' ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedGradeItem.id)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Grade
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
