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
      return APIClient.unwrapList<DialogueFlow>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async getFlowById(flowId: string): Promise<DialogueFlow | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${flowId}`);
      return APIClient.unwrapItem<DialogueFlow>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createFlow(flowData: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      const res = await APIClient.post(this.endpoint, flowData);
      return APIClient.unwrapItem<DialogueFlow>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateFlow(flowId: string, updates: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${flowId}`, updates);
      return APIClient.unwrapItem<DialogueFlow>(res)!;
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
      return APIClient.unwrapItem<DialogueFlow>(res)!;
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
      return APIClient.unwrapList<FlowTest>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createTest(testData: Partial<FlowTest>): Promise<FlowTest> {
    try {
      const res = await APIClient.post(this.endpoint, testData);
      return APIClient.unwrapItem<FlowTest>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async runTest(testId: string): Promise<FlowTest> {
    try {
      const res = await APIClient.post(`${this.endpoint}/${testId}/run`, {});
      return APIClient.unwrapItem<FlowTest>(res)!;
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
      return APIClient.unwrapList<Entity>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async getEntityById(entityId: string): Promise<Entity | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${entityId}`);
      return APIClient.unwrapItem<Entity>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createEntity(entityData: Partial<Entity>): Promise<Entity> {
    try {
      const res = await APIClient.post(this.endpoint, entityData);
      return APIClient.unwrapItem<Entity>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>): Promise<Entity> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${entityId}`, updates);
      return APIClient.unwrapItem<Entity>(res)!;
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
      return APIClient.unwrapList<Intent>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async getIntentById(intentId: string): Promise<Intent | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${intentId}`);
      return APIClient.unwrapItem<Intent>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createIntent(intentData: Partial<Intent>): Promise<Intent> {
    try {
      const res = await APIClient.post(this.endpoint, intentData);
      return APIClient.unwrapItem<Intent>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateIntent(intentId: string, updates: Partial<Intent>): Promise<Intent> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${intentId}`, updates);
      return APIClient.unwrapItem<Intent>(res)!;
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
      return APIClient.unwrapList<IntentMatch>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async logMatch(matchData: Partial<IntentMatch>): Promise<IntentMatch> {
    try {
      const res = await APIClient.post(this.endpoint, matchData);
      return APIClient.unwrapItem<IntentMatch>(res)!;
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
      return APIClient.unwrapList<TrainingDataset>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createDataset(datasetData: Partial<TrainingDataset>): Promise<TrainingDataset> {
    try {
      const res = await APIClient.post(this.endpoint, datasetData);
      return APIClient.unwrapItem<TrainingDataset>(res)!;
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
      return APIClient.unwrapItem<TrainingDataset>(res)!;
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
      return APIClient.unwrapList<TrainingExample>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createExample(exampleData: Partial<TrainingExample>): Promise<TrainingExample> {
    try {
      const res = await APIClient.post(this.endpoint, exampleData);
      return APIClient.unwrapItem<TrainingExample>(res)!;
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
      return APIClient.unwrapItem<TrainingExample>(res)!;
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
      return APIClient.unwrapList<ModelTraining>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async startTraining(trainingData: Partial<ModelTraining>): Promise<ModelTraining> {
    try {
      const res = await APIClient.post(this.endpoint, trainingData);
      return APIClient.unwrapItem<ModelTraining>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async getTrainingStatus(trainingId: string): Promise<ModelTraining | null> {
    try {
      const res = await APIClient.get(`${this.endpoint}/${trainingId}`);
      return APIClient.unwrapItem<ModelTraining>(res);
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
      return APIClient.unwrapList<Channel>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    try {
      const res = await APIClient.post(this.endpoint, channelData);
      return APIClient.unwrapItem<Channel>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${channelId}`, updates);
      return APIClient.unwrapItem<Channel>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async testChannel(channelId: string): Promise<boolean> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${channelId}`, { action: 'test' });
      const data = APIClient.unwrapItem<{ success: boolean }>(res);
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
      return APIClient.unwrapList<MessageTemplate>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createTemplate(templateData: Partial<MessageTemplate>): Promise<MessageTemplate> {
    try {
      const res = await APIClient.post(this.endpoint, templateData);
      return APIClient.unwrapItem<MessageTemplate>(res)!;
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
      return APIClient.unwrapItem<ConversationAnalytics>(res)!;
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
      return APIClient.unwrapList<UserFeedback>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async submitFeedback(feedbackData: Partial<UserFeedback>): Promise<UserFeedback> {
    try {
      const res = await APIClient.post(this.endpoint, feedbackData);
      return APIClient.unwrapItem<UserFeedback>(res)!;
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
      return APIClient.unwrapList<ConversationSession>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createSession(
    sessionData: Partial<ConversationSession>
  ): Promise<ConversationSession> {
    try {
      const res = await APIClient.post(this.endpoint, sessionData);
      return APIClient.unwrapItem<ConversationSession>(res)!;
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
      return APIClient.unwrapItem<ConversationSession>(res)!;
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
      return APIClient.unwrapList<HandoffRule>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createRule(ruleData: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      const res = await APIClient.post(this.endpoint, ruleData);
      return APIClient.unwrapItem<HandoffRule>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateRule(ruleId: string, updates: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${ruleId}`, updates);
      return APIClient.unwrapItem<HandoffRule>(res)!;
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
      return APIClient.unwrapList<HandoffRequest>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createRequest(requestData: Partial<HandoffRequest>): Promise<HandoffRequest> {
    try {
      const res = await APIClient.post(this.endpoint, requestData);
      return APIClient.unwrapItem<HandoffRequest>(res)!;
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
      return APIClient.unwrapItem<HandoffRequest>(res)!;
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
      return APIClient.unwrapList<Agent>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    try {
      const res = await APIClient.get(`${this.endpoint}/available`);
      return APIClient.unwrapList<Agent>(res);
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
      return APIClient.unwrapList<Language>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async enableLanguage(languageCode: string): Promise<Language> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${languageCode}`, { action: 'enable' });
      return APIClient.unwrapItem<Language>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateLanguage(languageCode: string, updates: Partial<Language>): Promise<Language> {
    try {
      const res = await APIClient.put(`${this.endpoint}/${languageCode}`, updates);
      return APIClient.unwrapItem<Language>(res)!;
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
      return APIClient.unwrapList<Translation>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createTranslation(translationData: Partial<Translation>): Promise<Translation> {
    try {
      const res = await APIClient.post(this.endpoint, translationData);
      return APIClient.unwrapItem<Translation>(res)!;
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
      return APIClient.unwrapList<LanguageContent>(res);
    } catch (error: any) {
      throw error;
    }
  }

  static async createContent(contentData: Partial<LanguageContent>): Promise<LanguageContent> {
    try {
      const res = await APIClient.post(this.endpoint, contentData);
      return APIClient.unwrapItem<LanguageContent>(res)!;
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
      return APIClient.unwrapItem<LanguageDetection>(res)!;
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
      return APIClient.unwrapItem<LocalizationSettings>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSettings(
    updates: Partial<LocalizationSettings>
  ): Promise<LocalizationSettings> {
    try {
      const res = await APIClient.put(this.endpoint, updates);
      return APIClient.unwrapItem<LocalizationSettings>(res)!;
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
      return APIClient.unwrapItem<ChatbotSettings>(res)!;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateSettings(updates: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
    try {
      const res = await APIClient.put(this.endpoint, updates);
      return APIClient.unwrapItem<ChatbotSettings>(res)!;
    } catch (error: any) {
      throw error;
    }
  }
}
