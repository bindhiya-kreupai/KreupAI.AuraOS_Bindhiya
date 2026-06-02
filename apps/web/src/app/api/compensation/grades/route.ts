import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');

      const grades = await prisma.grade.findMany({
        orderBy: { level: 'asc' },
        include: {
          _count: {
            select: { employees: true },
          },
        },
      });

      // Transform to match frontend Grade interface
      const data = grades.map((g) => ({
        id: g.id,
        gradeCode: g.code,
        gradeName: g.name,
        level: g.level,
        employeeCount: g._count.employees,
        isActive: true,
        bands: [],
        competencies: [],
        responsibilities: [],
        minimumExperience: 0,
        educationRequired: '',
        reportingLevel: g.level,
        description: `${g.name} (${g.code})`,
        gradeType: g.level >= 8 ? 'executive' : g.level >= 6 ? 'management' : g.level >= 4 ? 'professional' : g.level >= 2 ? 'operational' : 'entry_level',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      logger.error('Error fetching grades:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch grades' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      const grade = await prisma.grade.create({
        data: {
          code: body.gradeCode || body.code,
          name: body.gradeName || body.name,
          level: body.level || 1,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: grade.id,
          gradeCode: grade.code,
          gradeName: grade.name,
          level: grade.level,
          isActive: true,
          employeeCount: 0,
          bands: [],
          competencies: [],
          responsibilities: [],
          minimumExperience: 0,
          educationRequired: '',
          reportingLevel: grade.level,
          description: `${grade.name} (${grade.code})`,
          gradeType: 'professional',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }, { status: 201 });
    } catch (error: any) {
      logger.error('Error creating grade:', error);
      return NextResponse.json({ success: false, error: 'Failed to create grade' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Grade ID is required' }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {};
      if (updates.gradeCode || updates.code) updateData.code = updates.gradeCode || updates.code;
      if (updates.gradeName || updates.name) updateData.name = updates.gradeName || updates.name;
      if (updates.level !== undefined) updateData.level = updates.level;

      const grade = await prisma.grade.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: grade.id,
          gradeCode: grade.code,
          gradeName: grade.name,
          level: grade.level,
        },
      });
    } catch (error: any) {
      logger.error('Error updating grade:', error);
      return NextResponse.json({ success: false, error: 'Failed to update grade' }, { status: 500 });
    }
  }
);

export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json({ success: false, error: 'Grade ID is required' }, { status: 400 });
      }

      await prisma.grade.delete({
        where: { id },
      });

      return NextResponse.json({ success: true, message: 'Grade deleted' });
    } catch (error: any) {
      logger.error('Error deleting grade:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete grade' }, { status: 500 });
    }
  }
);
