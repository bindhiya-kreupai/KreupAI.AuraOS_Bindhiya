'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FeedbackService } from '@/services/feedbackService';
import type { FeedbackItem } from '@/services/feedbackService';
import { Heart, Award, Trophy, Sparkles, Loader2, X, Send, Search } from 'lucide-react';

const companyValues = [
  'All',
  'Leadership',
  'Innovation',
  'Teamwork',
  'Excellence',
  'Integrity',
  'Customer First',
];

interface EmployeeOption {
  id: string;
  name: string;
  role: string;
}

export default function RecognitionWallPage() {
  const [selectedValue, setSelectedValue] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<FeedbackItem[]>([]);

  // Give-recognition form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [team, setTeam] = useState<EmployeeOption[]>([]);
  const [toId, setToId] = useState('');
  const [message, setMessage] = useState('');
  const [value, setValue] = useState('Excellence');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await FeedbackService.getFeedback({ category: 'praise' });
      setItems(data.filter((f) => f.category === 'praise'));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load recognitions');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Employee picker for the form.
  useEffect(() => {
    if (!showForm) return;
    let active = true;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: '25' });
        if (query.trim().length >= 2) params.set('search', query.trim());
        const res = await fetch(`/api/v1/employees?${params.toString()}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Failed to load employees');
        const json = await res.json();
        if (!active) return;
        const rows = (json?.data ?? []) as Array<{
          id: string;
          name?: string;
          role?: string | null;
          dept?: string | null;
        }>;
        setTeam(
          rows.map((r) => ({ id: r.id, name: r.name ?? 'Unknown', role: r.role ?? r.dept ?? '' }))
        );
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError' && active) setTeam([]);
      }
    }, 300);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(t);
    };
  }, [query, showForm]);

  const submit = useCallback(async () => {
    if (!toId || message.trim().length < 10) return;
    const recipient = team.find((t) => t.id === toId);
    setSaving(true);
    setError(null);
    try {
      await FeedbackService.createFeedback({
        category: 'praise',
        visibility: 'public',
        toId,
        toName: recipient?.name ?? '',
        message: message.trim(),
        tags: [value],
      });
      setShowForm(false);
      setToId('');
      setMessage('');
      setQuery('');
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send recognition');
    } finally {
      setSaving(false);
    }
  }, [toId, message, value, team, load]);

  const like = useCallback(
    async (id: string) => {
      // Optimistic; reconcile from server.
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          const existing = it.reactions.find((r) => r.type === '❤️');
          const reactions = existing
            ? it.reactions
                .map((r) =>
                  r.type === '❤️'
                    ? {
                        ...r,
                        count: r.hasReacted ? r.count - 1 : r.count + 1,
                        hasReacted: !r.hasReacted,
                      }
                    : r
                )
                .filter((r) => r.count > 0)
            : [...it.reactions, { type: '❤️' as const, count: 1, hasReacted: true }];
          return { ...it, reactions };
        })
      );
      try {
        const res = await FeedbackService.addReaction(id, '❤️');
        setItems((prev) =>
          prev.map((it) => {
            if (it.id !== id) return it;
            const others = it.reactions.filter((r) => r.type !== '❤️');
            return {
              ...it,
              reactions:
                res.count > 0
                  ? [
                      ...others,
                      { type: '❤️' as const, count: res.count, hasReacted: res.hasReacted },
                    ]
                  : others,
            };
          })
        );
      } catch {
        await load();
      }
    },
    [load]
  );

  const filtered =
    selectedValue === 'All' ? items : items.filter((it) => it.tags?.includes(selectedValue));

  const likesFor = (it: FeedbackItem) => it.reactions.find((r) => r.type === '❤️')?.count ?? 0;
  const likedByMe = (it: FeedbackItem) =>
    it.reactions.find((r) => r.type === '❤️')?.hasReacted ?? false;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Recognition Wall</h1>
          <p className="text-sm text-silver-mist mt-1">
            Celebrate achievements and appreciate your colleagues
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2.5 bg-celestial-indigo text-white rounded-lg font-medium text-sm hover:bg-celestial-indigo/90 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Give Recognition'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-coral-alert/30 bg-coral-alert/10 px-3 py-2 text-xs font-semibold text-coral-alert">
          {error}
        </div>
      )}

      {/* Give Recognition Form */}
      {showForm && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-silver-mist" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a colleague to recognize..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
            />
          </div>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          >
            <option value="">Select a colleague...</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.role ? ` — ${m.role}` : ''}
              </option>
            ))}
          </select>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo"
          >
            {companyValues
              .filter((v) => v !== 'All')
              .map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="What did they do that deserves recognition? (min 10 characters)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-deep-cosmos text-ink-black dark:text-pearl focus:outline-none focus:ring-1 focus:ring-celestial-indigo resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={!toId || message.trim().length < 10 || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-celestial-indigo text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
              {saving ? 'Sending...' : 'Send Recognition'}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Recognitions</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{items.length}</p>
          <p className="text-[10px] text-silver-mist">Across your organization</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Appreciations</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">
            {items.reduce((s, it) => s + likesFor(it), 0)}
          </p>
          <p className="text-[10px] text-silver-mist">Hearts given by peers</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Showing Value</p>
          <p className="text-2xl font-bold text-quantum-rose mt-1">{filtered.length}</p>
          <p className="text-[10px] text-silver-mist">{selectedValue}</p>
        </div>
      </div>

      {/* Value Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {companyValues.map((v) => (
          <button
            key={v}
            onClick={() => setSelectedValue(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              selectedValue === v
                ? 'bg-celestial-indigo text-white'
                : 'bg-slate-100 dark:bg-deep-cosmos text-silver-mist'
            }`}
          >
            {v === 'All' ? 'All Values' : v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Recognition Feed */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Sparkles className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-bold text-lg">No recognitions yet</p>
              <p className="text-sm mt-1">Be the first to recognize a colleague</p>
            </div>
          ) : (
            filtered.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-celestial-indigo/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-celestial-indigo" />
                  </div>
                  <div>
                    <p className="text-sm text-ink-black dark:text-pearl">
                      <span className="font-medium">
                        {rec.fromName || (rec.fromId === 'anon' ? 'Anonymous' : 'A colleague')}
                      </span>
                      <span className="text-silver-mist"> recognized </span>
                      <span className="font-medium">{rec.toName || 'a teammate'}</span>
                    </p>
                    <p className="text-[10px] text-silver-mist">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-ink-black dark:text-pearl mb-3 pl-12">{rec.message}</p>
                <div className="flex items-center justify-between pl-12">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(rec.tags ?? []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 bg-celestial-indigo/10 text-celestial-indigo rounded-full font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => like(rec.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      likedByMe(rec)
                        ? 'text-quantum-rose'
                        : 'text-silver-mist hover:text-quantum-rose'
                    }`}
                  >
                    <Heart
                      className="w-3.5 h-3.5"
                      fill={likedByMe(rec) ? 'currentColor' : 'none'}
                    />{' '}
                    {likesFor(rec)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sunset-amber" /> Most Appreciated
            </h3>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Trophy className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Leaderboard populates as recognitions grow</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  items.reduce<Record<string, number>>((acc, it) => {
                    const key = it.toName || it.toId;
                    acc[key] = (acc[key] || 0) + likesFor(it) + 1;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, score], idx) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold text-silver-mist">
                          {idx + 1}
                        </span>
                        <span className="text-ink-black dark:text-pearl truncate max-w-[140px]">
                          {name}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-celestial-indigo">{score}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
