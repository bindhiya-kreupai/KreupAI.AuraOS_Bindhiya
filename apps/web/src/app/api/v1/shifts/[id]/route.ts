import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

// Validation schema for update
const updateShiftSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameAr: z.string().optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  breakDurationMinutes: z.number().int().min(0).optional(),
  graceTimeMinutes: z.number().int().min(0).optional(),
  isNightShift: z.boolean().optional(),
  workingDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).optional(),
  colorCode: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/v1/shifts/:id
 * Get shift details by ID
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      // TODO: Implement actual database query
      const mockShift = {
        id,
        code: 'GEN',
        name: 'General Shift',
        nameAr: 'الوردية العامة',
        startTime: '09:00:00',
        endTime: '18:00:00',
        breakDurationMinutes: 60,
        graceTimeMinutes: 15,
        isNightShift: false,
        workingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        colorCode: '#3B82F6',
        description: 'Standard 9-to-6 shift with 1 hour break',
        totalWorkHours: 8,
        assignedEmployees: 120,
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockShift,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Shift Detail API] GET Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Shift not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch shift',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  }
);

/**
 * PUT /api/v1/shifts/:id
 * Update shift details
 */
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = updateShiftSchema.safeParse(body);
      if (!validationResult.success) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed',
            details: { errors: validationResult.error.errors },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      const data = validationResult.data;

      // TODO: Implement actual shift update
      // 1. Check if shift exists
      // 2. Validate time ranges if updated
      // 3. Recalculate total work hours
      // 4. Update shift record
      // 5. Notify affected employees if working days changed

      const mockUpdatedShift = {
        id,
        code: 'GEN',
        name: data.name || 'General Shift',
        nameAr: data.nameAr || 'الوردية العامة',
        startTime: data.startTime || '09:00:00',
        endTime: data.endTime || '18:00:00',
        breakDurationMinutes: data.breakDurationMinutes ?? 60,
        graceTimeMinutes: data.graceTimeMinutes ?? 15,
        isNightShift: data.isNightShift ?? false,
        workingDays: data.workingDays || ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        colorCode: data.colorCode || '#3B82F6',
        description: data.description,
        totalWorkHours: 8,
        assignedEmployees: 120,
        isActive: data.isActive ?? true,
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockUpdatedShift,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Shift Update API] PUT Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Shift not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to update shift',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  }
);

/**
 * DELETE /api/v1/shifts/:id
 * Delete (deactivate) a shift
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      // TODO: Implement actual shift deletion (soft delete)
      // 1. Check if shift exists
      // 2. Check if shift has assigned employees
      // 3. Soft delete (set isActive = false)
      // 4. Unassign employees or reassign to default shift

      const response: ApiResponse = {
        success: true,
        data: {
          id,
          message: 'Shift deactivated successfully',
          affectedEmployees: 0,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Shift Delete API] DELETE Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Shift not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      if (error instanceof Error && error.message.includes('has assigned employees')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: 'Cannot delete shift with assigned employees',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to delete shift',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  }
);
