/**
 * Type definitions for One-on-One Meetings module
 */

export type MeetingType = 'Weekly Sync' | 'Career Dev' | 'Performance Review' | 'Feedback' | 'Check-in';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type ActionStatus = 'pending' | 'in-progress' | 'completed';
export type SentimentScore = 1 | 2 | 3 | 4 | 5;

export interface Employee {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
}

export interface TalkingPoint {
    id: string;
    text: string;
    isDiscussed: boolean;
    notes?: string;
}

export interface ActionItem {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: ActionStatus;
    priority: 'low' | 'medium' | 'high';
}

export interface FeedbackQuestion {
    id: string;
    question: string;
    category: 'engagement' | 'workload' | 'growth' | 'satisfaction' | 'concerns';
}

export interface FeedbackResponse {
    questionId: string;
    response: string;
    rating?: number;
}

export interface Meeting {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    managerId: string;
    managerName: string;
    scheduledDate: string;
    duration: number;
    type: MeetingType;
    status: MeetingStatus;
    talkingPoints: TalkingPoint[];
    actionItems: ActionItem[];
    notes: string;
    sentiment?: SentimentScore;
    feedbackResponses?: FeedbackResponse[];
    createdAt: string;
    completedAt?: string;
}

export interface MeetingStats {
    totalMeetings: number;
    completedMeetings: number;
    averageSentiment: number;
    pendingActionItems: number;
    employeesEngaged: number;
    trendsImproving: boolean;
}

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
