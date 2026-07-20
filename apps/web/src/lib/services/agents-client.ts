/**
 * Typed client for Agentic AI dashboard APIs
 */

import type { AgentChatResponse, AgentTypeValue } from '@/lib/ai/agent-types';

type ApiResult<T> = { success: boolean; data?: T; error?: string; errorAr?: string };

async function agentsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json.data as T;
}

export type AgentDefinition = {
  id: string;
  type: string;
  name: string;
  description: string;
  capabilities: Array<{ id: string; name: string; description: string }>;
  isActive: boolean;
};

export type AgentSessionResponse = {
  sessionId: string;
  agentType: AgentTypeValue;
  startedAt: string;
  messages: Array<{ role: string; content: string; timestamp?: string }>;
};

export type MetricsSummary = {
  totalTasks: number;
  avgResponseTimeMs: number;
  successRate: number;
  activeAgents: number;
  byAgent: Record<string, { total: number; success: number; topActions: Record<string, number> }>;
  periodDays: number;
};

export type AgentMetricsDetail = {
  agentType: string;
  totalRequests: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
  uptime: number;
  topActions: Array<{ action: string; count: number }>;
};

export const agentsClient = {
  listAgents: () => agentsFetch<AgentDefinition[]>('/api/agents'),

  getHRAgent: () => agentsFetch<AgentDefinition>('/api/agents/hr'),

  getRecruitmentAgent: () => agentsFetch<AgentDefinition>('/api/agents/recruitment'),

  getAnalyticsAgent: () => agentsFetch<AgentDefinition>('/api/agents/analytics'),

  startSession: (agentType: AgentTypeValue) =>
    agentsFetch<AgentSessionResponse>('/api/agents/sessions', {
      method: 'POST',
      body: JSON.stringify({ agentType }),
    }),

  chatHR: (message: string, sessionId?: string) =>
    agentsFetch<AgentChatResponse>('/api/agents/hr', {
      method: 'POST',
      body: JSON.stringify({ action: 'chat', message, sessionId }),
    }),

  chatRecruitment: (message: string, sessionId?: string) =>
    agentsFetch<AgentChatResponse>('/api/agents/recruitment', {
      method: 'POST',
      body: JSON.stringify({ action: 'chat', message, sessionId }),
    }),

  chatAnalytics: (message: string, sessionId?: string) =>
    agentsFetch<AgentChatResponse>('/api/agents/analytics', {
      method: 'POST',
      body: JSON.stringify({ action: 'chat', message, sessionId }),
    }),

  getMetricsSummary: () => agentsFetch<MetricsSummary>('/api/agents/metrics/summary'),

  getAgentMetrics: (agentType: AgentTypeValue) =>
    agentsFetch<AgentMetricsDetail>(`/api/agents/metrics?agentType=${agentType}`),
};
