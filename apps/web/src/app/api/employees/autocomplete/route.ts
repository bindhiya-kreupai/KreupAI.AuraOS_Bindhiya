/**
 * Employee Autocomplete API
 * Uses @aura/search for autocomplete suggestions
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { employeeSearchService } from '@/lib/search/employee-search.service';
import { logger } from '@/lib/logger';

/**
 * GET /api/employees/autocomplete
 * Get autocomplete suggestions for employee names
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const prefix = searchParams.get('q') || searchParams.get('prefix') || '';
    const size = parseInt(searchParams.get('size') || '10');

    // TODO: Extract tenantId from authenticated session
    const tenantId = 'default';

    // Validate parameters
    if (!prefix || prefix.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prefix must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    if (size < 1 || size > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Size must be between 1 and 50',
        },
        { status: 400 }
      );
    }

    // Get autocomplete suggestions
    const suggestions = await employeeSearchService.autocompleteEmployees(tenantId, prefix, size);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        count: suggestions.length,
      },
    });
  } catch (error: any) {
    logger.error({ error }, 'Error in employee autocomplete API');

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
