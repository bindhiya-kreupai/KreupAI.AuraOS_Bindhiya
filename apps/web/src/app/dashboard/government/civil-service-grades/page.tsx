'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Landmark, TrendingUp, Users, FileText, PlusCircle, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full">
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading civil service grades</p>
    <p className="text-sm">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
    <p>No civil service grades found. Create one to get started.</p>
  </div>
);

export default function CivilServiceGradesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [employeeName, setEmployeeName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('GS-12');
  const [baseSalary, setBaseSalary] = useState('89033');
  const [position, setPosition] = useState('Program Analyst');

  const {
    data: grades,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['civilServiceGrades'],
    queryFn: async () => {
      const res = await fetch('/api/government/civil-service-grades');
      if (!res.ok) throw new Error('Failed to fetch civil service grades');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newGrade: any) => {
      const res = await fetch('/api/government/civil-service-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrade),
      });
      if (!res.ok) throw new Error('Failed to create civil service grade');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['civilServiceGrades'] });
      toast.success('Civil service grade created successfully!');
      setIsModalOpen(false);
      setEmployeeName('');
      setGradeLevel('GS-12');
      setBaseSalary('89033');
      setPosition('Program Analyst');
    },
    onError: () => {
      toast.error('Failed to create civil service grade');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/government/civil-service-grades/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete civil service grade');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['civilServiceGrades'] });
      toast.success('Civil service grade deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete civil service grade');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      employeeName,
      gradeLevel,
      baseSalary: parseFloat(baseSalary),
      position,
    });
  };

  // Calculate derived metrics
  const totalGrades = grades?.length || 0;

  // Group headcount by grade level dynamically
  const gradeStructure = React.useMemo(() => {
    if (!grades) return [];
    const structure = grades.reduce((acc: any, curr: any) => {
      const grade = curr.gradeLevel;
      if (!acc[grade]) acc[grade] = 0;
      acc[grade]++;
      return acc;
    }, {});

    return Object.entries(structure)
      .map(([grade, headcount]) => ({
        grade,
        headcount: headcount as number,
      }))
      .sort((a, b) => b.grade.localeCompare(a.grade));
  }, [grades]);

  const averageSalary =
    grades?.length > 0
      ? grades.reduce(
          (acc: number, curr: any) => acc + (curr.salaryInformation?.totalAnnualSalary || 0),
          0
        ) / grades.length
      : 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-500" />
            Civil Service Grades
          </h1>
          <p className="text-slate-500 text-sm">Manage pay scales and grade progression.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> New Grade Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col min-h-0">
          <h3 className="font-bold text-lg mb-4">Grade Structure Overview</h3>

          {isLoading && <Skeleton />}
          {error && <ErrorState message={(error as Error).message} />}
          {!isLoading && !error && gradeStructure.length === 0 && <EmptyState />}

          {!isLoading && !error && gradeStructure.length > 0 && (
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {gradeStructure.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold">
                      {item.grade}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
                      {item.headcount}
                    </div>
                    <div className="text-xs text-slate-400 uppercase font-bold">Staff</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Avg. Annual Salary</h3>
            </div>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              $
              {isLoading
                ? '...'
                : averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70 mb-4">
              Computed average across {totalGrades} active personnel records.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
            <h3 className="font-bold text-lg mb-4">Recent Records</h3>
            <div className="space-y-2">
              {!isLoading &&
                !error &&
                grades?.slice(0, 5).map((grade: any) => (
                  <div
                    key={grade.gradeId}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group"
                  >
                    <div>
                      <div className="font-bold text-sm">{grade.employeeName}</div>
                      <div className="text-xs text-slate-500">
                        {grade.position} • {grade.gradeLevel}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(grade.gradeId)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Civil Service Grade</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Employee Name
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Jennifer Martinez"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Program Analyst"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="GS-15">GS-15</option>
                    <option value="GS-14">GS-14</option>
                    <option value="GS-13">GS-13</option>
                    <option value="GS-12">GS-12</option>
                    <option value="GS-11">GS-11</option>
                    <option value="GS-10">GS-10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Base Salary ($)
                  </label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
