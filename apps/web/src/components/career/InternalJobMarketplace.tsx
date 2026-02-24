/**
 * @module InternalJobMarketplace
 * @description ESS Internal Job Marketplace — browse and filter internal openings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Users,
  Building2,
  Star,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface InternalJob {
  id: string;
  title: string;
  department: string;
  location: string;
  hiringManager: string;
  type: 'vertical' | 'horizontal' | 'lateral';
  level: string;
  salaryRange?: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  preferredSkills: string[];
  openings: number;
  postedDate: string;
  deadline: string;
  isRemote: boolean;
  relocationAssistance: boolean;
  matchScore?: number;
}

interface InternalJobMarketplaceProps {
  onApply: (job: InternalJob) => void;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_JOBS: InternalJob[] = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer — Platform',
    department: 'Engineering',
    location: 'San Francisco, CA',
    hiringManager: 'Sarah Chen',
    type: 'vertical',
    level: 'Senior (L5)',
    salaryRange: { min: 160000, max: 200000, currency: 'USD' },
    description:
      'Lead platform infrastructure projects including microservices migration and developer tooling improvements.',
    requirements: [
      '5+ years software engineering',
      'Distributed systems experience',
      'BS in Computer Science or equivalent',
    ],
    preferredSkills: ['Kubernetes', 'Go', 'gRPC', 'Terraform'],
    openings: 2,
    postedDate: '2026-02-10',
    deadline: '2026-03-15',
    isRemote: true,
    relocationAssistance: false,
    matchScore: 92,
  },
  {
    id: 'job-002',
    title: 'Engineering Manager — Growth',
    department: 'Engineering',
    location: 'New York, NY',
    hiringManager: 'Michael Torres',
    type: 'vertical',
    level: 'Manager (M1)',
    salaryRange: { min: 180000, max: 230000, currency: 'USD' },
    description:
      'Manage a team of 6-8 engineers focused on user acquisition and retention features.',
    requirements: [
      '3+ years people management',
      '6+ years software engineering',
      'Track record of delivering growth features',
    ],
    preferredSkills: ['A/B Testing', 'React', 'Python', 'Team Leadership'],
    openings: 1,
    postedDate: '2026-02-05',
    deadline: '2026-03-10',
    isRemote: false,
    relocationAssistance: true,
    matchScore: 78,
  },
  {
    id: 'job-003',
    title: 'Product Manager — Analytics',
    department: 'Product',
    location: 'Austin, TX',
    hiringManager: 'Lisa Park',
    type: 'horizontal',
    level: 'Mid-Senior (P4)',
    description:
      'Own the analytics product roadmap including dashboards, reporting, and data visualization.',
    requirements: [
      '3+ years product management',
      'Strong analytical skills',
      'Experience with data products',
    ],
    preferredSkills: ['SQL', 'Tableau', 'User Research', 'Agile'],
    openings: 1,
    postedDate: '2026-02-15',
    deadline: '2026-03-20',
    isRemote: true,
    relocationAssistance: false,
    matchScore: 65,
  },
  {
    id: 'job-004',
    title: 'Staff Engineer — Security',
    department: 'Engineering',
    location: 'Seattle, WA',
    hiringManager: 'David Kim',
    type: 'vertical',
    level: 'Staff (L6)',
    salaryRange: { min: 200000, max: 260000, currency: 'USD' },
    description: 'Define and implement security architecture across all platform services.',
    requirements: [
      '8+ years engineering',
      'Security domain expertise',
      'Experience with SOC2/ISO compliance',
    ],
    preferredSkills: ['AppSec', 'Cloud Security', 'Zero Trust', 'Cryptography'],
    openings: 1,
    postedDate: '2026-02-18',
    deadline: '2026-03-25',
    isRemote: false,
    relocationAssistance: true,
    matchScore: 55,
  },
  {
    id: 'job-005',
    title: 'UX Designer — Mobile',
    department: 'Design',
    location: 'Remote',
    hiringManager: 'Ana Garcia',
    type: 'horizontal',
    level: 'Senior (IC4)',
    description:
      'Lead mobile app design for iOS and Android platforms with focus on employee self-service.',
    requirements: ['4+ years UX design', 'Mobile design expertise', 'Strong portfolio'],
    preferredSkills: ['Figma', 'Prototyping', 'User Testing', 'Design Systems'],
    openings: 1,
    postedDate: '2026-02-20',
    deadline: '2026-03-30',
    isRemote: true,
    relocationAssistance: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<InternalJob['type'], { label: string; icon: LucideIcon; color: string }> = {
  vertical: { label: 'Promotion', icon: ArrowUpRight, color: 'text-neural-mint bg-neural-mint/10' },
  horizontal: {
    label: 'Department Move',
    icon: ChevronRight,
    color: 'text-celestial-indigo bg-celestial-indigo/10',
  },
  lateral: {
    label: 'Lateral Move',
    icon: ChevronRight,
    color: 'text-sunset-amber bg-sunset-amber/10',
  },
};

function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function formatSalary(range: InternalJob['salaryRange']): string {
  if (!range) return '';
  return `$${(range.min / 1000).toFixed(0)}K–$${(range.max / 1000).toFixed(0)}K`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const InternalJobMarketplace: React.FC<InternalJobMarketplaceProps> = ({ onApply }) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const departments = useMemo(() => {
    const depts = new Set(MOCK_JOBS.map((j) => j.department));
    return ['all', ...Array.from(depts)];
  }, []);

  const filtered = useMemo(() => {
    let jobs = MOCK_JOBS;
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.preferredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (deptFilter !== 'all') jobs = jobs.filter((j) => j.department === deptFilter);
    if (typeFilter !== 'all') jobs = jobs.filter((j) => j.type === typeFilter);
    return jobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [search, deptFilter, typeFilter]);

  const toggleSave = (id: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-silver-mist pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, department, skill..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === 'all' ? 'All Departments' : d}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo"
        >
          <option value="all">All Types</option>
          <option value="vertical">Promotion</option>
          <option value="horizontal">Department Move</option>
          <option value="lateral">Lateral Move</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-[10px] text-silver-mist">
        {filtered.length} open position{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Job Cards */}
      <div className="space-y-3">
        {filtered.map((job) => {
          const typeMeta = TYPE_META[job.type];
          const TypeIcon = typeMeta.icon;
          const daysLeft = daysUntil(job.deadline);
          const isSaved = savedJobs.has(job.id);

          return (
            <div
              key={job.id}
              className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/30 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title + badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-ink-black dark:text-pearl">
                      {job.title}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${typeMeta.color}`}
                    >
                      <TypeIcon className="w-2.5 h-2.5" />
                      {typeMeta.label}
                    </span>
                    {job.matchScore && job.matchScore >= 70 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-quantum-rose bg-quantum-rose/10">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {job.matchScore}% Match
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-silver-mist mb-2">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                      {job.isRemote && <Globe className="w-2.5 h-2.5 text-neural-mint" />}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {job.level}
                    </span>
                    {job.salaryRange && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(job.salaryRange)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {job.openings} opening{job.openings !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-xs text-silver-mist line-clamp-2 mb-2">{job.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.preferredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full bg-pearl/60 dark:bg-deep-cosmos/30 text-[9px] font-medium text-twilight dark:text-silver-mist"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => toggleSave(job.id)}
                    className="p-1.5 rounded-lg hover:bg-pearl dark:hover:bg-deep-cosmos transition-colors"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-celestial-indigo" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-silver-mist" />
                    )}
                  </button>
                  <button
                    onClick={() => onApply(job)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                  >
                    Apply
                  </button>
                  <div className="flex items-center gap-1 text-[9px]">
                    <Clock
                      className={`w-2.5 h-2.5 ${daysLeft <= 7 ? 'text-coral-alert' : 'text-silver-mist'}`}
                    />
                    <span
                      className={
                        daysLeft <= 7 ? 'text-coral-alert font-semibold' : 'text-silver-mist'
                      }
                    >
                      {daysLeft}d left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-10 h-10 text-silver-mist/30 mx-auto mb-3" />
          <p className="text-sm text-silver-mist">No positions match your search.</p>
        </div>
      )}
    </div>
  );
};

export default InternalJobMarketplace;
