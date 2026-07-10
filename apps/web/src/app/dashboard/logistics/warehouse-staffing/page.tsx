'use client';

import React, { useEffect, useState } from 'react';
import { Package, Clock, BarChart3 } from 'lucide-react';

type Shift = {
  id: string;
  shift: string;
  time: string;
  staff: number;
  required: number;
  status: string;
  productivity?: number | null;
  target?: number | null;
  role?: string | null;
  schedule?: string | null;
};

export default function WarehouseStaffingPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/industry-logistics/warehouse-staffing')
      .then((res) => res.json())
      .then((data) => setShifts(data.shifts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const avgProductivity =
    shifts.length > 0
      ? Math.round(shifts.reduce((sum, s) => sum + (s.productivity ?? 0), 0) / shifts.length)
      : 0;

  const avgTarget =
    shifts.length > 0
      ? Math.round(shifts.reduce((sum, s) => sum + (s.target ?? 0), 0) / shifts.length)
      : 0;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-500" />
          Warehouse Staffing
        </h1>
        <p className="text-slate-500 text-sm">Manage shift planning and productivity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Shift Schedule</h3>

          {loading && <div className="text-sm text-slate-500">Loading shifts...</div>}

          {!loading && shifts.length === 0 && (
            <div className="text-sm text-slate-500">No shifts found.</div>
          )}

          <div className="space-y-4">
            {shifts.map((shift) => (
              <div key={shift.id}>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {shift.shift}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      shift.status === 'Optimal' || shift.status === 'Overstaffed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {shift.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Time: {shift.time}</span>
                  <span>
                    Staff: {shift.staff} / {shift.required}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      shift.staff < shift.required ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min((shift.staff / shift.required) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase">Productivity</span>
            </div>

            <h3 className="text-3xl font-bold mb-1">{avgProductivity}</h3>

            <p className="text-indigo-100 text-sm mb-4">Packages processed per hour average</p>

            <div className="w-full bg-indigo-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white/80 h-full"
                style={{
                  width:
                    avgTarget > 0 ? `${Math.min((avgProductivity / avgTarget) * 100, 100)}%` : '0%',
                }}
              />
            </div>

            <div className="text-xs text-indigo-200 mt-2 text-right">Target: {avgTarget} pph</div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Open Shifts</h3>

            {shifts.filter((s) => s.role || s.schedule).length === 0 && (
              <div className="text-sm text-slate-500">No open shifts found.</div>
            )}

            <div className="space-y-3">
              {shifts
                .filter((s) => s.role || s.schedule)
                .map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-sm">{shift.role ?? shift.shift}</div>
                      <div className="text-xs text-slate-500">{shift.schedule ?? shift.time}</div>
                    </div>

                    <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">
                      Fill
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
