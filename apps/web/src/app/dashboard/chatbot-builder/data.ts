// Chatbot Builder Module - Sample Data

import type {
  DialogueFlow,
  FlowTest,
  Entity,
  Intent,
  TrainingDataset,
  TrainingExample,
  ModelTraining,
  Channel,
  MessageTemplate,
  ConversationAnalytics,
  HandoffRule,
  HandoffQueue,
  Agent,
  Language,
  LocalizationSettings,
  ChatbotSettings,
} from './types';

// ============================================================================
// DIALOGUE DESIGNER SAMPLE DATA
// ============================================================================

export const sampleDialogueFlows: DialogueFlow[] = [
  {
    flowId: 'flow-001',
    flowName: 'Leave Request Flow',
    description: 'Handles employee leave requests',
    category: 'HR Operations',
    nodes: [
      {
        nodeId: 'node-start',
        nodeType: 'message',
        nodeName: 'Welcome Message',
        position: { x: 100, y: 100 },
        configuration: {
          messageType: 'text',
          messageText: 'I can help you submit a leave request. What type of leave do you need?',
        },
        nextNodes: ['node-leave-type'],
      },
      {
        nodeId: 'node-leave-type',
        nodeType: 'question',
        nodeName: 'Leave Type Question',
        position: { x: 100, y: 250 },
        configuration: {
          questionText: 'Please select leave type:',
          expectedInputType: 'choice',
          saveToVariable: 'leave_type',
          messageContent: {
            quickReplies: [
              { replyId: 'qr-1', label: 'Vacation', value: 'vacation' },
              { replyId: 'qr-2', label: 'Sick Leave', value: 'sick' },
              { replyId: 'qr-3', label: 'Personal', value: 'personal' },
            ],
          },
        },
        nextNodes: ['node-dates'],
      },
      {
        nodeId: 'node-dates',
        nodeType: 'question',
        nodeName: 'Date Range',
        position: { x: 100, y: 400 },
        configuration: {
          questionText: 'Please provide start and end dates (YYYY-MM-DD)',
          expectedInputType: 'date',
          saveToVariable: 'leave_dates',
        },
        nextNodes: ['node-submit'],
      },
      {
        nodeId: 'node-submit',
        nodeType: 'action',
        nodeName: 'Submit Request',
        position: { x: 100, y: 550 },
        configuration: {
          actionType: 'call_api',
          apiEndpoint: '/api/leave/submit',
          httpMethod: 'POST',
        },
        nextNodes: ['node-confirmation'],
      },
      {
        nodeId: 'node-confirmation',
        nodeType: 'message',
        nodeName: 'Confirmation',
        position: { x: 100, y: 700 },
        configuration: {
          messageType: 'text',
          messageText: 'Your leave request has been submitted successfully!',
        },
        nextNodes: [],
      },
    ],
    connections: [
      { connectionId: 'conn-1', sourceNodeId: 'node-start', targetNodeId: 'node-leave-type' },
      { connectionId: 'conn-2', sourceNodeId: 'node-leave-type', targetNodeId: 'node-dates' },
      { connectionId: 'conn-3', sourceNodeId: 'node-dates', targetNodeId: 'node-submit' },
      { connectionId: 'conn-4', sourceNodeId: 'node-submit', targetNodeId: 'node-confirmation' },
    ],
    variables: [
      { variableId: 'var-1', variableName: 'leave_type', variableType: 'string', isRequired: true },
      {
        variableId: 'var-2',
        variableName: 'leave_dates',
        variableType: 'object',
        isRequired: true,
      },
    ],
    isActive: true,
    version: '1.0',
    createdBy: 'hr-admin',
    createdDate: new Date('2024-10-01'),
    lastModifiedBy: 'hr-admin',
    lastModifiedDate: new Date('2024-11-15'),
    publishedDate: new Date('2024-11-20'),
    status: 'published',
    triggerIntents: ['request_leave', 'apply_vacation'],
    tags: ['leave', 'hr', 'self-service'],
  },
];

export const sampleFlowTests: FlowTest[] = [
  {
    testId: 'test-001',
    flowId: 'flow-001',
    testName: 'Leave Request Happy Path',
    testScenarios: [
      {
        scenarioId: 'scenario-1',
        scenarioName: 'Vacation request',
        userInputs: ['I need time off', 'Vacation', '2025-01-15 to 2025-01-20'],
        expectedResponses: [
          'What type of leave',
          'provide start and end dates',
          'submitted successfully',
        ],
        assertions: [
          {
            assertionId: 'assert-1',
            assertionType: 'variable_set',
            expected: 'vacation',
          },
        ],
        status: 'passed',
      },
    ],
    createdBy: 'hr-admin',
    createdDate: new Date('2024-11-22'),
    lastRunDate: new Date('2024-12-01'),
    lastRunResult: 'passed',
  },
];

// ============================================================================
// ENTITY MANAGEMENT SAMPLE DATA
// ============================================================================

export const sampleEntities: Entity[] = [
  {
    entityId: 'entity-001',
    entityName: 'leave_type',
    entityType: 'list',
    description: 'Types of leave available',
    values: [
      { valueId: 'val-1', value: 'vacation', synonyms: ['holiday', 'PTO', 'time off'] },
      { valueId: 'val-2', value: 'sick', synonyms: ['medical', 'illness', 'sick leave'] },
      { valueId: 'val-3', value: 'personal', synonyms: ['personal day', 'personal leave'] },
      { valueId: 'val-4', value: 'maternity', synonyms: ['parental', 'maternity leave'] },
    ],
    fuzzyMatching: true,
    isCaseSensitive: false,
    status: 'active',
    createdBy: 'hr-admin',
    createdDate: new Date('2024-09-01'),
    lastModifiedDate: new Date('2024-10-15'),
  },
  {
    entityId: 'entity-002',
    entityName: 'department',
    entityType: 'list',
    description: 'Company departments',
    values: [
      { valueId: 'val-5', value: 'Engineering', synonyms: ['Tech', 'IT', 'Development'] },
      { valueId: 'val-6', value: 'Sales', synonyms: ['Business Development', 'Revenue'] },
      { valueId: 'val-7', value: 'HR', synonyms: ['Human Resources', 'People Ops'] },
      { valueId: 'val-8', value: 'Marketing', synonyms: ['Comms', 'Brand'] },
    ],
    fuzzyMatching: true,
    isCaseSensitive: false,
    status: 'active',
    createdBy: 'hr-admin',
    createdDate: new Date('2024-09-01'),
    lastModifiedDate: new Date('2024-09-15'),
  },
];

// ============================================================================
// INTENT LIBRARY SAMPLE DATA
// ============================================================================

export const sampleIntents: Intent[] = [
  {
    intentId: 'intent-001',
    intentName: 'request_leave',
    displayName: 'Request Leave',
    description: 'User wants to request time off',
    category: 'Leave Management',
    trainingPhrases: [
      {
        phraseId: 'phrase-1',
        text: 'I need time off',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
      {
        phraseId: 'phrase-2',
        text: 'I want to apply for vacation',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
      {
        phraseId: 'phrase-3',
        text: 'Can I request leave?',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
      {
        phraseId: 'phrase-4',
        text: 'I would like to take some days off',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
    ],
    responses: [
      {
        responseId: 'resp-1',
        responseType: 'text',
        content: 'I can help you with that! What type of leave do you need?',
        language: 'en',
      },
    ],
    parameters: [
      {
        parameterId: 'param-1',
        parameterName: 'leave_type',
        entityType: 'leave_type',
        isRequired: true,
        prompts: ['What type of leave do you need?'],
        isList: false,
      },
    ],
    contexts: [],
    priority: 10,
    webhookEnabled: false,
    isActive: true,
    confidenceThreshold: 0.7,
    createdBy: 'hr-admin',
    createdDate: new Date('2024-09-15'),
    lastModifiedDate: new Date('2024-11-01'),
    usageCount: 245,
    averageConfidence: 0.88,
  },
  {
    intentId: 'intent-002',
    intentName: 'check_balance',
    displayName: 'Check Leave Balance',
    description: 'User wants to check remaining leave balance',
    category: 'Leave Management',
    trainingPhrases: [
      {
        phraseId: 'phrase-5',
        text: 'How many days off do I have?',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
      {
        phraseId: 'phrase-6',
        text: 'Check my leave balance',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
      {
        phraseId: 'phrase-7',
        text: 'What is my PTO balance?',
        language: 'en',
        annotations: [],
        addedDate: new Date(),
      },
    ],
    responses: [
      {
        responseId: 'resp-2',
        responseType: 'text',
        content: 'Let me check your leave balance for you.',
        language: 'en',
      },
    ],
    parameters: [],
    contexts: [],
    priority: 8,
    webhookEnabled: true,
    webhookUrl: '/api/leave/balance',
    isActive: true,
    confidenceThreshold: 0.7,
    createdBy: 'hr-admin',
    createdDate: new Date('2024-09-20'),
    lastModifiedDate: new Date('2024-10-10'),
    usageCount: 312,
    averageConfidence: 0.91,
  },
];

// ============================================================================
// TRAINING DATA SAMPLE DATA
// ============================================================================

export const sampleTrainingDatasets: TrainingDataset[] = [
  {
    datasetId: 'dataset-001',
    datasetName: 'HR Assistant Training Set v1',
    description: 'Initial training data for HR chatbot',
    language: 'en',
    totalExamples: 1245,
    intents: ['request_leave', 'check_balance', 'update_profile', 'payroll_question'],
    entities: ['leave_type', 'department', 'date'],
    createdBy: 'hr-admin',
    createdDate: new Date('2024-08-01'),
    lastModifiedDate: new Date('2024-11-15'),
    status: 'published',
  },
];

export const sampleTrainingExamples: TrainingExample[] = [
  {
    exampleId: 'example-001',
    text: 'I need 3 days vacation next week',
    intent: 'request_leave',
    entities: [
      { entityType: 'leave_type', entityValue: 'vacation', startPosition: 12, endPosition: 20 },
    ],
    language: 'en',
    source: 'manual',
    addedBy: 'hr-admin',
    addedDate: new Date('2024-09-05'),
    isValidated: true,
    validatedBy: 'hr-manager',
  },
  {
    exampleId: 'example-002',
    text: 'How many sick days do I have left?',
    intent: 'check_balance',
    entities: [
      { entityType: 'leave_type', entityValue: 'sick', startPosition: 9, endPosition: 13 },
    ],
    language: 'en',
    source: 'conversation',
    addedBy: 'system',
    addedDate: new Date('2024-10-12'),
    isValidated: true,
    validatedBy: 'hr-admin',
  },
];

export const sampleModelTrainings: ModelTraining[] = [
  {
    trainingId: 'training-001',
    modelVersion: 'v1.2.0',
    datasetId: 'dataset-001',
    startTime: new Date('2024-11-20T10:00:00'),
    endTime: new Date('2024-11-20T11:30:00'),
    status: 'completed',
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.91,
    f1Score: 0.9,
    trainingMetrics: {
      totalExamples: 1245,
      trainingExamples: 870,
      validationExamples: 249,
      testExamples: 126,
      epochs: 50,
      learningRate: 0.001,
      batchSize: 32,
      intentMetrics: [
        {
          intentName: 'request_leave',
          precision: 0.91,
          recall: 0.93,
          f1Score: 0.92,
          supportCount: 285,
        },
        {
          intentName: 'check_balance',
          precision: 0.94,
          recall: 0.92,
          f1Score: 0.93,
          supportCount: 198,
        },
      ],
    },
    modelConfig: {
      algorithm: 'neural_network',
      maxEpochs: 100,
      learningRate: 0.001,
      batchSize: 32,
      validationSplit: 0.2,
      earlyStopping: true,
    },
  },
];

// ============================================================================
// MULTI-CHANNEL SAMPLE DATA
// ============================================================================

export const sampleChannels: Channel[] = [
  {
    channelId: 'channel-001',
    channelType: 'web',
    channelName: 'Web Chat Widget',
    isEnabled: true,
    configuration: {
      widgetColor: '#4F46E5',
      widgetPosition: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholder: 'Type your message...',
    },
    features: [
      { featureName: 'Rich Messages', isSupported: true },
      { featureName: 'File Upload', isSupported: true },
      { featureName: 'Typing Indicator', isSupported: true },
    ],
    createdDate: new Date('2024-09-01'),
    lastSyncDate: new Date('2024-12-01'),
    status: 'active',
  },
  {
    channelId: 'channel-002',
    channelType: 'slack',
    channelName: 'Slack Integration',
    isEnabled: true,
    configuration: {
      slackWorkspaceId: 'T1234567890',
    },
    features: [
      { featureName: 'Rich Messages', isSupported: true },
      { featureName: 'Interactive Buttons', isSupported: true },
    ],
    createdDate: new Date('2024-10-01'),
    lastSyncDate: new Date('2024-12-01'),
    status: 'active',
  },
];

export const sampleMessageTemplates: MessageTemplate[] = [
  {
    templateId: 'template-001',
    templateName: 'Welcome Message',
    channels: ['web', 'slack', 'teams'],
    content: {
      text: 'Welcome {{userName}}! I am your HR Assistant. How can I help you today?',
    },
    variables: ['userName'],
    isApproved: true,
    createdDate: new Date('2024-09-15'),
  },
];

// ============================================================================
// ANALYTICS SAMPLE DATA
// ============================================================================

export const sampleConversationAnalytics: ConversationAnalytics = {
  analyticsId: 'analytics-001',
  period: { start: new Date('2024-11-01'), end: new Date('2024-11-30') },
  totalConversations: 1245,
  totalMessages: 5832,
  averageConversationLength: 4.7,
  averageResponseTime: 0.8,
  userSatisfactionScore: 4.2,
  intentDistribution: [
    { intentName: 'request_leave', count: 385, percentage: 30.9, averageConfidence: 0.88 },
    { intentName: 'check_balance', count: 312, percentage: 25.1, averageConfidence: 0.91 },
    { intentName: 'payroll_question', count: 198, percentage: 15.9, averageConfidence: 0.85 },
  ],
  topIntents: [
    { intentName: 'request_leave', count: 385, successRate: 94.2, averageConfidence: 0.88 },
    { intentName: 'check_balance', count: 312, successRate: 96.5, averageConfidence: 0.91 },
  ],
  failedIntents: [
    {
      intentName: 'unknown',
      failureCount: 58,
      failureRate: 4.7,
      commonPhrases: ['What about...', 'I need help with...'],
    },
  ],
  conversationMetrics: {
    completionRate: 92.4,
    abandonmentRate: 7.6,
    handoffRate: 3.2,
    averageTurns: 4.7,
    resolutionRate: 89.5,
  },
  channelBreakdown: [
    { channelType: 'web', conversationCount: 856, messageCount: 4012, averageSatisfaction: 4.3 },
    { channelType: 'slack', conversationCount: 389, messageCount: 1820, averageSatisfaction: 4.1 },
  ],
  peakHours: [
    { hour: 9, dayOfWeek: 'Monday', conversationCount: 145 },
    { hour: 14, dayOfWeek: 'Wednesday', conversationCount: 132 },
  ],
  generatedDate: new Date('2024-12-01'),
};

// ============================================================================
// HANDOFF SAMPLE DATA
// ============================================================================

export const sampleHandoffRules: HandoffRule[] = [
  {
    ruleId: 'rule-001',
    ruleName: 'Escalate Complex Payroll Questions',
    description: 'Transfer to payroll specialist for complex queries',
    priority: 10,
    isActive: true,
    triggers: [
      { triggerId: 'trigger-1', triggerType: 'intent', triggerValue: 'complex_payroll_question' },
    ],
    conditions: [
      {
        conditionId: 'cond-1',
        conditionType: 'time_of_day',
        operator: 'between',
        value: { start: 9, end: 17 },
      },
    ],
    action: {
      targetType: 'department',
      targetId: 'dept-payroll',
      targetName: 'Payroll Team',
      priority: 'high',
      message: 'Transferring you to a payroll specialist...',
      includeConversationHistory: true,
      notifyUser: true,
      estimatedWaitTime: 5,
    },
    createdBy: 'hr-admin',
    createdDate: new Date('2024-10-01'),
    lastModifiedDate: new Date('2024-11-15'),
  },
];

export const sampleHandoffQueues: HandoffQueue[] = [
  {
    queueId: 'queue-001',
    queueName: 'General HR Support',
    department: 'HR',
    currentSize: 3,
    maxSize: 20,
    averageWaitTime: 4,
    availableAgents: 5,
    status: 'active',
  },
];

export const sampleAgents: Agent[] = [
  {
    agentId: 'agent-001',
    agentName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    departments: ['HR', 'Benefits'],
    skills: ['Leave Management', 'Benefits', 'Payroll'],
    maxConcurrentChats: 3,
    currentChats: 1,
    status: 'available',
    averageHandleTime: 8.5,
    satisfactionRating: 4.7,
  },
  {
    agentId: 'agent-002',
    agentName: 'Mike Chen',
    email: 'mike.chen@company.com',
    departments: ['Payroll'],
    skills: ['Payroll', 'Tax', 'Compensation'],
    maxConcurrentChats: 2,
    currentChats: 2,
    status: 'busy',
    averageHandleTime: 12.3,
    satisfactionRating: 4.5,
  },
];

// ============================================================================
// MULTI-LINGUAL SAMPLE DATA
// ============================================================================

export const sampleLanguages: Language[] = [
  {
    languageId: 'lang-001',
    languageCode: 'en',
    languageName: 'English',
    isEnabled: true,
    isDefault: true,
    confidenceThreshold: 0.7,
    supportedFeatures: ['intent_recognition', 'entity_extraction', 'sentiment_analysis'],
  },
  {
    languageId: 'lang-002',
    languageCode: 'es',
    languageName: 'Spanish',
    isEnabled: true,
    isDefault: false,
    translationModel: 'google-nmt',
    confidenceThreshold: 0.7,
    supportedFeatures: ['intent_recognition', 'entity_extraction'],
  },
  {
    languageId: 'lang-003',
    languageCode: 'fr',
    languageName: 'French',
    isEnabled: false,
    isDefault: false,
    translationModel: 'google-nmt',
    confidenceThreshold: 0.7,
    supportedFeatures: ['intent_recognition'],
  },
];

export const sampleLocalizationSettings: LocalizationSettings = {
  settingsId: 'loc-settings-001',
  autoDetectLanguage: true,
  fallbackLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr'],
  translationProvider: 'google',
  enableAutoTranslation: true,
  requireApprovalForAutoTranslation: true,
  lastUpdatedDate: new Date('2024-11-01'),
  lastUpdatedBy: 'hr-admin',
};

// ============================================================================
// SETTINGS SAMPLE DATA
// ============================================================================

export const sampleChatbotSettings: ChatbotSettings = {
  settingsId: 'settings-001',
  botName: 'HR Assistant',
  botAvatar: '/images/bot-avatar.png',
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
  lastUpdatedDate: new Date('2024-11-01'),
  lastUpdatedBy: 'hr-admin',
};
