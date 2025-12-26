import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { employeeService } from '@/lib/services/employee';
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

const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  jobProfileId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  statusId: z.string().uuid().optional(),
  typeId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
});

/**
 * GET /api/v1/employees/:id
 * Get employee by ID
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      // Fetch employee
      const employee = await employeeService.findById(id);

      if (!employee) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
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
        success: true,
        data: employee,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Employee API] GET Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch employee',
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
 * PUT /api/v1/employees/:id
 * Update employee by ID
 */
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = updateEmployeeSchema.safeParse(body);
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

      // Update employee
      const employee = await employeeService.update(id, validationResult.data);

      const response: ApiResponse = {
        success: true,
        data: employee,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Employee API] PUT Error:', error);

      // Check for not found error
      if (
        error instanceof Error &&
        error.message.includes('Record to update not found')
      ) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      // Check for duplicate errors
      if (error instanceof Error && error.message.includes('already exists')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3002',
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 409 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to update employee',
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
 * DELETE /api/v1/employees/:id
 * Soft delete employee by updating status to TERMINATED
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const { searchParams } = new URL(request.url);

      // Get terminated status ID from query params or use default
      const terminatedStatusId = searchParams.get('terminatedStatusId');

      if (!terminatedStatusId) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'terminatedStatusId is required in query parameters',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      // Soft delete employee
      await employeeService.delete(id, terminatedStatusId);

      const response: ApiResponse = {
        success: true,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 204 });
    } catch (error) {
      console.error('[Employee API] DELETE Error:', error);

      // Check for not found error
      if (
        error instanceof Error &&
        error.message.includes('Record to update not found')
      ) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
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
          message: 'Failed to delete employee',
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
