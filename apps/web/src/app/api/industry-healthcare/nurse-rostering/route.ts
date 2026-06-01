import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for mock data
let scheduleData: any[] = [];

/**
 * GET /api/industry-healthcare/nurse-rostering
 * Get all nurse schedules
 */
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({
            schedules: scheduleData,
            count: scheduleData.length,
        });
    } catch (error: any) {
        console.error('Nurse rostering API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/industry-healthcare/nurse-rostering
 * Create a new nurse schedule
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newSchedule = {
            id: `schedule-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        scheduleData.push(newSchedule);

        return NextResponse.json({
            schedule: newSchedule,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Nurse rostering API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
