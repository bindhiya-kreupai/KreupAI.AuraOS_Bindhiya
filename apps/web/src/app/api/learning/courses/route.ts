import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch courses
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const categoryId = searchParams.get('categoryId');

      const mockCourses = [
        {
          id: 'course-1',
          courseCode: 'LEAD-101',
          title: 'Leadership Fundamentals',
          description: 'Learn essential leadership skills',
          category: 'Leadership',
          categoryId: 'cat-1',
          type: 'instructor_led',
          status: 'published',
          duration: 120,
          currentEnrollments: 45,
          maxEnrollments: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'course-2',
          courseCode: 'TECH-201',
          title: 'Advanced Technical Skills',
          description: 'Deep dive into technical concepts',
          category: 'Technical',
          categoryId: 'cat-2',
          type: 'online',
          status: 'published',
          duration: 180,
          currentEnrollments: 30,
          maxEnrollments: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      let filtered = mockCourses;
      if (status) filtered = filtered.filter(c => c.status === status);
      if (categoryId) filtered = filtered.filter(c => c.categoryId === categoryId);

      return NextResponse.json({ success: true, data: filtered });
    } catch {
      logger.error('Error fetching courses:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
    }
  }
);

// POST - Create course
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newCourse = {
        ...body,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      logger.info('Course created:', newCourse.id);
      return NextResponse.json({ success: true, data: newCourse }, { status: 201 });
    } catch {
      logger.error('Error creating course:', error);
      return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
    }
  }
);

// PUT - Update course
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const updatedCourse = {
        ...body,
        updatedAt: new Date().toISOString(),
      };

      logger.info('Course updated:', updatedCourse.id);
      return NextResponse.json({ success: true, data: updatedCourse });
    } catch {
      logger.error('Error updating course:', error);
      return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
    }
  }
);
