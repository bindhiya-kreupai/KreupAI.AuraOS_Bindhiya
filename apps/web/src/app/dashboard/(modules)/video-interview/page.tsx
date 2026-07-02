'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Info } from 'lucide-react';
import { VideoInterviewRoom } from '@/components/recruitment/VideoInterviewRoom';
import type { InterviewContext } from '@/components/recruitment/VideoInterviewRoom';
import { APIClient } from '@/lib/api-client';

interface InterviewRecord {
  id: string;
  type?: string;
  status?: string;
  duration?: number;
  scheduledDate?: string;
  application?: {
    candidate?: { firstName?: string; lastName?: string };
    jobPosting?: { title?: string };
  };
}

export default function VideoInterviewPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState<'room' | 'recording'>('room');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(window.location.href);
      const idFromQuery = url.searchParams.get('id') ?? '';
      const res = await APIClient.get<{ data?: InterviewRecord[] }>('/v1/recruitment/interviews', {
        limit: 100,
      });
      const list = res.data ?? [];
      setInterviews(list);
      setSelectedId(idFromQuery || list[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selected = useMemo(
    () => interviews.find((i) => i.id === selectedId) ?? null,
    [interviews, selectedId]
  );

  const context: InterviewContext | null = useMemo(() => {
    if (!selected) return null;
    const cand = selected.application?.candidate;
    return {
      candidateName: `${cand?.firstName ?? ''} ${cand?.lastName ?? ''}`.trim() || 'Candidate',
      jobTitle: selected.application?.jobPosting?.title ?? 'Position',
      interviewType: selected.type ?? 'Interview',
      scheduledDuration: selected.duration ?? 60,
      interviewId: selected.id,
    };
  }, [selected]);

  const updateStatus = useCallback(
    async (status: string) => {
      if (!selectedId) return;
      try {
        await APIClient.put(`/v1/recruitment/interviews/${selectedId}`, { status });
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update interview');
      }
    },
    [selectedId, loadData]
  );

  const handleEndCall = useCallback(() => {
    void updateStatus('completed');
    setView('recording');
  }, [updateStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {error && (
        <div
          className="rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Interview selector */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-medium text-silver-mist">
          Interview
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="ml-2 rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-1.5 text-[12px] text-ink-black dark:text-pearl"
          >
            {interviews.length === 0 && <option value="">No scheduled interviews</option>}
            {interviews.map((i) => {
              const cand = i.application?.candidate;
              const name = `${cand?.firstName ?? ''} ${cand?.lastName ?? ''}`.trim() || 'Candidate';
              return (
                <option key={i.id} value={i.id}>
                  {name} — {i.type ?? 'Interview'} ({i.status ?? 'scheduled'})
                </option>
              );
            })}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('room')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            view === 'room'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30'
          }`}
        >
          Live Room
        </button>
        <button
          onClick={() => setView('recording')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            view === 'recording'
              ? 'bg-celestial-indigo text-white'
              : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30'
          }`}
        >
          Recording Playback
        </button>
      </div>

      {view === 'room' &&
        (context ? (
          <VideoInterviewRoom
            context={context}
            onEndCall={handleEndCall}
            onStartRecording={() => setIsRecording(true)}
            onStopRecording={() => setIsRecording(false)}
            isRecording={isRecording}
          />
        ) : (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center text-[12px] text-silver-mist">
            Select a scheduled interview to start the live room.
          </div>
        ))}

      {view === 'recording' && (
        <div className="flex items-start gap-2 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-6 text-[12px] text-silver-mist">
          <Info className="w-4 h-4 shrink-0 text-celestial-indigo mt-0.5" />
          <div>
            <p className="font-semibold text-ink-black dark:text-pearl">
              Recording playback not yet available
            </p>
            <p className="mt-1">
              This interview has no stored recording. Recording capture, transcription, and AI
              insights require a media recording service that is not yet connected. Live sessions
              and interview status updates are fully wired.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
