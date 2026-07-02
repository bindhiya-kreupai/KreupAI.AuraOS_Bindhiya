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
  HelpdeskAlert,
} from './types';

// All helpdesk API routes return the standard { success, data, meta } envelope
// (lists as { data: [...] } or { data: { items: [...] } }). These services
// unwrap that envelope so the consuming hook/components always get plain
// arrays/objects — the previous code returned the raw envelope, which broke
// `.length`/property access downstream.

export class TicketManagementService {
  static async getAllTickets(): Promise<Ticket[]> {
    return APIClient.unwrapList<Ticket>(await APIClient.get('/helpdesk/tickets?limit=200'));
  }

  static async createTicket(ticketData: Partial<Ticket>): Promise<Ticket | null> {
    return APIClient.unwrapItem<Ticket>(await APIClient.post('/helpdesk/tickets', ticketData));
  }

  static async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
    return APIClient.unwrapItem<Ticket>(
      await APIClient.put(`/helpdesk/tickets/${ticketId}`, updates)
    );
  }

  static async assignTicket(ticketId: string, agentInfo: any): Promise<Ticket | null> {
    return APIClient.unwrapItem<Ticket>(
      await APIClient.post(`/helpdesk/tickets/${ticketId}/assign`, agentInfo)
    );
  }

  static async addComment(ticketId: string, comment: any): Promise<Ticket | null> {
    return APIClient.unwrapItem<Ticket>(
      await APIClient.post(`/helpdesk/tickets/${ticketId}/comments`, comment)
    );
  }
}

export class SLATrackingService {
  static async getAllPolicies(): Promise<SLAPolicy[]> {
    return APIClient.unwrapList<SLAPolicy>(await APIClient.get('/helpdesk/sla-policies'));
  }

  static async createPolicy(policyData: Partial<SLAPolicy>): Promise<SLAPolicy | null> {
    return APIClient.unwrapItem<SLAPolicy>(
      await APIClient.post('/helpdesk/sla-policies', policyData)
    );
  }

  static async updatePolicy(
    policyId: string,
    updates: Partial<SLAPolicy>
  ): Promise<SLAPolicy | null> {
    return APIClient.unwrapItem<SLAPolicy>(
      await APIClient.put(`/helpdesk/sla-policies/${policyId}`, updates)
    );
  }
}

export class AgentManagementService {
  static async getAllAgents(): Promise<Agent[]> {
    return APIClient.unwrapList<Agent>(await APIClient.get('/helpdesk/agents'));
  }

  static async createAgent(agentData: Partial<Agent>): Promise<Agent | null> {
    return APIClient.unwrapItem<Agent>(await APIClient.post('/helpdesk/agents', agentData));
  }

  static async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    return APIClient.unwrapItem<Agent>(await APIClient.put(`/helpdesk/agents/${agentId}`, updates));
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    return APIClient.unwrapList<Agent>(await APIClient.get('/helpdesk/agents/available'));
  }
}

export class KnowledgeBaseService {
  static async getAllArticles(): Promise<KnowledgeBaseArticle[]> {
    return APIClient.unwrapList<KnowledgeBaseArticle>(
      await APIClient.get('/helpdesk/knowledge-base')
    );
  }

  static async createArticle(
    articleData: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle | null> {
    return APIClient.unwrapItem<KnowledgeBaseArticle>(
      await APIClient.post('/helpdesk/knowledge-base', articleData)
    );
  }

  static async updateArticle(
    articleId: string,
    updates: Partial<KnowledgeBaseArticle>
  ): Promise<KnowledgeBaseArticle | null> {
    return APIClient.unwrapItem<KnowledgeBaseArticle>(
      await APIClient.put(`/helpdesk/knowledge-base/${articleId}`, updates)
    );
  }

  static async searchArticles(query: string): Promise<KnowledgeBaseArticle[]> {
    return APIClient.unwrapList<KnowledgeBaseArticle>(
      await APIClient.get('/helpdesk/knowledge-base/search', { query })
    );
  }
}

export class CannedResponseService {
  static async getAllResponses(): Promise<CannedResponse[]> {
    return APIClient.unwrapList<CannedResponse>(await APIClient.get('/helpdesk/canned-responses'));
  }

  static async createResponse(
    responseData: Partial<CannedResponse>
  ): Promise<CannedResponse | null> {
    return APIClient.unwrapItem<CannedResponse>(
      await APIClient.post('/helpdesk/canned-responses', responseData)
    );
  }

  static async updateResponse(
    responseId: string,
    updates: Partial<CannedResponse>
  ): Promise<CannedResponse | null> {
    return APIClient.unwrapItem<CannedResponse>(
      await APIClient.put(`/helpdesk/canned-responses/${responseId}`, updates)
    );
  }
}

export class EscalationMatrixService {
  static async getAllMatrices(): Promise<EscalationMatrix[]> {
    return APIClient.unwrapList<EscalationMatrix>(
      await APIClient.get('/helpdesk/escalation-matrices')
    );
  }

  static async createMatrix(
    matrixData: Partial<EscalationMatrix>
  ): Promise<EscalationMatrix | null> {
    return APIClient.unwrapItem<EscalationMatrix>(
      await APIClient.post('/helpdesk/escalation-matrices', matrixData)
    );
  }

  static async updateMatrix(
    matrixId: string,
    updates: Partial<EscalationMatrix>
  ): Promise<EscalationMatrix | null> {
    return APIClient.unwrapItem<EscalationMatrix>(
      await APIClient.put(`/helpdesk/escalation-matrices/${matrixId}`, updates)
    );
  }
}

export class AnalyticsService {
  static async getAnalytics(startDate: string, endDate: string): Promise<HelpdeskAnalytics | null> {
    return APIClient.unwrapItem<HelpdeskAnalytics>(
      await APIClient.get('/helpdesk/analytics', { startDate, endDate })
    );
  }

  static async createAnalytics(
    analyticsData: Partial<HelpdeskAnalytics>
  ): Promise<HelpdeskAnalytics | null> {
    return APIClient.unwrapItem<HelpdeskAnalytics>(
      await APIClient.post('/helpdesk/analytics', analyticsData)
    );
  }
}

export class HelpdeskSettingsService {
  static async getSettings(): Promise<HelpdeskSettings | null> {
    return APIClient.unwrapItem<HelpdeskSettings>(await APIClient.get('/helpdesk/settings'));
  }

  static async updateSettings(
    settings: Partial<HelpdeskSettings>
  ): Promise<HelpdeskSettings | null> {
    return APIClient.unwrapItem<HelpdeskSettings>(
      await APIClient.put('/helpdesk/settings', settings)
    );
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<HelpdeskAlert[]> {
    return APIClient.unwrapList<HelpdeskAlert>(await APIClient.get('/helpdesk/alerts'));
  }

  static async createAlert(alertData: Partial<HelpdeskAlert>): Promise<HelpdeskAlert | null> {
    return APIClient.unwrapItem<HelpdeskAlert>(await APIClient.post('/helpdesk/alerts', alertData));
  }
}
