'use client';

import React, { useEffect, useState } from 'react';
import { Users, Tractor, Globe, X } from 'lucide-react';

type Crew = {
  id: string;
  name: string;
  location: string;
  size: number;
  origin: string;
  status: string;
};

export default function SeasonalLaborPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    location: '',
    size: '',
    origin: 'Local',
    status: 'Active',
  });

  const loadCrews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-agriculture/seasonal-labor/crews');
      const data = await res.json();
      setCrews(data.crews || []);
    } catch (err) {
      console.error('Failed to load seasonal crews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrews();
  }, []);

  const saveCrew = async () => {
    if (!form.name || !form.location || !form.size || !form.origin || !form.status) {
      alert('Please fill all required fields.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/industry-agriculture/seasonal-labor/crews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, size: Number(form.size) }),
      });

      if (!res.ok) {
        alert('Failed to recruit crew.');
        return;
      }

      setShowModal(false);
      setForm({
        name: '',
        location: '',
        size: '',
        origin: 'Local',
        status: 'Active',
      });

      await loadCrews();
    } catch (err) {
      console.error('Failed to save crew:', err);
    } finally {
      setSaving(false);
    }
  };

  const totalHeadcount = crews.reduce((sum, crew) => sum + crew.size, 0);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tractor className="w-6 h-6 text-indigo-500" />
            Seasonal Labor
          </h1>
          <p className="text-slate-500 text-sm">Recruit and manage harvest crews.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Users className="w-4 h-4" /> Recruit Crew
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4">Active Crews</h3>

          <div className="space-y-4">
            {loading && <div className="text-sm text-slate-500">Loading seasonal crews...</div>}

            {!loading && crews.length === 0 && (
              <div className="text-center text-slate-500 py-8">No seasonal crews found.</div>
            )}

            {!loading &&
              crews.map((crew) => (
                <div
                  key={crew.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {crew.name}
                      </div>

                      {crew.origin === 'H-2A Visa' && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Visa
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {crew.location} • {crew.size} workers
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold mt-2 md:mt-0 w-fit ${
                      crew.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : crew.status === 'Break'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {crew.status}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Total Headcount</h3>
            <div className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
              {totalHeadcount}
            </div>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/70">
              Live count from backend data
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Compliance Checks</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-300">I-9 Verification</span>
                <span className="font-bold text-amber-600">Pending</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-300">Safety Training</span>
                <span className="font-bold text-emerald-600">Connected</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-300">Heat Stress Protocol</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recruit Crew</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Crew name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Crew size"
                type="number"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
              >
                <option value="Local">Local</option>
                <option value="H-2A Visa">H-2A Visa</option>
                <option value="Mixed">Mixed</option>
              </select>

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Break">Break</option>
                <option value="Finished">Finished</option>
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
                onClick={saveCrew}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Crew'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
