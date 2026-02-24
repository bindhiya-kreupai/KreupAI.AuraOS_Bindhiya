import { NextRequest, NextResponse } from "next/server";

interface TimeEntryRequest {
  projectId: string;
  hours: number;
  date: string;
  notes?: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  employeeId: string;
  hours: number;
  date: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TimeEntryRequest = await request.json();

    if (!body.projectId || !body.hours || !body.date) {
      return NextResponse.json(
        { error: "projectId, hours, and date are required" },
        { status: 400 }
      );
    }

    if (body.hours <= 0 || body.hours > 24) {
      return NextResponse.json(
        { error: "hours must be between 0 and 24" },
        { status: 400 }
      );
    }

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      projectId: body.projectId,
      employeeId: "emp-001",
      hours: body.hours,
      date: body.date,
      notes: body.notes || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newEntry, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
