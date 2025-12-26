/**
 * Payroll Processing Job
 * Handles async payroll calculation and processing
 */

import { Job, JobResult, queueService } from '../queue.service';
import { QUEUE_NAMES } from '../rabbitmq';
import { logger } from '@/lib/logger';
import { apiCache } from '@/lib/middleware/cache.middleware';

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

    // TODO: Implement actual payroll calculation
    // This is a mock implementation showing the structure

    // Step 1: Get employees to process
    const employees = await getEmployeesForPayroll(companyId, employeeIds);
    logger.info({ jobId: job.id, employeeCount: employees.length }, 'Employees loaded');

    // Step 2: Calculate payroll for each employee
    const calculations: any[] = [];
    let successCount = 0;
    let failCount = 0;
    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;

    for (const employee of employees) {
      try {
        const calculation = await calculateEmployeePayroll(
          employee,
          month,
          countryCode
        );

        calculations.push(calculation);
        successCount++;
        totalGross += calculation.grossPay;
        totalNet += calculation.netPay;
        totalDeductions += calculation.totalDeductions;

        logger.debug(
          { employeeId: employee.id, grossPay: calculation.grossPay },
          'Employee payroll calculated'
        );
      } catch (error) {
        failCount++;
        logger.error(
          { error, employeeId: employee.id },
          'Failed to calculate employee payroll'
        );
      }
    }

    // Step 3: Create payroll run record
    const runId = crypto.randomUUID();
    await createPayrollRun({
      runId,
      tenantId,
      companyId,
      month,
      employeeCount: employees.length,
      calculations,
      userId,
    });

    // Step 4: Invalidate caches
    await apiCache.invalidatePayrollCaches(companyId);

    // Step 5: Send notifications
    await queueService.enqueue(QUEUE_NAMES.EMAIL_NOTIFICATIONS, 'PAYROLL_COMPLETED', {
      runId,
      userId,
      companyId,
      month,
      summary: {
        totalEmployees: employees.length,
        successfulCalculations: successCount,
        failedCalculations: failCount,
      },
    });

    const duration = Math.round(performance.now() - startTime);

    logger.info(
      {
        jobId: job.id,
        runId,
        employeeCount: employees.length,
        successCount,
        failCount,
        duration,
      },
      'Payroll processing completed'
    );

    const result: PayrollJobResult = {
      runId,
      month,
      totalEmployees: employees.length,
      successfulCalculations: successCount,
      failedCalculations: failCount,
      totalGrossPay: totalGross,
      totalNetPay: totalNet,
      totalDeductions: totalDeductions,
      completedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: result,
      duration,
    };
  } catch (error) {
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

/**
 * Mock: Get employees for payroll processing
 */
async function getEmployeesForPayroll(
  companyId: string,
  employeeIds?: string[]
): Promise<any[]> {
  // TODO: Replace with actual database query
  // const employees = await prisma.employee.findMany({
  //   where: {
  //     companyId,
  //     id: employeeIds ? { in: employeeIds } : undefined,
  //     status: 'ACTIVE',
  //   },
  //   include: {
  //     salaryStructure: true,
  //     attendanceRecords: true,
  //     leaveRecords: true,
  //   },
  // });

  // Mock data
  return Array.from({ length: 50 }, (_, i) => ({
    id: crypto.randomUUID(),
    employeeCode: `EMP${(i + 1).toString().padStart(3, '0')}`,
    firstName: `Employee ${i + 1}`,
    basicSalary: 5000 + i * 100,
  }));
}

/**
 * Mock: Calculate payroll for single employee
 */
async function calculateEmployeePayroll(
  employee: any,
  month: string,
  countryCode: string
): Promise<any> {
  // TODO: Use actual payroll service
  // const calculation = await payrollService.calculateEmployeePayroll({
  //   employee,
  //   month,
  //   countryCode,
  // });

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock calculation
  const basicSalary = employee.basicSalary || 5000;
  const hra = basicSalary * 0.4;
  const ta = 300;
  const ma = 200;
  const grossPay = basicSalary + hra + ta + ma;

  const pf = basicSalary * 0.12;
  const esi = grossPay * 0.0075;
  const pt = grossPay > 10000 ? 200 : 0;
  const totalDeductions = pf + esi + pt;

  const netPay = grossPay - totalDeductions;

  return {
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    month,
    basicSalary,
    earnings: {
      hra,
      ta,
      ma,
    },
    grossPay,
    deductions: {
      pf,
      esi,
      pt,
    },
    totalDeductions,
    netPay,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Mock: Create payroll run record
 */
async function createPayrollRun(data: any): Promise<void> {
  // TODO: Replace with actual database insert
  // await prisma.payrollRun.create({
  //   data: {
  //     id: data.runId,
  //     tenantId: data.tenantId,
  //     companyId: data.companyId,
  //     month: data.month,
  //     employeeCount: data.employeeCount,
  //     status: 'PENDING_APPROVAL',
  //     calculations: data.calculations,
  //     createdBy: data.userId,
  //   },
  // });

  logger.info({ runId: data.runId }, 'Payroll run created');
}

// Register the job handler
queueService.registerHandler('PAYROLL_PROCESSING', processPayrollJob);
