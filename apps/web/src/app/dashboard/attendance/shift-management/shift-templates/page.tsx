'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { toast } from 'sonner';

type DbTemplate = {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  accent: string;
  shiftCode: string;
  shiftName: string;
  shiftDescription: string | null;
  startTime: string;
  endTime: string;
  workHours: number;
  graceInMinutes: number;
  graceOutMinutes: number;
  breakDuration: number;
  overtimeAllowed: boolean;
  maxOvertimeHours: number;
};

const ICON_MAP: Record<string, any> = {
  Briefcase,
  Sun,
  Moon,
  Coffee,
  Clock,
  Plane,
  LayoutTemplate,
};

const ACCENT_MAP: Record<string, string> = {
  'from-blue-500/15 to-blue-500/5 border-blue-500/30': 'blue',
  'from-amber-500/15 to-amber-500/5 border-amber-500/30': 'amber',
  'from-indigo-500/15 to-indigo-500/5 border-indigo-500/30': 'indigo',
  'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30': 'emerald',
  'from-purple-500/15 to-purple-500/5 border-purple-500/30': 'purple',
  'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30': 'cyan',
  'from-rose-500/15 to-rose-500/5 border-rose-500/30': 'rose',
};

const SEED_TEMPLATES: Omit<DbTemplate, 'id'>[] = [
  {
    name: 'General (9 to 6)',
    description: 'Standard office shift, 8 working hours with a 1-hour break.',
    icon: 'Briefcase',
    accent: 'from-blue-500/15 to-blue-500/5 border-blue-500/30',
    shiftCode: 'GEN-09',
    shiftName: 'General Shift',
    shiftDescription: 'Standard 9 AM – 6 PM office hours',
    startTime: '09:00',
    endTime: '18:00',
    workHours: 8,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 4,
  },
  {
    name: 'Morning (6 to 3)',
    description: 'Early-start shift for operations and field roles.',
    icon: 'Sun',
    accent: 'from-amber-500/15 to-amber-500/5 border-amber-500/30',
    shiftCode: 'MORN-06',
    shiftName: 'Morning Shift',
    shiftDescription: '6 AM – 3 PM early shift',
    startTime: '06:00',
    endTime: '15:00',
    workHours: 8,
    graceInMinutes: 10,
    graceOutMinutes: 10,
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 3,
  },
  {
    name: 'Night (10 PM to 7 AM)',
    description: 'Night shift with night-differential overtime allowed.',
    icon: 'Moon',
    accent: 'from-indigo-500/15 to-indigo-500/5 border-indigo-500/30',
    shiftCode: 'NIGHT-22',
    shiftName: 'Night Shift',
    shiftDescription: '10 PM – 7 AM night shift',
    startTime: '22:00',
    endTime: '07:00',
    workHours: 8,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 4,
  },
  {
    name: 'Split (retail)',
    description: 'Two windows with a long midday break, common in retail / GCC.',
    icon: 'Coffee',
    accent: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30',
    shiftCode: 'SPLIT-09',
    shiftName: 'Split Shift',
    shiftDescription: '9–13 and 16–20 split (retail)',
    startTime: '09:00',
    endTime: '20:00',
    workHours: 8,
    graceInMinutes: 10,
    graceOutMinutes: 10,
    breakDuration: 180,
    overtimeAllowed: false,
    maxOvertimeHours: 0,
  },
  {
    name: 'Ramadan-reduced (9 to 3)',
    description: '6-hour Ramadan shift per GCC labour law (AE/SA/QA).',
    icon: 'Moon',
    accent: 'from-purple-500/15 to-purple-500/5 border-purple-500/30',
    shiftCode: 'RAM-09',
    shiftName: 'Ramadan Shift',
    shiftDescription: 'Ramadan-reduced 9 AM – 3 PM (6 hours)',
    startTime: '09:00',
    endTime: '15:00',
    workHours: 6,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    breakDuration: 30,
    overtimeAllowed: false,
    maxOvertimeHours: 0,
  },
  {
    name: 'Flexible (core 11–3)',
    description: '8 hours with a 4-hour core window, flexible start/end.',
    icon: 'Clock',
    accent: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30',
    shiftCode: 'FLEX-08',
    shiftName: 'Flexible Shift',
    shiftDescription: 'Flexible 8h with core hours 11 AM – 3 PM',
    startTime: '08:00',
    endTime: '17:00',
    workHours: 8,
    graceInMinutes: 120,
    graceOutMinutes: 120,
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 4,
  },
  {
    name: 'Weekend on-call',
    description: 'Saturday/Sunday short shift for support coverage.',
    icon: 'Plane',
    accent: 'from-rose-500/15 to-rose-500/5 border-rose-500/30',
    shiftCode: 'WKND-OC',
    shiftName: 'Weekend On-call',
    shiftDescription: 'Weekend on-call coverage, 4 hours',
    startTime: '10:00',
    endTime: '14:00',
    workHours: 4,
    graceInMinutes: 30,
    graceOutMinutes: 30,
    breakDuration: 0,
    overtimeAllowed: true,
    maxOvertimeHours: 4,
  },
];

export default function ShiftTemplatesPage() {
  const { t, isRTL } = useI18n();
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const seedingRef = useRef(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    shiftCode: '',
    shiftName: '',
    startTime: '09:00',
    endTime: '18:00',
    workHours: 8,
    graceInMinutes: 15,
    graceOutMinutes: 15,
    breakDuration: 60,
    overtimeAllowed: true,
    maxOvertimeHours: 4,
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/shift-templates');
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data || []);
        if (!json.data || json.data.length === 0) {
          seedDefaults();
        }
      } else {
        setError(json.error?.message || 'Failed to load templates');
      }
    } catch {
      setError('Network error loading templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const seedDefaults = async () => {
    if (seedingRef.current) return;
    seedingRef.current = true;
    setSeeding(true);
    try {
      await Promise.allSettled(
        SEED_TEMPLATES.map((tpl) =>
          fetch('/api/v1/shift-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tpl),
          }).then((r) => {
            // 409 = already seeded, ignore
            if (r.status === 409) return null;
            return r.json();
          })
        )
      );
      await fetchTemplates();
    } catch {
      // silently fail — templates can be seeded manually later
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const applyTemplate = async (tpl: DbTemplate) => {
    setCreating(tpl.id);
    setError(null);
    try {
      const stamp = Date.now().toString(36).slice(-4).toUpperCase();
      const payload = {
        code: `${tpl.shiftCode}-${stamp}`,
        name: tpl.shiftName,
        description: tpl.shiftDescription || '',
        startTime: tpl.startTime,
        endTime: tpl.endTime,
        workHours: tpl.workHours,
        graceInMinutes: tpl.graceInMinutes,
        graceOutMinutes: tpl.graceOutMinutes,
        breakDuration: tpl.breakDuration,
        overtimeAllowed: tpl.overtimeAllowed,
        maxOvertimeHours: tpl.maxOvertimeHours,
      };
      const res = await fetch('/api/v1/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(json?.error?.message || `Request failed (${res.status})`);
      }
      setCreated((s) => ({ ...s, [tpl.id]: true }));
      toast.success(`"${tpl.shiftName}" shift created from template`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create shift');
    } finally {
      setCreating(null);
    }
  };

  const deleteTemplate = async (tpl: DbTemplate) => {
    if (!confirm(`Delete template "${tpl.name}"?`)) return;
    try {
      const res = await fetch(`/api/v1/shift-templates/${tpl.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Delete failed');
      setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
      toast.success('Template deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete template');
    }
  };

  const handleCreate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.shiftCode.trim()) {
      toast.error('Name and shift code are required');
      return;
    }
    try {
      const res = await fetch('/api/v1/shift-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Failed to create template');
      setTemplates((prev) => [...prev, json.data]);
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        description: '',
        shiftCode: '',
        shiftName: '',
        startTime: '09:00',
        endTime: '18:00',
        workHours: 8,
        graceInMinutes: 15,
        graceOutMinutes: 15,
        breakDuration: 60,
        overtimeAllowed: true,
        maxOvertimeHours: 4,
      });
      toast.success('Template created');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create template');
    }
  };

  return (
    <div className="space-y-4 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-silver-mist" aria-label="Breadcrumb">
        <Link href="/dashboard/attendance" className="hover:text-indigo-500 transition-colors">
          Attendance
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/attendance/shift-management"
          className="hover:text-indigo-500 transition-colors"
        >
          Shift Management
        </Link>
        <span>/</span>
        <span className="text-ink-black dark:text-pearl font-medium">Templates</span>
      </nav>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-indigo-500" />
            {t('shiftManagement.tabs.templates')}
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Pre-built shift configurations. Pick a template to create a new shift in one click — you
            can tweak the details from the main Shifts tab afterwards.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm ? 'Cancel' : 'New template'}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/40 bg-white dark:bg-stellar-blue p-5 space-y-4">
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Create new template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Template name *"
              value={newTemplate.name}
              onChange={(v) => setNewTemplate((s) => ({ ...s, name: v }))}
            />
            <InputField
              label="Description"
              value={newTemplate.description}
              onChange={(v) => setNewTemplate((s) => ({ ...s, description: v }))}
            />
            <InputField
              label="Shift code *"
              value={newTemplate.shiftCode}
              onChange={(v) => setNewTemplate((s) => ({ ...s, shiftCode: v }))}
            />
            <InputField
              label="Shift name"
              value={newTemplate.shiftName}
              onChange={(v) => setNewTemplate((s) => ({ ...s, shiftName: v }))}
            />
            <InputField
              label="Start time"
              type="time"
              value={newTemplate.startTime}
              onChange={(v) => setNewTemplate((s) => ({ ...s, startTime: v }))}
            />
            <InputField
              label="End time"
              type="time"
              value={newTemplate.endTime}
              onChange={(v) => setNewTemplate((s) => ({ ...s, endTime: v }))}
            />
            <InputField
              label="Work hours"
              type="number"
              value={String(newTemplate.workHours)}
              onChange={(v) => setNewTemplate((s) => ({ ...s, workHours: Number(v) }))}
            />
            <InputField
              label="Grace in (min)"
              type="number"
              value={String(newTemplate.graceInMinutes)}
              onChange={(v) => setNewTemplate((s) => ({ ...s, graceInMinutes: Number(v) }))}
            />
            <InputField
              label="Grace out (min)"
              type="number"
              value={String(newTemplate.graceOutMinutes)}
              onChange={(v) => setNewTemplate((s) => ({ ...s, graceOutMinutes: Number(v) }))}
            />
            <InputField
              label="Break (min)"
              type="number"
              value={String(newTemplate.breakDuration)}
              onChange={(v) => setNewTemplate((s) => ({ ...s, breakDuration: Number(v) }))}
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Overtime allowed
              </label>
              <input
                type="checkbox"
                checked={newTemplate.overtimeAllowed}
                onChange={(e) =>
                  setNewTemplate((s) => ({ ...s, overtimeAllowed: e.target.checked }))
                }
                className="rounded border-slate-300 dark:border-slate-600"
              />
            </div>
            <InputField
              label="Max overtime hours"
              type="number"
              value={String(newTemplate.maxOvertimeHours)}
              onChange={(v) => setNewTemplate((s) => ({ ...s, maxOvertimeHours: Number(v) }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Save template
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-silver-mist">
          <LayoutTemplate className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">No templates yet.</p>
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {seeding ? 'Loading…' : 'Load default templates'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tpl) => {
            const IconComp = ICON_MAP[tpl.icon] || LayoutTemplate;
            const isCreating = creating === tpl.id;
            const isCreated = !!created[tpl.id];
            return (
              <div
                key={tpl.id}
                className={`bg-gradient-to-br ${tpl.accent} bg-white dark:bg-stellar-blue border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group`}
              >
                <button
                  onClick={() => deleteTemplate(tpl)}
                  className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/70 dark:bg-stellar-blue/70 flex items-center justify-center">
                    <IconComp className="w-5 h-5 text-slate-700 dark:text-slate-200" />
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
                  <Row label="Timing" value={`${tpl.startTime} – ${tpl.endTime}`} />
                  <Row label="Work hours" value={`${tpl.workHours}h`} />
                  <Row label="Break" value={`${tpl.breakDuration} min`} />
                  <Row label="Grace" value={`${tpl.graceInMinutes} / ${tpl.graceOutMinutes} min`} />
                  <Row
                    label="Overtime"
                    value={tpl.overtimeAllowed ? `up to ${tpl.maxOvertimeHours}h` : 'not allowed'}
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
                    <>{t('shiftManagement.shift.create')}</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm bg-pearl dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none text-ink-black dark:text-pearl"
      />
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
