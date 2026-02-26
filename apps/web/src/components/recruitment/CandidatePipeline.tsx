/**
 * @module CandidatePipeline
 * @description Kanban-style candidate pipeline board — drag-and-drop between stages,
 *              filter by job/source/rating, bulk actions, candidate detail flyout (Sec 20.2)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star,
  Filter,
  X,
  Mail,
  Phone,
  ExternalLink,
  Clock,
  CheckSquare,
  ArrowRight,
  XCircle,
  Briefcase,
  MapPin,
  User,
  Tag,
} from 'lucide-react';
import {
  RecruitmentService,
  PIPELINE_STAGES,
  type Candidate,
  type PipelineStage,
  type JobPosting,
  type CandidateSource,
} from '@/services/recruitmentService';

// ── Constants ─────────────────────────────────────────────────────────────────

const BOARD_STAGES = PIPELINE_STAGES.filter((s) => !['hired', 'rejected'].includes(s.stage));

const SOURCE_LABELS: Record<CandidateSource, string> = {
  linkedin: 'LinkedIn',
  referral: 'Referral',
  job_board: 'Job Board',
  career_site: 'Career Site',
  agency: 'Agency',
  direct: 'Direct',
};

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

// ── Candidate Card ─────────────────────────────────────────────────────────────

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onClick: (candidate: Candidate) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, candidate: Candidate) => void;
  onDragEnd: () => void;
}

function CandidateCard({
  candidate,
  isSelected,
  onToggleSelect,
  onClick,
  isDragging,
  onDragStart,
  onDragEnd,
}: CandidateCardProps) {
  const _stageCfg = PIPELINE_STAGES.find((s) => s.stage === candidate.currentStage);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, candidate)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(candidate)}
      className={`bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-sm border-2 transition-all select-none ${
        isSelected
          ? 'border-indigo-400 shadow-indigo-100 shadow-md'
          : 'border-transparent hover:border-gray-200 hover:shadow-md'
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      {/* Top row: avatar, name, checkbox */}
      <div className="flex items-start gap-2">
        <div
          className={`w-8 h-8 rounded-full ${candidate.avatarColor} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-white text-xs font-bold">{candidate.avatarInitials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {candidate.fullName}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {candidate.currentTitle || candidate.currentCompany || candidate.jobTitle}
          </p>
        </div>
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(candidate.id);
          }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
              <path
                d="M10 3L5 8.5 2 5.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Star Rating */}
      {candidate.rating > 0 && (
        <div className="mt-2">
          <StarRating rating={candidate.rating} />
        </div>
      )}

      {/* Tags */}
      {candidate.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {candidate.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">{SOURCE_LABELS[candidate.source]}</span>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{candidate.daysInCurrentStage}d</span>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Column ───────────────────────────────────────────────────────────

interface PipelineColumnProps {
  stage: (typeof BOARD_STAGES)[number];
  candidates: Candidate[];
  selectedIds: Set<string>;
  draggingCandidateId: string | null;
  onToggleSelect: (id: string) => void;
  onCardClick: (candidate: Candidate) => void;
  onDragStart: (e: React.DragEvent, candidate: Candidate) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, stage: PipelineStage) => void;
  onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
  isDragOver: boolean;
}

function PipelineColumn({
  stage,
  candidates,
  selectedIds,
  draggingCandidateId,
  onToggleSelect,
  onCardClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver,
}: PipelineColumnProps) {
  return (
    <div
      className={`flex flex-col w-64 flex-shrink-0 rounded-2xl transition-colors ${
        isDragOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-gray-50'
      }`}
      onDragOver={(e) => onDragOver(e, stage.stage)}
      onDrop={(e) => onDrop(e, stage.stage)}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${stage.color}`}>
            {stage.label}
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.bgColor} ${stage.color}`}
        >
          {candidates.length}
        </span>
      </div>

      {/* Divider */}
      <div
        className={`h-0.5 mx-3 mb-2 rounded-full opacity-50 ${stage.bgColor.replace('bg-', 'bg-')}`}
        style={{ backgroundColor: 'currentColor' }}
      />

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 max-h-[calc(100vh-280px)]">
        {candidates.length === 0 && (
          <div
            className={`border-2 border-dashed rounded-xl py-6 text-center transition-colors ${
              isDragOver ? 'border-indigo-300' : 'border-gray-200'
            }`}
          >
            <p className="text-xs text-gray-400">Drop here</p>
          </div>
        )}
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedIds.has(candidate.id)}
            onToggleSelect={onToggleSelect}
            onClick={onCardClick}
            isDragging={draggingCandidateId === candidate.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

// ── Candidate Detail Flyout ───────────────────────────────────────────────────

function CandidateDetailFlyout({
  candidate,
  onClose,
  onMoveStage,
  onReject,
}: {
  candidate: Candidate;
  onClose: () => void;
  onMoveStage: (candidateId: string, stage: PipelineStage) => void;
  onReject: (candidateId: string) => void;
}) {
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.stage === candidate.currentStage);
  const nextStage = PIPELINE_STAGES[currentIdx + 1];
  const canAdvance = nextStage && !['hired', 'rejected'].includes(candidate.currentStage);
  const stageCfg = PIPELINE_STAGES.find((s) => s.stage === candidate.currentStage);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full sm:w-[420px] bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${candidate.avatarColor} flex items-center justify-center`}
            >
              <span className="text-white font-bold">{candidate.avatarInitials}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{candidate.fullName}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageCfg?.bgColor} ${stageCfg?.color}`}
              >
                {stageCfg?.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`mailto:${candidate.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Email</span>
            </a>
            <a
              href={`tel:${candidate.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-1 py-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">Call</span>
            </a>
            {candidate.linkedinUrl ? (
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 py-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-indigo-600 font-medium">LinkedIn</span>
              </a>
            ) : (
              <div className="flex flex-col items-center gap-1 py-3 bg-gray-50 rounded-xl opacity-50">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">LinkedIn</span>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profile</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                {
                  icon: Briefcase,
                  label: candidate.currentTitle || 'N/A',
                  sub: candidate.currentCompany || 'N/A',
                },
                { icon: MapPin, label: candidate.location },
                { icon: User, label: `${candidate.experienceYears} years experience` },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{label}</p>
                    {sub && <p className="text-xs text-gray-400">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Application
            </p>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Applied For</p>
                <p className="font-medium text-gray-800 text-xs mt-0.5">{candidate.jobTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Source</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {SOURCE_LABELS[candidate.source]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Applied Date</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {new Date(candidate.appliedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Expected Salary</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {candidate.expectedSalary
                    ? `$${candidate.expectedSalary.toLocaleString()}`
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Notice Period</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  {candidate.noticePeriod || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Days in Stage</p>
                <p className="font-medium text-gray-800 mt-0.5">{candidate.daysInCurrentStage}d</p>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rating</p>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <StarRating rating={candidate.rating} />
              <span className="text-sm font-bold text-gray-700">
                {candidate.rating > 0 ? `${candidate.rating}/5` : 'Unrated'}
              </span>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {candidate.tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {candidate.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {candidate.notes && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{candidate.notes}</p>
            </div>
          )}

          {/* Stage Actions */}
          <div className="space-y-2 pt-2">
            {canAdvance && nextStage && (
              <button
                onClick={() => onMoveStage(candidate.id, nextStage.stage)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Move to {nextStage.label}
              </button>
            )}
            {candidate.currentStage !== 'rejected' && candidate.currentStage !== 'hired' && (
              <button
                onClick={() => onReject(candidate.id)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject Candidate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Action Bar ────────────────────────────────────────────────────────────

function BulkActionBar({
  count,
  onClear,
  onAdvance,
  onReject,
}: {
  count: number;
  onClear: () => void;
  onAdvance: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
      <CheckSquare className="w-4 h-4 text-indigo-400" />
      <span className="text-sm font-semibold">{count} selected</span>
      <div className="w-px h-5 bg-gray-600" />
      <button
        onClick={onAdvance}
        className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <ArrowRight className="w-3.5 h-3.5" />
        Advance All
      </button>
      <button
        onClick={onReject}
        className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        <XCircle className="w-3.5 h-3.5" />
        Reject All
      </button>
      <button onClick={onClear} className="p-1 hover:text-gray-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface CandidatePipelineProps {
  initialJobId?: string;
}

export function CandidatePipeline({ initialJobId }: CandidatePipelineProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterJobId, setFilterJobId] = useState(initialJobId ?? '');
  const [filterSource, setFilterSource] = useState<CandidateSource | ''>('');
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drag & Drop
  const [draggingCandidateId, setDraggingCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const dragCandidateRef = useRef<Candidate | null>(null);

  // Flyout
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Load data
  useEffect(() => {
    const load = async () => {
      const [allCandidates, allJobs] = await Promise.all([
        RecruitmentService.getCandidates(undefined, { isArchived: false }),
        RecruitmentService.getJobPostings({ status: 'active' }),
      ]);
      setCandidates(allCandidates);
      setJobs(allJobs);
      setLoading(false);
    };
    load();
  }, []);

  // Filtered candidates
  const filteredCandidates = candidates.filter((c) => {
    if (filterJobId && c.jobPostingId !== filterJobId) return false;
    if (filterSource && c.source !== filterSource) return false;
    if (filterMinRating > 0 && c.rating < filterMinRating) return false;
    return true;
  });

  // Group by stage
  const byStage = (stage: PipelineStage) =>
    filteredCandidates.filter((c) => c.currentStage === stage);

  // Active filter count
  const activeFilters = [filterJobId, filterSource, filterMinRating > 0].filter(Boolean).length;

  // Toggle selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Move candidate stage
  const moveCandidateToStage = useCallback(async (candidateId: string, newStage: PipelineStage) => {
    const updated = await RecruitmentService.moveCandidateStage(candidateId, newStage);
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    // Update flyout if open
    setSelectedCandidate((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const rejectCandidate = useCallback(async (candidateId: string) => {
    const updated = await RecruitmentService.moveCandidateStage(candidateId, 'rejected');
    setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCandidate(null);
  }, []);

  // Bulk advance
  const bulkAdvance = async () => {
    for (const id of selectedIds) {
      const candidate = candidates.find((c) => c.id === id);
      if (!candidate) continue;
      const stageIdx = BOARD_STAGES.findIndex((s) => s.stage === candidate.currentStage);
      const nextStage = BOARD_STAGES[stageIdx + 1];
      if (nextStage) {
        await moveCandidateToStage(id, nextStage.stage);
      }
    }
    setSelectedIds(new Set());
  };

  const bulkReject = async () => {
    for (const id of selectedIds) {
      await rejectCandidate(id);
    }
    setSelectedIds(new Set());
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    dragCandidateRef.current = candidate;
    setDraggingCandidateId(candidate.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingCandidateId(null);
    setDragOverStage(null);
    dragCandidateRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDrop = async (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    const candidate = dragCandidateRef.current;
    if (!candidate || candidate.currentStage === stage) return;
    setDragOverStage(null);
    await moveCandidateToStage(candidate.id, stage);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_STAGES.map((s) => (
            <div
              key={s.stage}
              className="w-64 flex-shrink-0 h-96 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {
                filteredCandidates.filter((c) => !['hired', 'rejected'].includes(c.currentStage))
                  .length
              }{' '}
              active candidates
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilters > 0
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="bg-white text-indigo-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-xl">
            {/* Job filter */}
            <div className="flex-1 min-w-40">
              <label className="text-xs text-gray-500 font-medium mb-1 block">Job Posting</label>
              <select
                value={filterJobId}
                onChange={(e) => setFilterJobId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Positions</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Source filter */}
            <div className="flex-1 min-w-36">
              <label className="text-xs text-gray-500 font-medium mb-1 block">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as CandidateSource | '')}
                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Sources</option>
                {(Object.entries(SOURCE_LABELS) as [CandidateSource, string][]).map(
                  ([val, lbl]) => (
                    <option key={val} value={val}>
                      {lbl}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Min rating */}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Min Rating</label>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterMinRating(r)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      filterMinRating === r
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-300'
                    }`}
                  >
                    {r === 0 ? 'All' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setFilterJobId('');
                  setFilterSource('');
                  setFilterMinRating(0);
                }}
                className="self-end flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="flex gap-4 min-w-max">
          {BOARD_STAGES.map((stage) => (
            <PipelineColumn
              key={stage.stage}
              stage={stage}
              candidates={byStage(stage.stage)}
              selectedIds={selectedIds}
              draggingCandidateId={draggingCandidateId}
              onToggleSelect={toggleSelect}
              onCardClick={setSelectedCandidate}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragOver={dragOverStage === stage.stage}
            />
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onAdvance={bulkAdvance}
          onReject={bulkReject}
        />
      )}

      {/* Candidate Detail Flyout */}
      {selectedCandidate && (
        <CandidateDetailFlyout
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMoveStage={moveCandidateToStage}
          onReject={rejectCandidate}
        />
      )}
    </div>
  );
}

export default CandidatePipeline;
