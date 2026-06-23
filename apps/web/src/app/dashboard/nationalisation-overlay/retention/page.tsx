'use client';

import { useEffect, useState } from 'react';

interface Event {
  id: string;
  employeeId: string;
  program: string;
  nationalityFlag: string;
  eventType: string;
  eventDate: string;
  hireDate: string | null;
  daysFromHire: number | null;
  isEarlyAttrition: boolean;
  reasonCode: string | null;
}

const PROGRAMS = ['EMIRATISATION', 'NITAQAT', 'BAHRAINIZATION', 'OMANISATION', 'QATARISATION'];
const FLAGS = ['NATIONAL', 'EXPAT', 'MIXED'];
const TYPES = ['HIRED', 'CONFIRMED', 'RESIGNED', 'TERMINATED', 'TRANSFERRED'];

export default function RetentionPage() {
  const [items, setItems] = useState<Event[]>([]);
  const [program, setProgram] = useState('');
  const [message, setMessage] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [newProgram, setNewProgram] = useState('EMIRATISATION');
  const [flag, setFlag] = useState('NATIONAL');
  const [eventType, setEventType] = useState('HIRED');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [hireDate, setHireDate] = useState('');
  const [reasonCode, setReasonCode] = useState('');

  async function load() {
    const qs = program ? `?program=${program}` : '';
    const r = await fetch(`/api/v1/nationalisation-overlay/retention${qs}`);
    const p = await r.json();
    if (p.success) setItems(p.data ?? []);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  async function record() {
    setMessage('');
    const r = await fetch('/api/v1/nationalisation-overlay/retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record',
        employeeId,
        program: newProgram,
        nationalityFlag: flag,
        eventType,
        eventDate,
        hireDate: hireDate || undefined,
        reasonCode: reasonCode || undefined,
      }),
    });
    const p = await r.json();
    setMessage(p.success ? 'Event recorded' : p.message);
    if (p.success) {
      setEmployeeId('');
      setHireDate('');
      setReasonCode('');
      load();
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm uppercase text-slate-500">
            EPIC-16-S12 · EPIC-17-S12 · EPIC-18-S14
          </p>
          <h1 className="text-2xl font-semibold">Retention Ledger · Early-Attrition Tracker</h1>
        </header>

        {message ? <p className="text-sm text-slate-700">{message}</p> : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold">Record event</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-sm font-medium">
              Employee
              <input
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Program
              <select
                value={newProgram}
                onChange={(e) => setNewProgram(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {PROGRAMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Flag
              <select
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {FLAGS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Event type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              >
                {TYPES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Event date
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium">
              Hire date (for exits)
              <input
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm font-medium md:col-span-3">
              Reason code
              <input
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={record}
            className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Record event
          </button>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Events</h2>
            <label className="text-sm font-medium">
              Program:
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="ml-2 rounded-md border border-slate-300 px-2 py-1.5"
              >
                <option value="">All</option>
                {PROGRAMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Employee</th>
                <th>Program</th>
                <th>Flag</th>
                <th>Event</th>
                <th>Date</th>
                <th>Days from hire</th>
                <th>Early?</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="py-2 font-mono text-xs">{e.employeeId}</td>
                  <td className="text-xs">{e.program}</td>
                  <td className="text-xs">{e.nationalityFlag}</td>
                  <td className="text-xs">{e.eventType}</td>
                  <td className="text-xs">{e.eventDate.slice(0, 10)}</td>
                  <td className="text-xs">{e.daysFromHire ?? '—'}</td>
                  <td
                    className={`text-xs ${e.isEarlyAttrition ? 'text-rose-700 font-semibold' : ''}`}
                  >
                    {e.isEarlyAttrition ? 'YES' : 'no'}
                  </td>
                  <td className="text-xs">{e.reasonCode ?? '—'}</td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-xs text-slate-500">
                    No events yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
