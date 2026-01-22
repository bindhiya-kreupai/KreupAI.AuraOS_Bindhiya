/**
 * Employee Search API
 * Uses @aura/search for full-text search
 */

import { NextRequest, NextResponse } from 'next/server';
import { employeeSearchService } from '@/lib/search/employee-search.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/employees/search
 * Search employees with full-text search and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const query = searchParams.get('q') || '';
    const department = searchParams.get('department') || undefined;
    const status = searchParams.get('status') || undefined;
    const location = searchParams.get('location') || undefined;
    const from = parseInt(searchParams.get('from') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = (searchParams.get('sortBy') as any) || 'fullName';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';

    // TODO: Extract tenantId from authenticated session
    const tenantId = 'default';

    // Validate pagination
    if (from < 0 || size < 1 || size > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters',
        },
        { status: 400 }
      );
    }

    // Search employees
    const result = await employeeSearchService.searchEmployees({
      tenantId,
      query,
      department,
      status,
      location,
      from,
      size,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: {
        employees: result.employees,
        pagination: {
          total: result.total,
          from: result.from,
          size: result.size,
          hasMore: result.from + result.size < result.total,
        },
        took: result.took,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error in employee search API');

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
