/**
 * @module FeedbackService
 * @description Service layer for continuous feedback — praise, constructive,
 *              suggestion types with anonymous option
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────────────────────────────

export type FeedbackCategory = 'praise' | 'constructive' | 'suggestion';

export type FeedbackVisibility = 'public' | 'private' | 'anonymous';

export type FeedbackStatus = 'active' | 'archived' | 'flagged';

export interface FeedbackReaction {
  type: '👏' | '❤️' | '💡' | '🙏' | '🔥';
  count: number;
  hasReacted: boolean;
}

export interface FeedbackComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  visibility: FeedbackVisibility;
  status: FeedbackStatus;
  fromId: string;
  fromName: string;
  fromRole: string;
  fromDepartment: string;
  fromAvatar?: string;
  toId: string;
  toName: string;
  toRole: string;
  toDepartment: string;
  message: string;
  tags: string[];
  reactions: FeedbackReaction[];
  comments: FeedbackComment[];
  linkedGoalId?: string;
  linkedGoalTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFormData {
  category: FeedbackCategory;
  visibility: FeedbackVisibility;
  toId: string;
  toName: string;
  message: string;
  tags: string[];
  linkedGoalId?: string;
}

export interface FeedbackFilters {
  category?: FeedbackCategory | 'all';
  visibility?: FeedbackVisibility | 'all';
  direction?: 'received' | 'given' | 'all';
  search?: string;
  dateRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export interface FeedbackStats {
  totalGiven: number;
  totalReceived: number;
  praiseCount: number;
  constructiveCount: number;
  suggestionCount: number;
  anonymousCount: number;
  streak: number;
  topTags: { tag: string; count: number }[];
}

// ── Service ──────────────────────────────────────────────────────────────────────

export class FeedbackService {
  private static endpoint = '/performance/feedback';

  static async getFeedback(filters?: FeedbackFilters): Promise<FeedbackItem[]> {
    try {
      const response = await APIClient.get<{ feedback?: FeedbackItem[] }>(this.endpoint, filters);
      return response.feedback || [];
    } catch {
      return [];
    }
  }

  static async getFeedbackById(id: string): Promise<FeedbackItem | null> {
    try {
      const response = await APIClient.get<{ feedback: FeedbackItem }>(`${this.endpoint}/${id}`);
      return response.feedback;
    } catch {
      return null;
    }
  }

  static async createFeedback(data: FeedbackFormData): Promise<FeedbackItem> {
    const response = await APIClient.post<{ feedback: FeedbackItem }>(this.endpoint, data);
    return response.feedback;
  }

  static async updateFeedback(id: string, updates: Partial<FeedbackItem>): Promise<FeedbackItem> {
    const response = await APIClient.put<{ feedback: FeedbackItem }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.feedback;
  }

  static async deleteFeedback(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async addReaction(feedbackId: string, reactionType: string): Promise<FeedbackItem> {
    const response = await APIClient.post<{ feedback: FeedbackItem }>(
      `${this.endpoint}/${feedbackId}/reactions`,
      { type: reactionType }
    );
    return response.feedback;
  }

  static async addComment(feedbackId: string, body: string): Promise<FeedbackComment> {
    const response = await APIClient.post<{ comment: FeedbackComment }>(
      `${this.endpoint}/${feedbackId}/comments`,
      { body }
    );
    return response.comment;
  }

  static async getStats(employeeId?: string): Promise<FeedbackStats> {
    try {
      const response = await APIClient.get<{ stats: FeedbackStats }>(
        `${this.endpoint}/stats`,
        employeeId ? { employeeId } : undefined
      );
      return response.stats;
    } catch {
      return {
        totalGiven: 0,
        totalReceived: 0,
        praiseCount: 0,
        constructiveCount: 0,
        suggestionCount: 0,
        anonymousCount: 0,
        streak: 0,
        topTags: [],
      };
    }
  }

  static async archiveFeedback(id: string): Promise<FeedbackItem> {
    return this.updateFeedback(id, { status: 'archived' });
  }
}
