import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'requisition' | 'document';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Priority = 'low' | 'medium' | 'high';

export type WorkflowStatus = 'draft' | 'active' | 'inactive';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  requestedByAvatar: string;
  requestedAt: string;
  priority: Priority;
  status: ApprovalStatus;
  metadata: Record<string, unknown>;
}

export interface BulkResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: string;
  currentNode: string;
  context: Record<string, unknown>;
  startedAt: string;
}

export interface FilterParams {
  type?: ApprovalType;
  status?: ApprovalStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API CLIENTS
// ============================================================================

const APPROVALS_BASE_PATH = '/api/v1/approvals';
const WORKFLOWS_BASE_PATH = '/api/v1/workflows';

const approvalsClient = axios.create({
  baseURL: APPROVALS_BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

const workflowsClient = axios.create({
  baseURL: WORKFLOWS_BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// APPROVAL SERVICE FUNCTIONS
// ============================================================================

/**
 * Get pending approval items with optional type filter and pagination
 */
export async function getPendingApprovals(params?: { type?: string; page?: number }): Promise<PaginatedResponse<ApprovalItem>> {
  const response = await approvalsClient.get<PaginatedResponse<ApprovalItem>>('/pending', { params });
  return response.data;
}

/**
 * Approve a single item with an optional comment
 */
export async function approveItem(id: string, comment?: string): Promise<void> {
  await approvalsClient.post(`/${id}/approve`, { comment });
}

/**
 * Reject a single item with a required reason
 */
export async function rejectItem(id: string, reason: string): Promise<void> {
  await approvalsClient.post(`/${id}/reject`, { reason });
}

/**
 * Bulk approve multiple items with an optional comment
 */
export async function bulkApprove(ids: string[], comment?: string): Promise<BulkResult> {
  const response = await approvalsClient.post<BulkResult>('/bulk/approve', { ids, comment });
  return response.data;
}

/**
 * Bulk reject multiple items with a required reason
 */
export async function bulkReject(ids: string[], reason: string): Promise<BulkResult> {
  const response = await approvalsClient.post<BulkResult>('/bulk/reject', { ids, reason });
  return response.data;
}

/**
 * Get approval history with pagination and filtering
 */
export async function getApprovalHistory(params?: FilterParams): Promise<PaginatedResponse<ApprovalItem>> {
  const response = await approvalsClient.get<PaginatedResponse<ApprovalItem>>('/history', { params });
  return response.data;
}

// ============================================================================
// WORKFLOW SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all workflow definitions
 */
export async function getWorkflowDefinitions(): Promise<WorkflowDefinition[]> {
  const response = await workflowsClient.get<WorkflowDefinition[]>('/');
  return response.data;
}

/**
 * Create a new workflow definition
 */
export async function createWorkflow(data: WorkflowDefinition): Promise<WorkflowDefinition> {
  const response = await workflowsClient.post<WorkflowDefinition>('/', data);
  return response.data;
}

/**
 * Update an existing workflow definition
 */
export async function updateWorkflow(id: string, data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
  const response = await workflowsClient.put<WorkflowDefinition>(`/${id}`, data);
  return response.data;
}

/**
 * Delete a workflow definition
 */
export async function deleteWorkflow(id: string): Promise<void> {
  await workflowsClient.delete(`/${id}`);
}

/**
 * Execute a workflow with a given context
 */
export async function executeWorkflow(id: string, context: Record<string, unknown>): Promise<WorkflowInstance> {
  const response = await workflowsClient.post<WorkflowInstance>(`/${id}/execute`, { context });
  return response.data;
}
