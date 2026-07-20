/**
 * Convert generated workflow steps to React Flow canvas + Workflow Engine definition shapes.
 */

import type {
  WorkflowCanvas,
  WorkflowEngineEdge,
  WorkflowEngineNode,
  WorkflowGeneratedStep,
  WorkflowStepType,
} from './workflow-generator-types';

const NODE_STYLES: Record<WorkflowStepType, Record<string, unknown>> = {
  trigger: { background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' },
  action: { background: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' },
  approval: { background: '#f5f3ff', borderColor: '#8b5cf6', color: '#5b21b6' },
  condition: { background: '#fef3c7', borderColor: '#d97706', color: '#92400e' },
  notification: { background: '#ecfdf5', borderColor: '#10b981', color: '#065f46' },
  wait: { background: '#fff7ed', borderColor: '#f97316', color: '#9a3412' },
  integration: { background: '#f0f9ff', borderColor: '#0ea5e9', color: '#0c4a6e' },
};

const BASE_NODE_STYLE = {
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  background: 'white',
  fontSize: '13px',
  fontWeight: '600',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  minWidth: '180px',
  textAlign: 'left' as const,
};

function mapStepToEngineType(step: WorkflowGeneratedStep): WorkflowEngineNode['type'] {
  switch (step.type) {
    case 'trigger':
      return 'start';
    case 'approval':
      return 'approval';
    case 'condition':
      return 'condition';
    case 'notification':
      return 'email';
    case 'wait':
      return 'wait';
    case 'integration':
      return 'webhook';
    case 'action':
    default:
      return 'approval';
  }
}

export function stepsToCanvas(steps: WorkflowGeneratedStep[]): WorkflowCanvas {
  const nodes = steps.map((step, index) => {
    const y = index * 110;
    const x = 250;
    const style = { ...BASE_NODE_STYLE, ...NODE_STYLES[step.type] };
    return {
      id: step.id,
      type: step.type === 'trigger' ? 'input' : undefined,
      data: {
        label: step.label,
        stepType: step.type,
        description: step.description,
      },
      position: { x, y },
      style,
    };
  });

  const edges = steps.slice(0, -1).map((step, index) => ({
    id: `e-${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    markerEnd: { type: 'arrowclosed' },
  }));

  return { nodes, edges };
}

export function stepsToEngineDefinition(steps: WorkflowGeneratedStep[]): {
  nodes: WorkflowEngineNode[];
  edges: WorkflowEngineEdge[];
} {
  const engineSteps = [...steps];
  const last = engineSteps[engineSteps.length - 1];
  if (last && last.type !== 'trigger') {
    engineSteps.push({
      id: 'end',
      type: 'action',
      label: 'Complete',
      description: 'Workflow completed',
      timing: 'End',
    });
  }

  const nodes: WorkflowEngineNode[] = engineSteps.map((step, index) => {
    const engineType = step.id === 'end' ? 'end' : mapStepToEngineType(step);
    return {
      id: step.id,
      type: engineType,
      label: step.label,
      config: step.config,
      position: { x: 100 + index * 200, y: 200 },
    };
  });

  const edges: WorkflowEngineEdge[] = engineSteps.slice(0, -1).map((step, index) => ({
    id: `edge-${step.id}-${engineSteps[index + 1].id}`,
    source: step.id,
    target: engineSteps[index + 1].id,
  }));

  return { nodes, edges };
}

export function canvasFromStored(nodes: unknown, edges: unknown): WorkflowCanvas | null {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null;

  const reactNodes = nodes.map((n: Record<string, unknown>) => {
    if (n.data && n.position) {
      return n as WorkflowCanvas['nodes'][0];
    }
    const pos = (n.position as { x: number; y: number }) || {
      x: Number((n as { x?: number }).x) || 0,
      y: Number((n as { y?: number }).y) || 0,
    };
    const label = String(n.label || (n.data as { label?: string })?.label || 'Step');
    const stepType = (n.type as WorkflowStepType) || 'action';
    return {
      id: String(n.id),
      type: stepType === 'trigger' || n.type === 'start' ? 'input' : undefined,
      data: { label, stepType },
      position: pos,
      style: { ...BASE_NODE_STYLE, ...(NODE_STYLES[stepType] || NODE_STYLES.action) },
    };
  });

  const reactEdges = edges.map((e: Record<string, unknown>) => ({
    id: String(e.id),
    source: String(e.source || e.fromNode),
    target: String(e.target || e.toNode),
    markerEnd: { type: 'arrowclosed' },
    label: e.label ? String(e.label) : undefined,
  }));

  return { nodes: reactNodes, edges: reactEdges };
}
