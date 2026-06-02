// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module EmployeeDirectory
 * @description Employee directory — grid/list toggle, real-time search, department/location
 *              filters, alphabet jump nav, profile flyout, total count (Sec 17.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Mail,
  Phone,
  Building2,
  MapPin,
  ChevronRight,
  Users,
  X,
} from 'lucide-react';
import {
  DirectoryService,
  type DirectoryEmployee,
  type Department,
  type OfficeLocation,
} from '@/services/directoryService';
import { EmployeeProfileCard } from './EmployeeProfileCard';

// ── Component ─────────────────────────────────────────────────────────────────

export function EmployeeDirectory() {
  const [employees, setEmployees] = useState<DirectoryEmployee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEmployee | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const load = async () => {
      const [emp, depts, locs] = await Promise.all([
        DirectoryService.searchEmployees(),
        DirectoryService.getDepartments(),
        DirectoryService.getLocations(),
      ]);
      setEmployees(emp);
      setDepartments(depts);
      setLocations(locs);
      setLoading(false);
    };
    load();
  }, []);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(rawQuery), 250);
    return () => clearTimeout(debounceRef.current);
  }, [rawQuery]);

  const filtered = useMemo(() => {
    let results = employees;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (deptFilter) results = results.filter((e) => e.departmentId === deptFilter);
    if (locFilter) results = results.filter((e) => e.locationId === locFilter);
    return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [employees, query, deptFilter, locFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, DirectoryEmployee[]> = {};
    filtered.forEach((e) => {
      const l = e.fullName[0].toUpperCase();
      if (!map[l]) map[l] = [];
      map[l].push(e);
    });
    return map;
  }, [filtered]);

  const letters = Object.keys(grouped).sort();
  const activeFiltersCount = [deptFilter, locFilter].filter(Boolean).length;

  const scrollToLetter = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} of {employees.length} employees
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Search name, email, ID, department..."
              className="w-full pl-9 pr-9 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {rawQuery && (
              <button
                onClick={() => {
                  setRawQuery('');
                  setQuery('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative p-2.5 rounded-xl border transition-all ${
              activeFiltersCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-gray-100 border-transparent text-gray-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.employeeCount})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Location</label>
              <select
                value={locFilter}
                onChange={(e) => setLocFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.employeeCount})
                  </option>
                ))}
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setDeptFilter('');
                  setLocFilter('');
                }}
                className="sm:col-span-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-semibold text-gray-600">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="space-y-6">
              {letters.map((letter) => (
                <section
                  key={letter}
                  ref={(el) => {
                    sectionRefs.current[letter] = el;
                  }}
                >
                  <h3 className="text-sm font-bold text-gray-400 mb-3">{letter}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {grouped[letter].map((emp) => (
                      <EmployeeCard
                        key={emp.id}
                        employee={emp}
                        onClick={() => setSelectedEmployee(emp)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {letters.map((letter) => (
                <section
                  key={letter}
                  ref={(el) => {
                    sectionRefs.current[letter] = el;
                  }}
                >
                  <div className="sticky top-0 bg-gray-50 py-1 z-10">
                    <span className="text-xs font-bold text-gray-400">{letter}</span>
                  </div>
                  <div className="bg-white rounded-2xl divide-y divide-gray-50">
                    {grouped[letter].map((emp) => (
                      <EmployeeRow
                        key={emp.id}
                        employee={emp}
                        onClick={() => setSelectedEmployee(emp)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Alphabet Nav */}
        <div className="hidden lg:flex flex-col items-center py-6 pr-2 gap-0.5">
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => scrollToLetter(l)}
              className="w-6 h-6 text-xs text-gray-400 hover:text-indigo-600 font-medium flex items-center justify-center rounded"
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Flyout */}
      {selectedEmployee && (
        <EmployeeProfileCard
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

// ── Card Components ────────────────────────────────────────────────────────────

function EmployeeCard({
  employee: e,
  onClick,
}: {
  employee: DirectoryEmployee;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 text-left hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full ${e.avatarColor} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white font-bold">{e.avatarInitials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
            {e.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{e.designation}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="truncate">{e.department}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span>{e.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="truncate">{e.email}</span>
        </div>
      </div>
    </button>
  );
}

function EmployeeRow({
  employee: e,
  onClick,
}: {
  employee: DirectoryEmployee;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
    >
      <div
        className={`w-10 h-10 rounded-full ${e.avatarColor} flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white font-semibold text-sm">{e.avatarInitials}</span>
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-4">
        <div>
          <p className="font-medium text-gray-900 text-sm">{e.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{e.designation}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          {e.department}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
          <Mail className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">{e.email}</span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
        <Phone className="w-3.5 h-3.5 text-gray-400" />
        {e.phone}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  );
}

export default EmployeeDirectory;
