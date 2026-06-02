import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateOpenAPISpec } from '@/lib/docs/openapi-generator';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/v1/docs/openapi
 * Returns the OpenAPI 3.0 specification as JSON
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, { _user, permissions }: any) => {
  if (!permissions.includes('docs:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing docs:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const spec = generateOpenAPISpec();

    return NextResponse.json(spec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3006',
      },
    });
  } catch (error: any) {
    console.error('[OpenAPI] Error generating spec:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate OpenAPI specification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
