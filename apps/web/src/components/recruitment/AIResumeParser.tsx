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
import { ParsedResumeView } from './ParsedResumeView';
import { ResumeMatchScore } from './ResumeMatchScore';

// ── Types ────────────────────────────────────────────────────────────────────────

type ParseStatus = 'idle' | 'uploading' | 'parsing' | 'scored' | 'done' | 'error';
type ActiveView = 'upload' | 'parsed' | 'match';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// ── Mock Parsed Resume ───────────────────────────────────────────────────────────

const MOCK_RESUME: ResumeData = {
  id: 'resume-001',
  fileName: 'sarah_johnson_resume.pdf',
  contact: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 234-5678',
    linkedin: 'linkedin.com/in/sarahjohnson',
    location: 'San Francisco, CA',
  },
  summary:
    'Experienced full-stack software engineer with 6+ years of expertise in building scalable web applications. Passionate about clean code, mentoring junior developers, and delivering high-impact products. Strong background in React, Node.js, and cloud infrastructure.',
  skills: {
    technical: [
      { name: 'React', level: 'EXPERT', yearsOfExperience: 5 },
      { name: 'TypeScript', level: 'ADVANCED', yearsOfExperience: 4 },
      { name: 'Node.js', level: 'ADVANCED', yearsOfExperience: 5 },
      { name: 'Python', level: 'INTERMEDIATE', yearsOfExperience: 2 },
      { name: 'PostgreSQL', level: 'ADVANCED', yearsOfExperience: 4 },
      { name: 'AWS', level: 'INTERMEDIATE', yearsOfExperience: 3 },
      { name: 'Docker', level: 'INTERMEDIATE', yearsOfExperience: 3 },
      { name: 'GraphQL', level: 'ADVANCED', yearsOfExperience: 3 },
    ],
    soft: [
      { name: 'Leadership', level: 'ADVANCED' },
      { name: 'Communication', level: 'EXPERT' },
      { name: 'Problem Solving', level: 'EXPERT' },
      { name: 'Mentoring', level: 'ADVANCED' },
      { name: 'Agile/Scrum', level: 'ADVANCED' },
    ],
    domain: [
      { name: 'SaaS', level: 'ADVANCED' },
      { name: 'FinTech', level: 'INTERMEDIATE' },
      { name: 'E-commerce', level: 'INTERMEDIATE' },
    ],
    languages: [],
    tools: [
      { name: 'Git', level: 'EXPERT' },
      { name: 'Jira', level: 'ADVANCED' },
      { name: 'Figma', level: 'INTERMEDIATE' },
      { name: 'VS Code', level: 'EXPERT' },
      { name: 'Webpack', level: 'ADVANCED' },
    ],
  },
  experience: [
    {
      company: 'TechCorp Inc.',
      title: 'Senior Software Engineer',
      startDate: '2022-01',
      endDate: undefined,
      isCurrent: true,
      location: 'San Francisco, CA',
      description: 'Leading a team of 5 engineers building a real-time analytics platform.',
      achievements: [
        'Architected microservices migration reducing latency by 40%',
        'Mentored 3 junior developers to mid-level promotions',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
      ],
      durationMonths: 38,
    },
    {
      company: 'StartupXYZ',
      title: 'Full-Stack Developer',
      startDate: '2019-06',
      endDate: '2021-12',
      isCurrent: false,
      location: 'Remote',
      description: 'Built core product features for a B2B SaaS platform.',
      achievements: [
        'Developed customer portal handling 10k+ daily active users',
        'Reduced page load times by 50% through performance optimizations',
        'Introduced automated testing achieving 85% code coverage',
      ],
      durationMonths: 30,
    },
    {
      company: 'WebAgency Co.',
      title: 'Junior Developer',
      startDate: '2018-01',
      endDate: '2019-05',
      isCurrent: false,
      location: 'New York, NY',
      description: 'Developed responsive web applications for diverse clients.',
      achievements: ['Delivered 15+ client projects on time and within budget'],
      durationMonths: 16,
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationYear: 2017,
      gpa: 3.7,
    },
  ],
  certifications: [
    { name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services', year: 2023 },
    { name: 'Professional Scrum Master I', issuer: 'Scrum.org', year: 2022 },
  ],
  languages: [
    { language: 'English', proficiency: 'NATIVE' },
    { language: 'Spanish', proficiency: 'INTERMEDIATE' },
  ],
  totalExperienceMonths: 84,
  parsedAt: new Date(),
  confidence: 0.92,
};

const MOCK_SCORE: CandidateScore = {
  candidateId: 'resume-001',
  overallScore: 82,
  breakdown: {
    requiredSkills: {
      weight: 0.25,
      score: 0.9,
      details: 'Matches 9 of 10 required skills including React, TypeScript, Node.js',
    },
    preferredSkills: {
      weight: 0.15,
      score: 0.7,
      details: 'Has 5 of 7 preferred skills; missing Kubernetes and Terraform',
    },
    experience: {
      weight: 0.3,
      score: 0.85,
      details: '6+ years matches Senior level requirement; leadership experience present',
    },
    education: {
      weight: 0.15,
      score: 0.8,
      details: 'BS in Computer Science from top-tier university meets requirement',
    },
    certifications: {
      weight: 0.1,
      score: 0.6,
      details: 'Has AWS cert; missing required GCP certification',
    },
    languages: {
      weight: 0.05,
      score: 1.0,
      details: 'English native speaker meets language requirement',
    },
  },
  recommendation: 'STRONG_FIT',
  skillGaps: [
    'Kubernetes — Required but not found in resume',
    'Terraform — Preferred skill not present',
    'GCP certification — Required certification missing',
  ],
  strengths: [
    'Strong React/TypeScript expertise (5+ years)',
    'Leadership and mentoring experience',
    'Microservices architecture background',
    'CI/CD and DevOps experience with AWS',
    'Top-tier CS education with strong GPA',
  ],
};

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

  // ── Parse Resume (simulated) ───────────────────────────────────────────────

  const handleParse = useCallback(async () => {
    if (!uploadedFile) return;

    setError(null);
    setStatus('uploading');
    setActiveView('upload');

    // Simulate upload
    await new Promise((r) => setTimeout(r, 800));
    setStatus('parsing');

    // Simulate AI parsing
    await new Promise((r) => setTimeout(r, 1500));

    setParsedResume({ ...MOCK_RESUME, fileName: uploadedFile.name });
    setStatus('scored');

    // Simulate scoring
    await new Promise((r) => setTimeout(r, 600));
    setMatchScore(MOCK_SCORE);
    setStatus('done');
    setActiveView('parsed');
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
