/**
 * HR Coaching AI — Groq (primary) + OpenAI + Gemini, Campus SubjectChatbot pattern
 */

import {
  HR_AUTOMATION_CATALOG,
  type AutomationAction,
  type CoachingResponse,
} from './hr-coaching-fallback';
import { HR_COACHING_RULES, buildHRCoachingRules } from './hr-coaching-rules';
import type { ResolvedCoachingJurisdiction } from './resolve-tenant-coaching-country';
import {
  retrievalToCitations,
  retrievalToPromptBlock,
  type HRRetrievalContext,
} from './hr-coaching-retrieval';
import {
  chatCompletion,
  getConfiguredProviders,
  isLLMConfigured,
  type ChatHistoryItem,
} from './llm-client';

export type { ChatHistoryItem };

export type AICoachingResult = CoachingResponse & {
  provider: 'groq' | 'openai' | 'gemini';
  model?: string;
  sources?: ReturnType<typeof retrievalToCitations>;
  employeeContext?: HRRetrievalContext['employee'];
  workforce?: HRRetrievalContext['workforce'];
  grounded?: boolean;
};

export class HRCoachingAIError extends Error {
  code: 'NOT_CONFIGURED' | 'PROVIDER_FAILED';

  constructor(message: string, code: 'NOT_CONFIGURED' | 'PROVIDER_FAILED') {
    super(message);
    this.name = 'HRCoachingAIError';
    this.code = code;
  }
}

const GEMINI_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
];

const JSON_OUTPUT_INSTRUCTION = `
Output ONLY valid JSON (no markdown fences) matching this schema:
{
  "message": "markdown response for HR user",
  "suggestions": ["follow-up 1", "follow-up 2"],
  "actions": [{ "id": "catalog-id", "type": "navigate|draft|schedule|execute|workflow", "label": "...", "path": "optional", "payload": {} }],
  "decisions": { "title": "...", "context": "...", "options": [{ "id": "...", "label": "...", "pros": [], "cons": [], "recommendation": true }], "recommendedAction": "..." },
  "citations": [{ "title": "...", "source": "..." }],
  "automationsQueued": [{ "task": "...", "status": "ready" }]
}

Include "decisions" only for clear choices. Limit suggestions to 3-4. Pick 1-3 actions from catalog.

Automation catalog:
${JSON.stringify(HR_AUTOMATION_CATALOG, null, 2)}`;

function buildSystemPrompt(
  customRules?: string,
  retrieval?: HRRetrievalContext,
  jurisdiction?: ResolvedCoachingJurisdiction
): string {
  const rules = String(customRules || '').trim() || buildHRCoachingRules(jurisdiction);
  const grounding =
    retrieval && (retrieval.policies.length || retrieval.employee || retrieval.workforce)
      ? '\n\nIMPORTANT: Ground your answer in the RETRIEVED HR POLICIES and EMPLOYEE/WORKFORCE DATA provided in the user message. Prefer retrieved policy excerpts over general knowledge. Cite policy title and version.'
      : '';
  return `${rules}${grounding}\n\n${JSON_OUTPUT_INSTRUCTION}`;
}

function applyRetrieval(
  result: AICoachingResult,
  retrieval?: HRRetrievalContext
): AICoachingResult {
  if (!retrieval) return result;

  const policyCitations = retrievalToCitations(retrieval);
  const mergedCitations =
    policyCitations.length > 0
      ? policyCitations.map((c) => ({
          title: c.title,
          source: c.source,
          policyId: c.policyId,
          href: c.href,
        }))
      : result.citations;

  return {
    ...result,
    citations: mergedCitations,
    sources: policyCitations,
    employeeContext: retrieval.employee,
    workforce: retrieval.workforce,
    grounded: !!(retrieval.policies.length || retrieval.employee),
  };
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

function normalizeActions(raw: unknown): AutomationAction[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a) => a && typeof a === 'object')
    .map((a) => {
      const item = a as Record<string, unknown>;
      const id = String(item.id || '');
      const catalog = HR_AUTOMATION_CATALOG.find((c) => c.id === id);
      return {
        id: id || `action-${Math.random().toString(36).slice(2, 8)}`,
        type: (item.type as AutomationAction['type']) || catalog?.type || 'execute',
        label: String(item.label || catalog?.label || 'Run action'),
        description: item.description ? String(item.description) : undefined,
        path: item.path ? String(item.path) : (catalog as { path?: string })?.path,
        payload:
          (item.payload as Record<string, unknown>) ||
          (catalog as { payload?: Record<string, unknown> })?.payload,
      };
    })
    .slice(0, 4);
}

function normalizeCoachingResponse(
  parsed: Record<string, unknown>,
  provider: AICoachingResult['provider'],
  model?: string
): AICoachingResult {
  const message = String(parsed.message || '').trim();
  if (!message) throw new Error('AI returned empty message');

  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.map(String).filter(Boolean).slice(0, 5)
    : [];

  const actions = normalizeActions(parsed.actions);

  let decisions: CoachingResponse['decisions'];
  if (parsed.decisions && typeof parsed.decisions === 'object') {
    const d = parsed.decisions as Record<string, unknown>;
    const options = Array.isArray(d.options)
      ? d.options.map((o) => {
          const opt = o as Record<string, unknown>;
          return {
            id: String(opt.id || ''),
            label: String(opt.label || ''),
            pros: Array.isArray(opt.pros) ? opt.pros.map(String) : [],
            cons: Array.isArray(opt.cons) ? opt.cons.map(String) : [],
            recommendation: Boolean(opt.recommendation),
          };
        })
      : [];
    decisions = {
      title: String(d.title || 'Decision'),
      context: String(d.context || ''),
      options,
      recommendedAction: d.recommendedAction ? String(d.recommendedAction) : undefined,
    };
  }

  const citations = Array.isArray(parsed.citations)
    ? parsed.citations
        .map((c) => {
          const cit = c as Record<string, unknown>;
          return { title: String(cit.title || ''), source: String(cit.source || '') };
        })
        .filter((c) => c.title)
    : undefined;

  const automationsQueued = Array.isArray(parsed.automationsQueued)
    ? parsed.automationsQueued
        .map((a) => {
          const item = a as Record<string, unknown>;
          return {
            task: String(item.task || ''),
            status: (item.status === 'pending' ? 'pending' : 'ready') as 'ready' | 'pending',
          };
        })
        .filter((a) => a.task)
    : undefined;

  return {
    message,
    suggestions,
    actions,
    decisions,
    citations,
    automationsQueued,
    provider,
    model,
  };
}

/** Use raw LLM text when JSON parse fails — no canned rule-based content */
function plainTextResponse(
  text: string,
  provider: AICoachingResult['provider'],
  model?: string
): AICoachingResult {
  return {
    message: text,
    suggestions: [],
    actions: [],
    provider,
    model,
  };
}

function buildUserPrompt(
  query: string,
  history: ChatHistoryItem[],
  retrieval?: HRRetrievalContext
): string {
  const recent = history.slice(-8);
  const historyBlock =
    recent.length > 0
      ? `Conversation history:\n${recent.map((h) => `${h.role}: ${h.content}`).join('\n')}\n\n`
      : '';

  const retrievalBlock = retrieval ? `${retrievalToPromptBlock(retrieval)}\n\n` : '';
  return `${retrievalBlock}${historyBlock}HR question:\n${query}`;
}

async function generateWithOpenAICompatible(
  provider: 'groq' | 'openai',
  message: string,
  history: ChatHistoryItem[],
  customRules?: string,
  retrieval?: HRRetrievalContext,
  jurisdiction?: ResolvedCoachingJurisdiction
): Promise<AICoachingResult | null> {
  const result = await chatCompletion(provider, {
    systemPrompt: buildSystemPrompt(customRules, retrieval, jurisdiction),
    userPrompt: buildUserPrompt(message, history, retrieval),
    history,
    jsonMode: true,
    temperature: 0.2,
    maxTokens: 1400,
  });

  if (!result?.text) return null;

  const parsed = parseJsonFromAi(result.text);
  if (parsed) {
    try {
      return applyRetrieval(normalizeCoachingResponse(parsed, provider, result.model), retrieval);
    } catch {
      return applyRetrieval(plainTextResponse(result.text, provider, result.model), retrieval);
    }
  }

  return applyRetrieval(plainTextResponse(result.text, provider, result.model), retrieval);
}

async function generateWithGemini(
  message: string,
  history: ChatHistoryItem[],
  customRules?: string,
  retrieval?: HRRetrievalContext,
  jurisdiction?: ResolvedCoachingJurisdiction
): Promise<AICoachingResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `${buildSystemPrompt(customRules, retrieval, jurisdiction)}\n\n${buildUserPrompt(message, history, retrieval)}`;

  for (const endpoint of GEMINI_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonFromAi(text);
      const model = endpoint.split('/models/')[1]?.split(':')[0] || 'gemini';

      if (parsed) {
        try {
          return applyRetrieval(normalizeCoachingResponse(parsed, 'gemini', model), retrieval);
        } catch {
          return applyRetrieval(plainTextResponse(text, 'gemini', model), retrieval);
        }
      }
      if (text) return applyRetrieval(plainTextResponse(text, 'gemini', model), retrieval);
    } catch {
      /* try next endpoint */
    }
  }
  return null;
}

/**
 * Generate HR coaching response — Groq first (user preference), then OpenAI, Gemini.
 * Requires a configured LLM provider; no rule-based fallback.
 */
export async function generateHRCoachingResponse(
  message: string,
  history: ChatHistoryItem[] = [],
  customRules?: string,
  retrieval?: HRRetrievalContext,
  jurisdiction?: ResolvedCoachingJurisdiction
): Promise<AICoachingResult> {
  if (!isLLMConfigured()) {
    throw new HRCoachingAIError(
      'No AI provider configured. Add GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY to your environment.',
      'NOT_CONFIGURED'
    );
  }

  const { groq, openai, gemini } = getConfiguredProviders();

  if (groq) {
    try {
      const result = await generateWithOpenAICompatible(
        'groq',
        message,
        history,
        customRules,
        retrieval,
        jurisdiction
      );
      if (result) return result;
    } catch (err) {
      console.error('[hr-coaching-ai] Groq exception:', err);
    }
  }

  if (openai) {
    try {
      const result = await generateWithOpenAICompatible(
        'openai',
        message,
        history,
        customRules,
        retrieval,
        jurisdiction
      );
      if (result) return result;
    } catch (err) {
      console.error('[hr-coaching-ai] OpenAI exception:', err);
    }
  }

  if (gemini) {
    try {
      const result = await generateWithGemini(
        message,
        history,
        customRules,
        retrieval,
        jurisdiction
      );
      if (result) return result;
    } catch (err) {
      console.error('[hr-coaching-ai] Gemini exception:', err);
    }
  }

  throw new HRCoachingAIError(
    'All AI providers failed to generate a response. Please try again.',
    'PROVIDER_FAILED'
  );
}

export function isAIConfigured(): boolean {
  return isLLMConfigured();
}

export function getAIConfig() {
  const providers = getConfiguredProviders();
  const model =
    providers.primary === 'groq'
      ? process.env.HR_COACHING_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
      : providers.primary === 'openai'
        ? process.env.HR_COACHING_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini'
        : 'gemini';

  return {
    aiEnabled: isLLMConfigured(),
    providers: {
      groq: providers.groq,
      openai: providers.openai,
      gemini: providers.gemini,
    },
    primary: providers.primary,
    model,
  };
}
