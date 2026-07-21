import { prisma } from '@aura/database';
import { chatCompletion, getConfiguredProviders } from './llm-client';
import type { EmailCategory, ParsedEmail } from './email-parsing-types';
import { parseEmailWithRules } from './email-parsing-rules';

const VALID_CATEGORIES = new Set<EmailCategory>(['LEAVE_REQUEST', 'EXPENSE', 'TICKET', 'OTHER']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * LLM enrichment is deliberately best-effort: classification and extraction must
 * remain available when no provider is configured or a provider is unavailable.
 */
async function enrichEmailParse(content: string, fallback: ParsedEmail): Promise<ParsedEmail> {
  const { primary } = getConfiguredProviders();
  if (primary !== 'groq' && primary !== 'openai') return fallback;

  const completion = await chatCompletion(primary, {
    systemPrompt: [
      'Classify HR operations email and extract only explicit facts.',
      'Return JSON with category (LEAVE_REQUEST, EXPENSE, TICKET, OTHER), confidence (0..1),',
      'and entities object. Never infer values; leave missing values out.',
    ].join(' '),
    userPrompt: content.slice(0, 12_000),
    jsonMode: true,
    temperature: 0,
    maxTokens: 700,
  });
  if (!completion) return fallback;

  try {
    const candidate: unknown = JSON.parse(completion.text);
    if (!isRecord(candidate) || !VALID_CATEGORIES.has(candidate.category as EmailCategory)) {
      return fallback;
    }
    const confidence =
      typeof candidate.confidence === 'number'
        ? Math.max(0, Math.min(1, candidate.confidence))
        : fallback.confidence;
    return {
      ...fallback,
      category: candidate.category as EmailCategory,
      confidence,
      entities: isRecord(candidate.entities)
        ? { ...fallback.entities, ...candidate.entities }
        : fallback.entities,
      provider: 'llm',
    };
  } catch {
    return fallback;
  }
}

export async function parseEmail(tenantId: string, userId: string, content: string) {
  const started = Date.now();
  const parsed = await enrichEmailParse(content, parseEmailWithRules(content));
  const run = await prisma.aIRunRecord.create({
    data: {
      tenantId,
      runType: 'email_parse',
      inputContext: { contentLength: content.length },
      output: JSON.parse(JSON.stringify(parsed)),
      completedAt: new Date(),
      durationMs: Date.now() - started,
      createdBy: userId,
    },
  });
  return { ...parsed, runId: run.id };
}

export async function commitEmailParse(tenantId: string, userId: string, parseId: string) {
  const source = await prisma.aIRunRecord.findFirst({
    where: { id: parseId, tenantId, runType: 'email_parse', isDeleted: false },
  });
  if (!source) return null;
  const run = await prisma.aIRunRecord.create({
    data: {
      tenantId,
      runType: 'email_parse_commit',
      inputContext: { parseId },
      output: {
        parseId,
        status: 'PENDING_HUMAN_CONFIRMATION',
        message: 'No leave, expense, or ticket record was created automatically.',
      },
      completedAt: new Date(),
      createdBy: userId,
    },
  });
  return run;
}
