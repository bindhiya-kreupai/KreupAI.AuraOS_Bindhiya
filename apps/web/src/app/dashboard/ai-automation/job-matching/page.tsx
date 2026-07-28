// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
'use client';

import React, { useState, useEffect } from 'react';
import { GitMerge, User, Briefcase, Check, X } from 'lucide-react';
import { jobMatching } from '@/lib/services/ai-automation-client';

export default function JobMatchingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const result = await jobMatching.getMatches();
      if (result.success) {
        const list = result.data?.matches || [];
        setMatches(list);
        setSummary(result.data?.summary || null);
        setSelected(list[0] || null);
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileName = selected?.name || 'No employee selected';
  const profileSkills = selected?.skillsMatched?.length
    ? selected.skillsMatched
    : selected?.skillsMissing?.slice(0, 4) || [];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <GitMerge className="w-6 h-6 text-indigo-500" />
            Internal Mobility Matcher
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Match existing employees to open requisitions
            {summary ? ` · ${summary.matchesFound} matches · ${summary.activeJobs} open roles` : ''}
            .
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-silver-mist">Loading matches…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-lg font-bold text-ink-black dark:text-pearl">{profileName}</h2>
              <p className="text-sm text-silver-mist">
                {selected?.department || 'Select a match to preview profile'}
              </p>
              <div className="mt-6 w-full text-left space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-silver-mist uppercase mb-2">
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profileSkills.length ? (
                      profileSkills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded font-medium"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-silver-mist">No skill overlap yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Open Opportunities
            </h2>

            {!matches.length && (
              <p className="text-sm text-silver-mist">
                No matches yet. Add open job requisitions and employee certifications to generate
                fit scores.
              </p>
            )}

            {matches.map((match, i) => (
              <button
                key={`${match.jobId}-${match.candidateId}-${i}`}
                type="button"
                onClick={() => setSelected(match)}
                className="w-full text-left bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm relative overflow-hidden hover:border-indigo-300 transition-colors"
              >
                {match.action === 'Recommended' && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                    Top Pick
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {match.role || match.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">
                        {match.department || 'Department'}
                      </span>
                      {match.name && (
                        <span className="text-xs text-silver-mist">· {match.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${(match.match_score ?? match.matchScore) > 90 ? 'text-emerald-500' : (match.match_score ?? match.matchScore) > 70 ? 'text-amber-500' : 'text-rose-500'}`}
                    >
                      {match.match_score ?? match.matchScore}%
                    </div>
                    <div className="text-[10px] text-silver-mist uppercase font-bold">
                      Fit Score
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Strengths
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {(match.skillsMatched || []).length ? (
                        (match.skillsMatched || []).map((s: string) => <li key={s}>{s}</li>)
                      ) : (
                        <li>No overlapping skills listed</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-500 mb-2 flex items-center gap-1">
                      <X className="w-3 h-3" /> Gaps
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc list-inside">
                      {(match.skillsMissing || []).length ? (
                        (match.skillsMissing || []).map((s: string) => <li key={s}>{s}</li>)
                      ) : (
                        <li>No gaps listed</li>
                      )}
                    </ul>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
