'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Network, Search, AlertCircle, Loader2, GitBranch } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface MatrixRelationship {
  employeeId: string;
  employeeName: string;
  department: string;
  positionTitle: string;
  primaryManagerName?: string;
  functionalManagerPosition?: string;
  hasDualReporting: boolean;
}

interface MatrixResponse {
  relationships: MatrixRelationship[];
  totalRelationships: number;
  dualReportingCount: number;
}

export default function MatrixPage() {
  const [data, setData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIClient.get<unknown>('/org-design/matrix');
      setData(APIClient.unwrapItem<MatrixResponse>(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matrix structure');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const rows = data?.relationships ?? [];
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        (r.primaryManagerName ?? '').toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="space-y-4 pb-6 min-h-screen flex flex-col text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-500" />
            Matrix Org Structure
          </h1>
          <p className="text-slate-500 text-sm">
            Dual-reporting relationships derived from live position and manager assignments.
          </p>
        </div>
        {data ? (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
              {data.totalRelationships} relationships
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-bold border border-amber-100">
              {data.dualReportingCount} dual-reporting
            </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading relationships...
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400 ml-1" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find employee, department or manager..."
              className="w-full bg-transparent outline-none text-sm font-medium"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Primary Manager</th>
                  <th className="px-6 py-3">Functional (Position) Line</th>
                  <th className="px-6 py-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No matrix relationships found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-bold">{r.employeeName}</td>
                      <td className="px-6 py-4 text-slate-500">{r.department || '—'}</td>
                      <td className="px-6 py-4 text-slate-500">{r.positionTitle || '—'}</td>
                      <td className="px-6 py-4">{r.primaryManagerName ?? '—'}</td>
                      <td className="px-6 py-4">{r.functionalManagerPosition ?? '—'}</td>
                      <td className="px-6 py-4">
                        {r.hasDualReporting ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 flex items-center gap-1 w-fit">
                            <GitBranch className="w-3 h-3" /> Dual
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                            Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
