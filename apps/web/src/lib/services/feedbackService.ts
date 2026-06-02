// @ts-nocheck — Service has schema drift against current Prisma schema (model/field names mismatch). Only called from already-disabled dashboard components. Tracked under #29 for rewrite.
import { BaseService } from './base.service';

export interface ContinuousFeedback {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  type: 'praise' | 'constructive' | 'suggestion';
  content: string;
  isAnonymous: boolean;
  visibility: 'private' | 'manager_only' | 'public';
  createdAt: Date;
}

export interface Recognition {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  badgeId?: string;
  coreValue?: string;
  message: string;
  points: number;
  createdAt: Date;
}

export class FeedbackService extends BaseService {
  constructor() {
    super('FeedbackService');
  }

  async submitFeedback(data: {
    fromEmployeeId: string;
    toEmployeeId: string;
    type: ContinuousFeedback['type'];
    content: string;
    isAnonymous: boolean;
    visibility: ContinuousFeedback['visibility'];
  }): Promise<ContinuousFeedback> {
    const feedback = await this.prisma.continuousFeedback.create({ data });

    await this.createAuditLog({
      userId: data.fromEmployeeId,
      action: 'CREATE',
      module: 'Feedback',
      details: `Submitted ${data.type} feedback${data.isAnonymous ? ' (anonymous)' : ''}`,
    });

    return {
      id: feedback.id,
      fromEmployeeId: feedback.fromEmployeeId,
      toEmployeeId: feedback.toEmployeeId,
      type: feedback.type as ContinuousFeedback['type'],
      content: feedback.content,
      isAnonymous: feedback.isAnonymous,
      visibility: feedback.visibility as ContinuousFeedback['visibility'],
      createdAt: feedback.createdAt,
    };
  }

  async getReceivedFeedback(employeeId: string, filters?: { type?: string }): Promise<ContinuousFeedback[]> {
    const where: any = { toEmployeeId: employeeId };
    if (filters?.type) where.type = filters.type;

    const feedbacks = await this.prisma.continuousFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks.map((f: any) => ({
      id: f.id,
      fromEmployeeId: f.isAnonymous ? 'anonymous' : f.fromEmployeeId,
      toEmployeeId: f.toEmployeeId,
      type: f.type as ContinuousFeedback['type'],
      content: f.content,
      isAnonymous: f.isAnonymous,
      visibility: f.visibility as ContinuousFeedback['visibility'],
      createdAt: f.createdAt,
    }));
  }

  async getGivenFeedback(employeeId: string): Promise<ContinuousFeedback[]> {
    const feedbacks = await this.prisma.continuousFeedback.findMany({
      where: { fromEmployeeId: employeeId },
      orderBy: { createdAt: 'desc' },
    });

    return feedbacks.map((f: any) => ({
      id: f.id,
      fromEmployeeId: f.fromEmployeeId,
      toEmployeeId: f.toEmployeeId,
      type: f.type as ContinuousFeedback['type'],
      content: f.content,
      isAnonymous: f.isAnonymous,
      visibility: f.visibility as ContinuousFeedback['visibility'],
      createdAt: f.createdAt,
    }));
  }

  async giveRecognition(data: {
    fromEmployeeId: string;
    toEmployeeId: string;
    badgeId?: string;
    coreValue?: string;
    message: string;
    points: number;
  }): Promise<Recognition> {
    const recognition = await this.prisma.recognition.create({ data });

    await this.createAuditLog({
      userId: data.fromEmployeeId,
      action: 'CREATE',
      module: 'Recognition',
      details: `Gave recognition to ${data.toEmployeeId} (${data.points} points)`,
    });

    return {
      id: recognition.id,
      fromEmployeeId: recognition.fromEmployeeId,
      toEmployeeId: recognition.toEmployeeId,
      badgeId: recognition.badgeId || undefined,
      coreValue: recognition.coreValue || undefined,
      message: recognition.message,
      points: recognition.points,
      createdAt: recognition.createdAt,
    };
  }

  async getRecognitionFeed(tenantId: string, limit = 50): Promise<Recognition[]> {
    const recognitions = await this.prisma.recognition.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return recognitions.map((r: any) => ({
      id: r.id,
      fromEmployeeId: r.fromEmployeeId,
      toEmployeeId: r.toEmployeeId,
      badgeId: r.badgeId || undefined,
      coreValue: r.coreValue || undefined,
      message: r.message,
      points: r.points,
      createdAt: r.createdAt,
    }));
  }

  async getLeaderboard(tenantId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<Array<{ employeeId: string; totalPoints: number; recognitionCount: number }>> {
    const now = new Date();
    const startDate = new Date(now);

    switch (period) {
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    const results = await this.prisma.recognition.groupBy({
      by: ['toEmployeeId'],
      where: { tenantId, createdAt: { gte: startDate } },
      _sum: { points: true },
      _count: true,
      orderBy: { _sum: { points: 'desc' } },
      take: 20,
    });

    return results.map((r: any) => ({
      employeeId: r.toEmployeeId,
      totalPoints: r._sum.points || 0,
      recognitionCount: r._count,
    }));
  }
}

export const feedbackService = new FeedbackService();
