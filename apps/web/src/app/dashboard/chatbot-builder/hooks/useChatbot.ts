'use client';

import { useState, useEffect } from 'react';
import type {
  DialogueFlow, FlowTest, Entity, Intent, TrainingDataset, TrainingExample,
  ModelTraining, Channel, MessageTemplate, ConversationAnalytics, HandoffRule, Agent,
  Language, LocalizationSettings,
  ChatbotSettings, Toast
} from '../types';
import { IntentMatch, ChannelMessage,
  UserFeedback, ConversationSession, HandoffQueue, HandoffRequest, Translation, LanguageContent, LanguageDetection
} from '../types';
import {
  DialogueFlowService, FlowTestService, EntityService, IntentService, IntentMatchService,
  TrainingDatasetService, TrainingExampleService, ModelTrainingService, ChannelService,
  MessageTemplateService, AnalyticsService, UserFeedbackService, ConversationSessionService,
  HandoffRuleService, HandoffRequestService, AgentService, LanguageService, TranslationService,
  LanguageContentService, LanguageDetectionService, LocalizationSettingsService,
  ChatbotSettingsService
} from '../services';
import {
  sampleDialogueFlows, sampleFlowTests, sampleEntities, sampleIntents, sampleTrainingDatasets,
  sampleTrainingExamples, sampleModelTrainings, sampleChannels, sampleMessageTemplates,
  sampleConversationAnalytics, sampleHandoffRules, sampleHandoffQueues, sampleAgents,
  sampleLanguages, sampleLocalizationSettings, sampleChatbotSettings
} from '../data';

export const useChatbot = () => {
  // State
  const [dialogueFlows, setDialogueFlows] = useState<DialogueFlow[]>([]);
  const [flowTests, setFlowTests] = useState<FlowTest[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [trainingDatasets, setTrainingDatasets] = useState<TrainingDataset[]>([]);
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);
  const [modelTrainings, setModelTrainings] = useState<ModelTraining[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ConversationAnalytics | null>(null);
  const [handoffRules, setHandoffRules] = useState<HandoffRule[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [localizationSettings, setLocalizationSettings] = useState<LocalizationSettings | null>(null);
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existing = await DialogueFlowService.getAllFlows();
      if (existing.length === 0) {
        localStorage.setItem('chatbot_dialogue_flows', JSON.stringify(sampleDialogueFlows));
        localStorage.setItem('chatbot_flow_tests', JSON.stringify(sampleFlowTests));
        localStorage.setItem('chatbot_entities', JSON.stringify(sampleEntities));
        localStorage.setItem('chatbot_intents', JSON.stringify(sampleIntents));
        localStorage.setItem('chatbot_training_datasets', JSON.stringify(sampleTrainingDatasets));
        localStorage.setItem('chatbot_training_examples', JSON.stringify(sampleTrainingExamples));
        localStorage.setItem('chatbot_model_trainings', JSON.stringify(sampleModelTrainings));
        localStorage.setItem('chatbot_channels', JSON.stringify(sampleChannels));
        localStorage.setItem('chatbot_message_templates', JSON.stringify(sampleMessageTemplates));
        localStorage.setItem('chatbot_handoff_rules', JSON.stringify(sampleHandoffRules));
        localStorage.setItem('chatbot_agents', JSON.stringify(sampleAgents));
        localStorage.setItem('chatbot_languages', JSON.stringify(sampleLanguages));
      }

      await Promise.all([
        loadDialogueFlows(), loadFlowTests(), loadEntities(), loadIntents(),
        loadTrainingDatasets(), loadChannels(), loadHandoffRules(), loadAgents(),
        loadLanguages(), loadSettings()
      ]);
    } catch (error) {
            addToast({ type: 'error', message: 'Failed to load chatbot data' });
    } finally {
      setLoading(false);
    }
  };

  // Dialogue Flow Methods
  const loadDialogueFlows = async () => {
    const data = await DialogueFlowService.getAllFlows();
    setDialogueFlows(data);
  };

  const createDialogueFlow = async (flowData: Partial<DialogueFlow>) => {
    setLoading(true);
    try {
      const flow = await DialogueFlowService.createFlow(flowData);
      await loadDialogueFlows();
      addToast({ type: 'success', message: 'Dialogue flow created' });
      return flow;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create flow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDialogueFlow = async (flowId: string, updates: Partial<DialogueFlow>) => {
    setLoading(true);
    try {
      const flow = await DialogueFlowService.updateFlow(flowId, updates);
      await loadDialogueFlows();
      addToast({ type: 'success', message: 'Flow updated' });
      return flow;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update flow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const publishDialogueFlow = async (flowId: string) => {
    setLoading(true);
    try {
      await DialogueFlowService.publishFlow(flowId);
      await loadDialogueFlows();
      addToast({ type: 'success', message: 'Flow published' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to publish flow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDialogueFlow = async (flowId: string) => {
    setLoading(true);
    try {
      await DialogueFlowService.deleteFlow(flowId);
      await loadDialogueFlows();
      addToast({ type: 'success', message: 'Flow deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete flow' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Entity Methods
  const loadEntities = async () => {
    const data = await EntityService.getAllEntities();
    setEntities(data);
  };

  const createEntity = async (entityData: Partial<Entity>) => {
    setLoading(true);
    try {
      const entity = await EntityService.createEntity(entityData);
      await loadEntities();
      addToast({ type: 'success', message: 'Entity created' });
      return entity;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create entity' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEntity = async (entityId: string, updates: Partial<Entity>) => {
    setLoading(true);
    try {
      const entity = await EntityService.updateEntity(entityId, updates);
      await loadEntities();
      addToast({ type: 'success', message: 'Entity updated' });
      return entity;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update entity' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntity = async (entityId: string) => {
    setLoading(true);
    try {
      await EntityService.deleteEntity(entityId);
      await loadEntities();
      addToast({ type: 'success', message: 'Entity deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete entity' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Intent Methods
  const loadIntents = async () => {
    const data = await IntentService.getAllIntents();
    setIntents(data);
  };

  const createIntent = async (intentData: Partial<Intent>) => {
    setLoading(true);
    try {
      const intent = await IntentService.createIntent(intentData);
      await loadIntents();
      addToast({ type: 'success', message: 'Intent created' });
      return intent;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create intent' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateIntent = async (intentId: string, updates: Partial<Intent>) => {
    setLoading(true);
    try {
      const intent = await IntentService.updateIntent(intentId, updates);
      await loadIntents();
      addToast({ type: 'success', message: 'Intent updated' });
      return intent;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update intent' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteIntent = async (intentId: string) => {
    setLoading(true);
    try {
      await IntentService.deleteIntent(intentId);
      await loadIntents();
      addToast({ type: 'success', message: 'Intent deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete intent' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Training Methods
  const loadTrainingDatasets = async () => {
    const data = await TrainingDatasetService.getAllDatasets();
    setTrainingDatasets(data);
  };

  const createTrainingDataset = async (datasetData: Partial<TrainingDataset>) => {
    setLoading(true);
    try {
      const dataset = await TrainingDatasetService.createDataset(datasetData);
      await loadTrainingDatasets();
      addToast({ type: 'success', message: 'Dataset created' });
      return dataset;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create dataset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startModelTraining = async (trainingData: Partial<ModelTraining>) => {
    setLoading(true);
    try {
      const training = await ModelTrainingService.startTraining(trainingData);
      addToast({ type: 'success', message: 'Training started' });
      return training;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to start training' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Channel Methods
  const loadChannels = async () => {
    const data = await ChannelService.getAllChannels();
    setChannels(data);
  };

  const createChannel = async (channelData: Partial<Channel>) => {
    setLoading(true);
    try {
      const channel = await ChannelService.createChannel(channelData);
      await loadChannels();
      addToast({ type: 'success', message: 'Channel created' });
      return channel;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create channel' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateChannel = async (channelId: string, updates: Partial<Channel>) => {
    setLoading(true);
    try {
      const channel = await ChannelService.updateChannel(channelId, updates);
      await loadChannels();
      addToast({ type: 'success', message: 'Channel updated' });
      return channel;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update channel' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testChannel = async (channelId: string) => {
    setLoading(true);
    try {
      const result = await ChannelService.testChannel(channelId);
      addToast({ type: 'success', message: result ? 'Channel test successful' : 'Channel test failed' });
      return result;
    } catch (error) {
      addToast({ type: 'error', message: 'Channel test failed' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handoff Methods
  const loadHandoffRules = async () => {
    const data = await HandoffRuleService.getAllRules();
    setHandoffRules(data);
  };

  const createHandoffRule = async (ruleData: Partial<HandoffRule>) => {
    setLoading(true);
    try {
      const rule = await HandoffRuleService.createRule(ruleData);
      await loadHandoffRules();
      addToast({ type: 'success', message: 'Handoff rule created' });
      return rule;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create rule' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Agent Methods
  const loadAgents = async () => {
    const data = await AgentService.getAllAgents();
    setAgents(data);
  };

  // Language Methods
  const loadLanguages = async () => {
    const data = await LanguageService.getAllLanguages();
    setLanguages(data);
  };

  const enableLanguage = async (languageCode: string) => {
    setLoading(true);
    try {
      await LanguageService.enableLanguage(languageCode);
      await loadLanguages();
      addToast({ type: 'success', message: 'Language enabled' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to enable language' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Settings Methods
  const loadSettings = async () => {
    const data = await ChatbotSettingsService.getSettings();
    setSettings(data);
  };

  const updateSettings = async (updates: Partial<ChatbotSettings>) => {
    setLoading(true);
    try {
      const updated = await ChatbotSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated' });
      return updated;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Flow Test Methods
  const loadFlowTests = async () => {
    const data = await FlowTestService.getAllTests();
    setFlowTests(data);
  };

  const runFlowTest = async (testId: string) => {
    setLoading(true);
    try {
      const result = await FlowTestService.runTest(testId);
      await loadFlowTests();
      addToast({ type: 'success', message: `Test ${result.lastRunResult}` });
      return result;
    } catch (error) {
      addToast({ type: 'error', message: 'Test failed' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toast Methods
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    dialogueFlows, flowTests, entities, intents, trainingDatasets, trainingExamples,
    modelTrainings, channels, messageTemplates, analytics, handoffRules, agents,
    languages, localizationSettings, settings, loading, toasts,
    loadDialogueFlows, createDialogueFlow, updateDialogueFlow, publishDialogueFlow, deleteDialogueFlow,
    loadFlowTests, runFlowTest,
    loadEntities, createEntity, updateEntity, deleteEntity,
    loadIntents, createIntent, updateIntent, deleteIntent,
    loadTrainingDatasets, createTrainingDataset, startModelTraining,
    loadChannels, createChannel, updateChannel, testChannel,
    loadHandoffRules, createHandoffRule,
    loadLanguages, enableLanguage,
    loadSettings, updateSettings,
    addToast, removeToast,
  };
};
