import {
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

const STORAGE_KEYS = {
  TICKETS: 'helpdesk_tickets',
  SLA_POLICIES: 'helpdesk_sla_policies',
  AGENTS: 'helpdesk_agents',
  KNOWLEDGE_BASE: 'helpdesk_knowledge_base',
  CANNED_RESPONSES: 'helpdesk_canned_responses',
  ESCALATION_MATRICES: 'helpdesk_escalation_matrices',
  ANALYTICS: 'helpdesk_analytics',
  SETTINGS: 'helpdesk_settings',
  ALERTS: 'helpdesk_alerts'
};

export class TicketManagementService {
  static async getAllTickets(): Promise<Ticket[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  }

  static async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    const tickets = await this.getAllTickets();
    const ticketNumber = 'TKT-' + Date.now();
    const newTicket: Ticket = {
      ticketId: 'ticket-' + Date.now(),
      ticketNumber,
      subject: ticketData.subject || '',
      description: ticketData.description || '',
      category: ticketData.category || 'other',
      priority: ticketData.priority || 'medium',
      status: ticketData.status || 'new',
      requester: ticketData.requester || {} as any,
      slaInfo: ticketData.slaInfo || {} as any,
      tags: ticketData.tags || [],
      attachments: ticketData.attachments || [],
      comments: ticketData.comments || [],
      history: [{
        historyId: 'hist-' + Date.now(),
        action: 'created',
        performedBy: ticketData.requester?.employeeName || 'System',
        performedAt: new Date().toISOString(),
        changes: []
      }],
      createdAt: new Date().toISOString(),
      ...ticketData
    };
    tickets.push(newTicket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return newTicket;
  }

  static async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket> {
    const tickets = await this.getAllTickets();
    const index = tickets.findIndex(t => t.ticketId === ticketId);
    if (index === -1) throw new Error('Ticket not found');

    tickets[index] = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return tickets[index];
  }

  static async assignTicket(ticketId: string, agentInfo: any): Promise<Ticket> {
    const tickets = await this.getAllTickets();
    const index = tickets.findIndex(t => t.ticketId === ticketId);
    if (index === -1) throw new Error('Ticket not found');

    tickets[index].assignedAgent = {
      ...agentInfo,
      assignedAt: new Date().toISOString()
    };
    tickets[index].status = 'open';
    tickets[index].history = tickets[index].history || [];
    tickets[index].history.push({
      historyId: 'hist-' + Date.now(),
      action: 'assigned',
      performedBy: 'System',
      performedAt: new Date().toISOString(),
      changes: [{
        field: 'assignedAgent',
        oldValue: null,
        newValue: agentInfo.agentName
      }]
    });

    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return tickets[index];
  }

  static async addComment(ticketId: string, comment: any): Promise<Ticket> {
    const tickets = await this.getAllTickets();
    const index = tickets.findIndex(t => t.ticketId === ticketId);
    if (index === -1) throw new Error('Ticket not found');

    const newComment = {
      commentId: 'comment-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...comment
    };

    tickets[index].comments = tickets[index].comments || [];
    tickets[index].comments.push(newComment);
    tickets[index].updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return tickets[index];
  }
}

export class SLATrackingService {
  static async getAllPolicies(): Promise<SLAPolicy[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SLA_POLICIES);
    return data ? JSON.parse(data) : [];
  }

  static async createPolicy(policyData: Partial<SLAPolicy>): Promise<SLAPolicy> {
    const policies = await this.getAllPolicies();
    const newPolicy: SLAPolicy = {
      policyId: 'policy-' + Date.now(),
      policyName: policyData.policyName || '',
      description: policyData.description || '',
      priority: policyData.priority || 'medium',
      categories: policyData.categories || [],
      firstResponseTime: policyData.firstResponseTime || 60,
      resolutionTime: policyData.resolutionTime || 480,
      businessHoursOnly: policyData.businessHoursOnly !== false,
      escalationRules: policyData.escalationRules || [],
      status: policyData.status || 'active',
      createdAt: new Date().toISOString(),
      ...policyData
    };
    policies.push(newPolicy);
    localStorage.setItem(STORAGE_KEYS.SLA_POLICIES, JSON.stringify(policies));
    return newPolicy;
  }

  static async updatePolicy(policyId: string, updates: Partial<SLAPolicy>): Promise<SLAPolicy> {
    const policies = await this.getAllPolicies();
    const index = policies.findIndex(p => p.policyId === policyId);
    if (index === -1) throw new Error('Policy not found');
    policies[index] = { ...policies[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SLA_POLICIES, JSON.stringify(policies));
    return policies[index];
  }
}

export class AgentManagementService {
  static async getAllAgents(): Promise<Agent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    const agents = await this.getAllAgents();
    const newAgent: Agent = {
      agentId: 'agent-' + Date.now(),
      employeeId: agentData.employeeId || '',
      employeeName: agentData.employeeName || '',
      email: agentData.email || '',
      department: agentData.department || '',
      role: agentData.role || 'agent',
      skillSet: agentData.skillSet || [],
      availability: agentData.availability || {} as any,
      performance: agentData.performance || {} as any,
      currentWorkload: agentData.currentWorkload || 0,
      maxCapacity: agentData.maxCapacity || 20,
      status: agentData.status || 'available',
      createdAt: new Date().toISOString(),
      ...agentData
    };
    agents.push(newAgent);
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    return newAgent;
  }

  static async updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
    const agents = await this.getAllAgents();
    const index = agents.findIndex(a => a.agentId === agentId);
    if (index === -1) throw new Error('Agent not found');
    agents[index] = { ...agents[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    return agents[index];
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    const agents = await this.getAllAgents();
    return agents.filter(a => a.status === 'available' && a.currentWorkload < a.maxCapacity);
  }
}

export class KnowledgeBaseService {
  static async getAllArticles(): Promise<KnowledgeBaseArticle[]> {
    const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE);
    return data ? JSON.parse(data) : [];
  }

  static async createArticle(articleData: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    const articles = await this.getAllArticles();
    const newArticle: KnowledgeBaseArticle = {
      articleId: 'article-' + Date.now(),
      title: articleData.title || '',
      content: articleData.content || '',
      summary: articleData.summary || '',
      category: articleData.category || '',
      tags: articleData.tags || [],
      author: articleData.author || '',
      status: articleData.status || 'draft',
      visibility: articleData.visibility || 'internal',
      relatedArticles: articleData.relatedArticles || [],
      attachments: articleData.attachments || [],
      views: 0,
      helpful: 0,
      notHelpful: 0,
      linkedTickets: articleData.linkedTickets || [],
      version: 1,
      versionHistory: [],
      createdAt: new Date().toISOString(),
      ...articleData
    };
    articles.push(newArticle);
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(articles));
    return newArticle;
  }

  static async updateArticle(articleId: string, updates: Partial<KnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    const articles = await this.getAllArticles();
    const index = articles.findIndex(a => a.articleId === articleId);
    if (index === -1) throw new Error('Article not found');

    const currentVersion = articles[index].version || 1;
    articles[index] = {
      ...articles[index],
      ...updates,
      version: currentVersion + 1,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(articles));
    return articles[index];
  }

  static async searchArticles(query: string): Promise<KnowledgeBaseArticle[]> {
    const articles = await this.getAllArticles();
    const lowerQuery = query.toLowerCase();
    return articles.filter(a =>
      a.status === 'published' &&
      (a.title.toLowerCase().includes(lowerQuery) ||
       a.content.toLowerCase().includes(lowerQuery) ||
       a.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
}

export class CannedResponseService {
  static async getAllResponses(): Promise<CannedResponse[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CANNED_RESPONSES);
    return data ? JSON.parse(data) : [];
  }

  static async createResponse(responseData: Partial<CannedResponse>): Promise<CannedResponse> {
    const responses = await this.getAllResponses();
    const newResponse: CannedResponse = {
      responseId: 'response-' + Date.now(),
      title: responseData.title || '',
      shortcut: responseData.shortcut || '',
      content: responseData.content || '',
      category: responseData.category || '',
      tags: responseData.tags || [],
      visibility: responseData.visibility || 'personal',
      createdBy: responseData.createdBy || '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      ...responseData
    };
    responses.push(newResponse);
    localStorage.setItem(STORAGE_KEYS.CANNED_RESPONSES, JSON.stringify(responses));
    return newResponse;
  }

  static async updateResponse(responseId: string, updates: Partial<CannedResponse>): Promise<CannedResponse> {
    const responses = await this.getAllResponses();
    const index = responses.findIndex(r => r.responseId === responseId);
    if (index === -1) throw new Error('Response not found');
    responses[index] = { ...responses[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CANNED_RESPONSES, JSON.stringify(responses));
    return responses[index];
  }
}

export class EscalationMatrixService {
  static async getAllMatrices(): Promise<EscalationMatrix[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ESCALATION_MATRICES);
    return data ? JSON.parse(data) : [];
  }

  static async createMatrix(matrixData: Partial<EscalationMatrix>): Promise<EscalationMatrix> {
    const matrices = await this.getAllMatrices();
    const newMatrix: EscalationMatrix = {
      matrixId: 'matrix-' + Date.now(),
      matrixName: matrixData.matrixName || '',
      description: matrixData.description || '',
      levels: matrixData.levels || [],
      triggers: matrixData.triggers || [],
      notifications: matrixData.notifications || [],
      status: matrixData.status || 'active',
      createdAt: new Date().toISOString(),
      ...matrixData
    };
    matrices.push(newMatrix);
    localStorage.setItem(STORAGE_KEYS.ESCALATION_MATRICES, JSON.stringify(matrices));
    return newMatrix;
  }

  static async updateMatrix(matrixId: string, updates: Partial<EscalationMatrix>): Promise<EscalationMatrix> {
    const matrices = await this.getAllMatrices();
    const index = matrices.findIndex(m => m.matrixId === matrixId);
    if (index === -1) throw new Error('Matrix not found');
    matrices[index] = { ...matrices[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ESCALATION_MATRICES, JSON.stringify(matrices));
    return matrices[index];
  }
}

export class AnalyticsService {
  static async getAnalytics(startDate: string, endDate: string): Promise<HelpdeskAnalytics | null> {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!data) return null;
    const analytics: HelpdeskAnalytics[] = JSON.parse(data);
    return analytics.find(a => a.period.startDate === startDate && a.period.endDate === endDate) || null;
  }

  static async createAnalytics(analyticsData: Partial<HelpdeskAnalytics>): Promise<HelpdeskAnalytics> {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    const analytics: HelpdeskAnalytics[] = data ? JSON.parse(data) : [];
    const newAnalytics: HelpdeskAnalytics = {
      analyticsId: 'analytics-' + Date.now(),
      period: analyticsData.period || {} as any,
      ticketMetrics: analyticsData.ticketMetrics || {} as any,
      slaMetrics: analyticsData.slaMetrics || {} as any,
      agentMetrics: analyticsData.agentMetrics || {} as any,
      categoryBreakdown: analyticsData.categoryBreakdown || [],
      satisfactionMetrics: analyticsData.satisfactionMetrics || {} as any,
      trends: analyticsData.trends || [],
      ...analyticsData
    };
    analytics.push(newAnalytics);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
    return newAnalytics;
  }
}

export class HelpdeskSettingsService {
  static async getSettings(): Promise<HelpdeskSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<HelpdeskSettings>): Promise<HelpdeskSettings> {
    const current = await this.getSettings();
    const updated: HelpdeskSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString()
    } as HelpdeskSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

export class AlertsService {
  static async getAllAlerts(): Promise<HelpdeskAlert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<HelpdeskAlert>): Promise<HelpdeskAlert> {
    const alerts = await this.getAllAlerts();
    const newAlert: HelpdeskAlert = {
      alertId: 'alert-' + Date.now(),
      alertType: alertData.alertType || 'high_backlog',
      severity: alertData.severity || 'low',
      title: alertData.title || '',
      message: alertData.message || '',
      relatedEntity: alertData.relatedEntity || {} as any,
      status: alertData.status || 'active',
      createdAt: new Date().toISOString(),
      ...alertData
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return newAlert;
  }
}
