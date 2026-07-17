'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  useHousingFacilities,
  useHousingAssignments,
  useHousingInspections,
  useCreateHousingFacility,
  useUpdateHousingFacility,
  useDeleteHousingFacility,
} from '../hooks/queries';
import { useDebounce } from '../hooks/useDebounce';
import { FacilityModal } from '../components/FacilityModal';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import type { HousingFacility } from '../types';

export default function HousingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    router.replace(`${pathname}?${createQueryString('search', debouncedSearch)}`, {
      scroll: false,
    });
  }, [debouncedSearch, pathname, router, createQueryString]);

  const queryParams = debouncedSearch ? { query: debouncedSearch } : {};

  const {
    data: housingFacilities = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useHousingFacilities(queryParams);
  const { data: housingAssignments = [], isLoading: loadingAssignments } = useHousingAssignments();
  const { data: housingInspections = [], isLoading: loadingInspections } = useHousingInspections();

  const { mutateAsync: createFacility } = useCreateHousingFacility();
  const { mutateAsync: updateFacility } = useUpdateHousingFacility();
  const { mutateAsync: deleteFacility } = useDeleteHousingFacility();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<HousingFacility | null>(null);

  const visibleFacilities = useMemo(() => {
    let filtered = housingFacilities;
    if (debouncedSearch.trim()) {
      const lowerQuery = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.facilityName.toLowerCase().includes(lowerQuery) ||
          (f.address || '').toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [housingFacilities, debouncedSearch]);

  const handleExportCSV = () => {
    if (visibleFacilities.length === 0) {
      toast.warning('No facilities to export');
      return;
    }

    const headers = ['Facility ID', 'Name', 'Type', 'Address', 'Total Beds', 'Status'];
    const csvRows = [headers.join(',')];

    for (const facility of visibleFacilities) {
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
    toast.success('Exported facilities successfully');
  };

  const handleSaveFacility = async (data: Partial<HousingFacility>) => {
    try {
      if (editingFacility) {
        await updateFacility({ facilityId: editingFacility.facilityId, updates: data });
        toast.success('Facility updated successfully');
      } else {
        await createFacility({
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
        toast.success('Facility added successfully');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Failed to save facility. Please try again.');
    }
  };

  const handleDeleteFacility = async (facility: HousingFacility) => {
    if (confirm(`Are you sure you want to delete ${facility.facilityName}?`)) {
      try {
        await deleteFacility(facility.facilityId);
        toast.success(`${facility.facilityName} has been deleted.`);
      } catch (e) {
        toast.error('Failed to delete facility');
      }
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
    <div className="space-y-4 pb-6 min-h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
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
            <Bed className="w-4 h-4" />{' '}
            {isLoading ? <Skeleton className="h-4 w-6 inline-block" /> : housingFacilities.length}{' '}
            Facilities
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
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Inspections</h3>
                <div className="text-xs text-emerald-500 font-bold">
                  {loadingInspections ? (
                    <Skeleton className="h-3 w-16" />
                  ) : (
                    `${housingInspections.length} Completed`
                  )}
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
                  {loadingAssignments ? (
                    <Skeleton className="h-3 w-16" />
                  ) : (
                    `${housingAssignments.length} Current`
                  )}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900"
              >
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : isError ? (
            <ErrorState
              title="Failed to load housing facilities"
              message={error?.message || 'Something went wrong while fetching housing data.'}
              onRetry={() => refetch()}
            />
          ) : visibleFacilities.length === 0 ? (
            <EmptyState
              title="No housing facilities found"
              description={
                debouncedSearch
                  ? 'Try adjusting your search query.'
                  : 'Add your first housing facility to get started.'
              }
              action={
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  <Plus className="w-4 h-4" /> Add Facility
                </button>
              }
            />
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
                      onClick={() => handleDeleteFacility(facility)}
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

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-fit">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-500" /> Maintenance & Safety
          </h3>
          <div className="space-y-4">
            {loadingInspections ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : housingInspections.length === 0 ? (
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
    </div>
  );
}
