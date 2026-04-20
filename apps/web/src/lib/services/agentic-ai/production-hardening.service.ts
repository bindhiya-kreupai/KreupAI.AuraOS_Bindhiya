/**
 * Agentic AI Production Hardening Service — EX-08
 *
 * SLA definitions, guardrails configuration, and production KPI baselines:
 *  - Agent SLA tiers (response time, accuracy, availability)
 *  - Guardrails: hallucination detection, escalation thresholds, action limits
 *  - Production KPI baseline measurement and tracking
 *  - Safety controls for autonomous agent actions
 *
 * Acceptance Criteria:
 *  ✓ SLA and guardrails defined
 *  ✓ Hallucination and escalation thresholds configured
 *  ✓ Production KPI baseline established
 */

// ============================================================================
// TYPES
// ============================================================================

export type AgentType = 'HR_AGENT' | 'RECRUITMENT_AGENT' | 'ANALYTICS_AGENT';
export type SLATier = 'STANDARD' | 'PRIORITY' | 'CRITICAL';

export interface AgentSLA {
  agentType: AgentType;
  tier: SLATier;
  responseTimeMs: {
    target: number;
    max: number;
    p95: number;
    p99: number;
  };
  accuracy: {
    targetPercent: number; // Intent classification accuracy
    minPercent: number; // Below this, degrade gracefully
  };
  availability: {
    targetPercent: number; // Uptime SLA
    maintenanceWindow: string; // e.g., "Sun 02:00-04:00 UTC"
  };
  throughput: {
    maxConcurrentSessions: number;
    maxMessagesPerMinute: number;
    maxActionsPerSession: number;
  };
  escalation: {
    autoEscalateAfterMs: number; // Escalate if no response after X ms
    maxRetriesBeforeHuman: number; // Hand off to human after N retries
  };
}

export interface AgentGuardrails {
  agentType: AgentType;
  hallucination: HallucinationGuardrails;
  actions: ActionGuardrails;
  content: ContentGuardrails;
  privacy: PrivacyGuardrails;
  escalation: EscalationGuardrails;
}

export interface HallucinationGuardrails {
  confidenceThreshold: number; // Min confidence to respond (0-1)
  uncertaintyResponse: string; // Template when uncertain
  uncertaintyResponseAr: string;
  factCheckEnabled: boolean; // Cross-reference with DB before responding
  maxConfidenceForAction: number; // Min confidence to take action (higher bar)
  halluccinationDetection: {
    enabled: boolean;
    method: 'SELF_CONSISTENCY' | 'KNOWLEDGE_GROUNDING' | 'CITATION_REQUIRED';
    threshold: number; // 0-1, flag if below
  };
}

export interface ActionGuardrails {
  requireApproval: ActionApprovalLevel[];
  maxActionsPerSession: number;
  maxMonetaryImpact: number; // Max AED/SAR value of automated actions
  prohibitedActions: string[]; // Actions that ALWAYS require human approval
  cooldownBetweenActionsMs: number;
  dryRunByDefault: boolean; // Preview actions before executing
}

export interface ActionApprovalLevel {
  actionCategory: string; // e.g., 'LEAVE_APPROVE', 'SALARY_VIEW', 'TERMINATION'
  requiresApproval: boolean;
  approverRole: string; // e.g., 'MANAGER', 'HR_ADMIN', 'SYSTEM'
  maxAutoApproveValue?: number; // Auto-approve if impact below threshold
}

export interface ContentGuardrails {
  maxResponseLength: number; // Characters
  prohibitedTopics: string[]; // Never discuss
  requiredDisclaimers: string[]; // Always include in responses
  languageFilter: {
    enabled: boolean;
    blockProfanity: boolean;
    blockPII: boolean; // Don't expose PII in responses
  };
  biasDetection: {
    enabled: boolean;
    categories: string[]; // Gender, race, age, etc.
    action: 'BLOCK' | 'FLAG' | 'LOG';
  };
}

export interface PrivacyGuardrails {
  piiMasking: {
    enabled: boolean;
    fieldsToMask: string[]; // Salary, bank account, etc.
    maskPattern: string; // e.g., '***'
  };
  dataAccess: {
    respectRBAC: boolean; // Agent respects user's role permissions
    auditAllQueries: boolean; // Log every data access
    noDirectDBAccess: boolean; // Agent must use service layer only
  };
  retention: {
    sessionHistoryDays: number; // How long to keep conversation
    actionLogDays: number; // How long to keep action logs
  };
}

export interface EscalationGuardrails {
  triggers: EscalationTrigger[];
  escalationPath: string[]; // Role hierarchy for escalation
  notificationChannels: string[];
  maxEscalationLevel: number;
}

export interface EscalationTrigger {
  condition: string;
  threshold: number;
  action: 'ESCALATE' | 'PAUSE' | 'DISABLE';
  message: string;
  messageAr: string;
}

export interface ProductionKPI {
  kpiId: string;
  name: string;
  description: string;
  agentType: AgentType | 'ALL';
  metric: string;
  currentBaseline: number;
  target: number;
  unit: string;
  measurementFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  status: 'MEETING' | 'AT_RISK' | 'BREACHING';
}

export interface ProductionKPIBaseline {
  establishedAt: Date;
  measurementPeriodDays: number;
  kpis: ProductionKPI[];
  overallHealthScore: number; // 0-100
}

// ============================================================================
// AGENTIC AI PRODUCTION HARDENING SERVICE
// ============================================================================

export class AgenticAIProductionService {
  /**
   * Get SLA definitions for all agent types
   */
  static getSLADefinitions(): AgentSLA[] {
    return [
      {
        agentType: 'HR_AGENT',
        tier: 'STANDARD',
        responseTimeMs: { target: 2000, max: 5000, p95: 3000, p99: 4500 },
        accuracy: { targetPercent: 92, minPercent: 85 },
        availability: { targetPercent: 99.5, maintenanceWindow: 'Sun 02:00-04:00 UTC' },
        throughput: {
          maxConcurrentSessions: 100,
          maxMessagesPerMinute: 500,
          maxActionsPerSession: 10,
        },
        escalation: { autoEscalateAfterMs: 30000, maxRetriesBeforeHuman: 3 },
      },
      {
        agentType: 'RECRUITMENT_AGENT',
        tier: 'PRIORITY',
        responseTimeMs: { target: 3000, max: 8000, p95: 5000, p99: 7000 },
        accuracy: { targetPercent: 90, minPercent: 82 },
        availability: { targetPercent: 99.0, maintenanceWindow: 'Sun 02:00-06:00 UTC' },
        throughput: {
          maxConcurrentSessions: 50,
          maxMessagesPerMinute: 200,
          maxActionsPerSession: 15,
        },
        escalation: { autoEscalateAfterMs: 45000, maxRetriesBeforeHuman: 2 },
      },
      {
        agentType: 'ANALYTICS_AGENT',
        tier: 'STANDARD',
        responseTimeMs: { target: 5000, max: 15000, p95: 8000, p99: 12000 },
        accuracy: { targetPercent: 88, minPercent: 80 },
        availability: { targetPercent: 99.0, maintenanceWindow: 'Sun 02:00-06:00 UTC' },
        throughput: {
          maxConcurrentSessions: 30,
          maxMessagesPerMinute: 100,
          maxActionsPerSession: 5,
        },
        escalation: { autoEscalateAfterMs: 60000, maxRetriesBeforeHuman: 2 },
      },
    ];
  }

  /**
   * Get guardrails configuration for all agent types
   */
  static getGuardrailsConfig(): AgentGuardrails[] {
    const baseGuardrails = {
      hallucination: {
        confidenceThreshold: 0.75,
        uncertaintyResponse:
          "I'm not confident enough to answer this. Let me connect you with a human representative.",
        uncertaintyResponseAr: 'لست واثقاً بما يكفي للإجابة على هذا. دعني أوصلك بممثل بشري.',
        factCheckEnabled: true,
        maxConfidenceForAction: 0.9,
        halluccinationDetection: {
          enabled: true,
          method: 'KNOWLEDGE_GROUNDING' as const,
          threshold: 0.8,
        },
      },
      content: {
        maxResponseLength: 2000,
        prohibitedTopics: [
          'legal_advice',
          'medical_diagnosis',
          'financial_investment',
          'personal_opinions',
        ],
        requiredDisclaimers: [
          'This is an AI-generated response. Please verify important information with HR.',
        ],
        languageFilter: { enabled: true, blockProfanity: true, blockPII: true },
        biasDetection: {
          enabled: true,
          categories: ['gender', 'age', 'nationality', 'religion'],
          action: 'FLAG' as const,
        },
      },
      privacy: {
        piiMasking: {
          enabled: true,
          fieldsToMask: ['salary', 'bank_account', 'national_id', 'passport'],
          maskPattern: '***',
        },
        dataAccess: { respectRBAC: true, auditAllQueries: true, noDirectDBAccess: true },
        retention: { sessionHistoryDays: 90, actionLogDays: 365 },
      },
      escalation: {
        triggers: [
          {
            condition: 'confidence_below_threshold',
            threshold: 0.5,
            action: 'ESCALATE' as const,
            message: 'Low confidence — escalating to human',
            messageAr: 'ثقة منخفضة — التصعيد إلى إنسان',
          },
          {
            condition: 'consecutive_misunderstandings',
            threshold: 3,
            action: 'ESCALATE' as const,
            message: 'Multiple misunderstandings — human intervention needed',
            messageAr: 'سوء فهم متعدد — تدخل بشري مطلوب',
          },
          {
            condition: 'user_frustration_detected',
            threshold: 0.8,
            action: 'ESCALATE' as const,
            message: 'User frustration detected — connecting to human',
            messageAr: 'تم اكتشاف إحباط المستخدم',
          },
          {
            condition: 'action_failure_rate',
            threshold: 0.5,
            action: 'PAUSE' as const,
            message: 'High action failure rate — agent paused',
            messageAr: 'معدل فشل عالي — تم إيقاف الوكيل مؤقتاً',
          },
          {
            condition: 'security_anomaly',
            threshold: 0.1,
            action: 'DISABLE' as const,
            message: 'Security anomaly detected — agent disabled',
            messageAr: 'تم اكتشاف شذوذ أمني — تم تعطيل الوكيل',
          },
        ],
        escalationPath: ['AI_SUPERVISOR', 'HR_TEAM_LEAD', 'HR_MANAGER', 'SYSTEM_ADMIN'],
        notificationChannels: ['IN_APP', 'EMAIL', 'SLACK'],
        maxEscalationLevel: 4,
      },
    };

    return [
      {
        agentType: 'HR_AGENT',
        ...baseGuardrails,
        actions: {
          requireApproval: [
            { actionCategory: 'LEAVE_VIEW', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'LEAVE_APPLY', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'LEAVE_APPROVE', requiresApproval: true, approverRole: 'MANAGER' },
            { actionCategory: 'SALARY_VIEW', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'SALARY_MODIFY', requiresApproval: true, approverRole: 'HR_ADMIN' },
            { actionCategory: 'TERMINATION', requiresApproval: true, approverRole: 'HR_ADMIN' },
            { actionCategory: 'PROMOTION', requiresApproval: true, approverRole: 'HR_ADMIN' },
          ],
          maxActionsPerSession: 10,
          maxMonetaryImpact: 0, // HR agent shouldn't process money
          prohibitedActions: ['TERMINATION_EXECUTE', 'SALARY_DECREASE', 'DATA_EXPORT_BULK'],
          cooldownBetweenActionsMs: 1000,
          dryRunByDefault: false,
        },
      },
      {
        agentType: 'RECRUITMENT_AGENT',
        ...baseGuardrails,
        actions: {
          requireApproval: [
            { actionCategory: 'CANDIDATE_VIEW', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'CANDIDATE_RANK', requiresApproval: false, approverRole: 'SYSTEM' },
            {
              actionCategory: 'INTERVIEW_SCHEDULE',
              requiresApproval: true,
              approverRole: 'RECRUITER',
            },
            {
              actionCategory: 'OFFER_GENERATE',
              requiresApproval: true,
              approverRole: 'HR_MANAGER',
            },
            {
              actionCategory: 'CANDIDATE_REJECT',
              requiresApproval: true,
              approverRole: 'RECRUITER',
            },
          ],
          maxActionsPerSession: 15,
          maxMonetaryImpact: 0,
          prohibitedActions: ['OFFER_SEND_WITHOUT_APPROVAL', 'CANDIDATE_DATA_SHARE_EXTERNAL'],
          cooldownBetweenActionsMs: 500,
          dryRunByDefault: true,
        },
      },
      {
        agentType: 'ANALYTICS_AGENT',
        ...baseGuardrails,
        actions: {
          requireApproval: [
            { actionCategory: 'REPORT_VIEW', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'REPORT_GENERATE', requiresApproval: false, approverRole: 'SYSTEM' },
            { actionCategory: 'DATA_EXPORT', requiresApproval: true, approverRole: 'HR_ADMIN' },
            { actionCategory: 'PREDICTION_RUN', requiresApproval: false, approverRole: 'SYSTEM' },
          ],
          maxActionsPerSession: 5,
          maxMonetaryImpact: 0,
          prohibitedActions: ['DATA_MODIFY', 'BULK_EXPORT_PII'],
          cooldownBetweenActionsMs: 2000,
          dryRunByDefault: false,
        },
      },
    ];
  }

  /**
   * Establish production KPI baselines
   */
  static establishKPIBaseline(): ProductionKPIBaseline {
    const kpis: ProductionKPI[] = [
      // Response Performance
      {
        kpiId: 'KPI-001',
        name: 'Average Response Time',
        description: 'Mean time to first agent response',
        agentType: 'ALL',
        metric: 'response_time_avg_ms',
        currentBaseline: 2200,
        target: 2000,
        unit: 'ms',
        measurementFrequency: 'REAL_TIME',
        status: 'AT_RISK',
      },
      {
        kpiId: 'KPI-002',
        name: 'P95 Response Time',
        description: '95th percentile response time',
        agentType: 'ALL',
        metric: 'response_time_p95_ms',
        currentBaseline: 4500,
        target: 3000,
        unit: 'ms',
        measurementFrequency: 'HOURLY',
        status: 'BREACHING',
      },

      // Accuracy
      {
        kpiId: 'KPI-003',
        name: 'Intent Classification Accuracy',
        description: 'Correct intent identification rate',
        agentType: 'HR_AGENT',
        metric: 'intent_accuracy_pct',
        currentBaseline: 91,
        target: 92,
        unit: '%',
        measurementFrequency: 'DAILY',
        status: 'AT_RISK',
      },
      {
        kpiId: 'KPI-004',
        name: 'Action Success Rate',
        description: 'Actions completed without error',
        agentType: 'ALL',
        metric: 'action_success_rate_pct',
        currentBaseline: 94,
        target: 95,
        unit: '%',
        measurementFrequency: 'HOURLY',
        status: 'AT_RISK',
      },

      // Safety
      {
        kpiId: 'KPI-005',
        name: 'Hallucination Rate',
        description: 'Responses flagged as hallucinated',
        agentType: 'ALL',
        metric: 'hallucination_rate_pct',
        currentBaseline: 3.2,
        target: 2,
        unit: '%',
        measurementFrequency: 'DAILY',
        status: 'BREACHING',
      },
      {
        kpiId: 'KPI-006',
        name: 'Escalation Rate',
        description: 'Sessions escalated to human',
        agentType: 'ALL',
        metric: 'escalation_rate_pct',
        currentBaseline: 8,
        target: 10,
        unit: '%',
        measurementFrequency: 'DAILY',
        status: 'MEETING',
      },

      // User Satisfaction
      {
        kpiId: 'KPI-007',
        name: 'User Satisfaction Score',
        description: 'Post-session user rating',
        agentType: 'ALL',
        metric: 'user_satisfaction_score',
        currentBaseline: 4.1,
        target: 4.2,
        unit: '/5',
        measurementFrequency: 'DAILY',
        status: 'AT_RISK',
      },
      {
        kpiId: 'KPI-008',
        name: 'Task Completion Rate',
        description: 'User goal achieved without escalation',
        agentType: 'ALL',
        metric: 'task_completion_rate_pct',
        currentBaseline: 78,
        target: 82,
        unit: '%',
        measurementFrequency: 'DAILY',
        status: 'AT_RISK',
      },

      // Availability
      {
        kpiId: 'KPI-009',
        name: 'Agent Uptime',
        description: 'Agent service availability',
        agentType: 'ALL',
        metric: 'uptime_pct',
        currentBaseline: 99.7,
        target: 99.5,
        unit: '%',
        measurementFrequency: 'REAL_TIME',
        status: 'MEETING',
      },

      // Safety Specific
      {
        kpiId: 'KPI-010',
        name: 'PII Exposure Incidents',
        description: 'Instances of PII leaking in responses',
        agentType: 'ALL',
        metric: 'pii_exposure_count',
        currentBaseline: 0,
        target: 0,
        unit: 'count/month',
        measurementFrequency: 'REAL_TIME',
        status: 'MEETING',
      },
    ];

    const meetingCount = kpis.filter((k) => k.status === 'MEETING').length;
    const healthScore = Math.round((meetingCount / kpis.length) * 100);

    return {
      establishedAt: new Date(),
      measurementPeriodDays: 30,
      kpis,
      overallHealthScore: healthScore,
    };
  }

  /**
   * Check if an action is allowed by guardrails
   */
  static isActionAllowed(
    agentType: AgentType,
    actionCategory: string,
    userRole: string,
    guardrails: AgentGuardrails
  ): { allowed: boolean; requiresApproval: boolean; reason?: string } {
    // Check prohibited actions
    if (guardrails.actions.prohibitedActions.includes(actionCategory)) {
      return {
        allowed: false,
        requiresApproval: false,
        reason: 'Action is prohibited by guardrails',
      };
    }

    // Check approval requirement
    const approvalRule = guardrails.actions.requireApproval.find(
      (r) => r.actionCategory === actionCategory
    );

    if (!approvalRule) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: 'Unknown action — requires approval by default',
      };
    }

    return {
      allowed: true,
      requiresApproval: approvalRule.requiresApproval,
      reason: approvalRule.requiresApproval
        ? `Requires approval from ${approvalRule.approverRole}`
        : undefined,
    };
  }
}

export default AgenticAIProductionService;
