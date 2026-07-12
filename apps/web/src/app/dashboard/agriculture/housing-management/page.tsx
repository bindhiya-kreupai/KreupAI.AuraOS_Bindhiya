'use client';

import React from 'react';
import { Home, Users, Bed, AlertCircle } from 'lucide-react';
import { useAgriculture } from '../hooks/useAgriculture';
import { LoadingOverlay } from '../components/LoadingSpinner';

export default function HousingManagementPage() {
  const { housingFacilities, housingAssignments, loading } = useAgriculture();

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading housing management..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" />
            Housing Management
          </h1>
          <p className="text-slate-500 text-sm">Assign beds and manage worker accommodation.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-bold border border-amber-100 dark:border-amber-900/30">
          <Bed className="w-4 h-4" /> {housingFacilities.length} Facilities
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {housingFacilities.length === 0 ? (
          <div className="lg:col-span-3 text-sm text-slate-500">
            No housing facilities configured yet.
          </div>
        ) : (
          housingFacilities.map((facility) => {
            const occupancy = facility.occupiedBeds ?? 0;
            const capacity = facility.totalBeds ?? 0;
            const occupancyPercent = capacity ? Math.round((occupancy / capacity) * 100) : 0;

            return (
              <div
                key={facility.facilityId || facility.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${facility.status === 'active' ? 'bg-emerald-100 text-emerald-600' : facility.status === 'under_maintenance' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {facility.status || 'Unknown'}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1">{facility.facilityName}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {facility.address || 'No address available'}
                </p>

                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Bed className="w-4 h-4 text-slate-400" />
                  <span>
                    {occupancy}/{capacity} Beds Occupied
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${occupancyPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-bold">Assignments:</span> {housingAssignments.length} active
          check-ins tracked.
        </p>
      </div>
    </div>
  );
}
