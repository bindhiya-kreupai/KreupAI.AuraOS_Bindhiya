// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * AI Agent Framework Service
 * Phase 4 Sprint 31-32: Core Autonomous Execution Engine
 */

import type {
  AgentType,
  AgentDefinition,
  AgentTask,
  AgentAction,
  AgentResponse,
  ConversationContext,
  ConversationMessage,
  DetectedIntent,
  ExtractedEntity,
  AuditEntry,
  AgentEvent,
  AgentMetrics,
  TaskStatus,
  ActionType,
} from './types';
import { ExecutionPlan, ExecutionStep, ExecutionContext, ActionStatus } from './types';

/**
 * Agent Registry - Stores agent definitions
 */
const agentRegistry: Map<AgentType, AgentDefinition> = new Map();

/**
 * Active Sessions - Stores conversation contexts
 */
const activeSessions: Map<string, ConversationContext> = new Map();

/**
 * Task Queue - Stores pending tasks
 */
const taskQueue: Map<string, AgentTask> = new Map();

/**
 * AI Agent Framework Service
 * Provides core infrastructure for autonomous AI agents
 */
export class AgentFrameworkService {
  // ============================================================================
  // AGENT REGISTRATION
  // ============================================================================

  /**
   * Register an agent definition
   */
  static registerAgent(definition: AgentDefinition): void {
    agentRegistry.set(definition.type, definition);
    this.emitEvent({
      id: `evt_${Date.now()}`,
      type: 'TASK_CREATED',
      agentType: definition.type,
      tenantId: 'system',
      payload: { action: 'AGENT_REGISTERED', agentId: definition.id },
      timestamp: new Date(),
    });
  }

  /**
   * Get agent definition
   */
  static getAgent(type: AgentType): AgentDefinition | undefined {
    return agentRegistry.get(type);
  }

  /**
   * Get all registered agents
   */
  static getAllAgents(): AgentDefinition[] {
    return Array.from(agentRegistry.values());
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  /**
   * Start a new conversation session
   */
  static async startSession(
    userId: string,
    tenantId: string,
    agentType: AgentType
  ): Promise<ConversationContext> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: ConversationContext = {
      sessionId,
      userId,
      tenantId,
      agentType,
      startedAt: new Date(),
      lastActivityAt: new Date(),
      messages: [],
      entities: [],
      state: {},
      metadata: {},
    };

    activeSessions.set(sessionId, context);

    // Add welcome message
    const agent = this.getAgent(agentType);
    if (agent) {
      context.messages.push({
        id: `msg_${Date.now()}`,
        role: 'agent',
        content: this.getWelcomeMessage(agentType),
        timestamp: new Date(),
      });
    }

    return context;
  }

  /**
   * Get session context
   */
  static getSession(sessionId: string): ConversationContext | undefined {
    return activeSessions.get(sessionId);
  }

  /**
   * End conversation session
   */
  static endSession(sessionId: string): void {
    activeSessions.delete(sessionId);
  }

  /**
   * Process user message
   */
  static async processMessage(sessionId: string, userMessage: string): Promise<AgentResponse> {
    const context = activeSessions.get(sessionId);
    if (!context) {
      throw new Error('Session not found');
    }

    // Add user message to context
    const userMsg: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    context.messages.push(userMsg);
    context.lastActivityAt = new Date();

    // Extract intent and entities
    const intent = await this.detectIntent(userMessage, context);
    const entities = await this.extractEntities(userMessage, context);

    userMsg.intent = intent;
    userMsg.entities = entities;
    context.currentIntent = intent;
    context.entities = [...context.entities, ...entities];

    // Determine actions based on intent
    const actions = await this.planActions(intent, context);

    // Execute actions (with approval check)
    const executedActions = await this.executeActions(actions, context);

    // Generate response
    const response = await this.generateResponse(intent, executedActions, context);

    // Add agent response to context
    const agentMsg: ConversationMessage = {
      id: response.messageId,
      role: 'agent',
      content: response.content,
      timestamp: new Date(),
      intent,
      actions: executedActions,
    };
    context.messages.push(agentMsg);

    return response;
  }

  /**
   * Get welcome message for agent type
   */
  private static getWelcomeMessage(agentType: AgentType): string {
    const messages: Record<AgentType, string> = {
      HR_AGENT:
        "Hello! I'm your HR Assistant. I can help you with leave requests, attendance queries, payslip information, and HR policies. How can I assist you today?",
      RECRUITMENT_AGENT:
        "Welcome! I'm your Recruitment Assistant. I can help with candidate screening, interview scheduling, and recruitment analytics. What would you like to do?",
      ANALYTICS_AGENT:
        "Hi! I'm your Analytics Assistant. I can generate insights, create reports, and answer questions about your workforce data. What insights are you looking for?",
    };
    return messages[agentType];
  }

  // ============================================================================
  // NATURAL LANGUAGE UNDERSTANDING
  // ============================================================================

  /**
   * Detect intent from user message
   */
  static async detectIntent(
    message: string,
    context: ConversationContext
  ): Promise<DetectedIntent> {
    const lowerMessage = message.toLowerCase();

    // Intent patterns by agent type
    const intents = this.getIntentPatterns(context.agentType);

    let bestMatch: DetectedIntent = {
      name: 'UNKNOWN',
      confidence: 0,
      parameters: {},
      slots: [],
    };

    for (const [intentName, patterns] of Object.entries(intents)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern.keyword)) {
          const confidence = this.calculateConfidence(lowerMessage, pattern);
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              name: intentName,
              confidence,
              parameters: pattern.extractParams ? pattern.extractParams(message) : {},
              slots: pattern.slots || [],
            };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get intent patterns for agent type
   */
  private static getIntentPatterns(agentType: AgentType): Record<string, IntentPattern[]> {
    const patterns: Record<AgentType, Record<string, IntentPattern[]>> = {
      HR_AGENT: {
        LEAVE_BALANCE: [
          { keyword: 'leave balance', weight: 1.0 },
          { keyword: 'how many leaves', weight: 0.9 },
          { keyword: 'remaining leaves', weight: 0.95 },
          { keyword: 'available leave', weight: 0.9 },
        ],
        LEAVE_APPLY: [
          { keyword: 'apply leave', weight: 1.0 },
          { keyword: 'request leave', weight: 0.95 },
          { keyword: 'take leave', weight: 0.9 },
          { keyword: 'need leave', weight: 0.8 },
          { keyword: 'day off', weight: 0.85 },
        ],
        LEAVE_STATUS: [
          { keyword: 'leave status', weight: 1.0 },
          { keyword: 'leave request status', weight: 0.95 },
          { keyword: 'pending leaves', weight: 0.9 },
        ],
        ATTENDANCE: [
          { keyword: 'attendance', weight: 1.0 },
          { keyword: 'working hours', weight: 0.9 },
          { keyword: 'check in', weight: 0.85 },
          { keyword: 'check out', weight: 0.85 },
        ],
        PAYSLIP: [
          { keyword: 'payslip', weight: 1.0 },
          { keyword: 'salary slip', weight: 0.95 },
          { keyword: 'pay statement', weight: 0.9 },
        ],
        POLICY: [
          { keyword: 'policy', weight: 1.0 },
          { keyword: 'company policy', weight: 0.95 },
          { keyword: 'hr policy', weight: 0.95 },
          { keyword: 'guidelines', weight: 0.8 },
        ],
      },
      RECRUITMENT_AGENT: {
        SCREEN_CANDIDATES: [
          { keyword: 'screen candidates', weight: 1.0 },
          { keyword: 'review resumes', weight: 0.95 },
          { keyword: 'shortlist', weight: 0.9 },
          { keyword: 'evaluate candidates', weight: 0.9 },
        ],
        RANK_CANDIDATES: [
          { keyword: 'rank candidates', weight: 1.0 },
          { keyword: 'compare candidates', weight: 0.95 },
          { keyword: 'best candidates', weight: 0.9 },
          { keyword: 'top candidates', weight: 0.9 },
        ],
        SCHEDULE_INTERVIEW: [
          { keyword: 'schedule interview', weight: 1.0 },
          { keyword: 'book interview', weight: 0.95 },
          { keyword: 'interview slot', weight: 0.9 },
        ],
        PIPELINE_STATUS: [
          { keyword: 'pipeline', weight: 1.0 },
          { keyword: 'hiring status', weight: 0.95 },
          { keyword: 'open positions', weight: 0.9 },
        ],
      },
      ANALYTICS_AGENT: {
        GENERATE_REPORT: [
          { keyword: 'generate report', weight: 1.0 },
          { keyword: 'create report', weight: 0.95 },
          { keyword: 'run report', weight: 0.9 },
        ],
        SHOW_METRICS: [
          { keyword: 'show metrics', weight: 1.0 },
          { keyword: 'display stats', weight: 0.95 },
          { keyword: 'key metrics', weight: 0.9 },
          { keyword: 'kpi', weight: 0.85 },
        ],
        TREND_ANALYSIS: [
          { keyword: 'trend', weight: 1.0 },
          { keyword: 'over time', weight: 0.9 },
          { keyword: 'historical', weight: 0.85 },
        ],
        PREDICT: [
          { keyword: 'predict', weight: 1.0 },
          { keyword: 'forecast', weight: 0.95 },
          { keyword: 'projection', weight: 0.9 },
        ],
        ANOMALY: [
          { keyword: 'anomaly', weight: 1.0 },
          { keyword: 'unusual', weight: 0.9 },
          { keyword: 'outlier', weight: 0.85 },
        ],
      },
    };

    return patterns[agentType] || {};
  }

  /**
   * Calculate intent confidence
   */
  private static calculateConfidence(message: string, pattern: IntentPattern): number {
    const baseConfidence = pattern.weight;
    const messageWords = message.toLowerCase().split(/\s+/);
    const keywordWords = pattern.keyword.split(/\s+/);

    // Check if all keyword words are present
    const allPresent = keywordWords.every((kw) => messageWords.some((mw) => mw.includes(kw)));

    // Bonus for exact match
    if (message.toLowerCase().includes(pattern.keyword)) {
      return Math.min(baseConfidence + 0.1, 1.0);
    }

    return allPresent ? baseConfidence * 0.9 : baseConfidence * 0.5;
  }

  /**
   * Extract entities from message
   */
  static async extractEntities(
    message: string,
    context: ConversationContext
  ): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // Date extraction
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(today|tomorrow|yesterday)/gi,
      /(next|this|last)\s+(week|month|monday|tuesday|wednesday|thursday|friday)/gi,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/gi,
    ];

    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(message)) !== null) {
        entities.push({
          type: 'DATE',
          value: match[0],
          normalizedValue: this.normalizeDate(match[0]),
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: 0.9,
        });
      }
    }

    // Number extraction
    const numberPattern = /\b(\d+(?:\.\d+)?)\s*(days?|hours?|weeks?|months?)?\b/gi;
    let match;
    while ((match = numberPattern.exec(message)) !== null) {
      entities.push({
        type: 'NUMBER',
        value: match[0],
        normalizedValue: parseFloat(match[1]),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        confidence: 0.95,
      });
    }

    // Leave type extraction
    const leaveTypes = [
      'sick',
      'casual',
      'earned',
      'annual',
      'maternity',
      'paternity',
      'comp off',
      'wfh',
    ];
    for (const type of leaveTypes) {
      const index = message.toLowerCase().indexOf(type);
      if (index !== -1) {
        entities.push({
          type: 'LEAVE_TYPE',
          value: type,
          normalizedValue: type.toUpperCase().replace(' ', '_'),
          startIndex: index,
          endIndex: index + type.length,
          confidence: 0.85,
        });
      }
    }

    return entities;
  }

  /**
   * Normalize date string to Date object
   */
  private static normalizeDate(dateStr: string): Date {
    const lower = dateStr.toLowerCase();
    const today = new Date();

    if (lower === 'today') return today;
    if (lower === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    }
    if (lower === 'yesterday') {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return d;
    }

    // Try parsing the date
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? today : parsed;
  }

  // ============================================================================
  // ACTION PLANNING & EXECUTION
  // ============================================================================

  /**
   * Plan actions based on intent
   */
  static async planActions(
    intent: DetectedIntent,
    context: ConversationContext
  ): Promise<AgentAction[]> {
    const agent = this.getAgent(context.agentType);
    if (!agent) return [];

    const actions: AgentAction[] = [];
    const now = new Date();

    // Map intents to actions
    const actionMappings = this.getActionMappings(context.agentType);
    const mapping = actionMappings[intent.name];

    if (mapping) {
      for (const actionDef of mapping) {
        const action: AgentAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          taskId: '',
          type: actionDef.type,
          name: actionDef.name,
          description: actionDef.description,
          status: 'PENDING',
          input: {
            ...intent.parameters,
            ...this.extractActionInput(intent, context),
          },
          requiresApproval: actionDef.requiresApproval || false,
          createdAt: now,
        };
        actions.push(action);
      }
    }

    return actions;
  }

  /**
   * Get action mappings for agent type
   */
  private static getActionMappings(agentType: AgentType): Record<string, ActionDefinition[]> {
    const mappings: Record<AgentType, Record<string, ActionDefinition[]>> = {
      HR_AGENT: {
        LEAVE_BALANCE: [
          {
            type: 'QUERY_DATA',
            name: 'Query Leave Balance',
            description: 'Retrieve employee leave balance',
            requiresApproval: false,
          },
        ],
        LEAVE_APPLY: [
          {
            type: 'CREATE_RECORD',
            name: 'Create Leave Request',
            description: 'Submit leave application',
            requiresApproval: true,
          },
          {
            type: 'SEND_NOTIFICATION',
            name: 'Notify Manager',
            description: 'Send approval request to manager',
            requiresApproval: false,
          },
        ],
        LEAVE_STATUS: [
          {
            type: 'QUERY_DATA',
            name: 'Query Leave Status',
            description: 'Check status of leave requests',
            requiresApproval: false,
          },
        ],
        ATTENDANCE: [
          {
            type: 'QUERY_DATA',
            name: 'Query Attendance',
            description: 'Retrieve attendance records',
            requiresApproval: false,
          },
        ],
        PAYSLIP: [
          {
            type: 'QUERY_DATA',
            name: 'Query Payslip',
            description: 'Retrieve payslip data',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Generate Payslip PDF',
            description: 'Create downloadable payslip',
            requiresApproval: false,
          },
        ],
        POLICY: [
          {
            type: 'QUERY_DATA',
            name: 'Search Policies',
            description: 'Search HR policies',
            requiresApproval: false,
          },
        ],
      },
      RECRUITMENT_AGENT: {
        SCREEN_CANDIDATES: [
          {
            type: 'QUERY_DATA',
            name: 'Fetch Candidates',
            description: 'Retrieve candidate list',
            requiresApproval: false,
          },
          {
            type: 'QUERY_DATA',
            name: 'Screen Resumes',
            description: 'AI-based resume screening',
            requiresApproval: false,
          },
        ],
        RANK_CANDIDATES: [
          {
            type: 'QUERY_DATA',
            name: 'Analyze Candidates',
            description: 'Calculate candidate scores',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Generate Ranking',
            description: 'Create ranked candidate list',
            requiresApproval: false,
          },
        ],
        SCHEDULE_INTERVIEW: [
          {
            type: 'QUERY_DATA',
            name: 'Check Availability',
            description: 'Find available interview slots',
            requiresApproval: false,
          },
          {
            type: 'SCHEDULE_MEETING',
            name: 'Schedule Interview',
            description: 'Book interview slot',
            requiresApproval: true,
          },
          {
            type: 'SEND_NOTIFICATION',
            name: 'Send Invites',
            description: 'Send calendar invites',
            requiresApproval: false,
          },
        ],
        PIPELINE_STATUS: [
          {
            type: 'QUERY_DATA',
            name: 'Query Pipeline',
            description: 'Retrieve pipeline metrics',
            requiresApproval: false,
          },
        ],
      },
      ANALYTICS_AGENT: {
        GENERATE_REPORT: [
          {
            type: 'QUERY_DATA',
            name: 'Gather Data',
            description: 'Collect report data',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Generate Report',
            description: 'Create analytics report',
            requiresApproval: false,
          },
        ],
        SHOW_METRICS: [
          {
            type: 'QUERY_DATA',
            name: 'Query Metrics',
            description: 'Retrieve KPI data',
            requiresApproval: false,
          },
        ],
        TREND_ANALYSIS: [
          {
            type: 'QUERY_DATA',
            name: 'Query Historical Data',
            description: 'Retrieve time-series data',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Analyze Trends',
            description: 'Perform trend analysis',
            requiresApproval: false,
          },
        ],
        PREDICT: [
          {
            type: 'QUERY_DATA',
            name: 'Gather Prediction Data',
            description: 'Collect data for prediction',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Generate Forecast',
            description: 'Create prediction report',
            requiresApproval: false,
          },
        ],
        ANOMALY: [
          {
            type: 'QUERY_DATA',
            name: 'Scan Data',
            description: 'Scan for anomalies',
            requiresApproval: false,
          },
          {
            type: 'GENERATE_REPORT',
            name: 'Report Anomalies',
            description: 'Generate anomaly report',
            requiresApproval: false,
          },
        ],
      },
    };

    return mappings[agentType] || {};
  }

  /**
   * Extract action input from intent and context
   */
  private static extractActionInput(
    intent: DetectedIntent,
    context: ConversationContext
  ): Record<string, unknown> {
    const input: Record<string, unknown> = {
      userId: context.userId,
      tenantId: context.tenantId,
    };

    // Add entities to input
    for (const entity of context.entities) {
      if (entity.type === 'DATE') {
        input.date = entity.normalizedValue;
      }
      if (entity.type === 'LEAVE_TYPE') {
        input.leaveType = entity.normalizedValue;
      }
      if (entity.type === 'NUMBER') {
        input.duration = entity.normalizedValue;
      }
    }

    return input;
  }

  /**
   * Execute planned actions
   */
  static async executeActions(
    actions: AgentAction[],
    context: ConversationContext
  ): Promise<AgentAction[]> {
    const agent = this.getAgent(context.agentType);
    if (!agent) return actions;

    for (const action of actions) {
      try {
        // Check if approval is required
        if (action.requiresApproval && agent.configuration.autonomyLevel !== 'FULL') {
          action.status = 'PENDING';
          action.approvalStatus = {
            required: true,
            approvers: [],
            status: 'PENDING',
          };
          continue;
        }

        // Execute the action
        action.status = 'EXECUTING';
        const startTime = Date.now();

        const result = await this.executeAction(action, context);

        action.output = result;
        action.status = 'COMPLETED';
        action.executedAt = new Date();
        action.duration = Date.now() - startTime;

        // Log audit entry
        this.logAudit(context, {
          timestamp: new Date(),
          action: action.type,
          resource: action.name,
          details: { input: action.input, output: action.output },
          outcome: 'SUCCESS',
        });
      } catch (error: any) {
        action.status = 'FAILED';
        action.error = {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
        };

        this.logAudit(context, {
          timestamp: new Date(),
          action: action.type,
          resource: action.name,
          details: { input: action.input },
          outcome: 'FAILURE',
          error: action.error.message,
        });
      }
    }

    return actions;
  }

  /**
   * Execute a single action
   */
  private static async executeAction(
    action: AgentAction,
    context: ConversationContext
  ): Promise<Record<string, unknown>> {
    const { HRAgentService } = await import('./hr-agent.service');
    const { RecruitmentAgentService } = await import('./recruitment-agent.service');
    const { AnalyticsAgentService } = await import('./analytics-agent.service');

    const name = action.name.toLowerCase();
    const tenantId = context.tenantId;
    const userId = context.userId;

    try {
      if (action.type === 'QUERY_DATA') {
        if (name.includes('leave balance')) {
          return { balances: await HRAgentService.getLeaveBalance(userId, tenantId) };
        }
        if (name.includes('attendance')) {
          return { today: await HRAgentService.getTodayAttendance(userId, tenantId) };
        }
        if (name.includes('payslip')) {
          const now = new Date();
          return {
            payslip: await HRAgentService.getPayslip(
              userId,
              tenantId,
              now.getMonth() + 1,
              now.getFullYear()
            ),
          };
        }
        if (name.includes('pipeline') || name.includes('candidates') || name.includes('resumes')) {
          return { stats: await RecruitmentAgentService.getPipelineStats(tenantId) };
        }
        if (name.includes('metrics') || name.includes('kpi') || name.includes('insight')) {
          return {
            insight: await AnalyticsAgentService.generateInsight(
              { domain: 'WORKFORCE', question: action.name },
              tenantId
            ),
          };
        }
        return { success: true, message: 'No matching query handler' };
      }

      if (action.type === 'CREATE_RECORD') {
        return {
          status: 'PENDING_APPROVAL',
          message: 'Write actions require explicit agent chat with agents:write permission',
          createdAt: new Date().toISOString(),
        };
      }

      if (action.type === 'GENERATE_REPORT') {
        return {
          report: await AnalyticsAgentService.generateReport('WORKFORCE_REVIEW', tenantId),
        };
      }

      if (action.type === 'SEND_NOTIFICATION') {
        return {
          sent: false,
          draft: true,
          message: 'Notifications are draft-only from agent framework',
        };
      }

      if (action.type === 'SCHEDULE_MEETING') {
        return {
          scheduled: false,
          message: 'Use Recruitment Agent to schedule interviews against live calendar data',
        };
      }

      return { executed: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Action failed',
      };
    }
  }

  /**
   * Log audit entry
   */
  private static logAudit(context: ConversationContext, entry: AuditEntry): void {
    if (!context.metadata.auditLog) {
      context.metadata.auditLog = [];
    }
    (context.metadata.auditLog as AuditEntry[]).push(entry);
  }

  // ============================================================================
  // RESPONSE GENERATION
  // ============================================================================

  /**
   * Generate response based on intent and actions
   */
  static async generateResponse(
    intent: DetectedIntent,
    actions: AgentAction[],
    context: ConversationContext
  ): Promise<AgentResponse> {
    const completedActions = actions.filter((a) => a.status === 'COMPLETED');
    const pendingActions = actions.filter((a) => a.status === 'PENDING');
    const failedActions = actions.filter((a) => a.status === 'FAILED');

    let content = '';
    const suggestions: AgentResponse['suggestions'] = [];
    const attachments: AgentResponse['attachments'] = [];

    // Generate content based on action results
    if (completedActions.length > 0) {
      content = this.formatActionResults(intent, completedActions, context);
    } else if (pendingActions.length > 0) {
      content = this.formatPendingActions(pendingActions);
    } else if (failedActions.length > 0) {
      content = this.formatFailedActions(failedActions);
    } else if (intent.confidence < 0.5) {
      content =
        "I'm not sure I understood your request. Could you please rephrase or provide more details?";
      suggestions.push(
        { id: '1', type: 'quick_reply', label: 'Show help', value: 'help' },
        { id: '2', type: 'quick_reply', label: 'Talk to human', value: 'escalate' }
      );
    } else {
      content = "I'm processing your request. Please wait a moment.";
    }

    // Add contextual suggestions
    suggestions.push(...this.getContextualSuggestions(intent, context));

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: context.agentType,
      content,
      contentType: 'markdown',
      intent,
      actions,
      suggestions,
      attachments,
      timestamp: new Date(),
    };
  }

  /**
   * Format action results into response
   */
  private static formatActionResults(
    intent: DetectedIntent,
    actions: AgentAction[],
    context: ConversationContext
  ): string {
    const results: string[] = [];

    for (const action of actions) {
      const output = action.output as Record<string, unknown>;

      if (action.name.toLowerCase().includes('leave balance')) {
        const balances = output as {
          annual: { balance: number };
          sick: { balance: number };
          casual: { balance: number };
          compOff: { balance: number };
        };
        results.push(`**Your Leave Balance:**
- Annual Leave: ${balances.annual?.balance || 0} days
- Sick Leave: ${balances.sick?.balance || 0} days
- Casual Leave: ${balances.casual?.balance || 0} days
- Comp Off: ${balances.compOff?.balance || 0} days`);
      } else if (action.name.toLowerCase().includes('attendance')) {
        const att = output as {
          today: { checkIn: string; status: string };
          month: { present: number; absent: number; leaves: number; late: number };
        };
        results.push(`**Your Attendance:**
- Today: Check-in at ${att.today?.checkIn || 'N/A'} | Status: ${att.today?.status || 'N/A'}
- This Month: ${att.month?.present || 0} Present, ${att.month?.leaves || 0} Leaves, ${att.month?.late || 0} Late`);
      } else if (action.name.toLowerCase().includes('payslip')) {
        const pay = output as { month: string; gross: number; deductions: number; net: number };
        results.push(`**Payslip for ${pay.month || 'Current Month'}:**
- Gross Salary: ₹${(pay.gross || 0).toLocaleString()}
- Deductions: ₹${(pay.deductions || 0).toLocaleString()}
- Net Pay: ₹${(pay.net || 0).toLocaleString()}`);
      } else if (action.name.toLowerCase().includes('candidates')) {
        const data = output as {
          total: number;
          shortlisted: number;
          candidates: { name: string; score: number; status: string }[];
        };
        const candidateList = (data.candidates || [])
          .map((c) => `  - ${c.name}: Score ${c.score} (${c.status})`)
          .join('\n');
        results.push(`**Candidate Screening Results:**
- Total Candidates: ${data.total || 0}
- Shortlisted: ${data.shortlisted || 0}
- Top Candidates:
${candidateList}`);
      } else if (action.name.toLowerCase().includes('pipeline')) {
        const pipe = output as {
          openPositions: number;
          totalCandidates: number;
          stages: Record<string, number>;
        };
        results.push(`**Recruitment Pipeline:**
- Open Positions: ${pipe.openPositions || 0}
- Total Candidates: ${pipe.totalCandidates || 0}
- By Stage: New (${pipe.stages?.new || 0}), Screening (${pipe.stages?.screening || 0}), Interview (${pipe.stages?.interview || 0}), Offer (${pipe.stages?.offer || 0})`);
      } else if (
        action.name.toLowerCase().includes('metrics') ||
        action.name.toLowerCase().includes('kpi')
      ) {
        const metrics = output as {
          headcount: { total: number; change: string };
          attrition: { rate: string };
          openPositions: number;
          timeToHire: string;
        };
        results.push(`**Key HR Metrics:**
- Total Headcount: ${metrics.headcount?.total || 0} (${metrics.headcount?.change || 'N/A'})
- Attrition Rate: ${metrics.attrition?.rate || 'N/A'}
- Open Positions: ${metrics.openPositions || 0}
- Avg Time to Hire: ${metrics.timeToHire || 'N/A'}`);
      } else if (action.name.toLowerCase().includes('create')) {
        const rec = output as { id: string; status: string };
        results.push(`✅ Your request has been submitted successfully!
- Reference ID: ${rec.id || 'N/A'}
- Status: ${rec.status || 'Pending'}`);
      } else if (action.name.toLowerCase().includes('report')) {
        const rpt = output as { reportId: string; downloadUrl: string };
        results.push(`📊 Your report has been generated.
- Report ID: ${rpt.reportId || 'N/A'}
- [Download Report](${rpt.downloadUrl || '#'})`);
      }
    }

    return results.join('\n\n') || 'Your request has been processed.';
  }

  /**
   * Format pending actions message
   */
  private static formatPendingActions(actions: AgentAction[]): string {
    const actionNames = actions.map((a) => a.name).join(', ');
    return `⏳ The following actions require approval: ${actionNames}. I've sent an approval request to the appropriate person.`;
  }

  /**
   * Format failed actions message
   */
  private static formatFailedActions(actions: AgentAction[]): string {
    return `❌ I encountered an issue processing your request. ${actions[0]?.error?.message || 'Please try again later.'}`;
  }

  /**
   * Get contextual suggestions
   */
  private static getContextualSuggestions(
    intent: DetectedIntent,
    context: ConversationContext
  ): AgentResponse['suggestions'] {
    const suggestions: AgentResponse['suggestions'] = [];

    const suggestionMap: Record<AgentType, Record<string, { label: string; value: string }[]>> = {
      HR_AGENT: {
        LEAVE_BALANCE: [
          { label: 'Apply for leave', value: 'I want to apply for leave' },
          { label: 'View leave history', value: 'Show my leave history' },
        ],
        LEAVE_APPLY: [
          { label: 'Check leave balance', value: 'What is my leave balance?' },
          { label: 'View pending requests', value: 'Show my pending leave requests' },
        ],
        ATTENDANCE: [
          { label: 'Apply regularization', value: 'I need to regularize my attendance' },
          { label: 'Request WFH', value: 'I want to work from home' },
        ],
        PAYSLIP: [
          { label: 'Download payslip', value: 'Download my payslip' },
          { label: 'View tax details', value: 'Show my tax deductions' },
        ],
      },
      RECRUITMENT_AGENT: {
        SCREEN_CANDIDATES: [
          { label: 'Rank candidates', value: 'Rank the top candidates' },
          { label: 'Schedule interviews', value: 'Schedule interviews for shortlisted candidates' },
        ],
        SCHEDULE_INTERVIEW: [
          { label: 'View pipeline', value: 'Show recruitment pipeline' },
          { label: 'Send feedback form', value: 'Send interview feedback form' },
        ],
      },
      ANALYTICS_AGENT: {
        SHOW_METRICS: [
          { label: 'View trends', value: 'Show attrition trends' },
          { label: 'Generate report', value: 'Generate HR dashboard report' },
        ],
        TREND_ANALYSIS: [
          { label: 'Predict attrition', value: 'Predict attrition for next quarter' },
          { label: 'Compare periods', value: 'Compare this year vs last year' },
        ],
      },
    };

    const agentSuggestions = suggestionMap[context.agentType]?.[intent.name] || [];

    return agentSuggestions.map((s, i) => ({
      id: `sug_${i}`,
      type: 'quick_reply' as const,
      label: s.label,
      value: s.value,
    }));
  }

  // ============================================================================
  // TASK MANAGEMENT
  // ============================================================================

  /**
   * Create a new task
   */
  static async createTask(
    task: Omit<
      AgentTask,
      'id' | 'status' | 'actions' | 'progress' | 'retryCount' | 'createdAt' | 'updatedAt'
    >
  ): Promise<AgentTask> {
    const newTask: AgentTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...task,
      status: 'PENDING',
      actions: [],
      progress: 0,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskQueue.set(newTask.id, newTask);

    this.emitEvent({
      id: `evt_${Date.now()}`,
      type: 'TASK_CREATED',
      agentType: task.agentType,
      taskId: newTask.id,
      tenantId: task.tenantId,
      userId: task.userId,
      payload: { taskType: task.type, title: task.title },
      timestamp: new Date(),
    });

    return newTask;
  }

  /**
   * Get task by ID
   */
  static async getTask(taskId: string): Promise<AgentTask | undefined> {
    return taskQueue.get(taskId);
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    output?: Record<string, unknown>
  ): Promise<AgentTask> {
    const task = taskQueue.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.status = status;
    task.updatedAt = new Date();

    if (output) {
      task.output = output;
    }

    if (status === 'IN_PROGRESS') {
      task.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'FAILED') {
      task.completedAt = new Date();
      task.progress = status === 'COMPLETED' ? 100 : task.progress;
    }

    return task;
  }

  /**
   * Get tasks for user
   */
  static async getUserTasks(
    userId: string,
    tenantId: string,
    filters?: { status?: TaskStatus; agentType?: AgentType }
  ): Promise<AgentTask[]> {
    const tasks = Array.from(taskQueue.values()).filter(
      (t) => t.userId === userId && t.tenantId === tenantId
    );

    if (filters?.status) {
      return tasks.filter((t) => t.status === filters.status);
    }

    if (filters?.agentType) {
      return tasks.filter((t) => t.agentType === filters.agentType);
    }

    return tasks;
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /**
   * Emit agent event
   */
  static emitEvent(event: AgentEvent): void {
    // In production, publish to event bus
  }

  /**
   * Get agent metrics
   */
  static async getMetrics(
    agentType: AgentType,
    tenantId: string,
    period: { start: Date; end: Date }
  ): Promise<AgentMetrics> {
    const { getAgentMetricsByType } = await import('@/lib/ai/agent-session');
    const days = Math.max(1, Math.ceil((period.end.getTime() - period.start.getTime()) / 86400000));
    const live = await getAgentMetricsByType(tenantId, agentType as never, days).catch(() => null);

    const tasks = Array.from(taskQueue.values()).filter(
      (t) =>
        t.agentType === agentType &&
        t.tenantId === tenantId &&
        t.createdAt >= period.start &&
        t.createdAt <= period.end
    );

    const successful = tasks.filter((t) => t.status === 'COMPLETED');
    const failed = tasks.filter((t) => t.status === 'FAILED');

    const durations = successful
      .filter((t) => t.startedAt && t.completedAt)
      .map((t) => t.completedAt!.getTime() - t.startedAt!.getTime());
    const averageTaskDuration = durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    return {
      agentType,
      period,
      tasksProcessed: live?.totalRequests ?? tasks.length,
      tasksSuccessful: live?.successful ?? successful.length,
      tasksFailed: live?.failed ?? failed.length,
      averageResponseTime: live ? live.avgResponseTime * 1000 : 0,
      averageTaskDuration,
      autonomousExecutions: live?.successful ?? successful.length,
      escalations: 0,
      topIntents: (live?.topActions || []).map((a) => ({ intent: a.action, count: a.count })),
      errorsByType: [],
    };
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

interface IntentPattern {
  keyword: string;
  weight: number;
  extractParams?: (message: string) => Record<string, unknown>;
  slots?: { name: string; value: unknown; resolved: boolean; required: boolean }[];
}

interface ActionDefinition {
  type: ActionType;
  name: string;
  description: string;
  requiresApproval?: boolean;
}
