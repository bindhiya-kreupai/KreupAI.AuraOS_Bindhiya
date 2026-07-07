/**
 * Client-side data services for the HR Helpdesk module. Every method calls a
 * real tenant-scoped API route and unwraps the standard
 * { success, data, meta } envelope so callers get plain objects/arrays.
 */
import { APIClient } from '@/lib/api-client';

export interface HelpdeskTicketDTO {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string | null;
  category: string;
  priority: string;
  status: string;
  assigneeId?: string | null;
  requesterId: string;
  slaDueAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeArticleDTO {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  readMinutes: number;
  status: string;
  createdAt: string;
}

export interface ServiceRequestDTO {
  id: string;
  requestNumber: string;
  service: string;
  catalogItemId?: string | null;
  description?: string | null;
  currentStage?: string | null;
  status: string;
  estCompletion?: string | null;
  submittedAt: string;
}

export interface CatalogItemDTO {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  iconKey?: string | null;
  slaHours: number;
  isActive: boolean;
  requestCount: number;
}

export interface CaseDTO {
  id: string;
  caseNumber: string;
  title: string;
  description?: string | null;
  category: string;
  priority: string;
  status: string;
  stage?: string | null;
  assigneeId?: string | null;
  reporterId?: string | null;
  notes?: CaseNoteDTO[];
  createdAt: string;
}

export interface CaseNoteDTO {
  id: string;
  caseId: string;
  authorId?: string | null;
  authorName?: string | null;
  noteType: string;
  content: string;
  createdAt: string;
}

export interface ChatSessionDTO {
  id: string;
  subject?: string | null;
  requesterId: string;
  agentId?: string | null;
  status: string;
  lastMessageAt: string;
}

export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

export interface ChannelDTO {
  id: string;
  channelType: string;
  name: string;
  config?: string | null;
  status: string;
  isActive: boolean;
}

export interface AutomationDTO {
  id: string;
  name: string;
  description?: string | null;
  triggerType: string;
  triggerLabel?: string | null;
  stepCount: number;
  executions: number;
  status: string;
}

export interface AutomationLogDTO {
  id: string;
  automationId: string;
  status: string;
  message?: string | null;
  createdAt: string;
}

export interface ImprovementDTO {
  id: string;
  title: string;
  description?: string | null;
  source: string;
  impact: string;
  effort: string;
  status: string;
  feedbackQuote?: string | null;
}

export interface AnalyticsDTO {
  windowDays: number;
  total: number;
  open: number;
  resolved: number;
  byCategory: { category: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  generatedAt: string;
}

export const HelpdeskTicketsApi = {
  list: async (): Promise<HelpdeskTicketDTO[]> =>
    APIClient.unwrapList<HelpdeskTicketDTO>(await APIClient.get('/helpdesk/tickets?limit=200')),
  create: async (data: Partial<HelpdeskTicketDTO>): Promise<HelpdeskTicketDTO | null> =>
    APIClient.unwrapItem<HelpdeskTicketDTO>(await APIClient.post('/helpdesk/tickets', data)),
  update: async (id: string, data: Partial<HelpdeskTicketDTO>): Promise<HelpdeskTicketDTO | null> =>
    APIClient.unwrapItem<HelpdeskTicketDTO>(await APIClient.put(`/helpdesk/tickets/${id}`, data)),
  assign: async (id: string, assigneeId?: string): Promise<HelpdeskTicketDTO | null> =>
    APIClient.unwrapItem<HelpdeskTicketDTO>(
      await APIClient.post(`/helpdesk/tickets/${id}/assign`, assigneeId ? { assigneeId } : {})
    ),
};

export const KnowledgeApi = {
  list: async (): Promise<KnowledgeArticleDTO[]> =>
    APIClient.unwrapList<KnowledgeArticleDTO>(
      await APIClient.get('/helpdesk/knowledge-base?limit=100')
    ),
  search: async (query: string): Promise<KnowledgeArticleDTO[]> =>
    APIClient.unwrapList<KnowledgeArticleDTO>(
      await APIClient.get('/helpdesk/knowledge-base/search', { query })
    ),
  create: async (data: Partial<KnowledgeArticleDTO>): Promise<KnowledgeArticleDTO | null> =>
    APIClient.unwrapItem<KnowledgeArticleDTO>(
      await APIClient.post('/helpdesk/knowledge-base', data)
    ),
};

export const ServiceRequestsApi = {
  list: async (): Promise<ServiceRequestDTO[]> =>
    APIClient.unwrapList<ServiceRequestDTO>(
      await APIClient.get('/helpdesk/service-requests?limit=100')
    ),
  create: async (data: Partial<ServiceRequestDTO>): Promise<ServiceRequestDTO | null> =>
    APIClient.unwrapItem<ServiceRequestDTO>(
      await APIClient.post('/helpdesk/service-requests', data)
    ),
};

export const CatalogApi = {
  list: async (): Promise<CatalogItemDTO[]> =>
    APIClient.unwrapList<CatalogItemDTO>(
      await APIClient.get('/helpdesk/service-catalog?limit=100')
    ),
  create: async (data: Partial<CatalogItemDTO>): Promise<CatalogItemDTO | null> =>
    APIClient.unwrapItem<CatalogItemDTO>(await APIClient.post('/helpdesk/service-catalog', data)),
};

export const CasesApi = {
  list: async (): Promise<CaseDTO[]> =>
    APIClient.unwrapList<CaseDTO>(await APIClient.get('/helpdesk/cases?limit=100')),
  get: async (id: string): Promise<CaseDTO | null> =>
    APIClient.unwrapItem<CaseDTO>(await APIClient.get(`/helpdesk/cases/${id}`)),
  create: async (data: Partial<CaseDTO>): Promise<CaseDTO | null> =>
    APIClient.unwrapItem<CaseDTO>(await APIClient.post('/helpdesk/cases', data)),
  update: async (id: string, data: Partial<CaseDTO>): Promise<CaseDTO | null> =>
    APIClient.unwrapItem<CaseDTO>(await APIClient.put(`/helpdesk/cases/${id}`, data)),
  addNote: async (id: string, content: string): Promise<CaseNoteDTO | null> =>
    APIClient.unwrapItem<CaseNoteDTO>(
      await APIClient.post(`/helpdesk/cases/${id}/notes`, { content })
    ),
};

export const ChatApi = {
  listSessions: async (): Promise<ChatSessionDTO[]> =>
    APIClient.unwrapList<ChatSessionDTO>(await APIClient.get('/helpdesk/chat/sessions?mine=true')),
  createSession: async (subject?: string): Promise<ChatSessionDTO | null> =>
    APIClient.unwrapItem<ChatSessionDTO>(
      await APIClient.post('/helpdesk/chat/sessions', { subject })
    ),
  listMessages: async (sessionId: string, since?: string): Promise<ChatMessageDTO[]> =>
    APIClient.unwrapList<ChatMessageDTO>(
      await APIClient.get(
        `/helpdesk/chat/sessions/${sessionId}/messages`,
        since ? { since } : undefined
      )
    ),
  sendMessage: async (sessionId: string, content: string): Promise<ChatMessageDTO | null> =>
    APIClient.unwrapItem<ChatMessageDTO>(
      await APIClient.post(`/helpdesk/chat/sessions/${sessionId}/messages`, { content })
    ),
};

export const ChannelsApi = {
  list: async (): Promise<ChannelDTO[]> =>
    APIClient.unwrapList<ChannelDTO>(await APIClient.get('/helpdesk/channels')),
  update: async (id: string, data: Partial<ChannelDTO>): Promise<ChannelDTO | null> =>
    APIClient.unwrapItem<ChannelDTO>(await APIClient.put(`/helpdesk/channels/${id}`, data)),
};

export const AutomationsApi = {
  list: async (): Promise<AutomationDTO[]> =>
    APIClient.unwrapList<AutomationDTO>(await APIClient.get('/helpdesk/automations?limit=100')),
  create: async (data: Partial<AutomationDTO>): Promise<AutomationDTO | null> =>
    APIClient.unwrapItem<AutomationDTO>(await APIClient.post('/helpdesk/automations', data)),
  update: async (id: string, data: Partial<AutomationDTO>): Promise<AutomationDTO | null> =>
    APIClient.unwrapItem<AutomationDTO>(await APIClient.put(`/helpdesk/automations/${id}`, data)),
  logs: async (id: string): Promise<AutomationLogDTO[]> =>
    APIClient.unwrapList<AutomationLogDTO>(await APIClient.get(`/helpdesk/automations/${id}/logs`)),
};

export const ImprovementsApi = {
  list: async (): Promise<ImprovementDTO[]> =>
    APIClient.unwrapList<ImprovementDTO>(await APIClient.get('/helpdesk/improvements?limit=100')),
  create: async (data: Partial<ImprovementDTO>): Promise<ImprovementDTO | null> =>
    APIClient.unwrapItem<ImprovementDTO>(await APIClient.post('/helpdesk/improvements', data)),
  update: async (id: string, data: Partial<ImprovementDTO>): Promise<ImprovementDTO | null> =>
    APIClient.unwrapItem<ImprovementDTO>(await APIClient.put(`/helpdesk/improvements/${id}`, data)),
};

export const HelpdeskAnalyticsApi = {
  get: async (): Promise<AnalyticsDTO | null> =>
    APIClient.unwrapItem<AnalyticsDTO>(await APIClient.get('/helpdesk/analytics')),
};
