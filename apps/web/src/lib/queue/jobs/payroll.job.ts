/**
 * Payroll Processing Job
 * Handles async payroll calculation and processing via PayrollService
 */

import { Job, JobResult, queueService } from '../queue.service';
import { QUEUE_NAMES } from '../rabbitmq';
import { logger } from '@/lib/logger';
import { apiCache } from '@/lib/middleware/cache.middleware';
import { PayrollService } from '@/lib/services/payroll/payroll.service';
import { prisma } from '@aura/database';
import type { SupportedCountryCode } from '@/lib/services/compliance/types';

export interface PayrollJobData {
  tenantId: string;
  companyId: string;
  month: string; // YYYY-MM format
  countryCode: string;
  employeeIds?: string[];
  userId: string; // User who initiated the payroll
}

export interface PayrollJobResult {
  runId: string;
  month: string;
  totalEmployees: number;
  successfulCalculations: number;
  failedCalculations: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  completedAt: string;
}

/**
 * Payroll processing job handler
 */
export async function processPayrollJob(job: Job<PayrollJobData>): Promise<JobResult> {
  const startTime = performance.now();
  const { tenantId, companyId, month, countryCode, employeeIds, userId } = job.data;

  try {
    logger.info(
      { jobId: job.id, companyId, month, employeeIds: employeeIds?.length },
      'Starting payroll processing'
    );

    // Step 1: Validate payroll configuration exists
    const config = await prisma.payrollConfiguration.findFirst({
      where: { tenantId, companyId },
    });

    if (!config) {
      throw new Error(`No payroll configuration found for company ${companyId}`);
    }

    // Step 2: Check for duplicate runs (idempotency)
    const existingRun = await prisma.payrollRun.findFirst({
      where: {
        tenantId,
        configId: config.id,
        payrollMonth: month,
        isDeleted: false,
        status: { notIn: ['CANCELLED'] },
      },
    });

    if (existingRun) {
      throw new Error(
        `Payroll run already exists for ${month} (ID: ${existingRun.id}, status: ${existingRun.status})`
      );
    }

    // Step 3: Run the calculation engine
    logger.info({ jobId: job.id }, 'Running payroll calculation engine');

    const payrollResult = await PayrollService.processPayroll({
      tenantId,
      companyId,
      month,
      countryCode: countryCode as SupportedCountryCode,
      employeeIds,
    });

    logger.info(
      {
        jobId: job.id,
        employeeCount: payrollResult.totalEmployees,
        totalGross: payrollResult.totalGross,
        totalNet: payrollResult.totalNet,
      },
      'Payroll calculation complete'
    );

    // Step 4: Persist PayrollRun and Payslips to database
    const run = await prisma.payrollRun.create({
      data: {
        tenantId,
        configId: config.id,
        payrollMonth: month,
        status: 'CALCULATED',
        processedAt: new Date(),
        totalEmployees: payrollResult.totalEmployees,
        totalGrossSalary: payrollResult.totalGross,
        totalDeductions: payrollResult.totalDeductions,
        totalNetSalary: payrollResult.totalNet,
        totalEmployerCost: payrollResult.totalStatutory + payrollResult.totalNet,
        currency: payrollResult.currency,
        createdBy: userId,
      },
    });

    // Persist individual payslips
    if (payrollResult.payslips.length > 0) {
      await prisma.payslip.createMany({
        data: payrollResult.payslips.map(p => ({
          payrollRunId: run.id,
          employeeId: p.employeeId,
          employeeCode: p.employeeCode,
          employeeName: p.employeeName,
          basicSalary: p.basicSalary,
          earnings: p.earnings as any,
          totalEarnings: p.totalEarnings,
          deductions: p.deductions as any,
          totalDeductions: p.totalDeductions,
          // Statutory — employee
          employeePF: p.statutoryDeductions.find(s => s.code === 'PF_EMPLOYEE')?.employeeAmount || 0,
          employeeESI: p.statutoryDeductions.find(s => s.code === 'ESI')?.employeeAmount || 0,
          employeeTDS: p.taxDetails?.monthlyTds || 0,
          employeeSaned: p.statutoryDeductions.find(s => s.code === 'GOSI_SANED')?.employeeAmount || 0,
          employeePension: p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employeeAmount || 0,
          totalStatutoryEmployee: p.totalStatutory,
          // Statutory — employer
          employerPF: p.statutoryDeductions.find(s => s.code === 'PF_EMPLOYEE')?.employerAmount || 0,
          employerESI: p.statutoryDeductions.find(s => s.code === 'ESI')?.employerAmount || 0,
          employerGOSI:
            (p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employerAmount || 0) +
            (p.statutoryDeductions.find(s => s.code === 'GOSI_SANED')?.employerAmount || 0) +
            (p.statutoryDeductions.find(s => s.code === 'GOSI_OCC_HAZARDS')?.employerAmount || 0),
          employerPension: p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employerAmount || 0,
          totalStatutoryEmployer: p.statutoryDeductions.reduce((sum, s) => sum + s.employerAmount, 0),
          // Totals
          grossSalary: p.grossSalary,
          netSalary: p.netSalary,
          // Working days
          workingDays: p.totalWorkingDays,
          paidDays: p.daysWorked + p.paidLeaveDays,
          lopDays: p.lopDays,
          overtimeHours: 0,
          overtimeAmount: 0,
          // Status
          status: 'CALCULATED',
          createdBy: userId,
        })),
      });
    }

    logger.info(
      { jobId: job.id, runId: run.id, payslipCount: payrollResult.payslips.length },
      'Payroll run and payslips persisted'
    );

    // Step 5: Invalidate caches
    await apiCache.invalidatePayrollCaches(companyId);

    // Step 6: Send completion notification
    await queueService.enqueue(QUEUE_NAMES.EMAIL_NOTIFICATIONS, 'PAYROLL_COMPLETED', {
      runId: run.id,
      userId,
      companyId,
      month,
      summary: {
        totalEmployees: payrollResult.totalEmployees,
        successfulCalculations: payrollResult.payslips.length,
        failedCalculations: payrollResult.totalEmployees - payrollResult.payslips.length,
      },
    });

    const duration = Math.round(performance.now() - startTime);

    logger.info(
      {
        jobId: job.id,
        runId: run.id,
        employeeCount: payrollResult.totalEmployees,
        payslipCount: payrollResult.payslips.length,
        duration,
      },
      'Payroll processing completed'
    );

    const result: PayrollJobResult = {
      runId: run.id,
      month,
      totalEmployees: payrollResult.totalEmployees,
      successfulCalculations: payrollResult.payslips.length,
      failedCalculations: payrollResult.totalEmployees - payrollResult.payslips.length,
      totalGrossPay: payrollResult.totalGross,
      totalNetPay: payrollResult.totalNet,
      totalDeductions: payrollResult.totalDeductions,
      completedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: result,
      duration,
    };
  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime);

    logger.error(
      { error, jobId: job.id, companyId, month, duration },
      'Payroll processing failed'
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    };
  }
}

// Register the job handler
queueService.registerHandler('PAYROLL_PROCESSING', processPayrollJob);
