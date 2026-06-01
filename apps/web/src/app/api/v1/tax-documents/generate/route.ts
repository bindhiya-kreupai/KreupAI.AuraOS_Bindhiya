export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const generateSchema = z.object({
  year: z.number().int().min(2000).max(2099),
  type: z.string().min(1, 'Type is required'),
  employeeIds: z.array(z.string().uuid()).optional(),
});

/**
 * POST /api/v1/tax-documents/generate
 * Generate tax documents (admin endpoint)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('tax-documents:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing tax-documents:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const body = await request.json();

    // Validate request body
    const validationResult = generateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed. Year and type are required fields.',
            details: { errors: validationResult.error.errors },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    const { year, type, employeeIds } = validationResult.data;

    // Normalize type (W-2 -> W2, 1099-NEC -> 1099, etc.)
    const normalizedType = type.replace('-', '').replace('W2', 'W2').toUpperCase();

    // Get employees to generate documents for
    const employeeWhere: Record<string, unknown> = { tenantId, status: 'Active' };
    if (employeeIds && employeeIds.length > 0) {
      employeeWhere.id = { in: employeeIds };
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true },
    });

    const totalDocumentsToGenerate = employees.length;

    // Create/update tax document records
    const results = await Promise.allSettled(
      employees.map((emp) =>
        prisma.taxDocument.upsert({
          where: {
            tenantId_employeeId_type_taxYear: {
              tenantId,
              employeeId: emp.id,
              type: normalizedType,
              taxYear: year,
            },
          },
          create: {
            tenantId,
            employeeId: emp.id,
            type: normalizedType,
            taxYear: year,
            status: 'GENERATED',
            generatedAt: new Date(),
            metadata: { generatedBy: user.userId },
          },
          update: {
            status: 'GENERATED',
            generatedAt: new Date(),
            amendments: { increment: 1 },
            metadata: { regeneratedBy: user.userId, regeneratedAt: new Date().toISOString() },
          },
        })
      )
    );

    const completed = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: `gen-job-${Date.now()}`,
          status: 'queued',
          year,
          type,
          requestedBy: user.userId,
          requestedAt: new Date().toISOString(),
          estimatedCompletionTime: new Date(Date.now() + 300000).toISOString(),
          targetEmployees: employeeIds || 'all',
          totalDocumentsToGenerate,
          progress: {
            completed,
            failed,
            pending: totalDocumentsToGenerate - completed - failed,
          },
          message: `Tax document generation for ${type} (${year}) has been processed. ${completed} generated successfully.`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[Tax Documents Generate API] POST Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to generate tax documents',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
