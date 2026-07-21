'use client';

import React, { useEffect, useState } from 'react';
import { Wrench, Clock, Plus, X } from 'lucide-react';

type Roster = {
  id: string;
  bay: string;
  tech: string;
  job: string;
  time: string;
  status: string;
  skill?: string | null;
};

export default function TechnicianRosteringPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    bay: '',
    tech: '',
    job: '',
    time: '',
    status: 'Pending',
    skill: '',
  });

  const loadRosters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-automotive/technician-rostering');
      const data = await res.json();
      setRosters(data.rosters || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRosters();
  }, []);

  const saveRoster = async () => {
    if (!form.bay || !form.tech || !form.job || !form.time || !form.status) {
      alert('Please fill all required fields.');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/industry-automotive/technician-rostering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      alert('Failed to save technician roster.');
      return;
    }

    setShowModal(false);
    setForm({
      bay: '',
      tech: '',
      job: '',
      time: '',
      status: 'Pending',
      skill: '',
    });

    await loadRosters();
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-500" />
            Technician Rostering
          </h1>
          <p className="text-slate-500 text-sm">
            Schedule service shifts and manage bay assignments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Roster
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Bay Schedule</h3>

            <div className="space-y-4">
              {loading && (
                <div className="text-sm text-slate-500">Loading technician roster...</div>
              )}

              {!loading && rosters.length === 0 && (
                <div className="text-center text-slate-500 py-8">No technician rosters found.</div>
              )}

              {!loading &&
                rosters.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-800 dark:text-slate-100">
                          {slot.bay}
                        </div>
                        <span className="text-slate-400">•</span>
                        <div className="text-sm font-bold text-indigo-600">{slot.tech}</div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{slot.job}</div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" /> {slot.time}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          slot.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-600'
                            : slot.status === 'In Progress'
                              ? 'bg-indigo-100 text-indigo-600'
                              : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Technician Availability</h3>

            {rosters.length === 0 && (
              <div className="text-sm text-slate-500">No technician data found.</div>
            )}

            <div className="space-y-3">
              {rosters.map((tech) => {
                const names = tech.tech.split(' ');
                const initials = `${names[0]?.[0] || ''}${names[1]?.[0] || ''}`;

                return (
                  <div key={tech.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{tech.tech}</div>
                        <div className="text-xs text-slate-500">{tech.skill || 'Technician'}</div>
                      </div>
                    </div>

                    <div
                      className={`w-2 h-2 rounded-full ${
                        tech.status === 'Completed' || tech.status === 'Pending'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Technician Roster</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Bay"
                value={form.bay}
                onChange={(e) => setForm({ ...form, bay: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Technician name"
                value={form.tech}
                onChange={(e) => setForm({ ...form, tech: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Job"
                value={form.job}
                onChange={(e) => setForm({ ...form, job: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Skill"
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveRoster}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Roster'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
