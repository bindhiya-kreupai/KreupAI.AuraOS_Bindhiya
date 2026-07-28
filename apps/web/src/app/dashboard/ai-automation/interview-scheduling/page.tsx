// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Video } from 'lucide-react';
import { interviewScheduling } from '@/lib/services/ai-automation-client';

function formatSlot(slot: any) {
  const start = slot.start ? new Date(slot.start) : null;
  const time =
    slot.time ||
    (start
      ? start.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'TBD');
  const available = slot.available ?? (slot.conflicts ?? 0) === 0;
  return {
    ...slot,
    time,
    available,
    score: slot.score ?? 0,
    reason: slot.reason || (available ? 'Low conflict window' : 'Conflicts with reserved slot'),
  };
}

export default function InterviewSchedulingPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [candidateId, setCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await interviewScheduling.getSchedules();
      if (result.success) {
        const rawSlots = result.data?.suggestedSlots || [];
        setSlots(rawSlots.map(formatSlot));
        const firstProposal = (result.data?.proposals || result.data?.schedules || [])[0];
        if (firstProposal?.candidateId) setCandidateId(firstProposal.candidateId);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(error?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (slot: any) => {
    if (!candidateId.trim()) {
      setMessage('Enter a candidate ID before booking.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const result = await interviewScheduling.scheduleInterview({
        candidateId: candidateId.trim(),
        preferredStart: slot.start,
        duration: slot.duration || 60,
      });
      if (result.success) {
        setMessage('Proposal created — confirm before calendar write.');
        await fetchData();
      } else {
        setMessage(result.error || 'Failed to create proposal');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessage(error?.message || 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-500" />
            Smart Scheduler
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            AI-optimized interview slots. Proposals require human confirm before calendar write.
          </p>
        </div>
      </div>

      {message && <p className="text-sm text-indigo-600 dark:text-indigo-300">{message}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">
              Candidate ID
            </h3>
            <input
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="Paste real candidate UUID"
              className="w-full rounded-lg border border-cloud dark:border-nebula-purple/40 bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-xs text-silver-mist mt-2">
              No demo names — use a real Candidate id from recruitment.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">
              Format
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Video className="w-4 h-4 text-slate-400" /> Video conference (60 min default)
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">
            Recommended Slots
          </h2>

          {loading && <p className="text-sm text-silver-mist">Loading…</p>}
          {!loading && !slots.length && (
            <p className="text-sm text-silver-mist">No suggested slots returned.</p>
          )}

          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  slot.available
                    ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800'
                    : 'border-slate-100 bg-slate-50 opacity-60 dark:bg-slate-800/50 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      slot.available
                        ? 'bg-white text-emerald-600 dark:bg-emerald-900/30'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-ink-black dark:text-pearl">{slot.time}</div>
                    <div
                      className={`text-xs ${
                        slot.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {slot.available ? `AI Score: ${slot.score}/100` : 'Unavailable'}
                    </div>
                  </div>
                </div>

                {slot.available ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded dark:bg-emerald-900/30 dark:text-emerald-400">
                      {slot.reason}
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSchedule(slot)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50"
                    >
                      Propose
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic px-4">{slot.reason}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
