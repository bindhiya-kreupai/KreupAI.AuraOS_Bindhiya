'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Banknote, CheckCircle2, Clock, Settings } from 'lucide-react';

type PayoutMode = 'paid' | 'banked';

interface OTPolicy {
  calculationBase: string;
  minimumDuration: number;
  monthlyCap: number;
  normalMultiplier: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  payoutMode: PayoutMode;
}

const DEFAULT_POLICY: OTPolicy = {
  calculationBase: 'Gross Salary / 240',
  minimumDuration: 2,
  monthlyCap: 20,
  normalMultiplier: 1.25,
  weekendMultiplier: 1.5,
  holidayMultiplier: 2.0,
  payoutMode: 'paid',
};

const STORAGE_KEY = 'auraos.attendance.overtimePolicy.v1';

export default function OvertimeManagementPage() {
  const [policy, setPolicy] = useState<OTPolicy>(DEFAULT_POLICY);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPolicy({ ...DEFAULT_POLICY, ...parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = <K extends keyof OTPolicy>(field: K, value: OTPolicy[K]) => {
    setPolicy((p) => ({ ...p, [field]: value }));
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
      setStatus({ kind: 'success', text: 'Policy saved (browser-local).' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Could not save policy.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Banknote className="w-6 h-6 text-indigo-500" />
            Overtime Management
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Configure OT rates, thresholds, and payout policies.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/attendance/overtime"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Clock className="w-4 h-4" /> View Logs
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Settings className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Policy'}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm flex items-center gap-2 ${
            status.kind === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          {status.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* General Policy */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 border-b border-cloud dark:border-nebula-purple/20 pb-4">
            General Policy
          </h3>
          <div className="space-y-4">
            <Row label="OT Calculation Base" hint="Formula for hourly rate">
              <select
                value={policy.calculationBase}
                onChange={(e) => update('calculationBase', e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 font-bold"
              >
                <option>Gross Salary / 240</option>
                <option>Basic Salary / 240</option>
                <option>Flat Rate</option>
              </select>
            </Row>
            <Row label="Minimum OT Duration" hint="Min hours needed to qualify">
              <NumberInput
                value={policy.minimumDuration}
                onChange={(v) => update('minimumDuration', v)}
                step={1}
                suffix="Hours"
              />
            </Row>
            <Row label="Monthly Cap" hint="Max allowable OT per employee">
              <NumberInput
                value={policy.monthlyCap}
                onChange={(v) => update('monthlyCap', v)}
                step={1}
                suffix="Hours"
              />
            </Row>
          </div>
        </div>

        {/* Multipliers */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-6 border-b border-cloud dark:border-nebula-purple/20 pb-4">
            Rate Multipliers
          </h3>
          <div className="space-y-4">
            <Multiplier
              label="Normal Workday"
              value={policy.normalMultiplier}
              onChange={(v) => update('normalMultiplier', v)}
              step={0.25}
            />
            <Multiplier
              label="Weekly Off (Weekend)"
              value={policy.weekendMultiplier}
              onChange={(v) => update('weekendMultiplier', v)}
              step={0.25}
            />
            <Multiplier
              label="Public Holiday"
              value={policy.holidayMultiplier}
              onChange={(v) => update('holidayMultiplier', v)}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* Payout toggle */}
      <div className="bg-indigo-900 text-white rounded-xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 sm:px-10">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Payout Config</h3>
          <p className="text-indigo-200 max-w-lg">
            Define if overtime is paid out in the payroll cycle or banked as &quot;Comp-off&quot;
            leave credits.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-indigo-800 p-1.5 rounded-lg relative z-10">
          <button
            onClick={() => update('payoutMode', 'paid')}
            className={`px-6 py-2 font-bold rounded transition-colors ${
              policy.payoutMode === 'paid'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Paid Out
          </button>
          <button
            onClick={() => update('payoutMode', 'banked')}
            className={`px-6 py-2 font-bold rounded transition-colors ${
              policy.payoutMode === 'banked'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Banked (Comp-off)
          </button>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          OT policy is currently stored per-browser. Country-level OT rates already live on{' '}
          <code className="px-1 bg-amber-100 dark:bg-amber-900/40 rounded">LabourLawConfig</code>; a
          tenant-level <em>OvertimePolicy</em> table is the natural follow-up so this form persists
          for all users.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{label}</h4>
        {hint && <p className="text-xs text-silver-mist">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  step,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-right font-bold bg-transparent"
      />
      {suffix && <span className="text-sm font-bold text-slate-500">{suffix}</span>}
    </div>
  );
}

function Multiplier({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
      <span className="font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">x</span>
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-16 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-800"
        />
      </div>
    </div>
  );
}
