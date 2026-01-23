import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export type ApprovalType = 'leave' | 'expense' | 'timesheet' | 'requisition' | 'document';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: string;
  requestedByAvatar: string;
  requestedByDepartment: string;
  requestedAt: string;
  dueDate?: string;
  priority: Priority;
  status: ApprovalStatus;
  amount?: number;
  metadata: Record<string, unknown>;
  attachments?: string[];
  comments?: ApprovalComment[];
}

export interface ApprovalComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ApprovalDecision {
  id: string;
  approvalId: string;
  decision: 'approved' | 'rejected';
  decidedBy: string;
  decidedAt: string;
  comment?: string;
}

export interface BulkActionResult {
  succeeded: number;
  failed: number;
  errors: { id: string; message: string }[];
}

export interface ApprovalCountByType {
  leave: number;
  expense: number;
  timesheet: number;
  requisition: number;
  document: number;
  total: number;
}

export interface ApprovalFilterParams {
  type?: ApprovalType;
  status?: ApprovalStatus;
  priority?: Priority;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
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
// API CLIENT
// ============================================================================

const BASE_PATH = '/api/v1/approvals';

const client = axios.create({
  baseURL: BASE_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// APPROVAL SERVICE
// ============================================================================

/**
 * Get pending approval items with optional filters
 */
export async function getPendingApprovals(
  params?: ApprovalFilterParams
): Promise<PaginatedResponse<ApprovalItem>> {
  const response = await client.get<PaginatedResponse<ApprovalItem>>('/pending', { params });
  return response.data;
}

/**
 * Get approval counts grouped by type
 */
export async function getApprovalCounts(): Promise<ApprovalCountByType> {
  const response = await client.get<ApprovalCountByType>('/counts');
  return response.data;
}

/**
 * Get a single approval item by ID
 */
export async function getApprovalById(id: string): Promise<ApprovalItem> {
  const response = await client.get<ApprovalItem>(`/${id}`);
  return response.data;
}

/**
 * Approve a single item
 */
export async function approveItem(id: string, comment?: string): Promise<ApprovalDecision> {
  const response = await client.post<ApprovalDecision>(`/${id}/approve`, { comment });
  return response.data;
}

/**
 * Reject a single item
 */
export async function rejectItem(id: string, reason: string): Promise<ApprovalDecision> {
  const response = await client.post<ApprovalDecision>(`/${id}/reject`, { reason });
  return response.data;
}

/**
 * Escalate an approval item
 */
export async function escalateItem(id: string, escalateTo: string, reason: string): Promise<void> {
  await client.post(`/${id}/escalate`, { escalateTo, reason });
}

/**
 * Bulk approve multiple items
 */
export async function bulkApprove(ids: string[], comment?: string): Promise<BulkActionResult> {
  const response = await client.post<BulkActionResult>('/bulk/approve', { ids, comment });
  return response.data;
}

/**
 * Bulk reject multiple items
 */
export async function bulkReject(ids: string[], reason: string): Promise<BulkActionResult> {
  const response = await client.post<BulkActionResult>('/bulk/reject', { ids, reason });
  return response.data;
}

/**
 * Get approval history with filters
 */
export async function getApprovalHistory(
  params?: ApprovalFilterParams
): Promise<PaginatedResponse<ApprovalItem>> {
  const response = await client.get<PaginatedResponse<ApprovalItem>>('/history', { params });
  return response.data;
}

/**
 * Add a comment to an approval item
 */
export async function addComment(id: string, content: string): Promise<ApprovalComment> {
  const response = await client.post<ApprovalComment>(`/${id}/comments`, { content });
  return response.data;
}

/**
 * Get leave-specific pending approvals
 */
export async function getLeaveApprovals(params?: Omit<ApprovalFilterParams, 'type'>): Promise<PaginatedResponse<ApprovalItem>> {
  return getPendingApprovals({ ...params, type: 'leave' });
}

/**
 * Get expense-specific pending approvals
 */
export async function getExpenseApprovals(params?: Omit<ApprovalFilterParams, 'type'>): Promise<PaginatedResponse<ApprovalItem>> {
  return getPendingApprovals({ ...params, type: 'expense' });
}

/**
 * Get timesheet-specific pending approvals
 */
export async function getTimesheetApprovals(params?: Omit<ApprovalFilterParams, 'type'>): Promise<PaginatedResponse<ApprovalItem>> {
  return getPendingApprovals({ ...params, type: 'timesheet' });
}

/**
 * Get requisition-specific pending approvals
 */
export async function getRequisitionApprovals(params?: Omit<ApprovalFilterParams, 'type'>): Promise<PaginatedResponse<ApprovalItem>> {
  return getPendingApprovals({ ...params, type: 'requisition' });
}

/**
 * Get document-specific pending approvals
 */
export async function getDocumentApprovals(params?: Omit<ApprovalFilterParams, 'type'>): Promise<PaginatedResponse<ApprovalItem>> {
  return getPendingApprovals({ ...params, type: 'document' });
}
