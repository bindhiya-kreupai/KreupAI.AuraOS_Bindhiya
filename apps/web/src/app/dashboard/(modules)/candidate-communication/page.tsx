'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import {
  CandidateCommunicationHub,
  MESSAGE_TEMPLATES,
} from '@/components/recruitment/CandidateCommunicationHub';
import type {
  CandidateThread,
  SendMessagePayload,
} from '@/components/recruitment/CandidateCommunicationHub';
import { APIClient } from '@/lib/api-client';

interface RawMessage {
  id: string;
  channel: string;
  direction: string;
  status: string;
  subject?: string;
  body: string;
  timestamp: string;
  sender: string;
  senderRole?: string;
}

interface RawThread {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  jobTitle: string;
  stage: string;
  isStarred: boolean;
  isArchived: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  lastChannel: string;
  messages: RawMessage[];
}

function normalizeThread(t: RawThread): CandidateThread {
  return {
    id: t.id,
    candidateId: t.candidateId,
    candidateName: t.candidateName,
    candidateEmail: t.candidateEmail,
    candidatePhone: t.candidatePhone,
    jobTitle: t.jobTitle,
    stage: t.stage,
    isStarred: t.isStarred,
    isArchived: t.isArchived,
    unreadCount: t.unreadCount,
    lastMessage: t.lastMessage,
    lastMessageTime: t.lastMessageTime,
    lastChannel: t.lastChannel === 'sms' ? 'sms' : 'email',
    messages: t.messages.map((m) => ({
      id: m.id,
      channel: m.channel === 'sms' ? 'sms' : 'email',
      direction: m.direction === 'inbound' ? 'inbound' : 'outbound',
      status: (['pending', 'sent', 'delivered', 'read', 'failed'].includes(m.status)
        ? m.status
        : 'sent') as CandidateThread['messages'][number]['status'],
      subject: m.subject,
      body: m.body,
      timestamp: m.timestamp,
      sender: m.sender,
      senderRole: m.senderRole,
    })),
  };
}

export default function CandidateCommunicationPage() {
  const [threads, setThreads] = useState<CandidateThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<{ data?: { threads?: RawThread[] } }>(
        '/v1/recruitment/messages'
      );
      setThreads((res.data?.threads ?? []).map(normalizeThread));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  const handleSendMessage = useCallback(
    async (payload: SendMessagePayload) => {
      await APIClient.post('/v1/recruitment/messages', {
        candidateId: payload.candidateId,
        channel: payload.channel,
        subject: payload.subject,
        body: payload.body,
      });
      await loadThreads();
    },
    [loadThreads]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            Candidate Communication Hub
          </p>
          <p className="text-[9px] text-silver-mist">
            Email threads, SMS messaging, and template-based outreach
          </p>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Communication Hub */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <CandidateCommunicationHub
          threads={threads}
          templates={MESSAGE_TEMPLATES}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
