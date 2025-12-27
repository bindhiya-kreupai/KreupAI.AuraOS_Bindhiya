import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LifeEventService } from '@/lib/services/life-event.service';
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
      employeeId: searchParams.get('employeeId') || undefined,
      eventType: searchParams.get('eventType') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sortBy: searchParams.get('sortBy') || 'eventDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await LifeEventService.findAll(filter);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      meta: { pagination: result.pagination, timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: { code: 'E5001', message: 'Failed to fetch life events', details: { error: error instanceof Error ? error.message : 'Unknown error' } },
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
    if (!body.createdBy) body.createdBy = user.userId;

    const lifeEvent = await LifeEventService.create(body);

    const response: ApiResponse = {
      success: true,
      data: lifeEvent,
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    let statusCode = 500;
    let errorCode = 'E5001';

    if (error instanceof z.ZodError) {
      statusCode = 400;
      errorCode = 'E2001';
    }

    const response: ApiResponse = {
      success: false,
      error: { code: errorCode, message: error instanceof Error ? error.message : 'Failed to create life event', details: error instanceof z.ZodError ? { errors: error.errors } : undefined },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    };

    return NextResponse.json(response, { status: statusCode });
  }
});
