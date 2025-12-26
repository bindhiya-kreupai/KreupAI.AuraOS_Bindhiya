import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { positionService } from '@/lib/services/organization';
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

const updatePositionSchema = z.object({
  familyId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional().nullable(),
  code: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
});

/**
 * GET /api/v1/positions/:id
 * Get position by ID
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      const position = await positionService.findById(id);

      if (!position) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Position not found',
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
        data: position,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Position API] GET Error:', error);

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch position',
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
 * PUT /api/v1/positions/:id
 * Update position by ID
 */
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = updatePositionSchema.safeParse(body);
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

      // Update position
      const position = await positionService.update(id, validationResult.data);

      const response: ApiResponse = {
        success: true,
        data: position,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Position API] PUT Error:', error);

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E3001',
              message: error.message,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 404 });
        }

        if (error.message.includes('already exists')) {
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
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to update position',
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
 * DELETE /api/v1/positions/:id
 * Delete position (soft delete by setting status to Inactive)
 */
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;

      await positionService.delete(id);

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
      console.error('[Position API] DELETE Error:', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E3001',
              message: 'Position not found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 404 });
        }

        if (error.message.includes('Cannot delete')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E4001',
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
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to delete position',
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
