/**
 * Resume Screening — structured output contract (Phase 3 Recruitment AI)
 */

export type ScreeningRecommendation =
  'strong_match' | 'good_match' | 'moderate_match' | 'weak_match' | 'no_match';

export type JobRequirementsInput = {
  jobId?: string;
  jobTitle: string;
  department?: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  minYearsExperience?: number;
  educationLevel?: string;
  location?: string;
  description?: string;
};

export type ExtractedResumeData = {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  yearsExperience: number;
  education: string[];
  certifications: string[];
  rawConfidence: number;
};

export type SkillMatchDetail = {
  skill: string;
  required: boolean;
  found: boolean;
  matchScore: number;
};

export type BiasFlag = {
  flagged: boolean;
  reasons: string[];
  fairnessNotes: string;
};

export type ResumeScreeningResult = {
  screeningId: string;
  overallScore: number;
  recommendation: ScreeningRecommendation;
  skillsMatchPercentage: number;
  experienceMatchPercentage: number;
  educationMatchPercentage: number;
  cultureFitScore: number;
  matchedSkills: string[];
  missingCriticalSkills: string[];
  skillDetails: SkillMatchDetail[];
  strengths: string[];
  redFlags: string[];
  interviewRecommended: boolean;
  interviewFocusAreas: string[];
  bias: BiasFlag;
  extracted: ExtractedResumeData;
  job: JobRequirementsInput;
  provider: 'groq' | 'openai' | 'gemini';
  model?: string;
  aiEnabled: boolean;
  confidenceScore: number;
  processingTimeMs: number;
  screenedAt: string;
  fileName?: string;
  rank?: number;
};

export type ResumeInput = {
  resumeText: string;
  fileName?: string;
};

export type BulkScreeningResult = {
  batchId: string;
  job: JobRequirementsInput;
  total: number;
  succeeded: number;
  failed: number;
  rankings: ResumeScreeningResult[];
  failures: { fileName?: string; error: string }[];
  processingTimeMs: number;
  screenedAt: string;
};

export type ResumeScreeningListItem = {
  id: string;
  candidateName: string;
  jobTitle: string;
  overallScore: number;
  recommendation: ScreeningRecommendation;
  skills: string[];
  biasFlagged: boolean;
  biasReasons: string[];
  interviewRecommended: boolean;
  provider: string;
  screenedAt: string;
};

export type OpenJobOption = {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  location?: string | null;
  source: 'requisition' | 'posting';
};
