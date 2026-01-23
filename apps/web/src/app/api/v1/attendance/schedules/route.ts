import { NextRequest, NextResponse } from "next/server";

interface Schedule {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftType: "morning" | "afternoon" | "night" | "flexible";
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
}

const mockSchedules: Schedule[] = [
  {
    id: "sched-001",
    employeeId: "emp-001",
    employeeName: "John Smith",
    shiftType: "morning",
    startTime: "08:00",
    endTime: "16:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    effectiveFrom: "2025-01-01",
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "sched-002",
    employeeId: "emp-002",
    employeeName: "Jane Doe",
    shiftType: "afternoon",
    startTime: "14:00",
    endTime: "22:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    effectiveFrom: "2025-01-01",
    effectiveTo: null,
    isActive: true,
  },
  {
    id: "sched-003",
    employeeId: "emp-003",
    employeeName: "Bob Wilson",
    shiftType: "night",
    startTime: "22:00",
    endTime: "06:00",
    daysOfWeek: [0, 1, 2, 3, 4],
    effectiveFrom: "2025-02-01",
    effectiveTo: "2025-06-30",
    isActive: true,
  },
];

export async function GET() {
  return NextResponse.json({
    schedules: mockSchedules,
    total: mockSchedules.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (\!body.employeeId || \!body.shiftType || \!body.startTime || \!body.endTime) {
      return NextResponse.json(
        { error: "employeeId, shiftType, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const newSchedule: Schedule = {
      id: `sched-${String(mockSchedules.length + 1).padStart(3, "0")}`,
      employeeId: body.employeeId,
      employeeName: body.employeeName || "New Employee",
      shiftType: body.shiftType,
      startTime: body.startTime,
      endTime: body.endTime,
      daysOfWeek: body.daysOfWeek || [1, 2, 3, 4, 5],
      effectiveFrom: body.effectiveFrom || new Date().toISOString().split("T")[0],
      effectiveTo: body.effectiveTo || null,
      isActive: true,
    };

    return NextResponse.json(newSchedule, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
