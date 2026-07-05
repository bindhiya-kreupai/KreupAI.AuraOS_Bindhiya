/**
 * Chatbot Builder Module - Service Layer
 *
 * API-integrated service layer using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
  DialogueFlow,
  FlowTest,
  Entity,
  Intent,
  IntentMatch,
  TrainingDataset,
  TrainingExample,
  ModelTraining,
  Channel,
  MessageTemplate,
  ConversationAnalytics,
  UserFeedback,
  ConversationSession,
  HandoffRule,
  HandoffRequest,
  Agent,
  Language,
  Translation,
  LanguageContent,
  LanguageDetection,
  LocalizationSettings,
  ChatbotSettings,
} from './types';
import { ChannelMessage, HandoffQueue } from './types';

// ---------------------------------------------------------------------------
// Mapping helpers: Prisma returns { id, createdAt, updatedAt } but the
// frontend types expect { flowId, createdDate, lastModifiedDate } etc.
// ---------------------------------------------------------------------------
function mapFields<T>(obj: any, idKey: string, extra?: Record<string, string>): T {
  if (!obj) return obj;
  const { id, createdAt, updatedAt, deletedAt, isDeleted, ...rest } = obj;
  const result: any = { ...rest, [idKey]: id };
  if (createdAt) result.createdDate = createdAt;
  if (updatedAt) result.lastModifiedDate = updatedAt;
  if (extra) {
    for (const [from, to] of Object.entries(extra)) {
      if (from in result) {
        result[to] = result[from];
        delete result[from];
      }
    }
  }
  return result as T;
}

function mapList<T>(arr: any[], idKey: string, extra?: Record<string, string>): T[] {
  if (!arr) return [];
  return arr.map((item) => mapFields<T>(item, idKey, extra));
}

// ============================================================================
// DIALOGUE DESIGNER SERVICES
// ============================================================================

export class DialogueFlowService {
  private static endpoint = '/chatbot/dialogue-flows';

  static async getAllFlows(filters?: {
    category?: string;
    status?: string;
  }): Promise<DialogueFlow[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<DialogueFlow>(APIClient.unwrapList(res), 'flowId');
    } catch (error: any) {
      throw error;
    }
  }

  static async getFlowById(flowId: string): Promise<DialogueFlow | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${flowId}`);
      return mapFields<DialogueFlow>(APIClient.unwrapItem(res), 'flowId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createFlow(flowData: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      const res = await APIClient.post(this.endpoint, flowData);
      return mapFields<DialogueFlow>(APIClient.unwrapItem(res), 'flowId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateFlow(flowId: string, updates: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${flowId}`, updates);
      return mapFields<DialogueFlow>(APIClient.unwrapItem(res), 'flowId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async publishFlow(flowId: string): Promise<DialogueFlow> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${flowId}`, {
        status: 'published',
        publishedAt: new Date().toISOString(),
      });
      return mapFields<DialogueFlow>(APIClient.unwrapItem(res), 'flowId', {
        publishedAt: 'publishedDate',
      })!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteFlow(flowId: string): Promise<void> {
    try {
      return await APIClient.delete(`${this.endpoint}/${flowId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class FlowTestService {
  private static endpoint = '/chatbot/flow-tests';

  static async getAllTests(filters?: { flowId?: string; status?: string }): Promise<FlowTest[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<FlowTest>(APIClient.unwrapList(res), 'testId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createTest(testData: Partial<FlowTest>): Promise<FlowTest> {
    try {
      const res = await APIClient.post(this.endpoint, testData);
      return mapFields<FlowTest>(APIClient.unwrapItem(res), 'testId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async runTest(testId: string): Promise<FlowTest> {
    try {
      const res = await APIClient.post(`${this.endpoint}/${testId}/run`, {});
      return mapFields<FlowTest>(APIClient.unwrapItem(res), 'testId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// ENTITY MANAGEMENT SERVICES
// ============================================================================

export class EntityService {
  private static endpoint = '/chatbot/entities';

  static async getAllEntities(filters?: {
    entityType?: string;
    status?: string;
  }): Promise<Entity[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Entity>(APIClient.unwrapList(res), 'entityId');
    } catch (error: any) {
      throw error;
    }
  }

  static async getEntityById(entityId: string): Promise<Entity | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${entityId}`);
      return mapFields<Entity>(APIClient.unwrapItem(res), 'entityId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createEntity(entityData: Partial<Entity>): Promise<Entity> {
    try {
      const res = await APIClient.post(this.endpoint, entityData);
      return mapFields<Entity>(APIClient.unwrapItem(res), 'entityId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>): Promise<Entity> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${entityId}`, updates);
      return mapFields<Entity>(APIClient.unwrapItem(res), 'entityId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteEntity(entityId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${entityId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// INTENT LIBRARY SERVICES
// ============================================================================

export class IntentService {
  private static endpoint = '/chatbot/intents';

  static async getAllIntents(filters?: { category?: string; status?: string }): Promise<Intent[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Intent>(APIClient.unwrapList(res), 'intentId');
    } catch (error: any) {
      throw error;
    }
  }

  static async getIntentById(intentId: string): Promise<Intent | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${intentId}`);
      return mapFields<Intent>(APIClient.unwrapItem(res), 'intentId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createIntent(intentData: Partial<Intent>): Promise<Intent> {
    try {
      const res = await APIClient.post(this.endpoint, intentData);
      return mapFields<Intent>(APIClient.unwrapItem(res), 'intentId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateIntent(intentId: string, updates: Partial<Intent>): Promise<Intent> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${intentId}`, updates);
      return mapFields<Intent>(APIClient.unwrapItem(res), 'intentId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteIntent(intentId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${intentId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class IntentMatchService {
  private static endpoint = '/chatbot/intent-matches';

  static async getAllMatches(filters?: {
    sessionId?: string;
    intentId?: string;
  }): Promise<IntentMatch[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<IntentMatch>(APIClient.unwrapList(res), 'matchId');
    } catch (error: any) {
      throw error;
    }
  }

  static async logMatch(matchData: Partial<IntentMatch>): Promise<IntentMatch> {
    try {
      const res = await APIClient.post(this.endpoint, matchData);
      return mapFields<IntentMatch>(APIClient.unwrapItem(res), 'matchId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// TRAINING DATA SERVICES
// ============================================================================

export class TrainingDatasetService {
  private static endpoint = '/chatbot/training-datasets';

  static async getAllDatasets(filters?: {
    language?: string;
    status?: string;
  }): Promise<TrainingDataset[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<TrainingDataset>(APIClient.unwrapList(res), 'datasetId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createDataset(datasetData: Partial<TrainingDataset>): Promise<TrainingDataset> {
    try {
      const res = await APIClient.post(this.endpoint, datasetData);
      return mapFields<TrainingDataset>(APIClient.unwrapItem(res), 'datasetId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateDataset(
    datasetId: string,
    updates: Partial<TrainingDataset>
  ): Promise<TrainingDataset> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${datasetId}`, updates);
      return mapFields<TrainingDataset>(APIClient.unwrapItem(res), 'datasetId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteDataset(datasetId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${datasetId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class TrainingExampleService {
  private static endpoint = '/chatbot/training-examples';

  static async getAllExamples(filters?: {
    datasetId?: string;
    intent?: string;
  }): Promise<TrainingExample[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<TrainingExample>(APIClient.unwrapList(res), 'exampleId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createExample(exampleData: Partial<TrainingExample>): Promise<TrainingExample> {
    try {
      const res = await APIClient.post(this.endpoint, exampleData);
      return mapFields<TrainingExample>(APIClient.unwrapItem(res), 'exampleId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateExample(
    exampleId: string,
    updates: Partial<TrainingExample>
  ): Promise<TrainingExample> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${exampleId}`, updates);
      return mapFields<TrainingExample>(APIClient.unwrapItem(res), 'exampleId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteExample(exampleId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${exampleId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class ModelTrainingService {
  private static endpoint = '/chatbot/model-trainings';

  static async getAllTrainings(filters?: {
    datasetId?: string;
    status?: string;
  }): Promise<ModelTraining[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<ModelTraining>(APIClient.unwrapList(res), 'trainingId');
    } catch (error: any) {
      throw error;
    }
  }

  static async startTraining(trainingData: Partial<ModelTraining>): Promise<ModelTraining> {
    try {
      const res = await APIClient.post(this.endpoint, trainingData);
      return mapFields<ModelTraining>(APIClient.unwrapItem(res), 'trainingId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async getTrainingStatus(trainingId: string): Promise<ModelTraining | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${trainingId}`);
      return mapFields<ModelTraining>(APIClient.unwrapItem(res), 'trainingId');
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// MULTI-CHANNEL SERVICES
// ============================================================================

export class ChannelService {
  private static endpoint = '/chatbot/channels';

  static async getAllChannels(filters?: {
    channelType?: string;
    status?: string;
  }): Promise<Channel[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Channel>(APIClient.unwrapList(res), 'channelId', {
        lastSyncAt: 'lastSyncDate',
      });
    } catch (error: any) {
      throw error;
    }
  }

  static async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    try {
      const res = await APIClient.post(this.endpoint, channelData);
      return mapFields<Channel>(APIClient.unwrapItem(res), 'channelId', {
        lastSyncAt: 'lastSyncDate',
      })!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${channelId}`, updates);
      return mapFields<Channel>(APIClient.unwrapItem(res), 'channelId', {
        lastSyncAt: 'lastSyncDate',
      })!;
    } catch (error: any) {
      throw error;
    }
  }

  static async testChannel(channelId: string): Promise<boolean> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${channelId}`, { action: 'test' });
      const data = mapFields<{ success: boolean }>(APIClient.unwrapItem(res), 'channelId');
      return data?.success ?? true;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteChannel(channelId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${channelId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class MessageTemplateService {
  private static endpoint = '/chatbot/message-templates';

  static async getAllTemplates(filters?: {
    channels?: string[];
    status?: string;
  }): Promise<MessageTemplate[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<MessageTemplate>(APIClient.unwrapList(res), 'templateId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createTemplate(templateData: Partial<MessageTemplate>): Promise<MessageTemplate> {
    try {
      const res = await APIClient.post(this.endpoint, templateData);
      return mapFields<MessageTemplate>(APIClient.unwrapItem(res), 'templateId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export class AnalyticsService {
  private static endpoint = '/chatbot/analytics';

  static async getAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ConversationAnalytics> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapFields<ConversationAnalytics>(APIClient.unwrapItem(res), 'analyticsId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

export class UserFeedbackService {
  private static endpoint = '/chatbot/user-feedback';

  static async getAllFeedback(filters?: {
    sessionId?: string;
    status?: string;
  }): Promise<UserFeedback[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<UserFeedback>(APIClient.unwrapList(res), 'feedbackId');
    } catch (error: any) {
      throw error;
    }
  }

  static async submitFeedback(feedbackData: Partial<UserFeedback>): Promise<UserFeedback> {
    try {
      const res = await APIClient.post(this.endpoint, feedbackData);
      return mapFields<UserFeedback>(APIClient.unwrapItem(res), 'feedbackId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

export class ConversationSessionService {
  private static endpoint = '/chatbot/conversation-sessions';

  static async getAllSessions(filters?: {
    userId?: string;
    status?: string;
  }): Promise<ConversationSession[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<ConversationSession>(APIClient.unwrapList(res), 'sessionId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createSession(
    sessionData: Partial<ConversationSession>
  ): Promise<ConversationSession> {
    try {
      const res = await APIClient.post(this.endpoint, sessionData);
      return mapFields<ConversationSession>(APIClient.unwrapItem(res), 'sessionId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSession(
    sessionId: string,
    updates: Partial<ConversationSession>
  ): Promise<ConversationSession> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${sessionId}`, updates);
      return mapFields<ConversationSession>(APIClient.unwrapItem(res), 'sessionId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// HANDOFF SERVICES
// ============================================================================

export class HandoffRuleService {
  private static endpoint = '/chatbot/handoff-rules';

  static async getAllRules(filters?: {
    priority?: number;
    isActive?: boolean;
  }): Promise<HandoffRule[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<HandoffRule>(APIClient.unwrapList(res), 'ruleId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createRule(ruleData: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      const res = await APIClient.post(this.endpoint, ruleData);
      return mapFields<HandoffRule>(APIClient.unwrapItem(res), 'ruleId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateRule(ruleId: string, updates: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${ruleId}`, updates);
      return mapFields<HandoffRule>(APIClient.unwrapItem(res), 'ruleId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteRule(ruleId: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${ruleId}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class HandoffRequestService {
  private static endpoint = '/chatbot/handoff-requests';

  static async getAllRequests(filters?: {
    sessionId?: string;
    status?: string;
  }): Promise<HandoffRequest[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<HandoffRequest>(APIClient.unwrapList(res), 'requestId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createRequest(requestData: Partial<HandoffRequest>): Promise<HandoffRequest> {
    try {
      const res = await APIClient.post(this.endpoint, requestData);
      return mapFields<HandoffRequest>(APIClient.unwrapItem(res), 'requestId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateRequest(
    requestId: string,
    updates: Partial<HandoffRequest>
  ): Promise<HandoffRequest> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${requestId}`, updates);
      return mapFields<HandoffRequest>(APIClient.unwrapItem(res), 'requestId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

export class AgentService {
  private static endpoint = '/chatbot/agents';

  static async getAllAgents(filters?: { status?: string }): Promise<Agent[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Agent>(APIClient.unwrapList(res), 'agentId');
    } catch (error: any) {
      throw error;
    }
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    try {
      const res = await APIClient.get(`${this.endpoint}/available`);
      return mapList<Agent>(APIClient.unwrapList(res), 'agentId');
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// MULTI-LINGUAL SERVICES
// ============================================================================

export class LanguageService {
  private static endpoint = '/chatbot/languages';

  static async getAllLanguages(filters?: { isEnabled?: boolean }): Promise<Language[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Language>(APIClient.unwrapList(res), 'languageId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createLanguage(languageData: Partial<Language>): Promise<Language> {
    try {
      const res = await APIClient.post(this.endpoint, languageData);
      return mapFields<Language>(APIClient.unwrapItem(res), 'languageId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async enableLanguage(languageCode: string): Promise<Language> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${languageCode}`, { action: 'enable' });
      return mapFields<Language>(APIClient.unwrapItem(res), 'languageId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateLanguage(languageCode: string, updates: Partial<Language>): Promise<Language> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${languageCode}`, updates);
      return mapFields<Language>(APIClient.unwrapItem(res), 'languageId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async deleteLanguage(languageCode: string): Promise<void> {
    try {
      await APIClient.delete(`${this.endpoint}/${languageCode}`);
    } catch (error: any) {
      throw error;
    }
  }
}

export class TranslationService {
  private static endpoint = '/chatbot/translations';

  static async getAllTranslations(filters?: {
    sourceLanguage?: string;
    targetLanguage?: string;
  }): Promise<Translation[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<Translation>(APIClient.unwrapList(res), 'translationId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createTranslation(translationData: Partial<Translation>): Promise<Translation> {
    try {
      const res = await APIClient.post(this.endpoint, translationData);
      return mapFields<Translation>(APIClient.unwrapItem(res), 'translationId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async autoTranslate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      const res = await APIClient.post(`${this.endpoint}/auto-translate`, {
        text,
        sourceLanguage,
        targetLanguage,
      });
      const data = APIClient.unwrapItem<{ translatedText: string }>(res);
      return data?.translatedText ?? '';
    } catch (error: any) {
      throw error;
    }
  }
}

export class LanguageContentService {
  private static endpoint = '/chatbot/language-content';

  static async getAllContent(filters?: {
    contentType?: string;
    defaultLanguage?: string;
  }): Promise<LanguageContent[]> {
    try {
      const res = await APIClient.get(this.endpoint, filters);
      return mapList<LanguageContent>(APIClient.unwrapList(res), 'contentId');
    } catch (error: any) {
      throw error;
    }
  }

  static async createContent(contentData: Partial<LanguageContent>): Promise<LanguageContent> {
    try {
      const res = await APIClient.post(this.endpoint, contentData);
      return mapFields<LanguageContent>(APIClient.unwrapItem(res), 'contentId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

export class LanguageDetectionService {
  private static endpoint = '/chatbot/language-detection';

  static async detectLanguage(text: string): Promise<LanguageDetection> {
    try {
      const res = await APIClient.post(this.endpoint, { text });
      return mapFields<LanguageDetection>(APIClient.unwrapItem(res), 'detectionId')!;
    } catch (error: any) {
      throw error;
    }
  }
}

export class LocalizationSettingsService {
  private static endpoint = '/chatbot/localization-settings';

  static async getSettings(): Promise<LocalizationSettings> {
    try {
      const res = await APIClient.get(this.endpoint);
      return mapFields<LocalizationSettings>(APIClient.unwrapItem(res), 'settingsId', {
        lastUpdatedAt: 'lastUpdatedDate',
      })!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSettings(
    updates: Partial<LocalizationSettings>
  ): Promise<LocalizationSettings> {
    try {
      const res = await APIClient.put(this.endpoint, updates);
      return mapFields<LocalizationSettings>(APIClient.unwrapItem(res), 'settingsId', {
        lastUpdatedAt: 'lastUpdatedDate',
      })!;
    } catch (error: any) {
      throw error;
    }
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class ChatbotSettingsService {
  private static endpoint = '/chatbot/settings';

  static async getSettings(): Promise<ChatbotSettings> {
    try {
      const res = await APIClient.get(this.endpoint);
      return mapFields<ChatbotSettings>(APIClient.unwrapItem(res), 'settingsId')!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSettings(updates: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
    try {
      const res = await APIClient.put(this.endpoint, updates);
      return mapFields<ChatbotSettings>(APIClient.unwrapItem(res), 'settingsId')!;
    } catch (error: any) {
      throw error;
    }
  }
}
