'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Bed,
  ClipboardCheck,
  AlertCircle,
  Droplets,
  Download,
  Plus,
  Search,
} from 'lucide-react';
import { useAgriculture } from '../hooks/useAgriculture';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { FacilityModal } from '../components/FacilityModal';
import type { HousingFacility } from '../types';

export default function HousingPage() {
  const {
    housingFacilities,
    housingAssignments,
    housingInspections,
    loading,
    toasts,
    removeToast,
    addToast,
    createHousingFacility,
    updateHousingFacility,
    deleteHousingFacility,
  } = useAgriculture();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<HousingFacility | null>(null);

  const visibleFacilities = useMemo(() => {
    let filtered = housingFacilities;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.facilityName.toLowerCase().includes(lowerQuery) ||
          (f.address || '').toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [housingFacilities, searchQuery]);

  const handleExportCSV = () => {
    if (housingFacilities.length === 0) {
      addToast({ type: 'warning', message: 'No facilities to export' });
      return;
    }

    const headers = ['Facility ID', 'Name', 'Type', 'Address', 'Total Beds', 'Status'];
    const csvRows = [headers.join(',')];

    for (const facility of housingFacilities) {
      const row = [
        facility.facilityId,
        `"${facility.facilityName}"`,
        facility.facilityType,
        `"${facility.address || ''}"`,
        facility.totalBeds,
        facility.status,
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `housing_facilities_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: 'Exported facilities successfully' });
  };

  const handleSaveFacility = async (data: Partial<HousingFacility>) => {
    if (editingFacility) {
      await updateHousingFacility(editingFacility.facilityId, data);
    } else {
      await createHousingFacility({
        ...data,
        farm: 'Main Farm',
        farmId: 'F-001',
        occupiedBeds: 0,
        availableBeds: data.totalBeds || 10,
        totalRooms: Math.ceil((data.totalBeds || 10) / 2),
        bedsPerRoom: 2,
        amenities: [],
        hasKitchen: true,
        hasBathroom: true,
        hasLaundry: false,
        hasCommonArea: true,
        hasCooling: true,
        hasHeating: true,
        hasWifi: false,
        waterSupply: 'municipal',
        powerSupply: 'grid',
        sewerSystem: 'municipal',
        complianceStatus: 'compliant',
        violations: [],
        maintenanceSchedule: [],
        openWorkOrders: 0,
        monthlyCost: 1000,
        costPerBed: 100,
        currentOccupants: [],
        photos: [],
        documents: [],
        createdDate: new Date(),
        lastUpdatedDate: new Date(),
      });
    }
  };

  const openAddModal = () => {
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  const openEditModal = (facility: HousingFacility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {loading && <LoadingOverlay message="Loading housing data..." />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" />
            Housing Management
          </h1>
          <p className="text-slate-500 text-sm">
            Dormitory allocation, health inspections, and utility tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
            <Bed className="w-4 h-4" /> {housingFacilities.length} Facilities
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Facility
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search facilities by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Inspections</h3>
                <div className="text-xs text-emerald-500 font-bold">
                  {housingInspections.length} Completed
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Assignments</h3>
                <div className="text-xs text-rose-500 font-bold">
                  {housingAssignments.length} Current
                </div>
              </div>
            </div>
          </div>

          {visibleFacilities.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              No housing facilities found.
            </div>
          ) : (
            visibleFacilities.map((facility) => (
              <div
                key={facility.facilityId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-slate-200 dark:border-slate-700">
                    {facility.facilityName?.[0] || 'H'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {facility.facilityName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1">
                      {facility.address || 'No address provided'} • {facility.facilityType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                      {facility.currentOccupants?.length ?? 0}/{facility.totalBeds ?? '–'}
                    </div>
                    <div className="text-xs text-slate-400">Current Occupants</div>
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${facility.status === 'active' ? 'bg-emerald-100 text-emerald-600' : facility.status === 'under_maintenance' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600'}`}
                  >
                    {facility.status || 'Unknown'}
                  </span>

                  <div className="flex gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
                    <button
                      onClick={() => openEditModal(facility)}
                      className="text-xs font-bold text-indigo-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${facility.facilityName}?`)) {
                          try {
                            await deleteHousingFacility(facility.facilityId);
                          } catch (e) {
                            addToast({ type: 'error', message: 'Failed to delete facility' });
                          }
                        }
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-500" /> Maintenance & Safety
          </h3>
          <div className="space-y-4">
            {housingInspections.length === 0 ? (
              <div className="text-sm text-slate-500">No recent inspections.</div>
            ) : (
              housingInspections.slice(0, 3).map((inspection) => (
                <div
                  key={inspection.inspectionId}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      {inspection.facilityName || inspection.facilityId || 'Inspection'}
                    </h4>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${inspection.status === 'pass' ? 'bg-emerald-100 text-emerald-600' : inspection.status === 'fail' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}
                    >
                      {inspection.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {inspection.inspectorName || 'Unknown inspector'} •{' '}
                    {inspection.inspectionDate
                      ? new Date(inspection.inspectionDate).toLocaleDateString()
                      : 'No date'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFacility}
        facility={editingFacility}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
