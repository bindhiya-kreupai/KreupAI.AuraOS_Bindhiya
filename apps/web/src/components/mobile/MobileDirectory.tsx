/**
 * @module MobileDirectory
 * @description Mobile employee directory — debounced search, alphabetical section list,
 *              quick contact actions, filters, favorites, org chart (Sec 15.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Star,
  Users,
  Building,
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DirectoryEntry {
  id: string;
  name: string;
  firstName: string;
  designation: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  avatarInitials: string;
  avatarColor: string;
  isFavorite: boolean;
}

// ── Avatar colors for consistent assignment ──────────────────────────────────
const AVATAR_COLORS = ['bg-amber-500', 'bg-teal-500', 'bg-blue-500', 'bg-cyan-500', 'bg-pink-500', 'bg-rose-500', 'bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-cyan-600'];

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileDirectory() {
  const [rawQuery, setRawQuery] = useState('');
  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<DirectoryEntry | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const fetchDirectory = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/directory');
      const json = await res.json();
      const list = json.data || [];
      setDirectory(list.map((e: any, idx: number) => {
        const name = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim();
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: e.id || String(idx),
          name,
          firstName: e.firstName || name.split(' ')[0],
          designation: e.designation || e.jobTitle || e.position || '',
          department: e.department || e.departmentName || '',
          location: e.location || e.city || '',
          email: e.email || '',
          phone: e.phone || e.phoneNumber || '',
          avatarInitials: initials,
          avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          isFavorite: e.isFavorite ?? false,
        };
      }));
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchDirectory(); }, [fetchDirectory]);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setQuery(rawQuery), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [rawQuery]);

  const departments = useMemo(
    () => ['all', ...Array.from(new Set(directory.map((e) => e.department).filter(Boolean))).sort()],
    [directory]
  );
  const locations = useMemo(
    () => ['all', ...Array.from(new Set(directory.map((e) => e.location).filter(Boolean))).sort()],
    [directory]
  );

  const filtered = useMemo(() => {
    let results = directory;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== 'all') results = results.filter((e) => e.department === deptFilter);
    if (locationFilter !== 'all') results = results.filter((e) => e.location === locationFilter);
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [directory, query, deptFilter, locationFilter]);

  const favorites = useMemo(() => directory.filter((e) => e.isFavorite), [directory]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map: Record<string, DirectoryEntry[]> = {};
    filtered.forEach((e) => {
      const letter = e.name[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(e);
    });
    return map;
  }, [filtered]);

  const letters = Object.keys(grouped).sort();

  const toggleFavorite = (id: string) => {
    setDirectory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Directory</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Search by name, email, role..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
            className={`p-2.5 rounded-xl border transition-all ${
              deptFilter !== 'all' || locationFilter !== 'all'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-gray-100 border-transparent text-gray-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {departments.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDeptFilter(d)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      deptFilter === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {d === 'all' ? 'All Depts' : d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Location</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {locations.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocationFilter(l)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      locationFilter === l
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {l === 'all' ? 'All Locations' : l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites */}
        {!query && favorites.length > 0 && (
          <div className="px-4 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              Favorites
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {favorites.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmployee(e)}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${e.avatarColor} flex items-center justify-center`}
                  >
                    <span className="text-white font-semibold text-sm">{e.avatarInitials}</span>
                  </div>
                  <p className="text-xs text-gray-700 text-center max-w-12 truncate">
                    {e.firstName}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total count */}
        <p className="px-4 pt-3 text-xs text-gray-400">{filtered.length} employees</p>

        {/* Alpha sections */}
        {letters.map((letter) => (
          <div key={letter}>
            <div className="px-4 py-1.5 bg-gray-50 sticky top-0 z-10">
              <span className="text-xs font-bold text-gray-400">{letter}</span>
            </div>
            {grouped[letter].map((emp) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50 last:border-0 text-left"
              >
                <div
                  className={`w-10 h-10 rounded-full ${emp.avatarColor} flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-sm font-semibold">{emp.avatarInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {emp.designation} · {emp.department}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(emp.id);
                    }}
                    className="p-1"
                  >
                    <Star
                      className={`w-4 h-4 ${emp.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Users className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No employees found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Profile Flyout */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-full ${selectedEmployee.avatarColor} flex items-center justify-center`}
                >
                  <span className="text-white text-lg font-bold">
                    {selectedEmployee.avatarInitials}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedEmployee.name}</h3>
                  <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-gray-400" />
                {selectedEmployee.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {selectedEmployee.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {selectedEmployee.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {selectedEmployee.phone}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1.5 py-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Phone className="w-5 h-5" />
                <span className="text-xs font-medium">Call</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 py-3 bg-blue-50 rounded-xl text-blue-600">
                <Mail className="w-5 h-5" />
                <span className="text-xs font-medium">Email</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 py-3 bg-violet-50 rounded-xl text-violet-600">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-medium">Message</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
              className="w-full mt-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700"
            >
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileDirectory;
