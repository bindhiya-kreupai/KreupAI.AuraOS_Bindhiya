export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed' | 'reopened';
export type TicketCategory = 'payroll' | 'benefits' | 'time_off' | 'training' | 'it_access' | 'onboarding' | 'offboarding' | 'policy' | 'other';
export type SLAStatus = 'met' | 'at_risk' | 'breached';
export type SatisfactionRating = 1 | 2 | 3 | 4 | 5;

export interface Ticket {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  requester: TicketRequester;
  assignedAgent?: AgentInfo;
  slaInfo: SLAInfo;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  history: TicketHistory[];
  satisfactionSurvey?: SatisfactionSurvey;
  escalation?: EscalationInfo;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketRequester {
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  phone?: string;
  location?: string;
}

export interface AgentInfo {
  agentId: string;
  agentName: string;
  email: string;
  department: string;
  assignedAt: string;
  workload: number;
  skillSet: string[];
}

export interface SLAInfo {
  slaLevel: 'standard' | 'priority' | 'vip';
  firstResponseDue: string;
  firstResponseAt?: string;
  resolutionDue: string;
  status: SLAStatus;
  timeRemaining: number;
  pausedTime: number;
  breachReason?: string;
}

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface Comment {
  commentId: string;
  commentType: 'internal' | 'public';
  author: string;
  authorType: 'agent' | 'requester';
  content: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface TicketHistory {
  historyId: string;
  action: 'created' | 'updated' | 'assigned' | 'reassigned' | 'escalated' | 'resolved' | 'closed' | 'reopened';
  performedBy: string;
  performedAt: string;
  changes: FieldChange[];
  note?: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface SatisfactionSurvey {
  surveyId: string;
  rating: SatisfactionRating;
  feedback?: string;
  respondedAt: string;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  questionId: string;
  question: string;
  answer: string | number;
}

export interface EscalationInfo {
  escalatedAt: string;
  escalatedBy: string;
  escalatedTo: string;
  escalationLevel: number;
  reason: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface SLAPolicy {
  policyId: string;
  policyName: string;
  description: string;
  priority: TicketPriority;
  categories: TicketCategory[];
  firstResponseTime: number;
  resolutionTime: number;
  businessHoursOnly: boolean;
  escalationRules: EscalationRule[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface EscalationRule {
  ruleId: string;
  triggerCondition: 'sla_breach' | 'time_threshold' | 'manual';
  thresholdMinutes?: number;
  escalateTo: string;
  escalationLevel: number;
  notificationTemplate: string;
}

export interface Agent {
  agentId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  role: 'agent' | 'senior_agent' | 'supervisor' | 'manager';
  skillSet: AgentSkill[];
  availability: AgentAvailability;
  performance: AgentPerformance;
  currentWorkload: number;
  maxCapacity: number;
  status: 'available' | 'busy' | 'away' | 'offline';
  createdAt: string;
}

export interface AgentSkill {
  skillId: string;
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certifiedDate?: string;
}

export interface AgentAvailability {
  schedule: ScheduleSlot[];
  timeZone: string;
  outOfOffice: boolean;
  outOfOfficeUntil?: string;
}

export interface ScheduleSlot {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
}

export interface AgentPerformance {
  averageResponseTime: number;
  averageResolutionTime: number;
  ticketsResolved: number;
  ticketsAssigned: number;
  slaComplianceRate: number;
  averageSatisfactionRating: number;
  firstContactResolutionRate: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface KnowledgeBaseArticle {
  articleId: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'restricted';
  relatedArticles: string[];
  attachments: Attachment[];
  views: number;
  helpful: number;
  notHelpful: number;
  linkedTickets: string[];
  version: number;
  versionHistory: ArticleVersion[];
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface ArticleVersion {
  versionNumber: number;
  content: string;
  changedBy: string;
  changedAt: string;
  changeNotes: string;
}

export interface CannedResponse {
  responseId: string;
  title: string;
  shortcut: string;
  content: string;
  category: string;
  tags: string[];
  visibility: 'personal' | 'team' | 'global';
  createdBy: string;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EscalationMatrix {
  matrixId: string;
  matrixName: string;
  description: string;
  levels: EscalationLevel[];
  triggers: EscalationTrigger[];
  notifications: NotificationRule[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface EscalationLevel {
  level: number;
  levelName: string;
  assignedTo: string[];
  autoAssign: boolean;
  notifyManagement: boolean;
  timeThreshold: number;
}

export interface EscalationTrigger {
  triggerId: string;
  triggerType: 'sla_breach' | 'priority' | 'unassigned' | 'reopened' | 'manual';
  condition: string;
  targetLevel: number;
  enabled: boolean;
}

export interface NotificationRule {
  ruleId: string;
  eventType: 'new_ticket' | 'assigned' | 'escalated' | 'sla_warning' | 'resolved';
  recipients: string[];
  notificationMethod: 'email' | 'sms' | 'in_app' | 'all';
  template: string;
  enabled: boolean;
}

export interface HelpdeskAnalytics {
  analyticsId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  ticketMetrics: TicketMetrics;
  slaMetrics: SLAMetrics;
  agentMetrics: AgentMetrics;
  categoryBreakdown: CategoryMetrics[];
  satisfactionMetrics: SatisfactionMetrics;
  trends: TrendData[];
}

export interface TicketMetrics {
  totalTickets: number;
  newTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  reopenedTickets: number;
  averageFirstResponseTime: number;
  averageResolutionTime: number;
  backlog: number;
}

export interface SLAMetrics {
  totalSLAs: number;
  slaMet: number;
  slaBreached: number;
  slaAtRisk: number;
  complianceRate: number;
  averageBreachTime: number;
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  averageTicketsPerAgent: number;
  topPerformers: AgentPerformanceSummary[];
}

export interface AgentPerformanceSummary {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  averageResolutionTime: number;
  satisfactionRating: number;
  slaCompliance: number;
}

export interface CategoryMetrics {
  category: TicketCategory;
  ticketCount: number;
  percentage: number;
  averageResolutionTime: number;
  satisfactionRating: number;
}

export interface SatisfactionMetrics {
  totalSurveys: number;
  responseRate: number;
  averageRating: number;
  ratingDistribution: {
    rating: SatisfactionRating;
    count: number;
    percentage: number;
  }[];
  netPromoterScore: number;
}

export interface TrendData {
  date: string;
  newTickets: number;
  resolvedTickets: number;
  backlog: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionRating: number;
}

export interface HelpdeskSettings {
  settingsId: string;
  organizationId: string;
  ticketSettings: {
    autoAssignment: boolean;
    assignmentMethod: 'round_robin' | 'load_balanced' | 'skill_based';
    allowSelfAssignment: boolean;
    requireCategorySelection: boolean;
    defaultPriority: TicketPriority;
  };
  slaSettings: {
    enabled: boolean;
    businessHours: BusinessHours;
    holidays: string[];
    pauseOnPending: boolean;
  };
  satisfactionSettings: {
    enabled: boolean;
    surveyTrigger: 'on_resolution' | 'on_close';
    followUpEnabled: boolean;
    lowRatingThreshold: SatisfactionRating;
  };
  escalationSettings: {
    autoEscalation: boolean;
    escalationThreshold: number;
    notifyManagement: boolean;
  };
  notifications: {
    newTicketAssigned: boolean;
    slaWarning: boolean;
    escalationAlert: boolean;
    satisfactionSurveyReady: boolean;
  };
  updatedAt: string;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface HelpdeskAlert {
  alertId: string;
  alertType: 'sla_breach' | 'high_backlog' | 'agent_capacity' | 'low_satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  relatedEntity: {
    entityType: 'ticket' | 'agent' | 'sla' | 'analytics';
    entityId: string;
    entityName: string;
  };
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
