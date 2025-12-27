/**
 * Analytics & Intelligence Service
 * Handles custom reports, dashboards, predictive analytics, and AI agents
 */

import { prisma } from '@aura/database';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createReportSchema = z.object({
  tenantId: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['HR', 'PAYROLL', 'LEAVE', 'ATTENDANCE', 'COMPLIANCE', 'RECRUITMENT', 'PERFORMANCE']),
  dataSource: z.string(),
  columns: z.any(), // JSON array of column definitions
  filters: z.any().optional(),
  chartType: z.enum(['BAR', 'LINE', 'PIE', 'TABLE', 'DONUT', 'AREA']).optional(),
  isScheduled: z.boolean().optional(),
  scheduleConfig: z.any().optional(),
  createdBy: z.string(),
});

const createDashboardWidgetSchema = z.object({
  tenantId: z.string(),
  dashboardId: z.string(),
  widgetType: z.enum(['CHART', 'TABLE', 'KPI', 'LIST', 'CALENDAR', 'GAUGE']),
  title: z.string(),
  reportId: z.string().optional(),
  dataConfig: z.any(),
  displayConfig: z.any().optional(),
  position: z.number(),
  size: z.string().optional(),
  refreshInterval: z.number().optional(),
  createdBy: z.string(),
});

const createPredictiveModelSchema = z.object({
  tenantId: z.string(),
  modelType: z.enum(['ATTRITION', 'HIRING_DEMAND', 'PERFORMANCE', 'SALARY', 'ENGAGEMENT']),
  name: z.string(),
  description: z.string().optional(),
  algorithm: z.string(),
  features: z.any(), // Array of feature names
  targetVariable: z.string(),
  trainingDataQuery: z.string(),
  hyperparameters: z.any().optional(),
  createdBy: z.string(),
});

const createAIConversationSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  agentType: z.enum(['HR_ASSISTANT', 'LEAVE_ADVISOR', 'PAYROLL_HELPER', 'POLICY_GUIDE', 'ANALYTICS_ANALYST']),
  title: z.string().optional(),
  context: z.any().optional(),
});

const createAIMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string(),
  metadata: z.any().optional(),
  tokenCount: z.number().optional(),
});

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService {
  // --------------------------------------------------------------------------
  // Custom Reports
  // --------------------------------------------------------------------------

  static async findAllReports(filter: any = {}) {
    const { tenantId, category, isActive, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [total, data] = await Promise.all([
      prisma.reportDefinition.count({ where }),
      prisma.reportDefinition.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findReportById(id: string, tenantId: string) {
    return prisma.reportDefinition.findFirst({
      where: { id, tenantId },
      include: { executions: { take: 10, orderBy: { executedAt: 'desc' } } },
    });
  }

  static async createReport(data: z.infer<typeof createReportSchema>) {
    const validated = createReportSchema.parse(data);
    return prisma.reportDefinition.create({ data: validated });
  }

  static async updateReport(id: string, tenantId: string, data: any) {
    return prisma.reportDefinition.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  static async deleteReport(id: string, tenantId: string) {
    // Check if report is being used in dashboards
    const widgetsUsing = await prisma.dashboardWidget.count({
      where: { reportId: id, tenantId },
    });

    if (widgetsUsing > 0) {
      throw new Error(`Cannot delete report: ${widgetsUsing} dashboard widgets are using it`);
    }

    return prisma.reportDefinition.delete({ where: { id } });
  }

  static async executeReport(
    id: string,
    tenantId: string,
    executedBy: string,
    parameters?: any
  ) {
    const report = await prisma.reportDefinition.findFirst({
      where: { id, tenantId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const startTime = new Date();

    // In production, this would execute the actual query
    // For now, we'll simulate with empty results
    const results: any[] = [];
    const rowCount = 0;

    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();

    // Create execution record
    const execution = await prisma.reportExecution.create({
      data: {
        reportId: id,
        tenantId,
        executedBy,
        executedAt: startTime,
        parameters: parameters || {},
        status: 'COMPLETED',
        rowCount,
        executionTime,
        results,
      },
    });

    return { execution, results };
  }

  static async getReportExecutions(filter: any = {}) {
    const { reportId, tenantId, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (reportId) where.reportId = reportId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.reportExecution.count({ where }),
      prisma.reportExecution.findMany({
        where,
        include: { report: true },
        orderBy: { executedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async exportReport(executionId: string, format: 'CSV' | 'EXCEL' | 'PDF') {
    const execution = await prisma.reportExecution.findUnique({
      where: { id: executionId },
      include: { report: true },
    });

    if (!execution) {
      throw new Error('Report execution not found');
    }

    // In production, this would generate actual file
    return {
      filename: `${execution.report.code}_${new Date().toISOString()}.${format.toLowerCase()}`,
      url: `/exports/${executionId}.${format.toLowerCase()}`,
      format,
    };
  }

  // --------------------------------------------------------------------------
  // Dashboards & Widgets
  // --------------------------------------------------------------------------

  static async findAllWidgets(filter: any = {}) {
    const { tenantId, dashboardId, isActive, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (dashboardId) where.dashboardId = dashboardId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [total, data] = await Promise.all([
      prisma.dashboardWidget.count({ where }),
      prisma.dashboardWidget.findMany({
        where,
        include: { report: true },
        orderBy: { position: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findWidgetById(id: string, tenantId: string) {
    return prisma.dashboardWidget.findFirst({
      where: { id, tenantId },
      include: { report: true },
    });
  }

  static async createWidget(data: z.infer<typeof createDashboardWidgetSchema>) {
    const validated = createDashboardWidgetSchema.parse(data);
    return prisma.dashboardWidget.create({ data: validated });
  }

  static async updateWidget(id: string, tenantId: string, data: any) {
    return prisma.dashboardWidget.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  static async deleteWidget(id: string, tenantId: string) {
    return prisma.dashboardWidget.delete({ where: { id } });
  }

  static async reorderWidgets(dashboardId: string, tenantId: string, widgetIds: string[]) {
    // Update positions in a transaction
    const updates = widgetIds.map((widgetId, index) =>
      prisma.dashboardWidget.update({
        where: { id: widgetId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
    return { success: true, message: 'Widgets reordered successfully' };
  }

  static async refreshWidget(id: string, tenantId: string) {
    const widget = await prisma.dashboardWidget.findFirst({
      where: { id, tenantId },
      include: { report: true },
    });

    if (!widget) {
      throw new Error('Widget not found');
    }

    if (!widget.reportId) {
      throw new Error('Widget has no associated report');
    }

    // Execute the report and return fresh data
    const { results } = await this.executeReport(
      widget.reportId,
      tenantId,
      'SYSTEM',
      {}
    );

    return { widget, data: results };
  }

  // --------------------------------------------------------------------------
  // Predictive Analytics
  // --------------------------------------------------------------------------

  static async findAllModels(filter: any = {}) {
    const { tenantId, modelType, status, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (modelType) where.modelType = modelType;
    if (status) where.status = status;

    const [total, data] = await Promise.all([
      prisma.predictiveModel.count({ where }),
      prisma.predictiveModel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findModelById(id: string, tenantId: string) {
    return prisma.predictiveModel.findFirst({
      where: { id, tenantId },
      include: { predictions: { take: 10, orderBy: { predictedAt: 'desc' } } },
    });
  }

  static async createModel(data: z.infer<typeof createPredictiveModelSchema>) {
    const validated = createPredictiveModelSchema.parse(data);
    return prisma.predictiveModel.create({
      data: {
        ...validated,
        status: 'DRAFT',
        version: 1,
      },
    });
  }

  static async trainModel(id: string, tenantId: string, trainedBy: string) {
    const model = await prisma.predictiveModel.findFirst({
      where: { id, tenantId },
    });

    if (!model) {
      throw new Error('Model not found');
    }

    const startTime = new Date();

    // In production, this would execute actual ML training
    // Simulate training metrics
    const trainingMetrics = {
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.88,
      f1Score: 0.85,
      sampleSize: 1000,
    };

    const endTime = new Date();
    const trainingTime = endTime.getTime() - startTime.getTime();

    // Update model
    return prisma.predictiveModel.update({
      where: { id },
      data: {
        status: 'TRAINED',
        lastTrainedAt: startTime,
        lastTrainedBy: trainedBy,
        trainingMetrics,
        trainingTime,
        isActive: true,
      },
    });
  }

  static async makePrediction(
    modelId: string,
    tenantId: string,
    inputData: any,
    entityId?: string
  ) {
    const model = await prisma.predictiveModel.findFirst({
      where: { id: modelId, tenantId, status: 'TRAINED', isActive: true },
    });

    if (!model) {
      throw new Error('Model not found or not trained');
    }

    // In production, this would use the trained model to predict
    // Simulate prediction
    const predictionValue = Math.random() * 100;
    const confidence = 0.75 + Math.random() * 0.2;

    const prediction = await prisma.prediction.create({
      data: {
        modelId,
        tenantId,
        entityId,
        inputData,
        predictionValue,
        confidence,
        predictedAt: new Date(),
        modelVersion: model.version,
      },
    });

    return prediction;
  }

  static async findAllPredictions(filter: any = {}) {
    const { tenantId, modelId, entityId, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (modelId) where.modelId = modelId;
    if (entityId) where.entityId = entityId;

    const [total, data] = await Promise.all([
      prisma.prediction.count({ where }),
      prisma.prediction.findMany({
        where,
        include: { model: true },
        orderBy: { predictedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async provideFeedback(
    predictionId: string,
    tenantId: string,
    actualValue: any,
    feedback: string
  ) {
    return prisma.prediction.update({
      where: { id: predictionId },
      data: {
        actualValue,
        feedback,
        feedbackAt: new Date(),
      },
    });
  }

  // --------------------------------------------------------------------------
  // AI Agents
  // --------------------------------------------------------------------------

  static async findAllConversations(filter: any = {}) {
    const { tenantId, userId, agentType, isActive, page = 1, limit = 50 } = filter;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (agentType) where.agentType = agentType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [total, data] = await Promise.all([
      prisma.aIAgentConversation.count({ where }),
      prisma.aIAgentConversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async findConversationById(id: string, tenantId: string) {
    return prisma.aIAgentConversation.findFirst({
      where: { id, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  static async createConversation(data: z.infer<typeof createAIConversationSchema>) {
    const validated = createAIConversationSchema.parse(data);
    return prisma.aIAgentConversation.create({
      data: {
        ...validated,
        title: validated.title || `New ${validated.agentType} conversation`,
        messageCount: 0,
      },
    });
  }

  static async addMessage(data: z.infer<typeof createAIMessageSchema>) {
    const validated = createAIMessageSchema.parse(data);

    // Create message
    const message = await prisma.aIAgentMessage.create({
      data: validated,
    });

    // Update conversation
    await prisma.aIAgentConversation.update({
      where: { id: validated.conversationId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
        totalTokens: { increment: validated.tokenCount || 0 },
      },
    });

    return message;
  }

  static async getMessages(conversationId: string, tenantId: string) {
    const conversation = await prisma.aIAgentConversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return prisma.aIAgentMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async deleteConversation(id: string, tenantId: string) {
    // Delete messages first
    await prisma.aIAgentMessage.deleteMany({
      where: { conversationId: id },
    });

    // Delete conversation
    return prisma.aIAgentConversation.delete({ where: { id } });
  }

  static async archiveConversation(id: string, tenantId: string) {
    return prisma.aIAgentConversation.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --------------------------------------------------------------------------
  // Analytics Cache
  // --------------------------------------------------------------------------

  static async getCachedData(cacheKey: string, tenantId: string) {
    const cache = await prisma.analyticsCache.findFirst({
      where: {
        cacheKey,
        tenantId,
        expiresAt: { gt: new Date() },
      },
    });

    if (cache) {
      // Update hit count
      await prisma.analyticsCache.update({
        where: { id: cache.id },
        data: {
          hitCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });

      return cache.data;
    }

    return null;
  }

  static async setCachedData(
    cacheKey: string,
    tenantId: string,
    data: any,
    ttlMinutes: number = 60,
    category?: string
  ) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    // Upsert cache entry
    return prisma.analyticsCache.upsert({
      where: {
        tenantId_cacheKey: { tenantId, cacheKey },
      },
      create: {
        tenantId,
        cacheKey,
        data,
        category,
        expiresAt,
        hitCount: 0,
      },
      update: {
        data,
        expiresAt,
        updatedAt: new Date(),
        hitCount: 0,
      },
    });
  }

  static async invalidateCache(cacheKey: string, tenantId: string) {
    return prisma.analyticsCache.deleteMany({
      where: { cacheKey, tenantId },
    });
  }

  static async cleanExpiredCache() {
    return prisma.analyticsCache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  // --------------------------------------------------------------------------
  // Analytics Statistics
  // --------------------------------------------------------------------------

  static async getAnalyticsStatistics(tenantId: string) {
    const [
      totalReports,
      activeReports,
      totalExecutions,
      totalWidgets,
      activeModels,
      totalPredictions,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      prisma.reportDefinition.count({ where: { tenantId } }),
      prisma.reportDefinition.count({ where: { tenantId, isActive: true } }),
      prisma.reportExecution.count({ where: { tenantId } }),
      prisma.dashboardWidget.count({ where: { tenantId } }),
      prisma.predictiveModel.count({ where: { tenantId, status: 'TRAINED', isActive: true } }),
      prisma.prediction.count({ where: { tenantId } }),
      prisma.aIAgentConversation.count({ where: { tenantId } }),
      prisma.aIAgentMessage.count({
        where: {
          conversation: { tenantId },
        },
      }),
    ]);

    return {
      reports: { total: totalReports, active: activeReports },
      executions: totalExecutions,
      widgets: totalWidgets,
      models: activeModels,
      predictions: totalPredictions,
      conversations: totalConversations,
      messages: totalMessages,
    };
  }
}
