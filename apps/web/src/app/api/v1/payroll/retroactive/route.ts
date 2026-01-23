import { NextRequest, NextResponse } from "next/server";

interface RetroactivePayRequest {
  employeeId: string;
  effectiveDate: string;
  reason: "salary_increase" | "promotion" | "correction" | "reclassification";
  previousRate: number;
  newRate: number;
  rateType: "hourly" | "salary";
}

interface RetroactivePayResponse {
  calculationId: string;
  employeeId: string;
  reason: string;
  effectiveDate: string;
  periodsAffected: number;
  previousRate: number;
  newRate: number;
  rateDifference: number;
  retroactiveAmount: number;
  taxAdjustment: number;
  netRetroactivePay: number;
  affectedPayPeriods: { periodStart: string; periodEnd: string; difference: number }[];
  status: "calculated";
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RetroactivePayRequest = await request.json();

    if (\!body.employeeId || \!body.effectiveDate || \!body.previousRate || \!body.newRate) {
      return NextResponse.json(
        { error: "employeeId, effectiveDate, previousRate, and newRate are required" },
        { status: 400 }
      );
    }

    const rateDiff = body.newRate - body.previousRate;
    const periodsAffected = 3; // Mock: 3 pay periods affected
    const hoursPerPeriod = body.rateType === "hourly" ? 80 : 1;
    const retroAmount = rateDiff * hoursPerPeriod * periodsAffected;
    const taxAdj = retroAmount * 0.30;

    const response: RetroactivePayResponse = {
      calculationId: `retro-${Date.now()}`,
      employeeId: body.employeeId,
      reason: body.reason,
      effectiveDate: body.effectiveDate,
      periodsAffected,
      previousRate: body.previousRate,
      newRate: body.newRate,
      rateDifference: rateDiff,
      retroactiveAmount: Math.round(retroAmount * 100) / 100,
      taxAdjustment: Math.round(taxAdj * 100) / 100,
      netRetroactivePay: Math.round((retroAmount - taxAdj) * 100) / 100,
      affectedPayPeriods: [
        { periodStart: "2025-01-01", periodEnd: "2025-01-15", difference: Math.round(retroAmount / 3 * 100) / 100 },
        { periodStart: "2025-01-16", periodEnd: "2025-01-31", difference: Math.round(retroAmount / 3 * 100) / 100 },
        { periodStart: "2025-02-01", periodEnd: "2025-02-15", difference: Math.round(retroAmount / 3 * 100) / 100 },
      ],
      status: "calculated",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
