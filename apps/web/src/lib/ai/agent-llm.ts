/**
 * Shared LLM orchestration helpers for agentic AI
 */

import {
  chatCompletion,
  getConfiguredProviders,
  isLLMConfigured,
  type ChatHistoryItem,
  type LLMProviderName,
} from './llm-client';

export function parseJsonFromAi(text: string): Record<string, unknown> | null {
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

export async function runAgentLlm(options: {
  systemPrompt: string;
  userPrompt: string;
  history?: ChatHistoryItem[];
}): Promise<{
  parsed: Record<string, unknown>;
  provider: LLMProviderName | 'fallback';
  model?: string;
} | null> {
  if (!isLLMConfigured()) return null;

  const providers = getConfiguredProviders();
  const chain: Array<'groq' | 'openai'> = [];
  if (providers.groq) chain.push('groq');
  if (providers.openai) chain.push('openai');

  for (const provider of chain) {
    const result = await chatCompletion(provider, {
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
      history: options.history,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 1200,
    });
    if (!result?.text) continue;
    const parsed = parseJsonFromAi(result.text);
    if (parsed) {
      return { parsed, provider, model: result.model };
    }
  }
  return null;
}

export type AgentStructuredOutput = {
  intent: string;
  params: Record<string, unknown>;
  message: string;
  suggestedActions: string[];
  confidence: number;
  citations?: { title: string; source: string }[];
};

export function normalizeAgentOutput(parsed: Record<string, unknown>): AgentStructuredOutput {
  return {
    intent: String(parsed.intent || 'GENERAL_QUERY'),
    params: (parsed.params as Record<string, unknown>) || {},
    message: String(parsed.message || '').trim() || 'How can I help you?',
    suggestedActions: Array.isArray(parsed.suggestedActions)
      ? parsed.suggestedActions.map(String).filter(Boolean).slice(0, 4)
      : [],
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.75,
    citations: Array.isArray(parsed.citations)
      ? parsed.citations
          .map((c) => {
            const item = c as Record<string, unknown>;
            return { title: String(item.title || ''), source: String(item.source || '') };
          })
          .filter((c) => c.title)
      : undefined,
  };
}
