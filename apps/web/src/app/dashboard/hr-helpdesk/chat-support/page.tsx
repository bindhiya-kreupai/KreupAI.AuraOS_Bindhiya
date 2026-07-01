'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';
import { ChatApi, type ChatSessionDTO, type ChatMessageDTO } from '../services';

const POLL_INTERVAL_MS = 4000;

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mergeMessages(existing: ChatMessageDTO[], incoming: ChatMessageDTO[]): ChatMessageDTO[] {
  if (incoming.length === 0) {
    return existing;
  }
  const seen = new Set(existing.map((message) => message.id));
  const additions = incoming.filter((message) => !seen.has(message.id));
  if (additions.length === 0) {
    return existing;
  }
  return [...existing, ...additions].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export default function ChatSupportPage() {
  const [session, setSession] = useState<ChatSessionDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessageDTO[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial connect: load or create a session, then load its full message list.
  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      setLoading(true);
      setError(null);
      try {
        const sessions = await ChatApi.listSessions();
        let active: ChatSessionDTO | null = sessions[0] ?? null;
        if (!active) {
          active = await ChatApi.createSession('Live chat support');
        }
        if (!active) {
          throw new Error('no-session');
        }
        const initial = await ChatApi.listMessages(active.id);
        if (cancelled) {
          return;
        }
        setSession(active);
        setMessages(initial);
      } catch {
        if (!cancelled) {
          setError('Unable to connect to chat support. Please try again shortly.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
    };
  }, []);

  // Poll for new messages every POLL_INTERVAL_MS once a session is established.
  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const sessionId = session.id;
    let active = true;

    const poll = async () => {
      const current = messagesRef.current;
      const since = current.length > 0 ? current[current.length - 1].createdAt : undefined;
      try {
        const fresh = await ChatApi.listMessages(sessionId, since);
        if (active && fresh.length > 0) {
          setMessages((prev) => mergeMessages(prev, fresh));
        }
      } catch {
        // Transient polling failures are ignored; the next tick retries.
      }
    };

    const intervalId = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [session]);

  const handleSend = useCallback(async () => {
    const content = draft.trim();
    if (!session || content.length === 0 || sending) {
      return;
    }
    setSending(true);
    try {
      const sent = await ChatApi.sendMessage(session.id, content);
      setDraft('');
      if (sent) {
        setMessages((prev) => mergeMessages(prev, [sent]));
      }
    } catch {
      setError('Failed to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [draft, session, sending]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const subject = session?.subject ?? 'Live chat support';
  const canSend = !sending && draft.trim().length > 0 && Boolean(session);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-500" />
            Live Chat Support
          </h1>
          <p className="text-slate-500 text-sm">Connect instantly with an HR representative.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-w-4xl mx-auto w-full shadow-2xl">
        {/* Chat Header */}
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">HR Support</div>
              <div className="text-xs text-indigo-100 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                {subject}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Connecting to support…</span>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {!loading && !error && messages.length === 0 ? (
            <div className="flex justify-center text-xs text-slate-400 my-4">
              No messages yet. Say hello to start the conversation.
            </div>
          ) : null}

          {!loading &&
            messages.map((message) => {
              const isMine =
                message.senderType === 'requester' &&
                session != null &&
                message.senderId === session.requesterId;

              if (isMine) {
                return (
                  <div key={message.id} className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      You
                    </div>
                    <div className="max-w-[80%]">
                      <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm">
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <div className="mt-1 text-right text-[11px] text-slate-400">
                        {formatTimestamp(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm">
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <div className="mt-1 text-left text-[11px] text-slate-400">
                      {formatTimestamp(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !session}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!canSend}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
