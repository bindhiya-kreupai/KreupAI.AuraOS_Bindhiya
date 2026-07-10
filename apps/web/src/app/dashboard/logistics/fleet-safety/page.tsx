'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, Video, AlertTriangle } from 'lucide-react';

type Incident = {
  id: string;
  event: string;
  driver: string;
  time: string;
  location: string;
  severity: string;
  score?: number | null;
  trend?: string | null;
};

export default function FleetSafetyPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/industry-logistics/fleet-safety')
      .then((res) => res.json())
      .then((data) => setIncidents(data.incidents ?? []))
      .finally(() => setLoading(false));
  }, []);

  const avgScore =
    incidents.length > 0
      ? Math.round(incidents.reduce((sum, i) => sum + (i.score ?? 0), 0) / incidents.length)
      : 0;

  const harshBraking = incidents.filter((i) => i.event === 'Harsh Braking').length;

  const speeding = incidents.filter((i) => i.event.toLowerCase().includes('speed')).length;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            Fleet Safety
          </h1>
          <p className="text-slate-500 text-sm">Monitor telematics, safety scores and incidents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border text-center">
          <div className="text-3xl font-bold text-emerald-500">{avgScore}/100</div>
          <div className="text-xs uppercase text-slate-500">Fleet Safety Score</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border text-center">
          <div className="text-3xl font-bold text-amber-500">{harshBraking}</div>
          <div className="text-xs uppercase text-slate-500">Harsh Braking</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border text-center">
          <div className="text-3xl font-bold text-rose-500">{speeding}</div>
          <div className="text-xs uppercase text-slate-500">Speeding Alerts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border text-center">
          <div className="text-3xl font-bold text-indigo-500">{incidents.length}</div>
          <div className="text-xs uppercase text-slate-500">Total Incidents</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4">Latest Incidents</h3>

          {loading && <div className="text-sm text-slate-500">Loading...</div>}

          {!loading && incidents.length === 0 && (
            <div className="text-sm text-slate-500">No incidents found.</div>
          )}

          <div className="space-y-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      inc.severity === 'High'
                        ? 'bg-rose-100 text-rose-600'
                        : inc.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="font-bold">{inc.event}</div>
                    <div className="text-sm text-slate-500">
                      {inc.driver} • {inc.time}
                    </div>
                    <div className="text-xs text-slate-400">{inc.location}</div>
                  </div>
                </div>

                <button className="mt-3 sm:mt-0 flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold">
                  <Video className="w-3 h-3" />
                  View Dashcam
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h3 className="font-bold text-lg mb-4">Driver Safety Rankings</h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>Driver</th>
                <th className="text-right">Score</th>
                <th className="text-center">Trend</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="py-3">{row.driver}</td>

                  <td className="text-right">{row.score ?? '-'}</td>

                  <td className="text-center">
                    {row.trend === 'up' && <Activity className="w-4 h-4 inline text-emerald-500" />}
                    {row.trend === 'down' && (
                      <Activity className="w-4 h-4 inline text-rose-500 rotate-180" />
                    )}
                    {!row.trend && '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
