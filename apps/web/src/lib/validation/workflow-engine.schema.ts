import { z } from 'zod';

export const createDefinitionSchema = z.object({
  processType: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  trigger: z.string().min(1).max(100),
  triggerEvent: z.string().optional(),
  nodes: z.array(z.record(z.unknown())).optional(),
  edges: z.array(z.record(z.unknown())).optional(),
});

export const updateDefinitionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  trigger: z.string().min(1).max(100).optional(),
  triggerEvent: z.string().optional(),
  processType: z.string().min(1).max(100).optional(),
  status: z.string().optional(),
  nodes: z.array(z.record(z.unknown())).optional(),
  edges: z.array(z.record(z.unknown())).optional(),
});

export const startWorkflowSchema = z.object({
  processType: z.string().min(1),
  definitionId: z.string().uuid().optional(),
  snapshotData: z.record(z.unknown()).default({}),
  variables: z.record(z.unknown()).default({}),
  documentRef: z.string().optional(),
  documentType: z.string().optional(),
});

export const taskActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'SEND_BACK', 'HOLD', 'RESUME']),
  reasonCode: z.string().optional(),
  comment: z.string().optional(),
  editedFields: z.record(z.unknown()).optional(),
});

export const delegateTaskSchema = z.object({
  toUserId: z.string().min(1),
  reason: z.string().min(1),
  untilDate: z.string().optional(),
});

export const reassignTaskSchema = z.object({
  toUserId: z.string().optional(),
  toRole: z.string().optional(),
  reason: z.string().min(1),
});

export const cancelInstanceSchema = z.object({
  reasonCode: z.string().optional(),
  comment: z.string().min(1),
});

export const inboxQuerySchema = z.object({
  processType: z.string().optional(),
  status: z.string().optional(),
  slaState: z.enum(['ON_TIME', 'WARNING', 'BREACHED']).optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const auditQuerySchema = z.object({
  eventType: z.string().optional(),
  actorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});
