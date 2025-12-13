// Chatbot Builder Module - Service Layer

import {
  DialogueFlow, FlowTest, Entity, Intent, IntentMatch, TrainingDataset, TrainingExample,
  ModelTraining, Channel, ChannelMessage, MessageTemplate, ConversationAnalytics,
  UserFeedback, ConversationSession, HandoffRule, HandoffQueue, HandoffRequest, Agent,
  Language, Translation, LanguageContent, LanguageDetection, LocalizationSettings,
  ChatbotSettings
} from './types';

const STORAGE_KEYS = {
  DIALOGUE_FLOWS: 'chatbot_dialogue_flows',
  FLOW_TESTS: 'chatbot_flow_tests',
  ENTITIES: 'chatbot_entities',
  INTENTS: 'chatbot_intents',
  INTENT_MATCHES: 'chatbot_intent_matches',
  TRAINING_DATASETS: 'chatbot_training_datasets',
  TRAINING_EXAMPLES: 'chatbot_training_examples',
  MODEL_TRAININGS: 'chatbot_model_trainings',
  CHANNELS: 'chatbot_channels',
  CHANNEL_MESSAGES: 'chatbot_channel_messages',
  MESSAGE_TEMPLATES: 'chatbot_message_templates',
  ANALYTICS: 'chatbot_analytics',
  USER_FEEDBACK: 'chatbot_user_feedback',
  CONVERSATION_SESSIONS: 'chatbot_conversation_sessions',
  HANDOFF_RULES: 'chatbot_handoff_rules',
  HANDOFF_QUEUES: 'chatbot_handoff_queues',
  HANDOFF_REQUESTS: 'chatbot_handoff_requests',
  AGENTS: 'chatbot_agents',
  LANGUAGES: 'chatbot_languages',
  TRANSLATIONS: 'chatbot_translations',
  LANGUAGE_CONTENT: 'chatbot_language_content',
  LANGUAGE_DETECTIONS: 'chatbot_language_detections',
  LOCALIZATION_SETTINGS: 'chatbot_localization_settings',
  SETTINGS: 'chatbot_settings',
};

// ============================================================================
// DIALOGUE DESIGNER SERVICES
// ============================================================================

export class DialogueFlowService {
  static async getAllFlows(): Promise<DialogueFlow[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DIALOGUE_FLOWS);
    return data ? JSON.parse(data) : [];
  }

  static async getFlowById(flowId: string): Promise<DialogueFlow | null> {
    const flows = await this.getAllFlows();
    return flows.find(f => f.flowId === flowId) || null;
  }

  static async createFlow(flowData: Partial<DialogueFlow>): Promise<DialogueFlow> {
    const flows = await this.getAllFlows();
    const newFlow: DialogueFlow = {
      flowId: `flow-${Date.now()}`,
      flowName: flowData.flowName || 'New Dialogue Flow',
      description: flowData.description || '',
      category: flowData.category || 'General',
      nodes: flowData.nodes || [],
      connections: flowData.connections || [],
      variables: flowData.variables || [],
      isActive: false,
      version: '1.0',
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedBy: 'current-user',
      lastModifiedDate: new Date(),
      status: 'draft',
      triggerIntents: flowData.triggerIntents || [],
      tags: flowData.tags || [],
      ...flowData,
    };

    flows.push(newFlow);
    localStorage.setItem(STORAGE_KEYS.DIALOGUE_FLOWS, JSON.stringify(flows));
    return newFlow;
  }

  static async updateFlow(flowId: string, updates: Partial<DialogueFlow>): Promise<DialogueFlow> {
    const flows = await this.getAllFlows();
    const index = flows.findIndex(f => f.flowId === flowId);
    if (index === -1) throw new Error('Dialogue flow not found');

    flows[index] = {
      ...flows[index],
      ...updates,
      lastModifiedBy: 'current-user',
      lastModifiedDate: new Date()
    };
    localStorage.setItem(STORAGE_KEYS.DIALOGUE_FLOWS, JSON.stringify(flows));
    return flows[index];
  }

  // TODO: Replace with actual API call
  static async publishFlow(flowId: string): Promise<DialogueFlow> {
    return this.updateFlow(flowId, {
      status: 'published',
      isActive: true,
      publishedDate: new Date()
    });
  }

  static async deleteFlow(flowId: string): Promise<void> {
    const flows = await this.getAllFlows();
    const filtered = flows.filter(f => f.flowId !== flowId);
    localStorage.setItem(STORAGE_KEYS.DIALOGUE_FLOWS, JSON.stringify(filtered));
  }
}

export class FlowTestService {
  static async getAllTests(): Promise<FlowTest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.FLOW_TESTS);
    return data ? JSON.parse(data) : [];
  }

  static async createTest(testData: Partial<FlowTest>): Promise<FlowTest> {
    const tests = await this.getAllTests();
    const newTest: FlowTest = {
      testId: `test-${Date.now()}`,
      flowId: testData.flowId || '',
      testName: testData.testName || 'New Test',
      testScenarios: testData.testScenarios || [],
      createdBy: 'current-user',
      createdDate: new Date(),
      ...testData,
    };

    tests.push(newTest);
    localStorage.setItem(STORAGE_KEYS.FLOW_TESTS, JSON.stringify(tests));
    return newTest;
  }

  // TODO: Replace with actual API call for test execution
  static async runTest(testId: string): Promise<FlowTest> {
    const tests = await this.getAllTests();
    const test = tests.find(t => t.testId === testId);
    if (!test) throw new Error('Test not found');

    // Simulate test execution
    test.lastRunDate = new Date();
    test.lastRunResult = 'passed';
    localStorage.setItem(STORAGE_KEYS.FLOW_TESTS, JSON.stringify(tests));
    return test;
  }
}

// ============================================================================
// ENTITY MANAGEMENT SERVICES
// ============================================================================

export class EntityService {
  static async getAllEntities(): Promise<Entity[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ENTITIES);
    return data ? JSON.parse(data) : [];
  }

  static async getEntityById(entityId: string): Promise<Entity | null> {
    const entities = await this.getAllEntities();
    return entities.find(e => e.entityId === entityId) || null;
  }

  static async createEntity(entityData: Partial<Entity>): Promise<Entity> {
    const entities = await this.getAllEntities();
    const newEntity: Entity = {
      entityId: `entity-${Date.now()}`,
      entityName: entityData.entityName || 'new_entity',
      entityType: entityData.entityType || 'custom',
      description: entityData.description || '',
      values: entityData.values || [],
      fuzzyMatching: entityData.fuzzyMatching ?? true,
      isCaseSensitive: entityData.isCaseSensitive ?? false,
      status: 'active',
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      ...entityData,
    };

    entities.push(newEntity);
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(entities));
    return newEntity;
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>): Promise<Entity> {
    const entities = await this.getAllEntities();
    const index = entities.findIndex(e => e.entityId === entityId);
    if (index === -1) throw new Error('Entity not found');

    entities[index] = { ...entities[index], ...updates, lastModifiedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(entities));
    return entities[index];
  }

  static async deleteEntity(entityId: string): Promise<void> {
    const entities = await this.getAllEntities();
    const filtered = entities.filter(e => e.entityId !== entityId);
    localStorage.setItem(STORAGE_KEYS.ENTITIES, JSON.stringify(filtered));
  }
}

// ============================================================================
// INTENT LIBRARY SERVICES
// ============================================================================

export class IntentService {
  static async getAllIntents(): Promise<Intent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.INTENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getIntentById(intentId: string): Promise<Intent | null> {
    const intents = await this.getAllIntents();
    return intents.find(i => i.intentId === intentId) || null;
  }

  static async createIntent(intentData: Partial<Intent>): Promise<Intent> {
    const intents = await this.getAllIntents();
    const newIntent: Intent = {
      intentId: `intent-${Date.now()}`,
      intentName: intentData.intentName || 'new_intent',
      displayName: intentData.displayName || 'New Intent',
      description: intentData.description || '',
      category: intentData.category || 'General',
      trainingPhrases: intentData.trainingPhrases || [],
      responses: intentData.responses || [],
      parameters: intentData.parameters || [],
      contexts: intentData.contexts || [],
      priority: intentData.priority || 0,
      webhookEnabled: intentData.webhookEnabled || false,
      isActive: true,
      confidenceThreshold: intentData.confidenceThreshold || 0.7,
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      usageCount: 0,
      averageConfidence: 0,
      ...intentData,
    };

    intents.push(newIntent);
    localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(intents));
    return newIntent;
  }

  static async updateIntent(intentId: string, updates: Partial<Intent>): Promise<Intent> {
    const intents = await this.getAllIntents();
    const index = intents.findIndex(i => i.intentId === intentId);
    if (index === -1) throw new Error('Intent not found');

    intents[index] = { ...intents[index], ...updates, lastModifiedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(intents));
    return intents[index];
  }

  static async deleteIntent(intentId: string): Promise<void> {
    const intents = await this.getAllIntents();
    const filtered = intents.filter(i => i.intentId !== intentId);
    localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(filtered));
  }
}

export class IntentMatchService {
  static async getAllMatches(): Promise<IntentMatch[]> {
    const data = localStorage.getItem(STORAGE_KEYS.INTENT_MATCHES);
    return data ? JSON.parse(data) : [];
  }

  static async logMatch(matchData: Partial<IntentMatch>): Promise<IntentMatch> {
    const matches = await this.getAllMatches();
    const newMatch: IntentMatch = {
      matchId: `match-${Date.now()}`,
      userMessage: matchData.userMessage || '',
      matchedIntent: matchData.matchedIntent || '',
      confidence: matchData.confidence || 0,
      extractedParameters: matchData.extractedParameters || {},
      timestamp: new Date(),
      sessionId: matchData.sessionId || '',
      ...matchData,
    };

    matches.push(newMatch);
    localStorage.setItem(STORAGE_KEYS.INTENT_MATCHES, JSON.stringify(matches));
    return newMatch;
  }
}

// ============================================================================
// TRAINING DATA SERVICES
// ============================================================================

export class TrainingDatasetService {
  static async getAllDatasets(): Promise<TrainingDataset[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINING_DATASETS);
    return data ? JSON.parse(data) : [];
  }

  static async createDataset(datasetData: Partial<TrainingDataset>): Promise<TrainingDataset> {
    const datasets = await this.getAllDatasets();
    const newDataset: TrainingDataset = {
      datasetId: `dataset-${Date.now()}`,
      datasetName: datasetData.datasetName || 'New Dataset',
      description: datasetData.description || '',
      language: datasetData.language || 'en',
      totalExamples: 0,
      intents: datasetData.intents || [],
      entities: datasetData.entities || [],
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      status: 'draft',
      ...datasetData,
    };

    datasets.push(newDataset);
    localStorage.setItem(STORAGE_KEYS.TRAINING_DATASETS, JSON.stringify(datasets));
    return newDataset;
  }
}

export class TrainingExampleService {
  static async getAllExamples(): Promise<TrainingExample[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINING_EXAMPLES);
    return data ? JSON.parse(data) : [];
  }

  static async createExample(exampleData: Partial<TrainingExample>): Promise<TrainingExample> {
    const examples = await this.getAllExamples();
    const newExample: TrainingExample = {
      exampleId: `example-${Date.now()}`,
      text: exampleData.text || '',
      intent: exampleData.intent || '',
      entities: exampleData.entities || [],
      language: exampleData.language || 'en',
      source: exampleData.source || 'manual',
      addedBy: 'current-user',
      addedDate: new Date(),
      isValidated: false,
      ...exampleData,
    };

    examples.push(newExample);
    localStorage.setItem(STORAGE_KEYS.TRAINING_EXAMPLES, JSON.stringify(examples));
    return newExample;
  }

  static async updateExample(exampleId: string, updates: Partial<TrainingExample>): Promise<TrainingExample> {
    const examples = await this.getAllExamples();
    const index = examples.findIndex(e => e.exampleId === exampleId);
    if (index === -1) throw new Error('Training example not found');

    examples[index] = { ...examples[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TRAINING_EXAMPLES, JSON.stringify(examples));
    return examples[index];
  }
}

export class ModelTrainingService {
  static async getAllTrainings(): Promise<ModelTraining[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MODEL_TRAININGS);
    return data ? JSON.parse(data) : [];
  }

  static async startTraining(trainingData: Partial<ModelTraining>): Promise<ModelTraining> {
    const trainings = await this.getAllTrainings();
    const newTraining: ModelTraining = {
      trainingId: `training-${Date.now()}`,
      modelVersion: `v${Date.now()}`,
      datasetId: trainingData.datasetId || '',
      startTime: new Date(),
      status: 'queued',
      modelConfig: trainingData.modelConfig || {
        algorithm: 'neural_network',
        maxEpochs: 100,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        earlyStopping: true,
      },
      ...trainingData,
    };

    trainings.push(newTraining);
    localStorage.setItem(STORAGE_KEYS.MODEL_TRAININGS, JSON.stringify(trainings));

    // TODO: Replace with actual API call to start training
    return newTraining;
  }

  static async getTrainingStatus(trainingId: string): Promise<ModelTraining | null> {
    const trainings = await this.getAllTrainings();
    return trainings.find(t => t.trainingId === trainingId) || null;
  }
}

// ============================================================================
// MULTI-CHANNEL SERVICES
// ============================================================================

export class ChannelService {
  static async getAllChannels(): Promise<Channel[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return data ? JSON.parse(data) : [];
  }

  static async createChannel(channelData: Partial<Channel>): Promise<Channel> {
    const channels = await this.getAllChannels();
    const newChannel: Channel = {
      channelId: `channel-${Date.now()}`,
      channelType: channelData.channelType || 'web',
      channelName: channelData.channelName || 'New Channel',
      isEnabled: false,
      configuration: channelData.configuration || {},
      features: channelData.features || [],
      createdDate: new Date(),
      status: 'inactive',
      ...channelData,
    };

    channels.push(newChannel);
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    return newChannel;
  }

  static async updateChannel(channelId: string, updates: Partial<Channel>): Promise<Channel> {
    const channels = await this.getAllChannels();
    const index = channels.findIndex(c => c.channelId === channelId);
    if (index === -1) throw new Error('Channel not found');

    channels[index] = { ...channels[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    return channels[index];
  }

  static async testChannel(channelId: string): Promise<boolean> {
    // TODO: Replace with actual API call to test channel connectivity
    return true;
  }
}

export class MessageTemplateService {
  static async getAllTemplates(): Promise<MessageTemplate[]> {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGE_TEMPLATES);
    return data ? JSON.parse(data) : [];
  }

  static async createTemplate(templateData: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const templates = await this.getAllTemplates();
    const newTemplate: MessageTemplate = {
      templateId: `template-${Date.now()}`,
      templateName: templateData.templateName || 'New Template',
      channels: templateData.channels || [],
      content: templateData.content || {},
      variables: templateData.variables || [],
      isApproved: false,
      createdDate: new Date(),
      ...templateData,
    };

    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEYS.MESSAGE_TEMPLATES, JSON.stringify(templates));
    return newTemplate;
  }
}

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export class AnalyticsService {
  static async getAnalytics(startDate: Date, endDate: Date): Promise<ConversationAnalytics> {
    // TODO: Replace with actual API call to generate analytics
    const analytics: ConversationAnalytics = {
      analyticsId: `analytics-${Date.now()}`,
      period: { start: startDate, end: endDate },
      totalConversations: 0,
      totalMessages: 0,
      averageConversationLength: 0,
      averageResponseTime: 0,
      intentDistribution: [],
      topIntents: [],
      failedIntents: [],
      conversationMetrics: {
        completionRate: 0,
        abandonmentRate: 0,
        handoffRate: 0,
        averageTurns: 0,
      },
      channelBreakdown: [],
      peakHours: [],
      generatedDate: new Date(),
    };

    return analytics;
  }
}

export class UserFeedbackService {
  static async getAllFeedback(): Promise<UserFeedback[]> {
    const data = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACK);
    return data ? JSON.parse(data) : [];
  }

  static async submitFeedback(feedbackData: Partial<UserFeedback>): Promise<UserFeedback> {
    const feedbacks = await this.getAllFeedback();
    const newFeedback: UserFeedback = {
      feedbackId: `feedback-${Date.now()}`,
      sessionId: feedbackData.sessionId || '',
      conversationId: feedbackData.conversationId || '',
      rating: feedbackData.rating || 3,
      feedbackType: feedbackData.feedbackType || 'neutral',
      tags: feedbackData.tags || [],
      timestamp: new Date(),
      followUpRequired: feedbackData.followUpRequired || false,
      ...feedbackData,
    };

    feedbacks.push(newFeedback);
    localStorage.setItem(STORAGE_KEYS.USER_FEEDBACK, JSON.stringify(feedbacks));
    return newFeedback;
  }
}

export class ConversationSessionService {
  static async getAllSessions(): Promise<ConversationSession[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATION_SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createSession(sessionData: Partial<ConversationSession>): Promise<ConversationSession> {
    const sessions = await this.getAllSessions();
    const newSession: ConversationSession = {
      sessionId: `session-${Date.now()}`,
      userId: sessionData.userId || 'anonymous',
      channelType: sessionData.channelType || 'web',
      startTime: new Date(),
      messageCount: 0,
      intentsTriggered: [],
      entitiesExtracted: {},
      wasHandedOff: false,
      conversationFlow: [],
      context: {},
      status: 'active',
      ...sessionData,
    };

    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_SESSIONS, JSON.stringify(sessions));
    return newSession;
  }

  static async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<ConversationSession> {
    const sessions = await this.getAllSessions();
    const index = sessions.findIndex(s => s.sessionId === sessionId);
    if (index === -1) throw new Error('Session not found');

    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CONVERSATION_SESSIONS, JSON.stringify(sessions));
    return sessions[index];
  }
}

// ============================================================================
// HANDOFF SERVICES
// ============================================================================

export class HandoffRuleService {
  static async getAllRules(): Promise<HandoffRule[]> {
    const data = localStorage.getItem(STORAGE_KEYS.HANDOFF_RULES);
    return data ? JSON.parse(data) : [];
  }

  static async createRule(ruleData: Partial<HandoffRule>): Promise<HandoffRule> {
    const rules = await this.getAllRules();
    const newRule: HandoffRule = {
      ruleId: `rule-${Date.now()}`,
      ruleName: ruleData.ruleName || 'New Handoff Rule',
      description: ruleData.description || '',
      priority: ruleData.priority || 0,
      isActive: true,
      triggers: ruleData.triggers || [],
      conditions: ruleData.conditions || [],
      action: ruleData.action as any,
      createdBy: 'current-user',
      createdDate: new Date(),
      lastModifiedDate: new Date(),
      ...ruleData,
    };

    rules.push(newRule);
    localStorage.setItem(STORAGE_KEYS.HANDOFF_RULES, JSON.stringify(rules));
    return newRule;
  }

  static async updateRule(ruleId: string, updates: Partial<HandoffRule>): Promise<HandoffRule> {
    const rules = await this.getAllRules();
    const index = rules.findIndex(r => r.ruleId === ruleId);
    if (index === -1) throw new Error('Handoff rule not found');

    rules[index] = { ...rules[index], ...updates, lastModifiedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.HANDOFF_RULES, JSON.stringify(rules));
    return rules[index];
  }
}

export class HandoffRequestService {
  static async getAllRequests(): Promise<HandoffRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.HANDOFF_REQUESTS);
    return data ? JSON.parse(data) : [];
  }

  static async createRequest(requestData: Partial<HandoffRequest>): Promise<HandoffRequest> {
    const requests = await this.getAllRequests();
    const newRequest: HandoffRequest = {
      requestId: `request-${Date.now()}`,
      sessionId: requestData.sessionId || '',
      userId: requestData.userId || '',
      reason: requestData.reason || '',
      requestedTime: new Date(),
      priority: requestData.priority || 'medium',
      conversationHistory: requestData.conversationHistory || [],
      userContext: requestData.userContext || {},
      status: 'pending',
      ...requestData,
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.HANDOFF_REQUESTS, JSON.stringify(requests));
    return newRequest;
  }

  static async updateRequest(requestId: string, updates: Partial<HandoffRequest>): Promise<HandoffRequest> {
    const requests = await this.getAllRequests();
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index === -1) throw new Error('Handoff request not found');

    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.HANDOFF_REQUESTS, JSON.stringify(requests));
    return requests[index];
  }
}

export class AgentService {
  static async getAllAgents(): Promise<Agent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.AGENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    const agents = await this.getAllAgents();
    return agents.filter(a => a.status === 'available' && a.currentChats < a.maxConcurrentChats);
  }
}

// ============================================================================
// MULTI-LINGUAL SERVICES
// ============================================================================

export class LanguageService {
  static async getAllLanguages(): Promise<Language[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LANGUAGES);
    return data ? JSON.parse(data) : [];
  }

  static async enableLanguage(languageCode: string): Promise<Language> {
    const languages = await this.getAllLanguages();
    const language = languages.find(l => l.languageCode === languageCode);
    if (language) {
      language.isEnabled = true;
      localStorage.setItem(STORAGE_KEYS.LANGUAGES, JSON.stringify(languages));
      return language;
    }
    throw new Error('Language not found');
  }
}

export class TranslationService {
  static async getAllTranslations(): Promise<Translation[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSLATIONS);
    return data ? JSON.parse(data) : [];
  }

  static async createTranslation(translationData: Partial<Translation>): Promise<Translation> {
    const translations = await this.getAllTranslations();
    const newTranslation: Translation = {
      translationId: `translation-${Date.now()}`,
      sourceLanguage: translationData.sourceLanguage || 'en',
      targetLanguage: translationData.targetLanguage || '',
      sourceText: translationData.sourceText || '',
      translatedText: translationData.translatedText || '',
      translationMethod: translationData.translationMethod || 'manual',
      translatedBy: 'current-user',
      translatedDate: new Date(),
      isApproved: false,
      ...translationData,
    };

    translations.push(newTranslation);
    localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(translations));
    return newTranslation;
  }

  // TODO: Replace with actual API call for auto-translation
  static async autoTranslate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    return `[AUTO-TRANSLATED: ${text}]`;
  }
}

export class LanguageContentService {
  static async getAllContent(): Promise<LanguageContent[]> {
    const data = localStorage.getItem(STORAGE_KEYS.LANGUAGE_CONTENT);
    return data ? JSON.parse(data) : [];
  }

  static async createContent(contentData: Partial<LanguageContent>): Promise<LanguageContent> {
    const contents = await this.getAllContent();
    const newContent: LanguageContent = {
      contentId: `content-${Date.now()}`,
      contentType: contentData.contentType || 'message',
      referenceId: contentData.referenceId || '',
      translations: contentData.translations || {},
      defaultLanguage: contentData.defaultLanguage || 'en',
      lastModifiedDate: new Date(),
      ...contentData,
    };

    contents.push(newContent);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_CONTENT, JSON.stringify(contents));
    return newContent;
  }
}

export class LanguageDetectionService {
  // TODO: Replace with actual API call for language detection
  static async detectLanguage(text: string): Promise<LanguageDetection> {
    return {
      detectionId: `detection-${Date.now()}`,
      text,
      detectedLanguage: 'en',
      confidence: 0.95,
      alternativeLanguages: [],
      timestamp: new Date(),
    };
  }
}

export class LocalizationSettingsService {
  static async getSettings(): Promise<LocalizationSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.LOCALIZATION_SETTINGS);
    if (data) return JSON.parse(data);

    const defaultSettings: LocalizationSettings = {
      settingsId: 'loc-settings-1',
      autoDetectLanguage: true,
      fallbackLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr'],
      translationProvider: 'google',
      enableAutoTranslation: true,
      requireApprovalForAutoTranslation: true,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
    };

    localStorage.setItem(STORAGE_KEYS.LOCALIZATION_SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<LocalizationSettings>): Promise<LocalizationSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };

    localStorage.setItem(STORAGE_KEYS.LOCALIZATION_SETTINGS, JSON.stringify(updated));
    return updated;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class ChatbotSettingsService {
  static async getSettings(): Promise<ChatbotSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);

    const defaultSettings: ChatbotSettings = {
      settingsId: 'settings-1',
      botName: 'HR Assistant',
      defaultLanguage: 'en',
      enableLogging: true,
      logRetentionDays: 90,
      enableAnalytics: true,
      confidenceThreshold: 0.7,
      fallbackMessage: 'I did not understand that. Could you please rephrase?',
      maxConversationTurns: 50,
      sessionTimeoutMinutes: 30,
      enableContextPersistence: true,
      enableSentimentAnalysis: true,
      enableSpellCheck: true,
      enableProfanityFilter: true,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<ChatbotSettings>): Promise<ChatbotSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
