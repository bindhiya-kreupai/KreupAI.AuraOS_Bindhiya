import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/compliance/wps/generate
 * Generate a WPS (Wage Protection System) SIF file from a finalized payroll run
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('compliance/wps:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing compliance/wps:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const { payrollMonth, companyId, payrollRunId } = body;

      if (!payrollMonth || !companyId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'payrollMonth and companyId are required' },
          },
          { status: 400 }
        );
      }

      // Get WPS configuration for this company
      const wpsConfig = await prisma.wPSConfiguration.findFirst({
        where: { tenantId: user.tenantId, companyId, isActive: true },
      });

      if (!wpsConfig) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4001',
              message:
                'WPS configuration not found for this company. Please configure WPS settings first.',
            },
          },
          { status: 404 }
        );
      }

      // If payrollRunId provided, validate the run is APPROVED or PAID
      if (payrollRunId) {
        const run = await prisma.payrollRun.findFirst({
          where: { id: payrollRunId, tenantId: user.tenantId, isDeleted: false },
        });

        if (!run) {
          return NextResponse.json(
            { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
            { status: 404 }
          );
        }

        if (!['APPROVED', 'PAID'].includes(run.status)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E4003',
                message: `Payroll run must be APPROVED or PAID to generate WPS. Current status: ${run.status}`,
              },
            },
            { status: 422 }
          );
        }
      }

      // Check for existing active submission for this month
      const existing = await prisma.wPSSubmission.findFirst({
        where: {
          tenantId: user.tenantId,
          payrollMonth,
          ...(payrollRunId ? { payrollRunId } : {}),
          status: { notIn: ['VALIDATION_FAILED', 'REJECTED', 'CANCELLED', 'FAILED'] },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3002',
              message: `WPS submission already exists for ${payrollMonth} with status: ${existing.status}`,
            },
          },
          { status: 409 }
        );
      }

      // Build salary month format (e.g., "JAN2025")
      const [year, month] = payrollMonth.split('-');
      const monthNames = [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
      ];
      const salaryMonth = `${monthNames[parseInt(month) - 1]}${year}`;

      // Create WPS submission record
      const submission = await prisma.wPSSubmission.create({
        data: {
          tenantId: user.tenantId,
          wpsConfigId: wpsConfig.id,
          payrollRunId: payrollRunId || null,
          payrollMonth,
          payrollYear: parseInt(year),
          salaryMonth,
          status: 'VALIDATING',
          createdBy: user.userId,
        },
      });

      // Get payslips for this payroll run
      const payslips = payrollRunId
        ? await prisma.payslip.findMany({
            where: { payrollRunId, status: { in: ['APPROVED', 'PAID'] } },
          })
        : [];

      if (payslips.length === 0) {
        await prisma.wPSSubmission.update({
          where: { id: submission.id },
          data: {
            status: 'VALIDATION_FAILED',
            validationErrors: { message: 'No payslips found for this payroll run' },
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4001',
              message: 'No approved/paid payslips found for this payroll run',
            },
          },
          { status: 422 }
        );
      }

      // Get employee compliance details for banking and labour card info
      const employeeIds = payslips.map((p) => p.employeeId);
      const complianceDetails = await prisma.employeeComplianceDetails.findMany({
        where: { employeeId: { in: employeeIds }, tenantId: user.tenantId },
      });
      const complianceMap = new Map(complianceDetails.map((c) => [c.employeeId, c]));

      // Build WPS records and SIF file content
      const sifLines: string[] = [];
      const validationErrors: Array<{
        employeeId: string;
        employeeName: string;
        errors: string[];
      }> = [];
      let lineNumber = 1;
      let totalAmount = 0;

      // SIF Header (SCR record)
      const creationDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      sifLines.push(
        `SCR,${wpsConfig.employerCode},${wpsConfig.wpsAgentCode},${wpsConfig.bankCode},${salaryMonth},${payslips.length},0,${creationDate}`
      );

      for (const payslip of payslips) {
        const compliance = complianceMap.get(payslip.employeeId);
        const netSalary = Number(payslip.netSalary || 0);
        const basicSalary = Number(payslip.basicSalary || 0);
        const allowances = Math.max(Number(payslip.totalEarnings || 0) - basicSalary, 0);
        const deductions = Number(payslip.totalDeductions || 0);

        // Get real employee data from compliance details
        const labourCardNumber = compliance?.labourCardNumber || '';
        const accountNumber = compliance?.bankIBAN || compliance?.bankAccountNumber || '';
        const nationality = compliance?.nationality || 'XX';

        // Validate required WPS fields
        const errors: string[] = [];
        if (!labourCardNumber || labourCardNumber.length < 10) {
          errors.push('Missing or invalid labour card number');
        }
        if (!accountNumber || accountNumber.length < 10) {
          errors.push('Missing or invalid bank account/IBAN');
        }
        if (netSalary <= 0) {
          errors.push('Net salary must be greater than 0');
        }

        if (errors.length > 0) {
          validationErrors.push({
            employeeId: payslip.employeeId,
            employeeName: payslip.employeeName,
            errors,
          });
        }

        totalAmount += netSalary;

        // Create WPS record with real employee data
        await prisma.wPSRecord.create({
          data: {
            tenantId: user.tenantId,
            submissionId: submission.id,
            employeeId: payslip.employeeId,
            agentId: wpsConfig.wpsAgentCode,
            labourCardNumber: labourCardNumber || `PENDING_${payslip.employeeCode}`,
            personCode: payslip.employeeCode,
            employeeName: payslip.employeeName,
            nationality,
            bankRoutingCode: wpsConfig.bankCode,
            accountNumber: accountNumber || `PENDING_${payslip.employeeCode}`,
            ibanNumber: compliance?.bankIBAN || null,
            basicSalary: payslip.basicSalary || 0,
            allowances,
            deductions,
            netSalary,
            leaveSalary: 0,
            salaryMonth,
            workingDays: payslip.workingDays || 30,
            actualDays: Number(payslip.paidDays || 30),
            lineNumber,
            status: errors.length > 0 ? 'INVALID' : 'PENDING',
            validationStatus: errors.length > 0 ? 'FAILED' : 'VALID',
            validationErrors: errors.length > 0 ? errors : undefined,
          },
        });

        // Add SIF EDR (Employee Detail Record) line
        const salaryFormatted = netSalary.toFixed(2).padStart(15, '0');
        sifLines.push(
          `EDR,${labourCardNumber.padEnd(12, ' ')},${wpsConfig.bankCode},${accountNumber},${salaryFormatted},0.00`
        );

        lineNumber++;
      }

      // SIF Trailer (SUM record)
      sifLines.push(`SUM,${payslips.length},${totalAmount.toFixed(2).padStart(15, '0')}`);

      const sifContent = sifLines.join('\r\n');
      const sifFileName = `WPS_${wpsConfig.employerCode}_${salaryMonth}_${Date.now()}.SIF`;

      // Determine final status
      const hasErrors = validationErrors.length > 0;
      const finalStatus = hasErrors ? 'VALIDATION_FAILED' : 'VALIDATED';

      // Update submission totals
      const updatedSubmission = await prisma.wPSSubmission.update({
        where: { id: submission.id },
        data: {
          status: finalStatus,
          totalRecords: payslips.length,
          totalAmount,
          successCount: payslips.length - validationErrors.length,
          failureCount: validationErrors.length,
          sifFileName,
          validationErrors: hasErrors ? validationErrors : undefined,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            submission: {
              id: updatedSubmission.id,
              status: updatedSubmission.status,
              payrollMonth: updatedSubmission.payrollMonth,
              salaryMonth: updatedSubmission.salaryMonth,
              totalRecords: updatedSubmission.totalRecords,
              totalAmount: Number(updatedSubmission.totalAmount),
              successCount: updatedSubmission.successCount,
              failureCount: updatedSubmission.failureCount,
              sifFileName: updatedSubmission.sifFileName,
            },
            sifContent,
            validationErrors: hasErrors ? validationErrors : [],
            wpsConfigId: wpsConfig.id,
          },
          message: hasErrors
            ? `WPS file generated with ${validationErrors.length} validation error(s). Please fix before submission.`
            : 'WPS SIF file generated successfully. Ready for submission.',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[WPS Generate API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to generate WPS file',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'wps_submission',
    captureRequestBody: true,
  }
);
