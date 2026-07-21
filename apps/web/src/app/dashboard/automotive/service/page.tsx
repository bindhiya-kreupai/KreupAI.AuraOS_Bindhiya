'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Wrench, Car, Settings, Plus, X } from 'lucide-react';

type ServiceBay = {
  id: string;
  name: string;
  status: string;
  car: string | null;
  technician: string | null;
};

type ServiceTechnician = {
  id: string;
  name: string;
  level: string;
  efficiency: number;
  hours: number;
  status: string;
};

export default function ServicePage() {
  const [bays, setBays] = useState<ServiceBay[]>([]);
  const [technicians, setTechnicians] = useState<ServiceTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showBayModal, setShowBayModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);

  const [bayForm, setBayForm] = useState({
    name: '',
    status: 'Available',
    car: '',
    technician: '',
  });

  const [technicianForm, setTechnicianForm] = useState({
    name: '',
    level: '',
    efficiency: '',
    hours: '',
    status: 'Working',
  });

  const loadServiceData = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/industry-automotive/service');

      if (!response.ok) {
        throw new Error('Failed to load service data');
      }

      const data = await response.json();

      setBays(data.bays || []);
      setTechnicians(data.technicians || []);
    } catch (error) {
      console.error('Failed to load automotive service data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServiceData();
  }, []);

  const saveBay = async () => {
    if (!bayForm.name.trim() || !bayForm.status) {
      alert('Please enter the bay name and status.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/industry-automotive/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bay',
          name: bayForm.name.trim(),
          status: bayForm.status,
          car: bayForm.car.trim() || null,
          technician: bayForm.technician.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save service bay');
      }

      setShowBayModal(false);

      setBayForm({
        name: '',
        status: 'Available',
        car: '',
        technician: '',
      });

      await loadServiceData();
    } catch (error) {
      console.error('Failed to save service bay:', error);
      alert('Failed to save service bay.');
    } finally {
      setSaving(false);
    }
  };

  const saveTechnician = async () => {
    if (
      !technicianForm.name.trim() ||
      !technicianForm.level.trim() ||
      technicianForm.efficiency === '' ||
      technicianForm.hours === ''
    ) {
      alert('Please fill all technician fields.');
      return;
    }

    const efficiency = Number(technicianForm.efficiency);
    const hours = Number(technicianForm.hours);

    if (Number.isNaN(efficiency) || efficiency < 0 || Number.isNaN(hours) || hours < 0) {
      alert('Efficiency and hours must be valid positive numbers.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch('/api/industry-automotive/service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'technician',
          name: technicianForm.name.trim(),
          level: technicianForm.level.trim(),
          efficiency,
          hours,
          status: technicianForm.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save service technician');
      }

      setShowTechnicianModal(false);

      setTechnicianForm({
        name: '',
        level: '',
        efficiency: '',
        hours: '',
        status: 'Working',
      });

      await loadServiceData();
    } catch (error) {
      console.error('Failed to save technician:', error);
      alert('Failed to save technician.');
    } finally {
      setSaving(false);
    }
  };

  const occupiedVehicles = useMemo(() => {
    return bays.filter((bay) => bay.status === 'Occupied').length;
  }, [bays]);

  const bayStatusColor = (status: string) => {
    if (status === 'Occupied') {
      return 'bg-emerald-500';
    }

    if (status === 'Maintenance') {
      return 'bg-rose-500';
    }

    return 'bg-slate-300';
  };

  const technicianStatusStyle = (status: string) => {
    if (status === 'Working') {
      return 'bg-emerald-100 text-emerald-600';
    }

    if (status === 'Break') {
      return 'bg-amber-100 text-amber-600';
    }

    if (status === 'Training') {
      return 'bg-indigo-100 text-indigo-600';
    }

    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            Service Center Management
          </h1>

          <p className="text-slate-500 text-sm">
            Technician checks, service bay allocation, and efficiency tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
            <Car className="w-4 h-4" />
            {occupiedVehicles} Vehicles In Service
          </div>

          <button
            type="button"
            onClick={() => setShowBayModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Bay
          </button>

          <button
            type="button"
            onClick={() => setShowTechnicianModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Technician
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500">
          Loading service center data...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold mb-4">Service Bays</h3>

            {bays.length === 0 && (
              <div className="text-sm text-slate-500 py-6 text-center">No service bays found.</div>
            )}

            <div className="space-y-2">
              {bays.map((bay) => (
                <div
                  key={bay.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{bay.name}</span>

                    <div className={`w-2 h-2 rounded-full ${bayStatusColor(bay.status)}`} />
                  </div>

                  <div className="text-xs text-slate-500 font-bold">{bay.status}</div>

                  {bay.status === 'Occupied' && (
                    <div className="text-xs text-indigo-500 mt-1">
                      {bay.car || 'No vehicle'} • {bay.technician || 'No technician'}
                    </div>
                  )}

                  {bay.status !== 'Occupied' && (bay.car || bay.technician) && (
                    <div className="text-xs text-slate-400 mt-1">
                      {bay.car || '-'} • {bay.technician || '-'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="font-bold text-lg mb-4">Technician Efficiency</h3>

            {technicians.length === 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-500">
                No service technicians found.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {technicians.map((technician) => (
                <div
                  key={technician.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all relative overflow-hidden group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {technician.name
                        .split(' ')
                        .filter(Boolean)
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">
                        {technician.name}
                      </h3>

                      <div className="text-xs font-bold text-slate-500">{technician.level}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <div className="text-xs text-slate-400 uppercase font-bold">Efficiency</div>

                      <div
                        className={`text-lg font-bold ${
                          technician.efficiency >= 100 ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {technician.efficiency}%
                      </div>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <div className="text-xs text-slate-400 uppercase font-bold">Hours</div>

                      <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {technician.hours}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${technicianStatusStyle(
                        technician.status
                      )}`}
                    >
                      {technician.status}
                    </span>

                    <button
                      type="button"
                      className="text-xs font-bold text-indigo-500 group-hover:underline"
                    >
                      View Jobs
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6 flex items-start gap-3">
              <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />

              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">
                  Tool Calibration
                </h3>

                <p className="text-xs text-indigo-800 dark:text-indigo-400 mt-1">
                  Service center data is now loaded from the backend.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Service Bay</h2>

              <button type="button" onClick={() => setShowBayModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Bay name"
                value={bayForm.name}
                onChange={(event) =>
                  setBayForm({
                    ...bayForm,
                    name: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <select
                value={bayForm.status}
                onChange={(event) =>
                  setBayForm({
                    ...bayForm,
                    status: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <input
                type="text"
                placeholder="Vehicle"
                value={bayForm.car}
                onChange={(event) =>
                  setBayForm({
                    ...bayForm,
                    car: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <input
                type="text"
                placeholder="Technician"
                value={bayForm.technician}
                onChange={(event) =>
                  setBayForm({
                    ...bayForm,
                    technician: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBayModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveBay}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Bay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTechnicianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Service Technician</h2>

              <button type="button" onClick={() => setShowTechnicianModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Technician name"
                value={technicianForm.name}
                onChange={(event) =>
                  setTechnicianForm({
                    ...technicianForm,
                    name: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <input
                type="text"
                placeholder="Level"
                value={technicianForm.level}
                onChange={(event) =>
                  setTechnicianForm({
                    ...technicianForm,
                    level: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <input
                type="number"
                min="0"
                placeholder="Efficiency %"
                value={technicianForm.efficiency}
                onChange={(event) =>
                  setTechnicianForm({
                    ...technicianForm,
                    efficiency: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={technicianForm.hours}
                onChange={(event) =>
                  setTechnicianForm({
                    ...technicianForm,
                    hours: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              />

              <select
                value={technicianForm.status}
                onChange={(event) =>
                  setTechnicianForm({
                    ...technicianForm,
                    status: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 bg-transparent"
              >
                <option value="Working">Working</option>
                <option value="Break">Break</option>
                <option value="Training">Training</option>
                <option value="Off">Off</option>
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTechnicianModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveTechnician}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Technician'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
