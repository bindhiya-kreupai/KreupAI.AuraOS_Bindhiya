'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2, Save } from 'lucide-react';
import { CompensationSettingsService } from '../services';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

const TOGGLE_KEYS: { key: string; label: string }[] = [
  { key: 'enableMarketBenchmarking', label: 'Market Benchmarking' },
  { key: 'enableStockGrants', label: 'Stock Grants' },
  { key: 'enableLoans', label: 'Loans & Advances' },
  { key: 'enableIncrementCycles', label: 'Increment Cycles' },
  { key: 'enableBonusManagement', label: 'Bonus Management' },
  { key: 'enableArrearsProcessing', label: 'Arrears Processing' },
  { key: 'enableBudgetSimulation', label: 'Budget Simulation' },
  { key: 'enableTotalRewardsStatements', label: 'Total Rewards Statements' },
  { key: 'enablePayEquityAnalysis', label: 'Pay Equity Analysis' },
  { key: 'enableGradeBands', label: 'Grade Bands' },
  { key: 'requireApprovalForIncrements', label: 'Require Approval For Increments' },
];

export default function CompensationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await CompensationSettingsService.getSettings();
      setSettings((data as Record<string, any>) ?? {});
    } catch (err) {
      console.error('Error:', err);
      error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: string, value: any) => {
    setSettings((prev) => ({ ...(prev ?? {}), [key]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await CompensationSettingsService.updateSettings(settings as any);
      setSettings((updated as Record<string, any>) ?? settings);
      success('Settings saved');
    } catch (err) {
      console.error(err);
      error('Failed to save settings');
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

  const s = settings ?? {};

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-500" />
            Compensation Settings
          </h1>
          <p className="text-slate-500 text-sm">
            Configure module defaults, feature toggles, and approval rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Defaults */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-sm mb-4">Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Currency</span>
            <input
              value={s.currency ?? ''}
              onChange={(e) => setField('currency', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Default Pay Frequency</span>
            <select
              value={s.defaultPayFrequency ?? 'monthly'}
              onChange={(e) => setField('defaultPayFrequency', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="bi_weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Increment Review Month</span>
            <input
              type="number"
              min={1}
              max={12}
              value={s.incrementReviewMonth ?? 4}
              onChange={(e) => setField('incrementReviewMonth', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Default Increment %</span>
            <input
              type="number"
              step="0.5"
              value={s.defaultIncrementPercentage ?? 8}
              onChange={(e) => setField('defaultIncrementPercentage', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Max Increment %</span>
            <input
              type="number"
              step="0.5"
              value={s.maxIncrementPercentage ?? 25}
              onChange={(e) => setField('maxIncrementPercentage', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-500 font-medium">Increment Approval Levels</span>
            <input
              type="number"
              min={1}
              value={s.incrementApprovalLevels ?? 2}
              onChange={(e) => setField('incrementApprovalLevels', Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </label>
        </div>
      </div>

      {/* Feature toggles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-sm mb-4">Feature Toggles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TOGGLE_KEYS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-100 dark:border-slate-800"
            >
              <span className="text-sm font-medium">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(s[key])}
                onChange={(e) => setField(key, e.target.checked)}
                className="w-5 h-5 accent-indigo-600"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
