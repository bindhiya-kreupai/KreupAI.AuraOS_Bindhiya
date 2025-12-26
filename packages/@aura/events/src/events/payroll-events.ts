/**
 * Payroll Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

export type PayrollEventType =
  | 'PayrollInitiated'
  | 'PayrollCalculated'
  | 'PayrollApproved'
  | 'PayrollProcessed'
  | 'PayrollReleased'
  | 'PayslipGenerated'
  | 'PaymentCompleted';

export interface PayrollInitiatedPayload {
  payrollId: string;
  month: number;
  year: number;
  employeeCount: number;
  initiatedBy: string;
}

export interface PayrollCalculatedPayload {
  payrollId: string;
  month: number;
  year: number;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  calculatedBy: string;
  calculatedAt: Date;
}

export interface PayrollProcessedPayload {
  payrollId: string;
  month: number;
  year: number;
  employeeCount: number;
  totalAmount: number;
  processedBy: string;
  processedAt: Date;
}

export interface PayslipGeneratedPayload {
  payslipId: string;
  payrollId: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  gross: number;
  deductions: number;
  net: number;
  pdfUrl: string;
}

export function createPayrollProcessedEvent(
  tenantId: string,
  userId: string,
  payload: PayrollProcessedPayload
): Omit<DomainEvent<PayrollProcessedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'PayrollProcessed',
    aggregateId: payload.payrollId,
    aggregateType: 'Payroll',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createPayslipGeneratedEvent(
  tenantId: string,
  userId: string,
  payload: PayslipGeneratedPayload
): Omit<DomainEvent<PayslipGeneratedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'PayslipGenerated',
    aggregateId: payload.payslipId,
    aggregateType: 'Payslip',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
