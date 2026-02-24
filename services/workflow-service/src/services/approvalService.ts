export interface ApprovalRequest {
  id: string;
  workflowInstanceId: string;
  nodeId: string;
  type: 'single' | 'sequential' | 'parallel' | 'unanimous';
  title: string;
  description?: string;
  requestedBy: string;
  approvers: Approver[];
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  dueDate?: string;
  createdAt: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface Approver {
  userId: string;
  displayName: string;
  email: string;
  decision?: 'approved' | 'rejected' | 'abstained';
  comment?: string;
  decidedAt?: string;
  order?: number; // For sequential approvals
}

export interface CreateApprovalParams {
  workflowInstanceId: string;
  nodeId: string;
  type: 'single' | 'sequential' | 'parallel' | 'unanimous';
  title: string;
  description?: string;
  requestedBy: string;
  approvers: Omit<Approver, 'decision' | 'comment' | 'decidedAt'>[];
  dueDate?: string;
  metadata?: Record<string, unknown>;
}

export interface ResolveApprovalParams {
  approvalId: string;
  userId: string;
  decision: 'approved' | 'rejected' | 'abstained';
  comment?: string;
}

export interface ApprovalResult {
  approvalId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  resolvedBy?: string;
  resolvedAt?: string;
}

export class ApprovalService {
  private approvals: Map<string, ApprovalRequest> = new Map();

  /**
   * Create a new approval request
   */
  async createApproval(params: CreateApprovalParams): Promise<ApprovalRequest> {
    const approval: ApprovalRequest = {
      id: 'apr_' + Date.now().toString(),
      workflowInstanceId: params.workflowInstanceId,
      nodeId: params.nodeId,
      type: params.type,
      title: params.title,
      description: params.description,
      requestedBy: params.requestedBy,
      approvers: params.approvers.map((a) => ({
        ...a,
        decision: undefined,
        comment: undefined,
        decidedAt: undefined,
      })),
      status: 'pending',
      dueDate: params.dueDate,
      createdAt: new Date().toISOString(),
      metadata: params.metadata,
    };

    this.approvals.set(approval.id, approval);

    // TODO: Send notifications to approvers
    // TODO: Schedule expiry check if dueDate is set

    return approval;
  }

  /**
   * Resolve an approval (approve/reject) by a specific user
   */
  async resolveApproval(params: ResolveApprovalParams): Promise<ApprovalResult> {
    const approval = this.approvals.get(params.approvalId);

    if (!approval) {
      throw new Error('Approval not found: ' + params.approvalId);
    }

    if (approval.status !== 'pending') {
      throw new Error('Approval is no longer pending: ' + approval.status);
    }

    // Find the approver
    const approver = approval.approvers.find((a) => a.userId === params.userId);
    if (!approver) {
      throw new Error('User is not an approver for this request');
    }

    // Record the decision
    approver.decision = params.decision;
    approver.comment = params.comment;
    approver.decidedAt = new Date().toISOString();

    // Determine overall approval status based on type
    const newStatus = this.determineStatus(approval);
    approval.status = newStatus;

    if (newStatus !== 'pending') {
      approval.resolvedAt = new Date().toISOString();
    }

    return {
      approvalId: approval.id,
      status: newStatus,
      resolvedBy: newStatus !== 'pending' ? params.userId : undefined,
      resolvedAt: approval.resolvedAt,
    };
  }

  /**
   * Get an approval by ID
   */
  async getApproval(approvalId: string): Promise<ApprovalRequest | null> {
    return this.approvals.get(approvalId) || null;
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovals(userId: string): Promise<ApprovalRequest[]> {
    const pending: ApprovalRequest[] = [];
    for (const approval of this.approvals.values()) {
      if (approval.status === 'pending') {
        const isApprover = approval.approvers.some(
          (a) => a.userId === userId && !a.decision
        );
        if (isApprover) {
          pending.push(approval);
        }
      }
    }
    return pending;
  }

  /**
   * Cancel a pending approval
   */
  async cancelApproval(approvalId: string): Promise<boolean> {
    const approval = this.approvals.get(approvalId);
    if (approval && approval.status === 'pending') {
      approval.status = 'cancelled';
      approval.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Determine the overall status based on approval type and individual decisions
   */
  private determineStatus(approval: ApprovalRequest): 'pending' | 'approved' | 'rejected' {
    const decisions = approval.approvers.filter((a) => a.decision);

    switch (approval.type) {
      case 'single':
        // First decision wins
        if (decisions.length > 0) {
          return decisions[0].decision === 'approved' ? 'approved' : 'rejected';
        }
        return 'pending';

      case 'unanimous':
        // All must approve
        if (decisions.some((d) => d.decision === 'rejected')) {
          return 'rejected';
        }
        if (decisions.length === approval.approvers.length) {
          return 'approved';
        }
        return 'pending';

      case 'parallel':
        // Majority rules
        const approvedCount = decisions.filter((d) => d.decision === 'approved').length;
        const rejectedCount = decisions.filter((d) => d.decision === 'rejected').length;
        const majority = Math.ceil(approval.approvers.length / 2);

        if (approvedCount >= majority) return 'approved';
        if (rejectedCount >= majority) return 'rejected';
        return 'pending';

      case 'sequential':
        // Must be approved in order
        const currentOrder = decisions.length;
        const lastDecision = decisions[decisions.length - 1];
        if (lastDecision?.decision === 'rejected') return 'rejected';
        if (currentOrder === approval.approvers.length) return 'approved';
        return 'pending';

      default:
        return 'pending';
    }
  }
}

export default new ApprovalService();
