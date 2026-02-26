/**
 * Payroll Service — Event Publishers
 *
 * Provides typed publisher functions that wrap the @aura/events RabbitMQ bus
 * to emit payroll domain events consumed by notification, analytics, and GL
 * posting services.
 *
 * Exchange topology:
 *   Exchange : aura.payroll (topic)
 *   Routing keys:
 *     payroll.run.initiated       — a new payroll run has been kicked off
 *     payroll.run.completed       — payroll has been fully processed & approved
 *     payroll.payslip.generated   — individual payslip PDF has been generated
 *
 * @module payroll-service/events
 */

import { getRabbitMQEventBus, RabbitMQEventBus } from '@aura/events';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Exchange constant
// ---------------------------------------------------------------------------

export const PAYROLL_EXCHANGE = 'aura.payroll';
export const PAYROLL_DLX = 'aura.payroll.dlx';

// ---------------------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------------------

export interface PayrollRunInitiatedEvent {
  eventType: 'payroll.run.initiated';
  payrollRunId: string;
  tenantId: string;
  month: number;
  year: number;
  employeeCount: number;
  initiatedBy: string;
  initiatedAt: string;   // ISO-8601
}

export interface PayrollRunCompletedEvent {
  eventType: 'payroll.run.completed';
  payrollRunId: string;
  tenantId: string;
  month: number;
  year: number;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  currency: string;
  processedBy: string;
  completedAt: string;   // ISO-8601
}

export interface PayslipGeneratedEvent {
  eventType: 'payroll.payslip.generated';
  payslipId: string;
  payrollRunId: string;
  tenantId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  month: number;
  year: number;
  gross: number;
  deductions: number;
  net: number;
  currency: string;
  pdfUrl: string;
  generatedAt: string;   // ISO-8601
}

// ---------------------------------------------------------------------------
// Publisher class
// ---------------------------------------------------------------------------

/**
 * PayrollEventPublisher
 *
 * Initialises the exchange/queues on first use and provides typed publish
 * methods for every payroll domain event.
 */
export class PayrollEventPublisher {
  private bus: RabbitMQEventBus;
  private initialised = false;

  constructor(bus?: RabbitMQEventBus) {
    this.bus = bus ?? getRabbitMQEventBus();
  }

  /**
   * Declare exchanges and queues once on startup.
   * Idempotent — safe to call multiple times.
   */
  async initialise(): Promise<void> {
    if (this.initialised) return;

    // Primary topic exchange
    await this.bus.createExchange(PAYROLL_EXCHANGE, 'topic', { durable: true });

    // Dead-letter exchange for failed messages
    await this.bus.createExchange(PAYROLL_DLX, 'fanout', { durable: true });
    await this.bus.createQueue('aura.payroll.dead-letter', {
      durable: true,
    });

    // Durable queues with DLQ support
    await this.bus.createQueue('payroll.runs', {
      durable: true,
      deadLetterExchange: PAYROLL_DLX,
      messageTtl: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await this.bus.createQueue('payroll.payslips', {
      durable: true,
      deadLetterExchange: PAYROLL_DLX,
      messageTtl: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    this.initialised = true;
    console.info('[PayrollEventPublisher] Exchange topology ready');
  }

  // -------------------------------------------------------------------------
  // Publishers
  // -------------------------------------------------------------------------

  async publishRunInitiated(params: {
    payrollRunId: string;
    tenantId: string;
    month: number;
    year: number;
    employeeCount: number;
    initiatedBy: string;
  }): Promise<void> {
    const event: PayrollRunInitiatedEvent = {
      eventType: 'payroll.run.initiated',
      ...params,
      initiatedAt: new Date().toISOString(),
    };

    await this.bus.publish(PAYROLL_EXCHANGE, 'payroll.run.initiated', event, {
      correlationId: randomUUID(),
      persistent: true,
    });
  }

  async publishRunCompleted(params: {
    payrollRunId: string;
    tenantId: string;
    month: number;
    year: number;
    employeeCount: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    currency: string;
    processedBy: string;
  }): Promise<void> {
    const event: PayrollRunCompletedEvent = {
      eventType: 'payroll.run.completed',
      ...params,
      completedAt: new Date().toISOString(),
    };

    await this.bus.publish(PAYROLL_EXCHANGE, 'payroll.run.completed', event, {
      correlationId: randomUUID(),
      persistent: true,
    });
  }

  async publishPayslipGenerated(params: {
    payslipId: string;
    payrollRunId: string;
    tenantId: string;
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    month: number;
    year: number;
    gross: number;
    deductions: number;
    net: number;
    currency: string;
    pdfUrl: string;
  }): Promise<void> {
    const event: PayslipGeneratedEvent = {
      eventType: 'payroll.payslip.generated',
      ...params,
      generatedAt: new Date().toISOString(),
    };

    await this.bus.publish(PAYROLL_EXCHANGE, 'payroll.payslip.generated', event, {
      correlationId: randomUUID(),
      persistent: true,
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let publisherInstance: PayrollEventPublisher | null = null;

export function getPayrollEventPublisher(): PayrollEventPublisher {
  if (!publisherInstance) {
    publisherInstance = new PayrollEventPublisher();
  }
  return publisherInstance;
}
