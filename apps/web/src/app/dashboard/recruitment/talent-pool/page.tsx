'use client';

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import type { CandidateApplication } from '../types';
import { Users, Search, Filter, MapPin, Briefcase, Mail, Loader2 } from 'lucide-react';

function getCandidateName(candidate: CandidateApplication, index: number): string {
  const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
  return fullName || (candidate as any).candidateName || `Candidate ${index + 1}`;
}

function getCandidateTitle(candidate: CandidateApplication): string {
  return candidate.currentTitle || candidate.jobTitle || candidate.currentStage || 'N/A';
}

function getStatusLabel(candidate: CandidateApplication): string {
  if (candidate.status === 'hired') {
    return 'Hired';
  }

  if (candidate.status === 'rejected') {
    return 'Do Not Contact';
  }

  if (
    candidate.status === 'offer' ||
    candidate.status === 'interview' ||
    candidate.status === 'screening' ||
    candidate.status === 'phone_screen'
  ) {
    return 'Considering';
  }

  return 'Available';
}

export default function TalentPoolPage() {
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTalentPool();
  }, []);

  const fetchTalentPool = async () => {
    try {
      setLoading(true);
      const data = await CandidateApplicationService.getApplications();
      setCandidates(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-silver-mist font-medium">Loading talent pool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Talent Pool
          </h1>
          <p className="text-slate-500 text-sm">
            Database of potential candidates for future opportunities.
          </p>
        </div>
        <button
          onClick={() => {
            const name = prompt('Candidate name:');
            if (!name?.trim()) return;
            const email = prompt('Email address:');
            if (!email?.trim()) return;
            const skills = prompt('Skills (comma-separated):', '');
            const location = prompt('Location:', '');
            try {
              const key = 'auraos.recruitment.talentPool.v1';
              const existing = JSON.parse(localStorage.getItem(key) || '[]');
              existing.push({
                id: `talent-${Date.now()}`,
                name,
                email,
                skills: (skills || '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                location: location || 'Unknown',
                addedAt: new Date().toISOString(),
              });
              localStorage.setItem(key, JSON.stringify(existing));
              alert(
                `Added ${name} to talent pool. Stored locally — page refresh required to see them.`
              );
              if (typeof window !== 'undefined') window.location.reload();
            } catch (e: any) {
              alert(`Could not save: ${e?.message || e}`);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          + Add Candidate
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or location..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 font-bold text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Candidate List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-6">
          {candidates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                No candidates in talent pool
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Add candidates to build your talent pipeline.
              </p>
            </div>
          )}
          {candidates.map((person, i) => {
            const name = getCandidateName(person, i);
            const title = getCandidateTitle(person);
            const loc = person.location || 'Unknown';
            const skills = person.skills || [];
            const statusLabel = getStatusLabel(person);

            return (
              <div
                key={person.id || i}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all group cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center font-bold text-indigo-500 text-lg">
                    {name.charAt(0)}
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      statusLabel === 'Available'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : statusLabel === 'Do Not Contact'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : statusLabel === 'Hired'
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}
                  >
                    {statusLabel}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{name}</h3>
                <div className="text-sm text-indigo-600 font-medium mb-3">{title}</div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <MapPin className="w-3 h-3" /> {loc}
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.slice(0, 4).map((skill: string, j: number) => (
                      <span
                        key={j}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </button>
                  <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
