/**
 * Collaboration Module - Type Definitions
 * Comprehensive types for digital whiteboard, task kanban, and daily standups
 */

// ============================================================================
// Common Types
// ============================================================================

export type Status = 'active' | 'inactive' | 'archived' | 'deleted';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AccessLevel = 'view' | 'comment' | 'edit' | 'admin';

export interface AuditInfo {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface Collaborator {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: AccessLevel;
  addedDate: Date;
  addedBy: string;
  lastActive?: Date;
}

// ============================================================================
// Digital Whiteboard Types
// ============================================================================

export interface Whiteboard {
  whiteboardId: string;
  whiteboardCode: string;
  title: string;
  description: string;
  status: Status;

  // Ownership & Access
  ownerId: string;
  ownerName: string;
  teamId?: string;
  teamName?: string;

  // Visibility
  visibility: 'private' | 'team' | 'organization' | 'public';
  isTemplate: boolean;
  templateCategory?: string;

  // Canvas Settings
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  gridEnabled: boolean;
  gridSize: number;
  snapToGrid: boolean;

  // Elements
  elements: WhiteboardElement[];
  totalElements: number;

  // Collaboration
  collaborators: Collaborator[];
  activeUsers: ActiveUser[];
  maxCollaborators?: number;

  // Versioning
  version: number;
  versions: WhiteboardVersion[];

  // Activity
  lastEditedBy: string;
  lastEditedDate: Date;
  viewCount: number;
  editCount: number;

  // Settings
  allowComments: boolean;
  allowAnonymousView: boolean;
  requireApprovalToJoin: boolean;
  lockWhiteboard: boolean;

  // Export
  thumbnailUrl?: string;
  exportFormats: ('png' | 'pdf' | 'svg' | 'json')[];
  lastExported?: Date;

  audit: AuditInfo;
}

export interface WhiteboardElement {
  elementId: string;
  elementType: WhiteboardElementType;

  // Position & Size
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;

  // Style
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity: number;

  // Content (varies by type)
  content: any; // ShapeContent | TextContent | StickyNoteContent | ImageContent | etc.

  // State
  locked: boolean;
  hidden: boolean;
  selected: boolean;

  // Collaboration
  createdBy: string;
  lastEditedBy: string;
  lastEditedDate: Date;

  // Grouping
  groupId?: string;
  parentId?: string; // For nested elements

  // Interactions
  comments: ElementComment[];
  reactions: ElementReaction[];
}

export type WhiteboardElementType =
  | 'shape'
  | 'text'
  | 'sticky_note'
  | 'image'
  | 'drawing'
  | 'arrow'
  | 'connector'
  | 'frame'
  | 'embed'
  | 'table';

export interface ShapeContent {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'custom';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface TextContent {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  lineHeight: number;
}

export interface StickyNoteContent {
  text: string;
  color: string;
  fontSize: number;
  author: string;
  timestamp: Date;
}

export interface ImageContent {
  imageUrl: string;
  altText: string;
  originalWidth: number;
  originalHeight: number;
  maintainAspectRatio: boolean;
  filters?: ImageFilter[];
}

export interface ImageFilter {
  filterType: 'brightness' | 'contrast' | 'blur' | 'grayscale' | 'sepia';
  value: number;
}

export interface DrawingContent {
  paths: DrawingPath[];
  strokeColor: string;
  strokeWidth: number;
  smoothing: boolean;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  pressure?: number[];
}

export interface ArrowContent {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  arrowHead: 'none' | 'arrow' | 'triangle' | 'circle' | 'diamond';
  strokeColor: string;
  strokeWidth: number;
  curveType: 'straight' | 'curved' | 'stepped';
}

export interface ElementComment {
  commentId: string;
  userId: string;
  userName: string;
  commentText: string;
  commentDate: Date;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedDate?: Date;
  replies: CommentReply[];
}

export interface CommentReply {
  replyId: string;
  userId: string;
  userName: string;
  replyText: string;
  replyDate: Date;
}

export interface ElementReaction {
  reactionId: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface ActiveUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string; // Cursor/selection color
  cursorPosition: { x: number; y: number };
  selectedElements: string[];
  lastActivity: Date;
}

export interface WhiteboardVersion {
  versionId: string;
  versionNumber: number;
  versionName?: string;
  createdBy: string;
  createdDate: Date;
  changes: string;
  elementsSnapshot: WhiteboardElement[];
  isCurrent: boolean;
}

// ============================================================================
// Task Kanban Types
// ============================================================================

export interface KanbanBoard {
  boardId: string;
  boardCode: string;
  boardName: string;
  description: string;
  status: Status;

  // Ownership & Access
  ownerId: string;
  ownerName: string;
  teamId?: string;
  teamName?: string;
  projectId?: string;
  projectName?: string;

  // Visibility
  visibility: 'private' | 'team' | 'organization';
  isTemplate: boolean;

  // Board Structure
  columns: KanbanColumn[];
  swimlanes: KanbanSwimlane[];
  useSwimlanes: boolean;

  // Cards
  totalCards: number;
  activeCards: number;
  completedCards: number;
  archivedCards: number;

  // Collaboration
  collaborators: Collaborator[];
  watchers: string[]; // User IDs

  // Workflow
  workflowType: 'simple' | 'scrum' | 'kanban' | 'custom';
  autoMoveRules: AutoMoveRule[];
  cardLimits: ColumnLimit[];

  // Customization
  customFields: CustomField[];
  labels: Label[];
  cardTemplates: CardTemplate[];

  // Activity
  lastActivity: Date;
  activityLog: BoardActivity[];

  // Settings
  enableCardNumbers: boolean;
  enableTimeTracking: boolean;
  enableSubtasks: boolean;
  enableAttachments: boolean;
  enableChecklists: boolean;

  audit: AuditInfo;
}

export interface KanbanColumn {
  columnId: string;
  columnName: string;
  columnType: ColumnType;
  position: number;

  // Cards
  cards: KanbanCard[];
  cardCount: number;
  cardLimit?: number;
  limitType?: 'soft' | 'hard';

  // Display
  color: string;
  icon?: string;
  collapsed: boolean;

  // Workflow
  isDone: boolean;
  isBacklog: boolean;
  isArchive: boolean;

  // WIP Limits
  wipLimit?: number;
  wipWarningThreshold?: number;

  // Automation
  autoAssign?: string; // User ID
  autoLabel?: string[]; // Label IDs
}

export type ColumnType = 'backlog' | 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'custom';

export interface KanbanSwimlane {
  swimlaneId: string;
  swimlaneName: string;
  swimlaneType: 'priority' | 'assignee' | 'team' | 'custom';
  position: number;
  collapsed: boolean;
  cards: KanbanCard[];
  cardCount: number;
}

export interface KanbanCard {
  cardId: string;
  cardNumber: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';

  // Board Position
  columnId: string;
  swimlaneId?: string;
  position: number;

  // Assignment
  assignees: string[]; // User IDs
  assigneeNames: string[];
  reporter: string;
  reporterName: string;

  // Categorization
  priority: Priority;
  labels: string[]; // Label IDs
  tags: string[];
  cardType: 'task' | 'bug' | 'feature' | 'story' | 'epic' | 'custom';

  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;

  // Progress
  progress: number; // 0-100
  subtasks: Subtask[];
  checklists: Checklist[];

  // Customization
  customFieldValues: { fieldId: string; value: any }[];
  coverImage?: string;
  color?: string;

  // Attachments & Links
  attachments: Attachment[];
  links: CardLink[];

  // Activity
  comments: CardComment[];
  activityLog: CardActivity[];
  watchers: string[]; // User IDs

  // Time Tracking
  timeEntries: TimeEntry[];
  totalTimeSpent: number;

  // Dependencies
  blockedBy: string[]; // Card IDs
  blocks: string[]; // Card IDs
  relatedCards: string[]; // Card IDs

  // Metadata
  isBlocked: boolean;
  blockReason?: string;
  isPinned: boolean;

  audit: AuditInfo;
}

export interface Subtask {
  subtaskId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedBy?: string;
  completedDate?: Date;
  assignee?: string;
  dueDate?: Date;
  position: number;
}

export interface Checklist {
  checklistId: string;
  checklistName: string;
  items: ChecklistItem[];
  totalItems: number;
  completedItems: number;
  progress: number; // 0-100
}

export interface ChecklistItem {
  itemId: string;
  title: string;
  isCompleted: boolean;
  completedBy?: string;
  completedDate?: Date;
  position: number;
}

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedDate: Date;
  thumbnailUrl?: string;
}

export interface CardLink {
  linkId: string;
  linkType: 'external' | 'internal';
  linkUrl: string;
  linkTitle: string;
  linkDescription?: string;
  addedBy: string;
  addedDate: Date;
}

export interface CardComment {
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  commentDate: Date;
  editedDate?: Date;
  mentions: string[]; // User IDs mentioned
  attachments: Attachment[];
  reactions: CommentReaction[];
}

export interface CommentReaction {
  reactionId: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface CardActivity {
  activityId: string;
  activityType: CardActivityType;
  activityDate: Date;
  performedBy: string;
  performedByName: string;
  description: string;
  oldValue?: any;
  newValue?: any;
}

export type CardActivityType =
  | 'created'
  | 'moved'
  | 'assigned'
  | 'unassigned'
  | 'priority_changed'
  | 'due_date_changed'
  | 'completed'
  | 'reopened'
  | 'archived'
  | 'commented'
  | 'attachment_added'
  | 'label_added'
  | 'label_removed';

export interface TimeEntry {
  entryId: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  description?: string;
  isBillable: boolean;
}

export interface AutoMoveRule {
  ruleId: string;
  ruleName: string;
  triggerCondition: string;
  sourceColumnId: string;
  targetColumnId: string;
  isActive: boolean;
}

export interface ColumnLimit {
  columnId: string;
  minCards?: number;
  maxCards?: number;
  warningThreshold?: number;
}

export interface CustomField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'user';
  isRequired: boolean;
  defaultValue?: any;
  options?: string[]; // For dropdown type
}

export interface Label {
  labelId: string;
  labelName: string;
  color: string;
  description?: string;
  usageCount: number;
}

export interface CardTemplate {
  templateId: string;
  templateName: string;
  description: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultLabels: string[];
  defaultChecklists: Checklist[];
  customFieldDefaults: { fieldId: string; value: any }[];
}

export interface BoardActivity {
  activityId: string;
  activityType: string;
  activityDate: Date;
  performedBy: string;
  performedByName: string;
  description: string;
  relatedCardId?: string;
  relatedColumnId?: string;
}

// ============================================================================
// Daily Standups Types
// ============================================================================

export interface Standup {
  standupId: string;
  standupCode: string;
  standupName: string;
  description: string;
  status: Status;

  // Team
  teamId: string;
  teamName: string;
  facilitatorId: string;
  facilitatorName: string;

  // Schedule
  scheduleType: 'daily' | 'weekly' | 'custom';
  scheduleDays: number[]; // 0-6 (Sunday-Saturday)
  scheduleTime: string; // HH:mm
  timezone: string;
  duration: number; // minutes

  // Format
  standupType: 'sync' | 'async';
  meetingLink?: string; // For sync standups
  questions: StandupQuestion[];

  // Participation
  participants: string[]; // User IDs
  requiredParticipants: string[];
  optionalParticipants: string[];

  // Responses
  responses: StandupResponse[];
  totalResponses: number;
  participationRate: number; // %

  // Reminders
  sendReminder: boolean;
  reminderTime: number; // minutes before
  reminderChannels: ('email' | 'slack' | 'teams' | 'push')[];

  // Settings
  allowLateSubmissions: boolean;
  lateSubmissionWindow: number; // hours
  requireAllQuestions: boolean;
  allowAnonymous: boolean;
  autoArchiveAfter: number; // days

  // Meetings (for sync standups)
  meetings: StandupMeeting[];
  nextMeeting?: Date;

  // Analytics
  averageResponseTime: number; // minutes
  completionRate: number; // %
  trends: StandupTrend[];

  audit: AuditInfo;
}

export interface StandupQuestion {
  questionId: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'checkbox';
  position: number;
  isRequired: boolean;
  placeholder?: string;
  options?: string[]; // For multiple choice
  maxRating?: number; // For rating type
  defaultQuestion: boolean; // Standard questions like "What did you do yesterday?"
}

export interface StandupResponse {
  responseId: string;
  standupId: string;
  meetingDate: Date;

  // Participant
  userId: string;
  userName: string;
  userAvatar?: string;

  // Submission
  submittedDate: Date;
  submissionStatus: 'on_time' | 'late' | 'missed';
  isLate: boolean;

  // Answers
  answers: StandupAnswer[];
  allQuestionsAnswered: boolean;

  // Engagement
  comments: ResponseComment[];
  reactions: ResponseReaction[];
  blockers: Blocker[];

  // Visibility
  isAnonymous: boolean;
  isPublic: boolean;

  // Follow-up
  needsFollowUp: boolean;
  followUpAssignee?: string;
  followUpNotes?: string;
  followUpCompleted: boolean;

  audit: AuditInfo;
}

export interface StandupAnswer {
  answerId: string;
  questionId: string;
  questionText: string;
  answerType: 'text' | 'multiple_choice' | 'rating' | 'checkbox';
  answerValue: any; // string | string[] | number
  answerText?: string; // Formatted for display
}

export interface ResponseComment {
  commentId: string;
  userId: string;
  userName: string;
  commentText: string;
  commentDate: Date;
  mentions: string[]; // User IDs
}

export interface ResponseReaction {
  reactionId: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface Blocker {
  blockerId: string;
  description: string;
  blockerType: 'technical' | 'dependency' | 'resource' | 'decision' | 'external' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';

  // Resolution
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo?: string;
  assignedToName?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
  resolution?: string;

  // Tracking
  createdDate: Date;
  createdBy: string;
  daysBlocked: number;
  impactedTasks?: string[];
}

export interface StandupMeeting {
  meetingId: string;
  meetingDate: Date;
  meetingTime: string;

  // Attendance
  attendees: MeetingAttendee[];
  totalAttendees: number;
  attendanceRate: number; // %

  // Meeting Details
  meetingLink?: string;
  recordingUrl?: string;
  notesUrl?: string;
  duration: number; // actual minutes

  // Summary
  keyHighlights: string[];
  actionItems: ActionItem[];
  blockers: Blocker[];

  // Status
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completedDate?: Date;
}

export interface MeetingAttendee {
  userId: string;
  userName: string;
  attendanceStatus: 'present' | 'absent' | 'late';
  joinedTime?: Date;
  leftTime?: Date;
  hasResponded: boolean;
}

export interface ActionItem {
  actionId: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: Priority;
  completedDate?: Date;
  completedBy?: string;
}

export interface StandupTrend {
  date: Date;
  totalResponses: number;
  onTimeResponses: number;
  lateResponses: number;
  missedResponses: number;
  averageResponseTime: number;
  totalBlockers: number;
  resolvedBlockers: number;
}

// ============================================================================
// Collaboration Analytics
// ============================================================================

export interface CollaborationAnalytics {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  periodStart: Date;
  periodEnd: Date;

  // Whiteboard Analytics
  whiteboardMetrics: {
    totalWhiteboards: number;
    activeWhiteboards: number;
    totalCollaborators: number;
    averageCollaboratorsPerBoard: number;
    totalEdits: number;
    totalComments: number;
    mostActiveBoards: {
      whiteboardId: string;
      title: string;
      editCount: number;
      collaborators: number;
    }[];
  };

  // Kanban Analytics
  kanbanMetrics: {
    totalBoards: number;
    totalCards: number;
    completedCards: number;
    averageCompletionTime: number; // days
    throughput: number; // cards per week
    wipCards: number;
    blockedCards: number;
    mostActiveBoards: {
      boardId: string;
      boardName: string;
      cardCount: number;
      completionRate: number;
    }[];
  };

  // Standup Analytics
  standupMetrics: {
    totalStandups: number;
    activeStandups: number;
    totalResponses: number;
    averageParticipationRate: number;
    onTimeRate: number;
    totalBlockers: number;
    resolvedBlockers: number;
    averageBlockerResolutionTime: number; // hours
  };

  // Team Collaboration
  teamMetrics: {
    totalTeams: number;
    averageTeamSize: number;
    mostActiveTeams: {
      teamId: string;
      teamName: string;
      activityScore: number;
    }[];
  };
}

// ============================================================================
// Collaboration Settings
// ============================================================================

export interface CollaborationSettings {
  settingsId: string;

  // Whiteboard Settings
  whiteboardSettings: {
    enabled: boolean;
    defaultVisibility: 'private' | 'team' | 'organization';
    maxCollaborators: number;
    enableVersioning: boolean;
    enableComments: boolean;
    autoSaveInterval: number; // seconds
    enableRealtimeCollaboration: boolean;
  };

  // Kanban Settings
  kanbanSettings: {
    enabled: boolean;
    defaultVisibility: 'private' | 'team' | 'organization';
    enableTimeTracking: boolean;
    enableSubtasks: boolean;
    enableChecklists: boolean;
    enableAttachments: boolean;
    cardNumberingFormat: 'sequential' | 'board_prefix' | 'custom';
    defaultWipLimit?: number;
  };

  // Standup Settings
  standupSettings: {
    enabled: boolean;
    defaultType: 'sync' | 'async';
    defaultDuration: number; // minutes
    defaultQuestions: StandupQuestion[];
    enableReminders: boolean;
    defaultReminderTime: number; // minutes before
    allowAnonymousResponses: boolean;
    autoArchiveAfter: number; // days
  };

  // Notification Settings
  notificationSettings: {
    notifyOnComment: boolean;
    notifyOnMention: boolean;
    notifyOnAssignment: boolean;
    notifyOnDueDate: boolean;
    notifyOnBlocker: boolean;
    notifyOnStandupReminder: boolean;
    digestFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  };

  audit: AuditInfo;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
