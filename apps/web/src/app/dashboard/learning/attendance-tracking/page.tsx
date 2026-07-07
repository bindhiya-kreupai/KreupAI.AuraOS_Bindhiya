'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, Loader2 } from 'lucide-react';
import { TrainingSessionService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface Attendee {
  id?: string;
  employeeId?: string;
  learnerName?: string;
  status?: string;
  attendanceStatus?: string;
  registeredAt?: string;
}

interface SessionRow {
  id?: string;
  title?: string;
  startDate?: string;
  instructor?: string;
  instructorName?: string;
  attendees?: Attendee[];
}

const STATUS_OPTIONS = ['present', 'absent', 'excused'];

export default function AttendanceTrackingPage() {
  const toast = useToast();
  const [data, setData] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busySession, setBusySession] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await TrainingSessionService.getTrainingSessions();
      setData(result as SessionRow[]);
    } catch (err) {
      console.error('Error loading sessions:', err);
      toast.error('Failed to load training sessions. Please try again.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(term) ||
        (s.instructor || s.instructorName || '').toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleStatusChange = async (session: SessionRow, attendee: Attendee, status: string) => {
    if (!session.id || !attendee.employeeId) return;
    try {
      await TrainingSessionService.markAttendance(session.id, attendee.employeeId, status);
      toast.success(`Attendance updated for ${attendee.learnerName || attendee.employeeId}.`);
      await loadData();
    } catch (err) {
      console.error('Error marking attendance:', err);
      toast.error('Failed to update attendance. Please try again.');
    }
  };

  const handleMarkAllPresent = async (session: SessionRow) => {
    if (!session.id || !(session.attendees && session.attendees.length)) {
      toast.warning('No attendees to mark for this session.');
      return;
    }
    try {
      setBusySession(session.id);
      const attendees = session.attendees
        .filter((a) => a.employeeId)
        .map((a) => ({ learnerId: a.employeeId as string, status: 'present' }));
      await TrainingSessionService.markAllAttendance(session.id, attendees);
      toast.success('All attendees marked present.');
      await loadData();
    } catch (err) {
      console.error('Error marking all present:', err);
      toast.error('Failed to mark all present. Please try again.');
    } finally {
      setBusySession(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Attendance Tracking
          </h1>
          <p className="text-slate-500 text-sm">
            Mark and verify attendance for training sessions.
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-bold">No training sessions found</p>
          <p className="text-sm">Sessions and their attendance will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto">
          {filtered.map((session, idx) => (
            <div
              key={session.id || idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg">
                    {session.title}{' '}
                    {session.startDate
                      ? `(${new Date(session.startDate).toLocaleDateString()})`
                      : ''}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Instructor: {session.instructor || session.instructorName || 'TBD'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAllPresent(session)}
                    disabled={busySession === session.id}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-60 text-sm flex items-center gap-2"
                  >
                    {busySession === session.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    Mark All Present
                  </button>
                </div>
              </div>

              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Attendee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(session.attendees || []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                        No attendees registered
                      </td>
                    </tr>
                  ) : (
                    (session.attendees || []).map((person, i) => (
                      <tr
                        key={person.id || i}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 font-bold">
                          {person.learnerName || person.employeeId}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-bold focus:ring-2 focus:ring-indigo-500 capitalize"
                            value={person.attendanceStatus || person.status || 'present'}
                            onChange={(e) => handleStatusChange(session, person, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="capitalize">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {person.registeredAt
                            ? new Date(person.registeredAt).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </div>
  );
}
