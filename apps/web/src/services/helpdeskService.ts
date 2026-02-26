/**
 * @module helpdeskService
 * @description ESS IT Helpdesk Service — ticket CRUD, knowledge base, SLA tracking,
 *              conversation threads and category management (Sec 17.3)
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending_user'
  | 'resolved'
  | 'closed'
  | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory =
  | 'it_equipment'
  | 'software_access'
  | 'network'
  | 'email'
  | 'hardware'
  | 'account'
  | 'other';

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'employee' | 'agent' | 'system';
  authorAvatar?: string;
  message: string;
  attachments: TicketAttachment[];
  isInternal: boolean;
  createdAt: string;
}

export interface TicketActivityLog {
  id: string;
  ticketId: string;
  actorId: string;
  actorName: string;
  action:
    | 'created'
    | 'assigned'
    | 'status_changed'
    | 'priority_changed'
    | 'commented'
    | 'resolved'
    | 'reopened'
    | 'escalated';
  fromValue?: string;
  toValue?: string;
  description: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  relatedAsset?: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
  activityLog: TicketActivityLog[];
  slaDeadline: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  resolution?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  employeeId: string;
  relatedAsset?: string;
  attachments?: Omit<TicketAttachment, 'id' | 'uploadedDate'>[];
  tags?: string[];
}

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  employeeId?: string;
  assignedAgentId?: string;
  page?: number;
  pageSize?: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: TicketCategory;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
}

export interface TicketCategory_Meta {
  value: TicketCategory;
  label: string;
  icon: string;
  description: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-001',
    ticketNumber: 'INC-2026-0401',
    subject: 'Cannot access company VPN from home',
    description:
      'Since the last Windows update, my VPN client throws "authentication failed" even with correct credentials. Tried reinstalling but same issue persists.',
    category: 'network',
    priority: 'high',
    status: 'in_progress',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    employeeDepartment: 'Engineering',
    assignedAgentId: 'agent-001',
    assignedAgentName: 'Alex Thompson',
    relatedAsset: 'Laptop - Dell XPS 15 (EQ-1042)',
    attachments: [],
    comments: [
      {
        id: 'comment-001',
        ticketId: 'ticket-001',
        authorId: 'agent-001',
        authorName: 'Alex Thompson',
        authorRole: 'agent',
        message:
          'Hi Jane, I can see the issue. Please run the VPN diagnostic tool and share the output file. Instructions sent to your email.',
        attachments: [],
        isInternal: false,
        createdAt: '2026-02-20T10:30:00Z',
      },
      {
        id: 'comment-002',
        ticketId: 'ticket-001',
        authorId: 'emp-001',
        authorName: 'Jane Doe',
        authorRole: 'employee',
        message: 'Done! Attached the diagnostic report. Let me know if you need anything else.',
        attachments: [],
        isInternal: false,
        createdAt: '2026-02-20T11:15:00Z',
      },
    ],
    activityLog: [
      {
        id: 'log-001',
        ticketId: 'ticket-001',
        actorId: 'emp-001',
        actorName: 'Jane Doe',
        action: 'created',
        description: 'Ticket created',
        timestamp: '2026-02-20T09:00:00Z',
      },
      {
        id: 'log-002',
        ticketId: 'ticket-001',
        actorId: 'system',
        actorName: 'System',
        action: 'assigned',
        toValue: 'Alex Thompson',
        description: 'Auto-assigned to Alex Thompson',
        timestamp: '2026-02-20T09:05:00Z',
      },
    ],
    slaDeadline: '2026-02-20T17:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-02-20T11:15:00Z',
    tags: ['vpn', 'network', 'remote-work'],
  },
  {
    id: 'ticket-002',
    ticketNumber: 'INC-2026-0398',
    subject: 'Request access to Salesforce CRM',
    description:
      'I have joined the Sales team and need Salesforce CRM access for managing leads. My manager has already approved this request.',
    category: 'software_access',
    priority: 'medium',
    status: 'open',
    employeeId: 'emp-002',
    employeeName: 'John Smith',
    employeeEmail: 'john.smith@company.com',
    employeeDepartment: 'Sales & Marketing',
    attachments: [],
    comments: [],
    activityLog: [
      {
        id: 'log-003',
        ticketId: 'ticket-002',
        actorId: 'emp-002',
        actorName: 'John Smith',
        action: 'created',
        description: 'Ticket created',
        timestamp: '2026-02-21T14:00:00Z',
      },
    ],
    slaDeadline: '2026-02-22T14:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-21T14:00:00Z',
    updatedAt: '2026-02-21T14:00:00Z',
    tags: ['salesforce', 'access-request'],
  },
  {
    id: 'ticket-003',
    ticketNumber: 'INC-2026-0385',
    subject: 'Laptop keyboard keys sticking',
    description:
      'Multiple keys on my laptop keyboard are sticking and some are not responding at all. This is affecting my productivity significantly.',
    category: 'hardware',
    priority: 'medium',
    status: 'resolved',
    employeeId: 'emp-003',
    employeeName: 'Sarah Lee',
    employeeEmail: 'sarah.lee@company.com',
    employeeDepartment: 'Human Resources',
    assignedAgentId: 'agent-002',
    assignedAgentName: 'Maria Garcia',
    relatedAsset: 'Laptop - MacBook Pro 14 (EQ-2011)',
    attachments: [],
    comments: [
      {
        id: 'comment-003',
        ticketId: 'ticket-003',
        authorId: 'agent-002',
        authorName: 'Maria Garcia',
        authorRole: 'agent',
        message:
          'Replacement keyboard has been ordered. Estimated delivery: 2-3 business days. Providing a loaner keyboard in the meantime.',
        attachments: [],
        isInternal: false,
        createdAt: '2026-02-15T11:00:00Z',
      },
    ],
    activityLog: [],
    slaDeadline: '2026-02-16T10:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-18T14:00:00Z',
    resolvedAt: '2026-02-18T14:00:00Z',
    resolution: 'Keyboard replaced with new unit. Issue fully resolved.',
    satisfactionRating: 5,
    tags: ['keyboard', 'hardware-repair'],
  },
  {
    id: 'ticket-004',
    ticketNumber: 'INC-2026-0401',
    subject: 'Email not syncing on mobile device',
    description:
      'Corporate email stopped syncing on my iPhone since yesterday. Other apps work fine. Using iOS Mail with Exchange setup.',
    category: 'email',
    priority: 'high',
    status: 'open',
    employeeId: 'emp-004',
    employeeName: 'Michael Zhang',
    employeeEmail: 'michael.zhang@company.com',
    employeeDepartment: 'Finance',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-25T12:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-25T04:00:00Z',
    updatedAt: '2026-02-25T04:00:00Z',
    tags: ['email', 'mobile', 'exchange'],
  },
  {
    id: 'ticket-005',
    ticketNumber: 'INC-2026-0399',
    subject: 'Password reset for company portal',
    description: 'I have been locked out of the HR portal after too many failed login attempts.',
    category: 'account',
    priority: 'critical',
    status: 'resolved',
    employeeId: 'emp-005',
    employeeName: 'Priya Patel',
    employeeEmail: 'priya.patel@company.com',
    employeeDepartment: 'Operations',
    assignedAgentId: 'agent-001',
    assignedAgentName: 'Alex Thompson',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-22T11:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-22T09:00:00Z',
    updatedAt: '2026-02-22T09:30:00Z',
    resolvedAt: '2026-02-22T09:30:00Z',
    resolution:
      'Account unlocked and temporary password issued. User guided through password reset.',
    satisfactionRating: 4,
    tags: ['password', 'account-lockout'],
  },
  {
    id: 'ticket-006',
    ticketNumber: 'INC-2026-0390',
    subject: 'New monitor request for WFH setup',
    description:
      'Requesting an additional monitor for my WFH setup as approved by my manager for remote productivity improvement.',
    category: 'it_equipment',
    priority: 'low',
    status: 'in_progress',
    employeeId: 'emp-006',
    employeeName: 'David Kim',
    employeeEmail: 'david.kim@company.com',
    employeeDepartment: 'Product',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-03-01T10:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-19T14:00:00Z',
    tags: ['equipment-request', 'monitor', 'wfh'],
  },
  {
    id: 'ticket-007',
    ticketNumber: 'INC-2026-0402',
    subject: 'Adobe Creative Suite license activation failed',
    description:
      'Trying to activate my Adobe CC license but getting an error: "License not found". My subscription was renewed last week.',
    category: 'software_access',
    priority: 'medium',
    status: 'open',
    employeeId: 'emp-007',
    employeeName: 'Lisa Wang',
    employeeEmail: 'lisa.wang@company.com',
    employeeDepartment: 'Marketing',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-26T10:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-02-25T08:00:00Z',
    tags: ['adobe', 'license', 'creative-suite'],
  },
  {
    id: 'ticket-008',
    ticketNumber: 'INC-2026-0395',
    subject: 'Office WiFi intermittent on 3rd floor',
    description:
      'Multiple employees on the 3rd floor are experiencing intermittent WiFi drops. This has been happening for the past 3 days.',
    category: 'network',
    priority: 'high',
    status: 'closed',
    employeeId: 'emp-008',
    employeeName: 'Tom Johnson',
    employeeEmail: 'tom.johnson@company.com',
    employeeDepartment: 'Engineering',
    assignedAgentId: 'agent-002',
    assignedAgentName: 'Maria Garcia',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-22T08:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-21T16:00:00Z',
    updatedAt: '2026-02-22T12:00:00Z',
    resolvedAt: '2026-02-22T12:00:00Z',
    closedAt: '2026-02-23T10:00:00Z',
    resolution:
      'Access point replaced and network configuration updated. All floors tested and working.',
    satisfactionRating: 5,
    tags: ['wifi', 'network', 'office'],
  },
  {
    id: 'ticket-009',
    ticketNumber: 'INC-2026-0403',
    subject: 'Slack 2FA not working after phone change',
    description:
      'Changed my phone and now 2FA codes are not being accepted on Slack. Need help migrating authenticator.',
    category: 'account',
    priority: 'high',
    status: 'in_progress',
    employeeId: 'emp-009',
    employeeName: 'Emily Chen',
    employeeEmail: 'emily.chen@company.com',
    employeeDepartment: 'Customer Success',
    assignedAgentId: 'agent-001',
    assignedAgentName: 'Alex Thompson',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-25T16:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-25T08:30:00Z',
    updatedAt: '2026-02-25T09:00:00Z',
    tags: ['slack', '2fa', 'authentication'],
  },
  {
    id: 'ticket-010',
    ticketNumber: 'INC-2026-0404',
    subject: 'Printer on 2nd floor not printing in color',
    description:
      'The color laser printer near conference room B has been printing in grayscale only for the past week despite color settings being correct.',
    category: 'hardware',
    priority: 'low',
    status: 'open',
    employeeId: 'emp-010',
    employeeName: 'Robert Brown',
    employeeEmail: 'robert.brown@company.com',
    employeeDepartment: 'Legal',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-28T10:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-25T10:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
    tags: ['printer', 'color', 'hardware'],
  },
  {
    id: 'ticket-011',
    ticketNumber: 'INC-2026-0388',
    subject: 'Need MS Teams license upgrade',
    description:
      'Currently on basic Teams license but need the Premium plan for advanced meeting features required for client presentations.',
    category: 'software_access',
    priority: 'medium',
    status: 'pending_user',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    employeeEmail: 'jane.doe@company.com',
    employeeDepartment: 'Engineering',
    assignedAgentId: 'agent-002',
    assignedAgentName: 'Maria Garcia',
    attachments: [],
    comments: [],
    activityLog: [],
    slaDeadline: '2026-02-24T10:00:00Z',
    slaBreached: false,
    createdAt: '2026-02-19T11:00:00Z',
    updatedAt: '2026-02-20T15:00:00Z',
    tags: ['ms-teams', 'license-upgrade'],
  },
];

const MOCK_KNOWLEDGE_BASE: KnowledgeBaseArticle[] = [
  {
    id: 'kb-001',
    title: 'How to connect to company VPN',
    summary:
      'Step-by-step guide to setting up and connecting to the corporate VPN from any device.',
    content: 'Full article content...',
    category: 'network',
    tags: ['vpn', 'remote', 'network'],
    views: 1240,
    helpful: 98,
    notHelpful: 5,
    lastUpdated: '2026-01-15',
  },
  {
    id: 'kb-002',
    title: 'Requesting software access or new licenses',
    summary:
      'How to request access to software tools, submit license requests, and get manager approval.',
    content: 'Full article content...',
    category: 'software_access',
    tags: ['software', 'access', 'license'],
    views: 890,
    helpful: 76,
    notHelpful: 3,
    lastUpdated: '2026-01-20',
  },
  {
    id: 'kb-003',
    title: 'Setting up corporate email on mobile (iOS & Android)',
    summary: 'Configure Microsoft Exchange email on your personal or company mobile device.',
    content: 'Full article content...',
    category: 'email',
    tags: ['email', 'mobile', 'exchange', 'ios', 'android'],
    views: 2100,
    helpful: 145,
    notHelpful: 12,
    lastUpdated: '2026-02-01',
  },
  {
    id: 'kb-004',
    title: 'Resetting your account password',
    summary: 'Self-service password reset instructions for all company systems and portals.',
    content: 'Full article content...',
    category: 'account',
    tags: ['password', 'reset', 'account'],
    views: 3200,
    helpful: 210,
    notHelpful: 8,
    lastUpdated: '2026-02-10',
  },
  {
    id: 'kb-005',
    title: 'Troubleshooting printer issues',
    summary: 'Common printer problems and their solutions for office printers.',
    content: 'Full article content...',
    category: 'hardware',
    tags: ['printer', 'hardware', 'troubleshoot'],
    views: 540,
    helpful: 42,
    notHelpful: 7,
    lastUpdated: '2026-01-25',
  },
];

// ============================================================================
// PRIORITY SLA CONFIG
// ============================================================================

export const TICKET_PRIORITY_SLA: Record<
  TicketPriority,
  { label: string; slaHours: number; color: string; bgColor: string; description: string }
> = {
  low: {
    label: 'Low',
    slaHours: 72,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    description: '72-hour response SLA',
  },
  medium: {
    label: 'Medium',
    slaHours: 24,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '24-hour response SLA',
  },
  high: {
    label: 'High',
    slaHours: 8,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: '8-hour response SLA',
  },
  critical: {
    label: 'Critical',
    slaHours: 2,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: '2-hour response SLA',
  },
};

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { label: string; color: string; bgColor: string }
> = {
  open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  pending_user: { label: 'Pending User', color: 'text-violet-600', bgColor: 'bg-violet-50' },
  resolved: { label: 'Resolved', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  closed: { label: 'Closed', color: 'text-slate-500', bgColor: 'bg-slate-100' },
  reopened: { label: 'Reopened', color: 'text-orange-600', bgColor: 'bg-orange-50' },
};

export const TICKET_CATEGORY_META: TicketCategory_Meta[] = [
  {
    value: 'it_equipment',
    label: 'IT Equipment',
    icon: 'Monitor',
    description: 'Laptops, monitors, peripherals, accessories',
  },
  {
    value: 'software_access',
    label: 'Software Access',
    icon: 'Key',
    description: 'License requests, access provisioning',
  },
  {
    value: 'network',
    label: 'Network',
    icon: 'Wifi',
    description: 'VPN, WiFi, internet connectivity issues',
  },
  {
    value: 'email',
    label: 'Email',
    icon: 'Mail',
    description: 'Email setup, sync issues, configuration',
  },
  {
    value: 'hardware',
    label: 'Hardware',
    icon: 'HardDrive',
    description: 'Printers, keyboards, mouse, cables',
  },
  {
    value: 'account',
    label: 'Account',
    icon: 'UserCog',
    description: 'Password reset, 2FA, account lockouts',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'HelpCircle',
    description: 'General IT support requests',
  },
];

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class HelpdeskService {
  /**
   * Create a new IT support ticket
   */
  static async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    try {
      return await APIClient.post<SupportTicket>('/v1/helpdesk/tickets', data);
    } catch {
      const slaHours = TICKET_PRIORITY_SLA[data.priority].slaHours;
      const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        ticketNumber: `INC-${new Date().getFullYear()}-${String(MOCK_TICKETS.length + 405).padStart(4, '0')}`,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'open',
        employeeId: data.employeeId,
        employeeName: 'Current User',
        employeeEmail: 'user@company.com',
        employeeDepartment: 'Your Department',
        relatedAsset: data.relatedAsset,
        attachments: [],
        comments: [],
        activityLog: [
          {
            id: `log-${Date.now()}`,
            ticketId: `ticket-${Date.now()}`,
            actorId: data.employeeId,
            actorName: 'Current User',
            action: 'created',
            description: 'Ticket created',
            timestamp: new Date().toISOString(),
          },
        ],
        slaDeadline,
        slaBreached: false,
        tags: data.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_TICKETS.push(newTicket);
      return newTicket;
    }
  }

  /**
   * List tickets with optional filters
   */
  static async getTickets(filters?: TicketFilters): Promise<SupportTicket[]> {
    try {
      return await APIClient.get<SupportTicket[]>('/v1/helpdesk/tickets', filters);
    } catch {
      let results = [...MOCK_TICKETS];
      if (filters?.status) results = results.filter((t) => t.status === filters.status);
      if (filters?.category) results = results.filter((t) => t.category === filters.category);
      if (filters?.priority) results = results.filter((t) => t.priority === filters.priority);
      if (filters?.employeeId) results = results.filter((t) => t.employeeId === filters.employeeId);
      if (filters?.assignedAgentId)
        results = results.filter((t) => t.assignedAgentId === filters.assignedAgentId);
      return results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  /**
   * Get full ticket detail with conversation thread
   */
  static async getTicket(id: string): Promise<SupportTicket | null> {
    try {
      return await APIClient.get<SupportTicket>(`/v1/helpdesk/tickets/${id}`);
    } catch {
      return MOCK_TICKETS.find((t) => t.id === id) ?? null;
    }
  }

  /**
   * Add a comment/reply to a ticket conversation
   */
  static async addComment(
    ticketId: string,
    message: string,
    attachments?: Omit<TicketAttachment, 'id' | 'uploadedDate'>[]
  ): Promise<SupportTicket> {
    try {
      return await APIClient.post<SupportTicket>(`/v1/helpdesk/tickets/${ticketId}/comments`, {
        message,
        attachments,
      });
    } catch {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
      if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
      const newComment: TicketComment = {
        id: `comment-${Date.now()}`,
        ticketId,
        authorId: 'emp-current',
        authorName: 'Current User',
        authorRole: 'employee',
        message,
        attachments: [],
        isInternal: false,
        createdAt: new Date().toISOString(),
      };
      ticket.comments.push(newComment);
      ticket.updatedAt = new Date().toISOString();
      return ticket;
    }
  }

  /**
   * Mark a ticket as resolved
   */
  static async resolveTicket(ticketId: string, resolution: string): Promise<SupportTicket> {
    try {
      return await APIClient.post<SupportTicket>(`/v1/helpdesk/tickets/${ticketId}/resolve`, {
        resolution,
      });
    } catch {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
      if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
      ticket.status = 'resolved';
      ticket.resolution = resolution;
      ticket.resolvedAt = new Date().toISOString();
      ticket.updatedAt = new Date().toISOString();
      return ticket;
    }
  }

  /**
   * Reopen a resolved/closed ticket
   */
  static async reopenTicket(ticketId: string, reason: string): Promise<SupportTicket> {
    try {
      return await APIClient.post<SupportTicket>(`/v1/helpdesk/tickets/${ticketId}/reopen`, {
        reason,
      });
    } catch {
      const ticket = MOCK_TICKETS.find((t) => t.id === ticketId);
      if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
      ticket.status = 'reopened';
      ticket.updatedAt = new Date().toISOString();
      ticket.activityLog.push({
        id: `log-${Date.now()}`,
        ticketId,
        actorId: 'emp-current',
        actorName: 'Current User',
        action: 'reopened',
        description: reason,
        timestamp: new Date().toISOString(),
      });
      return ticket;
    }
  }

  /**
   * Get available ticket categories
   */
  static async getCategories(): Promise<TicketCategory_Meta[]> {
    try {
      return await APIClient.get<TicketCategory_Meta[]>('/v1/helpdesk/categories');
    } catch {
      return TICKET_CATEGORY_META;
    }
  }

  /**
   * Search the IT knowledge base
   */
  static async getKnowledgeBase(query?: string): Promise<KnowledgeBaseArticle[]> {
    try {
      return await APIClient.get<KnowledgeBaseArticle[]>('/v1/helpdesk/knowledge-base', { query });
    } catch {
      if (!query) return MOCK_KNOWLEDGE_BASE;
      const q = query.toLowerCase();
      return MOCK_KNOWLEDGE_BASE.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.some((t) => t.includes(q))
      );
    }
  }

  /**
   * Get ticket statistics for dashboard
   */
  static async getTicketStats(employeeId?: string): Promise<{
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  }> {
    try {
      return await APIClient.get('/v1/helpdesk/stats', { employeeId });
    } catch {
      const tickets = employeeId
        ? MOCK_TICKETS.filter((t) => t.employeeId === employeeId)
        : MOCK_TICKETS;
      return {
        open: tickets.filter((t) => t.status === 'open').length,
        inProgress: tickets.filter((t) => t.status === 'in_progress' || t.status === 'pending_user')
          .length,
        resolved: tickets.filter((t) => t.status === 'resolved').length,
        closed: tickets.filter((t) => t.status === 'closed').length,
        total: tickets.length,
      };
    }
  }
}
