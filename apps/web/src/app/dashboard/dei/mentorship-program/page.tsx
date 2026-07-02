'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, MessageSquare, Calendar, CheckCircle2, Users, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { getMentorship, requestMentorship, type MentorshipData } from '../dei-api';
import { useDeiToast, DeiModal, deiInputClass } from '../dei-ui';

export default function MentorshipProgramPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'find' | 'my'>('my');
  const [data, setData] = useState<MentorshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ mentorId: '', message: '' });
  const { notify, ToastViewport } = useDeiToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await getMentorship());
    } catch {
      notify('error', 'Failed to load mentorship programs.');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRequest = useCallback(async () => {
    if (!form.mentorId.trim()) {
      notify('error', 'Please enter a mentor ID.');
      return;
    }
    try {
      setSubmitting(true);
      await requestMentorship({ mentorId: form.mentorId.trim(), message: form.message.trim() });
      notify('success', 'Mentorship requested.');
      setModalOpen(false);
      setForm({ mentorId: '', message: '' });
      setActiveTab('my');
      await load();
    } catch {
      notify('error', 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  }, [form, notify, load]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const active = data?.activeMatches ?? [];
  const past = data?.pastMatches ?? [];

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {ToastViewport}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-500" />
            Mentorship Program
          </h1>
          <p className="text-slate-500 text-sm">
            Connect with career mentors and mentees across the organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              My Mentorships
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'find' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              History
            </button>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Request Mentor
          </button>
        </div>
      </div>

      {activeTab === 'my' ? (
        active.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">No Active Mentorships</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Request a mentor to start your mentorship journey.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Request Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {active.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <h3 className="font-bold text-lg">{m.name}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-1">
                  {m.menteeId === user?.userId ? 'You are the mentee' : 'You are the mentor'}
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Meeting frequency: {m.meetingFrequency || 'not set'} • Started{' '}
                  {new Date(m.startDate).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => notify('success', 'Opening message thread.')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button
                    onClick={() => notify('success', 'Reschedule request sent.')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4" /> Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : past.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
          No past mentorships yet.
        </div>
      ) : (
        <div className="space-y-3">
          {past.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex justify-between items-center"
            >
              <div>
                <h4 className="font-bold">{m.name}</h4>
                <p className="text-xs text-slate-400">
                  {new Date(m.startDate).toLocaleDateString()} –{' '}
                  {m.endDate ? new Date(m.endDate).toLocaleDateString() : 'ongoing'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 capitalize">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <DeiModal
        open={modalOpen}
        title="Request a Mentor"
        submitLabel="Send Request"
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRequest}
      >
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Mentor (employee ID)
          </label>
          <input
            className={deiInputClass}
            value={form.mentorId}
            onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
            placeholder="Employee ID of your preferred mentor"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-600 dark:text-slate-300">
            Message
          </label>
          <textarea
            className={deiInputClass}
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="What would you like to focus on?"
          />
        </div>
      </DeiModal>
    </div>
  );
}
