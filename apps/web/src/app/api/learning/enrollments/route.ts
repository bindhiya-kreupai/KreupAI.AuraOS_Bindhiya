import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const learnerId = searchParams.get('learnerId') || user.userId;
      const status = searchParams.get('status');

      const mockEnrollments = [
        {
          id: 'enroll-1',
          courseId: 'course-1',
          courseName: 'Leadership Fundamentals',
          learnerId,
          learnerName: user.name || 'John Doe',
          status: 'in_progress',
          progress: 45,
          startDate: '2024-01-15',
          dueDate: '2024-03-15',
          timeSpent: 3600,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'enroll-2',
          courseId: 'course-2',
          courseName: 'Advanced Technical Skills',
          learnerId,
          learnerName: user.name || 'John Doe',
          status: 'completed',
          progress: 100,
          score: 85,
          startDate: '2023-11-01',
          completedDate: '2023-12-20',
          timeSpent: 7200,
          createdAt: new Date().toISOString(),
        },
      ];

      let filtered = mockEnrollments;
      if (status) filtered = filtered.filter(e => e.status === status);

      return NextResponse.json({ success: true, data: filtered });
    } catch (error) {
      logger.error('Error fetching enrollments:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch enrollments' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newEnrollment = {
        ...body,
        id: `enroll-${Date.now()}`,
        status: 'enrolled',
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      logger.info('Enrollment created:', newEnrollment.id);
      return NextResponse.json({ success: true, data: newEnrollment }, { status: 201 });
    } catch (error) {
      logger.error('Error creating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to create enrollment' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const updatedEnrollment = {
        ...body,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: updatedEnrollment });
    } catch (error) {
      logger.error('Error updating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to update enrollment' }, { status: 500 });
    }
  }
);
