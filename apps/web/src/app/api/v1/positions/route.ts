import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PositionService } from '@/lib/services/position.service';
import { z } from 'zod';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const filter = {
      tenantId: user.tenantId,
      status: searchParams.get('status') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      locationId: searchParams.get('locationId') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await PositionService.findAll(filter);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      meta: { pagination: result.pagination, timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: { code: 'E5001', message: 'Failed to fetch positions', details: { error: error instanceof Error ? error.message : 'Unknown error' } },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };
    return NextResponse.json(response, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    body.tenantId = user.tenantId;
    if (!body.requestedBy) body.requestedBy = user.userId;

    const position = await PositionService.create(body);

    const response: ApiResponse = {
      success: true,
      data: position,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    } else if (error instanceof Error && error.message.includes('already exists')) {
      statusCode = 409;
      errorCode = 'E3002';
    }

    const response: ApiResponse = {
      success: false,
      error: { code: errorCode, message: error instanceof Error ? error.message : 'Failed to create position', details: error instanceof z.ZodError ? { errors: error.errors } : undefined },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});
