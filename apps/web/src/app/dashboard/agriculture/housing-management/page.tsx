'use client';

import React, { useEffect, useState } from 'react';
import { Home, Bed, AlertCircle, Plus, X } from 'lucide-react';

type HousingUnit = {
  id: string;
  unit: string;
  occupied: number;
  capacity: number;
  status: string;
  type: string;
};

export default function HousingManagementPage() {
  const [units, setUnits] = useState<HousingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    unit: '',
    occupied: '',
    capacity: '',
    status: 'Good',
    type: 'Dormitory',
  });

  const loadUnits = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-agriculture/housing/units');
      const data = await res.json();
      setUnits(data.units || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const saveUnit = async () => {
    if (!form.unit || !form.occupied || !form.capacity || !form.status || !form.type) {
      alert('Please fill all fields.');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/industry-agriculture/housing/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unit: form.unit,
        occupied: Number(form.occupied),
        capacity: Number(form.capacity),
        status: form.status,
        type: form.type,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert('Failed to save housing unit.');
      return;
    }

    setShowModal(false);
    setForm({
      unit: '',
      occupied: '',
      capacity: '',
      status: 'Good',
      type: 'Dormitory',
    });

    await loadUnits();
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" />
            Housing Management
          </h1>
          <p className="text-slate-500 text-sm">Assign beds and manage worker accommodation.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Housing Unit
        </button>
      </div>

      {loading && <div className="text-sm text-slate-500">Loading housing units...</div>}

      {!loading && units.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
          No housing units found.
        </div>
      )}

      {!loading && units.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map((house) => (
            <div
              key={house.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                  <Home className="w-6 h-6" />
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    house.status === 'Good'
                      ? 'bg-emerald-100 text-emerald-600'
                      : house.status === 'Vacant'
                        ? 'bg-slate-100 text-slate-500'
                        : house.status === 'Closed'
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {house.status}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-1">{house.unit}</h3>
              <p className="text-sm text-slate-500 mb-4">{house.type}</p>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Bed className="w-4 h-4 text-slate-400" />
                <span>
                  {house.occupied}/{house.capacity} Beds Occupied
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${house.status === 'Vacant' || house.status === 'Closed' ? 'bg-transparent' : 'bg-indigo-500'}`}
                  style={{
                    width: `${house.capacity > 0 ? Math.min((house.occupied / house.capacity) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-bold">Inspection Status:</span> Housing data is now loaded from
          backend.
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Housing Unit</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Unit name"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Occupied beds"
                value={form.occupied}
                onChange={(e) => setForm({ ...form, occupied: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                type="number"
                placeholder="Total capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Good">Good</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Vacant">Vacant</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Dormitory">Dormitory</option>
                <option value="Private">Private</option>
                <option value="Mixed">Mixed</option>
                <option value="Temporary">Temporary</option>
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
                onClick={saveUnit}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Unit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
