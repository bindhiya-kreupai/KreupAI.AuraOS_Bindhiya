import { NextResponse } from "next/server";

interface YearEndStatus {
  taxYear: number;
  status: "not_started" | "in_progress" | "review" | "completed";
  steps: {
    name: string;
    status: "pending" | "in_progress" | "completed" | "error";
    completedAt: string | null;
    errorMessage: string | null;
  }[];
  w2Generated: number;
  w2Total: number;
  form1099Generated: number;
  form1099Total: number;
  lastUpdated: string;
  estimatedCompletion: string | null;
}

export async function GET() {
  const mockStatus: YearEndStatus = {
    taxYear: 2024,
    status: "in_progress",
    steps: [
      {
        name: "Verify employee records",
        status: "completed",
        completedAt: "2025-01-05T10:00:00Z",
        errorMessage: null,
      },
      {
        name: "Calculate annual totals",
        status: "completed",
        completedAt: "2025-01-06T14:00:00Z",
        errorMessage: null,
      },
      {
        name: "Generate W2 forms",
        status: "in_progress",
        completedAt: null,
        errorMessage: null,
      },
      {
        name: "Generate 1099 forms",
        status: "pending",
        completedAt: null,
        errorMessage: null,
      },
      {
        name: "File with IRS",
        status: "pending",
        completedAt: null,
        errorMessage: null,
      },
      {
        name: "Distribute to employees",
        status: "pending",
        completedAt: null,
        errorMessage: null,
      },
    ],
    w2Generated: 38,
    w2Total: 55,
    form1099Generated: 0,
    form1099Total: 12,
    lastUpdated: new Date().toISOString(),
    estimatedCompletion: "2025-01-31T00:00:00Z",
  };

  return NextResponse.json(mockStatus);
}
