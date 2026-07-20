'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Loader2, Save } from 'lucide-react';
import { HealthSafetySettingsService } from '../services';
import type { HealthSafetySettings } from '../services';

const DEFAULTS: HealthSafetySettings = {
  incidentReporting: {
    requirePhotos: false,
    autoNotifySupervisor: true,
    escalationThresholdHours: 24,
  },
  safetyTraining: {
    mandatoryRefreshMonths: 12,
    autoEnroll: true,
  },
  notifications: {
    incidentReported: true,
    trainingDue: true,
    checkupReminder: true,
  },
};

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative ${
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </label>
  );
}

export default function HealthSafetySettingsPage() {
  const [settings, setSettings] = useState<HealthSafetySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await HealthSafetySettingsService.getSettings();
      if (data) {
        setSettings({
          incidentReporting: { ...DEFAULTS.incidentReporting, ...data.incidentReporting },
          safetyTraining: { ...DEFAULTS.safetyTraining, ...data.safetyTraining },
          notifications: { ...DEFAULTS.notifications, ...data.notifications },
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await HealthSafetySettingsService.updateSettings(settings);
      setFeedback({ type: 'success', text: 'Settings saved.' });
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Health &amp; Safety Settings
          </h1>
          <p className="text-slate-500 text-sm">
            Configure incident, training, and notification policies.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {feedback && (
        <div
          className={`text-xs font-bold px-3 py-2 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-3">Incident Reporting</h3>
          <Toggle
            label="Require photo evidence"
            checked={settings.incidentReporting.requirePhotos}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                incidentReporting: { ...s.incidentReporting, requirePhotos: v },
              }))
            }
          />
          <Toggle
            label="Auto-notify supervisor"
            checked={settings.incidentReporting.autoNotifySupervisor}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                incidentReporting: { ...s.incidentReporting, autoNotifySupervisor: v },
              }))
            }
          />
          <div className="mt-3">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Escalation threshold (hours)
            </label>
            <input
              type="number"
              min={1}
              value={settings.incidentReporting.escalationThresholdHours}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  incidentReporting: {
                    ...s.incidentReporting,
                    escalationThresholdHours: Number(e.target.value),
                  },
                }))
              }
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-3">Safety Training</h3>
          <Toggle
            label="Auto-enroll new employees"
            checked={settings.safetyTraining.autoEnroll}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                safetyTraining: { ...s.safetyTraining, autoEnroll: v },
              }))
            }
          />
          <div className="mt-3">
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Mandatory refresh (months)
            </label>
            <input
              type="number"
              min={1}
              value={settings.safetyTraining.mandatoryRefreshMonths}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  safetyTraining: {
                    ...s.safetyTraining,
                    mandatoryRefreshMonths: Number(e.target.value),
                  },
                }))
              }
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-3">Notifications</h3>
          <Toggle
            label="Incident reported"
            checked={settings.notifications.incidentReported}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                notifications: { ...s.notifications, incidentReported: v },
              }))
            }
          />
          <Toggle
            label="Training due"
            checked={settings.notifications.trainingDue}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                notifications: { ...s.notifications, trainingDue: v },
              }))
            }
          />
          <Toggle
            label="Checkup reminder"
            checked={settings.notifications.checkupReminder}
            onChange={(v) =>
              setSettings((s) => ({
                ...s,
                notifications: { ...s.notifications, checkupReminder: v },
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
