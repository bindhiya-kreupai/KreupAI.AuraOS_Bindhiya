'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Wind, Battery, ArrowUpRight, PlusCircle, Trash2 } from 'lucide-react';

export default function RenewableAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Solar',
    status: 'Active',
    location: '',
    maxCapacity: 10,
    efficiency: 95,
  });

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/energy/renewable-assets');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssets(data);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/energy/renewable-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'Solar',
        status: 'Active',
        location: '',
        maxCapacity: 10,
        efficiency: 95,
      });
      fetchAssets();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      await fetch(`/api/energy/renewable-assets/${assetId}`, {
        method: 'DELETE',
      });
      fetchAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sun className="w-6 h-6 text-indigo-500" />
            Renewable Assets
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor solar panels, wind turbines, and storage batteries.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg">Add Renewable Asset</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddAsset} className="p-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Asset Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  placeholder="e.g. Solar Array 1"
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
                    <option value="Solar">Solar</option>
                    <option value="Wind">Wind</option>
                    <option value="Storage">Storage</option>
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
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Location
                </label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  placeholder="e.g. North Ridge"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Max Capacity (MW)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCapacity: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Efficiency (%)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={formData.efficiency}
                    onChange={(e) =>
                      setFormData({ ...formData, efficiency: Number(e.target.value) })
                    }
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-auto">
        {isLoading ? (
          <div className="col-span-3 py-10 text-center text-slate-500">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="col-span-3 py-10 text-center text-slate-500">
            No renewable assets found. Click "Add Asset" to generate.
          </div>
        ) : (
          assets.map((asset) => {
            const type = asset.type;
            const perf = asset.performance || {};

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
              >
                <button
                  onClick={() => deleteAsset(asset.assetId)}
                  className="absolute top-4 right-4 p-1.5 text-rose-500 bg-rose-100 dark:bg-rose-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Delete Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {type === 'Solar' && (
                  <>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sun className="w-32 h-32 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 pr-10">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                        <Sun className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
                      {perf.generating || '0 MW'}
                    </div>
                    <div className="text-sm text-emerald-500 font-bold mb-6 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" /> Generating at {perf.rate || '0%'} cap
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                        <div className="text-slate-500 text-xs">Irradiance</div>
                        <div className="font-bold">{perf.irradiance || '0'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                        <div className="text-slate-500 text-xs">Efficiency</div>
                        <div className="font-bold">{perf.efficiency || '0'}%</div>
                      </div>
                    </div>
                  </>
                )}

                {type === 'Wind' && (
                  <>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Wind className="w-32 h-32 text-cyan-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 pr-10">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 rounded-lg">
                        <Wind className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
                      {perf.generating || '0 MW'}
                    </div>
                    <div className="text-sm text-slate-500 font-bold mb-6 flex items-center gap-1">
                      {perf.msg || 'Normal operation'}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                        <div className="text-slate-500 text-xs">Wind Speed</div>
                        <div className="font-bold">{perf.speed || '0 m/s'}</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                        <div className="text-slate-500 text-xs">Turbines</div>
                        <div className="font-bold">{perf.turbines || '0/0 Active'}</div>
                      </div>
                    </div>
                  </>
                )}

                {type === 'Storage' && (
                  <>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Battery className="w-32 h-32 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-4 pr-10">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                        <Battery className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg">{asset.name}</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800 dark:text-white mb-1">
                      {perf.level || '0%'}
                    </div>
                    <div className="text-sm text-indigo-500 font-bold mb-6 flex items-center gap-1">
                      {perf.state || 'Idle'}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: perf.level || '0%' }}
                      ></div>
                    </div>
                    <div className="text-center mt-3 text-xs text-slate-500">
                      {perf.efficiency || '0'}% Efficiency / {asset.capacity?.max || '0'} MW Cap
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
