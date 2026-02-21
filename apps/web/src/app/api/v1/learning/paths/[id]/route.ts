import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context) => {
    try {
      const { user, params } = context;
      const { id } = params;

      const path = await prisma.learningPath.findFirst({
        where: { id, tenantId: user.tenantId },
        include: {
          enrollments: {
            select: { id: true, status: true, progress: true },
          },
        },
      });

      if (!path) {
        return NextResponse.json({ success: false, error: 'Learning path not found' }, { status: 404 });
      }

      const enrolledCount = path.enrollments.length;
      const completedCount = path.enrollments.filter((e) => e.status === 'COMPLETED').length;
      const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

      const result = {
        id: path.id,
        title: path.title,
        description: path.description,
        category: path.difficulty,
        level: path.difficulty?.toLowerCase(),
        duration: path.duration ? `${path.duration} hours` : null,
        enrolledCount,
        completionRate,
        skills: path.skills,
        modules: path.modules,
        isPublished: path.isPublished,
        createdAt: path.createdAt.toISOString(),
        updatedAt: path.updatedAt.toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      return NextResponse.json({ success: true, data: null });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, context) => {
    try {
      const { user, params } = context;
      const { id } = params;
      const body = await request.json();

      const existing = await prisma.learningPath.findFirst({
        where: { id, tenantId: user.tenantId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Learning path not found' }, { status: 404 });
      }

      const updated = await prisma.learningPath.update({
        where: { id },
        data: {
          ...(body.title !== undefined && { title: body.title }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
          ...(body.duration !== undefined && { duration: body.duration }),
          ...(body.modules !== undefined && { modules: body.modules }),
          ...(body.skills !== undefined && { skills: body.skills }),
          ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to update learning path' }, { status: 500 });
    }
  }
);
