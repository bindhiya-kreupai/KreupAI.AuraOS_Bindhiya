/**
 * Collaboration Module - Sample Data
 * Comprehensive sample data for immediate testing and development
 */

import type {
  Whiteboard,
  KanbanBoard,
  Standup,
  StandupResponse,
  CollaborationSettings} from './types';
import {
  WhiteboardElement,
  KanbanColumn,
  KanbanCard
} from './types';

// ============================================================================
// Sample Whiteboards
// ============================================================================

export const sampleWhiteboards: Whiteboard[] = [
  {
    whiteboardId: 'wb-001',
    whiteboardCode: 'WB-SPRINT-PLAN',
    title: 'Q4 Sprint Planning',
    description: 'Sprint planning whiteboard for Q4 2024 initiatives',
    status: 'active',

    ownerId: 'user-001',
    ownerName: 'Sarah Mitchell',
    teamId: 'team-eng-001',
    teamName: 'Engineering Team Alpha',

    visibility: 'team',
    isTemplate: false,

    canvasWidth: 3000,
    canvasHeight: 2000,
    backgroundColor: '#FFFFFF',
    gridEnabled: true,
    gridSize: 20,
    snapToGrid: true,

    elements: [
      {
        elementId: 'elem-001',
        elementType: 'sticky_note',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        zIndex: 1,
        content: {
          text: 'User Authentication Module',
          color: '#FFF9C4',
          fontSize: 14,
          author: 'Sarah Mitchell',
          timestamp: new Date('2024-12-10'),
        },
        backgroundColor: '#FFF9C4',
        opacity: 1,
        locked: false,
        hidden: false,
        selected: false,
        createdBy: 'user-001',
        lastEditedBy: 'user-001',
        lastEditedDate: new Date('2024-12-10'),
        comments: [],
        reactions: [],
      },
      {
        elementId: 'elem-002',
        elementType: 'sticky_note',
        x: 350,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        zIndex: 1,
        content: {
          text: 'API Gateway Improvements',
          color: '#BBDEFB',
          fontSize: 14,
          author: 'Michael Chen',
          timestamp: new Date('2024-12-10'),
        },
        backgroundColor: '#BBDEFB',
        opacity: 1,
        locked: false,
        hidden: false,
        selected: false,
        createdBy: 'user-002',
        lastEditedBy: 'user-002',
        lastEditedDate: new Date('2024-12-10'),
        comments: [],
        reactions: [],
      },
      {
        elementId: 'elem-003',
        elementType: 'text',
        x: 100,
        y: 50,
        width: 400,
        height: 40,
        rotation: 0,
        zIndex: 2,
        content: {
          text: 'Sprint Goals',
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textColor: '#000000',
          lineHeight: 1.5,
        },
        opacity: 1,
        locked: false,
        hidden: false,
        selected: false,
        createdBy: 'user-001',
        lastEditedBy: 'user-001',
        lastEditedDate: new Date('2024-12-10'),
        comments: [],
        reactions: [],
      },
    ],
    totalElements: 3,

    collaborators: [
      {
        userId: 'user-002',
        userName: 'Michael Chen',
        userEmail: 'michael.chen@company.com',
        role: 'edit',
        addedDate: new Date('2024-12-10'),
        addedBy: 'user-001',
        lastActive: new Date('2024-12-12'),
      },
      {
        userId: 'user-003',
        userName: 'Emily Rodriguez',
        userEmail: 'emily.rodriguez@company.com',
        role: 'comment',
        addedDate: new Date('2024-12-10'),
        addedBy: 'user-001',
        lastActive: new Date('2024-12-11'),
      },
    ],
    activeUsers: [],

    version: 1,
    versions: [],

    lastEditedBy: 'user-002',
    lastEditedDate: new Date('2024-12-12'),
    viewCount: 47,
    editCount: 23,

    allowComments: true,
    allowAnonymousView: false,
    requireApprovalToJoin: false,
    lockWhiteboard: false,

    exportFormats: ['png', 'pdf', 'svg', 'json'],

    audit: {
      createdAt: new Date('2024-12-10'),
      createdBy: 'user-001',
      updatedAt: new Date('2024-12-12'),
      updatedBy: 'user-002',
    },
  },
];

// ============================================================================
// Sample Kanban Boards
// ============================================================================

export const sampleKanbanBoards: KanbanBoard[] = [
  {
    boardId: 'board-001',
    boardCode: 'BOARD-ENG-Q4',
    boardName: 'Engineering Q4 2024',
    description: 'Engineering team tasks and initiatives for Q4',
    status: 'active',

    ownerId: 'user-001',
    ownerName: 'Sarah Mitchell',
    teamId: 'team-eng-001',
    teamName: 'Engineering Team Alpha',

    visibility: 'team',
    isTemplate: false,

    columns: [
      {
        columnId: 'col-001',
        columnName: 'Backlog',
        columnType: 'backlog',
        position: 0,
        cards: [],
        cardCount: 0,
        color: '#9E9E9E',
        collapsed: false,
        isDone: false,
        isBacklog: true,
        isArchive: false,
      },
      {
        columnId: 'col-002',
        columnName: 'To Do',
        columnType: 'todo',
        position: 1,
        cards: [],
        cardCount: 0,
        cardLimit: 10,
        limitType: 'soft',
        color: '#2196F3',
        collapsed: false,
        isDone: false,
        isBacklog: false,
        isArchive: false,
        wipLimit: 10,
      },
      {
        columnId: 'col-003',
        columnName: 'In Progress',
        columnType: 'in_progress',
        position: 2,
        cards: [
          {
            cardId: 'card-001',
            cardNumber: 1,
            title: 'Implement User Authentication',
            description: 'Build OAuth 2.0 authentication flow with JWT tokens',
            status: 'active',
            columnId: 'col-003',
            position: 0,
            assignees: ['user-001', 'user-002'],
            assigneeNames: ['Sarah Mitchell', 'Michael Chen'],
            reporter: 'user-001',
            reporterName: 'Sarah Mitchell',
            priority: 'high',
            labels: ['backend', 'security'],
            tags: ['authentication', 'oauth'],
            cardType: 'feature',
            dueDate: new Date('2024-12-20'),
            startDate: new Date('2024-12-08'),
            estimatedHours: 40,
            actualHours: 24,
            progress: 60,
            subtasks: [
              {
                subtaskId: 'sub-001',
                title: 'Setup OAuth providers',
                isCompleted: true,
                completedBy: 'user-001',
                completedDate: new Date('2024-12-09'),
                assignee: 'user-001',
                position: 0,
              },
              {
                subtaskId: 'sub-002',
                title: 'Implement JWT token generation',
                isCompleted: true,
                completedBy: 'user-002',
                completedDate: new Date('2024-12-11'),
                assignee: 'user-002',
                position: 1,
              },
              {
                subtaskId: 'sub-003',
                title: 'Add refresh token logic',
                isCompleted: false,
                assignee: 'user-001',
                dueDate: new Date('2024-12-18'),
                position: 2,
              },
            ],
            checklists: [
              {
                checklistId: 'check-001',
                checklistName: 'Pre-deployment Checklist',
                items: [
                  {
                    itemId: 'item-001',
                    title: 'Unit tests written',
                    isCompleted: true,
                    completedBy: 'user-002',
                    completedDate: new Date('2024-12-12'),
                    position: 0,
                  },
                  {
                    itemId: 'item-002',
                    title: 'Integration tests passed',
                    isCompleted: false,
                    position: 1,
                  },
                  {
                    itemId: 'item-003',
                    title: 'Code review completed',
                    isCompleted: false,
                    position: 2,
                  },
                ],
                totalItems: 3,
                completedItems: 1,
                progress: 33.3,
              },
            ],
            customFieldValues: [],
            attachments: [
              {
                attachmentId: 'att-001',
                fileName: 'oauth-flow-diagram.png',
                fileType: 'image/png',
                fileSize: 245678,
                fileUrl: '/attachments/oauth-flow.png',
                uploadedBy: 'user-001',
                uploadedDate: new Date('2024-12-09'),
              },
            ],
            links: [],
            comments: [
              {
                commentId: 'comment-001',
                userId: 'user-002',
                userName: 'Michael Chen',
                commentText: 'JWT implementation is complete. Moving to refresh tokens next.',
                commentDate: new Date('2024-12-11'),
                mentions: ['user-001'],
                attachments: [],
                reactions: [
                  {
                    reactionId: 'react-001',
                    userId: 'user-001',
                    userName: 'Sarah Mitchell',
                    emoji: '👍',
                    timestamp: new Date('2024-12-11'),
                  },
                ],
              },
            ],
            activityLog: [
              {
                activityId: 'act-001',
                activityType: 'created',
                activityDate: new Date('2024-12-08'),
                performedBy: 'user-001',
                performedByName: 'Sarah Mitchell',
                description: 'Card created',
              },
              {
                activityId: 'act-002',
                activityType: 'assigned',
                activityDate: new Date('2024-12-08'),
                performedBy: 'user-001',
                performedByName: 'Sarah Mitchell',
                description: 'Assigned to Michael Chen',
                newValue: 'user-002',
              },
            ],
            watchers: ['user-003'],
            timeEntries: [
              {
                entryId: 'time-001',
                userId: 'user-001',
                userName: 'Sarah Mitchell',
                startTime: new Date('2024-12-09T09:00:00'),
                endTime: new Date('2024-12-09T13:00:00'),
                duration: 240,
                description: 'OAuth provider setup',
                isBillable: true,
              },
              {
                entryId: 'time-002',
                userId: 'user-002',
                userName: 'Michael Chen',
                startTime: new Date('2024-12-11T10:00:00'),
                endTime: new Date('2024-12-11T16:00:00'),
                duration: 360,
                description: 'JWT implementation',
                isBillable: true,
              },
            ],
            totalTimeSpent: 1440,
            blockedBy: [],
            blocks: [],
            relatedCards: [],
            isBlocked: false,
            isPinned: true,
            audit: {
              createdAt: new Date('2024-12-08'),
              createdBy: 'user-001',
              updatedAt: new Date('2024-12-12'),
              updatedBy: 'user-002',
            },
          },
          {
            cardId: 'card-002',
            cardNumber: 2,
            title: 'Fix critical bug in payment gateway',
            description: 'Payment processing fails for amounts over $1000',
            status: 'active',
            columnId: 'col-003',
            position: 1,
            assignees: ['user-003'],
            assigneeNames: ['Emily Rodriguez'],
            reporter: 'user-004',
            reporterName: 'David Kim',
            priority: 'critical',
            labels: ['backend', 'bug'],
            tags: ['payments', 'critical'],
            cardType: 'bug',
            dueDate: new Date('2024-12-15'),
            startDate: new Date('2024-12-12'),
            estimatedHours: 8,
            actualHours: 5,
            progress: 75,
            subtasks: [],
            checklists: [],
            customFieldValues: [],
            attachments: [],
            links: [],
            comments: [],
            activityLog: [],
            watchers: ['user-001', 'user-004'],
            timeEntries: [],
            totalTimeSpent: 300,
            blockedBy: [],
            blocks: [],
            relatedCards: [],
            isBlocked: false,
            isPinned: true,
            audit: {
              createdAt: new Date('2024-12-12'),
              createdBy: 'user-004',
              updatedAt: new Date('2024-12-13'),
              updatedBy: 'user-003',
            },
          },
        ],
        cardCount: 2,
        cardLimit: 5,
        limitType: 'hard',
        color: '#FFC107',
        collapsed: false,
        isDone: false,
        isBacklog: false,
        isArchive: false,
        wipLimit: 5,
        wipWarningThreshold: 4,
      },
      {
        columnId: 'col-004',
        columnName: 'Review',
        columnType: 'review',
        position: 3,
        cards: [],
        cardCount: 0,
        color: '#9C27B0',
        collapsed: false,
        isDone: false,
        isBacklog: false,
        isArchive: false,
      },
      {
        columnId: 'col-005',
        columnName: 'Done',
        columnType: 'done',
        position: 4,
        cards: [],
        cardCount: 0,
        color: '#4CAF50',
        collapsed: false,
        isDone: true,
        isBacklog: false,
        isArchive: false,
      },
    ],
    swimlanes: [],
    useSwimlanes: false,

    totalCards: 2,
    activeCards: 2,
    completedCards: 0,
    archivedCards: 0,

    collaborators: [
      {
        userId: 'user-002',
        userName: 'Michael Chen',
        userEmail: 'michael.chen@company.com',
        role: 'edit',
        addedDate: new Date('2024-12-01'),
        addedBy: 'user-001',
        lastActive: new Date('2024-12-12'),
      },
      {
        userId: 'user-003',
        userName: 'Emily Rodriguez',
        userEmail: 'emily.rodriguez@company.com',
        role: 'edit',
        addedDate: new Date('2024-12-01'),
        addedBy: 'user-001',
        lastActive: new Date('2024-12-13'),
      },
    ],
    watchers: ['user-004'],

    workflowType: 'kanban',
    autoMoveRules: [],
    cardLimits: [],

    customFields: [],
    labels: [
      {
        labelId: 'label-001',
        labelName: 'backend',
        color: '#2196F3',
        description: 'Backend development tasks',
        usageCount: 2,
      },
      {
        labelId: 'label-002',
        labelName: 'security',
        color: '#F44336',
        description: 'Security-related tasks',
        usageCount: 1,
      },
      {
        labelId: 'label-003',
        labelName: 'bug',
        color: '#FF5722',
        description: 'Bug fixes',
        usageCount: 1,
      },
    ],
    cardTemplates: [],

    lastActivity: new Date('2024-12-13'),
    activityLog: [],

    enableCardNumbers: true,
    enableTimeTracking: true,
    enableSubtasks: true,
    enableAttachments: true,
    enableChecklists: true,

    audit: {
      createdAt: new Date('2024-12-01'),
      createdBy: 'user-001',
      updatedAt: new Date('2024-12-13'),
      updatedBy: 'user-003',
    },
  },
];

// ============================================================================
// Sample Standups
// ============================================================================

export const sampleStandups: Standup[] = [
  {
    standupId: 'standup-001',
    standupCode: 'STANDUP-ENG-DAILY',
    standupName: 'Engineering Daily Standup',
    description: 'Daily async standup for the engineering team',
    status: 'active',

    teamId: 'team-eng-001',
    teamName: 'Engineering Team Alpha',
    facilitatorId: 'user-001',
    facilitatorName: 'Sarah Mitchell',

    scheduleType: 'daily',
    scheduleDays: [1, 2, 3, 4, 5], // Mon-Fri
    scheduleTime: '09:00',
    timezone: 'America/New_York',
    duration: 15,

    standupType: 'async',

    questions: [
      {
        questionId: 'q1',
        questionText: 'What did you work on yesterday?',
        questionType: 'text',
        position: 1,
        isRequired: true,
        placeholder: 'Describe your completed work...',
        defaultQuestion: true,
      },
      {
        questionId: 'q2',
        questionText: 'What will you work on today?',
        questionType: 'text',
        position: 2,
        isRequired: true,
        placeholder: 'Describe your planned work...',
        defaultQuestion: true,
      },
      {
        questionId: 'q3',
        questionText: 'Are there any blockers?',
        questionType: 'text',
        position: 3,
        isRequired: false,
        placeholder: 'List any blockers or leave blank...',
        defaultQuestion: true,
      },
      {
        questionId: 'q4',
        questionText: 'How confident do you feel about today\'s tasks?',
        questionType: 'rating',
        position: 4,
        isRequired: false,
        maxRating: 5,
        defaultQuestion: false,
      },
    ],

    participants: ['user-001', 'user-002', 'user-003', 'user-004', 'user-005'],
    requiredParticipants: ['user-001', 'user-002', 'user-003'],
    optionalParticipants: ['user-004', 'user-005'],

    responses: [],
    totalResponses: 0,
    participationRate: 0,

    sendReminder: true,
    reminderTime: 30,
    reminderChannels: ['email', 'push'],

    allowLateSubmissions: true,
    lateSubmissionWindow: 2,
    requireAllQuestions: false,
    allowAnonymous: false,
    autoArchiveAfter: 30,

    meetings: [],

    averageResponseTime: 45,
    completionRate: 87.5,
    trends: [],

    audit: {
      createdAt: new Date('2024-11-01'),
      createdBy: 'user-001',
      updatedAt: new Date('2024-12-01'),
      updatedBy: 'user-001',
    },
  },
];

// ============================================================================
// Sample Standup Responses
// ============================================================================

export const sampleStandupResponses: StandupResponse[] = [
  {
    responseId: 'resp-001',
    standupId: 'standup-001',
    meetingDate: new Date('2024-12-13'),

    userId: 'user-001',
    userName: 'Sarah Mitchell',
    userAvatar: '/avatars/sarah.jpg',

    submittedDate: new Date('2024-12-13T08:45:00'),
    submissionStatus: 'on_time',
    isLate: false,

    answers: [
      {
        answerId: 'ans-001',
        questionId: 'q1',
        questionText: 'What did you work on yesterday?',
        answerType: 'text',
        answerValue: 'Completed OAuth provider setup for authentication module. Fixed 2 critical bugs in the payment gateway.',
        answerText: 'Completed OAuth provider setup for authentication module. Fixed 2 critical bugs in the payment gateway.',
      },
      {
        answerId: 'ans-002',
        questionId: 'q2',
        questionText: 'What will you work on today?',
        answerType: 'text',
        answerValue: 'Will implement JWT token generation and refresh token logic. Code review for payment gateway fixes.',
        answerText: 'Will implement JWT token generation and refresh token logic. Code review for payment gateway fixes.',
      },
      {
        answerId: 'ans-003',
        questionId: 'q3',
        questionText: 'Are there any blockers?',
        answerType: 'text',
        answerValue: '',
        answerText: 'No blockers',
      },
      {
        answerId: 'ans-004',
        questionId: 'q4',
        questionText: 'How confident do you feel about today\'s tasks?',
        answerType: 'rating',
        answerValue: 4,
        answerText: '4/5',
      },
    ],
    allQuestionsAnswered: true,

    comments: [],
    reactions: [
      {
        reactionId: 'react-001',
        userId: 'user-002',
        userName: 'Michael Chen',
        emoji: '👍',
        timestamp: new Date('2024-12-13T09:00:00'),
      },
    ],
    blockers: [],

    isAnonymous: false,
    isPublic: true,

    needsFollowUp: false,
    followUpCompleted: false,

    audit: {
      createdAt: new Date('2024-12-13T08:45:00'),
      createdBy: 'user-001',
      updatedAt: new Date('2024-12-13T08:45:00'),
      updatedBy: 'user-001',
    },
  },
  {
    responseId: 'resp-002',
    standupId: 'standup-001',
    meetingDate: new Date('2024-12-13'),

    userId: 'user-003',
    userName: 'Emily Rodriguez',

    submittedDate: new Date('2024-12-13T09:15:00'),
    submissionStatus: 'late',
    isLate: true,

    answers: [
      {
        answerId: 'ans-005',
        questionId: 'q1',
        questionText: 'What did you work on yesterday?',
        answerType: 'text',
        answerValue: 'Started working on the payment gateway bug. Identified the root cause.',
        answerText: 'Started working on the payment gateway bug. Identified the root cause.',
      },
      {
        answerId: 'ans-006',
        questionId: 'q2',
        questionText: 'What will you work on today?',
        answerType: 'text',
        answerValue: 'Will implement the fix and test with various payment amounts.',
        answerText: 'Will implement the fix and test with various payment amounts.',
      },
      {
        answerId: 'ans-007',
        questionId: 'q3',
        questionText: 'Are there any blockers?',
        answerType: 'text',
        answerValue: 'Need production database access to verify the fix.',
        answerText: 'Need production database access to verify the fix.',
      },
    ],
    allQuestionsAnswered: false,

    comments: [],
    reactions: [],
    blockers: [
      {
        blockerId: 'blocker-001',
        description: 'Need production database access to verify the fix',
        blockerType: 'resource',
        severity: 'medium',
        status: 'open',
        createdDate: new Date('2024-12-13T09:15:00'),
        createdBy: 'user-003',
        daysBlocked: 0,
      },
    ],

    isAnonymous: false,
    isPublic: true,

    needsFollowUp: true,
    followUpAssignee: 'user-001',
    followUpNotes: 'Sarah to provision DB access for Emily',
    followUpCompleted: false,

    audit: {
      createdAt: new Date('2024-12-13T09:15:00'),
      createdBy: 'user-003',
      updatedAt: new Date('2024-12-13T09:15:00'),
      updatedBy: 'user-003',
    },
  },
];

// ============================================================================
// Sample Settings
// ============================================================================

export const sampleCollaborationSettings: CollaborationSettings = {
  settingsId: 'settings-001',

  whiteboardSettings: {
    enabled: true,
    defaultVisibility: 'team',
    maxCollaborators: 50,
    enableVersioning: true,
    enableComments: true,
    autoSaveInterval: 30,
    enableRealtimeCollaboration: true,
  },

  kanbanSettings: {
    enabled: true,
    defaultVisibility: 'team',
    enableTimeTracking: true,
    enableSubtasks: true,
    enableChecklists: true,
    enableAttachments: true,
    cardNumberingFormat: 'sequential',
    defaultWipLimit: 5,
  },

  standupSettings: {
    enabled: true,
    defaultType: 'async',
    defaultDuration: 15,
    defaultQuestions: [
      {
        questionId: 'q1',
        questionText: 'What did you work on yesterday?',
        questionType: 'text',
        position: 1,
        isRequired: true,
        defaultQuestion: true,
      },
      {
        questionId: 'q2',
        questionText: 'What will you work on today?',
        questionType: 'text',
        position: 2,
        isRequired: true,
        defaultQuestion: true,
      },
      {
        questionId: 'q3',
        questionText: 'Are there any blockers?',
        questionType: 'text',
        position: 3,
        isRequired: false,
        defaultQuestion: true,
      },
    ],
    enableReminders: true,
    defaultReminderTime: 30,
    allowAnonymousResponses: false,
    autoArchiveAfter: 30,
  },

  notificationSettings: {
    notifyOnComment: true,
    notifyOnMention: true,
    notifyOnAssignment: true,
    notifyOnDueDate: true,
    notifyOnBlocker: true,
    notifyOnStandupReminder: true,
    digestFrequency: 'daily',
  },

  audit: {
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    updatedAt: new Date('2024-11-15'),
    updatedBy: 'admin-001',
  },
};

// Initialize localStorage with sample data
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('collaboration_whiteboards')) {
    localStorage.setItem('collaboration_whiteboards', JSON.stringify(sampleWhiteboards));
  }
  if (!localStorage.getItem('collaboration_kanban_boards')) {
    localStorage.setItem('collaboration_kanban_boards', JSON.stringify(sampleKanbanBoards));
  }
  if (!localStorage.getItem('collaboration_standups')) {
    localStorage.setItem('collaboration_standups', JSON.stringify(sampleStandups));
  }
  if (!localStorage.getItem('collaboration_standup_responses')) {
    localStorage.setItem('collaboration_standup_responses', JSON.stringify(sampleStandupResponses));
  }
  if (!localStorage.getItem('collaboration_settings')) {
    localStorage.setItem('collaboration_settings', JSON.stringify(sampleCollaborationSettings));
  }
}
