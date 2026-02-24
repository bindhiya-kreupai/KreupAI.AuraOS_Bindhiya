import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const categoryId = searchParams.get('categoryId');
      const level = searchParams.get('level');

      const where: Record<string, unknown> = { tenantId: user.tenantId };
      if (status) where.status = status;
      if (categoryId) where.category = categoryId;
      if (level) where.level = level;

      const courses = await prisma.course.findMany({
        where,
        include: { enrollments: { select: { id: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: courses });
    } catch (error) {
      logger.error('Error fetching courses:', error);
      return NextResponse.json({ success: true, data: [] });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const course = await prisma.course.create({
        data: {
          tenantId: user.tenantId,
          title: body.title,
          description: body.description,
          category: body.category || body.categoryId,
          level: body.level || 'beginner',
          type: body.type || 'online',
          duration: body.duration ? Number(body.duration) : null,
          instructor: body.instructor || body.instructorName,
          thumbnailUrl: body.thumbnailUrl,
          contentUrl: body.contentUrl,
          modules: body.modules,
          skills: body.skills || [],
          prerequisites: body.prerequisites || [],
          maxEnrollment: body.maxEnrollment || body.maxParticipants,
          status: body.status || 'draft',
          createdBy: user.userId,
        },
      });

      logger.info('Course created:', course.id);
      return NextResponse.json({ success: true, data: course }, { status: 201 });
    } catch (error) {
      logger.error('Error creating course:', error);
      return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Course ID is required' }, { status: 400 });
      }

      const existing = await prisma.course.findFirst({
        where: { id, tenantId: user.tenantId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
      }

      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(updates.title !== undefined && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.level !== undefined && { level: updates.level }),
          ...(updates.type !== undefined && { type: updates.type }),
          ...(updates.duration !== undefined && { duration: updates.duration ? Number(updates.duration) : null }),
          ...(updates.instructor !== undefined && { instructor: updates.instructor }),
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.thumbnailUrl !== undefined && { thumbnailUrl: updates.thumbnailUrl }),
          ...(updates.modules !== undefined && { modules: updates.modules }),
          ...(updates.skills !== undefined && { skills: updates.skills }),
          ...(updates.prerequisites !== undefined && { prerequisites: updates.prerequisites }),
          ...(updates.publishedDate !== undefined && { status: 'published' }),
        },
      });

      logger.info('Course updated:', course.id);
      return NextResponse.json({ success: true, data: course });
    } catch (error) {
      logger.error('Error updating course:', error);
      return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
    }
  }
);
