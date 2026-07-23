'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, AlertOctagon, PlusCircle, Trash2 } from 'lucide-react';

export default function WaterConservationPage() {
  const [meters, setMeters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    locationName: '',
    type: 'Main',
    status: 'active',
    installationDate: new Date().toISOString().split('T')[0],
    pressure: 60,
  });

  const fetchMeters = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/energy/water/meters');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeters(data);
      }
    } catch (error) {
      console.error('Failed to fetch water meters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleAddMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/energy/water/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({
        locationName: '',
        type: 'Main',
        status: 'active',
        installationDate: new Date().toISOString().split('T')[0],
        pressure: 60,
      });
      fetchMeters();
    } catch (error) {
      console.error('Failed to create meter:', error);
    }
  };

  const deleteMeter = async (meterId: string) => {
    try {
      await fetch(`/api/energy/water/meters/${meterId}`, {
        method: 'DELETE',
      });
      fetchMeters();
    } catch (error) {
      console.error('Failed to delete meter:', error);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="w-6 h-6 text-indigo-500" />
            Water Conservation
          </h1>
          <p className="text-slate-500 text-sm">Monitor usage and detect leaks in real-time.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4" />
          Add Water Meter
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add Water Meter</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddMeter} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Zone / Location Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  placeholder="e.g. Zone A"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="Main">Main</option>
                    <option value="Sub-meter">Sub-meter</option>
                    <option value="Irrigation">Irrigation</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="Leak Suspected">Leak Suspected</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Install Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Pressure (PSI)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.pressure}
                    onChange={(e) => setFormData({ ...formData, pressure: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Save Meter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Daily Usage</div>
          <div className="text-3xl font-bold text-indigo-600">12.5 kL</div>
          <div className="text-xs text-emerald-500 font-bold mt-1">↓ 5% vs last week</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Weekly Goal</div>
          <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">100 kL</div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Recycled Water</div>
          <div className="text-3xl font-bold text-emerald-600">3.2 kL</div>
          <div className="text-xs text-slate-400 mt-1">25% of total usage</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Alerts</div>
          <div className="text-3xl font-bold text-rose-600 flex items-center gap-2">
            {meters.filter((m) => m.status === 'Leak Suspected').length}{' '}
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="text-xs text-slate-400 mt-1">Leak detected in zones</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col flex-1 min-h-0">
        <h3 className="font-bold text-lg mb-4 shrink-0">Zone Consumption Analysis</h3>
        <div className="space-y-4 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              Loading data...
            </div>
          ) : meters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <p>No meter readings found.</p>
              <p className="text-xs mt-1">Click "Add Water Meter" to register one.</p>
            </div>
          ) : (
            meters.map((meter) => {
              const zone = meter.location?.name || 'Unknown Zone';
              const pressure = meter.readings?.pressure || 0;
              const percent = Math.min((pressure / 100) * 100, 100);
              const status = meter.status;

              return (
                <div
                  key={meter.id}
                  className="relative group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <button
                    onClick={() => deleteMeter(meter.meterId)}
                    className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 text-rose-500 bg-rose-100 dark:bg-rose-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Reading"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex justify-between text-sm mb-1 pr-10">
                    <span className="font-bold">{zone}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          status === 'Leak Suspected' ? 'text-rose-500' : 'text-slate-500'
                        }`}
                      >
                        {status}
                      </span>
                      <span className="font-mono">{pressure} PSI</span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mr-10"
                    style={{ width: 'calc(100% - 2.5rem)' }}
                  >
                    <div
                      className={`h-full ${
                        status === 'Leak Suspected'
                          ? 'bg-rose-500'
                          : status === 'Optimized'
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
