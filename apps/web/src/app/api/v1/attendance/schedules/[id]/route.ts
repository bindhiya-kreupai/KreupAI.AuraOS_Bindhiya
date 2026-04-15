import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'flexible';
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  updatedAt: string;
}

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedSchedule: Schedule = {
      id,
      employeeId: body.employeeId || 'emp-001',
      employeeName: body.employeeName || 'John Smith',
      shiftType: body.shiftType || 'morning',
      startTime: body.startTime || '08:00',
      endTime: body.endTime || '16:00',
      daysOfWeek: body.daysOfWeek || [1, 2, 3, 4, 5],
      effectiveFrom: body.effectiveFrom || '2025-01-01',
      effectiveTo: body.effectiveTo || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedSchedule);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
});
