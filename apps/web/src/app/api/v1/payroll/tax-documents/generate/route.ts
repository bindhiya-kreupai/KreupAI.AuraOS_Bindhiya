import { NextRequest, NextResponse } from "next/server";

interface TaxDocGenerationRequest {
  taxYear: number;
  type: "W2" | "1099";
  employeeIds?: string[];
}

interface TaxDocGenerationResponse {
  jobId: string;
  status: "queued";
  type: "W2" | "1099";
  taxYear: number;
  totalDocuments: number;
  estimatedCompletionTime: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TaxDocGenerationRequest = await request.json();

    if (!body.taxYear || !body.type) {
      return NextResponse.json(
        { error: "taxYear and type are required" },
        { status: 400 }
      );
    }

    if (body.type !== "W2" && body.type !== "1099") {
      return NextResponse.json(
        { error: "type must be W2 or 1099" },
        { status: 400 }
      );
    }

    const totalDocs = body.employeeIds ? body.employeeIds.length : (body.type === "W2" ? 55 : 12);

    const response: TaxDocGenerationResponse = {
      jobId: `taxgen-${Date.now()}`,
      status: "queued",
      type: body.type,
      taxYear: body.taxYear,
      totalDocuments: totalDocs,
      estimatedCompletionTime: new Date(Date.now() + 300000).toISOString(),
      message: `Tax document generation job queued for ${totalDocs} ${body.type} forms.`,
    };

    return NextResponse.json(response, { status: 202 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
