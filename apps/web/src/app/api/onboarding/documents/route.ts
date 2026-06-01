import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

// GET - Fetch required documents from onboarding programs and track submission status
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const instanceId = searchParams.get('instanceId');
      const programId = searchParams.get('programId');

      if (instanceId) {
        // Get documents for a specific instance (from program's documentsRequired)
        const instance = await prisma.onboardingInstance.findFirst({
          where: { id: instanceId, tenantId },
          include: { program: true },
        });

        if (!instance) {
          return NextResponse.json(
            { error: 'Onboarding instance not found' },
            { status: 404 }
          );
        }

        const documentsRequired = (instance.program?.documentsRequired as unknown[]) || [];
        return NextResponse.json({ documents: documentsRequired }, { status: 200 });
      }

      if (programId) {
        // Get documents required for a specific program
        const program = await prisma.onboardingProgram.findFirst({
          where: { id: programId, tenantId },
        });

        if (!program) {
          return NextResponse.json(
            { error: 'Onboarding program not found' },
            { status: 404 }
          );
        }

        const documentsRequired = (program.documentsRequired as unknown[]) || [];
        return NextResponse.json({ documents: documentsRequired }, { status: 200 });
      }

      // Get all unique document requirements across all active programs
      const programs = await prisma.onboardingProgram.findMany({
        where: { tenantId, isActive: true },
        select: { id: true, programName: true, documentsRequired: true },
      });

      const documents = programs.flatMap((p) => {
        const docs = (p.documentsRequired as unknown[]) || [];
        return docs.map((doc: unknown) => ({
          ...(doc as Record<string, unknown>),
          programId: p.id,
          programName: p.programName,
        }));
      });

      return NextResponse.json({ documents }, { status: 200 });
    } catch (error: any) {
      console.error('Error fetching onboarding documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch onboarding documents' },
        { status: 500 }
      );
    }
  }
);

// POST - Upload/submit a document for an onboarding instance
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();

      if (!body.instanceId) {
        return NextResponse.json(
          { error: 'Instance ID is required' },
          { status: 400 }
        );
      }

      // Create a document-tracking task for this instance
      const task = await prisma.onboardingTask.create({
        data: {
          instanceId: body.instanceId,
          taskName: `Document: ${body.documentName || 'Upload'}`,
          description: body.description || '',
          category: 'documentation',
          phase: body.phase || 'pre_boarding',
          responsibleParty: 'new_hire',
          priority: body.isMandatory ? 'high' : 'medium',
          status: 'completed',
          completedDate: new Date(),
          completedBy: user.userId,
          isMandatory: body.isMandatory ?? false,
          requiresApproval: body.requiresVerification ?? false,
          notes: body.fileUrl ? `File: ${body.fileName} (${body.fileUrl})` : null,
        },
      });

      const document = {
        id: task.id,
        instanceId: body.instanceId,
        documentName: body.documentName,
        status: 'submitted',
        uploadedDate: new Date().toISOString(),
        uploadedBy: user.userId,
      };

      return NextResponse.json({ document }, { status: 201 });
    } catch (error: any) {
      console.error('Error submitting document:', error);
      return NextResponse.json(
        { error: 'Failed to submit document' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update document status (verify, approve, reject)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user }) => {
    try {
      const body = await request.json();
      const { id, ...updateFields } = body;

      if (!id) {
        return NextResponse.json(
          { error: 'Document/Task ID is required' },
          { status: 400 }
        );
      }

      const existingTask = await prisma.onboardingTask.findFirst({
        where: {
          id,
          instance: { tenantId: user.tenantId },
        },
      });

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      const task = await prisma.onboardingTask.update({
        where: { id },
        data: {
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.approved && {
            approvedBy: user.userId,
            approvedAt: new Date(),
          }),
          ...(updateFields.notes !== undefined && { notes: updateFields.notes }),
        },
      });

      const document = {
        id: task.id,
        status: updateFields.status || task.status,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ document }, { status: 200 });
    } catch (error: any) {
      console.error('Error updating document:', error);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }
  }
);
