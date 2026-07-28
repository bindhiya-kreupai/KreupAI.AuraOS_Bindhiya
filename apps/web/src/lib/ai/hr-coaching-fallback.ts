/**
 * HR coaching shared types and automation catalog for structured LLM output.
 */

export type AutomationAction = {
  id: string;
  type: 'navigate' | 'draft' | 'schedule' | 'execute' | 'workflow';
  label: string;
  description?: string;
  path?: string;
  payload?: Record<string, unknown>;
};

export type DecisionOption = {
  id: string;
  label: string;
  pros: string[];
  cons: string[];
  recommendation?: boolean;
};

export type CoachingResponse = {
  message: string;
  suggestions: string[];
  actions: AutomationAction[];
  decisions?: {
    title: string;
    context: string;
    options: DecisionOption[];
    recommendedAction?: string;
  };
  citations?: { title: string; source: string }[];
  automationsQueued?: { task: string; status: 'ready' | 'pending' }[];
};

/** Catalog of automations the AI may reference in structured output */
export const HR_AUTOMATION_CATALOG = [
  { id: 'draft-pip', type: 'draft', label: 'Draft PIP Template', payload: { templateType: 'pip' } },
  {
    id: 'draft-promo',
    type: 'draft',
    label: 'Draft Promotion Letter',
    payload: { templateType: 'promotion_letter' },
  },
  {
    id: 'draft-feedback',
    type: 'draft',
    label: 'Draft Feedback Script',
    payload: { templateType: 'feedback_script' },
  },
  {
    id: 'draft-mediation',
    type: 'draft',
    label: 'Draft Mediation Agenda',
    payload: { templateType: 'mediation_agenda' },
  },
  {
    id: 'draft-separation',
    type: 'draft',
    label: 'Draft Separation Checklist',
    payload: { templateType: 'separation_checklist' },
  },
  {
    id: 'nav-performance',
    type: 'navigate',
    label: 'Open Performance Module',
    path: '/dashboard/performance',
  },
  {
    id: 'nav-leave',
    type: 'navigate',
    label: 'Open Leave Approvals',
    path: '/dashboard/leave/approvals',
  },
  {
    id: 'nav-attrition',
    type: 'navigate',
    label: 'Open Attrition Predictor',
    path: '/dashboard/ai-automation/attrition-prediction',
  },
  {
    id: 'nav-recruitment',
    type: 'navigate',
    label: 'Open Recruitment',
    path: '/dashboard/recruitment',
  },
  {
    id: 'schedule-1on1',
    type: 'schedule',
    label: 'Schedule Manager 1-on-1',
    payload: { eventType: 'manager_coaching' },
  },
  {
    id: 'auto-approve',
    type: 'workflow',
    label: 'Auto-Approve Eligible Leave',
    payload: { workflow: 'leave_auto_approve' },
  },
  {
    id: 'retention-workflow',
    type: 'workflow',
    label: 'Trigger Retention Workflow',
    payload: { workflow: 'retention_playbook' },
  },
];
