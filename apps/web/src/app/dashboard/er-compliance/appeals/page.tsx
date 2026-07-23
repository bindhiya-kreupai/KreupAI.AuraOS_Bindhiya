'use client';

import { useEffect, useState } from 'react';

interface Ap {
  id: string;
  appealNumber: string;
  subjectType: string;
  subjectId: string;
  appellantId: string;
  reason: string | null;
  filedAt: string;
  decisionDueAt: string | null;
  outcome: string | null;
  decidedAt: string | null;
  status: string;
}

export default function AppealsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState('OPEN');
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    appealNumber: '',
    subjectType: 'GRIEVANCE',
    subjectId: '',
    appellantId: '',
    reason: '',
    filedAt: new Date().toISOString().slice(0, 10),
  });
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [selectedEmpName, setSelectedEmpName] = useState('');

  async function searchEmployees(query: string) {
    setEmpLoading(true);
    try {
      const res = await fetch(`/api/employees/search?q=${encodeURIComponent(query)}&size=50`);
      const payload = await res.json();
      if (payload.success) {
        setEmployees(payload.data?.employees ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEmpLoading(false);
    }
  }

  useEffect(() => {
    searchEmployees('');
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const url = new URL('/api/v1/er-compliance/appeals', window.location.origin);
      if (filter) url.searchParams.set('status', filter);
      const r = await fetch(url.toString());
      const p = await r.json();
      if (p.success) {
        setRows(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function file() {
    setMessage('');
    const r = await fetch('/api/v1/er-compliance/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'file', ...form }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Filed' : (p.error?.details?.error ?? p.error?.message ?? 'failed'));
    load();
  }

  async function decide(id: string) {
    const outcome = window.prompt('Outcome (UPHELD / OVERTURNED / PARTIAL)?') ?? '';
    if (!outcome) return;
    const r = await fetch('/api/v1/er-compliance/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decide', id, outcome }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Decided' : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">
              EPIC-25 · S10 / EPIC-26 · S08
            </p>
            <h1 className="text-2xl font-semibold">Appeals Register</h1>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="DECIDED">DECIDED</option>
          </select>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:grid-cols-7">
          <label className="text-sm">
            Appeal #
            <input
              value={form.appealNumber}
              onChange={(e) => setForm((f) => ({ ...f, appealNumber: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <label className="text-sm">
            Subject Type
            <select
              value={form.subjectType}
              onChange={(e) => setForm((f) => ({ ...f, subjectType: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            >
              <option>GRIEVANCE</option>
              <option>DISCIPLINARY</option>
            </select>
          </label>
          <label className="text-sm">
            Subject ID
            <input
              value={form.subjectId}
              onChange={(e) => setForm((f) => ({ ...f, subjectId: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5 font-mono text-xs"
            />
          </label>
          <div className="text-sm relative flex flex-col justify-end">
            <label className="text-sm">
              Appellant
              <input
                type="text"
                placeholder="Search employee..."
                value={
                  empDropdownOpen
                    ? empSearchQuery
                    : form.appellantId
                      ? selectedEmpName
                      : empSearchQuery
                }
                onFocus={() => {
                  setEmpDropdownOpen(true);
                  searchEmployees(empSearchQuery);
                }}
                onChange={(e) => {
                  setEmpSearchQuery(e.target.value);
                  setEmpDropdownOpen(true);
                  searchEmployees(e.target.value);
                }}
                className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
              />
            </label>

            {empDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setEmpDropdownOpen(false)} />
                <div className="absolute top-[100%] left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1">
                  {empLoading ? (
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      Loading...
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                      No matching employees
                    </div>
                  ) : (
                    employees.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, appellantId: e.id }));
                          setSelectedEmpName(`${e.firstName} ${e.lastName} (${e.employeeCode})`);
                          setEmpSearchQuery('');
                          setEmpDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-850 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                      >
                        <span>
                          {e.firstName} {e.lastName}
                        </span>
                        <span className="text-[10px] text-slate-450">{e.employeeCode}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
          <label className="text-sm md:col-span-2">
            Reason
            <input
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-2 py-1.5"
            />
          </label>
          <button
            type="button"
            onClick={file}
            className="rounded-md bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-sm text-white"
          >
            File Appeal
          </button>
        </section>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Appeal #</th>
                <th className="px-3 py-2">Filed</th>
                <th className="px-3 py-2">Subject</th>
                <th className="px-3 py-2">Appellant</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2">Outcome</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr
                      key={`skel-${i}`}
                      className="border-b border-slate-100 dark:border-slate-800/50 animate-pulse"
                    >
                      <td colSpan={8} className="px-3 py-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                : rows.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="px-3 py-2 font-mono text-xs">{a.appealNumber}</td>
                      <td className="px-3 py-2 text-xs">{a.filedAt?.slice(0, 10)}</td>
                      <td className="px-3 py-2 text-xs">
                        {a.subjectType} / {a.subjectId.slice(0, 8)}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        <div>{a.employeeName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{a.appellantId}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">{a.reason ?? '—'}</td>
                      <td className="px-3 py-2 text-xs">{a.outcome ?? '—'}</td>
                      <td className="px-3 py-2 text-xs">{a.status}</td>
                      <td className="px-3 py-2">
                        {a.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => decide(a.id)}
                            className="rounded-md bg-emerald-700 px-2 py-1 text-xs text-white"
                          >
                            Decide
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                  >
                    No appeals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
