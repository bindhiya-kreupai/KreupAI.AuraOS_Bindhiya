/**
 * Chatbot Builder Module - Service Layer
 *
 * API-integrated service layer using APIClient.
 */

import { APIClient } from '@/lib/api-client';
import type {
  DialogueFlow, FlowTest, Entity, Intent, IntentMatch, TrainingDataset, TrainingExample,
  ModelTraining, Channel, MessageTemplate, ConversationAnalytics,
  UserFeedback, ConversationSession, HandoffRule, HandoffRequest, Agent,
  Language, Translation, LanguageContent, LanguageDetection, LocalizationSettings,
  ChatbotSettings
} from './types';
import { ChannelMessage, HandoffQueue
} from './types';

// ============================================================================
// DIALOGUE DESIGNER SERVICES
// ============================================================================

export class DialogueFlowService {
  private static endpoint = '/chatbot/dialogue-flows';

  static async getAllFlows(filters?: { category?: string; status?: string }): Promise<DialogueFlow[]> {
    try {
      return await APIClient.get<DialogueFlow[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async getFlowById(flowId: string): Promise<DialogueFlow | null> {
    try {
      return await APIClient.get<DialogueFlow>(`${this.endpoint}/${flowId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createFlow(flowData: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      return await APIClient.post<DialogueFlow>(this.endpoint, flowData);
    } catch (error) {
            throw error;
    }
  }

  static async updateFlow(flowId: string, updates: Partial<DialogueFlow>): Promise<DialogueFlow> {
    try {
      return await APIClient.put<DialogueFlow>(`${this.endpoint}/${flowId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async publishFlow(flowId: string): Promise<DialogueFlow> {
    try {
      return await APIClient.post<DialogueFlow>(`${this.endpoint}/${flowId}/publish`, {});
    } catch (error) {
            throw error;
    }
  }

  static async deleteFlow(flowId: string): Promise<void> {
    try {
      return await APIClient.delete(`${this.endpoint}/${flowId}`);
    } catch (error) {
            throw error;
    }
  }
}

export class FlowTestService {
  private static endpoint = '/chatbot/flow-tests';

  static async getAllTests(filters?: { flowId?: string; status?: string }): Promise<FlowTest[]> {
    try {
      return await APIClient.get<FlowTest[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createTest(testData: Partial<FlowTest>): Promise<FlowTest> {
    try {
      return await APIClient.post<FlowTest>(this.endpoint, testData);
    } catch (error) {
            throw error;
    }
  }

  static async runTest(testId: string): Promise<FlowTest> {
    try {
      return await APIClient.post<FlowTest>(`${this.endpoint}/${testId}/run`, {});
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// ENTITY MANAGEMENT SERVICES
// ============================================================================

export class EntityService {
  private static endpoint = '/chatbot/entities';

  static async getAllEntities(filters?: { entityType?: string; status?: string }): Promise<Entity[]> {
    try {
      return await APIClient.get<Entity[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async getEntityById(entityId: string): Promise<Entity | null> {
    try {
      return await APIClient.get<Entity>(`${this.endpoint}/${entityId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createEntity(entityData: Partial<Entity>): Promise<Entity> {
    try {
      return await APIClient.post<Entity>(this.endpoint, entityData);
    } catch (error) {
            throw error;
    }
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>): Promise<Entity> {
    try {
      return await APIClient.put<Entity>(`${this.endpoint}/${entityId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteEntity(entityId: string): Promise<void> {
    try {
      return await APIClient.delete(`${this.endpoint}/${entityId}`);
    } catch (error) {
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
      return await APIClient.get<Intent[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async getIntentById(intentId: string): Promise<Intent | null> {
    try {
      return await APIClient.get<Intent>(`${this.endpoint}/${intentId}`);
    } catch (error) {
            throw error;
    }
  }

  static async createIntent(intentData: Partial<Intent>): Promise<Intent> {
    try {
      return await APIClient.post<Intent>(this.endpoint, intentData);
    } catch (error) {
            throw error;
    }
  }

  static async updateIntent(intentId: string, updates: Partial<Intent>): Promise<Intent> {
    try {
      return await APIClient.put<Intent>(`${this.endpoint}/${intentId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async deleteIntent(intentId: string): Promise<void> {
    try {
      return await APIClient.delete(`${this.endpoint}/${intentId}`);
    } catch (error) {
            throw error;
    }
  }
}

export class IntentMatchService {
  private static endpoint = '/chatbot/intent-matches';

  static async getAllMatches(filters?: { sessionId?: string; intentId?: string }): Promise<IntentMatch[]> {
    try {
      return await APIClient.get<IntentMatch[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async logMatch(matchData: Partial<IntentMatch>): Promise<IntentMatch> {
    try {
      return await APIClient.post<IntentMatch>(this.endpoint, matchData);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// TRAINING DATA SERVICES
// ============================================================================

export class TrainingDatasetService {
  private static endpoint = '/chatbot/training-datasets';

  static async getAllDatasets(filters?: { language?: string; status?: string }): Promise<TrainingDataset[]> {
    try {
      return await APIClient.get<TrainingDataset[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createDataset(datasetData: Partial<TrainingDataset>): Promise<TrainingDataset> {
    try {
      return await APIClient.post<TrainingDataset>(this.endpoint, datasetData);
    } catch (error) {
            throw error;
    }
  }
}

export class TrainingExampleService {
  private static endpoint = '/chatbot/training-examples';

  static async getAllExamples(filters?: { datasetId?: string; intent?: string }): Promise<TrainingExample[]> {
    try {
      return await APIClient.get<TrainingExample[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createExample(exampleData: Partial<TrainingExample>): Promise<TrainingExample> {
    try {
      return await APIClient.post<TrainingExample>(this.endpoint, exampleData);
    } catch (error) {
            throw error;
    }
  }

  static async updateExample(exampleId: string, updates: Partial<TrainingExample>): Promise<TrainingExample> {
    try {
      return await APIClient.put<TrainingExample>(`${this.endpoint}/${exampleId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class ModelTrainingService {
  private static endpoint = '/chatbot/model-trainings';

  static async getAllTrainings(filters?: { datasetId?: string; status?: string }): Promise<ModelTraining[]> {
    try {
      return await APIClient.get<ModelTraining[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async startTraining(trainingData: Partial<ModelTraining>): Promise<ModelTraining> {
    try {
      return await APIClient.post<ModelTraining>(this.endpoint, trainingData);
    } catch (error) {
            throw error;
    }
  }

  static async getTrainingStatus(trainingId: string): Promise<ModelTraining | null> {
    try {
      return await APIClient.get<ModelTraining>(`${this.endpoint}/${trainingId}`);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// MULTI-CHANNEL SERVICES
// ============================================================================

export class ChannelService {
  private static endpoint = '/chatbot/channels';

  static async getAllChannels(filters?: { channelType?: string; status?: string }): Promise<Channel[]> {
    try {
      return await APIClient.get<Channel[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    try {
      return await APIClient.post<Channel>(this.endpoint, channelData);
    } catch (error) {
            throw error;
    }
  }

  static async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    try {
      return await APIClient.put<Channel>(`${this.endpoint}/${channelId}`, updates);
    } catch (error) {
            throw error;
    }
  }

  static async testChannel(channelId: string): Promise<boolean> {
    try {
      return await APIClient.post<boolean>(`${this.endpoint}/${channelId}/test`, {});
    } catch (error) {
            throw error;
    }
  }
}

export class MessageTemplateService {
  private static endpoint = '/chatbot/message-templates';

  static async getAllTemplates(filters?: { channels?: string[]; status?: string }): Promise<MessageTemplate[]> {
    try {
      return await APIClient.get<MessageTemplate[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createTemplate(templateData: Partial<MessageTemplate>): Promise<MessageTemplate> {
    try {
      return await APIClient.post<MessageTemplate>(this.endpoint, templateData);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export class AnalyticsService {
  private static endpoint = '/chatbot/analytics';

  static async getAnalytics(filters?: { startDate?: string; endDate?: string }): Promise<ConversationAnalytics> {
    try {
      return await APIClient.get<ConversationAnalytics>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }
}

export class UserFeedbackService {
  private static endpoint = '/chatbot/user-feedback';

  static async getAllFeedback(filters?: { sessionId?: string; status?: string }): Promise<UserFeedback[]> {
    try {
      return await APIClient.get<UserFeedback[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async submitFeedback(feedbackData: Partial<UserFeedback>): Promise<UserFeedback> {
    try {
      return await APIClient.post<UserFeedback>(this.endpoint, feedbackData);
    } catch (error) {
            throw error;
    }
  }
}

export class ConversationSessionService {
  private static endpoint = '/chatbot/conversation-sessions';

  static async getAllSessions(filters?: { userId?: string; status?: string }): Promise<ConversationSession[]> {
    try {
      return await APIClient.get<ConversationSession[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createSession(sessionData: Partial<ConversationSession>): Promise<ConversationSession> {
    try {
      return await APIClient.post<ConversationSession>(this.endpoint, sessionData);
    } catch (error) {
            throw error;
    }
  }

  static async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<ConversationSession> {
    try {
      return await APIClient.put<ConversationSession>(`${this.endpoint}/${sessionId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

// ============================================================================
// HANDOFF SERVICES
// ============================================================================

export class HandoffRuleService {
  private static endpoint = '/chatbot/handoff-rules';

  static async getAllRules(filters?: { priority?: number; isActive?: boolean }): Promise<HandoffRule[]> {
    try {
      return await APIClient.get<HandoffRule[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createRule(ruleData: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      return await APIClient.post<HandoffRule>(this.endpoint, ruleData);
    } catch (error) {
            throw error;
    }
  }

  static async updateRule(ruleId: string, updates: Partial<HandoffRule>): Promise<HandoffRule> {
    try {
      return await APIClient.put<HandoffRule>(`${this.endpoint}/${ruleId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class HandoffRequestService {
  private static endpoint = '/chatbot/handoff-requests';

  static async getAllRequests(filters?: { sessionId?: string; status?: string }): Promise<HandoffRequest[]> {
    try {
      return await APIClient.get<HandoffRequest[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createRequest(requestData: Partial<HandoffRequest>): Promise<HandoffRequest> {
    try {
      return await APIClient.post<HandoffRequest>(this.endpoint, requestData);
    } catch (error) {
            throw error;
    }
  }

  static async updateRequest(requestId: string, updates: Partial<HandoffRequest>): Promise<HandoffRequest> {
    try {
      return await APIClient.put<HandoffRequest>(`${this.endpoint}/${requestId}`, updates);
    } catch (error) {
            throw error;
    }
  }
}

export class AgentService {
  private static endpoint = '/chatbot/agents';

  static async getAllAgents(filters?: { status?: string }): Promise<Agent[]> {
    try {
      return await APIClient.get<Agent[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    try {
      return await APIClient.get<Agent[]>(`${this.endpoint}/available`);
    } catch (error) {
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
      return await APIClient.get<Language[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async enableLanguage(languageCode: string): Promise<Language> {
    try {
      return await APIClient.post<Language>(`${this.endpoint}/${languageCode}/enable`, {});
    } catch (error) {
            throw error;
    }
  }
}

export class TranslationService {
  private static endpoint = '/chatbot/translations';

  static async getAllTranslations(filters?: { sourceLanguage?: string; targetLanguage?: string }): Promise<Translation[]> {
    try {
      return await APIClient.get<Translation[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createTranslation(translationData: Partial<Translation>): Promise<Translation> {
    try {
      return await APIClient.post<Translation>(this.endpoint, translationData);
    } catch (error) {
            throw error;
    }
  }

  static async autoTranslate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    try {
      const result = await APIClient.post<{ translatedText: string }>(`${this.endpoint}/auto-translate`, {
        text,
        sourceLanguage,
        targetLanguage,
      });
      return result.translatedText;
    } catch (error) {
            throw error;
    }
  }
}

export class LanguageContentService {
  private static endpoint = '/chatbot/language-content';

  static async getAllContent(filters?: { contentType?: string; defaultLanguage?: string }): Promise<LanguageContent[]> {
    try {
      return await APIClient.get<LanguageContent[]>(this.endpoint, filters);
    } catch (error) {
            throw error;
    }
  }

  static async createContent(contentData: Partial<LanguageContent>): Promise<LanguageContent> {
    try {
      return await APIClient.post<LanguageContent>(this.endpoint, contentData);
    } catch (error) {
            throw error;
    }
  }
}

export class LanguageDetectionService {
  private static endpoint = '/chatbot/language-detection';

  static async detectLanguage(text: string): Promise<LanguageDetection> {
    try {
      return await APIClient.post<LanguageDetection>(this.endpoint, { text });
    } catch (error) {
            throw error;
    }
  }
}

export class LocalizationSettingsService {
  private static endpoint = '/chatbot/localization-settings';

  static async getSettings(): Promise<LocalizationSettings> {
    try {
      return await APIClient.get<LocalizationSettings>(this.endpoint);
    } catch (error) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    try {
      return await APIClient.put<LocalizationSettings>(this.endpoint, updates);
    } catch (error) {
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
      return await APIClient.get<ChatbotSettings>(this.endpoint);
    } catch (error) {
            throw error;
    }
  }

  static async updateSettings(updates: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
    try {
      return await APIClient.put<ChatbotSettings>(this.endpoint, updates);
    } catch (error) {
            throw error;
    }
  }
}
