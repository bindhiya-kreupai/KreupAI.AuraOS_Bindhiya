'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Loader2, Search } from 'lucide-react';
import { AICandidateMatching } from '@/components/recruitment/AICandidateMatching';
import type { RankedCandidate, JobContext } from '@/components/recruitment/AICandidateMatching';
import { APIClient } from '@/lib/api-client';

interface JobRecord {
  id: string;
  title?: string;
  department?: string;
  location?: string;
}

interface MatchRecord {
  candidateId: string;
  name: string;
  email: string;
  location?: string;
  skills: string[];
  matchedSkills: string[];
  matchScore: number;
  alreadyApplied: boolean;
  applicationCount: number;
}

interface MatchResponse {
  data?: {
    jobTitle?: string;
    requiredSkills: string[];
    matches: MatchRecord[];
  };
}

const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

function recommendationFor(score: number): RankedCandidate['recommendation'] {
  if (score >= 80) return 'STRONG_YES';
  if (score >= 60) return 'YES';
  if (score >= 40) return 'MAYBE';
  return 'NO';
}

function toRankedCandidate(m: MatchRecord, index: number, required: string[]): RankedCandidate {
  const missing = required.filter(
    (s) => !m.matchedSkills.some((ms) => ms.toLowerCase() === s.toLowerCase())
  );
  return {
    id: m.candidateId,
    name: m.name,
    email: m.email,
    phone: '',
    location: m.location ?? '',
    currentRole: '',
    currentCompany: '',
    experienceYears: 0,
    education: '',
    appliedDate: '',
    avatarInitials: initials(m.name),
    matchScore: m.matchScore,
    ranking: index + 1,
    skillMatch: m.matchScore,
    experienceMatch: 0,
    educationMatch: 0,
    cultureFit: 0,
    matchDetails: [
      {
        category: 'Required Skills',
        weight: 1,
        score: m.matchScore,
        matches: m.matchedSkills,
        gaps: missing,
      },
    ],
    pros: m.matchedSkills.map((s) => `Has required skill: ${s}`),
    cons: missing.map((s) => `Missing skill: ${s}`),
    recommendation: recommendationFor(m.matchScore),
    interviewQuestions: [],
    topSkills: m.matchedSkills,
    missingSkills: missing,
  };
}

export default function AICandidateMatchingPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [job, setJob] = useState<JobContext | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await APIClient.get<{ data?: JobRecord[] }>('/v1/recruitment/jobs', {
          limit: 100,
        });
        const list = res.data ?? [];
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job postings');
      } finally {
        setLoadingJobs(false);
      }
    })();
  }, []);

  const handleMatch = useCallback(async () => {
    if (!selectedJobId) return;
    setMatching(true);
    setError(null);
    try {
      const requiredSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await APIClient.post<MatchResponse>('/v1/recruitment/candidates/match', {
        jobId: selectedJobId,
        ...(requiredSkills.length > 0 ? { skills: requiredSkills } : {}),
        limit: 25,
      });
      const data = res.data;
      const matches = data?.matches ?? [];
      const required = data?.requiredSkills ?? requiredSkills;
      const selected = jobs.find((j) => j.id === selectedJobId);
      setCandidates(matches.map((m, i) => toRankedCandidate(m, i, required)));
      setJob({
        id: selectedJobId,
        title: data?.jobTitle ?? selected?.title ?? 'Position',
        department: selected?.department ?? '—',
        location: selected?.location ?? '—',
        requiredSkills: required,
        preferredSkills: [],
        experienceMin: 0,
        experienceMax: 0,
        education: '',
      });
      setRan(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to match candidates');
    } finally {
      setMatching(false);
    }
  }, [selectedJobId, skillsInput, jobs]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-celestial-indigo" />
        <div>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">AI Candidate Matching</p>
          <p className="text-[9px] text-silver-mist">
            Ranked candidates with AI-powered match scores and recommendations
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 sm:flex-row sm:items-end">
        <label className="flex-1 text-[11px] font-medium text-silver-mist">
          Job posting
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            disabled={loadingJobs}
            className="mt-1 w-full rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2 text-[12px] text-ink-black dark:text-pearl"
          >
            {jobs.length === 0 && <option value="">No job postings available</option>}
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title ?? 'Untitled'} {j.department ? `— ${j.department}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-[11px] font-medium text-silver-mist">
          Required skills (optional, comma-separated)
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="react, typescript, node"
            className="mt-1 w-full rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2 text-[12px] text-ink-black dark:text-pearl"
          />
        </label>
        <button
          onClick={handleMatch}
          disabled={matching || !selectedJobId}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-celestial-indigo px-4 py-2 text-[11px] font-bold text-white disabled:opacity-50"
        >
          {matching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Match Candidates
        </button>
      </div>

      {error && (
        <div
          className="rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Matching Dashboard */}
      {job && ran && candidates.length > 0 && (
        <AICandidateMatching candidates={candidates} job={job} />
      )}

      {ran && !matching && candidates.length === 0 && (
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-8 text-center text-[12px] text-silver-mist">
          No matching candidates found for the selected job and skills.
        </div>
      )}
    </div>
  );
}
