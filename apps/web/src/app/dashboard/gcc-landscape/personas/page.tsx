'use client';

import { useEffect, useState } from 'react';

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}

export default function GccPersonasPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const r = await fetch('/api/v1/gcc-landscape/personas');
    const p = await r.json();
    if (p.success) setRoles(p.data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function seed() {
    const r = await fetch('/api/v1/gcc-landscape/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed-personas' }),
    });
    const p = await r.json();
    setMessage(p.success ? `Seeded: ${(p.data?.created ?? []).join(', ')}` : p.error?.message);
    load();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm uppercase text-slate-500">GCC Landscape · S05</p>
            <h1 className="text-2xl font-semibold">GCC HR Personas / RBAC</h1>
          </div>
          <button
            type="button"
            onClick={seed}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Seed Personas
          </button>
        </header>
        {message ? <p className="text-sm">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">System</th>
                <th className="px-3 py-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-slate-600">{r.description}</td>
                  <td className="px-3 py-2">{r.isSystem ? 'Yes' : 'No'}</td>
                  <td className="px-3 py-2">{r.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No personas seeded yet.
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
