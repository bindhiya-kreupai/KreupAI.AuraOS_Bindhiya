'use client';

import React from 'react';
import {
  Monitor,
  Smartphone,
  Headphones,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  Watch,
} from 'lucide-react';
import { useRemoteWork } from '@/app/dashboard/remote-work/hooks/useRemoteWork';

export default function EquipmentTrackingPage() {
  const { employees, loading, error } = useRemoteWork();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  // Flattening and status tracking
  const allAssets = employees.flatMap((emp) =>
    emp.equipment.map((eq) => ({
      ...eq,
      assignedTo: emp.employeeName,
      location: emp.location,
    }))
  );

  const stats = {
    total: allAssets.length,
    inUse: allAssets.filter((a) => a.status === 'assigned').length,
    available: allAssets.filter((a) => a.status === 'available').length,
    maintenance: allAssets.filter((a) => a.status === 'maintenance').length,
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('laptop')) return Monitor;
    if (t.includes('phone')) return Smartphone;
    if (t.includes('headset')) return Headphones;
    return Watch;
  };

  return (
    <div className="space-y-6 pb-10 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-indigo-500" />
            Equipment Tracking
          </h1>
          <p className="text-slate-500 text-sm">Inventory and assignment of remote work assets.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
          + Assign Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total Assets</div>
          <div className="text-2xl font-black text-indigo-600">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">In Use</div>
          <div className="text-2xl font-black text-emerald-600">{stats.inUse}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Available</div>
          <div className="text-2xl font-black text-slate-600">{stats.available}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-1">Maintenance</div>
          <div className="text-2xl font-black text-amber-500">{stats.maintenance}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-950/50">
          <h3 className="font-bold text-sm text-slate-500 uppercase">Asset Inventory</h3>
          <div className="flex gap-2 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Good Condition
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div> Repair Needed
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[500px]">
          {allAssets.map((asset, i) => {
            const Icon = getIcon(asset.equipmentType);
            return (
              <div
                key={asset.equipmentId || i}
                className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    {asset.equipmentType}
                  </div>
                  <div className="text-xs text-slate-500">S/N: {asset.serialNumber}</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {asset.assignedTo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 pl-6 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {asset.location}
                  </div>
                </div>

                <div className="w-32 flex items-center">
                  {asset.status === 'assigned' || asset.status === 'available' ? (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">
                      <CheckCircle className="w-3 h-3" /> {asset.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-xs font-bold border border-amber-100 dark:border-amber-900/50">
                      <AlertCircle className="w-3 h-3" /> {asset.status}
                    </span>
                  )}
                </div>

                <button className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Details
                </button>
              </div>
            );
          })}
          {allAssets.length === 0 && (
            <div className="text-center py-10 text-slate-400 italic">No assets registered.</div>
          )}
        </div>
      </div>
    </div>
  );
}
