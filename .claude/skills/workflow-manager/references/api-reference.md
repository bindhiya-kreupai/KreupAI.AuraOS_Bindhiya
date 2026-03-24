# API Reference (NestJS/TypeScript)

## Core API Endpoints

### Workflow Lifecycle

#### Start Workflow

```
POST /api/workflow/start
```

```typescript
interface StartWorkflowDto {
  processType: string;
  documentRef?: string;
  documentType?: string;
  submittedBy: string;
  snapshotData: Record<string, any>;
  attachments?: string[];
}

interface StartWorkflowResponse {
  instanceId: string;
  referenceNumber: string;
  status: string;
  currentStepId: string;
}
```

**Implementation:**

```typescript
@Post('start')
async startWorkflow(
  @Body() dto: StartWorkflowDto,
  @CurrentUser() user: User,
): Promise<StartWorkflowResponse> {
  // 1. Load active definition for processType
  // 2. Create instance with snapshot
  // 3. Execute initial system steps
  // 4. Return instance details
}
```

#### Cancel Instance

```
POST /api/workflow/instances/:instanceId/cancel
```

```typescript
interface CancelInstanceDto {
  reasonCode: string;
  comment: string;
}
```

### Inbox & Tasks

#### Get Inbox

```
GET /api/workflow/inbox
```

```typescript
interface InboxQuery {
  filter?: 'MY_TASKS' | 'MY_REQUESTS' | 'DELEGATED_TO_ME' | 'WATCHING' | 'ROLE_QUEUE';
  processType?: string;
  status?: string;
  slaState?: 'ON_TIME' | 'WARNING' | 'BREACHED';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface InboxItem {
  taskId: string;
  instanceId: string;
  referenceNumber: string;
  processType: string;
  stepName: string;
  submittedBy: UserSummary;
  submittedAt: string;
  assignedAt: string;
  slaDueAt: string;
  slaState: string;
  snapshotData: Record<string, any>;
  availableActions: string[];
}

interface InboxResponse {
  items: InboxItem[];
  total: number;
  page: number;
  limit: number;
}
```

#### Get Instance Details

```
GET /api/workflow/instances/:instanceId
```

```typescript
interface InstanceDetailResponse {
  instance: {
    id: string;
    referenceNumber: string;
    processType: string;
    status: string;
    submittedBy: UserSummary;
    submittedAt: string;
    snapshotData: Record<string, any>;
    variables: Record<string, any>;
    currentStepId: string;
    overallSlaDueAt: string;
    completedAt?: string;
    outcome?: string;
  };
  steps: StepSummary[];
  currentTasks: TaskSummary[];
  timeline: TimelineEvent[];
  attachments: AttachmentSummary[];
  availableActions: string[];
}
```

### Task Actions

#### Act on Task

```
POST /api/workflow/tasks/:taskId/action
```

```typescript
interface TaskActionDto {
  action: 'APPROVE' | 'REJECT' | 'SEND_BACK' | 'HOLD' | 'RESUME' | 'ESCALATE';
  reasonCode?: string;
  comment?: string;
  attachments?: string[];
  editedFields?: Record<string, any>; // For approver edits (e.g., approvedAmount)
}

interface TaskActionResponse {
  success: boolean;
  instanceStatus: string;
  nextStepId?: string;
  message?: string;
}
```

**Implementation:**

```typescript
@Post(':taskId/action')
async actOnTask(
  @Param('taskId') taskId: string,
  @Body() dto: TaskActionDto,
  @CurrentUser() user: User,
): Promise<TaskActionResponse> {
  // 1. Acquire lock (optimistic or distributed)
  // 2. Validate user can act on task
  // 3. Validate action is allowed for step
  // 4. Record action in task and audit log
  // 5. Handle parallel completion policy
  // 6. Transition to next step
  // 7. Release lock
}
```

#### Delegate Task

```
POST /api/workflow/tasks/:taskId/delegate
```

```typescript
interface DelegateTaskDto {
  toUserId: string;
  reason: string;
  untilDate?: string;
}
```

#### Reassign Task (Admin)

```
POST /api/workflow/tasks/:taskId/reassign
```

```typescript
interface ReassignTaskDto {
  toUserId?: string;
  toRole?: string;
  reason: string;
}
```

#### Hold Task

```
POST /api/workflow/tasks/:taskId/hold
```

```typescript
interface HoldTaskDto {
  reasonCode: string;
  comment?: string;
  untilDate?: string;
}
```

#### Resume Task

```
POST /api/workflow/tasks/:taskId/resume
```

### Admin Operations

#### Retry System Step

```
POST /api/workflow/admin/instances/:instanceId/retry-step/:stepId
```

#### Force Override

```
POST /api/workflow/admin/instances/:instanceId/override
```

```typescript
interface AdminOverrideDto {
  action: 'FORCE_APPROVE' | 'FORCE_REJECT';
  reasonCode: string;
  justification: string;
}
```

#### Search Instances (Admin)

```
GET /api/workflow/admin/instances
```

```typescript
interface AdminSearchQuery {
  processType?: string;
  status?: string;
  submittedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  referenceNumber?: string;
  documentRef?: string;
  page?: number;
  limit?: number;
}
```

---

## Service Layer Architecture

### WorkflowEngineService

```typescript
@Injectable()
export class WorkflowEngineService {
  constructor(
    private definitionService: WorkflowDefinitionService,
    private instanceService: WorkflowInstanceService,
    private stepExecutor: StepExecutorService,
    private ruleEngine: RuleEngineService,
    private assignmentEngine: AssignmentEngineService,
    private notificationService: NotificationService,
    private auditService: AuditLogService
  ) {}

  async startWorkflow(dto: StartWorkflowDto): Promise<WorkflowInstance> {
    // 1. Load definition
    const definition = await this.definitionService.getActiveDefinition(dto.processType);

    // 2. Create instance
    const instance = await this.instanceService.create({
      definitionId: definition.id,
      definitionVersion: definition.version,
      submittedBy: dto.submittedBy,
      snapshotData: dto.snapshotData,
    });

    // 3. Execute initial steps
    await this.executeFromStep(instance, definition.steps[0]);

    return instance;
  }

  async executeFromStep(instance: WorkflowInstance, stepDef: StepDefinition): Promise<void> {
    switch (stepDef.type) {
      case 'SYSTEM_AUTOMATED':
        await this.stepExecutor.executeSystemStep(instance, stepDef);
        break;
      case 'DECISION':
        const nextStepId = await this.ruleEngine.evaluateDecision(instance, stepDef);
        await this.transitionTo(instance, nextStepId);
        break;
      case 'HUMAN_SINGLE':
      case 'HUMAN_PARALLEL_ANY_ONE':
      case 'HUMAN_PARALLEL_ALL_REQUIRED':
        await this.createHumanTasks(instance, stepDef);
        break;
      case 'TIMER_WAIT':
        await this.scheduleTimer(instance, stepDef);
        break;
    }
  }

  async actOnTask(taskId: string, userId: string, action: TaskActionDto): Promise<void> {
    // Use distributed lock for parallel tasks
    const lock = await this.lockService.acquire(`task:${taskId}`);
    try {
      const task = await this.taskService.findById(taskId);
      await this.validateAction(task, userId, action);
      await this.recordAction(task, userId, action);
      await this.handleStepCompletion(task);
    } finally {
      await lock.release();
    }
  }
}
```

### StepExecutorService

```typescript
@Injectable()
export class StepExecutorService {
  async executeSystemStep(
    instance: WorkflowInstance,
    stepDef: SystemStepDefinition
  ): Promise<void> {
    for (const action of stepDef.system.actions) {
      const idempotencyKey = `${instance.id}:${stepDef.stepId}:${action.actionId}`;

      // Check idempotency
      const existing = await this.idempotencyService.get(idempotencyKey);
      if (existing) continue;

      let attempts = 0;
      while (attempts < (action.retry?.maxAttempts || 1)) {
        try {
          const result = await this.executeAction(instance, action);
          await this.idempotencyService.set(idempotencyKey, result);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= (action.retry?.maxAttempts || 1)) {
            await this.handleFailure(instance, stepDef, action, error);
            return;
          }
          await this.delay(action.retry?.backoffSeconds || 10);
        }
      }
    }

    // Proceed to next step
    await this.transitionToNext(instance, stepDef);
  }

  private async executeAction(instance: WorkflowInstance, action: SystemAction): Promise<any> {
    switch (action.kind) {
      case 'INTERNAL_FUNCTION':
        return this.functionRegistry.call(action.target, instance);
      case 'EXTERNAL_API':
        return this.httpService.post(action.target, instance.variables);
      case 'EMIT_EVENT':
        return this.eventBus.emit(action.event, { instanceId: instance.id });
    }
  }
}
```

### AssignmentEngineService

```typescript
@Injectable()
export class AssignmentEngineService {
  async resolveAssignees(
    instance: WorkflowInstance,
    assignment: AssignmentConfig
  ): Promise<string[]> {
    switch (assignment.mode) {
      case 'USER':
        return [assignment.userId];

      case 'USER_LOOKUP':
        const users = await this.resolveLookups(instance, assignment.assignees);
        if (users.length === 0 && assignment.fallback) {
          return this.resolveAssignees(instance, assignment.fallback);
        }
        return users;

      case 'ROLE':
        return this.roleService.getUsersInRole(assignment.roleCode);

      case 'ROLE_POOL':
        const scope = await this.ruleEngine.evaluateOperand(instance, assignment.scope.value);
        return this.roleService.getUsersInRole(assignment.roleCode, {
          [assignment.scope.by]: scope,
        });

      case 'MULTI':
        const results = await Promise.all(
          assignment.targets.map((t) => this.resolveAssignees(instance, t))
        );
        return results.flat();
    }
  }

  private async resolveLookups(
    instance: WorkflowInstance,
    lookups: LookupConfig[]
  ): Promise<string[]> {
    const results: string[] = [];
    for (const lookup of lookups) {
      const args = await Promise.all(
        lookup.args.map((arg) => this.ruleEngine.evaluateOperand(instance, arg))
      );
      const result = await this.lookupProviders[lookup.lookup](...args);
      if (result) results.push(result);
    }
    return results;
  }
}
```

### ParallelTaskCoordinator

```typescript
@Injectable()
export class ParallelTaskCoordinator {
  async handleTaskCompletion(
    task: WorkflowTask,
    step: WorkflowStep,
    stepDef: ParallelStepDefinition
  ): Promise<void> {
    const allTasks = await this.taskService.findByStep(step.id);
    const policy = stepDef.parallelPolicy;

    if (policy.completion === 'ANY_ONE') {
      // First response wins
      if (task.actionTaken) {
        // Close remaining tasks
        const remaining = allTasks.filter((t) => t.id !== task.id && t.status === 'PENDING');
        await Promise.all(
          remaining.map((t) => this.taskService.markNotRequired(t.id, task.actionBy))
        );
        await this.completeStep(step, task.actionTaken);
      }
    } else if (policy.completion === 'ALL_REQUIRED') {
      const completed = allTasks.filter((t) => t.status === 'COMPLETED');

      // Check for early rejection
      if (policy.onReject === 'REJECT_IMMEDIATELY') {
        const rejection = completed.find((t) => t.actionTaken === 'REJECT');
        if (rejection) {
          await this.cancelRemainingTasks(allTasks);
          await this.completeStep(step, 'REJECTED');
          return;
        }
      }

      // All must complete
      if (completed.length === allTasks.length) {
        const outcome = this.determineOutcome(completed, policy.mixedOutcomePolicy);
        await this.completeStep(step, outcome);
      }
    }
  }

  private determineOutcome(tasks: WorkflowTask[], policy: string): string {
    const approvals = tasks.filter((t) => t.actionTaken === 'APPROVE').length;
    const rejections = tasks.filter((t) => t.actionTaken === 'REJECT').length;

    switch (policy) {
      case 'REJECT_DOMINATES':
        return rejections > 0 ? 'REJECTED' : 'APPROVED';
      case 'WEIGHTED_DECISION':
        return approvals > rejections ? 'APPROVED' : 'REJECTED';
      default:
        return rejections > 0 ? 'REJECTED' : 'APPROVED';
    }
  }
}
```

---

## Background Jobs (Bull/Agenda)

### SLA Processor

```typescript
@Processor('workflow-sla')
export class SlaProcessor {
  @Process('check-sla')
  async checkSla(job: Job<{ taskId: string }>): Promise<void> {
    const task = await this.taskService.findById(job.data.taskId);
    if (!task || task.status !== 'PENDING') return;

    const now = new Date();
    const dueAt = new Date(task.slaDueAt);
    const definition = await this.getStepDefinition(task);

    // Check reminders
    for (const reminder of definition.sla?.reminders || []) {
      const threshold = this.calculateThreshold(task, reminder.whenPercentElapsed);
      if (now >= threshold && !task.reminderSentAt) {
        await this.sendReminders(task, reminder.notify);
        await this.taskService.markReminderSent(task.id);
      }
    }

    // Check escalations
    if (now > dueAt) {
      const overdueHours = (now.getTime() - dueAt.getTime()) / (1000 * 60 * 60);
      const escalation = this.findApplicableEscalation(
        definition,
        overdueHours,
        task.escalationLevel
      );

      if (escalation) {
        if (escalation.action === 'NOTIFY') {
          await this.sendEscalationNotification(task, escalation.targets);
        } else if (escalation.action === 'REASSIGN') {
          await this.reassignToEscalationRole(task, escalation.toRole);
        }
        await this.taskService.incrementEscalationLevel(task.id);
      }
    }
  }
}
```

### Auto-Resume Processor

```typescript
@Processor('workflow-scheduler')
export class SchedulerProcessor {
  @Process('auto-resume')
  async autoResume(job: Job<{ taskId: string }>): Promise<void> {
    const task = await this.taskService.findById(job.data.taskId);
    if (task?.status === 'ON_HOLD') {
      await this.workflowEngine.resumeTask(task.id, 'SYSTEM');
    }
  }

  @Process('timer-wake')
  async timerWake(job: Job<{ instanceId: string; stepId: string }>): Promise<void> {
    await this.workflowEngine.handleTimerWake(job.data.instanceId, job.data.stepId);
  }
}
```
