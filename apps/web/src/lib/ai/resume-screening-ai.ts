/**
 * Resume Screening — LLM-only orchestration (no rules / provider fallbacks)
 */

import {
  chatCompletion,
  getConfiguredProviders,
  isLLMConfigured,
  type LLMProviderName,
} from './llm-client';
import { RESUME_SCREENING_RULES } from './resume-screening-rules';
import type {
  JobRequirementsInput,
  ResumeInput,
  ResumeScreeningResult,
  ScreeningRecommendation,
  SkillMatchDetail,
  BulkScreeningResult,
} from './resume-screening-types';
import { randomUUID } from 'crypto';

export class ResumeScreeningAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumeScreeningAIError';
  }
}

function parseJsonFromAi(text: string): Record<string, unknown> | null {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = Number(n);
  if (Number.isNaN(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(String).filter(Boolean);
}

const RECS = new Set(['strong_match', 'good_match', 'moderate_match', 'weak_match', 'no_match']);

function normalizeResult(
  parsed: Record<string, unknown>,
  job: JobRequirementsInput,
  provider: 'groq' | 'openai' | 'gemini',
  model?: string
): Omit<ResumeScreeningResult, 'screeningId' | 'screenedAt' | 'processingTimeMs'> {
  const extractedIn = (parsed.extracted || {}) as Record<string, unknown>;
  const biasIn = (parsed.bias || {}) as Record<string, unknown>;
  const overallScore = clamp(parsed.overallScore, 0, 100, NaN);
  if (Number.isNaN(overallScore)) {
    throw new ResumeScreeningAIError('AI response missing overallScore');
  }

  const recRaw = String(parsed.recommendation || '');
  if (!RECS.has(recRaw)) {
    throw new ResumeScreeningAIError('AI response has invalid recommendation');
  }

  const skillDetails: SkillMatchDetail[] = Array.isArray(parsed.skillDetails)
    ? (parsed.skillDetails as Record<string, unknown>[])
        .map((s) => ({
          skill: String(s.skill || ''),
          required: Boolean(s.required ?? true),
          found: Boolean(s.found),
          matchScore: clamp(s.matchScore, 0, 100, 0),
        }))
        .filter((s) => s.skill)
    : (job.requiredSkills || []).map((skill) => {
        const matched = asStringArray(parsed.matchedSkills).some(
          (m) => m.toLowerCase() === skill.toLowerCase()
        );
        return { skill, required: true, found: matched, matchScore: matched ? 100 : 0 };
      });

  return {
    overallScore,
    recommendation: recRaw as ScreeningRecommendation,
    skillsMatchPercentage: clamp(parsed.skillsMatchPercentage, 0, 100, overallScore),
    experienceMatchPercentage: clamp(parsed.experienceMatchPercentage, 0, 100, overallScore),
    educationMatchPercentage: clamp(parsed.educationMatchPercentage, 0, 100, 60),
    cultureFitScore: clamp(parsed.cultureFitScore, 0, 100, 60),
    matchedSkills: asStringArray(parsed.matchedSkills),
    missingCriticalSkills: asStringArray(parsed.missingCriticalSkills),
    skillDetails,
    strengths: asStringArray(parsed.strengths),
    redFlags: asStringArray(parsed.redFlags),
    interviewRecommended: Boolean(parsed.interviewRecommended),
    interviewFocusAreas: asStringArray(parsed.interviewFocusAreas),
    bias: {
      flagged: Boolean(biasIn.flagged),
      reasons: asStringArray(biasIn.reasons),
      fairnessNotes: String(
        biasIn.fairnessNotes ||
          (biasIn.flagged
            ? 'Review flagged language before advancing.'
            : 'No unfair language proxies reported.')
      ),
    },
    extracted: {
      name: extractedIn.name != null && extractedIn.name !== '' ? String(extractedIn.name) : null,
      email:
        extractedIn.email != null && extractedIn.email !== '' ? String(extractedIn.email) : null,
      phone:
        extractedIn.phone != null && extractedIn.phone !== '' ? String(extractedIn.phone) : null,
      location:
        extractedIn.location != null && extractedIn.location !== ''
          ? String(extractedIn.location)
          : null,
      summary:
        extractedIn.summary != null && extractedIn.summary !== ''
          ? String(extractedIn.summary)
          : null,
      skills: asStringArray(extractedIn.skills),
      yearsExperience: clamp(extractedIn.yearsExperience, 0, 50, 0),
      education: asStringArray(extractedIn.education),
      certifications: asStringArray(extractedIn.certifications),
      rawConfidence: clamp(
        extractedIn.rawConfidence,
        0,
        100,
        clamp(parsed.confidenceScore, 0, 100, 70)
      ),
    },
    job,
    provider,
    model,
    aiEnabled: true,
    confidenceScore: clamp(parsed.confidenceScore, 0, 100, 70),
  };
}

function buildUserPrompt(resumeText: string, job: JobRequirementsInput): string {
  return `JOB REQUIREMENTS:
Title: ${job.jobTitle}
Department: ${job.department || 'n/a'}
Required skills: ${(job.requiredSkills || []).join(', ') || 'n/a'}
Preferred skills: ${(job.preferredSkills || []).join(', ') || 'n/a'}
Minimum years: ${job.minYearsExperience ?? 'n/a'}
Education: ${job.educationLevel || 'n/a'}
Location: ${job.location || 'n/a'}
Description: ${job.description || 'n/a'}

RESUME TEXT:
"""
${resumeText.slice(0, 12000)}
"""`;
}

async function callPrimaryProvider(
  provider: LLMProviderName,
  resumeText: string,
  job: JobRequirementsInput
): Promise<Omit<ResumeScreeningResult, 'screeningId' | 'screenedAt' | 'processingTimeMs'>> {
  if (provider === 'groq' || provider === 'openai') {
    const result = await chatCompletion(provider, {
      systemPrompt: RESUME_SCREENING_RULES,
      userPrompt: buildUserPrompt(resumeText, job),
      jsonMode: true,
      temperature: 0.15,
      maxTokens: 2000,
    });
    if (!result?.text) {
      throw new ResumeScreeningAIError(`${provider} returned an empty response`);
    }
    const parsed = parseJsonFromAi(result.text);
    if (!parsed) {
      throw new ResumeScreeningAIError(`${provider} returned invalid JSON`);
    }
    return normalizeResult(parsed, job, provider, result.model);
  }

  // Gemini only
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ResumeScreeningAIError('GEMINI_API_KEY is not configured');
  }
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const res = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `${RESUME_SCREENING_RULES}\n\n${buildUserPrompt(resumeText, job)}` }] },
      ],
      generationConfig: { temperature: 0.15, maxOutputTokens: 2000 },
    }),
  });
  if (!res.ok) {
    throw new ResumeScreeningAIError(`Gemini request failed (${res.status})`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = parseJsonFromAi(String(text || ''));
  if (!parsed) {
    throw new ResumeScreeningAIError('Gemini returned invalid JSON');
  }
  return normalizeResult(parsed, job, 'gemini', 'gemini-2.0-flash');
}

export async function screenResumeWithAI(
  resumeText: string,
  job: JobRequirementsInput,
  fileName?: string
): Promise<
  Omit<ResumeScreeningResult, 'screeningId' | 'screenedAt' | 'rank'> & { processingTimeMs: number }
> {
  const started = Date.now();
  const providers = getConfiguredProviders();

  if (!isLLMConfigured() || !providers.primary) {
    throw new ResumeScreeningAIError(
      'No LLM configured. Set GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.'
    );
  }

  const result = await callPrimaryProvider(providers.primary, resumeText, job);
  return {
    ...result,
    fileName: fileName || undefined,
    processingTimeMs: Date.now() - started,
  };
}

/**
 * Screen many resumes against one job and rank by overallScore (desc).
 * Runs with limited concurrency to avoid provider rate limits.
 */
export async function screenResumesBatchAndRank(
  resumes: ResumeInput[],
  job: JobRequirementsInput,
  options?: { concurrency?: number }
): Promise<BulkScreeningResult> {
  const started = Date.now();
  if (!resumes.length) {
    throw new ResumeScreeningAIError('At least one resume is required');
  }
  if (resumes.length > 20) {
    throw new ResumeScreeningAIError('Maximum 20 resumes per bulk run');
  }

  const concurrency = Math.max(1, Math.min(options?.concurrency ?? 2, 3));
  const successes: ResumeScreeningResult[] = [];
  const failures: { fileName?: string; error: string }[] = [];

  let index = 0;
  async function worker() {
    while (index < resumes.length) {
      const current = resumes[index++];
      const label = current.fileName || `resume-${index}`;
      try {
        const text = String(current.resumeText || '').trim();
        if (text.length < 40) {
          failures.push({ fileName: label, error: 'Resume text too short' });
          continue;
        }
        const screened = await screenResumeWithAI(text, job, current.fileName);
        const screenedAt = new Date().toISOString();
        successes.push({
          ...screened,
          screeningId: randomUUID(),
          screenedAt,
          fileName: current.fileName,
        });
      } catch (err) {
        failures.push({
          fileName: label,
          error: err instanceof Error ? err.message : 'Screening failed',
        });
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const rankings = [...successes]
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    batchId: randomUUID(),
    job,
    total: resumes.length,
    succeeded: rankings.length,
    failed: failures.length,
    rankings,
    failures,
    processingTimeMs: Date.now() - started,
    screenedAt: new Date().toISOString(),
  };
}

export function getResumeScreeningConfig() {
  const providers = getConfiguredProviders();
  return {
    aiEnabled: isLLMConfigured(),
    providers: {
      groq: providers.groq,
      openai: providers.openai,
      gemini: providers.gemini,
    },
    primary: providers.primary,
  };
}
