import { NextRequest, NextResponse } from "next/server";

interface OffCyclePayrollRequest {
  employeeIds: string[];
  reason: "bonus" | "commission" | "correction" | "termination" | "other";
  payDate: string;
  amounts: { employeeId: string; amount: number; description: string }[];
}

interface OffCyclePayrollResponse {
  runId: string;
  status: "processing";
  payDate: string;
  reason: string;
  employeeCount: number;
  totalGross: number;
  estimatedTaxes: number;
  estimatedNet: number;
  createdAt: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OffCyclePayrollRequest = await request.json();

    if (\!body.employeeIds || \!body.reason || \!body.payDate || \!body.amounts) {
      return NextResponse.json(
        { error: "employeeIds, reason, payDate, and amounts are required" },
        { status: 400 }
      );
    }

    const totalGross = body.amounts.reduce((sum, a) => sum + a.amount, 0);
    const estimatedTaxes = totalGross * 0.28;

    const response: OffCyclePayrollResponse = {
      runId: `oc-${Date.now()}`,
      status: "processing",
      payDate: body.payDate,
      reason: body.reason,
      employeeCount: body.employeeIds.length,
      totalGross,
      estimatedTaxes: Math.round(estimatedTaxes * 100) / 100,
      estimatedNet: Math.round((totalGross - estimatedTaxes) * 100) / 100,
      createdAt: new Date().toISOString(),
      message: `Off-cycle payroll run initiated for ${body.employeeIds.length} employees.`,
    };

    return NextResponse.json(response, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
