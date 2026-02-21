import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch all onboarding programs for the tenant
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const department = searchParams.get('department');
      const isActive = searchParams.get('isActive');
      const isTemplate = searchParams.get('isTemplate');

      const where: Record<string, unknown> = { tenantId };
      if (department) where.department = department;
      if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true';
      if (isTemplate !== null && isTemplate !== undefined) where.isTemplate = isTemplate === 'true';

      const programs = await prisma.onboardingProgram.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ programs }, { status: 200 });
    } catch (error) {
      console.error('Error fetching onboarding programs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding programs' },
        { status: 500 }
      );
    }
  }
);

// POST - Create a new onboarding program
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();

      const program = await prisma.onboardingProgram.create({
        data: {
          tenantId,
          programCode: body.programCode,
          programName: body.programName,
          description: body.description || '',
          department: body.department || null,
          position: body.position || null,
          grade: body.grade || null,
          employeeType: body.employeeType || null,
          isTemplate: body.isTemplate ?? false,
          durationDays: body.durationDays ?? 90,
          phases: body.phases || [],
          checklistTemplate: body.checklistTemplate || {},
          documentsRequired: body.documentsRequired || [],
          equipmentRequired: body.equipmentRequired || [],
          accessRequired: body.accessRequired || [],
          trainingModules: body.trainingModules || [],
          buddyRequired: body.buddyRequired ?? false,
          surveySchedule: body.surveySchedule || [],
          isActive: body.isActive ?? true,
          createdBy: user.userId,
        },
      });

      return NextResponse.json({ program }, { status: 201 });
    } catch (error) {
      console.error('Error creating onboarding program:', error);
      return NextResponse.json(
        { error: 'Failed to create onboarding program' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update an existing onboarding program
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Program ID is required' },
          { status: 400 }
        );
      }

      // Verify the program belongs to this tenant
      const existing = await prisma.onboardingProgram.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Onboarding program not found' },
          { status: 404 }
        );
      }

      const program = await prisma.onboardingProgram.update({
        where: { id },
        data: {
          ...(updateFields.programCode !== undefined && { programCode: updateFields.programCode }),
          ...(updateFields.programName !== undefined && { programName: updateFields.programName }),
          ...(updateFields.description !== undefined && { description: updateFields.description }),
          ...(updateFields.department !== undefined && { department: updateFields.department }),
          ...(updateFields.position !== undefined && { position: updateFields.position }),
          ...(updateFields.grade !== undefined && { grade: updateFields.grade }),
          ...(updateFields.employeeType !== undefined && { employeeType: updateFields.employeeType }),
          ...(updateFields.isTemplate !== undefined && { isTemplate: updateFields.isTemplate }),
          ...(updateFields.durationDays !== undefined && { durationDays: updateFields.durationDays }),
          ...(updateFields.phases !== undefined && { phases: updateFields.phases }),
          ...(updateFields.checklistTemplate !== undefined && { checklistTemplate: updateFields.checklistTemplate }),
          ...(updateFields.documentsRequired !== undefined && { documentsRequired: updateFields.documentsRequired }),
          ...(updateFields.equipmentRequired !== undefined && { equipmentRequired: updateFields.equipmentRequired }),
          ...(updateFields.accessRequired !== undefined && { accessRequired: updateFields.accessRequired }),
          ...(updateFields.trainingModules !== undefined && { trainingModules: updateFields.trainingModules }),
          ...(updateFields.buddyRequired !== undefined && { buddyRequired: updateFields.buddyRequired }),
          ...(updateFields.surveySchedule !== undefined && { surveySchedule: updateFields.surveySchedule }),
          ...(updateFields.isActive !== undefined && { isActive: updateFields.isActive }),
        },
      });

      return NextResponse.json({ program }, { status: 200 });
    } catch (error) {
      console.error('Error updating onboarding program:', error);
      return NextResponse.json(
        { error: 'Failed to update onboarding program' },
        { status: 500 }
      );
    }
  }
);
