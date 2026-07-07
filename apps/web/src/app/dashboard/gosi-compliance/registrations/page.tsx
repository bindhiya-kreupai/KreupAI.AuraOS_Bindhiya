'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/stores/theme-store';

interface Reg {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  establishmentId: string;
  establishmentName?: string;
  nationalityClass: string;
  status: string;
  registrationDate: string;
  deregistrationReason: string | null;
}

export default function RegistrationsPage() {
  const { isDark } = useTheme();
  const [regs, setRegs] = useState<Reg[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    establishmentId: '',
    nationalityClass: 'SAUDI',
  });

  async function load() {
    const r = await fetch('/api/v1/gosi-compliance/registrations');
    const p = await r.json();
    if (p.success) {
      setRegs(Array.isArray(p.data) ? p.data : (p.data?.items ?? []));
    }
  }

  async function loadEmployees() {
    try {
      const r = await fetch('/api/v1/employees?limit=200');
      const p = await r.json();
      if (p.success) {
        setEmployees(p.data?.items ?? p.data ?? []);
      }
    } catch {
      // Silently catch
    }
  }

  useEffect(() => {
    load();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!form.employeeId) {
      setPreview(null);
      return;
    }
    const fetchPreview = async () => {
      setPreviewLoading(true);
      try {
        const r = await fetch(`/api/v1/gosi-compliance/registrations?action=preview-employee&employeeId=${form.employeeId}`);
        const p = await r.json();
        if (p.success) {
          setPreview(p.data);
          setForm((f) => ({
            ...f,
            establishmentId: p.data.legalEntityId || '',
            nationalityClass: p.data.nationalityClass || 'SAUDI',
          }));
        } else {
          setPreview(null);
          setMessage(p.error?.message ?? 'Failed to load employee preview');
        }
      } catch (err: any) {
        setPreview(null);
        setMessage(err?.message ?? 'Failed to load employee preview');
      } finally {
        setPreviewLoading(false);
      }
    };
    fetchPreview();
  }, [form.employeeId]);

  async function register() {
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', ...form }),
    });
    const p = await r.json();
    if (p.success) {
      setMessage('Successfully registered employee in GOSI');
      setForm({ employeeId: '', establishmentId: '', nationalityClass: 'SAUDI' });
      setPreview(null);
    } else {
      setMessage(p.error?.details?.error ?? p.error?.message ?? 'Registration failed');
    }
    load();
  }

  async function deregister(employeeId: string) {
    const reason = window.prompt('Enter GOSI deregistration reason (e.g. Resignation, Contract End):');
    if (!reason) return;
    setMessage('');
    const r = await fetch('/api/v1/gosi-compliance/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deregister', employeeId, reason }),
    });
    const p = await r.json();
    setMessage(
      p.success ? 'Deregistered successfully' : (p.error?.details?.error ?? p.error?.message ?? 'failed')
    );
    load();
  }

  return (
    <main 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-slate-950 dark:text-slate-50 transition-colors duration-200"
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm uppercase text-slate-500 dark:text-slate-400 font-semibold">EPIC-13 · S05–S06</p>
          <h1 className="text-2xl font-bold dark:text-white mt-1">GOSI Employee Registrations</h1>
        </header>

        <section className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Register Employee</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
              Employee
              <select
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="">-- Search / Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="dark:bg-slate-900">
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
              Company (Auto-fetched)
              <input
                value={preview?.companyName ?? '—'}
                readOnly
                className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
              Saudi Legal Entity (Auto-fetched)
              <input
                value={preview?.legalEntityName ?? '—'}
                readOnly
                className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
              GOSI Establishment Number (Auto-fetched)
              <input
                value={preview?.establishmentNumber ?? '—'}
                readOnly
                className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex flex-col gap-1.5">
              Nationality Class (Auto-verified)
              <input
                value={preview ? `${preview.nationalityClass} (${preview.nationality})` : '—'}
                readOnly
                className="w-full rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={register}
                disabled={!form.employeeId || previewLoading || !preview?.isGosiConfigured}
                className="w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 px-4 py-2.5 text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {previewLoading ? 'Loading Preview...' : 'Register in GOSI'}
              </button>
            </div>
          </div>
        </section>
        
        {message ? (
          <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-sm text-indigo-700 dark:text-indigo-300">
            {message}
          </div>
        ) : null}

        <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Establishment</th>
                <th className="px-3 py-2">Nationality</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Registered</th>
                <th className="px-3 py-2">Reason</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {regs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                  <td className="px-3 py-2 font-mono text-xs dark:text-slate-350">
                    {r.employeeName ?? '—'} ({r.employeeCode ?? r.employeeId})
                  </td>
                  <td className="px-3 py-2 font-mono text-xs dark:text-slate-350">{r.establishmentName ?? r.establishmentId}</td>
                  <td className="px-3 py-2 dark:text-slate-300">{r.nationalityClass}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs dark:text-slate-350">{r.registrationDate?.slice(0, 10)}</td>
                  <td className="px-3 py-2 text-xs dark:text-slate-350">{r.deregistrationReason ?? '—'}</td>
                  <td className="px-3 py-2 text-center">
                    {r.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => deregister(r.employeeId)}
                        className="rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-2 py-1 text-xs text-rose-600 dark:text-rose-455 font-semibold transition-colors"
                      >
                        Deregister
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic">Deregistered</span>
                    )}
                  </td>
                </tr>
              ))}
              {regs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                    No registrations.
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
