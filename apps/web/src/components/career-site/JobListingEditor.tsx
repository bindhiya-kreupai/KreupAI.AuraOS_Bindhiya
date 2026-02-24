/**
 * @module JobListingEditor
 * @description Edit and manage job listings shown on the career site — toggle
 *              visibility, reorder, edit display details, and set featured jobs
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Briefcase,
  Eye,
  EyeOff,
  Star,
  Edit3,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
  GripVertical,
  Building2,
  Globe,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface CareerJobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-Time, Part-Time, Contract, etc.
  mode: string; // Remote, Hybrid, Onsite
  experienceLevel: string;
  salaryRange?: { min: number; max: number; currency: string; display: boolean };
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  benefits: string[];
  applicationCount: number;
  viewCount: number;
  publishedDate?: string;
  expiryDate?: string;
  isVisible: boolean;
  isFeatured: boolean;
  order: number;
  externalBoards: string[];
}

interface JobListingEditorProps {
  listings: CareerJobListing[];
  onChange: (listings: CareerJobListing[]) => void;
  onEditJob?: (jobId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(amount);

const MODE_CONFIG: Record<string, { color: string; bg: string }> = {
  Remote: { color: 'text-neural-mint', bg: 'bg-neural-mint/10' },
  Hybrid: { color: 'text-celestial-indigo', bg: 'bg-celestial-indigo/10' },
  Onsite: { color: 'text-sunset-amber', bg: 'bg-sunset-amber/10' },
};

// ── Component ────────────────────────────────────────────────────────────────────

export const JobListingEditor: React.FC<JobListingEditorProps> = ({
  listings,
  onChange,
  onEditJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(listings.map((l) => l.department))).sort(),
    [listings]
  );

  const filtered = useMemo(() => {
    let result = [...listings].sort((a, b) => a.order - b.order);
    if (departmentFilter) {
      result = result.filter((l) => l.department === departmentFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.department.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, departmentFilter, searchQuery]);

  const visibleCount = useMemo(() => listings.filter((l) => l.isVisible).length, [listings]);

  const featuredCount = useMemo(() => listings.filter((l) => l.isFeatured).length, [listings]);

  const toggleVisibility = useCallback(
    (id: string) => {
      onChange(listings.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l)));
    },
    [listings, onChange]
  );

  const toggleFeatured = useCallback(
    (id: string) => {
      onChange(listings.map((l) => (l.id === id ? { ...l, isFeatured: !l.isFeatured } : l)));
    },
    [listings, onChange]
  );

  const moveUp = useCallback(
    (id: string) => {
      const sorted = [...listings].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l.id === id);
      if (idx <= 0) return;
      const updated = [...sorted];
      const temp = updated[idx].order;
      updated[idx] = { ...updated[idx], order: updated[idx - 1].order };
      updated[idx - 1] = { ...updated[idx - 1], order: temp };
      onChange(updated);
    },
    [listings, onChange]
  );

  const moveDown = useCallback(
    (id: string) => {
      const sorted = [...listings].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l.id === id);
      if (idx >= sorted.length - 1) return;
      const updated = [...sorted];
      const temp = updated[idx].order;
      updated[idx] = { ...updated[idx], order: updated[idx + 1].order };
      updated[idx + 1] = { ...updated[idx + 1], order: temp };
      onChange(updated);
    },
    [listings, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-celestial-indigo" />
          Job Listings
          <span className="text-[9px] font-normal text-silver-mist">
            {visibleCount} visible · {featuredCount} featured · {listings.length} total
          </span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDepartmentFilter(null)}
            className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
              !departmentFilter
                ? 'bg-celestial-indigo/10 text-celestial-indigo'
                : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
            }`}
          >
            All
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(departmentFilter === dept ? null : dept)}
              className={`px-2 py-1 rounded-lg text-[9px] font-semibold transition-colors ${
                departmentFilter === dept
                  ? 'bg-celestial-indigo/10 text-celestial-indigo'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="space-y-1.5">
        {filtered.map((listing) => {
          const isExpanded = expandedId === listing.id;
          const modeCfg = MODE_CONFIG[listing.mode] || {
            color: 'text-silver-mist',
            bg: 'bg-silver-mist/10',
          };

          return (
            <div
              key={listing.id}
              className={`rounded-xl border transition-all ${
                !listing.isVisible
                  ? 'border-cloud/50 dark:border-nebula-purple/10 opacity-60'
                  : listing.isFeatured
                    ? 'border-sunset-amber/30 bg-sunset-amber/5'
                    : 'border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue'
              }`}
            >
              {/* Main Row */}
              <div className="flex items-center gap-2 p-2.5">
                {/* Drag Handle */}
                <GripVertical className="w-3 h-3 text-silver-mist/40 cursor-grab shrink-0" />

                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleVisibility(listing.id)}
                  className={`p-1 rounded transition-colors shrink-0 ${
                    listing.isVisible
                      ? 'text-neural-mint hover:text-neural-mint/70'
                      : 'text-silver-mist/40 hover:text-silver-mist'
                  }`}
                  title={listing.isVisible ? 'Visible on site' : 'Hidden from site'}
                >
                  {listing.isVisible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl truncate">
                      {listing.title}
                    </p>
                    {listing.isFeatured && (
                      <Star className="w-3 h-3 text-sunset-amber fill-sunset-amber shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-silver-mist">
                    <span className="flex items-center gap-0.5">
                      <Building2 className="w-2.5 h-2.5" /> {listing.department}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {listing.location}
                    </span>
                    <span
                      className={`px-1 py-0.5 rounded ${modeCfg.bg} ${modeCfg.color} font-semibold`}
                    >
                      {listing.mode}
                    </span>
                    <span>{listing.type}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                      {listing.applicationCount}
                    </p>
                    <p className="text-[7px] text-silver-mist">apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-ink-black dark:text-pearl">
                      {listing.viewCount}
                    </p>
                    <p className="text-[7px] text-silver-mist">views</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => toggleFeatured(listing.id)}
                    className={`p-1 rounded transition-colors ${
                      listing.isFeatured
                        ? 'text-sunset-amber'
                        : 'text-silver-mist/40 hover:text-sunset-amber'
                    }`}
                    title={listing.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className={`w-3 h-3 ${listing.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                  {onEditJob && (
                    <button
                      onClick={() => onEditJob(listing.id)}
                      className="p-1 text-silver-mist hover:text-celestial-indigo transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                    className="p-1 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-cloud/50 dark:border-nebula-purple/10 pt-2 ml-8 space-y-2">
                  {/* Salary */}
                  {listing.salaryRange && listing.salaryRange.display && (
                    <div className="flex items-center gap-1 text-[9px] text-ink-black dark:text-pearl">
                      <DollarSign className="w-3 h-3 text-neural-mint" />
                      <span className="font-semibold">
                        {formatCurrency(listing.salaryRange.min, listing.salaryRange.currency)} –{' '}
                        {formatCurrency(listing.salaryRange.max, listing.salaryRange.currency)}
                      </span>
                      <span className="text-silver-mist">/ year</span>
                    </div>
                  )}

                  {/* Skills */}
                  {listing.skills.length > 0 && (
                    <div>
                      <p className="text-[8px] font-bold text-silver-mist uppercase tracking-wider mb-1">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {listing.skills.map((s, i) => (
                          <span
                            key={i}
                            className="text-[8px] px-1.5 py-0.5 rounded-full border border-cloud dark:border-nebula-purple/20 text-ink-black dark:text-pearl bg-pearl/20 dark:bg-deep-cosmos/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Boards */}
                  {listing.externalBoards.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[9px]">
                      <Globe className="w-3 h-3 text-celestial-indigo" />
                      <span className="text-silver-mist">Published on:</span>
                      {listing.externalBoards.map((b, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-celestial-indigo/10 text-celestial-indigo font-semibold text-[8px]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-3 text-[8px] text-silver-mist">
                    {listing.publishedDate && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> Published:{' '}
                        {formatDate(listing.publishedDate)}
                      </span>
                    )}
                    {listing.expiryDate && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> Expires: {formatDate(listing.expiryDate)}
                      </span>
                    )}
                  </div>

                  {/* Move buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(listing.id)}
                      className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/20 transition-colors"
                    >
                      <ChevronUp className="w-2.5 h-2.5" /> Move Up
                    </button>
                    <button
                      onClick={() => moveDown(listing.id)}
                      className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[8px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/20 transition-colors"
                    >
                      <ChevronDown className="w-2.5 h-2.5" /> Move Down
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-6">
            <Briefcase className="w-5 h-5 text-silver-mist/20 mx-auto mb-2" />
            <p className="text-[10px] text-silver-mist">No listings match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingEditor;
