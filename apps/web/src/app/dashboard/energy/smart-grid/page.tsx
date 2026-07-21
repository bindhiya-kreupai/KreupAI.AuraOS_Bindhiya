'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Activity, Power, PlusCircle, Trash2 } from 'lucide-react';

export default function SmartGridPage() {
  const [meters, setMeters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    facilityId: '',
    locationFacilityName: '',
    locationFacilityId: '',
    type: '',
    status: '',
    installationDate: new Date().toISOString().split('T')[0],
    manufacturer: '',
    model: '',
    firmwareVersion: '',
    connectivity: '',
    interval: 0,
    readingValue: 0,
    readingUnit: '',
    initialLoad: 0,
    initialTemp: 0,
  });

  const fetchMeters = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/energy/smart-grid/meters');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeters(data);
      }
    } catch (error) {
      console.error('Failed to fetch meters:', error);
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
      await fetch('/api/energy/smart-grid/meters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({
        facilityId: '',
        locationFacilityName: '',
        locationFacilityId: '',
        type: '',
        status: '',
        installationDate: new Date().toISOString().split('T')[0],
        manufacturer: '',
        model: '',
        firmwareVersion: '',
        connectivity: '',
        interval: 0,
        readingValue: 0,
        readingUnit: '',
        initialLoad: 0,
        initialTemp: 0,
      });
      fetchMeters();
    } catch (error) {
      console.error('Failed to create meter:', error);
    }
  };

  const deleteMeter = async (meterId: string) => {
    try {
      await fetch(`/api/energy/smart-grid/meters/${meterId}`, {
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
            <Zap className="w-6 h-6 text-indigo-500" />
            Smart Grid Management
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time monitoring of energy loads and grid stability.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4" />
          Add Smart Meter
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add New Smart Meter</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleAddMeter}
              className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh]"
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Facility Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.locationFacilityName}
                    onChange={(e) =>
                      setFormData({ ...formData, locationFacilityName: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                    placeholder="e.g. Plant A"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    <option value="electric">Electric</option>
                    <option value="water">Water</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Manufacturer
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Model
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Connectivity
                  </label>
                  <select
                    required
                    value={formData.connectivity}
                    onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="" disabled>
                      Select Connectivity
                    </option>
                    <option value="cellular">Cellular</option>
                    <option value="wifi">WiFi</option>
                    <option value="ethernet">Ethernet</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Interval (mins)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Status
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
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
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Reading Value
                  </label>
                  <input
                    required
                    type="number"
                    value={formData.readingValue}
                    onChange={(e) =>
                      setFormData({ ...formData, readingValue: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Reading Unit
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.readingUnit}
                    onChange={(e) => setFormData({ ...formData, readingUnit: e.target.value })}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold mb-2 opacity-90">Current Load</h3>
            <div className="text-4xl font-bold">4.2 MW</div>
            <div className="text-sm opacity-80 mt-1">Peak: 5.1 MW (expected at 14:00)</div>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="font-bold">Grid Stable</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-4 shrink-0">Substation Status</h3>
          <div className="flex-1 overflow-y-auto min-h-[150px] pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                Loading meters...
              </div>
            ) : meters.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>No meters found.</p>
                <p className="text-xs mt-1">Click "Add Smart Meter" to register one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {meters.map((meter) => {
                  const isWarning = meter.status === 'warning' || meter.status === 'offline';
                  const load = meter.readings?.load || '0%';
                  const temp = meter.readings?.temp || 'N/A';
                  const name =
                    meter.location?.facilityName || `Meter ${meter.meterId.substring(0, 6)}`;

                  return (
                    <div
                      key={meter.id}
                      className={`p-4 rounded-xl border relative group ${isWarning ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'}`}
                    >
                      <button
                        onClick={() => deleteMeter(meter.meterId)}
                        className="absolute top-2 right-2 p-1.5 text-rose-500 bg-rose-100 dark:bg-rose-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Meter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-sm pr-8">{name}</div>
                        <Power
                          className={`w-4 h-4 ${isWarning ? 'text-amber-500' : 'text-emerald-500'}`}
                        />
                      </div>
                      <div className="text-2xl font-bold mb-1">{load}%</div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>Temp: {temp}°C</span>
                        <span className="capitalize">{meter.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-4">Consumption Trends (Last 24h)</h3>
        <div className="h-48 flex items-end justify-between gap-1 px-4">
          {[
            30, 45, 50, 65, 80, 95, 85, 70, 60, 50, 40, 35, 30, 25, 30, 40, 55, 70, 85, 90, 80, 70,
            60, 50,
          ].map((h, i) => (
            <div
              key={i}
              className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-sm relative group"
            >
              <div
                className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400"
                style={{ height: `${h}%` }}
              ></div>
              <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded z-10">
                {h}%
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}
