'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Search, MapPin, Briefcase, Linkedin, Mail, Loader2, UserPlus } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { AlumniDirectoryService } from '../services';
import { ToastContainer } from '../components/Toast';
import type { AlumniProfile, Toast } from '../types';

// Alumni profiles carry a derived `yearRange` string from the API for display.
type DirectoryProfile = AlumniProfile & { yearRange?: string };

export default function AlumniDirectoryPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, message }]);
  }, []);
  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AlumniDirectoryService.getAllAlumniProfiles();
      setProfiles((data as DirectoryProfile[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load alumni');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      [p.fullName, p.lastDesignation, p.lastDepartment, p.currentCompany, p.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [profiles, search]);

  const handleConnect = useCallback(
    async (profile: DirectoryProfile) => {
      if (!user?.employeeId) {
        pushToast('error', 'You must be signed in to connect.');
        return;
      }
      const target = profile.employeeId || profile.alumniId;
      setConnecting(profile.alumniId);
      try {
        await AlumniDirectoryService.createConnection(
          user.employeeId,
          target,
          `Connection request from the alumni directory.`
        );
        pushToast('success', `Connection request sent to ${profile.fullName}.`);
      } catch (e) {
        pushToast('error', e instanceof Error ? e.message : 'Failed to send connection request.');
      } finally {
        setConnecting(null);
      }
    },
    [user?.employeeId, pushToast]
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <ToastContainer toasts={toasts} onClose={closeToast} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Alumni Directory
          </h1>
          <p className="text-slate-500 text-sm">Find and connect with former colleagues.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alumni..."
            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading || authLoading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => void loadProfiles()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          No alumni found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map((alum) => (
            <div
              key={alum.alumniId}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center text-2xl font-bold text-slate-400">
                {(alum.fullName || '?')[0]}
              </div>
              <h3 className="font-bold text-lg mb-1">{alum.fullName || 'Unknown'}</h3>
              {alum.yearRange ? (
                <p className="text-xs text-indigo-500 font-bold mb-3">{alum.yearRange}</p>
              ) : null}

              <div className="space-y-2 w-full mb-6">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[180px]">
                    {alum.lastDesignation || 'Alumnus'}
                    {alum.lastDepartment ? ` · ${alum.lastDepartment}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{alum.currentLocation || alum.lastLocation || '—'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void handleConnect(alum)}
                  disabled={connecting === alum.alumniId}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1"
                >
                  {connecting === alum.alumniId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Connect
                </button>
                <a
                  href={
                    alum.linkedInProfile
                      ? alum.linkedInProfile
                      : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
                          alum.fullName || ''
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  aria-label={`Open LinkedIn for ${alum.fullName}`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={alum.email ? `mailto:${alum.email}` : '#'}
                  className={`p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${
                    alum.email ? '' : 'pointer-events-none opacity-50'
                  }`}
                  aria-label={`Email ${alum.fullName}`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
