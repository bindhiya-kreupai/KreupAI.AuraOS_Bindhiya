import { APIClient } from '@/lib/api-client';
import type {
  Ticket,
  SLAPolicy,
  Agent,
  KnowledgeBaseArticle,
  CannedResponse,
  EscalationMatrix,
  HelpdeskAnalytics,
  HelpdeskSettings,
  HelpdeskAlert
} from './types';

export class TicketManagementService {
  static async getAllTickets(): Promise<Ticket[]> {
    return APIClient.get<Ticket[]>('/helpdesk/tickets');
  }

  static async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    return APIClient.post<Ticket>('/helpdesk/tickets', ticketData);
  }

  static async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    return APIClient.put<Ticket>(`/helpdesk/tickets/${ticketId}`, updates);
  }

  static async assignTicket(ticketId: string, agentInfo: any): Promise<Ticket> {
    return APIClient.post<Ticket>(`/helpdesk/tickets/${ticketId}/assign`, agentInfo);
  }

  static async addComment(ticketId: string, comment: any): Promise<Ticket> {
    return APIClient.post<Ticket>(`/helpdesk/tickets/${ticketId}/comments`, comment);
  }
}

export class SLATrackingService {
  static async getAllPolicies(): Promise<SLAPolicy[]> {
    return APIClient.get<SLAPolicy[]>('/helpdesk/sla-policies');
  }

  static async createPolicy(policyData: Partial<SLAPolicy>): Promise<SLAPolicy> {
    return APIClient.post<SLAPolicy>('/helpdesk/sla-policies', policyData);
  }

  static async updatePolicy(policyId: string, updates: Partial<SLAPolicy>): Promise<SLAPolicy> {
    return APIClient.put<SLAPolicy>(`/helpdesk/sla-policies/${policyId}`, updates);
  }
}

export class AgentManagementService {
  static async getAllAgents(): Promise<Agent[]> {
    return APIClient.get<Agent[]>('/helpdesk/agents');
  }

  static async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    return APIClient.post<Agent>('/helpdesk/agents', agentData);
  }

  static async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
    return APIClient.put<Agent>(`/helpdesk/agents/${agentId}`, updates);
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    return APIClient.get<Agent[]>('/helpdesk/agents/available');
  }
}

export class KnowledgeBaseService {
  static async getAllArticles(): Promise<KnowledgeBaseArticle[]> {
    return APIClient.get<KnowledgeBaseArticle[]>('/helpdesk/knowledge-base');
  }

  static async createArticle(articleData: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    return APIClient.post<KnowledgeBaseArticle>('/helpdesk/knowledge-base', articleData);
  }

  static async updateArticle(articleId: string, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    return APIClient.put<KnowledgeBaseArticle>(`/helpdesk/knowledge-base/${articleId}`, updates);
  }

  static async searchArticles(query: string): Promise<KnowledgeBaseArticle[]> {
    return APIClient.get<KnowledgeBaseArticle[]>('/helpdesk/knowledge-base/search', { query });
  }
}

export class CannedResponseService {
  static async getAllResponses(): Promise<CannedResponse[]> {
    return APIClient.get<CannedResponse[]>('/helpdesk/canned-responses');
  }

  static async createResponse(responseData: Partial<CannedResponse>): Promise<CannedResponse> {
    return APIClient.post<CannedResponse>('/helpdesk/canned-responses', responseData);
  }

  static async updateResponse(responseId: string, updates: Partial<CannedResponse>): Promise<CannedResponse> {
    return APIClient.put<CannedResponse>(`/helpdesk/canned-responses/${responseId}`, updates);
  }
}

export class EscalationMatrixService {
  static async getAllMatrices(): Promise<EscalationMatrix[]> {
    return APIClient.get<EscalationMatrix[]>('/helpdesk/escalation-matrices');
  }

  static async createMatrix(matrixData: Partial<EscalationMatrix>): Promise<EscalationMatrix> {
    return APIClient.post<EscalationMatrix>('/helpdesk/escalation-matrices', matrixData);
  }

  static async updateMatrix(matrixId: string, updates: Partial<EscalationMatrix>): Promise<EscalationMatrix> {
    return APIClient.put<EscalationMatrix>(`/helpdesk/escalation-matrices/${matrixId}`, updates);
  }
}

export class AnalyticsService {
  static async getAnalytics(startDate: string, endDate: string): Promise<HelpdeskAnalytics | null> {
    return APIClient.get<HelpdeskAnalytics | null>('/helpdesk/analytics', { startDate, endDate });
  }

  static async createAnalytics(analyticsData: Partial<HelpdeskAnalytics>): Promise<HelpdeskAnalytics> {
    return APIClient.post<HelpdeskAnalytics>('/helpdesk/analytics', analyticsData);
  }
}

export class HelpdeskSettingsService {
  static async getSettings(): Promise<HelpdeskSettings | null> {
    return APIClient.get<HelpdeskSettings | null>('/helpdesk/settings');
  }

  static async updateSettings(settings: Partial<HelpdeskSettings>): Promise<HelpdeskSettings> {
    return APIClient.put<HelpdeskSettings>('/helpdesk/settings', settings);
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<HelpdeskAlert[]> {
    return APIClient.get<HelpdeskAlert[]>('/helpdesk/alerts');
  }

  static async createAlert(alertData: Partial<HelpdeskAlert>): Promise<HelpdeskAlert> {
    return APIClient.post<HelpdeskAlert>('/helpdesk/alerts', alertData);
  }
}
