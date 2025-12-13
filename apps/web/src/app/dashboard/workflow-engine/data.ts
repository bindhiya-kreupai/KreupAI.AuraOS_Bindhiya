/**
 * Workflow Engine Module - Sample Data
 * Comprehensive sample workflows for immediate testing
 */

import { Workflow, ApprovalChain, Integration, DynamicForm } from './types';

// ============================================================================
// Sample Workflows
// ============================================================================

export const sampleWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    workflowCode: 'WF-LEAVE-001',
    workflowName: 'Leave Request Approval',
    category: 'leave_request',
    status: 'active',
    description: 'Standard leave request approval workflow with manager approval and HR notification',
    version: '1.0.0',

    nodes: [
      {
        id: 'node-start',
        type: 'start',
        label: 'Start',
        description: 'Employee submits leave request',
        x: 100,
        y: 100,
        config: {
          type: 'start',
          formId: 'form-leave-request',
          validateInput: true,
        },
      },
      {
        id: 'node-mgr-approval',
        type: 'approval',
        label: 'Manager Approval',
        description: 'Direct manager reviews and approves leave request',
        x: 300,
        y: 100,
        config: {
          type: 'approval',
          approvers: [
            {
              type: 'manager',
              managerLevel: 1,
              isRequired: true,
            },
          ],
          approvalType: 'any',
          allowComments: true,
          allowAttachments: false,
          escalation: {
            enabled: true,
            escalateAfter: 24,
            escalateTo: [
              {
                type: 'manager',
                managerLevel: 2,
                isRequired: true,
              },
            ],
            notifyOriginalApprover: true,
          },
          dueDate: {
            type: 'relative',
            relativeHours: 48,
          },
        },
      },
      {
        id: 'node-hr-notification',
        type: 'notification',
        label: 'Notify HR',
        description: 'Send notification to HR team',
        x: 500,
        y: 100,
        config: {
          type: 'notification',
          recipients: [
            {
              type: 'role',
              roleId: 'role-hr',
            },
          ],
          channel: 'email',
          template: {
            subject: 'Leave Request Approved - {{employeeName}}',
            body: 'Leave request for {{employeeName}} from {{startDate}} to {{endDate}} has been approved.',
            templateVariables: {
              employeeName: '{{input.employeeName}}',
              startDate: '{{input.startDate}}',
              endDate: '{{input.endDate}}',
            },
            format: 'html',
          },
        },
      },
      {
        id: 'node-end',
        type: 'end',
        label: 'End',
        description: 'Workflow completed',
        x: 700,
        y: 100,
        config: {
          type: 'end',
          outputMapping: {
            approved: 'true',
            approvedBy: '{{steps.mgr-approval.completedBy}}',
          },
        },
      },
    ],

    edges: [
      {
        id: 'edge-1',
        sourceNodeId: 'node-start',
        targetNodeId: 'node-mgr-approval',
      },
      {
        id: 'edge-2',
        sourceNodeId: 'node-mgr-approval',
        targetNodeId: 'node-hr-notification',
        condition: {
          id: 'cond-1',
          field: 'approved',
          operator: 'equals',
          value: true,
          valueType: 'static',
        },
      },
      {
        id: 'edge-3',
        sourceNodeId: 'node-hr-notification',
        targetNodeId: 'node-end',
      },
    ],

    startNodeId: 'node-start',
    endNodeIds: ['node-end'],

    triggers: [
      {
        id: 'trigger-1',
        triggerType: 'manual',
        enabled: true,
        config: {
          type: 'manual',
          allowedInitiators: 'all',
        },
      },
    ],

    allowParallel: true,
    maxConcurrentExecutions: 50,
    executionTimeout: 1440,
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 60,
      retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR'],
      backoffStrategy: 'exponential',
    },

    inputSchema: [
      {
        id: 'input-1',
        fieldName: 'employeeId',
        fieldType: 'string',
        label: 'Employee ID',
        required: true,
      },
      {
        id: 'input-2',
        fieldName: 'employeeName',
        fieldType: 'string',
        label: 'Employee Name',
        required: true,
      },
      {
        id: 'input-3',
        fieldName: 'leaveType',
        fieldType: 'string',
        label: 'Leave Type',
        required: true,
      },
      {
        id: 'input-4',
        fieldName: 'startDate',
        fieldType: 'date',
        label: 'Start Date',
        required: true,
      },
      {
        id: 'input-5',
        fieldName: 'endDate',
        fieldType: 'date',
        label: 'End Date',
        required: true,
      },
      {
        id: 'input-6',
        fieldName: 'reason',
        fieldType: 'string',
        label: 'Reason',
        required: true,
      },
    ],

    outputSchema: [
      {
        id: 'output-1',
        fieldName: 'approved',
        fieldType: 'boolean',
        source: '{{approved}}',
      },
      {
        id: 'output-2',
        fieldName: 'approvedBy',
        fieldType: 'string',
        source: '{{approvedBy}}',
      },
    ],

    variables: [],

    allowedRoles: ['employee', 'manager', 'hr'],
    allowedUsers: [],
    isPublic: true,

    notificationSettings: {
      notifyOnStart: true,
      notifyOnCompletion: true,
      notifyOnFailure: true,
      notifyOnApproval: true,
      notifyOnEscalation: true,
      recipients: [
        {
          type: 'initiator',
        },
      ],
      channels: ['email', 'in_app'],
    },

    totalExecutions: 342,
    successfulExecutions: 328,
    failedExecutions: 14,
    averageExecutionTime: 3600,
    lastExecutionDate: '2024-12-10T14:30:00Z',

    publishedVersion: '1.0.0',
    isDraft: false,

    createdBy: 'admin',
    createdByName: 'System Administrator',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-15T00:00:00Z',
    tags: ['hr', 'leave', 'approval'],
  },
];

// ============================================================================
// Sample Approval Chains
// ============================================================================

export const sampleApprovalChains: ApprovalChain[] = [
  {
    id: 'chain-001',
    chainCode: 'CHAIN-EXPENSE',
    chainName: 'Expense Approval Chain',
    description: 'Standard expense approval chain with amount-based routing',
    status: 'active',

    levels: [
      {
        id: 'level-1',
        levelNumber: 1,
        levelName: 'Manager Approval',
        approvers: [
          {
            type: 'manager',
            managerLevel: 1,
            isRequired: true,
          },
        ],
        approvalType: 'any',
        conditions: [
          {
            id: 'cond-1',
            field: 'amount',
            operator: 'less_than',
            value: 1000,
            valueType: 'static',
          },
        ],
        dueDate: {
          type: 'relative',
          relativeHours: 48,
        },
      },
      {
        id: 'level-2',
        levelNumber: 2,
        levelName: 'Director Approval',
        approvers: [
          {
            type: 'role',
            roleId: 'role-director',
            roleName: 'Director',
            isRequired: true,
          },
        ],
        approvalType: 'any',
        conditions: [
          {
            id: 'cond-2',
            field: 'amount',
            operator: 'greater_or_equal',
            value: 1000,
            valueType: 'static',
            logicalOperator: 'AND',
            children: [
              {
                id: 'cond-3',
                field: 'amount',
                operator: 'less_than',
                value: 5000,
                valueType: 'static',
              },
            ],
          },
        ],
        dueDate: {
          type: 'relative',
          relativeHours: 72,
        },
      },
      {
        id: 'level-3',
        levelNumber: 3,
        levelName: 'CFO Approval',
        approvers: [
          {
            type: 'role',
            roleId: 'role-cfo',
            roleName: 'CFO',
            isRequired: true,
          },
        ],
        approvalType: 'any',
        conditions: [
          {
            id: 'cond-4',
            field: 'amount',
            operator: 'greater_or_equal',
            value: 5000,
            valueType: 'static',
          },
        ],
        dueDate: {
          type: 'relative',
          relativeHours: 96,
        },
      },
    ],

    isSequential: true,
    allowParallelApprovals: false,
    requireAllLevels: false,
    autoApproveThreshold: 100,

    usedInWorkflows: ['wf-expense-001'],

    createdBy: 'admin',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-10T00:00:00Z',
  },
];

// ============================================================================
// Sample Integrations
// ============================================================================

export const sampleIntegrations: Integration[] = [
  {
    id: 'int-001',
    integrationName: 'Slack Notifications',
    integrationType: 'rest_api',
    status: 'active',
    description: 'Send notifications to Slack channels',

    connectionConfig: {
      baseUrl: 'https://slack.com/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },

    authentication: {
      type: 'bearer',
      credentials: {
        token: 'xoxb-your-slack-token',
      },
    },

    availableActions: [
      {
        id: 'action-1',
        actionName: 'Post Message',
        actionType: 'write',
        description: 'Post a message to a Slack channel',
        endpoint: '/chat.postMessage',
        method: 'POST',
        inputSchema: {
          channel: 'string',
          text: 'string',
          blocks: 'array',
        },
        outputSchema: {
          ok: 'boolean',
          ts: 'string',
        },
        sampleRequest: {
          channel: '#general',
          text: 'Hello from workflow!',
        },
        sampleResponse: {
          ok: true,
          ts: '1234567890.123456',
        },
      },
    ],

    testConnection: true,
    lastTestedDate: '2024-12-01T00:00:00Z',
    lastTestedStatus: 'success',

    usedInWorkflows: ['wf-001', 'wf-002'],

    createdBy: 'admin',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-05T00:00:00Z',
  },
];

// ============================================================================
// Sample Forms
// ============================================================================

export const sampleForms: DynamicForm[] = [
  {
    id: 'form-leave-request',
    formCode: 'FORM-LEAVE-001',
    formName: 'Leave Request Form',
    description: 'Standard form for submitting leave requests',
    status: 'active',
    version: '1.0.0',

    fields: [
      {
        id: 'field-1',
        fieldName: 'leaveType',
        fieldType: 'select',
        label: 'Leave Type',
        required: true,
        options: ['Annual Leave', 'Sick Leave', 'Unpaid Leave', 'Parental Leave'],
      },
      {
        id: 'field-2',
        fieldName: 'startDate',
        fieldType: 'date',
        label: 'Start Date',
        required: true,
      },
      {
        id: 'field-3',
        fieldName: 'endDate',
        fieldType: 'date',
        label: 'End Date',
        required: true,
      },
      {
        id: 'field-4',
        fieldName: 'reason',
        fieldType: 'text',
        label: 'Reason',
        required: true,
      },
      {
        id: 'field-5',
        fieldName: 'emergencyContact',
        fieldType: 'text',
        label: 'Emergency Contact',
        required: false,
      },
    ],

    layout: {
      type: 'single_column',
      sections: [
        {
          id: 'section-1',
          title: 'Leave Details',
          description: 'Please provide details of your leave request',
          fields: ['field-1', 'field-2', 'field-3', 'field-4'],
          collapsible: false,
          defaultCollapsed: false,
        },
        {
          id: 'section-2',
          title: 'Additional Information',
          description: 'Optional additional information',
          fields: ['field-5'],
          collapsible: true,
          defaultCollapsed: false,
        },
      ],
    },

    validationRules: [
      {
        id: 'rule-1',
        ruleName: 'End date after start date',
        condition: {
          id: 'cond-1',
          field: 'endDate',
          operator: 'greater_than',
          value: '{{startDate}}',
          valueType: 'variable',
        },
        errorMessage: 'End date must be after start date',
        validateOn: 'submit',
      },
    ],

    submitAction: 'workflow',
    submitWorkflowId: 'wf-001',

    allowedRoles: ['employee'],
    allowedUsers: [],

    createdBy: 'admin',
    createdDate: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-05T00:00:00Z',
  },
];
