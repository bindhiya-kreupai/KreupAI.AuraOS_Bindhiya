'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  LayoutTemplate,
  Loader2,
  Moon,
  Sun,
  Coffee,
  Briefcase,
  Plane,
} from 'lucide-react';

type Template = {
  id: string;
  name: string;
  description: string;
  icon: any;
  accent: string;
  shift: {
    code: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    workHours: number;
    graceInMinutes: number;
    graceOutMinutes: number;
    breakDuration: number;
    overtimeAllowed: boolean;
    maxOvertimeHours: number;
  };
};

const TEMPLATES: Template[] = [
  {
    id: 'general-9-6',
    name: 'General (9 to 6)',
    description: 'Standard office shift, 8 working hours with a 1-hour break.',
    icon: Briefcase,
    accent: 'from-blue-500/15 to-blue-500/5 border-blue-500/30',
    shift: {
      code: 'GEN-09',
      name: 'General Shift',
      description: 'Standard 9 AM – 6 PM office hours',
      startTime: '09:00',
      endTime: '18:00',
      workHours: 8,
      graceInMinutes: 15,
      graceOutMinutes: 15,
      breakDuration: 60,
      overtimeAllowed: true,
      maxOvertimeHours: 4,
    },
  },
  {
    id: 'morning-6-3',
    name: 'Morning (6 to 3)',
    description: 'Early-start shift for operations and field roles.',
    icon: Sun,
    accent: 'from-amber-500/15 to-amber-500/5 border-amber-500/30',
    shift: {
      code: 'MORN-06',
      name: 'Morning Shift',
      description: '6 AM – 3 PM early shift',
      startTime: '06:00',
      endTime: '15:00',
      workHours: 8,
      graceInMinutes: 10,
      graceOutMinutes: 10,
      breakDuration: 60,
      overtimeAllowed: true,
      maxOvertimeHours: 3,
    },
  },
  {
    id: 'night-10-7',
    name: 'Night (10 PM to 7 AM)',
    description: 'Night shift with night-differential overtime allowed.',
    icon: Moon,
    accent: 'from-indigo-500/15 to-indigo-500/5 border-indigo-500/30',
    shift: {
      code: 'NIGHT-22',
      name: 'Night Shift',
      description: '10 PM – 7 AM night shift',
      startTime: '22:00',
      endTime: '07:00',
      workHours: 8,
      graceInMinutes: 15,
      graceOutMinutes: 15,
      breakDuration: 60,
      overtimeAllowed: true,
      maxOvertimeHours: 4,
    },
  },
  {
    id: 'split-9-1-4-8',
    name: 'Split (retail)',
    description: 'Two windows with a long midday break, common in retail / GCC.',
    icon: Coffee,
    accent: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30',
    shift: {
      code: 'SPLIT-09',
      name: 'Split Shift',
      description: '9–13 and 16–20 split (retail)',
      startTime: '09:00',
      endTime: '20:00',
      workHours: 8,
      graceInMinutes: 10,
      graceOutMinutes: 10,
      breakDuration: 180,
      overtimeAllowed: false,
      maxOvertimeHours: 0,
    },
  },
  {
    id: 'ramadan-9-3',
    name: 'Ramadan-reduced (9 to 3)',
    description: '6-hour Ramadan shift per GCC labour law (AE/SA/QA).',
    icon: Moon,
    accent: 'from-purple-500/15 to-purple-500/5 border-purple-500/30',
    shift: {
      code: 'RAM-09',
      name: 'Ramadan Shift',
      description: 'Ramadan-reduced 9 AM – 3 PM (6 hours)',
      startTime: '09:00',
      endTime: '15:00',
      workHours: 6,
      graceInMinutes: 15,
      graceOutMinutes: 15,
      breakDuration: 30,
      overtimeAllowed: false,
      maxOvertimeHours: 0,
    },
  },
  {
    id: 'flexible-core-11-3',
    name: 'Flexible (core 11–3)',
    description: '8 hours with a 4-hour core window, flexible start/end.',
    icon: Clock,
    accent: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30',
    shift: {
      code: 'FLEX-08',
      name: 'Flexible Shift',
      description: 'Flexible 8h with core hours 11 AM – 3 PM',
      startTime: '08:00',
      endTime: '17:00',
      workHours: 8,
      graceInMinutes: 120,
      graceOutMinutes: 120,
      breakDuration: 60,
      overtimeAllowed: true,
      maxOvertimeHours: 4,
    },
  },
  {
    id: 'weekend-on-call',
    name: 'Weekend on-call',
    description: 'Saturday/Sunday short shift for support coverage.',
    icon: Plane,
    accent: 'from-rose-500/15 to-rose-500/5 border-rose-500/30',
    shift: {
      code: 'WKND-OC',
      name: 'Weekend On-call',
      description: 'Weekend on-call coverage, 4 hours',
      startTime: '10:00',
      endTime: '14:00',
      workHours: 4,
      graceInMinutes: 30,
      graceOutMinutes: 30,
      breakDuration: 0,
      overtimeAllowed: true,
      maxOvertimeHours: 4,
    },
  },
];

export default function ShiftTemplatesPage() {
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const applyTemplate = async (tpl: Template) => {
    setCreating(tpl.id);
    setError(null);
    try {
      const stamp = Date.now().toString(36).slice(-4).toUpperCase();
      const payload = { ...tpl.shift, code: `${tpl.shift.code}-${stamp}` };
      const res = await fetch('/api/v1/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        const msg = json?.error?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      setCreated((s) => ({ ...s, [tpl.id]: true }));
    } catch (e: any) {
      setError(e?.message || 'Failed to create shift');
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/attendance/shift-management"
            className="inline-flex items-center gap-1 text-sm text-silver-mist hover:text-indigo-500 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shift Management
          </Link>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-indigo-500" />
            Shift Templates
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Pre-built shift configurations. Pick a template to create a new shift in one click — you
            can tweak the details from the main Shifts tab afterwards.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isCreating = creating === tpl.id;
          const isCreated = !!created[tpl.id];
          return (
            <div
              key={tpl.id}
              className={`bg-gradient-to-br ${tpl.accent} bg-white dark:bg-stellar-blue border rounded-xl p-5 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-white/70 dark:bg-stellar-blue/70 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </div>
                {isCreated && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Check className="w-3.5 h-3.5" /> Created
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-ink-black dark:text-pearl">{tpl.name}</h3>
              <p className="text-xs text-silver-mist mt-1 mb-4">{tpl.description}</p>

              <dl className="space-y-1.5 text-xs mb-4">
                <Row label="Timing" value={`${tpl.shift.startTime} – ${tpl.shift.endTime}`} />
                <Row label="Work hours" value={`${tpl.shift.workHours}h`} />
                <Row label="Break" value={`${tpl.shift.breakDuration} min`} />
                <Row
                  label="Grace"
                  value={`${tpl.shift.graceInMinutes} / ${tpl.shift.graceOutMinutes} min`}
                />
                <Row
                  label="Overtime"
                  value={
                    tpl.shift.overtimeAllowed
                      ? `up to ${tpl.shift.maxOvertimeHours}h`
                      : 'not allowed'
                  }
                />
              </dl>

              <button
                onClick={() => applyTemplate(tpl)}
                disabled={isCreating}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>Use this template</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-600 dark:text-slate-300">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
