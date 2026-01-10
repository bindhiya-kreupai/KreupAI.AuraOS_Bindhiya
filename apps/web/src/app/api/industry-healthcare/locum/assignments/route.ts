import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for locum assignments
let locumAssignments: any[] = [];

/**
 * GET /api/industry-healthcare/locum/assignments
 * Get all locum assignments
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            assignments: locumAssignments,
            count: locumAssignments.length,
        });
    } catch (error) {
        console.error('Locum assignments API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/industry-healthcare/locum/assignments
 * Create a new locum assignment
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newAssignment = {
            id: `assignment-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
        };

        locumAssignments.push(newAssignment);

        return NextResponse.json({
            assignment: newAssignment,
        }, { status: 201 });
    } catch (error) {
        console.error('Locum assignments API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
