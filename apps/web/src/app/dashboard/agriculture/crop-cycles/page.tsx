'use client';

import React, { useEffect, useState } from 'react';
import { Sprout, CloudRain, BarChart3, Plus, X } from 'lucide-react';

type CropCycle = {
  id: string;
  crop: string;
  field: string;
  stage: string;
  harvest: string;
  progress: number;
};

export default function CropCyclesPage() {
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    crop: '',
    field: '',
    stage: 'Emergence',
    harvest: '',
    progress: '',
  });

  const loadCycles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-agriculture/crop-cycles');
      const data = await res.json();
      setCycles(data.cycles || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const saveCycle = async () => {
    if (!form.crop || !form.field || !form.stage || !form.harvest || !form.progress) {
      alert('Please fill all fields.');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/industry-agriculture/crop-cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, progress: Number(form.progress) }),
    });

    setSaving(false);

    if (!res.ok) {
      alert('Failed to save crop cycle.');
      return;
    }

    setShowModal(false);
    setForm({
      crop: '',
      field: '',
      stage: 'Emergence',
      harvest: '',
      progress: '',
    });

    await loadCycles();
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-indigo-500" />
            Crop Cycles
          </h1>
          <p className="text-slate-500 text-sm">Monitor growth stages and harvest windows.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Crop Cycle
        </button>
      </div>

      {loading && <div className="text-sm text-slate-500">Loading crop cycles...</div>}

      {!loading && cycles.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          No crop cycles found.
        </div>
      )}

      {!loading && cycles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {cycles.map((crop) => (
            <div
              key={crop.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{crop.crop}</h3>
                  <div className="text-sm text-slate-500">{crop.field}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Est. Harvest</span>
                  <span
                    className={`font-bold ${crop.harvest === 'Now' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {crop.harvest}
                  </span>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold text-indigo-600">{crop.stage}</span>
                <span className="text-slate-500">{crop.progress}%</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(crop.progress, 100)}%` }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600">
                  <CloudRain className="w-4 h-4" /> Irrigation Log
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600">
                  <BarChart3 className="w-4 h-4" /> Yield Est.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Crop Cycle</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Crop name"
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Field"
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value })}
              >
                <option value="Emergence">Emergence</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturation">Maturation</option>
                <option value="Harvesting">Harvesting</option>
              </select>

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Harvest window"
                value={form.harvest}
                onChange={(e) => setForm({ ...form, harvest: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Progress %"
                value={form.progress}
                onChange={(e) => setForm({ ...form, progress: e.target.value })}
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveCycle}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
