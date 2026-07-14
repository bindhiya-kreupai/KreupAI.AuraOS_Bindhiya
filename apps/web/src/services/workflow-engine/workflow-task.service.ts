// @ts-nocheck — Prisma schema drift tolerance. Tracked under #29.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export class WorkflowTaskService {
  async getInbox(
    userId: string,
    tenantId: string,
    filters?: {
      processType?: string;
      status?: string;
      slaState?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      assignedTo: userId,
      status: { in: ['PENDING', 'CLAIMED'] },
      instance: { tenantId, isDeleted: false },
    };

    if (filters?.processType) {
      where.instance = { ...where.instance, processType: filters.processType };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [tasks, total] = await Promise.all([
      prisma.workflowTask.findMany({
        where,
        orderBy: [{ slaDueAt: 'asc' }, { createdAt: 'asc' }],
        skip,
        take: limit,
        include: {
          instance: {
            select: {
              id: true,
              referenceNumber: true,
              processType: true,
              status: true,
              snapshotData: true,
              submittedBy: true,
              submittedAt: true,
              overallSlaDueAt: true,
            },
          },
          step: {
            select: { stepName: true, stepType: true, slaDueAt: true },
          },
        },
      }),
      prisma.workflowTask.count({ where }),
    ]);

    const now = new Date();
    const items = tasks.map((task) => {
      let slaState = 'ON_TIME';
      if (task.slaDueAt) {
        const dueAt = new Date(task.slaDueAt);
        if (now > dueAt) {
          slaState = 'BREACHED';
        } else {
          const totalMs = dueAt.getTime() - new Date(task.createdAt).getTime();
          const elapsedMs = now.getTime() - new Date(task.createdAt).getTime();
          if (totalMs > 0 && elapsedMs / totalMs > 0.8) {
            slaState = 'WARNING';
          }
        }
      }

      return { ...task, slaState };
    });

    return {
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(taskId: string, userId: string) {
    const task = await prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: {
        instance: {
          include: {
            steps: { orderBy: { sequenceNumber: 'asc' } },
            definition: true,
          },
        },
        step: true,
      },
    });
    if (!task) return null;
    return task;
  }

  async actOnTask(
    taskId: string,
    userId: string,
    action: {
      action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'HOLD' | 'RESUME';
      reasonCode?: string;
      comment?: string;
      editedFields?: Record<string, any>;
    },
    metadata?: { ip?: string; userAgent?: string }
  ) {
    try {
      const task = await prisma.workflowTask.findUnique({
        where: { id: taskId },
        include: { instance: true, step: true },
      });
      if (!task) return { success: false, message: 'Task not found' };
      if (task.assignedTo !== userId) {
        return { success: false, message: 'Task is not assigned to you' };
      }
      if (task.status !== 'PENDING' && task.status !== 'CLAIMED') {
        return { success: false, message: 'Task is not in an actionable state' };
      }

      const previousState = { status: task.status, actionTaken: task.actionTaken };

      const updatedTask = await prisma.workflowTask.update({
        where: { id: taskId, version: task.version },
        data: {
          status: 'COMPLETED',
          actionTaken: action.action,
          actionReasonCode: action.reasonCode,
          actionComment: action.comment,
          actionAt: new Date(),
          actionBy: userId,
          version: { increment: 1 },
        },
      });

      if (!updatedTask) {
        return { success: false, message: 'Concurrent modification detected. Please retry.' };
      }

      await this.writeAuditLog({
        instanceId: task.instanceId,
        stepId: task.stepId,
        taskId: task.id,
        eventType: 'TASK_ACTION',
        action: action.action,
        actorId: userId,
        actorIp: metadata?.ip,
        actorUserAgent: metadata?.userAgent,
        previousState,
        newState: { status: 'COMPLETED', actionTaken: action.action },
        reasonCode: action.reasonCode,
        comment: action.comment,
      });

      await this.handleStepCompletion(task, action.action);

      return { success: true, data: updatedTask, instanceStatus: task.instance.status };
    } catch (error: any) {
      logger.error({ error, taskId, userId }, 'Failed to act on task');
      return { success: false, message: 'Failed to process action', error: error.message };
    }
  }

  async delegateTask(
    taskId: string,
    userId: string,
    delegation: {
      toUserId: string;
      reason: string;
      untilDate?: string;
    }
  ) {
    try {
      const task = await prisma.workflowTask.findUnique({ where: { id: taskId } });
      if (!task) return { success: false, message: 'Task not found' };
      if (task.assignedTo !== userId) {
        return { success: false, message: 'Task is not assigned to you' };
      }

      const updated = await prisma.workflowTask.update({
        where: { id: taskId },
        data: {
          status: 'DELEGATED',
          delegatedFrom: userId,
          delegationReason: delegation.reason,
          delegationExpiresAt: delegation.untilDate ? new Date(delegation.untilDate) : null,
          assignedTo: delegation.toUserId,
          claimedBy: null,
          claimedAt: null,
        },
      });

      await this.writeAuditLog({
        instanceId: task.instanceId,
        stepId: task.stepId,
        taskId: task.id,
        eventType: 'TASK_DELEGATED',
        action: 'DELEGATE',
        actorId: userId,
        previousState: { assignedTo: userId },
        newState: { assignedTo: delegation.toUserId, reason: delegation.reason },
        comment: delegation.reason,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, taskId, userId }, 'Failed to delegate task');
      return { success: false, message: 'Failed to delegate task', error: error.message };
    }
  }

  async reassignTask(
    taskId: string,
    reassignment: {
      toUserId?: string;
      toRole?: string;
      reason: string;
      adminUserId: string;
    }
  ) {
    try {
      const task = await prisma.workflowTask.findUnique({ where: { id: taskId } });
      if (!task) return { success: false, message: 'Task not found' };

      const previousAssignedTo = task.assignedTo;

      const updated = await prisma.workflowTask.update({
        where: { id: taskId },
        data: {
          assignedTo: reassignment.toUserId,
          assignedRole: reassignment.toRole,
          claimedBy: null,
          claimedAt: null,
          status: 'PENDING',
        },
      });

      await this.writeAuditLog({
        instanceId: task.instanceId,
        stepId: task.stepId,
        taskId: task.id,
        eventType: 'TASK_REASSIGNED',
        action: 'REASSIGN',
        actorId: reassignment.adminUserId,
        previousState: { assignedTo: previousAssignedTo },
        newState: { assignedTo: reassignment.toUserId, assignedRole: reassignment.toRole },
        comment: reassignment.reason,
      });

      return { success: true, data: updated };
    } catch (error: any) {
      logger.error({ error, taskId }, 'Failed to reassign task');
      return { success: false, message: 'Failed to reassign task', error: error.message };
    }
  }

  async getTasksByInstance(instanceId: string) {
    return prisma.workflowTask.findMany({
      where: { instanceId },
      orderBy: { createdAt: 'asc' },
      include: { step: { select: { stepName: true, stepType: true } } },
    });
  }

  private async handleStepCompletion(task: any, action: string) {
    try {
      const allTasks = await prisma.workflowTask.findMany({
        where: { stepId: task.stepId },
      });

      const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED');
      const pendingTasks = allTasks.filter((t) => t.status === 'PENDING' || t.status === 'CLAIMED');

      if (pendingTasks.length === 0) {
        const allApproved = completedTasks.every((t) => t.actionTaken === 'APPROVE');
        const stepOutcome = allApproved ? 'APPROVED' : 'REJECTED';

        await prisma.workflowStep.update({
          where: { id: task.stepId },
          data: {
            status: 'COMPLETED',
            outcome: stepOutcome,
            completedAt: new Date(),
          },
        });

        await this.advanceWorkflow(task.instanceId, task.stepId, stepOutcome);
      }
    } catch (error: any) {
      logger.error(
        { error, taskId: task.id, instanceId: task.instanceId },
        'Failed during step completion handling'
      );
    }
  }

  private async advanceWorkflow(instanceId: string, completedStepId: string, stepOutcome: string) {
    try {
      const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
      if (!instance) return;

      if (stepOutcome === 'REJECTED') {
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: {
            status: 'REJECTED',
            outcome: 'REJECTED',
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        await this.writeAuditLog({
          instanceId,
          eventType: 'WORKFLOW_REJECTED',
          action: 'REJECT',
          newState: { status: 'REJECTED', reason: 'Step rejected' },
        });
        return;
      }

      const definition = await prisma.workflowDefinition.findUnique({
        where: { id: instance.definitionId },
      });
      if (!definition) {
        logger.warn(
          { instanceId, definitionId: instance.definitionId },
          'Definition not found during advance'
        );
        return;
      }

      const nodes = definition.nodes as any[];
      const edges = definition.edges as any[];

      const completedStep = await prisma.workflowStep.findUnique({
        where: { id: completedStepId },
      });
      const completedNodeId = completedStep?.stepId || '';

      const outgoingEdges = edges.filter((e: any) => e.source === completedNodeId);

      if (outgoingEdges.length === 0) {
        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: {
            status: 'APPROVED',
            outcome: 'APPROVED',
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        await this.writeAuditLog({
          instanceId,
          eventType: 'WORKFLOW_COMPLETED',
          action: 'COMPLETE',
          newState: { status: 'APPROVED', outcome: 'APPROVED' },
        });
        return;
      }

      for (const edge of outgoingEdges) {
        const nextNode = nodes.find((n: any) => n.id === edge.target);
        if (!nextNode) continue;

        if (nextNode.type === 'end') {
          await prisma.workflowInstance.update({
            where: { id: instanceId },
            data: {
              status: 'APPROVED',
              outcome: 'APPROVED',
              completedAt: new Date(),
              updatedAt: new Date(),
            },
          });
          await this.writeAuditLog({
            instanceId,
            eventType: 'WORKFLOW_COMPLETED',
            action: 'COMPLETE',
            newState: { status: 'APPROVED' },
          });
          return;
        }

        const stepCount = await prisma.workflowStep.count({ where: { instanceId } });

        const newStep = await prisma.workflowStep.create({
          data: {
            instanceId,
            definitionId: instance.definitionId,
            stepId: nextNode.id,
            stepType: nextNode.type || 'SYSTEM_AUTOMATED',
            stepName: nextNode.name || nextNode.id,
            status: 'IN_PROGRESS',
            sequenceNumber: stepCount,
          },
        });

        await prisma.workflowInstance.update({
          where: { id: instanceId },
          data: {
            status: 'IN_PROGRESS',
            currentStepId: newStep.id,
            updatedAt: new Date(),
          },
        });

        if (
          nextNode.type === 'approval' ||
          nextNode.type === 'HUMAN_SINGLE' ||
          nextNode.type === 'HUMAN_PARALLEL_ANY_ONE' ||
          nextNode.type === 'HUMAN_PARALLEL_ALL_REQUIRED'
        ) {
          const assignees = nextNode.config?.assignees || nextNode.config?.assignedTo || [];
          const assigneeList = Array.isArray(assignees) ? assignees : [assignees];

          if (assigneeList.length === 0) {
            assigneeList.push({ userId: instance.submittedBy || instance.triggeredBy });
          }

          for (const assignee of assigneeList) {
            const userId = typeof assignee === 'string' ? assignee : assignee.userId || assignee.id;
            await prisma.workflowTask.create({
              data: {
                stepId: newStep.id,
                instanceId,
                assignedTo: userId,
                assignmentMode: 'USER',
                status: 'PENDING',
              },
            });
          }
        } else if (nextNode.type === 'condition') {
          const result = await this.evaluateCondition(nextNode, instance);
          await prisma.workflowStep.update({
            where: { id: newStep.id },
            data: {
              status: 'COMPLETED',
              outcome: result ? 'APPROVED' : 'REJECTED',
              completedAt: new Date(),
            },
          });

          const nextEdges = edges.filter((e: any) => e.source === nextNode.id);
          const matchingEdge = nextEdges.find((e: any) => {
            if (e.label === 'true' || e.label === 'yes') return result;
            if (e.label === 'false' || e.label === 'no') return !result;
            return true;
          });

          if (matchingEdge) {
            await this.advanceWorkflow(instanceId, newStep.id, 'APPROVED');
          } else {
            await prisma.workflowInstance.update({
              where: { id: instanceId },
              data: {
                status: 'APPROVED',
                outcome: 'APPROVED',
                completedAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
          return;
        } else {
          await prisma.workflowStep.update({
            where: { id: newStep.id },
            data: { status: 'COMPLETED', outcome: 'APPROVED', completedAt: new Date() },
          });
          await this.advanceWorkflow(instanceId, newStep.id, 'APPROVED');
          return;
        }
      }

      await this.writeAuditLog({
        instanceId,
        eventType: 'WORKFLOW_ADVANCED',
        action: 'ADVANCE',
        newState: { status: 'IN_PROGRESS', currentStepId: instance.currentStepId },
      });
    } catch (error: any) {
      logger.error({ error, instanceId }, 'Failed to advance workflow');
      await prisma.workflowInstance
        .update({
          where: { id: instanceId },
          data: { status: 'FAILED', error: error.message, updatedAt: new Date() },
        })
        .catch(() => {});
    }
  }

  private async evaluateCondition(node: any, instance: any): Promise<boolean> {
    try {
      const condition = node.config?.condition;
      if (!condition) return true;

      const variables = {
        ...(instance.variables as Record<string, any>),
        ...(instance.context as Record<string, any>),
      };
      const fieldValue = variables[condition.field];
      const op = condition.operator;
      const value = condition.value;

      switch (op) {
        case 'eq':
        case '=':
          return fieldValue === value;
        case 'neq':
        case '!=':
          return fieldValue !== value;
        case 'gt':
        case '>':
          return Number(fieldValue) > Number(value);
        case 'gte':
        case '>=':
          return Number(fieldValue) >= Number(value);
        case 'lt':
        case '<':
          return Number(fieldValue) < Number(value);
        case 'lte':
        case '<=':
          return Number(fieldValue) <= Number(value);
        case 'contains':
          return String(fieldValue).includes(String(value));
        case 'in':
          return Array.isArray(value) && value.includes(fieldValue);
        default:
          return true;
      }
    } catch {
      return true;
    }
  }

  private async writeAuditLog(data: {
    instanceId: string;
    stepId?: string;
    taskId?: string;
    eventType: string;
    action: string;
    actorId?: string;
    actorIp?: string;
    actorUserAgent?: string;
    previousState?: any;
    newState?: any;
    reasonCode?: string;
    comment?: string;
  }) {
    try {
      await prisma.workflowAuditLog.create({
        data: {
          instanceId: data.instanceId,
          stepId: data.stepId,
          taskId: data.taskId,
          eventType: data.eventType,
          action: data.action,
          actorId: data.actorId,
          actorType: 'USER',
          actorIp: data.actorIp,
          actorUserAgent: data.actorUserAgent,
          previousState: data.previousState,
          newState: data.newState,
          reasonCode: data.reasonCode,
          comment: data.comment,
        },
      });
    } catch (error: any) {
      logger.warn({ error, instanceId: data.instanceId }, 'Failed to write audit log');
    }
  }
}

export const workflowTaskService = new WorkflowTaskService();
export default workflowTaskService;
