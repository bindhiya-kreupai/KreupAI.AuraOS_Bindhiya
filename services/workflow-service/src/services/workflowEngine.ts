export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'action' | 'condition' | 'approval' | 'delay' | 'parallel';
  name: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: ConditionExpression;
  label?: string;
}

export interface ConditionExpression {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentNodeId: string;
  variables: Record<string, unknown>;
  history: ExecutionStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: 'completed' | 'failed' | 'skipped';
  startedAt: string;
  completedAt: string;
  output?: Record<string, unknown>;
  error?: string;
}

export interface ExecutionContext {
  instanceId: string;
  variables: Record<string, unknown>;
  triggeredBy: string;
}

export class WorkflowEngine {
  private instances: Map<string, WorkflowInstance> = new Map();

  /**
   * Execute a workflow node and determine the next node
   */
  async executeNode(
    definition: WorkflowDefinition,
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<ExecutionStep> {
    const startedAt = new Date().toISOString();

    try {
      let output: Record<string, unknown> = {};

      switch (node.type) {
        case 'start':
          output = { started: true };
          break;

        case 'action':
          output = await this.executeAction(node, context);
          break;

        case 'condition':
          output = await this.evaluateCondition(node, context);
          break;

        case 'approval':
          output = { approvalRequested: true, nodeId: node.id };
          break;

        case 'delay':
          const delayMs = (node.config.delayMinutes as number || 0) * 60 * 1000;
          output = { delayMs, scheduledResume: new Date(Date.now() + delayMs).toISOString() };
          break;

        case 'parallel':
          output = { parallelBranches: node.config.branches || [] };
          break;

        case 'end':
          output = { completed: true };
          break;
      }

      return {
        nodeId: node.id,
        nodeName: node.name,
        status: 'completed',
        startedAt,
        completedAt: new Date().toISOString(),
        output,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        nodeName: node.name,
        status: 'failed',
        startedAt,
        completedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Evaluate a condition node and return the result
   */
  async evaluateCondition(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const condition = node.config.condition as ConditionExpression | undefined;
    if (!condition) {
      return { result: true };
    }

    const fieldValue = context.variables[condition.field];
    let result = false;

    switch (condition.operator) {
      case 'eq':
        result = fieldValue === condition.value;
        break;
      case 'neq':
        result = fieldValue !== condition.value;
        break;
      case 'gt':
        result = (fieldValue as number) > (condition.value as number);
        break;
      case 'gte':
        result = (fieldValue as number) >= (condition.value as number);
        break;
      case 'lt':
        result = (fieldValue as number) < (condition.value as number);
        break;
      case 'lte':
        result = (fieldValue as number) <= (condition.value as number);
        break;
      case 'contains':
        result = String(fieldValue).includes(String(condition.value));
        break;
      case 'in':
        result = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        break;
    }

    return { result, field: condition.field, operator: condition.operator };
  }

  /**
   * Execute an action node
   */
  private async executeAction(
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const actionType = node.config.actionType as string;
    let resultData: Record<string, unknown> = {};

    switch (actionType) {
      case 'send_email':
        // Mock email sending
        resultData = { emailSentTo: node.config.to, subject: node.config.subject };
        break;
      case 'update_record':
        // Mock record update
        resultData = { recordUpdated: node.config.recordId, status: 'success' };
        break;
      case 'call_api':
        // Mock API call
        resultData = { apiCalled: node.config.endpoint, statusCode: 200 };
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
        resultData = { error: `Unsupported action: ${actionType}` };
    }

    return {
      actionType,
      executed: true,
      timestamp: new Date().toISOString(),
      ...resultData
    };
  }

  /**
   * Manage workflow state - get the next nodes to execute
   */
  getNextNodes(
    definition: WorkflowDefinition,
    currentNodeId: string,
    conditionResult?: boolean
  ): WorkflowNode[] {
    const outgoingEdges = definition.edges.filter((e) => e.source === currentNodeId);

    if (conditionResult !== undefined) {
      // For condition nodes, filter edges by condition result
      const matchingEdges = outgoingEdges.filter((e) => {
        if (!e.condition) return conditionResult;
        return true;
      });
      return matchingEdges
        .map((e) => definition.nodes.find((n) => n.id === e.target))
        .filter((n): n is WorkflowNode => n !== undefined);
    }

    return outgoingEdges
      .map((e) => definition.nodes.find((n) => n.id === e.target))
      .filter((n): n is WorkflowNode => n !== undefined);
  }

  /**
   * Start a new workflow instance
   */
  async startWorkflow(
    definition: WorkflowDefinition,
    triggeredBy: string,
    initialVariables?: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    const instance: WorkflowInstance = {
      id: 'wfi_' + Date.now().toString(),
      definitionId: definition.id,
      status: 'running',
      currentNodeId: definition.nodes.find((n) => n.type === 'start')?.id || '',
      variables: { ...definition.variables, ...initialVariables },
      history: [],
      startedAt: new Date().toISOString(),
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  /**
   * Get workflow instance by ID
   */
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Cancel a running workflow instance
   */
  async cancelWorkflow(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (instance && instance.status === 'running') {
      instance.status = 'cancelled';
      instance.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export default new WorkflowEngine();
