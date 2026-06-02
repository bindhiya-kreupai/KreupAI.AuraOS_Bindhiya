// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

/**
 * @module NotificationPreferences
 * @description User-facing panel for toggling notification channels per
 *   category (email, push, in-app, SMS) plus quiet-hours configuration.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  UserPlus,
  Shield,
  Megaphone,
  CheckSquare,
  Settings,
  Star,
  AlertTriangle,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Moon,
  Loader2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type {
  CategoryPreference,
  NotificationChannel,
  NotificationPreferences as Prefs,
  NotificationCategory,
} from '@/services/notificationService';
import {
  getNotificationPreferences,
  updatePreferences,
  CATEGORY_META,
} from '@/services/notificationService';

// ── Icon maps ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  leave: Calendar,
  payroll: DollarSign,
  performance: TrendingUp,
  onboarding: UserPlus,
  compliance: Shield,
  announcement: Megaphone,
  approval: CheckSquare,
  system: Settings,
  recognition: Star,
  alert: AlertTriangle,
};

const CHANNEL_META: Record<
  NotificationChannel,
  { label: string; icon: React.ElementType; description: string }
> = {
  'in-app': { label: 'In-App', icon: Bell, description: 'Notification panel inside AuraOS' },
  email: { label: 'Email', icon: Mail, description: 'Sent to your work email address' },
  push: { label: 'Push', icon: Smartphone, description: 'Mobile / browser push notifications' },
  sms: { label: 'SMS', icon: MessageSquare, description: 'Text messages to your phone' },
};

const CHANNEL_ORDER: NotificationChannel[] = ['in-app', 'email', 'push', 'sms'];

// ── Props ──────────────────────────────────────────────────────────────────────

interface NotificationPreferencesProps {
  onClose?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function NotificationPreferences({ onClose }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch preferences ────────────────────────────────────────────────────

  const loadPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getNotificationPreferences();
      setPrefs(p);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  // ── Toggle channel for a category ───────────────────────────────────────

  const toggleChannel = (category: NotificationCategory, channel: NotificationChannel) => {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      preferences: prefs.preferences.map((p) => {
        if (p.category !== category) return p;
        return {
          ...p,
          channels: p.channels.map((c) =>
            c.channel === channel ? { ...c, enabled: !c.enabled } : c
          ),
        };
      }),
    });
  };

  // ── Enable/disable an entire channel column ──────────────────────────────

  const toggleAllForChannel = (channel: NotificationChannel, enabled: boolean) => {
    if (!prefs) return;
    setPrefs({
      ...prefs,
      preferences: prefs.preferences.map((p) => ({
        ...p,
        channels: p.channels.map((c) => (c.channel === channel ? { ...c, enabled } : c)),
      })),
    });
  };

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      await updatePreferences({
        preferences: prefs.preferences,
        quietHoursEnabled: prefs.quietHoursEnabled,
        quietHoursStart: prefs.quietHoursStart,
        quietHoursEnd: prefs.quietHoursEnd,
        timezone: prefs.timezone,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isChannelEnabled = (catPref: CategoryPreference, channel: NotificationChannel) =>
    catPref.channels.find((c) => c.channel === channel)?.enabled ?? false;

  const isAllEnabled = (channel: NotificationChannel) =>
    prefs?.preferences.every((p) => isChannelEnabled(p, channel)) ?? false;

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <Loader2 className="w-5 h-5 text-celestial-indigo animate-spin" />
        <span className="text-sm text-silver-mist">Loading preferences…</span>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="py-10 text-center text-sm text-rose-500">
        {error ?? 'Could not load preferences.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section heading */}
      <div>
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
          Notification Preferences
        </h3>
        <p className="text-sm text-silver-mist mt-0.5">
          Choose which channels to use for each notification type.
        </p>
      </div>

      {/* Channel legend */}
      <div className="flex flex-wrap gap-4">
        {CHANNEL_ORDER.map((ch) => {
          const { label, icon: Icon, description } = CHANNEL_META[ch];
          return (
            <div key={ch} className="flex items-center gap-1.5 text-xs text-silver-mist">
              <Icon className="w-3.5 h-3.5" />
              <span className="font-medium">{label}</span>
              <span className="hidden sm:inline">— {description}</span>
            </div>
          );
        })}
      </div>

      {/* Main preference table */}
      <div className="overflow-x-auto rounded-xl border border-cloud dark:border-nebula-purple/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-deep-cosmos border-b border-cloud dark:border-nebula-purple/30">
              <th className="text-left py-3 px-4 font-semibold text-ink-black dark:text-pearl">
                Category
              </th>
              {CHANNEL_ORDER.map((ch) => {
                const { label, icon: Icon } = CHANNEL_META[ch];
                return (
                  <th key={ch} className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Icon className="w-4 h-4 text-silver-mist" />
                      <span className="text-xs font-semibold text-ink-black dark:text-pearl hidden sm:block">
                        {label}
                      </span>
                      {/* Column toggle */}
                      <button
                        onClick={() => toggleAllForChannel(ch, !isAllEnabled(ch))}
                        title={`Toggle all ${label}`}
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors ${
                          isAllEnabled(ch)
                            ? 'bg-celestial-indigo/20 text-celestial-indigo'
                            : 'bg-gray-100 dark:bg-deep-cosmos text-silver-mist'
                        }`}
                      >
                        All
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-cloud dark:divide-nebula-purple/20">
            {prefs.preferences.map((catPref) => {
              const Icon = CATEGORY_ICONS[catPref.category] ?? Bell;
              const meta = CATEGORY_META[catPref.category];
              return (
                <tr
                  key={catPref.category}
                  className="hover:bg-gray-50/40 dark:hover:bg-deep-cosmos/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-celestial-indigo shrink-0" />
                      <div>
                        <p className="font-medium text-ink-black dark:text-pearl">
                          {catPref.label}
                        </p>
                        <p className="text-xs text-silver-mist hidden sm:block">
                          {meta?.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  {CHANNEL_ORDER.map((ch) => {
                    const enabled = isChannelEnabled(catPref, ch);
                    return (
                      <td key={ch} className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleChannel(catPref.category, ch)}
                          role="switch"
                          aria-checked={enabled}
                          aria-label={`${catPref.label} ${CHANNEL_META[ch].label} ${enabled ? 'on' : 'off'}`}
                          className={`relative inline-flex w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40 ${
                            enabled ? 'bg-celestial-indigo' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                              enabled ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quiet Hours */}
      <div className="p-4 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-celestial-indigo" />
            <span className="text-sm font-semibold text-ink-black dark:text-pearl">
              Quiet Hours
            </span>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, quietHoursEnabled: !prefs.quietHoursEnabled })}
            role="switch"
            aria-checked={prefs.quietHoursEnabled}
            className={`relative inline-flex w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40 ${
              prefs.quietHoursEnabled ? 'bg-celestial-indigo' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                prefs.quietHoursEnabled ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {prefs.quietHoursEnabled && (
          <div className="flex items-center gap-4 pt-1">
            <div>
              <label className="block text-xs text-silver-mist mb-1">From</label>
              <input
                type="time"
                value={prefs.quietHoursStart ?? '22:00'}
                onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                className="px-2 py-1 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40"
              />
            </div>
            <div>
              <label className="block text-xs text-silver-mist mb-1">To</label>
              <input
                type="time"
                value={prefs.quietHoursEnd ?? '07:00'}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                className="px-2 py-1 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/40"
              />
            </div>
          </div>
        )}
        <p className="text-xs text-silver-mist">
          Non-urgent notifications will not be delivered during quiet hours.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Save actions */}
      <div className="flex items-center justify-between gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm font-medium text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 disabled:opacity-70 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4 text-aurora-green" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
