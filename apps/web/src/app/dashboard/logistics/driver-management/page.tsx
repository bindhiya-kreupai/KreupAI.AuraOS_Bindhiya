'use client';

import React, { useEffect, useState } from 'react';
import { Truck, X } from 'lucide-react';

type Driver = {
  id: string;
  name: string;
  route: string;
  vehicle: string;
  status: string;
  eta?: string | null;
  license?: string | null;
};

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    route: '',
    vehicle: '',
    status: 'Available',
    eta: '',
    license: '',
  });

  const loadDrivers = async () => {
    setLoading(true);
    const res = await fetch('/api/industry-logistics/drivers');
    const data = await res.json();
    setDrivers(data.drivers ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const createDriver = async () => {
    if (!form.name || !form.route || !form.vehicle || !form.status) {
      alert('Please fill name, route, vehicle and status.');
      return;
    }

    setSaving(true);

    await fetch('/api/industry-logistics/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setForm({
      name: '',
      route: '',
      vehicle: '',
      status: 'Available',
      eta: '',
      license: '',
    });

    setShowModal(false);
    setSaving(false);
    await loadDrivers();
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-500" />
            Driver Management
          </h1>
          <p className="text-slate-500 text-sm">
            Track driver schedules, licenses, and assignments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
        >
          Add Driver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Active Assignments</h3>

            <div className="space-y-4">
              {loading && <div className="text-sm text-slate-500">Loading drivers...</div>}

              {!loading && drivers.length === 0 && (
                <div className="text-sm text-slate-500">No drivers found.</div>
              )}

              {!loading &&
                drivers.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                        {trip.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold">{trip.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                          <Truck className="w-3 h-3" /> {trip.vehicle} • {trip.route}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">ETA</div>
                        <div className="font-bold text-sm">{trip.eta || '-'}</div>
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-xs font-bold w-24 text-center ${
                          trip.status === 'In Transit'
                            ? 'bg-indigo-100 text-indigo-600'
                            : trip.status === 'Rest Break'
                              ? 'bg-amber-100 text-amber-600'
                              : trip.status === 'Delayed'
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">License Expirations</h3>

            <div className="space-y-3">
              {drivers.length === 0 && (
                <div className="text-sm text-slate-500">No license data found.</div>
              )}

              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div>
                    <div className="font-bold text-sm">{driver.name}</div>
                    <div className="text-xs text-slate-500">
                      {driver.license || 'No license added'}
                    </div>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 rounded bg-amber-100 text-amber-600">
                    Active
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Driver Availability</h3>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-500">Available Now</span>
              <span className="text-lg font-bold text-emerald-600">
                {drivers.filter((d) => d.status === 'Available').length}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-500">In Transit</span>
              <span className="text-lg font-bold text-indigo-600">
                {drivers.filter((d) => d.status === 'In Transit').length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Rest Period</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {drivers.filter((d) => d.status === 'Rest Break').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Driver</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Driver name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Route"
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="Vehicle"
                value={form.vehicle}
                onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              />

              <select
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="In Transit">In Transit</option>
                <option value="Rest Break">Rest Break</option>
                <option value="Delayed">Delayed</option>
              </select>

              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="ETA"
                value={form.eta}
                onChange={(e) => setForm({ ...form, eta: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-4 py-2 bg-transparent"
                placeholder="License"
                value={form.license}
                onChange={(e) => setForm({ ...form, license: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border font-bold"
              >
                Cancel
              </button>
              <button
                onClick={createDriver}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Driver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
