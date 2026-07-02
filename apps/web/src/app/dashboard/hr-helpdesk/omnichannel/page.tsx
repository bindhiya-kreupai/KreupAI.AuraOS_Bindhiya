'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Share2, Mail, Phone, Slack, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { ChannelsApi, type ChannelDTO } from '../services';

type IconType = typeof Share2;

function iconForChannel(channelType: string): IconType {
  switch (channelType.toLowerCase()) {
    case 'email':
      return Mail;
    case 'slack':
      return Slack;
    case 'teams':
      return MessageCircle;
    case 'phone':
      return Phone;
    default:
      return Share2;
  }
}

interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export default function OmnichannelPage() {
  const [channels, setChannels] = useState<ChannelDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ChannelsApi.list();
      setChannels(data);
    } catch {
      setError('Failed to load channels. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleToggle = useCallback(
    async (channel: ChannelDTO) => {
      const connecting = channel.status !== 'CONNECTED';
      const nextStatus: ChannelDTO['status'] = connecting ? 'CONNECTED' : 'DISCONNECTED';
      setPendingId(channel.id);
      try {
        const updated = await ChannelsApi.update(channel.id, { status: nextStatus });
        if (!updated) {
          throw new Error('empty response');
        }
        setFeedback({
          type: 'success',
          message: connecting
            ? `${channel.name} connected successfully.`
            : `${channel.name} disconnected.`,
        });
        await loadChannels();
      } catch {
        setFeedback({
          type: 'error',
          message: `Failed to update ${channel.name}. Please try again.`,
        });
      } finally {
        setPendingId(null);
      }
    },
    [loadChannels]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" />
            Omnichannel Integration
          </h1>
          <p className="text-slate-500 text-sm">Manage support channels and integrations.</p>
        </div>
      </div>

      {feedback ? (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shrink-0 ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadChannels()}
            className="ml-auto font-bold underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Loading channels…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((channel) => {
            const Icon = iconForChannel(channel.channelType);
            const isConnected = channel.status === 'CONNECTED';
            const isPending = pendingId === channel.id;
            return (
              <div
                key={channel.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected
                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>
                <h3 className="font-bold text-lg">{channel.name}</h3>
                <p className="text-sm text-slate-500 mb-6">
                  {channel.config ?? channel.channelType}
                </p>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => void handleToggle(channel)}
                  className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border transition disabled:opacity-60 ${
                    isConnected
                      ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                  }`}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isConnected ? 'Disconnect' : 'Connect Now'}
                </button>
              </div>
            );
          })}

          {channels.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
              No channels available.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
