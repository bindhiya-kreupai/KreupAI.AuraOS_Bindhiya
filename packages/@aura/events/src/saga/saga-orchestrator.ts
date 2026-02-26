/**
 * Saga Orchestrator
 *
 * Manages distributed transactions (sagas) across microservices.
 * Each saga consists of an ordered sequence of steps; if any step fails,
 * previously executed steps are compensated in reverse order.
 *
 * State machine:
 *   pending → running → completed
 *                    ↘ compensating → compensated
 *                    ↘ failed (compensation also failed)
 *
 * @module @aura/events/saga
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SagaStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'compensating'
  | 'compensated'
  | 'failed';

export interface SagaStep<TContext = Record<string, unknown>> {
  /** Unique name for the step (used in logging and state persistence) */
  name: string;
  /** Execute the step's action. May mutate ctx to pass data to subsequent steps. */
  execute(ctx: TContext): Promise<void>;
  /** Undo the step's action. Called if a later step fails. */
  compensate(ctx: TContext): Promise<void>;
}

export interface SagaDefinition<TContext = Record<string, unknown>> {
  name: string;
  steps: SagaStep<TContext>[];
}

export interface SagaState<TContext = Record<string, unknown>> {
  sagaId: string;
  sagaName: string;
  status: SagaStatus;
  currentStepIndex: number;
  completedSteps: string[];
  context: TContext;
  startedAt: Date;
  completedAt?: Date;
  failedStep?: string;
  errorMessage?: string;
}

export interface SagaResult<TContext = Record<string, unknown>> {
  sagaId: string;
  status: SagaStatus;
  context: TContext;
  completedSteps: string[];
  failedStep?: string;
  errorMessage?: string;
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Saga Orchestrator
// ---------------------------------------------------------------------------

/**
 * SagaOrchestrator
 *
 * Usage:
 *   const orchestrator = new SagaOrchestrator();
 *   orchestrator.defineSaga('employee-onboarding', steps);
 *   const result = await orchestrator.execute('employee-onboarding', { employeeId: '...' });
 */
export class SagaOrchestrator {
  private definitions = new Map<string, SagaDefinition<Record<string, unknown>>>();
  private readonly stateStore?: {
    save(state: SagaState): Promise<void>;
    load(sagaId: string): Promise<SagaState | null>;
  };

  constructor(stateStore?: {
    save(state: SagaState): Promise<void>;
    load(sagaId: string): Promise<SagaState | null>;
  }) {
    this.stateStore = stateStore;
  }

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Register a saga definition.
   * Safe to call multiple times — later calls overwrite earlier ones.
   */
  defineSaga<TContext extends Record<string, unknown>>(
    name: string,
    steps: SagaStep<TContext>[]
  ): void {
    this.definitions.set(name, {
      name,
      steps: steps as unknown as SagaStep<Record<string, unknown>>[],
    });
  }

  // -------------------------------------------------------------------------
  // Execution
  // -------------------------------------------------------------------------

  /**
   * Execute a named saga with the given context.
   *
   * Steps run in order.  On failure, completed steps are compensated in
   * reverse order.  The context object is mutated in place — steps may
   * attach data (e.g. IDs of created records) for subsequent steps.
   */
  async execute<TContext extends Record<string, unknown>>(
    sagaName: string,
    context: TContext
  ): Promise<SagaResult<TContext>> {
    const definition = this.definitions.get(sagaName);
    if (!definition) {
      throw new Error(`[SagaOrchestrator] Unknown saga: "${sagaName}"`);
    }

    const sagaId = randomUUID();
    const startedAt = new Date();
    const completedSteps: string[] = [];

    const state: SagaState<TContext> = {
      sagaId,
      sagaName,
      status: 'pending',
      currentStepIndex: 0,
      completedSteps,
      context,
      startedAt,
    };

    await this.persistState(state as unknown as SagaState);
    console.info(`[Saga:${sagaName}] Starting (id=${sagaId})`);

    // Forward pass — execute steps in order
    state.status = 'running';

    for (let i = 0; i < definition.steps.length; i++) {
      const step = definition.steps[i];
      state.currentStepIndex = i;

      console.info(`[Saga:${sagaName}] Step ${i + 1}/${definition.steps.length}: ${step.name}`);

      try {
        await step.execute(context as unknown as Record<string, unknown>);
        completedSteps.push(step.name);
        await this.persistState(state as unknown as SagaState);
        console.info(`[Saga:${sagaName}] Step completed: ${step.name}`);
      } catch (execErr) {
        const errorMessage = execErr instanceof Error ? execErr.message : String(execErr);
        console.error(
          `[Saga:${sagaName}] Step failed: ${step.name} — ${errorMessage}`
        );

        state.failedStep = step.name;
        state.errorMessage = errorMessage;
        state.status = 'compensating';
        await this.persistState(state as unknown as SagaState);

        // Compensate in reverse order
        await this.compensate(sagaName, definition, completedSteps, context, state as unknown as SagaState);

        const durationMs = Date.now() - startedAt.getTime();
        return {
          sagaId,
          status: state.status as SagaStatus,
          context,
          completedSteps: [...completedSteps],
          failedStep: step.name,
          errorMessage,
          durationMs,
        };
      }
    }

    state.status = 'completed';
    state.completedAt = new Date();
    await this.persistState(state as unknown as SagaState);

    const durationMs = Date.now() - startedAt.getTime();
    console.info(`[Saga:${sagaName}] Completed in ${durationMs}ms`);

    return {
      sagaId,
      status: 'completed',
      context,
      completedSteps: [...completedSteps],
      durationMs,
    };
  }

  // -------------------------------------------------------------------------
  // Compensation
  // -------------------------------------------------------------------------

  private async compensate<TContext extends Record<string, unknown>>(
    sagaName: string,
    definition: SagaDefinition<Record<string, unknown>>,
    completedSteps: string[],
    context: TContext,
    state: SagaState
  ): Promise<void> {
    // Build the list of steps to compensate (reverse order)
    const stepsToCompensate = definition.steps.filter((s) =>
      completedSteps.includes(s.name)
    ).reverse();

    console.info(
      `[Saga:${sagaName}] Compensating ${stepsToCompensate.length} steps...`
    );

    let compensationFailed = false;

    for (const step of stepsToCompensate) {
      try {
        console.info(`[Saga:${sagaName}] Compensating: ${step.name}`);
        await step.compensate(context as unknown as Record<string, unknown>);
        console.info(`[Saga:${sagaName}] Compensated: ${step.name}`);
      } catch (compErr) {
        compensationFailed = true;
        console.error(
          `[Saga:${sagaName}] Compensation failed for step: ${step.name}`,
          compErr
        );
        // Continue compensating remaining steps even if one fails
      }
    }

    state.status = compensationFailed ? 'failed' : 'compensated';
    state.completedAt = new Date();
    await this.persistState(state);

    console.info(
      `[Saga:${sagaName}] Compensation ${compensationFailed ? 'partially failed' : 'succeeded'}`
    );
  }

  // -------------------------------------------------------------------------
  // State persistence (optional — no-op if no store provided)
  // -------------------------------------------------------------------------

  private async persistState(state: SagaState): Promise<void> {
    if (!this.stateStore) return;
    try {
      await this.stateStore.save(state);
    } catch (err) {
      console.warn('[SagaOrchestrator] Failed to persist saga state:', err);
    }
  }

  // -------------------------------------------------------------------------
  // Introspection
  // -------------------------------------------------------------------------

  getDefinedSagas(): string[] {
    return Array.from(this.definitions.keys());
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let orchestratorInstance: SagaOrchestrator | null = null;

export function getSagaOrchestrator(): SagaOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SagaOrchestrator();
  }
  return orchestratorInstance;
}
