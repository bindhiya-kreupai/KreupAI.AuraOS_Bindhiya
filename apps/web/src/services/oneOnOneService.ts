/**
 * @module oneOnOneService
 * @description One-on-One Meeting service — CRUD, scheduling, notes, action items
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type MeetingType =
  | 'weekly_sync'
  | 'career_dev'
  | 'performance_review'
  | 'feedback'
  | 'check_in';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface OneOnOneMeeting {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  managerId: string;
  managerName: string;
  scheduledDate: string;
  duration: number; // minutes
  type: MeetingType;
  status: MeetingStatus;
  location: string;
  agendaItems: AgendaItem[];
  notes: string;
  actionItems: MeetingActionItem[];
  sentiment?: number; // 1-5
  completedAt?: string;
  recurring?: { frequency: 'weekly' | 'biweekly' | 'monthly'; dayOfWeek: number };
}

export interface AgendaItem {
  id: string;
  text: string;
  isDiscussed: boolean;
  notes: string;
  addedBy: 'manager' | 'employee';
}

export interface MeetingActionItem {
  id: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  status: ActionStatus;
  priority: Priority;
  meetingId: string;
  completedAt?: string;
}

export interface AgendaTemplate {
  id: string;
  name: string;
  type: MeetingType;
  items: string[];
  isDefault: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_MEETINGS: OneOnOneMeeting[] = [
  {
    id: 'mtg-001',
    employeeId: 'emp-101',
    employeeName: 'Alex Rivera',
    managerId: 'mgr-001',
    managerName: 'Sarah Chen',
    scheduledDate: '2026-02-28T10:00:00',
    duration: 30,
    type: 'weekly_sync',
    status: 'scheduled',
    location: 'Zoom',
    agendaItems: [
      {
        id: 'a1',
        text: 'Sprint progress update',
        isDiscussed: false,
        notes: '',
        addedBy: 'manager',
      },
      {
        id: 'a2',
        text: 'Blockers and dependencies',
        isDiscussed: false,
        notes: '',
        addedBy: 'manager',
      },
      {
        id: 'a3',
        text: 'Discuss API redesign approach',
        isDiscussed: false,
        notes: '',
        addedBy: 'employee',
      },
    ],
    notes: '',
    actionItems: [],
    recurring: { frequency: 'weekly', dayOfWeek: 3 },
  },
  {
    id: 'mtg-002',
    employeeId: 'emp-102',
    employeeName: 'Priya Sharma',
    managerId: 'mgr-001',
    managerName: 'Sarah Chen',
    scheduledDate: '2026-02-27T14:00:00',
    duration: 45,
    type: 'career_dev',
    status: 'scheduled',
    location: 'Conference Room B',
    agendaItems: [
      {
        id: 'a4',
        text: 'Review Q1 goals progress',
        isDiscussed: false,
        notes: '',
        addedBy: 'manager',
      },
      {
        id: 'a5',
        text: 'Discuss tech lead track',
        isDiscussed: false,
        notes: '',
        addedBy: 'employee',
      },
      {
        id: 'a6',
        text: 'Training budget for AWS certification',
        isDiscussed: false,
        notes: '',
        addedBy: 'employee',
      },
    ],
    notes: '',
    actionItems: [],
  },
  {
    id: 'mtg-003',
    employeeId: 'emp-101',
    employeeName: 'Alex Rivera',
    managerId: 'mgr-001',
    managerName: 'Sarah Chen',
    scheduledDate: '2026-02-21T10:00:00',
    duration: 30,
    type: 'weekly_sync',
    status: 'completed',
    location: 'Zoom',
    agendaItems: [
      {
        id: 'a7',
        text: 'Sprint 14 retrospective',
        isDiscussed: true,
        notes: 'Good velocity, team hit 95% of story points.',
        addedBy: 'manager',
      },
      {
        id: 'a8',
        text: 'Code review backlog',
        isDiscussed: true,
        notes: 'Will implement review buddy system.',
        addedBy: 'employee',
      },
    ],
    notes:
      'Great progress this week. Alex took initiative on the CI/CD pipeline improvements. Discussed need for better documentation standards.',
    actionItems: [
      {
        id: 'ai-001',
        description: 'Create documentation template for new services',
        assignedTo: 'emp-101',
        assignedToName: 'Alex Rivera',
        dueDate: '2026-02-28',
        status: 'in_progress',
        priority: 'medium',
        meetingId: 'mtg-003',
      },
      {
        id: 'ai-002',
        description: 'Review and approve training budget request',
        assignedTo: 'mgr-001',
        assignedToName: 'Sarah Chen',
        dueDate: '2026-02-25',
        status: 'completed',
        priority: 'high',
        meetingId: 'mtg-003',
        completedAt: '2026-02-24',
      },
    ],
    sentiment: 4,
    completedAt: '2026-02-21T10:35:00',
  },
  {
    id: 'mtg-004',
    employeeId: 'emp-103',
    employeeName: 'Marcus Johnson',
    managerId: 'mgr-001',
    managerName: 'Sarah Chen',
    scheduledDate: '2026-02-14T11:00:00',
    duration: 30,
    type: 'check_in',
    status: 'completed',
    location: 'Zoom',
    agendaItems: [
      {
        id: 'a9',
        text: 'Onboarding progress check',
        isDiscussed: true,
        notes: 'Completed all onboarding modules. Pair programming going well.',
        addedBy: 'manager',
      },
      {
        id: 'a10',
        text: 'Team integration feedback',
        isDiscussed: true,
        notes: 'Feeling welcome. Wants more context on legacy systems.',
        addedBy: 'manager',
      },
    ],
    notes:
      'Marcus is ramping up quickly. Schedule knowledge transfer session with Alex on the legacy payment service.',
    actionItems: [
      {
        id: 'ai-003',
        description: 'Schedule knowledge transfer for payment service',
        assignedTo: 'mgr-001',
        assignedToName: 'Sarah Chen',
        dueDate: '2026-02-21',
        status: 'completed',
        priority: 'high',
        meetingId: 'mtg-004',
        completedAt: '2026-02-18',
      },
    ],
    sentiment: 5,
    completedAt: '2026-02-14T11:28:00',
  },
  {
    id: 'mtg-005',
    employeeId: 'emp-102',
    employeeName: 'Priya Sharma',
    managerId: 'mgr-001',
    managerName: 'Sarah Chen',
    scheduledDate: '2026-02-07T14:00:00',
    duration: 30,
    type: 'feedback',
    status: 'completed',
    location: 'Conference Room A',
    agendaItems: [
      {
        id: 'a11',
        text: 'Mid-year performance feedback',
        isDiscussed: true,
        notes:
          'Exceeding expectations in technical delivery. Growth area: cross-team communication.',
        addedBy: 'manager',
      },
    ],
    notes:
      'Priya consistently delivers high-quality work. Recommended for tech lead consideration in Q3. Needs to improve visibility with stakeholders outside engineering.',
    actionItems: [
      {
        id: 'ai-004',
        description: 'Present architecture overview at next all-hands',
        assignedTo: 'emp-102',
        assignedToName: 'Priya Sharma',
        dueDate: '2026-03-15',
        status: 'pending',
        priority: 'medium',
        meetingId: 'mtg-005',
      },
    ],
    sentiment: 4,
    completedAt: '2026-02-07T14:32:00',
  },
];

const MOCK_TEMPLATES: AgendaTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Weekly Sync',
    type: 'weekly_sync',
    isDefault: true,
    items: [
      'Progress update on current tasks',
      'Blockers and dependencies',
      'Priorities for next week',
      'Any support needed?',
    ],
  },
  {
    id: 'tpl-002',
    name: 'Career Development',
    type: 'career_dev',
    isDefault: true,
    items: [
      'Goals progress review',
      'Skills development update',
      'Career path discussion',
      'Learning opportunities',
      'Feedback exchange',
    ],
  },
  {
    id: 'tpl-003',
    name: 'Performance Review',
    type: 'performance_review',
    isDefault: true,
    items: [
      'Review period accomplishments',
      'Areas of strength',
      'Growth opportunities',
      'Goals for next period',
      'Compensation discussion',
    ],
  },
  {
    id: 'tpl-004',
    name: 'Quick Check-in',
    type: 'check_in',
    isDefault: true,
    items: [
      'How are you doing?',
      'Any concerns?',
      'Quick wins this week',
      'Anything I can help with?',
    ],
  },
  {
    id: 'tpl-005',
    name: 'Feedback Session',
    type: 'feedback',
    isDefault: true,
    items: [
      'Specific feedback points',
      'Behavioral observations',
      'Impact discussion',
      'Action plan',
      'Employee response',
    ],
  },
];

// ── Service ────────────────────────────────────────────────────────────────────

export class OneOnOneService {
  static async getMeetings(managerId?: string): Promise<OneOnOneMeeting[]> {
    try {
      return await APIClient.get<OneOnOneMeeting[]>('/v1/one-on-ones', { managerId });
    } catch {
      return MOCK_MEETINGS;
    }
  }

  static async getMeeting(id: string): Promise<OneOnOneMeeting | null> {
    try {
      return await APIClient.get<OneOnOneMeeting>(`/v1/one-on-ones/${id}`);
    } catch {
      return MOCK_MEETINGS.find((m) => m.id === id) || null;
    }
  }

  static async scheduleMeeting(
    data: Omit<OneOnOneMeeting, 'id' | 'actionItems' | 'notes' | 'status'>
  ): Promise<OneOnOneMeeting> {
    const meeting: OneOnOneMeeting = {
      ...data,
      id: `mtg-${Date.now()}`,
      status: 'scheduled',
      notes: '',
      actionItems: [],
    };
    MOCK_MEETINGS.unshift(meeting);
    return meeting;
  }

  static async updateMeeting(
    id: string,
    updates: Partial<OneOnOneMeeting>
  ): Promise<OneOnOneMeeting> {
    const idx = MOCK_MEETINGS.findIndex((m) => m.id === id);
    if (idx >= 0) {
      MOCK_MEETINGS[idx] = { ...MOCK_MEETINGS[idx], ...updates };
      return MOCK_MEETINGS[idx];
    }
    throw new Error('Meeting not found');
  }

  static async completeMeeting(
    id: string,
    notes: string,
    sentiment: number
  ): Promise<OneOnOneMeeting> {
    return this.updateMeeting(id, {
      status: 'completed',
      notes,
      sentiment,
      completedAt: new Date().toISOString(),
    });
  }

  static async cancelMeeting(id: string): Promise<void> {
    const idx = MOCK_MEETINGS.findIndex((m) => m.id === id);
    if (idx >= 0) MOCK_MEETINGS[idx].status = 'cancelled';
  }

  static async addActionItem(
    meetingId: string,
    item: Omit<MeetingActionItem, 'id' | 'meetingId' | 'completedAt'>
  ): Promise<MeetingActionItem> {
    const newItem: MeetingActionItem = { ...item, id: `ai-${Date.now()}`, meetingId };
    const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId);
    if (meeting) meeting.actionItems.push(newItem);
    return newItem;
  }

  static async updateActionItem(
    meetingId: string,
    itemId: string,
    updates: Partial<MeetingActionItem>
  ): Promise<void> {
    const meeting = MOCK_MEETINGS.find((m) => m.id === meetingId);
    if (meeting) {
      const idx = meeting.actionItems.findIndex((a) => a.id === itemId);
      if (idx >= 0) {
        meeting.actionItems[idx] = { ...meeting.actionItems[idx], ...updates };
        if (updates.status === 'completed')
          meeting.actionItems[idx].completedAt = new Date().toISOString();
      }
    }
  }

  static async getTemplates(): Promise<AgendaTemplate[]> {
    return MOCK_TEMPLATES;
  }

  static async getAllActionItems(managerId?: string): Promise<MeetingActionItem[]> {
    const meetings = await this.getMeetings(managerId);
    return meetings.flatMap((m) => m.actionItems);
  }
}

// ── Constants ──────────────────────────────────────────────────────────────────

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  weekly_sync: 'Weekly Sync',
  career_dev: 'Career Development',
  performance_review: 'Performance Review',
  feedback: 'Feedback Session',
  check_in: 'Check-in',
};

export const MEETING_TYPE_COLORS: Record<MeetingType, string> = {
  weekly_sync: 'text-celestial-indigo bg-celestial-indigo/10',
  career_dev: 'text-neural-mint bg-neural-mint/10',
  performance_review: 'text-sunset-amber bg-sunset-amber/10',
  feedback: 'text-nebula-purple bg-nebula-purple/10',
  check_in: 'text-quantum-rose bg-quantum-rose/10',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'text-silver-mist bg-silver-mist/10',
  medium: 'text-sunset-amber bg-sunset-amber/10',
  high: 'text-coral-alert bg-coral-alert/10',
};
