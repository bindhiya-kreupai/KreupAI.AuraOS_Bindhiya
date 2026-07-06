'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, UserPlus, Loader2, X } from 'lucide-react';
import { MentoringService } from '../services';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface MentorRef {
  id?: string;
  name?: string;
}

interface ProgramRow {
  id?: string;
  name?: string;
  programName?: string;
  status?: string;
  mentor?: MentorRef;
  mentorId?: string;
  mentorName?: string;
  meetingFrequency?: string;
}

interface RequestForm {
  mentorId: string;
  programName: string;
  description: string;
  meetingFrequency: string;
}

const EMPTY_REQUEST: RequestForm = {
  mentorId: '',
  programName: '',
  description: '',
  meetingFrequency: 'biweekly',
};

function mentorLabel(rel: ProgramRow): string {
  return rel.mentor?.name || rel.mentorName || rel.mentor?.id || rel.mentorId || 'Unassigned';
}

export default function MentoringPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const toast = useToast();
  const [data, setData] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RequestForm>(EMPTY_REQUEST);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await MentoringService.getMentoringPrograms(
        user?.employeeId ? { menteeId: user.employeeId } : undefined
      );
      setData(result as ProgramRow[]);
    } catch (err) {
      console.error('Error loading mentoring programs:', err);
      toast.error('Failed to load mentoring programs. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user?.employeeId]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  const activePrograms = data.filter((p) => p.status === 'active');
  const completedPrograms = data.filter(
    (p) => p.status === 'completed' || p.status === 'cancelled'
  );

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mentorId.trim()) {
      toast.error('Mentor ID is required.');
      return;
    }
    if (!user?.employeeId) {
      toast.error('You must be signed in to request a mentor.');
      return;
    }
    try {
      setSubmitting(true);
      await MentoringService.createMentoringProgram({
        mentorId: form.mentorId.trim(),
        menteeId: user.employeeId,
        name: form.programName.trim() || 'Mentorship Program',
        description: form.description.trim() || undefined,
        meetingFrequency: form.meetingFrequency,
      } as never);
      toast.success('Mentorship request submitted.');
      setForm(EMPTY_REQUEST);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error('Error requesting mentor:', err);
      toast.error('Failed to submit mentorship request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Mentorship Program
          </h1>
          <p className="text-slate-500 text-sm">Connect mentors and mentees for career growth.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          disabled={authLoading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Find a Mentor
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No mentoring programs found</p>
          <p className="text-sm">Find a mentor to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
          {activePrograms.map((rel, i) => (
            <div
              key={rel.id || i}
              className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="font-bold text-lg mb-1">{rel.programName || rel.name}</h3>
              <p className="text-indigo-200 text-sm mb-6">Mentor: {mentorLabel(rel)}</p>

              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm mb-4">
                <div className="text-xs font-bold uppercase text-indigo-200 mb-1">
                  Meeting Frequency
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <Calendar className="w-4 h-4" /> {rel.meetingFrequency || 'As needed'}
                </div>
              </div>
            </div>
          ))}

          {completedPrograms.map((rel, i) => (
            <div
              key={rel.id || i}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{rel.programName || rel.name}</h4>
                  <p className="text-sm text-slate-500">{mentorLabel(rel)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                  {rel.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Request a Mentor</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequest} className="space-y-3">
              <div>
                <label className="text-sm font-bold block mb-1">Mentor ID *</label>
                <input
                  type="text"
                  value={form.mentorId}
                  onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
                  required
                  placeholder="Employee ID of the mentor"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Program Name</label>
                <input
                  type="text"
                  value={form.programName}
                  onChange={(e) => setForm({ ...form, programName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">What do you want to work on?</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">Meeting Frequency</label>
                <select
                  value={form.meetingFrequency}
                  onChange={(e) => setForm({ ...form, meetingFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
