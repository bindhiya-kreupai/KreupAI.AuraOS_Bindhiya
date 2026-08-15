/**
 * AI Workflow Generator — Groq/OpenAI/Gemini with rules-based fallback.
 */

import { chatCompletion, getConfiguredProviders, isLLMConfigured } from './llm-client';
import { WORKFLOW_GENERATOR_RULES } from './workflow-generator-rules';
import { generateWorkflowFallback, normalizeSteps } from './workflow-generator-fallback';
import type { WorkflowGenerationResult } from './workflow-generator-types';

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

function normalizeGeneration(
  parsed: Record<string, unknown>,
  provider: WorkflowGenerationResult['provider'],
  model?: string
): WorkflowGenerationResult {
  const steps = normalizeSteps(parsed.steps);
  if (steps.length === 0) throw new Error('No workflow steps returned');

  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions.map(String).filter(Boolean).slice(0, 4)
    : [];

  return {
    name: String(parsed.name || 'Generated Workflow').trim(),
    description: String(parsed.description || '').trim() || 'AI-generated HR workflow',
    trigger: String(parsed.trigger || 'HR_REQUEST').trim(),
    triggerEvent: parsed.triggerEvent ? String(parsed.triggerEvent) : undefined,
    steps,
    efficiencyScore: clamp(parsed.efficiencyScore, 0, 100, 75),
    estimatedHoursSaved: clamp(parsed.estimatedHoursSaved, 0, 100, 2),
    estimatedDurationMinutes: clamp(parsed.estimatedDurationMinutes, 1, 525600, 1440),
    confidenceScore: clamp(parsed.confidenceScore, 0, 100, 80),
    suggestions,
    provider,
    model,
    aiEnabled: provider !== 'rules',
  };
}

const GEMINI_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
];

async function generateWithProvider(
  provider: 'groq' | 'openai',
  prompt: string
): Promise<WorkflowGenerationResult | null> {
  const result = await chatCompletion(provider, {
    systemPrompt: WORKFLOW_GENERATOR_RULES,
    userPrompt: `Design an HR workflow for:\n\n"${prompt}"`,
    jsonMode: true,
    temperature: 0.25,
    maxTokens: 1800,
  });
  if (!result?.text) return null;
  const parsed = parseJsonFromAi(result.text);
  if (!parsed) return null;
  return normalizeGeneration(parsed, provider, result.model);
}

async function generateWithGemini(prompt: string): Promise<WorkflowGenerationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const userPrompt = `${WORKFLOW_GENERATOR_RULES}\n\nDesign an HR workflow for:\n\n"${prompt}"`;

  for (const endpoint of GEMINI_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.25,
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
      if (!parsed) continue;
      const model = endpoint.split('/models/')[1]?.split(':')[0] || 'gemini';
      return normalizeGeneration(parsed, 'gemini', model);
    } catch {
      /* try next */
    }
  }
  return null;
}

export function getWorkflowAIConfig() {
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

/**
 * Generate workflow from natural language. Falls back to rules when LLM unavailable.
 */
export async function generateWorkflowFromPrompt(
  prompt: string
): Promise<WorkflowGenerationResult> {
  const trimmed = String(prompt || '').trim();
  if (!trimmed) {
    throw new Error('Prompt is required');
  }

  if (!isLLMConfigured()) {
    return generateWorkflowFallback(trimmed);
  }

  const { groq, openai, gemini } = getConfiguredProviders();

  if (groq) {
    try {
      const result = await generateWithProvider('groq', trimmed);
      if (result) return result;
    } catch (err) {
      console.error('[workflow-generator-ai] Groq error:', err);
    }
  }

  if (openai) {
    try {
      const result = await generateWithProvider('openai', trimmed);
      if (result) return result;
    } catch (err) {
      console.error('[workflow-generator-ai] OpenAI error:', err);
    }
  }

  if (gemini) {
    try {
      const result = await generateWithGemini(trimmed);
      if (result) return result;
    } catch (err) {
      console.error('[workflow-generator-ai] Gemini error:', err);
    }
  }

  return generateWorkflowFallback(trimmed);
}
