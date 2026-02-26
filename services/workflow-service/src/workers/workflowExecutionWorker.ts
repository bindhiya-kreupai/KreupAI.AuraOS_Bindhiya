import { Worker, Job, Queue } from 'bullmq';
import { WorkflowEngine, WorkflowDefinition, ExecutionContext } from '../services/workflowEngine';
import { prisma } from '../lib/prisma';

export interface WorkflowExecutionJobData {
  instanceId: string;
  definitionId: string;
  tenantId?: string;
  definition: WorkflowDefinition;
  currentNodeId: string;
  variables: Record<string, unknown>;
  triggeredBy: string;
}

export interface WorkflowExecutionResult {
  instanceId: string;
  nodesExecuted: number;
  finalNodeId: string;
  status: 'completed' | 'paused' | 'failed';
  duration: number;
  error?: string;
}

const QUEUE_NAME = 'workflow-execution';

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

/**
 * Map workflow result status to the DB status enum values.
 */
function toDbStatus(status: 'completed' | 'paused' | 'failed'): string {
  switch (status) {
    case 'completed': return 'COMPLETED';
    case 'paused':    return 'PAUSED';
    case 'failed':    return 'FAILED';
  }
}

/**
 * Start the async workflow execution worker.
 *
 * Wired to real DB operations:
 *  - On job start: updates WorkflowInstance status to RUNNING and currentNode
 *  - On step advance: updates currentNode in DB so the system can resume after a crash
 *  - On job finish: updates WorkflowInstance status to COMPLETED / FAILED / PAUSED
 *    plus completedAt timestamp, context variables and error message
 */
export async function startWorkflowExecutionWorker(): Promise<Worker<WorkflowExecutionJobData, WorkflowExecutionResult>> {
  const engine = new WorkflowEngine();

  const worker = new Worker<WorkflowExecutionJobData, WorkflowExecutionResult>(
    QUEUE_NAME,
    async (job: Job<WorkflowExecutionJobData>): Promise<WorkflowExecutionResult> => {
      const {
        instanceId,
        definitionId,
        tenantId = 'SYSTEM',
        definition,
        currentNodeId,
        variables,
        triggeredBy,
      } = job.data;

      const startTime = Date.now();
      let nodesExecuted = 0;
      let nodeId = currentNodeId;

      job.log(`Starting workflow execution: ${instanceId} from node ${currentNodeId}`);

      // ------------------------------------------------------------------ //
      // Mark the WorkflowInstance as RUNNING in the DB                      //
      // ------------------------------------------------------------------ //
      try {
        await prisma.workflowInstance.upsert({
          where: { id: instanceId },
          update: {
            status: 'RUNNING',
            currentNode: currentNodeId,
            context: variables as Record<string, unknown>,
          },
          create: {
            id: instanceId,
            definitionId,
            tenantId,
            triggeredBy,
            status: 'RUNNING',
            currentNode: currentNodeId,
            context: variables as Record<string, unknown>,
            startedAt: new Date(),
          },
        });
      } catch (dbErr) {
        // Non-fatal: proceed with execution even if the initial DB write fails
        job.log(
          `[WARN] Could not upsert WorkflowInstance to RUNNING: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
        );
      }

      await job.updateProgress(10);

      try {
        const context: ExecutionContext = {
          instanceId,
          variables: { ...variables },
          triggeredBy,
        };

        // Execute nodes sequentially until we hit an end node, approval, or delay
        while (true) {
          const node = definition.nodes.find((n) => n.id === nodeId);
          if (!node) {
            throw new Error(`Node not found: ${nodeId}`);
          }

          // Execute the current node
          const step = await engine.executeNode(definition, node, context);
          nodesExecuted++;

          const progressPct = Math.min(90, (nodesExecuted / definition.nodes.length) * 100);
          await job.updateProgress(progressPct);

          // ------------------------------------------------------------ //
          // Persist current node advance to DB after each step            //
          // ------------------------------------------------------------ //
          try {
            await prisma.workflowInstance.update({
              where: { id: instanceId },
              data: {
                currentNode: nodeId,
                context: context.variables as Record<string, unknown>,
              },
            });
          } catch (dbErr) {
            job.log(
              `[WARN] Could not update WorkflowInstance currentNode: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
            );
          }

          if (step.status === 'failed') {
            const failResult: WorkflowExecutionResult = {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'failed',
              duration: Date.now() - startTime,
              error: step.error,
            };
            await persistFinalState(instanceId, failResult);
            return failResult;
          }

          // Pause for approval and delay nodes — resume via a new job
          if (node.type === 'approval' || node.type === 'delay') {
            const pauseResult: WorkflowExecutionResult = {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'paused',
              duration: Date.now() - startTime,
            };
            await persistFinalState(instanceId, pauseResult, context.variables);
            return pauseResult;
          }

          // Workflow completed at end node
          if (node.type === 'end') {
            const doneResult: WorkflowExecutionResult = {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'completed',
              duration: Date.now() - startTime,
            };
            await persistFinalState(instanceId, doneResult, context.variables);
            await job.updateProgress(100);
            return doneResult;
          }

          // Get next nodes
          const conditionResult = step.output?.result as boolean | undefined;
          const nextNodes = engine.getNextNodes(definition, nodeId, conditionResult);

          if (nextNodes.length === 0) {
            const doneResult: WorkflowExecutionResult = {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'completed',
              duration: Date.now() - startTime,
            };
            await persistFinalState(instanceId, doneResult, context.variables);
            await job.updateProgress(100);
            return doneResult;
          }

          // For parallel branches, queue separate jobs for each additional branch
          if (nextNodes.length > 1) {
            const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONNECTION });
            for (const nextNode of nextNodes.slice(1)) {
              await queue.add('execute-branch', {
                instanceId,
                definitionId,
                tenantId,
                definition,
                currentNodeId: nextNode.id,
                variables: context.variables,
                triggeredBy,
              });
            }
            await queue.close();
          }

          // Continue with the first next node
          nodeId = nextNodes[0].id;

          // Merge step output into context variables
          if (step.output) {
            Object.assign(context.variables, step.output);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const failResult: WorkflowExecutionResult = {
          instanceId,
          nodesExecuted,
          finalNodeId: nodeId,
          status: 'failed',
          duration: Date.now() - startTime,
          error: errorMessage,
        };
        await persistFinalState(instanceId, failResult);
        return failResult;
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 10,
    }
  );

  worker.on('completed', (job, result) => {
    console.log(
      `Workflow execution completed: ${result.instanceId} status: ${result.status} nodes: ${result.nodesExecuted} duration: ${result.duration}ms`
    );
  });

  worker.on('failed', (job, error) => {
    console.error(`Workflow execution job failed: ${job?.id}`, error.message);
  });

  console.log('Workflow execution worker started');
  return worker;
}

/**
 * Persist the final status of a WorkflowInstance to the DB.
 * Uses a try/catch to avoid masking the original execution result on DB failure.
 */
async function persistFinalState(
  instanceId: string,
  result: WorkflowExecutionResult,
  contextVariables?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        status: toDbStatus(result.status),
        currentNode: result.finalNodeId,
        ...(contextVariables !== undefined ? { context: contextVariables as Record<string, unknown> } : {}),
        ...(result.status !== 'paused' ? { completedAt: new Date() } : {}),
        ...(result.error ? { error: result.error } : {}),
      },
    });
  } catch (dbErr) {
    console.warn(
      `[WARN] Could not persist final WorkflowInstance state for ${instanceId}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`
    );
  }
}

/**
 * Queue a workflow for execution
 */
export async function enqueueWorkflowExecution(
  instanceId: string,
  definitionId: string,
  definition: WorkflowDefinition,
  triggeredBy: string,
  tenantId?: string,
  variables?: Record<string, unknown>
): Promise<string> {
  const startNode = definition.nodes.find((n) => n.type === 'start');
  if (!startNode) {
    throw new Error('Workflow has no start node');
  }

  const queue = new Queue<WorkflowExecutionJobData>(QUEUE_NAME, {
    connection: REDIS_CONNECTION,
  });

  const job = await queue.add('execute', {
    instanceId,
    definitionId,
    tenantId: tenantId ?? 'SYSTEM',
    definition,
    currentNodeId: startNode.id,
    variables: variables || {},
    triggeredBy,
  });

  await queue.close();
  return job.id || '';
}
