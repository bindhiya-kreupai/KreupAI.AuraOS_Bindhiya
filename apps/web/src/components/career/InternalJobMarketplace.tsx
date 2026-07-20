/**
 * @module InternalJobMarketplace
 * @description ESS Internal Job Marketplace — browse and filter internal openings
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MobilityOpportunityService } from '@/app/dashboard/career/services';
import type { MobilityOpportunity } from '@/app/dashboard/career/types';

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

// ── Mapping ───────────────────────────────────────────────────────────────────

function mapType(t: MobilityOpportunity['opportunityType']): InternalJob['type'] {
  if (t === 'vertical') return 'vertical';
  if (t === 'lateral') return 'lateral';
  return 'horizontal';
}

function mapOpportunity(opp: MobilityOpportunity): InternalJob {
  return {
    id: opp.opportunityId,
    title: opp.jobTitle,
    department: opp.department,
    location: opp.location,
    hiringManager: opp.hiringManager ?? '',
    type: mapType(opp.opportunityType),
    level: opp.positionId ?? '',
    salaryRange: opp.salaryRange
      ? {
          min: opp.salaryRange.minimum,
          max: opp.salaryRange.maximum,
          currency: opp.salaryRange.currency,
        }
      : undefined,
    description: opp.description ?? '',
    requirements: (opp.qualifications ?? []).map((q) => q.requirement),
    preferredSkills: opp.preferredSkills ?? [],
    openings: opp.numberOfOpenings ?? 1,
    postedDate: opp.postedDate ? new Date(opp.postedDate).toISOString() : new Date().toISOString(),
    deadline: opp.applicationDeadline
      ? new Date(opp.applicationDeadline).toISOString()
      : new Date().toISOString(),
    isRemote: /remote/i.test(opp.location ?? ''),
    relocationAssistance: opp.relocationAssistance ?? false,
  };
}

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
  const [allJobs, setAllJobs] = useState<InternalJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const opps = await MobilityOpportunityService.getOpenOpportunities();
      setAllJobs((Array.isArray(opps) ? opps : []).map(mapOpportunity));
    } catch (error) {
      console.error('Failed to load internal opportunities', error);
      toast.error('Failed to load internal opportunities');
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const departments = useMemo(() => {
    const depts = new Set(allJobs.map((j) => j.department));
    return ['all', ...Array.from(depts)];
  }, [allJobs]);

  const filtered = useMemo(() => {
    let jobs = allJobs;
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
    return [...jobs].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [allJobs, search, deptFilter, typeFilter]);

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
      {loading ? (
        <div className="flex items-center gap-2 text-[10px] text-silver-mist">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading opportunities...
        </div>
      ) : (
        <p className="text-[10px] text-silver-mist">
          {filtered.length} open position{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

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
