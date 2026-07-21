/**
 * Rule-based workflow generation when no LLM is configured or providers fail.
 */

import type { WorkflowGeneratedStep, WorkflowGenerationResult } from './workflow-generator-types';

type Template = Omit<WorkflowGenerationResult, 'aiEnabled' | 'provider'>;

const ONBOARDING: Template = {
  name: 'New Hire Onboarding',
  description: 'Automated onboarding from hire date through IT setup and buddy assignment.',
  trigger: 'EMPLOYEE_HIRED',
  triggerEvent: 'New employee record created',
  steps: [
    { id: 'step-1', type: 'trigger', label: 'Trigger: New Hire Added', timing: 'Instant' },
    { id: 'step-2', type: 'action', label: 'Create IT provisioning ticket', timing: '+5 min' },
    {
      id: 'step-3',
      type: 'notification',
      label: 'Email: Welcome kit & first-day info',
      timing: '+1 hour',
    },
    { id: 'step-4', type: 'wait', label: 'Wait: 2 business days', timing: '+2 days' },
    { id: 'step-5', type: 'action', label: 'Assign onboarding buddy', timing: 'Manual' },
    {
      id: 'step-6',
      type: 'approval',
      label: 'Manager confirms day-1 checklist',
      timing: '+3 days',
    },
  ],
  efficiencyScore: 88,
  estimatedHoursSaved: 4.5,
  estimatedDurationMinutes: 4320,
  confidenceScore: 82,
  suggestions: [
    'Add document collection step',
    'Integrate with learning management for mandatory training',
  ],
};

const OFFBOARDING: Template = {
  name: 'Employee Offboarding',
  description: 'Resignation or termination workflow with exit interview and access revocation.',
  trigger: 'EMPLOYEE_SEPARATION',
  triggerEvent: 'Separation initiated',
  steps: [
    { id: 'step-1', type: 'trigger', label: 'Trigger: Resignation submitted', timing: 'Instant' },
    { id: 'step-2', type: 'notification', label: 'Notify manager & HRBP', timing: '+15 min' },
    { id: 'step-3', type: 'action', label: 'Schedule exit interview', timing: '+1 day' },
    { id: 'step-4', type: 'approval', label: 'HR reviews final settlement', timing: '+7 days' },
    { id: 'step-5', type: 'wait', label: 'Wait: 30 days notice period', timing: '+30 days' },
    {
      id: 'step-6',
      type: 'integration',
      label: 'Disable system access',
      timing: 'Last working day',
    },
    {
      id: 'step-7',
      type: 'notification',
      label: 'Send offboarding survey',
      timing: '+1 day after exit',
    },
  ],
  efficiencyScore: 91,
  estimatedHoursSaved: 6,
  estimatedDurationMinutes: 43200,
  confidenceScore: 85,
  suggestions: ['Add asset return checklist', 'Trigger knowledge transfer task for critical roles'],
};

const LEAVE: Template = {
  name: 'Leave Request Approval',
  description: 'Route leave requests through manager and HR based on duration and policy.',
  trigger: 'LEAVE_REQUESTED',
  triggerEvent: 'Employee submits leave request',
  steps: [
    { id: 'step-1', type: 'trigger', label: 'Trigger: Leave request submitted', timing: 'Instant' },
    { id: 'step-2', type: 'condition', label: 'Check balance & blackout dates', timing: 'Instant' },
    { id: 'step-3', type: 'approval', label: 'Manager approval', timing: '+4 hours' },
    { id: 'step-4', type: 'condition', label: 'Duration > 5 days?', timing: 'Instant' },
    { id: 'step-5', type: 'approval', label: 'HR approval (long leave)', timing: '+1 day' },
    {
      id: 'step-6',
      type: 'notification',
      label: 'Notify employee & payroll',
      timing: 'On approval',
    },
  ],
  efficiencyScore: 79,
  estimatedHoursSaved: 2,
  estimatedDurationMinutes: 1440,
  confidenceScore: 80,
  suggestions: ['Auto-approve eligible short leaves', 'Add calendar block for team visibility'],
};

const PERFORMANCE: Template = {
  name: 'Performance Improvement Plan',
  description: 'Structured PIP workflow from identification through review milestones.',
  trigger: 'PERFORMANCE_PIP_INITIATED',
  triggerEvent: 'Manager initiates PIP',
  steps: [
    { id: 'step-1', type: 'trigger', label: 'Trigger: PIP recommended', timing: 'Instant' },
    { id: 'step-2', type: 'approval', label: 'HRBP reviews PIP template', timing: '+1 day' },
    {
      id: 'step-3',
      type: 'notification',
      label: 'Schedule PIP discussion with employee',
      timing: '+2 days',
    },
    { id: 'step-4', type: 'wait', label: '30-day review checkpoint', timing: '+30 days' },
    { id: 'step-5', type: 'approval', label: 'Manager mid-point assessment', timing: 'Manual' },
    { id: 'step-6', type: 'wait', label: '60-day final review', timing: '+60 days' },
    { id: 'step-7', type: 'action', label: 'Close PIP or escalate', timing: 'Manual' },
  ],
  efficiencyScore: 84,
  estimatedHoursSaved: 5,
  estimatedDurationMinutes: 86400,
  confidenceScore: 78,
  suggestions: ['Attach policy citations', 'Link to coaching bot for manager scripts'],
};

const GENERIC: Template = {
  name: 'HR Approval Workflow',
  description: 'Generic multi-step HR approval with notifications.',
  trigger: 'HR_REQUEST',
  triggerEvent: 'HR request submitted',
  steps: [
    { id: 'step-1', type: 'trigger', label: 'Trigger: Request submitted', timing: 'Instant' },
    { id: 'step-2', type: 'approval', label: 'Line manager review', timing: '+4 hours' },
    { id: 'step-3', type: 'approval', label: 'HR review', timing: '+1 day' },
    {
      id: 'step-4',
      type: 'notification',
      label: 'Notify requester of outcome',
      timing: 'On decision',
    },
  ],
  efficiencyScore: 72,
  estimatedHoursSaved: 1.5,
  estimatedDurationMinutes: 1440,
  confidenceScore: 65,
  suggestions: [
    'Specify the request type for a tighter workflow',
    'Add SLA escalation for overdue approvals',
  ],
};

function pickTemplate(prompt: string): Template {
  const p = prompt.toLowerCase();
  if (/resign|exit|offboard|terminat|separation|leave company/.test(p)) return OFFBOARDING;
  if (/onboard|new hire|hire added|joining|welcome/.test(p)) return ONBOARDING;
  if (/leave|absence|vacation|pto|time off/.test(p)) return LEAVE;
  if (/pip|performance|underperform|improvement plan/.test(p)) return PERFORMANCE;
  return GENERIC;
}

export function generateWorkflowFallback(prompt: string): WorkflowGenerationResult {
  const template = pickTemplate(prompt.trim());
  const name =
    template === GENERIC && prompt.trim().length > 10
      ? `Workflow: ${prompt.trim().slice(0, 60)}${prompt.length > 60 ? '…' : ''}`
      : template.name;

  return {
    ...template,
    name,
    description:
      template === GENERIC && prompt.trim()
        ? `Auto-generated from: "${prompt.trim().slice(0, 120)}"`
        : template.description,
    aiEnabled: false,
    provider: 'rules',
  };
}

export function normalizeSteps(raw: unknown): WorkflowGeneratedStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s) => s && typeof s === 'object')
    .map((s, i) => {
      const step = s as Record<string, unknown>;
      const type = String(step.type || 'action') as WorkflowGeneratedStep['type'];
      const validTypes: WorkflowGeneratedStep['type'][] = [
        'trigger',
        'action',
        'approval',
        'condition',
        'notification',
        'wait',
        'integration',
      ];
      return {
        id: String(step.id || `step-${i + 1}`),
        type: validTypes.includes(type) ? type : 'action',
        label: String(step.label || `Step ${i + 1}`),
        description: step.description ? String(step.description) : undefined,
        timing: step.timing ? String(step.timing) : undefined,
        config:
          step.config && typeof step.config === 'object'
            ? (step.config as Record<string, unknown>)
            : undefined,
      };
    })
    .filter((s) => s.label.length > 0);
}
