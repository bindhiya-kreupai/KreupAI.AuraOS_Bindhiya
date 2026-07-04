// Chatbot Builder Module - Type Definitions

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'active' | 'inactive' | 'draft' | 'published' | 'archived';
export type NodeType =
  | 'message'
  | 'question'
  | 'condition'
  | 'action'
  | 'api_call'
  | 'handoff'
  | 'end';
export type ChannelType = 'web' | 'mobile' | 'slack' | 'teams' | 'whatsapp' | 'facebook' | 'sms';
export type IntentConfidence = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

// ============================================================================
// DIALOGUE DESIGNER
// ============================================================================

export interface DialogueFlow {
  flowId: string;
  flowName: string;
  description: string;
  category: string;
  nodes: DialogueNode[];
  connections: NodeConnection[];
  variables: FlowVariable[];
  isActive: boolean;
  version: string;
  createdBy: string;
  createdDate: Date;
  lastModifiedBy: string;
  lastModifiedDate: Date;
  publishedDate?: Date;
  status: Status;
  triggerIntents: string[];
  tags: string[];
}

export interface DialogueNode {
  nodeId: string;
  nodeType: NodeType;
  nodeName: string;
  position: { x: number; y: number };
  configuration: NodeConfiguration;
  nextNodes: string[];
  fallbackNode?: string;
}

export interface NodeConfiguration {
  // Message Node
  messageText?: string;
  messageType?: 'text' | 'image' | 'card' | 'carousel' | 'quick_reply';
  messageContent?: MessageContent;

  // Question Node
  questionText?: string;
  expectedInputType?: 'text' | 'number' | 'date' | 'email' | 'phone' | 'choice';
  validationRules?: ValidationRule[];
  retryLimit?: number;
  saveToVariable?: string;

  // Condition Node
  conditions?: Condition[];
  defaultPath?: string;

  // Action Node
  actionType?: 'set_variable' | 'call_api' | 'send_email' | 'create_ticket' | 'custom';
  actionConfig?: any;

  // API Call Node
  apiEndpoint?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  responseMapping?: ResponseMapping[];

  // Handoff Node
  handoffType?: 'human' | 'department' | 'skill';
  handoffTarget?: string;
  handoffMessage?: string;
  priority?: Priority;
}

export interface MessageContent {
  text?: string;
  imageUrl?: string;
  cards?: Card[];
  quickReplies?: QuickReply[];
  buttons?: Button[];
}

export interface Card {
  cardId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttons: Button[];
}

export interface Button {
  buttonId: string;
  label: string;
  type: 'postback' | 'url' | 'phone';
  value: string;
}

export interface QuickReply {
  replyId: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface ValidationRule {
  ruleId: string;
  ruleType: 'regex' | 'range' | 'length' | 'custom';
  rule: any;
  errorMessage: string;
}

export interface Condition {
  conditionId: string;
  variableName: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
  nextNode: string;
}

export interface ResponseMapping {
  sourceField: string;
  targetVariable: string;
  transformation?: string;
}

export interface NodeConnection {
  connectionId: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  condition?: string;
}

export interface FlowVariable {
  variableId: string;
  variableName: string;
  variableType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  description?: string;
  isRequired: boolean;
}

export interface FlowTest {
  testId: string;
  flowId: string;
  testName: string;
  testScenarios: TestScenario[];
  createdBy: string;
  createdDate: Date;
  lastRunDate?: Date;
  lastRunResult?: 'passed' | 'failed' | 'partial';
}

export interface TestScenario {
  scenarioId: string;
  scenarioName: string;
  userInputs: string[];
  expectedResponses: string[];
  assertions: Assertion[];
  status?: 'passed' | 'failed';
}

export interface Assertion {
  assertionId: string;
  assertionType: 'contains' | 'equals' | 'variable_set' | 'node_reached';
  expected: any;
  actual?: any;
  passed?: boolean;
}

// ============================================================================
// ENTITY MANAGEMENT
// ============================================================================

export interface Entity {
  entityId: string;
  entityName: string;
  entityType: 'system' | 'custom' | 'regex' | 'list';
  description: string;
  values: EntityValue[];
  fuzzyMatching: boolean;
  isCaseSensitive: boolean;
  status: Status;
  createdBy: string;
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface EntityValue {
  valueId: string;
  value: string;
  synonyms: string[];
  metadata?: Record<string, any>;
}

export interface EntityExtraction {
  extractionId: string;
  messageText: string;
  extractedEntities: ExtractedEntity[];
  confidence: number;
  timestamp: Date;
}

export interface ExtractedEntity {
  entityName: string;
  entityValue: string;
  confidence: number;
  startPosition: number;
  endPosition: number;
  metadata?: any;
}

export interface SystemEntity {
  entityName: string;
  entityType: 'date' | 'time' | 'number' | 'email' | 'phone' | 'url' | 'currency' | 'percentage';
  isEnabled: boolean;
  configuration?: any;
}

// ============================================================================
// INTENT LIBRARY
// ============================================================================

export interface Intent {
  intentId: string;
  intentName: string;
  displayName: string;
  description: string;
  category: string;
  trainingPhrases: TrainingPhrase[];
  responses: IntentResponse[];
  parameters: IntentParameter[];
  contexts: IntentContext[];
  priority: number;
  webhookEnabled: boolean;
  webhookUrl?: string;
  isActive: boolean;
  confidenceThreshold: number;
  createdBy: string;
  createdDate: Date;
  lastModifiedDate: Date;
  usageCount: number;
  averageConfidence: number;
}

export interface TrainingPhrase {
  phraseId: string;
  text: string;
  language: string;
  annotations: Annotation[];
  addedDate: Date;
}

export interface Annotation {
  annotationId: string;
  entityType: string;
  startPosition: number;
  endPosition: number;
  value: string;
}

export interface IntentResponse {
  responseId: string;
  responseType: 'text' | 'rich' | 'custom';
  content: any;
  language: string;
  channel?: ChannelType;
  conditions?: string[];
}

export interface IntentParameter {
  parameterId: string;
  parameterName: string;
  entityType: string;
  isRequired: boolean;
  prompts: string[];
  defaultValue?: any;
  isList: boolean;
}

export interface IntentContext {
  contextId: string;
  contextName: string;
  lifespan: number;
  parameters?: Record<string, any>;
}

export interface IntentMatch {
  matchId: string;
  userMessage: string;
  matchedIntent: string;
  confidence: number;
  extractedParameters: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

// ============================================================================
// TRAINING DATA
// ============================================================================

export interface TrainingDataset {
  datasetId: string;
  datasetName: string;
  description: string;
  language: string;
  totalExamples: number;
  intents: string[];
  entities: string[];
  createdBy: string;
  createdDate: Date;
  lastModifiedDate: Date;
  status: Status;
}

export interface TrainingExample {
  exampleId: string;
  text: string;
  intent: string;
  entities: TrainingEntity[];
  language: string;
  source: 'manual' | 'imported' | 'conversation' | 'augmented';
  addedBy: string;
  addedDate: Date;
  isValidated: boolean;
  validatedBy?: string;
}

export interface TrainingEntity {
  entityType: string;
  entityValue: string;
  startPosition: number;
  endPosition: number;
}

export interface ModelTraining {
  trainingId: string;
  modelVersion: string;
  datasetId: string;
  startTime: Date;
  endTime?: Date;
  status: 'queued' | 'training' | 'completed' | 'failed';
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainingMetrics?: TrainingMetrics;
  modelConfig: ModelConfig;
  errorLog?: string[];
}

export interface TrainingMetrics {
  totalExamples: number;
  trainingExamples: number;
  validationExamples: number;
  testExamples: number;
  epochs: number;
  learningRate: number;
  batchSize: number;
  confusionMatrix?: number[][];
  intentMetrics: IntentMetric[];
}

export interface IntentMetric {
  intentName: string;
  precision: number;
  recall: number;
  f1Score: number;
  supportCount: number;
}

export interface ModelConfig {
  algorithm: 'neural_network' | 'svm' | 'naive_bayes' | 'random_forest';
  maxEpochs: number;
  learningRate: number;
  batchSize: number;
  validationSplit: number;
  earlyStopping: boolean;
  customParameters?: Record<string, any>;
}

export interface DataAugmentation {
  augmentationId: string;
  sourceExampleId: string;
  technique: 'synonym_replacement' | 'paraphrase' | 'back_translation' | 'entity_swap';
  generatedExamples: string[];
  generatedDate: Date;
}

// ============================================================================
// MULTI-CHANNEL
// ============================================================================

export interface Channel {
  channelId: string;
  channelType: ChannelType;
  channelName: string;
  isEnabled: boolean;
  configuration: ChannelConfiguration;
  features: ChannelFeature[];
  createdDate: Date;
  lastSyncDate?: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface ChannelConfiguration {
  // Web Chat
  widgetColor?: string;
  widgetPosition?: 'bottom-right' | 'bottom-left';
  welcomeMessage?: string;
  placeholder?: string;

  // Slack
  slackBotToken?: string;
  slackAppToken?: string;
  slackWorkspaceId?: string;

  // Microsoft Teams
  teamsAppId?: string;
  teamsAppPassword?: string;
  tenantId?: string;

  // WhatsApp
  whatsappPhoneNumber?: string;
  whatsappApiKey?: string;
  whatsappWebhookUrl?: string;

  // Facebook Messenger
  facebookPageId?: string;
  facebookPageAccessToken?: string;
  facebookAppSecret?: string;

  // SMS
  smsProvider?: 'twilio' | 'nexmo' | 'aws_sns';
  smsPhoneNumber?: string;
  smsApiCredentials?: any;
}

export interface ChannelFeature {
  featureName: string;
  isSupported: boolean;
  limitations?: string[];
}

export interface ChannelMessage {
  messageId: string;
  channelId: string;
  channelType: ChannelType;
  direction: 'inbound' | 'outbound';
  sender: string;
  recipient: string;
  content: any;
  timestamp: Date;
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
  sessionId: string;
}

export interface MessageTemplate {
  templateId: string;
  templateName: string;
  channels: ChannelType[];
  content: any;
  variables: string[];
  isApproved: boolean;
  createdDate: Date;
}

// ============================================================================
// ANALYTICS DASHBOARD
// ============================================================================

export interface ConversationAnalytics {
  analyticsId: string;
  period: { start: Date; end: Date };
  totalConversations: number;
  totalMessages: number;
  totalIntents: number;
  totalEntities: number;
  totalFlows: number;
  averageConversationLength: number;
  averageResponseTime: number;
  userSatisfactionScore?: number;
  intentDistribution: IntentDistribution[];
  topIntents: TopIntent[];
  failedIntents: FailedIntent[];
  conversationMetrics: ConversationMetrics;
  channelBreakdown: ChannelBreakdown[];
  peakHours: PeakHour[];
  generatedDate: Date;
}

export interface IntentDistribution {
  intentName: string;
  count: number;
  percentage: number;
  averageConfidence: number;
}

export interface TopIntent {
  intentName: string;
  count: number;
  successRate: number;
  averageConfidence: number;
}

export interface FailedIntent {
  intentName: string;
  failureCount: number;
  failureRate: number;
  commonPhrases: string[];
}

export interface ConversationMetrics {
  completionRate: number;
  abandonmentRate: number;
  handoffRate: number;
  averageTurns: number;
  resolutionRate?: number;
}

export interface ChannelBreakdown {
  channelType: ChannelType;
  conversationCount: number;
  messageCount: number;
  averageSatisfaction?: number;
}

export interface PeakHour {
  hour: number;
  dayOfWeek: string;
  conversationCount: number;
}

export interface UserFeedback {
  feedbackId: string;
  sessionId: string;
  conversationId: string;
  rating: number; // 1-5
  feedbackType: 'positive' | 'negative' | 'neutral';
  comment?: string;
  tags: string[];
  timestamp: Date;
  followUpRequired: boolean;
}

export interface ConversationSession {
  sessionId: string;
  userId: string;
  channelType: ChannelType;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  intentsTriggered: string[];
  entitiesExtracted: Record<string, any>;
  wasHandedOff: boolean;
  satisfaction?: number;
  conversationFlow: string[];
  context: Record<string, any>;
  status: 'active' | 'completed' | 'abandoned';
}

// ============================================================================
// HANDOFF RULES
// ============================================================================

export interface HandoffRule {
  ruleId: string;
  ruleName: string;
  description: string;
  priority: number;
  isActive: boolean;
  triggers: HandoffTrigger[];
  conditions: HandoffCondition[];
  action: HandoffAction;
  createdBy: string;
  createdDate: Date;
  lastModifiedDate: Date;
}

export interface HandoffTrigger {
  triggerId: string;
  triggerType: 'intent' | 'sentiment' | 'keyword' | 'timeout' | 'failed_attempts' | 'user_request';
  triggerValue: any;
}

export interface HandoffCondition {
  conditionId: string;
  conditionType:
    | 'time_of_day'
    | 'day_of_week'
    | 'queue_capacity'
    | 'user_attribute'
    | 'conversation_length';
  operator: string;
  value: any;
}

export interface HandoffAction {
  targetType: 'department' | 'team' | 'agent' | 'skill' | 'queue';
  targetId: string;
  targetName: string;
  priority: Priority;
  message: string;
  includeConversationHistory: boolean;
  notifyUser: boolean;
  estimatedWaitTime?: number;
  fallbackAction?: string;
}

export interface HandoffQueue {
  queueId: string;
  queueName: string;
  department: string;
  currentSize: number;
  maxSize: number;
  averageWaitTime: number;
  availableAgents: number;
  status: 'active' | 'full' | 'paused';
}

export interface HandoffRequest {
  requestId: string;
  sessionId: string;
  userId: string;
  ruleId?: string;
  reason: string;
  requestedTime: Date;
  assignedAgent?: string;
  assignedTime?: Date;
  priority: Priority;
  queuePosition?: number;
  conversationHistory: ConversationMessage[];
  userContext: Record<string, any>;
  status: 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled';
  resolutionTime?: Date;
}

export interface ConversationMessage {
  messageId: string;
  sender: 'user' | 'bot' | 'agent';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export interface Agent {
  agentId: string;
  agentName: string;
  email: string;
  departments: string[];
  skills: string[];
  maxConcurrentChats: number;
  currentChats: number;
  status: 'available' | 'busy' | 'offline' | 'away';
  averageHandleTime: number;
  satisfactionRating: number;
}

// ============================================================================
// MULTI-LINGUAL
// ============================================================================

export interface Language {
  languageId: string;
  languageCode: string;
  languageName: string;
  isEnabled: boolean;
  isDefault: boolean;
  translationModel?: string;
  confidenceThreshold: number;
  supportedFeatures: string[];
}

export interface Translation {
  translationId: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  translationMethod: 'manual' | 'automatic' | 'hybrid';
  quality?: number;
  translatedBy?: string;
  translatedDate: Date;
  isApproved: boolean;
}

export interface LanguageContent {
  contentId: string;
  contentType: 'intent_response' | 'message' | 'button' | 'entity_value' | 'error_message';
  referenceId: string;
  translations: Record<string, string>; // languageCode -> text
  defaultLanguage: string;
  lastModifiedDate: Date;
}

export interface LanguageDetection {
  detectionId: string;
  text: string;
  detectedLanguage: string;
  confidence: number;
  alternativeLanguages: AlternativeLanguage[];
  timestamp: Date;
}

export interface AlternativeLanguage {
  languageCode: string;
  confidence: number;
}

export interface LocalizationSettings {
  settingsId: string;
  autoDetectLanguage: boolean;
  fallbackLanguage: string;
  supportedLanguages: string[];
  translationProvider: 'google' | 'azure' | 'aws' | 'custom';
  translationApiKey?: string;
  enableAutoTranslation: boolean;
  requireApprovalForAutoTranslation: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

// ============================================================================
// SHARED / COMMON TYPES
// ============================================================================

export interface ChatbotSettings {
  settingsId: string;
  botName: string;
  botAvatar?: string;
  defaultLanguage: string;
  enableLogging: boolean;
  logRetentionDays: number;
  enableAnalytics: boolean;
  confidenceThreshold: number;
  fallbackMessage: string;
  maxConversationTurns: number;
  sessionTimeoutMinutes: number;
  enableContextPersistence: boolean;
  enableSentimentAnalysis: boolean;
  enableSpellCheck: boolean;
  enableProfanityFilter: boolean;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
