/**
 * Shared types for Agentic AI module
 */

export const AGENT_TYPES = {
  HR: 'HR_AGENT',
  RECRUITMENT: 'RECRUITMENT_AGENT',
  ANALYTICS: 'ANALYTICS_AGENT',
} as const;

export type AgentTypeKey = keyof typeof AGENT_TYPES;
export type AgentTypeValue = (typeof AGENT_TYPES)[AgentTypeKey];

export type AgentChatRequest = {
  action: 'chat';
  message: string;
  sessionId?: string;
  locale?: 'en' | 'ar';
};

export type AgentChatResponse = {
  sessionId: string;
  message: string;
  suggestedActions?: string[];
  actionExecuted?: { type: string; result: unknown };
  confidence: number;
  provider: 'groq' | 'openai' | 'gemini' | 'fallback';
  citations?: { title: string; source: string }[];
};

export type AgentErrorResponse = {
  success: false;
  error: string;
  errorAr: string;
};

export function agentError(message: string, messageAr?: string): AgentErrorResponse {
  return {
    success: false,
    error: message,
    errorAr: messageAr || 'حدث خطأ',
  };
}
