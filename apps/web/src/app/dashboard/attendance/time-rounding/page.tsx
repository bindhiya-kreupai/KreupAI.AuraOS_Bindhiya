'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Hourglass, Save, RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { TimeRoundingService } from '../services';

type Interval =
  | 'None (Exact Time)'
  | 'Nearest 5 Minutes'
  | 'Nearest 15 Minutes'
  | 'Nearest 30 Minutes';
type Direction = 'Normal Rounding' | 'Floor (Always Down)' | 'Ceiling (Always Up)';

const INTERVAL_TO_MINUTES: Record<Interval, number> = {
  'None (Exact Time)': 0,
  'Nearest 5 Minutes': 5,
  'Nearest 15 Minutes': 15,
  'Nearest 30 Minutes': 30,
};

const INTERVAL_FROM_NUMBER: Record<number, Interval> = {
  0: 'None (Exact Time)',
  5: 'Nearest 5 Minutes',
  15: 'Nearest 15 Minutes',
  30: 'Nearest 30 Minutes',
};

const DIRECTION_TO_API: Record<Direction, 'nearest' | 'down' | 'up'> = {
  'Normal Rounding': 'nearest',
  'Floor (Always Down)': 'down',
  'Ceiling (Always Up)': 'up',
};

const DIRECTION_FROM_API: Record<string, Direction> = {
  nearest: 'Normal Rounding',
  down: 'Floor (Always Down)',
  up: 'Ceiling (Always Up)',
};

const SAMPLE = {
  punchInMinutes: 9 * 60 + 7, // 09:07
  punchOutMinutes: 18 * 60 + 23, // 18:23
};

function roundMinutes(totalMinutes: number, interval: number, direction: Direction): number {
  if (interval <= 0) return totalMinutes;
  const ratio = totalMinutes / interval;
  let rounded: number;
  if (direction === 'Floor (Always Down)') rounded = Math.floor(ratio);
  else if (direction === 'Ceiling (Always Up)') rounded = Math.ceil(ratio);
  else rounded = Math.round(ratio);
  return rounded * interval;
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

export default function TimeRoundingPage() {
  const [interval, setInterval] = useState<Interval>('Nearest 15 Minutes');
  const [direction, setDirection] = useState<Direction>('Normal Rounding');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const preview = useMemo(() => {
    const intervalMins = INTERVAL_TO_MINUTES[interval];
    const roundedIn = roundMinutes(SAMPLE.punchInMinutes, intervalMins, direction);
    const roundedOut = roundMinutes(SAMPLE.punchOutMinutes, intervalMins, direction);
    return {
      punchIn: formatTime(SAMPLE.punchInMinutes),
      punchOut: formatTime(SAMPLE.punchOutMinutes),
      roundedIn: formatTime(roundedIn),
      roundedOut: formatTime(roundedOut),
      totalHours: Math.round(((roundedOut - roundedIn) / 60) * 100) / 100,
    };
  }, [interval, direction]);

  useEffect(() => {
    fetchRounding();
  }, []);

  const fetchRounding = async () => {
    setLoading(true);
    try {
      const result: any = await TimeRoundingService.getRoundingRules();
      if (result) {
        if (
          typeof result.roundingInterval === 'number' &&
          INTERVAL_FROM_NUMBER[result.roundingInterval]
        ) {
          setInterval(INTERVAL_FROM_NUMBER[result.roundingInterval]);
        }
        if (typeof result.roundingType === 'string' && DIRECTION_FROM_API[result.roundingType]) {
          setDirection(DIRECTION_FROM_API[result.roundingType]);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await TimeRoundingService.updateRoundingRules({
        roundingInterval: INTERVAL_TO_MINUTES[interval],
        roundingType: DIRECTION_TO_API[direction],
      } as any);
      setStatus({ kind: 'success', text: 'Rounding rules saved.' });
    } catch (error: any) {
      console.error('Error:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to save rules.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setInterval('Nearest 15 Minutes');
    setDirection('Normal Rounding');
    setStatus(null);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Hourglass className="w-6 h-6 text-indigo-500" />
            Time Rounding Rules
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Configure how the system calculates billable hours from raw punches.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={loading || saving}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Rules'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">
            Rounding Interval
          </h3>
          <div className="space-y-3">
            {(Object.keys(INTERVAL_TO_MINUTES) as Interval[]).map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <input
                  type="radio"
                  name="interval"
                  checked={interval === opt}
                  onChange={() => setInterval(opt)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {opt}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h3 className="font-bold text-lg text-ink-black dark:text-pearl mb-4">
            Rounding Direction
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Normal Rounding' as Direction, desc: '0-7 min ↓, 8-14 min ↑' },
              { label: 'Floor (Always Down)' as Direction, desc: '09:14 → 09:00' },
              { label: 'Ceiling (Always Up)' as Direction, desc: '09:01 → 09:15' },
            ].map((opt) => (
              <label
                key={opt.label}
                className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <input
                  type="radio"
                  name="direction"
                  checked={direction === opt.label}
                  onChange={() => setDirection(opt.label)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {opt.label}
                  </div>
                  <div className="text-xs text-silver-mist">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-4">
            Live Preview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Punch In</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">{preview.punchIn}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className="font-bold text-indigo-600 font-mono">{preview.roundedIn}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Punch Out</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400">{preview.punchOut}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className="font-bold text-indigo-600 font-mono">{preview.roundedOut}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-slate-700 dark:text-slate-200">Total Hours</span>
                <span className="text-emerald-500">{preview.totalHours} Hours</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 italic">
              * Live preview of &lsquo;{interval}&rsquo; and &lsquo;{direction}&rsquo;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
