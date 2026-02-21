import { NextRequest, NextResponse } from "next/server";

interface YearEndProcessRequest {
  taxYear: number;
  steps?: string[];
  forceRerun?: boolean;
}

interface YearEndProcessResponse {
  jobId: string;
  taxYear: number;
  status: "queued";
  stepsToProcess: string[];
  estimatedDuration: string;
  startedAt: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: YearEndProcessRequest = await request.json();

    if (!body.taxYear) {
      return NextResponse.json(
        { error: "taxYear is required" },
        { status: 400 }
      );
    }

    const allSteps = [
      "verify_records",
      "calculate_totals",
      "generate_w2",
      "generate_1099",
      "file_irs",
      "distribute",
    ];

    const stepsToProcess = body.steps || allSteps;

    const response: YearEndProcessResponse = {
      jobId: `ye-${Date.now()}`,
      taxYear: body.taxYear,
      status: "queued",
      stepsToProcess,
      estimatedDuration: "45 minutes",
      startedAt: new Date().toISOString(),
      message: `Year-end processing queued for tax year ${body.taxYear}. ${stepsToProcess.length} steps will be processed.`,
    };

    return NextResponse.json(response, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
