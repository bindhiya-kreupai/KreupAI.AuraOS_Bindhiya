'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Check, X, Loader2 } from 'lucide-react';
import { EnrollmentService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface EnrollmentRow {
  id?: string;
  learnerName?: string;
  learnerId?: string;
  courseName?: string;
  courseTitle?: string;
  enrolledDate?: string;
  progress?: number;
  status?: string;
}

export default function EnrollmentPage() {
  const toast = useToast();
  const [data, setData] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await EnrollmentService.getEnrollments();
      setData(result as EnrollmentRow[]);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      toast.error('Failed to load enrollments. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecision = async (row: EnrollmentRow, decision: 'approve' | 'reject') => {
    if (!row.id) return;
    try {
      setActioningId(row.id);
      if (decision === 'approve') {
        await EnrollmentService.approveEnrollment(row.id);
        toast.success('Enrollment approved.');
      } else {
        await EnrollmentService.rejectEnrollment(row.id);
        toast.success('Enrollment rejected.');
      }
      await loadData();
    } catch (err) {
      console.error('Error updating enrollment:', err);
      toast.error('Failed to update enrollment. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            Enrollment Management
          </h1>
          <p className="text-slate-500 text-sm">Approve and manage employee course enrollments.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <ClipboardList className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No enrollments found</p>
          <p className="text-sm">Enrollment requests will appear here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Enrolled Date</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((enrollment, i) => (
                <tr
                  key={enrollment.id || i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-bold">
                    {enrollment.learnerName || enrollment.learnerId}
                  </td>
                  <td className="px-6 py-4">{enrollment.courseName || enrollment.courseTitle}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {enrollment.enrolledDate
                      ? new Date(enrollment.enrolledDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono">
                    {enrollment.progress != null ? `${enrollment.progress}%` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        enrollment.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : enrollment.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-600'
                            : enrollment.status === 'withdrawn'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecision(enrollment, 'approve')}
                        disabled={actioningId === enrollment.id}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
                        title="Approve"
                      >
                        {actioningId === enrollment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(enrollment, 'reject')}
                        disabled={actioningId === enrollment.id}
                        className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
