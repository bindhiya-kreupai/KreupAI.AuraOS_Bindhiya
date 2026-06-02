'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Hash, RotateCcw, Save } from 'lucide-react';
import { AutoNumberService } from '../services';
import type { AutoNumberSequence } from '../types';

interface SettingsRow {
  entity: string;
  prefix: string;
  digits: number;
  next: string;
  example: string;
}

const defaultSettings: SettingsRow[] = [
  { entity: 'Employee ID', prefix: 'EMP-', digits: 4, next: '0042', example: 'EMP-0042' },
  { entity: 'Department ID', prefix: 'DEPT-', digits: 3, next: '012', example: 'DEPT-012' },
  { entity: 'Position ID', prefix: 'POS-', digits: 5, next: '00104', example: 'POS-00104' },
];

const STORAGE_KEY = 'auraos.coreHr.autoNumbers.v1';

const formatEntityType = (entityType: string): string => {
  return (
    entityType
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') + ' ID'
  );
};

const sequenceToSettingsRow = (seq: AutoNumberSequence): SettingsRow => {
  const nextStr = String(seq.currentNumber).padStart(seq.numberLength, '0');
  return {
    entity: formatEntityType(seq.entityType),
    prefix: seq.prefix,
    digits: seq.numberLength,
    next: nextStr,
    example: `${seq.prefix}${nextStr}`,
  };
};

export default function AutoNumberingPage() {
  const [serverSettings, setServerSettings] = useState<SettingsRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSequences();
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const data = await AutoNumberService.getAllSequences();
      const baseRows = data.length > 0 ? data.map(sequenceToSettingsRow) : defaultSettings;
      setServerSettings(baseRows);

      let stored: Partial<Record<string, SettingsRow>> = {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw);
      } catch {
        /* ignore */
      }

      const merged = baseRows.map((row) => {
        const override = stored[row.entity];
        if (!override) return row;
        const digits = Number(override.digits) || row.digits;
        const nextPadded = String(override.next ?? row.next).padStart(digits, '0');
        return {
          ...row,
          prefix: override.prefix ?? row.prefix,
          digits,
          next: nextPadded,
          example: `${override.prefix ?? row.prefix}${nextPadded}`,
        };
      });
      setSettings(merged);
    } catch (error: any) {
      console.error('Error:', error);
      setServerSettings(defaultSettings);
      setSettings(defaultSettings);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load sequences.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof SettingsRow, value: string) => {
    const newSettings = [...settings];
    const current = { ...newSettings[index] };
    if (field === 'digits') {
      current.digits = Number(value) || 0;
    } else if (field === 'prefix') {
      current.prefix = value;
    } else if (field === 'next') {
      current.next = value;
    }
    const nextPadded = String(current.next).padStart(current.digits, '0');
    current.next = nextPadded;
    current.example = `${current.prefix}${nextPadded}`;
    newSettings[index] = current;
    setSettings(newSettings);
    setStatus(null);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const overrides: Record<string, SettingsRow> = {};
      settings.forEach((row) => {
        overrides[row.entity] = row;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
      setStatus({ kind: 'success', text: 'Sequences saved (browser-local).' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save sequences.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSettings(serverSettings);
    setStatus({ kind: 'success', text: 'Reset to server values.' });
  };

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Hash className="w-6 h-6 text-indigo-500" />
            Auto-Numbering Series
          </h1>
          <p className="text-slate-500 text-sm">
            Configure automatic ID generation for system entities.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            disabled={loading || saving}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Prefix</th>
                  <th className="px-6 py-4">Digit Count</th>
                  <th className="px-6 py-4">Start/Next Sequence</th>
                  <th className="px-6 py-4">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {settings.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold">{row.entity}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={row.prefix}
                        onChange={(e) => handleChange(i, 'prefix', e.target.value)}
                        className="w-24 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={row.digits}
                        onChange={(e) => handleChange(i, 'digits', e.target.value)}
                        className="w-16 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={row.next}
                        onChange={(e) => handleChange(i, 'next', e.target.value)}
                        className="w-24 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                        {row.example}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Sequence overrides persist per-browser. The /api/core-hr/auto-numbers endpoint currently
          exposes <code className="px-1 mx-1 bg-amber-100 dark:bg-amber-900/40 rounded">GET</code>+
          <code className="px-1 mx-1 bg-amber-100 dark:bg-amber-900/40 rounded">POST</code>
          only; adding <code className="px-1 bg-amber-100 dark:bg-amber-900/40 rounded">PUT</code>
          would let edits apply tenant-wide. Changing &quot;Start/Next&quot; below the existing max
          will cause duplicate-ID errors — proceed with caution.
        </p>
      </div>
    </div>
  );
}
