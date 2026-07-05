'use client';

import { useState, useEffect } from 'react';
import type {
  DialogueFlow,
  Entity,
  Intent,
  TrainingDataset,
  TrainingExample,
  Channel,
  ConversationAnalytics,
  HandoffRule,
  Agent,
  Language,
  ChatbotSettings,
  Toast,
} from '../types';
import {
  DialogueFlowService,
  EntityService,
  IntentService,
  TrainingDatasetService,
  TrainingExampleService,
  ChannelService,
  AnalyticsService,
  HandoffRuleService,
  AgentService,
  LanguageService,
  ChatbotSettingsService,
} from '../services';

export const useChatbot = () => {
  const [dialogueFlows, setDialogueFlows] = useState<DialogueFlow[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [trainingDatasets, setTrainingDatasets] = useState<TrainingDataset[]>([]);
  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [analytics, setAnalytics] = useState<ConversationAnalytics | null>(null);
  const [handoffRules, setHandoffRules] = useState<HandoffRule[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDialogueFlows(),
        loadEntities(),
        loadIntents(),
        loadTrainingDatasets(),
        loadTrainingExamples(),
        loadChannels(),
        loadHandoffRules(),
        loadAgents(),
        loadLanguages(),
        loadSettings(),
      ]);
    } catch {
      addToast({ type: 'error', message: 'Failed to load chatbot data' });
    } finally {
      setLoading(false);
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadDialogueFlows = async () => {
    try {
      const data = await DialogueFlowService.getAllFlows();
      setDialogueFlows(data);
    } catch {
      setDialogueFlows([]);
    }
  };

  const createDialogueFlow = async (flowData: Partial<DialogueFlow>) => {
    setLoading(true);
    try {
      const flow = await DialogueFlowService.createFlow(flowData);
      await loadDialogueFlows();
      addToast({ type: 'success', message: 'Dialogue flow created' });
      return flow;
    } catch {
      addToast({ type: 'error', message: 'Failed to create flow' });
      throw new Error('Failed to create flow');
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
    } catch {
      addToast({ type: 'error', message: 'Failed to update flow' });
      throw new Error('Failed to update flow');
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
    } catch {
      addToast({ type: 'error', message: 'Failed to publish flow' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to delete flow' });
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const data = await EntityService.getAllEntities();
      setEntities(data);
    } catch {
      setEntities([]);
    }
  };

  const createEntity = async (entityData: Partial<Entity>) => {
    setLoading(true);
    try {
      const entity = await EntityService.createEntity(entityData);
      await loadEntities();
      addToast({ type: 'success', message: 'Entity created' });
      return entity;
    } catch {
      addToast({ type: 'error', message: 'Failed to create entity' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to update entity' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to delete entity' });
    } finally {
      setLoading(false);
    }
  };

  const loadIntents = async () => {
    try {
      const data = await IntentService.getAllIntents();
      setIntents(data);
    } catch {
      setIntents([]);
    }
  };

  const createIntent = async (intentData: Partial<Intent>) => {
    setLoading(true);
    try {
      const intent = await IntentService.createIntent(intentData);
      await loadIntents();
      addToast({ type: 'success', message: 'Intent created' });
      return intent;
    } catch {
      addToast({ type: 'error', message: 'Failed to create intent' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to update intent' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to delete intent' });
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingDatasets = async () => {
    try {
      const data = await TrainingDatasetService.getAllDatasets();
      setTrainingDatasets(data);
    } catch {
      setTrainingDatasets([]);
    }
  };

  const createTrainingDataset = async (datasetData: Partial<TrainingDataset>) => {
    setLoading(true);
    try {
      const dataset = await TrainingDatasetService.createDataset(datasetData);
      await loadTrainingDatasets();
      addToast({ type: 'success', message: 'Dataset created' });
      return dataset;
    } catch {
      addToast({ type: 'error', message: 'Failed to create dataset' });
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const data = await ChannelService.getAllChannels();
      setChannels(data);
    } catch {
      setChannels([]);
    }
  };

  const createChannel = async (channelData: Partial<Channel>) => {
    setLoading(true);
    try {
      const channel = await ChannelService.createChannel(channelData);
      await loadChannels();
      addToast({ type: 'success', message: 'Channel created' });
      return channel;
    } catch {
      addToast({ type: 'error', message: 'Failed to create channel' });
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
    } catch {
      addToast({ type: 'error', message: 'Failed to update channel' });
    } finally {
      setLoading(false);
    }
  };

  const deleteChannel = async (channelId: string) => {
    setLoading(true);
    try {
      await ChannelService.deleteChannel(channelId);
      await loadChannels();
      addToast({ type: 'success', message: 'Channel deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete channel' });
    } finally {
      setLoading(false);
    }
  };

  const testChannel = async (channelId: string) => {
    setLoading(true);
    try {
      const result = await ChannelService.testChannel(channelId);
      addToast({
        type: 'success',
        message: result ? 'Channel test successful' : 'Channel test failed',
      });
      return result;
    } catch {
      addToast({ type: 'error', message: 'Channel test failed' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadHandoffRules = async () => {
    try {
      const data = await HandoffRuleService.getAllRules();
      setHandoffRules(data);
    } catch {
      setHandoffRules([]);
    }
  };

  const createHandoffRule = async (ruleData: Partial<HandoffRule>) => {
    setLoading(true);
    try {
      const rule = await HandoffRuleService.createRule(ruleData);
      await loadHandoffRules();
      addToast({ type: 'success', message: 'Handoff rule created' });
      return rule;
    } catch {
      addToast({ type: 'error', message: 'Failed to create rule' });
    } finally {
      setLoading(false);
    }
  };

  const updateHandoffRule = async (ruleId: string, updates: Partial<HandoffRule>) => {
    setLoading(true);
    try {
      const rule = await HandoffRuleService.updateRule(ruleId, updates);
      await loadHandoffRules();
      addToast({ type: 'success', message: 'Handoff rule updated' });
      return rule;
    } catch {
      addToast({ type: 'error', message: 'Failed to update rule' });
    } finally {
      setLoading(false);
    }
  };

  const deleteHandoffRule = async (ruleId: string) => {
    setLoading(true);
    try {
      await HandoffRuleService.deleteRule(ruleId);
      await loadHandoffRules();
      addToast({ type: 'success', message: 'Handoff rule deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete rule' });
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await AgentService.getAllAgents();
      setAgents(data);
    } catch {
      setAgents([]);
    }
  };

  const loadLanguages = async () => {
    try {
      const data = await LanguageService.getAllLanguages();
      setLanguages(data);
    } catch {
      setLanguages([]);
    }
  };

  const enableLanguage = async (languageCode: string) => {
    setLoading(true);
    try {
      await LanguageService.enableLanguage(languageCode);
      await loadLanguages();
      addToast({ type: 'success', message: 'Language enabled' });
    } catch {
      addToast({ type: 'error', message: 'Failed to enable language' });
    } finally {
      setLoading(false);
    }
  };

  const updateLanguage = async (languageCode: string, updates: Partial<Language>) => {
    setLoading(true);
    try {
      const lang = await LanguageService.updateLanguage(languageCode, updates);
      await loadLanguages();
      addToast({ type: 'success', message: 'Language updated' });
      return lang;
    } catch {
      addToast({ type: 'error', message: 'Failed to update language' });
    } finally {
      setLoading(false);
    }
  };

  const createLanguage = async (languageData: Partial<Language>) => {
    setLoading(true);
    try {
      const lang = await LanguageService.createLanguage(languageData);
      await loadLanguages();
      addToast({ type: 'success', message: 'Language added' });
      return lang;
    } catch {
      addToast({ type: 'error', message: 'Failed to add language' });
    } finally {
      setLoading(false);
    }
  };

  const deleteLanguage = async (languageCode: string) => {
    setLoading(true);
    try {
      await LanguageService.deleteLanguage(languageCode);
      await loadLanguages();
      addToast({ type: 'success', message: 'Language deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete language' });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await ChatbotSettingsService.getSettings();
      setSettings(data);
    } catch {
      setSettings(null);
    }
  };

  const updateSettings = async (updates: Partial<ChatbotSettings>) => {
    setLoading(true);
    try {
      const updated = await ChatbotSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated' });
      return updated;
    } catch {
      addToast({ type: 'error', message: 'Failed to update settings' });
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingExamples = async (datasetId?: string) => {
    try {
      const data = await TrainingExampleService.getAllExamples(
        datasetId ? { datasetId } : undefined
      );
      setTrainingExamples(data);
    } catch {
      setTrainingExamples([]);
    }
  };

  const createTrainingExample = async (exampleData: Partial<TrainingExample>) => {
    setLoading(true);
    try {
      const example = await TrainingExampleService.createExample(exampleData);
      await loadTrainingExamples();
      addToast({ type: 'success', message: 'Training example created' });
      return example;
    } catch {
      addToast({ type: 'error', message: 'Failed to create training example' });
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingExample = async (exampleId: string, updates: Partial<TrainingExample>) => {
    setLoading(true);
    try {
      const example = await TrainingExampleService.updateExample(exampleId, updates);
      await loadTrainingExamples();
      addToast({ type: 'success', message: 'Training example updated' });
      return example;
    } catch {
      addToast({ type: 'error', message: 'Failed to update training example' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainingExample = async (exampleId: string) => {
    setLoading(true);
    try {
      await TrainingExampleService.deleteExample(exampleId);
      await loadTrainingExamples();
      addToast({ type: 'success', message: 'Example deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete example' });
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingDataset = async (datasetId: string, updates: Partial<TrainingDataset>) => {
    setLoading(true);
    try {
      await TrainingDatasetService.updateDataset(datasetId, updates);
      await loadTrainingDatasets();
      addToast({ type: 'success', message: 'Dataset updated' });
    } catch {
      addToast({ type: 'error', message: 'Failed to update dataset' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTrainingDataset = async (datasetId: string) => {
    setLoading(true);
    try {
      await TrainingDatasetService.deleteDataset(datasetId);
      await loadTrainingDatasets();
      addToast({ type: 'success', message: 'Dataset deleted' });
    } catch {
      addToast({ type: 'error', message: 'Failed to delete dataset' });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (startDate?: string, endDate?: string) => {
    try {
      const data = await AnalyticsService.getAnalytics({ startDate, endDate });
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
  };

  return {
    dialogueFlows,
    entities,
    intents,
    trainingDatasets,
    trainingExamples,
    channels,
    analytics,
    handoffRules,
    agents,
    languages,
    settings,
    loading,
    toasts,
    loadDialogueFlows,
    createDialogueFlow,
    updateDialogueFlow,
    publishDialogueFlow,
    deleteDialogueFlow,
    loadEntities,
    createEntity,
    updateEntity,
    deleteEntity,
    loadIntents,
    createIntent,
    updateIntent,
    deleteIntent,
    loadTrainingDatasets,
    createTrainingDataset,
    updateTrainingDataset,
    deleteTrainingDataset,
    loadTrainingExamples,
    createTrainingExample,
    updateTrainingExample,
    deleteTrainingExample,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    testChannel,
    loadHandoffRules,
    createHandoffRule,
    updateHandoffRule,
    deleteHandoffRule,
    loadLanguages,
    createLanguage,
    enableLanguage,
    updateLanguage,
    deleteLanguage,
    loadSettings,
    updateSettings,
    loadAnalytics,
    addToast,
    removeToast,
  };
};
