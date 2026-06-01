import { BaseService } from './base.service';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'archived';
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'approval' | 'condition' | 'email' | 'webhook' | 'wait';
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentNodeId: string;
  context: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
}

export class WorkflowService extends BaseService {
  constructor() {
    super('WorkflowService');
  }

  async listWorkflows(tenantId: string): Promise<WorkflowDefinition[]> {
    const workflows = await this.prisma.workflowDefinition.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });

    return workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      nodes: (w.nodes as any[]) || [],
      edges: (w.edges as any[]) || [],
      status: w.status as WorkflowDefinition['status'],
      version: w.version,
      createdBy: w.createdBy,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));
  }

  async getWorkflowById(id: string): Promise<WorkflowDefinition | null> {
    const w = await this.prisma.workflowDefinition.findUnique({ where: { id } });
    if (!w) return null;
    return {
      id: w.id, name: w.name, description: w.description, nodes: (w.nodes as any[]) || [], edges: (w.edges as any[]) || [], status: w.status as WorkflowDefinition['status'], version: w.version, createdBy: w.createdBy, createdAt: w.createdAt, updatedAt: w.updatedAt,
    };
  }

  async createWorkflow(data: {
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    tenantId: string;
    createdBy: string;
  }): Promise<WorkflowDefinition> {
    const workflow = await this.prisma.workflowDefinition.create({
      data: {
        name: data.name,
        description: data.description,
        nodes: data.nodes as any,
        edges: data.edges as any,
        status: 'draft',
        version: 1,
        tenantId: data.tenantId,
        createdBy: data.createdBy,
      },
    });

    await this.createAuditLog({
      userId: data.createdBy,
      action: 'CREATE',
      module: 'Workflows',
      details: `Created workflow "${data.name}"`,
    });

    return {
      id: workflow.id, name: workflow.name, description: workflow.description, nodes: (workflow.nodes as any[]) || [], edges: (workflow.edges as any[]) || [], status: workflow.status as WorkflowDefinition['status'], version: workflow.version, createdBy: workflow.createdBy, createdAt: workflow.createdAt, updatedAt: workflow.updatedAt,
    };
  }

  async updateWorkflow(id: string, data: Partial<{
    name: string;
    description: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    status: WorkflowDefinition['status'];
  }>): Promise<WorkflowDefinition> {
    const workflow = await this.prisma.workflowDefinition.update({
      where: { id },
      data: { ...data, nodes: data.nodes as any, edges: data.edges as any, version: { increment: 1 } },
    });
    return {
      id: workflow.id, name: workflow.name, description: workflow.description, nodes: (workflow.nodes as any[]) || [], edges: (workflow.edges as any[]) || [], status: workflow.status as WorkflowDefinition['status'], version: workflow.version, createdBy: workflow.createdBy, createdAt: workflow.createdAt, updatedAt: workflow.updatedAt,
    };
  }

  async deleteWorkflow(id: string, userId: string): Promise<void> {
    await this.prisma.workflowDefinition.delete({ where: { id } });
    await this.createAuditLog({
      userId,
      action: 'DELETE',
      module: 'Workflows',
      details: `Deleted workflow ${id}`,
    });
  }

  async executeWorkflow(definitionId: string, context: Record<string, unknown>, triggeredBy: string): Promise<WorkflowInstance> {
    const definition = await this.getWorkflowById(definitionId);
    if (!definition) throw new Error('Workflow not found');
    if (definition.status !== 'active') throw new Error('Workflow is not active');

    const startNode = definition.nodes.find((n) => n.type === 'start');
    if (!startNode) throw new Error('Workflow has no start node');

    const instance = await this.prisma.workflowInstance.create({
      data: {
        definitionId,
        status: 'running',
        currentNodeId: startNode.id,
        context: context as any,
        triggeredBy,
        startedAt: new Date(),
      },
    });

    this.logger.info('Workflow execution started', { instanceId: instance.id, definitionId });

    // Process nodes asynchronously (in production, this would be a background job)
    this.processWorkflowStep(instance.id, definition).catch((err) => {
      this.logger.error('Workflow execution error', { instanceId: instance.id, error: err });
    });

    return {
      id: instance.id,
      definitionId: instance.definitionId,
      status: instance.status as WorkflowInstance['status'],
      currentNodeId: instance.currentNodeId,
      context: instance.context as Record<string, unknown>,
      startedAt: instance.startedAt,
      triggeredBy: instance.triggeredBy,
    };
  }

  private async processWorkflowStep(instanceId: string, definition: WorkflowDefinition): Promise<void> {
    const instance = await this.prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance || instance.status !== 'running') return;

    const currentNode = definition.nodes.find((n) => n.id === instance.currentNodeId);
    if (!currentNode) return;

    if (currentNode.type === 'end') {
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'completed', completedAt: new Date() },
      });
      return;
    }

    // Find next edge
    const nextEdge = definition.edges.find((e) => e.source === currentNode.id);
    if (!nextEdge) {
      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'failed' },
      });
      return;
    }

    // Move to next node
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { currentNodeId: nextEdge.target },
    });
  }

  async getInstanceById(id: string): Promise<WorkflowInstance | null> {
    const instance = await this.prisma.workflowInstance.findUnique({ where: { id } });
    if (!instance) return null;
    return {
      id: instance.id, definitionId: instance.definitionId, status: instance.status as WorkflowInstance['status'], currentNodeId: instance.currentNodeId, context: instance.context as Record<string, unknown>, startedAt: instance.startedAt, completedAt: instance.completedAt || undefined, triggeredBy: instance.triggeredBy,
    };
  }
}

export const workflowService = new WorkflowService();
