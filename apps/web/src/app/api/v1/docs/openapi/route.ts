import { NextRequest, NextResponse } from 'next/server';
import { generateOpenAPISpec } from '@/lib/docs/openapi-generator';

/**
 * GET /api/v1/docs/openapi
 * Returns the OpenAPI 3.0 specification as JSON
 */
export async function GET(request: NextRequest) {
  try {
    const spec = generateOpenAPISpec();

    return NextResponse.json(spec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow Swagger UI to fetch
      },
    });
  } catch (error) {
    console.error('[OpenAPI] Error generating spec:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate OpenAPI specification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
