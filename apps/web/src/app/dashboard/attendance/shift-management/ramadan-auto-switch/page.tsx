'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Moon,
  CalendarDays,
  Globe2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Save,
  Calculator,
  Clock,
} from 'lucide-react';

type Country = 'AE' | 'SA' | 'BH' | 'QA' | 'OM' | 'KW';

const COUNTRY_NAMES: Record<Country, string> = {
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  BH: 'Bahrain',
  QA: 'Qatar',
  OM: 'Oman',
  KW: 'Kuwait',
};

type RamadanStatus = {
  isRamadan: boolean;
  daysRemaining: number;
  daysUntilNextRamadan: number;
};

type WorkingHoursConfig = {
  countryCode: Country;
  dailyHours: number;
  scheduleConfig?: {
    standardHoursPerDay?: number;
    standardHoursPerWeek?: number;
    ramadanHoursPerDay?: number | null;
    ramadanHoursPerWeek?: number | null;
  };
};

type Shift = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  workHours: number;
  isActive: boolean;
};

const MAPPING_STORAGE_KEY = 'auraos.shiftManagement.ramadanMapping.v1';
const ENABLED_STORAGE_KEY = 'auraos.shiftManagement.ramadanEnabled.v1';

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) return null;
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

// POST helper for the working-hours engine — returns .data or throws a bilingual message
async function postWorkingHours(body: Record<string, unknown>): Promise<any> {
  const res = await fetch('/api/compliance/working-hours', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    const msg = json?.error || json?.message || 'Calculation failed';
    const msgAr = json?.errorAr || json?.messageAr || '';
    throw new Error(msgAr ? `${msg} — ${msgAr}` : msg);
  }
  return json.data;
}

const whInputCls =
  'w-full px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';
const whBtnCls =
  'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60';

function WhCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-cloud dark:border-nebula-purple/40">
      <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-indigo-500" /> {title}
      </h4>
      {children}
    </div>
  );
}

// Daily working hours (country + date)
function DailyHoursCalc({ country }: { country: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postWorkingHours({
        action: 'calculateDailyHours',
        countryCode: country,
        date,
      });
      setResult(typeof data === 'number' ? data : (data?.dailyHours ?? data));
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WhCard title="Daily working hours">
      <form onSubmit={run} className="space-y-2">
        <label className="block text-xs text-silver-mist">Date (Ramadan-aware)</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={whInputCls}
        />
        <button type="submit" disabled={loading} className={whBtnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result !== null && (
        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{result}h</div>
          <div className="text-xs text-silver-mist">per working day</div>
        </div>
      )}
    </WhCard>
  );
}

// Overtime
function OvertimeCalc({ country }: { country: string }) {
  const [actual, setActual] = useState('10');
  const [shift, setShift] = useState('8');
  const [rate, setRate] = useState('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postWorkingHours({
        action: 'calculateOvertime',
        countryCode: country,
        actualHours: Number(actual),
        shiftHours: Number(shift),
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const otHours = result?.overtimeHours ?? result?.totalOvertimeHours ?? null;
  const otMultiplier = result?.rate ?? result?.multiplier ?? result?.overtimeRate ?? null;

  return (
    <WhCard title="Overtime">
      <form onSubmit={run} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-silver-mist">Actual hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className={whInputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-silver-mist">Shift hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className={whInputCls}
            />
          </div>
        </div>
        <label className="block text-xs text-silver-mist">Hourly rate (for amount)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={whInputCls}
        />
        <button type="submit" disabled={loading} className={whBtnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-1 text-sm">
          {otHours !== null && (
            <div className="text-slate-700 dark:text-slate-200">
              OT hours: <span className="font-bold">{otHours}</span>
            </div>
          )}
          {otMultiplier !== null && (
            <div className="text-slate-700 dark:text-slate-200">
              Rate: <span className="font-bold">{otMultiplier}×</span>
            </div>
          )}
          {otHours !== null && otMultiplier !== null && (
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
              {(Number(otHours) * Number(otMultiplier) * Number(rate)).toFixed(2)}{' '}
              <span className="text-xs font-normal text-silver-mist">OT pay</span>
            </div>
          )}
          {result?.amount !== undefined && (
            <div className="text-xs text-silver-mist">Engine amount: {result.amount}</div>
          )}
        </div>
      )}
    </WhCard>
  );
}

// Daily compliance validation
function ValidateDailyCalc({ country }: { country: string }) {
  const [hours, setHours] = useState('9');
  const [ot, setOt] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    maxDailyHours?: number;
    violations?: string[];
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postWorkingHours({
        action: 'validateDaily',
        countryCode: country,
        hoursWorked: Number(hours),
        overtimeHours: Number(ot),
      });
      setResult({
        isValid: !!(data.isCompliant ?? data.valid ?? data.isValid),
        maxDailyHours: data.maxDailyHours ?? data.maxHours ?? data.limit,
        violations: data.violations ?? (data.reason ? [data.reason] : undefined),
      });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WhCard title="Daily compliance">
      <form onSubmit={run} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-silver-mist">Hours worked</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={whInputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-silver-mist">Overtime hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={ot}
              onChange={(e) => setOt(e.target.value)}
              className={whInputCls}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className={whBtnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Validate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div
          className={`mt-3 p-3 rounded-lg ${result.isValid ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {result.isValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-300">Compliant</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 dark:text-red-400">Non-compliant</span>
              </>
            )}
          </div>
          {result.maxDailyHours !== undefined && (
            <div className="text-xs text-silver-mist mt-1">
              Max allowed: {result.maxDailyHours}h/day
            </div>
          )}
          {result.violations && result.violations.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs text-red-600 dark:text-red-400">
              {result.violations.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </WhCard>
  );
}

// Friday compensation
function FridayCompCalc({ country }: { country: string }) {
  const [hours, setHours] = useState('8');
  const [baseSalary, setBaseSalary] = useState('5000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const data = await postWorkingHours({
        action: 'fridayCompensation',
        countryCode: country,
        hoursWorked: Number(hours),
        baseSalary: Number(baseSalary),
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const comp = result?.compensation ?? result?.amount ?? result?.totalCompensation ?? null;

  return (
    <WhCard title="Friday compensation">
      <form onSubmit={run} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-silver-mist">Hours worked</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={whInputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-silver-mist">Monthly base salary</label>
            <input
              type="number"
              min="0"
              step="1"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className={whInputCls}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className={whBtnCls}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Calculator className="w-4 h-4" />
          )}
          Calculate
        </button>
      </form>
      {err && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{err}</p>}
      {result && (
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
          {comp !== null ? (
            <>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {Number(comp).toFixed(2)}
              </div>
              <div className="text-xs text-silver-mist">Friday compensation</div>
            </>
          ) : (
            <pre className="text-xs text-left text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </WhCard>
  );
}

export default function RamadanAutoSwitchPage() {
  const [country, setCountry] = useState<Country>('AE');
  const [status, setStatus] = useState<RamadanStatus | null>(null);
  const [config, setConfig] = useState<WorkingHoursConfig | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const [enabled, setEnabled] = useState(true);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/attendance/shift-management/ramadan-auto-switch');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.mapping) setMapping(json.data.mapping);
          if (json.data.enabled !== undefined) setEnabled(json.data.enabled);
        }
      } catch (err) {
        console.error('Failed to load Ramadan config:', err);
      }
    }
    loadConfig();
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [statusRes, configRes, shiftsRes] = await Promise.all([
      fetchJson<RamadanStatus>('/api/compliance/hijri-calendar?action=isRamadan'),
      fetchJson<WorkingHoursConfig>(`/api/compliance/working-hours?countryCode=${country}`),
      fetchJson<Shift[]>('/api/v1/shifts?limit=200'),
    ]);
    setStatus(statusRes);
    setConfig(configRes);
    setShifts(shiftsRes || []);
    setLoading(false);
  }, [country]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const regularShifts = useMemo(
    () => shifts.filter((s) => s.isActive && !/ramadan/i.test(s.name)),
    [shifts]
  );

  const ramadanShifts = useMemo(
    () => shifts.filter((s) => s.isActive && /ramadan/i.test(s.name)),
    [shifts]
  );

  const ramadanHoursPerDay = config?.scheduleConfig?.ramadanHoursPerDay ?? null;
  const standardHoursPerDay = config?.scheduleConfig?.standardHoursPerDay ?? null;

  const handleMappingChange = (regularId: string, ramadanId: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (ramadanId) next[regularId] = ramadanId;
      else delete next[regularId];
      return next;
    });
    setSavedAt(null);
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/attendance/shift-management/ramadan-auto-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          mapping,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedAt(Date.now());
      } else {
        alert(`Could not save: ${json.error || 'Server error'}`);
      }
    } catch (e: any) {
      alert(`Could not save: ${e?.message || 'storage unavailable'}`);
    }
  };

  return (
    <div className="space-y-4 pb-6 text-slate-900 dark:text-slate-100">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            href="/dashboard/attendance/shift-management"
            className="inline-flex items-center gap-1 text-sm text-silver-mist hover:text-indigo-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shift Management
          </Link>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-500" />
            Ramadan Auto-switch
          </h1>
          <p className="text-silver-mist dark:text-slate-400 text-sm mt-1 max-w-2xl">
            During Ramadan, GCC labour law requires reduced working hours. Map each regular shift to
            its Ramadan equivalent so the roster automatically uses the shorter shift while the
            Hijri month is active.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-silver-mist" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            className="px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-slate-900 dark:text-slate-100"
          >
            {(Object.keys(COUNTRY_NAMES) as Country[]).map((c) => (
              <option key={c} value={c}>
                {c} — {COUNTRY_NAMES[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusCard
          tone={status?.isRamadan ? 'active' : 'idle'}
          icon={<Moon className="h-7 w-7" />}
          label="Current Ramadan status"
          value={
            loading
              ? 'Loading…'
              : status?.isRamadan
                ? `In Ramadan — ${status.daysRemaining} days left`
                : status
                  ? `Not in Ramadan — next in ${status.daysUntilNextRamadan} days`
                  : 'Unknown'
          }
        />
        <StatusCard
          tone="info"
          icon={<CalendarDays className="h-7 w-7" />}
          label={`${country} standard hours`}
          value={
            loading
              ? 'Loading…'
              : standardHoursPerDay !== null
                ? `${standardHoursPerDay}h / day`
                : 'Not configured'
          }
        />
        <StatusCard
          tone="info"
          icon={<CalendarDays className="h-7 w-7" />}
          label={`${country} Ramadan hours`}
          value={
            loading
              ? 'Loading…'
              : ramadanHoursPerDay !== null
                ? `${ramadanHoursPerDay}h / day`
                : 'Not reduced'
          }
        />
      </div>

      {/* Toggle */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-ink-black dark:text-pearl">Auto-switch enabled</p>
          <p className="text-xs text-silver-mist dark:text-slate-400 mt-0.5">
            When on and Hijri calendar reports the month of Ramadan, roster generation prefers the
            mapped Ramadan shift over the regular one.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              setSavedAt(null);
            }}
            className="sr-only peer"
          />
          <span className="relative inline-block w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-indigo-600 transition-colors">
            <span
              className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                enabled ? 'translate-x-5' : ''
              }`}
            />
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {enabled ? 'On' : 'Off'}
          </span>
        </label>
      </div>

      {/* Mapping */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/40 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-semibold text-ink-black dark:text-pearl">Shift mapping</h2>
            <p className="text-xs text-silver-mist mt-0.5">
              Pair each regular shift with its Ramadan equivalent.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" /> Save mapping
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center text-silver-mist">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading shifts…
          </div>
        ) : regularShifts.length === 0 ? (
          <EmptyHint>
            No regular shifts found.{' '}
            <Link
              href="/dashboard/attendance/shift-management"
              className="text-indigo-500 hover:underline"
            >
              Create a shift first
            </Link>
            .
          </EmptyHint>
        ) : ramadanShifts.length === 0 ? (
          <EmptyHint>
            No Ramadan-tagged shifts found.{' '}
            <Link
              href="/dashboard/attendance/shift-management/shift-templates"
              className="text-indigo-500 hover:underline"
            >
              Create one from the &quot;Ramadan-reduced&quot; template
            </Link>{' '}
            (any shift whose name contains &quot;Ramadan&quot; is treated as a Ramadan shift).
          </EmptyHint>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-left text-xs font-semibold uppercase text-silver-mist dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">Regular shift</th>
                  <th className="px-4 py-2.5">Timing</th>
                  <th className="px-4 py-2.5">Hours</th>
                  <th className="px-4 py-2.5">Ramadan equivalent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/30">
                {regularShifts.map((shift) => {
                  const mapped = mapping[shift.id] || '';
                  return (
                    <tr key={shift.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {shift.name}
                        </div>
                        <div className="text-xs font-mono text-silver-mist dark:text-slate-400">
                          {shift.code}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {shift.startTime} – {shift.endTime}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {shift.workHours}h
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={mapped}
                          onChange={(e) => handleMappingChange(shift.id, e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-slate-900 dark:text-slate-100"
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-stellar-blue text-slate-900 dark:text-slate-100"
                          >
                            — not mapped —
                          </option>
                          {ramadanShifts.map((r) => (
                            <option
                              key={r.id}
                              value={r.id}
                              className="bg-white dark:bg-stellar-blue text-slate-900 dark:text-slate-100"
                            >
                              {r.name} ({r.workHours}h)
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Working Hours Validator */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
        <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/40">
          <h2 className="font-semibold text-ink-black dark:text-pearl flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Working Hours Validator
          </h2>
          <p className="text-xs text-silver-mist mt-0.5">
            Live checks against {country}&apos;s labour-law working-hours engine (Ramadan-aware).
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DailyHoursCalc country={country} />
          <OvertimeCalc country={country} />
          <ValidateDailyCalc country={country} />
          <FridayCompCalc country={country} />
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Configuration is persisted tenant-wide on the server. Roster generation reads these
          mappings and Ramadan-reduced hours from the compliance rules during the Holy Month of
          Ramadan.
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'active' | 'idle' | 'info';
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const toneClass =
    tone === 'active'
      ? 'from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-200'
      : tone === 'idle'
        ? 'from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/40 text-slate-700 dark:text-slate-200'
        : 'from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 text-indigo-700 dark:text-indigo-200';
  return (
    <div
      className={`bg-gradient-to-br ${toneClass} p-5 rounded-xl shadow-sm border border-white/40 dark:border-white/10`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-80">{label}</p>
          <p className="text-base font-bold mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 text-sm text-silver-mist flex items-start gap-2">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p>{children}</p>
    </div>
  );
}
