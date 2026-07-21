/**
 * Shared types for AI Workflow Generator (Process Automation — trigger layer).
 */

export type WorkflowStepType =
  | 'trigger'
  | 'action'
  | 'approval'
  | 'condition'
  | 'notification'
  | 'wait'
  | 'integration';

export type WorkflowGeneratedStep = {
  id: string;
  type: WorkflowStepType;
  label: string;
  description?: string;
  timing?: string;
  config?: Record<string, unknown>;
};

export type WorkflowGenerationResult = {
  name: string;
  description: string;
  trigger: string;
  triggerEvent?: string;
  steps: WorkflowGeneratedStep[];
  efficiencyScore: number;
  estimatedHoursSaved: number;
  estimatedDurationMinutes: number;
  confidenceScore: number;
  suggestions: string[];
  provider?: 'groq' | 'openai' | 'gemini' | 'rules';
  model?: string;
  aiEnabled: boolean;
};

export type WorkflowReactFlowNode = {
  id: string;
  type?: string;
  data: { label: string; stepType?: WorkflowStepType; description?: string };
  position: { x: number; y: number };
  style?: Record<string, unknown>;
};

export type WorkflowReactFlowEdge = {
  id: string;
  source: string;
  target: string;
  markerEnd?: { type: string };
  label?: string;
};

export type WorkflowCanvas = {
  nodes: WorkflowReactFlowNode[];
  edges: WorkflowReactFlowEdge[];
};

/** Workflow Engine definition node shape (aura_workflow_definition.nodes) */
export type WorkflowEngineNode = {
  id: string;
  type: 'start' | 'end' | 'approval' | 'condition' | 'email' | 'webhook' | 'wait';
  label: string;
  config?: Record<string, unknown>;
  position: { x: number; y: number };
};

export type WorkflowEngineEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
};
