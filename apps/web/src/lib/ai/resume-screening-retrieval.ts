/**
 * Resume Screening — grounding / retrieval (tenant-scoped)
 */

import { prisma } from '@aura/database';
import type {
  JobRequirementsInput,
  OpenJobOption,
  ResumeScreeningListItem,
  ScreeningRecommendation,
} from './resume-screening-types';

const DEFAULT_JOB: JobRequirementsInput = {
  jobTitle: 'Open Role',
  requiredSkills: ['Communication', 'Problem Solving'],
  preferredSkills: [],
  minYearsExperience: 2,
  description: 'General screening against core professional skills.',
};

export async function listOpenJobsForTenant(tenantId: string): Promise<OpenJobOption[]> {
  try {
    const requisitions = await prisma.jobRequisition.findMany({
      where: {
        tenantId,
        isDeleted: false,
        NOT: { status: { in: ['Closed', 'Cancelled', 'Rejected'] } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      select: {
        id: true,
        jobTitle: true,
        department: true,
        requiredSkills: true,
        location: true,
        description: true,
      },
    });

    if (requisitions.length > 0) {
      return requisitions.map((r) => ({
        id: r.id,
        title: r.jobTitle,
        department: r.department,
        requiredSkills: r.requiredSkills || [],
        location: r.location,
        source: 'requisition' as const,
      }));
    }
  } catch (err) {
    console.error('[resume-retrieval] jobRequisition query failed:', err);
  }

  try {
    // Fallback: JobPosting has no tenantId in schema — return recent non-deleted postings cautiously
    const postings = await prisma.jobPosting.findMany({
      where: { isDeleted: false, status: { in: ['Published', 'Open', 'Active'] } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, title: true, department: true, location: true, description: true },
    });

    return postings.map((p) => ({
      id: p.id,
      title: p.title,
      department: p.department,
      requiredSkills: extractSkillsFromText(`${p.title} ${p.description || ''}`),
      location: p.location,
      source: 'posting' as const,
    }));
  } catch (err) {
    console.error('[resume-retrieval] jobPosting query failed:', err);
    return [];
  }
}

function extractSkillsFromText(text: string): string[] {
  const catalog = [
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Python',
    'Java',
    'SQL',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'Project Management',
    'Communication',
    'Leadership',
    'HR',
    'Payroll',
    'Recruitment',
  ];
  const lower = text.toLowerCase();
  return catalog.filter((s) => lower.includes(s.toLowerCase())).slice(0, 8);
}

export async function resolveJobRequirements(
  tenantId: string,
  opts: {
    jobId?: string;
    jobTitle?: string;
    requiredSkills?: string[];
    preferredSkills?: string[];
    minYearsExperience?: number;
    educationLevel?: string;
    description?: string;
  }
): Promise<JobRequirementsInput> {
  if (opts.jobId) {
    const req = await prisma.jobRequisition.findFirst({
      where: { id: opts.jobId, tenantId, isDeleted: false },
    });
    if (req) {
      return {
        jobId: req.id,
        jobTitle: req.jobTitle,
        department: req.department,
        requiredSkills: opts.requiredSkills?.length
          ? opts.requiredSkills
          : req.requiredSkills?.length
            ? req.requiredSkills
            : DEFAULT_JOB.requiredSkills,
        preferredSkills: opts.preferredSkills || [],
        minYearsExperience: opts.minYearsExperience ?? 2,
        educationLevel: opts.educationLevel,
        location: req.location || undefined,
        description: opts.description || req.description || undefined,
      };
    }

    const posting = await prisma.jobPosting.findFirst({
      where: { id: opts.jobId, isDeleted: false },
    });
    if (posting) {
      const skills = opts.requiredSkills?.length
        ? opts.requiredSkills
        : extractSkillsFromText(`${posting.title} ${posting.description || ''}`);
      return {
        jobId: posting.id,
        jobTitle: posting.title,
        department: posting.department,
        requiredSkills: skills.length ? skills : DEFAULT_JOB.requiredSkills,
        preferredSkills: opts.preferredSkills || [],
        minYearsExperience: opts.minYearsExperience ?? 2,
        educationLevel: opts.educationLevel,
        location: posting.location,
        description: opts.description || posting.description || undefined,
      };
    }
  }

  return {
    jobTitle: opts.jobTitle?.trim() || DEFAULT_JOB.jobTitle,
    requiredSkills: opts.requiredSkills?.filter(Boolean).length
      ? opts.requiredSkills.filter(Boolean)
      : DEFAULT_JOB.requiredSkills,
    preferredSkills: opts.preferredSkills || [],
    minYearsExperience: opts.minYearsExperience ?? DEFAULT_JOB.minYearsExperience,
    educationLevel: opts.educationLevel,
    description: opts.description || DEFAULT_JOB.description,
  };
}

export async function listRecentScreenings(
  tenantId: string,
  take = 40
): Promise<ResumeScreeningListItem[]> {
  try {
    const rows = await prisma.aIRunRecord.findMany({
      where: { tenantId, runType: 'resume_screening', isDeleted: false },
      orderBy: { startedAt: 'desc' },
      take,
    });

    return rows.map((row) => {
      const output = (row.output || {}) as Record<string, unknown>;
      const extracted = (output.extracted || {}) as Record<string, unknown>;
      const job = (output.job || {}) as Record<string, unknown>;
      const bias = (output.bias || {}) as Record<string, unknown>;
      const skills = Array.isArray(extracted.skills)
        ? extracted.skills.map(String)
        : Array.isArray(output.matchedSkills)
          ? (output.matchedSkills as unknown[]).map(String)
          : [];

      return {
        id: row.id,
        candidateName: String(extracted.name || output.candidateName || 'Unknown candidate'),
        jobTitle: String(job.jobTitle || output.jobTitle || 'Open role'),
        overallScore: Number(output.overallScore ?? 0),
        recommendation: (output.recommendation as ScreeningRecommendation) || 'moderate_match',
        skills: skills.slice(0, 8),
        biasFlagged: Boolean(bias.flagged),
        biasReasons: Array.isArray(bias.reasons) ? bias.reasons.map(String) : [],
        interviewRecommended: Boolean(output.interviewRecommended),
        provider: String(output.provider || row.modelVersion || 'unknown'),
        screenedAt: (row.completedAt || row.startedAt).toISOString(),
      };
    });
  } catch (err) {
    console.error('[resume-retrieval] listRecentScreenings failed:', err);
    return [];
  }
}

export async function screeningStats(tenantId: string) {
  const recent = await listRecentScreenings(tenantId, 100);
  const avg =
    recent.length === 0
      ? 0
      : Math.round(recent.reduce((s, r) => s + r.overallScore, 0) / recent.length);
  const biasFlags = recent.filter((r) => r.biasFlagged).length;
  const interviewReady = recent.filter((r) => r.interviewRecommended).length;
  return {
    processed: recent.length,
    avgMatchScore: avg,
    biasFlags,
    interviewReady,
    fairnessStatus: biasFlags === 0 ? 'Pass' : 'Review',
  };
}
