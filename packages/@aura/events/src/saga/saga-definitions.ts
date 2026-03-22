/**
 * Saga Definitions
 *
 * Defines the three core business sagas for AuraOS:
 *   1. employee-onboarding-saga
 *   2. payroll-run-saga
 *   3. employee-termination-saga
 *
 * Each step has an `execute` (forward action) and `compensate` (rollback) method.
 * Steps are thin stubs — in production they call the appropriate domain service.
 *
 * @module @aura/events/saga
 */

import { SagaStep, SagaOrchestrator, getSagaOrchestrator } from './saga-orchestrator';

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

export interface EmployeeOnboardingContext {
  [key: string]: unknown;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  designation: string;
  managerId?: string;
  // Written by steps during execution
  userId?: string;
  roleId?: string;
  itTicketId?: string;
  benefitEnrollmentId?: string;
  welcomeEmailSent?: boolean;
}

export interface PayrollRunContext {
  [key: string]: unknown;
  tenantId: string;
  payrollRunId: string;
  month: number;
  year: number;
  initiatedBy: string;
  // Written by steps during execution
  periodLocked?: boolean;
  calculationCompleted?: boolean;
  validationPassed?: boolean;
  payslipsGenerated?: number;
  glPostingReference?: string;
}

export interface EmployeeTerminationContext {
  [key: string]: unknown;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  terminationDate: Date;
  initiatedBy: string;
  reason: string;
  // Written by steps during execution
  fnfCalculationId?: string;
  accessRevoked?: boolean;
  clearanceCompleted?: boolean;
  archiveReference?: string;
}

// ---------------------------------------------------------------------------
// Saga 1: Employee Onboarding
// ---------------------------------------------------------------------------

const employeeOnboardingSteps: SagaStep<EmployeeOnboardingContext>[] = [
  {
    name: 'create-user-account',
    async execute(ctx) {
      // Production: call AuthService.createUser(ctx.email, ctx.employeeId)
      console.info(`[Saga:onboarding] Creating user account for ${ctx.employeeName}`);
      ctx.userId = `user_${ctx.employeeId}`;
    },
    async compensate(ctx) {
      // Production: call AuthService.deleteUser(ctx.userId)
      console.info(`[Saga:onboarding] Reverting: deleting user account ${ctx.userId}`);
      ctx.userId = undefined;
    },
  },
  {
    name: 'assign-role',
    async execute(ctx) {
      // Production: call RBACService.assignRole(ctx.userId, ctx.designation)
      console.info(`[Saga:onboarding] Assigning role for ${ctx.designation}`);
      ctx.roleId = `role_${ctx.designation.toLowerCase().replace(/\s+/g, '_')}`;
    },
    async compensate(ctx) {
      // Production: call RBACService.revokeRole(ctx.userId, ctx.roleId)
      console.info(`[Saga:onboarding] Reverting: revoking role ${ctx.roleId}`);
      ctx.roleId = undefined;
    },
  },
  {
    name: 'provision-it-resources',
    async execute(ctx) {
      // Production: call ITService.provisionResources({ email, department })
      console.info(`[Saga:onboarding] Provisioning IT resources for ${ctx.email}`);
      ctx.itTicketId = `it_ticket_${Date.now()}`;
    },
    async compensate(ctx) {
      // Production: call ITService.deprovisionResources(ctx.itTicketId)
      console.info(`[Saga:onboarding] Reverting: deprovisioning IT ticket ${ctx.itTicketId}`);
      ctx.itTicketId = undefined;
    },
  },
  {
    name: 'enroll-benefits',
    async execute(ctx) {
      // Production: call BenefitsService.enrollEmployee(ctx.employeeId, ctx.tenantId)
      console.info(`[Saga:onboarding] Enrolling ${ctx.employeeName} in benefits`);
      ctx.benefitEnrollmentId = `benefit_enroll_${ctx.employeeId}`;
    },
    async compensate(ctx) {
      // Production: call BenefitsService.cancelEnrollment(ctx.benefitEnrollmentId)
      console.info(`[Saga:onboarding] Reverting: cancelling benefit enrollment`);
      ctx.benefitEnrollmentId = undefined;
    },
  },
  {
    name: 'send-welcome-email',
    async execute(ctx) {
      // Production: call NotificationService.sendWelcomeEmail(ctx.employeeId, ctx.email)
      console.info(`[Saga:onboarding] Sending welcome email to ${ctx.email}`);
      ctx.welcomeEmailSent = true;
    },
    async compensate(ctx) {
      // No meaningful compensation for a sent email — log only
      console.info(`[Saga:onboarding] Note: welcome email to ${ctx.email} cannot be recalled`);
      ctx.welcomeEmailSent = false;
    },
  },
];

// ---------------------------------------------------------------------------
// Saga 2: Payroll Run
// ---------------------------------------------------------------------------

const payrollRunSteps: SagaStep<PayrollRunContext>[] = [
  {
    name: 'lock-payroll-period',
    async execute(ctx) {
      // Production: call PayrollService.lockPeriod(ctx.tenantId, ctx.month, ctx.year)
      console.info(`[Saga:payroll-run] Locking period ${ctx.year}-${ctx.month}`);
      ctx.periodLocked = true;
    },
    async compensate(ctx) {
      // Production: call PayrollService.unlockPeriod(ctx.tenantId, ctx.month, ctx.year)
      console.info(`[Saga:payroll-run] Reverting: unlocking period ${ctx.year}-${ctx.month}`);
      ctx.periodLocked = false;
    },
  },
  {
    name: 'calculate-payroll',
    async execute(ctx) {
      // Production: call PayrollEngineService.calculate(ctx.payrollRunId)
      console.info(`[Saga:payroll-run] Calculating payroll run ${ctx.payrollRunId}`);
      ctx.calculationCompleted = true;
    },
    async compensate(ctx) {
      // Production: call PayrollService.deleteCalculations(ctx.payrollRunId)
      console.info(`[Saga:payroll-run] Reverting: deleting payroll calculations`);
      ctx.calculationCompleted = false;
    },
  },
  {
    name: 'validate-payroll',
    async execute(ctx) {
      // Production: call PayrollValidationService.validate(ctx.payrollRunId)
      console.info(`[Saga:payroll-run] Validating payroll run ${ctx.payrollRunId}`);
      ctx.validationPassed = true;
    },
    async compensate(ctx) {
      // No DB changes — reset flag
      console.info(`[Saga:payroll-run] Reverting: clearing validation flag`);
      ctx.validationPassed = false;
    },
  },
  {
    name: 'generate-payslips',
    async execute(ctx) {
      // Production: call PayslipService.generateAll(ctx.payrollRunId)
      console.info(`[Saga:payroll-run] Generating payslips for run ${ctx.payrollRunId}`);
      ctx.payslipsGenerated = 0; // actual count in production
    },
    async compensate(ctx) {
      // Production: call PayslipService.deleteByRun(ctx.payrollRunId)
      console.info(`[Saga:payroll-run] Reverting: deleting payslips`);
      ctx.payslipsGenerated = undefined;
    },
  },
  {
    name: 'post-to-gl',
    async execute(ctx) {
      // Production: call GLPostingService.post(ctx.payrollRunId, ctx.tenantId)
      console.info(`[Saga:payroll-run] Posting payroll to General Ledger`);
      ctx.glPostingReference = `gl_ref_${ctx.payrollRunId}`;
    },
    async compensate(ctx) {
      // Production: call GLPostingService.reverse(ctx.glPostingReference)
      console.info(`[Saga:payroll-run] Reverting: reversing GL posting ${ctx.glPostingReference}`);
      ctx.glPostingReference = undefined;
    },
  },
  {
    name: 'unlock-payroll-period',
    async execute(ctx) {
      // Production: call PayrollService.markPeriodFinalised(ctx.tenantId, ctx.month, ctx.year)
      console.info(`[Saga:payroll-run] Unlocking and finalising period ${ctx.year}-${ctx.month}`);
      ctx.periodLocked = false;
    },
    async compensate(_ctx) {
      // Nothing meaningful to revert here — log only
      console.info(`[Saga:payroll-run] Note: period unlock compensation is a no-op`);
    },
  },
];

// ---------------------------------------------------------------------------
// Saga 3: Employee Termination
// ---------------------------------------------------------------------------

const employeeTerminationSteps: SagaStep<EmployeeTerminationContext>[] = [
  {
    name: 'initiate-termination',
    async execute(ctx) {
      // Production: call EmployeeService.initiateTermination(ctx.employeeId, ctx.reason)
      console.info(
        `[Saga:termination] Initiating termination for ${ctx.employeeName} (${ctx.reason})`
      );
    },
    async compensate(ctx) {
      // Production: call EmployeeService.cancelTermination(ctx.employeeId)
      console.info(`[Saga:termination] Reverting: cancelling termination initiation`);
    },
  },
  {
    name: 'calculate-fnf',
    async execute(ctx) {
      // Production: call FnFService.calculate(ctx.employeeId, ctx.terminationDate)
      console.info(`[Saga:termination] Calculating Full & Final settlement`);
      ctx.fnfCalculationId = `fnf_${ctx.employeeId}_${Date.now()}`;
    },
    async compensate(ctx) {
      // Production: call FnFService.deleteCalculation(ctx.fnfCalculationId)
      console.info(`[Saga:termination] Reverting: deleting F&F calculation`);
      ctx.fnfCalculationId = undefined;
    },
  },
  {
    name: 'revoke-system-access',
    async execute(ctx) {
      // Production: call AuthService.revokeAllAccess(ctx.employeeId)
      console.info(`[Saga:termination] Revoking all system access for ${ctx.employeeName}`);
      ctx.accessRevoked = true;
    },
    async compensate(ctx) {
      // Production: call AuthService.restoreAccess(ctx.employeeId)
      console.info(`[Saga:termination] Reverting: restoring system access`);
      ctx.accessRevoked = false;
    },
  },
  {
    name: 'process-clearance',
    async execute(ctx) {
      // Production: call ClearanceService.process(ctx.employeeId)
      console.info(`[Saga:termination] Processing clearance checklist`);
      ctx.clearanceCompleted = true;
    },
    async compensate(ctx) {
      // Production: call ClearanceService.reopen(ctx.employeeId)
      console.info(`[Saga:termination] Reverting: re-opening clearance`);
      ctx.clearanceCompleted = false;
    },
  },
  {
    name: 'archive-employee-record',
    async execute(ctx) {
      // Production: call EmployeeService.archive(ctx.employeeId)
      console.info(`[Saga:termination] Archiving employee record for ${ctx.employeeName}`);
      ctx.archiveReference = `archive_${ctx.employeeId}`;
    },
    async compensate(ctx) {
      // Production: call EmployeeService.unarchive(ctx.employeeId)
      console.info(`[Saga:termination] Reverting: unarchiving employee record`);
      ctx.archiveReference = undefined;
    },
  },
];

// ---------------------------------------------------------------------------
// Registration helper
// ---------------------------------------------------------------------------

/**
 * Register all three core sagas with the provided (or singleton) orchestrator.
 */
export function registerCoreSagas(
  orchestrator: SagaOrchestrator = getSagaOrchestrator()
): void {
  orchestrator.defineSaga<EmployeeOnboardingContext>(
    'employee-onboarding-saga',
    employeeOnboardingSteps
  );

  orchestrator.defineSaga<PayrollRunContext>(
    'payroll-run-saga',
    payrollRunSteps
  );

  orchestrator.defineSaga<EmployeeTerminationContext>(
    'employee-termination-saga',
    employeeTerminationSteps
  );

  console.info('[SagaDefinitions] Registered 3 core sagas');
}

export {
  employeeOnboardingSteps,
  payrollRunSteps,
  employeeTerminationSteps,
};
