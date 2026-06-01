import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Validation schema for creating a template
const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  content: z.string().optional(),
  format: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    // No Prisma model exists for document templates yet
    // Return empty array as placeholder
    return NextResponse.json({ templates: [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching document templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document templates' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validated = CreateTemplateSchema.parse(body);

    // No Prisma model exists yet - return submitted data with generated id
    const template = {
      id: randomUUID(),
      ...validated,
      tenantId: user.tenantId,
      isActive: validated.isActive ?? true,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating document template:', error);
    return NextResponse.json(
      { error: 'Failed to create document template' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // No Prisma model exists yet - return submitted data as updated
    const template = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ template }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating document template:', error);
    return NextResponse.json(
      { error: 'Failed to update document template' },
      { status: 500 }
    );
  }
});
