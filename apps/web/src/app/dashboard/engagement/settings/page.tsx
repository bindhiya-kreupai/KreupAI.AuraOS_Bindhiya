'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Loader2, Save } from 'lucide-react';
import { EngagementSettingsService } from '../services';

const TOGGLES: { key: string; label: string; desc: string }[] = [
  { key: 'enablePulseSurveys', label: 'Pulse Surveys', desc: 'Allow launching pulse surveys.' },
  { key: 'enableEvents', label: 'Events', desc: 'Enable the events calendar and RSVPs.' },
  { key: 'enableSocialFeed', label: 'Social Feed', desc: 'Enable the company social feed.' },
  { key: 'enableInnovation', label: 'Innovation Box', desc: 'Allow idea submission and voting.' },
  { key: 'enableCSR', label: 'CSR Activities', desc: 'Enable volunteering and CSR programs.' },
  { key: 'enableRecognition', label: 'Recognition Wall', desc: 'Enable peer recognition.' },
  { key: 'enableNewsletter', label: 'Newsletter', desc: 'Enable company newsletters.' },
  { key: 'enableReferrals', label: 'Referral Program', desc: 'Enable employee referrals.' },
  { key: 'enableRewards', label: 'Rewards Catalog', desc: 'Enable points-based rewards.' },
  {
    key: 'surveyAnonymityDefault',
    label: 'Anonymous Surveys by Default',
    desc: 'New surveys are anonymous.',
  },
  { key: 'eventAutoApproval', label: 'Event Auto-Approval', desc: 'Auto-approve event RSVPs.' },
  {
    key: 'socialModerationEnabled',
    label: 'Social Moderation',
    desc: 'Require moderation for posts.',
  },
];

export default function EngagementSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await EngagementSettingsService.getSettings();
      setSettings((data as Record<string, any>) || {});
    } catch {
      setToast({ type: 'error', msg: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const toggle = (key: string) => {
    setSettings((s) => ({ ...(s || {}), [key]: !(s || {})[key] }));
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const updated = await EngagementSettingsService.updateSettings(settings);
      if (updated) setSettings(updated as Record<string, any>);
      showToast('success', 'Settings saved.');
    } catch {
      showToast('error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Engagement Settings
          </h1>
          <p className="text-slate-500 text-sm">Configure which engagement features are enabled.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1">
        {TOGGLES.map(({ key, label, desc }) => (
          <div
            key={key}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-bold text-sm">{label}</h3>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <button
              role="switch"
              aria-checked={Boolean(settings?.[key])}
              onClick={() => toggle(key)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                settings?.[key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings?.[key] ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
