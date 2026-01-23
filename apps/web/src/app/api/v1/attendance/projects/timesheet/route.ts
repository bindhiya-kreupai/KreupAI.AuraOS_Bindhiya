import { NextRequest, NextResponse } from "next/server";

interface TimesheetEntry {
  projectId: string;
  projectName: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  totalHours: number;
}

interface WeeklyTimesheet {
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  entries: TimesheetEntry[];
  totalWeeklyHours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("weekStart") || "2025-01-20";

  const mockTimesheet: WeeklyTimesheet = {
    employeeId: "emp-001",
    employeeName: "John Smith",
    weekStartDate: weekStart,
    weekEndDate: "2025-01-26",
    entries: [
      {
        projectId: "proj-001",
        projectName: "Website Redesign",
        monday: 4,
        tuesday: 5,
        wednesday: 3,
        thursday: 4,
        friday: 2,
        saturday: 0,
        sunday: 0,
        totalHours: 18,
      },
      {
        projectId: "proj-002",
        projectName: "Mobile App Development",
        monday: 4,
        tuesday: 3,
        wednesday: 5,
        thursday: 4,
        friday: 6,
        saturday: 0,
        sunday: 0,
        totalHours: 22,
      },
    ],
    totalWeeklyHours: 40,
    status: "submitted",
  };

  return NextResponse.json(mockTimesheet);
}
