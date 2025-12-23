/**
 * Multi-Entity Management Service
 * Phase 4: Enterprise Expansion - Entity Hierarchy
 */

import {
  LegalEntity,
  EntityHierarchy,
  EntityTransfer,
  EntityType,
  EntityStatus,
} from './types';

/**
 * Multi-Entity Service
 */
export class EntityService {
  /**
   * Create legal entity
   */
  static async createEntity(
    entity: Omit<LegalEntity, 'id' | 'level' | 'path' | 'childCount' | 'employeeCount' | 'createdAt' | 'updatedAt'>
  ): Promise<LegalEntity> {
    // Calculate level and path
    let level = 0;
    let path = '/';

    if (entity.parentId) {
      const parent = await this.getEntityById(entity.parentId);
      if (parent) {
        level = parent.level + 1;
        path = `${parent.path}${parent.id}/`;
      }
    }

    const legalEntity: LegalEntity = {
      id: `ent_${Date.now()}`,
      ...entity,
      level,
      path: `${path}${entity.code}/`,
      childCount: 0,
      employeeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update parent's child count
    if (entity.parentId) {
      await this.incrementChildCount(entity.parentId);
    }

    // In production, save to database
    return legalEntity;
  }

  /**
   * Update legal entity
   */
  static async updateEntity(
    entityId: string,
    updates: Partial<LegalEntity>
  ): Promise<LegalEntity> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }

    const updated: LegalEntity = {
      ...entity,
      ...updates,
      id: entityId,
      updatedAt: new Date(),
    };

    // In production, save to database
    return updated;
  }

  /**
   * Get entity by ID
   */
  static async getEntityById(entityId: string): Promise<LegalEntity | null> {
    // In production, fetch from database
    return null;
  }

  /**
   * Get all entities for tenant
   */
  static async getEntities(
    tenantId: string,
    filters?: {
      type?: EntityType;
      status?: EntityStatus;
      parentId?: string;
      country?: string;
    }
  ): Promise<LegalEntity[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Get entity hierarchy
   */
  static async getEntityHierarchy(
    tenantId: string,
    rootEntityId?: string
  ): Promise<EntityHierarchy[]> {
    const entities = await this.getEntities(tenantId);

    const buildHierarchy = (parentId?: string): EntityHierarchy[] => {
      return entities
        .filter(e => e.parentId === parentId)
        .map(entity => ({
          entity,
          children: buildHierarchy(entity.id),
          stats: {
            totalEmployees: 0, // Calculate from employee service
            activeEmployees: 0,
            totalPayroll: 0,
            headcountChange: 0,
          },
        }));
    };

    return buildHierarchy(rootEntityId);
  }

  /**
   * Get entity children
   */
  static async getChildren(entityId: string): Promise<LegalEntity[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Get entity ancestors
   */
  static async getAncestors(entityId: string): Promise<LegalEntity[]> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      return [];
    }

    const ancestors: LegalEntity[] = [];
    const pathParts = entity.path.split('/').filter(Boolean);

    // In production, fetch all ancestors
    return ancestors;
  }

  /**
   * Increment child count
   */
  private static async incrementChildCount(entityId: string): Promise<void> {
    const entity = await this.getEntityById(entityId);
    if (entity) {
      entity.childCount++;
      // In production, update in database
    }
  }

  /**
   * Move entity to new parent
   */
  static async moveEntity(
    entityId: string,
    newParentId: string | null
  ): Promise<LegalEntity> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Validate no circular reference
    if (newParentId) {
      const newParent = await this.getEntityById(newParentId);
      if (newParent && newParent.path.includes(entityId)) {
        throw new Error('Cannot move entity under its own descendant');
      }
    }

    // Update paths for entity and all descendants
    const oldPath = entity.path;
    let newPath = '/';
    let newLevel = 0;

    if (newParentId) {
      const newParent = await this.getEntityById(newParentId);
      if (newParent) {
        newPath = `${newParent.path}${entity.code}/`;
        newLevel = newParent.level + 1;
      }
    }

    entity.parentId = newParentId || undefined;
    entity.path = newPath;
    entity.level = newLevel;
    entity.updatedAt = new Date();

    // In production, update entity and all descendants' paths

    return entity;
  }

  /**
   * Archive entity
   */
  static async archiveEntity(entityId: string): Promise<LegalEntity> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      throw new Error('Entity not found');
    }

    // Check for active employees
    if (entity.employeeCount > 0) {
      throw new Error('Cannot archive entity with active employees');
    }

    // Check for active children
    if (entity.childCount > 0) {
      throw new Error('Cannot archive entity with active child entities');
    }

    entity.status = 'ARCHIVED';
    entity.updatedAt = new Date();

    // In production, update in database
    return entity;
  }

  /**
   * Create employee transfer
   */
  static async createTransfer(
    transfer: Omit<EntityTransfer, 'id' | 'status' | 'approvals' | 'createdAt' | 'updatedAt'>
  ): Promise<EntityTransfer> {
    const entityTransfer: EntityTransfer = {
      id: `trans_${Date.now()}`,
      ...transfer,
      status: 'DRAFT',
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to database
    return entityTransfer;
  }

  /**
   * Submit transfer for approval
   */
  static async submitTransfer(transferId: string): Promise<EntityTransfer> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Get source and target entity for approval routing
    const sourceEntity = await this.getEntityById(transfer.sourceEntityId);
    const targetEntity = await this.getEntityById(transfer.targetEntityId);

    // Create approval chain
    const approvals: EntityTransfer['approvals'] = [
      {
        level: 1,
        approverId: 'source_manager', // Resolve from source entity
        approverName: 'Source Manager',
        approverRole: 'Manager',
        status: 'PENDING',
      },
      {
        level: 2,
        approverId: 'target_manager', // Resolve from target entity
        approverName: 'Target Manager',
        approverRole: 'Manager',
        status: 'PENDING',
      },
      {
        level: 3,
        approverId: 'hr_manager',
        approverName: 'HR Manager',
        approverRole: 'HR',
        status: 'PENDING',
      },
    ];

    transfer.status = 'PENDING';
    transfer.approvals = approvals;
    transfer.updatedAt = new Date();

    return transfer;
  }

  /**
   * Process transfer approval
   */
  static async processTransferApproval(
    transferId: string,
    approverId: string,
    action: 'APPROVE' | 'REJECT',
    comments?: string
  ): Promise<EntityTransfer> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    // Find approver's level
    const approval = transfer.approvals.find(a => a.approverId === approverId && a.status === 'PENDING');
    if (!approval) {
      throw new Error('Not authorized to approve this transfer');
    }

    approval.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    approval.comments = comments;
    approval.actionDate = new Date();

    if (action === 'REJECT') {
      transfer.status = 'REJECTED';
    } else {
      // Check if all approvals are complete
      const allApproved = transfer.approvals.every(a => a.status === 'APPROVED');
      if (allApproved) {
        transfer.status = 'APPROVED';
        // Execute transfer
        await this.executeTransfer(transfer);
        transfer.status = 'COMPLETED';
      }
    }

    transfer.updatedAt = new Date();

    return transfer;
  }

  /**
   * Execute approved transfer
   */
  private static async executeTransfer(transfer: EntityTransfer): Promise<void> {
    // Update employee's entity assignment
    // Update source entity employee count
    // Update target entity employee count
    // Create audit trail
    // Send notifications
  }

  /**
   * Get transfer by ID
   */
  static async getTransferById(transferId: string): Promise<EntityTransfer | null> {
    // In production, fetch from database
    return null;
  }

  /**
   * Get transfers
   */
  static async getTransfers(
    tenantId: string,
    filters?: {
      employeeId?: string;
      sourceEntityId?: string;
      targetEntityId?: string;
      status?: EntityTransfer['status'];
    }
  ): Promise<EntityTransfer[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Get entity statistics
   */
  static async getEntityStats(entityId: string): Promise<{
    employeeCount: number;
    activeEmployees: number;
    newHires: number;
    terminations: number;
    totalPayroll: number;
    headcountByDepartment: { department: string; count: number }[];
  }> {
    return {
      employeeCount: 0,
      activeEmployees: 0,
      newHires: 0,
      terminations: 0,
      totalPayroll: 0,
      headcountByDepartment: [],
    };
  }

  /**
   * Get consolidated view across entities
   */
  static async getConsolidatedView(
    tenantId: string,
    entityIds?: string[]
  ): Promise<{
    totalEmployees: number;
    totalPayroll: number;
    byEntity: Array<{
      entityId: string;
      entityName: string;
      employeeCount: number;
      payroll: number;
    }>;
    byCountry: Array<{
      country: string;
      employeeCount: number;
      payroll: number;
    }>;
  }> {
    return {
      totalEmployees: 0,
      totalPayroll: 0,
      byEntity: [],
      byCountry: [],
    };
  }
}
