import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// In-memory storage for mock data
const locumProviders: any[] = [];
const locumAssignments: any[] = [];

/**
 * GET /api/industry-healthcare/locum
 * Get locum providers or assignments based on query
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'providers';

    if (type === 'assignments') {
      return NextResponse.json({
        assignments: locumAssignments,
        count: locumAssignments.length,
      });
    }

    return NextResponse.json({
      providers: locumProviders,
      count: locumProviders.length,
    });
  } catch (error: any) {
    console.error('Locum management API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/industry-healthcare/locum
 * Create a locum provider or assignment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'providers';

    if (type === 'assignments') {
      const newAssignment = {
        id: `assignment-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      };
      locumAssignments.push(newAssignment);
      return NextResponse.json({ assignment: newAssignment }, { status: 201 });
    }

    const newProvider = {
      id: `locum-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    locumProviders.push(newProvider);

    return NextResponse.json({ provider: newProvider }, { status: 201 });
  } catch (error: any) {
    console.error('Locum management API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
