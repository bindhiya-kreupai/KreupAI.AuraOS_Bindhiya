import { Worker, Job, Queue } from 'bullmq';
import { WorkflowEngine, WorkflowDefinition, ExecutionContext } from '../services/workflowEngine';

export interface WorkflowExecutionJobData {
  instanceId: string;
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
 * Start the async workflow execution worker
 */
export async function startWorkflowExecutionWorker(): Promise<Worker<WorkflowExecutionJobData, WorkflowExecutionResult>> {
  const engine = new WorkflowEngine();

  const worker = new Worker<WorkflowExecutionJobData, WorkflowExecutionResult>(
    QUEUE_NAME,
    async (job: Job<WorkflowExecutionJobData>) => {
      const { instanceId, definition, currentNodeId, variables, triggeredBy } = job.data;
      const startTime = Date.now();
      let nodesExecuted = 0;
      let nodeId = currentNodeId;

      job.log('Starting workflow execution: ' + instanceId + ' from node ' + currentNodeId);

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
            throw new Error('Node not found: ' + nodeId);
          }

          // Execute the current node
          const step = await engine.executeNode(definition, node, context);
          nodesExecuted++;

          await job.updateProgress(Math.min(90, (nodesExecuted / definition.nodes.length) * 100));

          if (step.status === 'failed') {
            return {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'failed',
              duration: Date.now() - startTime,
              error: step.error,
            };
          }

          // Check if we should pause (approval or delay nodes)
          if (node.type === 'approval' || node.type === 'delay') {
            return {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'paused',
              duration: Date.now() - startTime,
            };
          }

          // Check if workflow is complete
          if (node.type === 'end') {
            return {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'completed',
              duration: Date.now() - startTime,
            };
          }

          // Get next nodes
          const conditionResult = step.output?.result as boolean | undefined;
          const nextNodes = engine.getNextNodes(definition, nodeId, conditionResult);

          if (nextNodes.length === 0) {
            return {
              instanceId,
              nodesExecuted,
              finalNodeId: nodeId,
              status: 'completed',
              duration: Date.now() - startTime,
            };
          }

          // For parallel nodes, queue separate jobs for each branch
          if (nextNodes.length > 1) {
            const queue = new Queue(QUEUE_NAME, { connection: REDIS_CONNECTION });
            for (const nextNode of nextNodes.slice(1)) {
              await queue.add('execute-branch', {
                instanceId,
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

          // Update context variables with step output
          if (step.output) {
            Object.assign(context.variables, step.output);
          }
        }
      } catch (error) {
        return {
          instanceId,
          nodesExecuted,
          finalNodeId: nodeId,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    {
      connection: REDIS_CONNECTION,
      concurrency: 10,
    }
  );

  worker.on('completed', (job, result) => {
    console.log('Workflow execution completed:', result.instanceId, 'status:', result.status, 'nodes:', result.nodesExecuted);
  });

  worker.on('failed', (job, error) => {
    console.error('Workflow execution job failed:', job?.id, error.message);
  });

  console.log('Workflow execution worker started');
  return worker;
}

/**
 * Queue a workflow for execution
 */
export async function enqueueWorkflowExecution(
  instanceId: string,
  definition: WorkflowDefinition,
  triggeredBy: string,
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
    definition,
    currentNodeId: startNode.id,
    variables: variables || {},
    triggeredBy,
  });

  await queue.close();
  return job.id || '';
}
