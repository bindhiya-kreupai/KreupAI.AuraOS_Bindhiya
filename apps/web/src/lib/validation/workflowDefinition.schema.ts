import { z } from 'zod';

const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'end', 'approval', 'condition', 'email', 'webhook', 'wait']),
  label: z.string().min(1),
  config: z.record(z.unknown()).optional(),
  position: z.object({ x: z.number(), y: z.number() }),
});

const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
  condition: z.string().optional(),
});

export const workflowDefinitionSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(100),
  description: z.string().max(500).optional(),
  trigger: z.string().min(1, 'Trigger event is required'),
  nodes: z.array(workflowNodeSchema).min(2, 'Workflow must have at least start and end nodes'),
  edges: z.array(workflowEdgeSchema).min(1, 'Workflow must have at least one connection'),
  status: z.enum(['draft', 'active', 'inactive']).default('draft'),
});

export type WorkflowDefinitionFormData = z.infer<typeof workflowDefinitionSchema>;
