/**
 * LLM client — Campus SubjectChatbot pattern (OpenAI SDK + Groq-compatible endpoint)
 */

import OpenAI from 'openai';

export type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type LLMProviderName = 'groq' | 'openai' | 'gemini';

let groqClient: OpenAI | null = null;
let openaiClient: OpenAI | null = null;

function getGroqClient(): OpenAI | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export function resolveModel(provider: LLMProviderName): string {
  const shared = process.env.HR_COACHING_MODEL;
  if (shared) return shared;

  switch (provider) {
    case 'groq':
      return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    case 'openai':
      return process.env.OPENAI_MODEL || process.env.SUBJECT_CHATBOT_MODEL || 'gpt-4o-mini';
    default:
      return 'gpt-4o-mini';
  }
}

export function getConfiguredProviders(): {
  groq: boolean;
  openai: boolean;
  gemini: boolean;
  primary: LLMProviderName | null;
} {
  const groq = !!process.env.GROQ_API_KEY;
  const openai = !!process.env.OPENAI_API_KEY;
  const gemini = !!process.env.GEMINI_API_KEY;
  const primary = groq ? 'groq' : openai ? 'openai' : gemini ? 'gemini' : null;
  return { groq, openai, gemini, primary };
}

export function isLLMConfigured(): boolean {
  const p = getConfiguredProviders();
  return p.groq || p.openai || p.gemini;
}

type CompletionOptions = {
  systemPrompt: string;
  userPrompt: string;
  history?: ChatHistoryItem[];
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
};

/**
 * Chat completion via OpenAI-compatible API (Groq or OpenAI) — mirrors Campus subjectChatbotService.
 */
export async function chatCompletion(
  provider: 'groq' | 'openai',
  options: CompletionOptions
): Promise<{ text: string; model: string } | null> {
  const client = provider === 'groq' ? getGroqClient() : getOpenAIClient();
  if (!client) return null;

  const model = resolveModel(provider);
  const history = options.history || [];
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: options.systemPrompt },
    ...history.slice(-6).map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: 'user', content: options.userPrompt },
  ];

  const baseParams = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1400,
  };

  try {
    const completion = await client.chat.completions.create(
      options.jsonMode
        ? { ...baseParams, response_format: { type: 'json_object' as const } }
        : baseParams
    );
    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    return { text, model };
  } catch (err) {
    // Groq / some models may reject json_mode — retry without it
    if (!options.jsonMode) {
      console.error(`[llm-client] ${provider} error:`, err);
      return null;
    }
    try {
      const completion = await client.chat.completions.create(baseParams);
      const text = completion.choices?.[0]?.message?.content?.trim();
      if (!text) return null;
      return { text, model };
    } catch (retryErr) {
      console.error(`[llm-client] ${provider} retry error:`, retryErr);
      return null;
    }
  }
}
