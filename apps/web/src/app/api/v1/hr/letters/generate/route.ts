import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/hr/letters/generate
 * Generate a letter for an employee from a template
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    const { templateId, employeeId, variables, options } = body;

    if (!templateId || !employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'templateId and employeeId are required' },
        },
        { status: 400 }
      );
    }

    // Get the template
    const template = await prisma.letterTemplate.findFirst({
      where: { id: templateId, tenantId: user.tenantId, status: 'Active' },
    });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Letter template not found or inactive' },
        },
        { status: 404 }
      );
    }

    // Get employee details
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false },
      include: {
        department: { select: { name: true } },
        jobProfile: { select: { title: true } },
        grade: { select: { name: true } },
        location: { select: { name: true } },
        company: { select: { name: true } },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Employee not found' } },
        { status: 404 }
      );
    }

    // Create letter record
    const letterNumber = `LTR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const letter = await prisma.letter.create({
      data: {
        tenantId: user.tenantId,
        letterNumber,
        employeeId,
        templateId,
        letterType: template.category,
        subject: template.name,
        content: template.content, // In production, replace template variables
        variables: variables || {},
        status: 'DRAFT',
        generatedBy: user.id,
        letterDate: options?.letterDate ? new Date(options.letterDate) : new Date(),
        isConfidential: options?.isConfidential ?? false,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        template: { select: { id: true, name: true, category: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: letter,
        message: 'Letter generated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Letter Generate API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to generate letter',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
