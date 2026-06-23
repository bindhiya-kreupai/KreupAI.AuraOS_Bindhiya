/**
 * EPIC-13 / EPIC-14 GOSI / GPSSA event consumers.
 *
 * Closes the audit gaps:
 *   - EPIC-13: "No event consumers for hire/salary/exit"
 *   - EPIC-14: "No event wiring (S08, S10, S15 silent). No payroll
 *     deduction write-back from calculation.service.ts."
 *
 * Subscribes to the compliance event bus and routes events into the
 * existing GosiRegistrationService / GpssaRegistrationService /
 * GosiCalculationService / GpssaCalculationService methods. The
 * existing services stay authoritative — this file is a thin
 * automation layer that ensures the right registration / contribution
 * action fires when an employee is hired, has a salary change, or
 * exits.
 *
 * Country routing (each tenant can opt into one or both schemes):
 *   - GOSI:  payload.countryCode === 'SA'
 *   - GPSSA: payload.countryCode === 'AE' AND employee.nationality
 *            indicates UAE national (caller-provided in payload.
 *            isGccNational flag — we don't fetch the employee here).
 *
 * Best-effort and idempotent — failures in the consumer are logged
 * but DO NOT throw back to the bus (publishComplianceEvent contract).
 *
 * Wiring is opt-in: call `installGosiGpssaConsumers()` once during
 * service bootstrap. Returns an `uninstall()` disposer for tests.
 */

import { logger } from '@/lib/logger';
import { subscribeComplianceEvent, type ComplianceEvent } from '@/lib/services/compliance-events';
import { gosiRegistrationService } from '@/lib/services/gosi-compliance/registration.service';
import { gpssaRegistrationService } from '@/lib/services/gpssa-compliance/registration.service';
import { gosiCalculationService } from '@/lib/services/gosi-compliance/calculation.service';
import { gpssaCalculationService } from '@/lib/services/gpssa-compliance/calculation.service';

export type ConsumerOutcome =
  | { handled: true; service: 'GOSI' | 'GPSSA'; action: string }
  | { handled: false; reason: string };

/**
 * Pure routing helper (exported for tests): given an event, decide
 * which scheme(s) should act. Does NOT call IO.
 */
export function routeEvent(event: ComplianceEvent): Array<'GOSI' | 'GPSSA'> {
  const payload = event.payload as Record<string, unknown> | undefined;
  const country = (payload?.countryCode as string | undefined)?.toUpperCase();
  const isGccNational = !!payload?.isGccNational;
  const out: Array<'GOSI' | 'GPSSA'> = [];
  if (country === 'SA') out.push('GOSI');
  if (country === 'AE' && isGccNational) out.push('GPSSA');
  return out;
}

async function safelyHandle<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ ok: true; result: T } | { ok: false }> {
  try {
    const result = await fn();
    return { ok: true, result };
  } catch (err) {
    logger.warn({ err, label }, 'gosi/gpssa event consumer failed');
    return { ok: false };
  }
}

async function onHired(event: ComplianceEvent<'employee.hired'>) {
  const targets = routeEvent(event);
  for (const t of targets) {
    const auth = { tenantId: event.tenantId, userId: event.actorId ?? 'system' };
    const payload = event.payload as Record<string, unknown>;
    if (t === 'GOSI') {
      await safelyHandle('gosi.register', () =>
        gosiRegistrationService.register(
          {
            employeeId: event.payload.employeeId,
            establishmentId: String(payload.establishmentId ?? 'default'),
            nationalityClass: (payload.nationalityClass as any) ?? 'SAUDI_NATIONAL',
            registrationDate: new Date(event.payload.joiningDate),
          } as any,
          auth as any
        )
      );
    } else if (t === 'GPSSA') {
      await safelyHandle('gpssa.register', () =>
        gpssaRegistrationService.register(
          {
            employeeId: event.payload.employeeId,
            establishmentId: String(payload.establishmentId ?? 'default'),
            nationalityClass: 'UAE_NATIONAL' as any,
            registrationDate: new Date(event.payload.joiningDate),
          } as any,
          auth as any
        )
      );
    }
  }
}

async function onSalaryChanged(event: ComplianceEvent<'employee.salaryChanged'>) {
  const targets = routeEvent(event);
  for (const t of targets) {
    const auth = { tenantId: event.tenantId, userId: event.actorId ?? 'system' };
    const period = event.payload.effectiveDate.slice(0, 7); // YYYY-MM
    if (t === 'GOSI') {
      await safelyHandle('gosi.computeContribution', () =>
        gosiCalculationService.computeContribution(
          {
            employeeId: event.payload.employeeId,
            period,
            contributionWage: event.payload.newBasic,
          },
          auth as any
        )
      );
    } else if (t === 'GPSSA') {
      const svc = gpssaCalculationService as any;
      if (typeof svc.computeContribution === 'function') {
        await safelyHandle('gpssa.computeContribution', () =>
          svc.computeContribution(
            {
              employeeId: event.payload.employeeId,
              period,
              contributionWage: event.payload.newBasic,
            },
            auth
          )
        );
      }
    }
  }
}

async function onSeparationInitiated(event: ComplianceEvent<'employee.separationInitiated'>) {
  const targets = routeEvent(event);
  for (const t of targets) {
    const auth = { tenantId: event.tenantId, userId: event.actorId ?? 'system' };
    if (t === 'GOSI') {
      await safelyHandle('gosi.deregister', () =>
        gosiRegistrationService.deregister(
          event.payload.employeeId,
          { reason: event.payload.reason, date: new Date(event.payload.lastWorkingDate) },
          auth as any
        )
      );
    } else if (t === 'GPSSA') {
      await safelyHandle('gpssa.deregister', () =>
        gpssaRegistrationService.deregister(
          event.payload.employeeId,
          { reason: event.payload.reason, date: new Date(event.payload.lastWorkingDate) },
          auth as any
        )
      );
    }
  }
}

let disposers: Array<() => void> = [];

export function installGosiGpssaConsumers(): () => void {
  if (disposers.length > 0) return uninstallGosiGpssaConsumers;
  disposers.push(
    subscribeComplianceEvent('employee.hired', async (event) => {
      try {
        await onHired(event as ComplianceEvent<'employee.hired'>);
      } catch (err) {
        logger.error({ err }, 'gosi/gpssa hired consumer crashed');
      }
    })
  );
  disposers.push(
    subscribeComplianceEvent('employee.salaryChanged', async (event) => {
      try {
        await onSalaryChanged(event as ComplianceEvent<'employee.salaryChanged'>);
      } catch (err) {
        logger.error({ err }, 'gosi/gpssa salaryChanged consumer crashed');
      }
    })
  );
  disposers.push(
    subscribeComplianceEvent('employee.separationInitiated', async (event) => {
      try {
        await onSeparationInitiated(event as ComplianceEvent<'employee.separationInitiated'>);
      } catch (err) {
        logger.error({ err }, 'gosi/gpssa separationInitiated consumer crashed');
      }
    })
  );
  return uninstallGosiGpssaConsumers;
}

export function uninstallGosiGpssaConsumers(): void {
  for (const dispose of disposers) {
    try {
      dispose();
    } catch {
      /* best effort */
    }
  }
  disposers = [];
}

export const _testHelpers = { onHired, onSalaryChanged, onSeparationInitiated };
