'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Phone, Copy, Share2, Check, Loader2, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  dept: string;
  initials: string;
}

export default function TeamDirectoryPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchTeam = useCallback(
    async (query: string) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: '1', limit: '60' });
        if (query.trim()) params.set('search', query.trim());
        const res = await fetch(`/api/v1/employees?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();
        const rows: any[] = Array.isArray(json?.data) ? json.data : [];
        setMembers(
          rows.map((e) => {
            const first = e.firstName ?? '';
            const last = e.lastName ?? '';
            const name = e.name ?? `${first} ${last}`.trim() ?? 'Unknown';
            return {
              id: e.id,
              name,
              role: e.role ?? e.jobProfile?.title ?? '—',
              email: e.email ?? e.personalEmail ?? '',
              phone: e.mobileNumber ?? e.phone ?? '',
              dept: e.dept ?? e.department?.name ?? '',
              initials:
                `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || name.charAt(0).toUpperCase(),
            };
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team directory');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (authLoading || !user) return;
    const handle = setTimeout(() => {
      void fetchTeam(search);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, authLoading, user, fetchTeam]);

  const handleCopy = async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch {
      setError('Unable to copy to clipboard');
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-500" />
            Team Directory
          </h1>
          <p className="text-slate-500 text-sm">Find and connect with your colleagues.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 flex items-center gap-2 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, email..."
            className="bg-transparent outline-none text-sm py-2 w-full md:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-500/30 px-4 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No colleagues found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:shadow-xl transition-all relative"
              >
                {member.dept && (
                  <div className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 max-w-[8rem] truncate">
                    {member.dept}
                  </div>
                )}

                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {member.initials}
                  </span>
                </div>

                <h3 className="font-bold text-lg">{member.name}</h3>
                <div className="text-sm text-indigo-600 font-medium mb-4">{member.role}</div>

                <div className="w-full space-y-3">
                  {member.email && (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-slate-500 overflow-hidden">
                        <Mail className="w-4 h-4 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(member.email, `email-${member.id}`)}
                        className="text-slate-400 hover:text-indigo-600"
                        aria-label="Copy email"
                      >
                        {copied === `email-${member.id}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-4 h-4 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(member.phone, `phone-${member.id}`)}
                        className="text-slate-400 hover:text-indigo-600"
                        aria-label="Copy phone"
                      >
                        {copied === `phone-${member.id}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {member.email && (
                  <div className="mt-6 flex gap-2 w-full">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
