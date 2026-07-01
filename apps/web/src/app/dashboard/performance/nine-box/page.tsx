'use client';

import React, { useEffect, useState } from 'react';
import { PerformanceReviewService, CalibrationService } from '../core/services';
import {
  AlertCircle,
  CheckCircle2,
  Grid,
  Info,
  Loader2,
  Move,
  RotateCcw,
  Save,
} from 'lucide-react';

const BOXES = [
  {
    id: '1-1',
    title: 'Rough Diamond',
    desc: 'High Potential, Low Performance',
    color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200',
  },
  {
    id: '1-2',
    title: 'Future Star',
    desc: 'High Potential, Moderate Performance',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200',
  },
  {
    id: '1-3',
    title: 'Star',
    desc: 'High Potential, High Performance',
    color: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
  },
  {
    id: '2-1',
    title: 'Inconsistent',
    desc: 'Mod Potential, Low Performance',
    color: 'bg-slate-100 dark:bg-slate-800 border-slate-200',
  },
  {
    id: '2-2',
    title: 'Key Player',
    desc: 'Mod Potential, Moderate Performance',
    color: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100',
  },
  {
    id: '2-3',
    title: 'High Performer',
    desc: 'Mod Potential, High Performance',
    color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100',
  },
  {
    id: '3-1',
    title: 'Talent Risk',
    desc: 'Low Potential, Low Performance',
    color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200',
  },
  {
    id: '3-2',
    title: 'Effective',
    desc: 'Low Potential, Moderate Performance',
    color: 'bg-slate-100 dark:bg-slate-800 border-slate-200',
  },
  {
    id: '3-3',
    title: 'Trusted Pro',
    desc: 'Low Potential, High Performance',
    color: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100',
  },
];

interface EmployeeBox {
  id: string;
  name: string;
  role: string;
  box: string;
  originalBox: string;
  avatar: string;
}

// A single tenant-wide calibration session backs the 9-box overrides so HR
// teams share one view. Identified by this reserved session name.
const NINE_BOX_SESSION_NAME = 'nine-box-grid';

function computeBoxFromRating(rating: number): string {
  const col = rating >= 4 ? 3 : rating >= 3 ? 2 : 1;
  return `2-${col}`;
}

export default function NineBoxGridPage() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviews, sessions] = await Promise.all([
        PerformanceReviewService.getReviews(),
        CalibrationService.getSessions(),
      ]);
      const nineBox = (sessions as any[]).find((s) => s.sessionName === NINE_BOX_SESSION_NAME);
      setSessionId(nineBox?.id ?? null);
      const overrides: Record<string, string> =
        (nineBox?.adjustments && (nineBox.adjustments as any).overrides) || {};
      const mapped: EmployeeBox[] = reviews
        .filter((r: any) => r.finalRating !== null && r.finalRating !== undefined)
        .map((r: any) => {
          const rating = Math.round(r.finalRating || 3);
          const initial = computeBoxFromRating(rating);
          return {
            id: r.id,
            name: `Employee ${r.employeeId?.slice(-4) || r.id?.slice(-4)}`,
            role: r.reviewType || 'Review',
            box: overrides[r.id] || initial,
            originalBox: initial,
            avatar: (r.employeeId?.slice(-2) || 'EE').toUpperCase(),
          };
        });
      setEmployees(mapped);
      setDirty(false);
    } catch (error: any) {
      console.error('Failed to load nine-box data:', error);
      setStatus({ kind: 'error', text: error?.message || 'Failed to load.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const placeSelected = (boxId: string) => {
    if (!selectedId) return;
    setEmployees((all) => all.map((e) => (e.id === selectedId ? { ...e, box: boxId } : e)));
    setSelectedId(null);
    setDirty(true);
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      if (sessionId) {
        await CalibrationService.updateSession(sessionId, {
          adjustments: { type: 'nine-box', overrides: {} },
        });
      }
      setEmployees((all) => all.map((e) => ({ ...e, box: e.originalBox })));
      setDirty(false);
      setStatus({ kind: 'success', text: 'Calibration reset.' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to reset calibration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const overrides: Record<string, string> = {};
      employees.forEach((e) => {
        if (e.box !== e.originalBox) overrides[e.id] = e.box;
      });
      const adjustments = { type: 'nine-box', overrides };
      if (sessionId) {
        await CalibrationService.updateSession(sessionId, { adjustments });
      } else {
        const created = await CalibrationService.createRaw({
          sessionName: NINE_BOX_SESSION_NAME,
          status: 'in_progress',
          adjustments,
        });
        setSessionId(created?.id ?? null);
      }
      setEmployees((all) => all.map((e) => ({ ...e, originalBox: e.box })));
      setDirty(false);
      setStatus({ kind: 'success', text: 'Calibration saved.' });
    } catch (e: any) {
      setStatus({ kind: 'error', text: e?.message || 'Failed to save calibration.' });
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
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid className="w-6 h-6 text-indigo-500" />
            9-Box Grid
          </h1>
          <p className="text-slate-500 text-sm">
            Talent calibration matrix for succession planning.
            {selectedId && (
              <span className="ml-2 text-indigo-600 dark:text-indigo-300 font-medium">
                <Move className="inline w-3 h-3 mr-1" /> Click a box to place selected employee
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!dirty}
            className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-indigo-500 disabled:opacity-40 disabled:hover:text-slate-500"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Calibration'}
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

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-auto">
        {employees.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No calibrated reviews yet. Once reviews have a final rating, they will appear here.
          </div>
        ) : (
          <div className="flex relative min-w-[800px] pb-6">
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-slate-400 tracking-widest uppercase">
              Potential &rarr;
            </div>

            <div className="flex-1 flex flex-col gap-3 ml-8">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex-1 flex gap-3">
                  {[0, 1, 2].map((col) => {
                    const boxIndex = row * 3 + col;
                    const box = BOXES[boxIndex];
                    const occupants = employees.filter((e) => e.box === box.id);

                    return (
                      <div
                        key={box.id}
                        onClick={() => selectedId && placeSelected(box.id)}
                        className={`flex-1 rounded-xl border p-4 flex flex-col ${box.color} transition-all min-h-[140px] ${
                          selectedId ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm">{box.title}</span>
                          <Info className="w-4 h-4 text-slate-400" />
                        </div>

                        <div className="flex-1 flex flex-wrap content-start gap-2">
                          {occupants.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(emp.id === selectedId ? null : emp.id);
                              }}
                              className={`p-1.5 rounded-lg shadow-sm border flex items-center gap-2 transition-all ${
                                selectedId === emp.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md text-slate-700 dark:text-slate-300'
                              }`}
                              title={`${emp.name} (click to move)`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  selectedId === emp.id
                                    ? 'bg-white text-indigo-600'
                                    : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                }`}
                              >
                                {emp.avatar}
                              </div>
                              <span className="text-xs font-bold">{emp.name}</span>
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                          {box.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-400 tracking-widest uppercase">
              Performance &rarr;
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900/40 dark:border-slate-800 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 flex gap-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Calibration overrides are persisted to a shared tenant-wide calibration session, so every
          HR reviewer sees the same 9-box placement.
        </p>
      </div>
    </div>
  );
}
