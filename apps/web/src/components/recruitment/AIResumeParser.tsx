/**
 * @module AIResumeParser
 * @description Upload and parse resumes (PDF/DOCX) with AI-powered extraction,
 *              structured view, and job match scoring
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Upload,
  FileText,
  File,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Trash2,
  RotateCcw,
  Eye,
  Target,
} from 'lucide-react';
import type { ResumeData, CandidateScore } from '@/lib/services/ai/types';
import { APIClient } from '@/lib/api-client';
import { ParsedResumeView } from './ParsedResumeView';
import { ResumeMatchScore } from './ResumeMatchScore';

// ── Parse API response shape ─────────────────────────────────────────────────────

interface ParseApiResult {
  emails: string[];
  phones: string[];
  totalExperienceYears: number;
  skills: string[];
}

const TITLE_CASE = (value: string): string => value.replace(/\b\w/g, (c) => c.toUpperCase());

/** Build a real ResumeData from the parse API response — no mock fallback. */
function buildResumeData(fileName: string, api: ParseApiResult): ResumeData {
  const email = api.emails[0] ?? '';
  const nameFromEmail = email ? TITLE_CASE(email.split('@')[0].replace(/[._-]+/g, ' ')) : fileName;
  return {
    id: `resume-${Date.now()}`,
    fileName,
    contact: {
      name: nameFromEmail,
      email,
      phone: api.phones[0] ?? '',
      linkedin: '',
      location: '',
    },
    summary: '',
    skills: {
      technical: api.skills.map((name) => ({
        name: TITLE_CASE(name),
        level: 'INTERMEDIATE' as const,
      })),
      soft: [],
      domain: [],
      languages: [],
      tools: [],
    },
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    totalExperienceMonths: Math.round((api.totalExperienceYears || 0) * 12),
    parsedAt: new Date(),
    confidence: api.skills.length > 0 || api.emails.length > 0 ? 0.75 : 0.4,
  };
}

// ── Types ────────────────────────────────────────────────────────────────────────

type ParseStatus = 'idle' | 'uploading' | 'parsing' | 'scored' | 'done' | 'error';
type ActiveView = 'upload' | 'parsed' | 'match';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// ── File Type Icons ──────────────────────────────────────────────────────────────

const FILE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  'application/pdf': { icon: FileText, color: 'text-coral-alert' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: File,
    color: 'text-celestial-indigo',
  },
  'application/msword': { icon: File, color: 'text-celestial-indigo' },
  'text/plain': { icon: FileText, color: 'text-silver-mist' },
};

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.txt';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ── Main Component ───────────────────────────────────────────────────────────────

export const AIResumeParser: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [activeView, setActiveView] = useState<ActiveView>('upload');
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [matchScore, setMatchScore] = useState<CandidateScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File Validation ────────────────────────────────────────────────────────

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      return 'Unsupported file type. Please upload PDF, DOCX, or TXT files.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
    }
    return null;
  }, []);

  // ── Handle File Selection ──────────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setUploadedFile({ file, name: file.name, size: file.size, type: file.type });
      setStatus('idle');
      setParsedResume(null);
      setMatchScore(null);
    },
    [validateFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // ── Parse Resume (real API) ─────────────────────────────────────────────────

  const handleParse = useCallback(async () => {
    if (!uploadedFile) return;

    setError(null);
    setStatus('uploading');
    setActiveView('upload');

    try {
      const text = await uploadedFile.file.text();
      setStatus('parsing');

      const response = await APIClient.post<
        { success?: boolean; data?: ParseApiResult } | ParseApiResult
      >('/v1/recruitment/resume/parse', { text });
      const api = ((response as { data?: ParseApiResult }).data ?? response) as ParseApiResult;

      const resume = buildResumeData(uploadedFile.name, api);
      setParsedResume(resume);
      setStatus('scored');

      // Derive a real, transparent match score from extracted skills/experience.
      const skillScore = Math.min(1, api.skills.length / 8);
      const experienceScore = Math.min(1, (api.totalExperienceYears || 0) / 6);
      const contactScore = api.emails.length > 0 ? 1 : 0.3;
      const overall = Math.round(
        (skillScore * 0.5 + experienceScore * 0.35 + contactScore * 0.15) * 100
      );
      const recommendation: CandidateScore['recommendation'] =
        overall >= 75
          ? 'STRONG_FIT'
          : overall >= 50
            ? 'GOOD_FIT'
            : overall >= 30
              ? 'PARTIAL_FIT'
              : 'NOT_RECOMMENDED';

      setMatchScore({
        candidateId: resume.id,
        overallScore: overall,
        breakdown: {
          requiredSkills: {
            weight: 0.5,
            score: skillScore,
            details: `Extracted ${api.skills.length} recognised skill${api.skills.length === 1 ? '' : 's'}${
              api.skills.length ? `: ${api.skills.join(', ')}` : ''
            }`,
          },
          preferredSkills: { weight: 0, score: 0, details: 'Not evaluated' },
          experience: {
            weight: 0.35,
            score: experienceScore,
            details: `${api.totalExperienceYears || 0} year(s) of experience detected`,
          },
          education: { weight: 0, score: 0, details: 'Not evaluated' },
          certifications: { weight: 0, score: 0, details: 'Not evaluated' },
          languages: {
            weight: 0.15,
            score: contactScore,
            details: api.emails.length > 0 ? 'Contact details found' : 'No contact details found',
          },
        },
        recommendation,
        skillGaps:
          api.skills.length === 0 ? ['No recognised skills extracted from the document text'] : [],
        strengths: api.skills.map((s) => `${TITLE_CASE(s)} experience detected`),
      });
      setStatus('done');
      setActiveView('parsed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse resume. Please try again.');
      setStatus('error');
    }
  }, [uploadedFile]);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setUploadedFile(null);
    setStatus('idle');
    setActiveView('upload');
    setParsedResume(null);
    setMatchScore(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setStatus('idle');
    setParsedResume(null);
    setMatchScore(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  const isProcessing = status === 'uploading' || status === 'parsing' || status === 'scored';
  const fileIcon = uploadedFile
    ? FILE_ICONS[uploadedFile.type] || { icon: FileText, color: 'text-silver-mist' }
    : null;

  return (
    <div className="space-y-5">
      {/* Upload Section */}
      <div className="rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-4 space-y-3">
        {/* Drop Zone */}
        {!uploadedFile && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-celestial-indigo bg-celestial-indigo/5'
                : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50 hover:bg-pearl/30 dark:hover:bg-deep-cosmos/10'
            }`}
          >
            <Upload
              className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-celestial-indigo' : 'text-silver-mist/40'}`}
            />
            <p className="text-sm font-semibold text-ink-black dark:text-pearl">
              {isDragOver ? 'Drop your resume here' : 'Upload Resume'}
            </p>
            <p className="text-[10px] text-silver-mist mt-1">
              Drag & drop or click to browse. Supports PDF, DOCX, and TXT (max 10 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Selected File */}
        {uploadedFile && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-pearl/20 dark:bg-deep-cosmos/10">
            {fileIcon && <fileIcon.icon className={`w-8 h-8 ${fileIcon.color} shrink-0`} />}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-ink-black dark:text-pearl truncate">
                {uploadedFile.name}
              </p>
              <p className="text-[9px] text-silver-mist">{formatFileSize(uploadedFile.size)}</p>
            </div>

            {/* Status */}
            {isProcessing && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-celestial-indigo animate-spin" />
                <span className="text-[10px] font-semibold text-celestial-indigo">
                  {status === 'uploading'
                    ? 'Uploading...'
                    : status === 'parsing'
                      ? 'Parsing...'
                      : 'Scoring...'}
                </span>
              </div>
            )}
            {status === 'done' && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-neural-mint" />
                <span className="text-[10px] font-semibold text-neural-mint">Parsed</span>
              </div>
            )}

            {/* Actions */}
            {!isProcessing && (
              <div className="flex items-center gap-1">
                {status === 'idle' && (
                  <button
                    onClick={handleParse}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-celestial-indigo text-white hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-3 h-3" /> Parse with AI
                  </button>
                )}
                {status === 'done' && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-silver-mist hover:text-ink-black dark:hover:text-pearl border border-cloud dark:border-nebula-purple/30 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> New Upload
                  </button>
                )}
                <button
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-silver-mist hover:text-coral-alert transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-coral-alert/5 border border-coral-alert/20">
            <AlertTriangle className="w-4 h-4 text-coral-alert shrink-0" />
            <p className="text-[10px] text-coral-alert">{error}</p>
          </div>
        )}

        {/* Parsing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StepIndicator
                label="Upload"
                done={status !== 'uploading'}
                active={status === 'uploading'}
              />
              <div className="flex-1 h-px bg-cloud dark:bg-nebula-purple/20" />
              <StepIndicator
                label="AI Parse"
                done={status === 'scored'}
                active={status === 'parsing'}
              />
              <div className="flex-1 h-px bg-cloud dark:bg-nebula-purple/20" />
              <StepIndicator label="Score" done={false} active={status === 'scored'} />
            </div>
          </div>
        )}
      </div>

      {/* View Tabs (only when parsed) */}
      {parsedResume && (
        <>
          <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
            <button
              onClick={() => setActiveView('parsed')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'parsed'
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Parsed Resume
            </button>
            {matchScore && (
              <button
                onClick={() => setActiveView('match')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeView === 'match'
                    ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                    : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                Match Score ({matchScore.overallScore}%)
              </button>
            )}
          </div>

          {/* Content */}
          {activeView === 'parsed' && <ParsedResumeView resume={parsedResume} />}
          {activeView === 'match' && matchScore && (
            <ResumeMatchScore
              score={matchScore}
              resume={parsedResume}
              jobTitle="Senior Full-Stack Engineer"
            />
          )}
        </>
      )}
    </div>
  );
};

// ── Step Indicator ───────────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ label: string; done: boolean; active: boolean }> = ({
  label,
  done,
  active,
}) => (
  <div className="flex items-center gap-1.5">
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
        done
          ? 'bg-neural-mint text-white'
          : active
            ? 'bg-celestial-indigo text-white'
            : 'bg-pearl dark:bg-deep-cosmos text-silver-mist border border-cloud dark:border-nebula-purple/30'
      }`}
    >
      {done ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : active ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        ''
      )}
    </div>
    <span
      className={`text-[9px] font-semibold ${done ? 'text-neural-mint' : active ? 'text-celestial-indigo' : 'text-silver-mist'}`}
    >
      {label}
    </span>
  </div>
);

export default AIResumeParser;
