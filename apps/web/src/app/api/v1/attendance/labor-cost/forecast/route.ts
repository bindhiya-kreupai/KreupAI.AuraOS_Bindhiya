import { NextRequest, NextResponse } from "next/server";

interface CostForecastEntry {
  period: string;
  regularHours: number;
  overtimeHours: number;
  regularCost: number;
  overtimeCost: number;
  benefitsCost: number;
  totalCost: number;
  headcount: number;
}

interface LaborCostForecast {
  startDate: string;
  endDate: string;
  currency: string;
  entries: CostForecastEntry[];
  totalForecastCost: number;
  averageCostPerEmployee: number;
  comparedToPreviousPeriod: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "2025-01-01";
  const endDate = searchParams.get("endDate") || "2025-03-31";

  const mockForecast: LaborCostForecast = {
    startDate,
    endDate,
    currency: "USD",
    entries: [
      {
        period: "2025-01",
        regularHours: 8800,
        overtimeHours: 440,
        regularCost: 352000,
        overtimeCost: 26400,
        benefitsCost: 88000,
        totalCost: 466400,
        headcount: 55,
      },
      {
        period: "2025-02",
        regularHours: 8000,
        overtimeHours: 360,
        regularCost: 320000,
        overtimeCost: 21600,
        benefitsCost: 80000,
        totalCost: 421600,
        headcount: 55,
      },
      {
        period: "2025-03",
        regularHours: 8800,
        overtimeHours: 520,
        regularCost: 352000,
        overtimeCost: 31200,
        benefitsCost: 88000,
        totalCost: 471200,
        headcount: 57,
      },
    ],
    totalForecastCost: 1359200,
    averageCostPerEmployee: 24349,
    comparedToPreviousPeriod: 3.5,
  };

  return NextResponse.json(mockForecast);
}
