import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const HolidaySchema = z.object({
  name: z.string().min(1),
  date: z.string(),
  type: z.enum(['PUBLIC', 'OPTIONAL', 'RESTRICTED']).default('PUBLIC'),
  description: z.string().optional(),
  applicableTo: z.array(z.string()).optional(),
});

// GET - Fetch holidays
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const year = searchParams.get('year') || new Date().getFullYear().toString();
      const type = searchParams.get('type');

      const mockHolidays = [
        {
          id: '1',
          name: 'New Year\'s Day',
          date: `${year}-01-01`,
          type: 'PUBLIC',
          description: 'New Year celebration',
          applicableTo: ['ALL'],
          status: 'ACTIVE',
        },
        {
          id: '2',
          name: 'Independence Day',
          date: `${year}-08-15`,
          type: 'PUBLIC',
          description: 'National Independence Day',
          applicableTo: ['ALL'],
          status: 'ACTIVE',
        },
        {
          id: '3',
          name: 'Diwali',
          date: `${year}-11-01`,
          type: 'OPTIONAL',
          description: 'Festival of Lights',
          applicableTo: ['INDIA'],
          status: 'ACTIVE',
        },
        {
          id: '4',
          name: 'Christmas',
          date: `${year}-12-25`,
          type: 'PUBLIC',
          description: 'Christmas celebration',
          applicableTo: ['ALL'],
          status: 'ACTIVE',
        },
        {
          id: '5',
          name: 'Good Friday',
          date: `${year}-03-29`,
          type: 'RESTRICTED',
          description: 'Good Friday observance',
          applicableTo: ['CHRISTIAN'],
          status: 'ACTIVE',
        },
      ];

      let filteredData = mockHolidays;
      if (type) {
        filteredData = mockHolidays.filter(h => h.type === type);
      }

      const summary = {
        total: filteredData.length,
        public: filteredData.filter(h => h.type === 'PUBLIC').length,
        optional: filteredData.filter(h => h.type === 'OPTIONAL').length,
        restricted: filteredData.filter(h => h.type === 'RESTRICTED').length,
      };

      return NextResponse.json({
        success: true,
        data: { holidays: filteredData, summary },
      });
    } catch (error) {
      logger.error('Error fetching holidays:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch holidays' },
        { status: 500 }
      );
    }
  }
);

// POST - Create holiday
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = HolidaySchema.parse(body);

      const newHoliday = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        applicableTo: data.applicableTo || ['ALL'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Leave - Holiday Management',
          details: `Created holiday: ${data.name} on ${data.date}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newHoliday }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating holiday:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create holiday' },
        { status: 500 }
      );
    }
  }
);
