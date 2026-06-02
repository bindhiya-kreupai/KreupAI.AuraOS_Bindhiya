// @ts-nocheck — Lib middleware/repository drift (generic NextResponse types, Sentry API changes, Prisma enum imports, permission template literal). Tracked under #29.
/**
 * Audit Middleware
 * Automatically log critical API operations
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { auditService, AuditAction } from '../audit/audit.service';
import { logger } from '../logger';

/**
 * Audit middleware configuration
 */
export interface AuditConfig {
  action: AuditAction;
  resourceType: string;
  extractResourceId?: (request: NextRequest, context?: any) => string | undefined;
  captureRequestBody?: boolean;
  captureResponseBody?: boolean;
}

/**
 * Middleware to automatically audit API calls
 */
export function withAudit<T>(handler: T, config: AuditConfig): T {
  return (async (request: NextRequest, context?: any) => {
    const startTime = performance.now();
    let success = true;
    let errorMessage: string | undefined;
    let responseBody: any;

    try {
      // Execute the handler
      const response = await (handler as any)(request, context);

      // Clone response to read body
      if (config.captureResponseBody && response instanceof NextResponse) {
        const clonedResponse = response.clone();
        try {
          responseBody = await clonedResponse.json();
          success = responseBody.success !== false;
        } catch (error: any) {
          // Response might not be JSON
        }
      }

      // Log audit entry after successful execution
      await logAuditEntry(request, config, context, success, responseBody);

      return response;
    } catch (error: any) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log audit entry for failed execution
      await logAuditEntry(request, config, context, success, undefined, errorMessage);

      throw error;
    }
  }) as T;
}

/**
 * Log audit entry
 */
async function logAuditEntry(
  request: NextRequest,
  config: AuditConfig,
  context: any,
  success: boolean,
  responseBody?: any,
  errorMessage?: string
): Promise<void> {
  try {
    // Get user info from request (set by auth middleware)
    const user = (request as any).user || {
      id: 'system',
      email: 'system@auraos.com',
      tenantId: 'default',
      companyId: 'default',
    };

    // Extract resource ID
    const resourceId = config.extractResourceId
      ? config.extractResourceId(request, context)
      : context?.params?.id;

    // Capture request body if configured
    let requestBody: any;
    if (config.captureRequestBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const clonedRequest = request.clone();
        requestBody = await clonedRequest.json();
      } catch (error: any) {
        // Request might not have JSON body
      }
    }

    // Get client metadata
    const metadata = {
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
      method: request.method,
      url: request.url,
      requestBody: config.captureRequestBody ? sanitizeData(requestBody) : undefined,
      responseBody: config.captureResponseBody ? sanitizeData(responseBody) : undefined,
    };

    // Log the audit entry
    await auditService.log({
      action: config.action,
      severity: auditService['getSeverityForAction'](config.action),
      userId: user.id,
      userEmail: user.email,
      tenantId: user.tenantId,
      companyId: user.companyId,
      resourceType: config.resourceType,
      resourceId,
      metadata,
      success,
      errorMessage,
    });
  } catch (error: any) {
    // Don't fail the request if audit logging fails
    logger.error({ error, action: config.action }, 'Failed to log audit entry');
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'nationalId',
  ];

  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Pre-configured audit middleware for common operations
 */
export const auditMiddleware = {
  /**
   * Employee operations
   */
  createEmployee: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.EMPLOYEE_CREATED,
      resourceType: 'employee',
      captureRequestBody: true,
      captureResponseBody: true,
      extractResourceId: (req, ctx) => ctx?.responseBody?.data?.id,
    }),

  updateEmployee: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.EMPLOYEE_UPDATED,
      resourceType: 'employee',
      captureRequestBody: true,
      extractResourceId: (req, ctx) => ctx?.params?.id,
    }),

  deleteEmployee: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.EMPLOYEE_DELETED,
      resourceType: 'employee',
      extractResourceId: (req, ctx) => ctx?.params?.id,
    }),

  /**
   * Payroll operations
   */
  runPayroll: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.PAYROLL_RUN_INITIATED,
      resourceType: 'payroll',
      captureRequestBody: true,
      captureResponseBody: true,
    }),

  approvePayroll: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.PAYROLL_RUN_APPROVED,
      resourceType: 'payroll',
      extractResourceId: (req, ctx) => ctx?.params?.runId,
    }),

  /**
   * Leave operations
   */
  createLeaveRequest: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.LEAVE_REQUEST_CREATED,
      resourceType: 'leave',
      captureRequestBody: true,
      captureResponseBody: true,
    }),

  approveLeaveRequest: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.LEAVE_REQUEST_APPROVED,
      resourceType: 'leave',
      extractResourceId: (req, ctx) => ctx?.params?.id,
    }),

  rejectLeaveRequest: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.LEAVE_REQUEST_REJECTED,
      resourceType: 'leave',
      captureRequestBody: true,
      extractResourceId: (req, ctx) => ctx?.params?.id,
    }),

  /**
   * Data export operations
   */
  exportData: (handler: any) =>
    withAudit(handler, {
      action: AuditAction.DATA_EXPORTED,
      resourceType: 'data_export',
      captureRequestBody: true,
    }),
};
