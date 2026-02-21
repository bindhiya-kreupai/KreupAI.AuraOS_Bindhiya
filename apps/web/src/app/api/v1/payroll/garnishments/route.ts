import { NextRequest, NextResponse } from "next/server";

interface Garnishment {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "child_support" | "tax_levy" | "creditor" | "student_loan" | "bankruptcy";
  caseNumber: string;
  amount: number;
  amountType: "fixed" | "percentage";
  maxPercentage: number;
  startDate: string;
  endDate: string | null;
  totalDeducted: number;
  totalRequired: number | null;
  status: "active" | "completed" | "suspended";
  issuingAuthority: string;
}

const mockGarnishments: Garnishment[] = [
  {
    id: "garn-001",
    employeeId: "emp-005",
    employeeName: "Robert Davis",
    type: "child_support",
    caseNumber: "CS-2024-1234",
    amount: 500,
    amountType: "fixed",
    maxPercentage: 50,
    startDate: "2024-06-01",
    endDate: null,
    totalDeducted: 4000,
    totalRequired: null,
    status: "active",
    issuingAuthority: "Family Court of California",
  },
  {
    id: "garn-002",
    employeeId: "emp-012",
    employeeName: "Alice Johnson",
    type: "student_loan",
    caseNumber: "SL-2024-5678",
    amount: 15,
    amountType: "percentage",
    maxPercentage: 25,
    startDate: "2024-09-01",
    endDate: "2026-09-01",
    totalDeducted: 2400,
    totalRequired: 18000,
    status: "active",
    issuingAuthority: "Department of Education",
  },
  {
    id: "garn-003",
    employeeId: "emp-008",
    employeeName: "Tom Brown",
    type: "tax_levy",
    caseNumber: "IRS-2024-9012",
    amount: 750,
    amountType: "fixed",
    maxPercentage: 70,
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    totalDeducted: 7500,
    totalRequired: 9000,
    status: "active",
    issuingAuthority: "Internal Revenue Service",
  },
];

export async function GET() {
  return NextResponse.json({
    garnishments: mockGarnishments,
    total: mockGarnishments.length,
    summary: {
      activeCount: mockGarnishments.filter((g) => g.status === "active").length,
      totalMonthlyDeductions: 1750,
      affectedEmployees: 3,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.employeeId || !body.type || !body.amount || !body.caseNumber) {
      return NextResponse.json(
        { error: "employeeId, type, amount, and caseNumber are required" },
        { status: 400 }
      );
    }

    const newGarnishment: Garnishment = {
      id: `garn-${String(mockGarnishments.length + 1).padStart(3, "0")}`,
      employeeId: body.employeeId,
      employeeName: body.employeeName || "Employee",
      type: body.type,
      caseNumber: body.caseNumber,
      amount: body.amount,
      amountType: body.amountType || "fixed",
      maxPercentage: body.maxPercentage || 25,
      startDate: body.startDate || new Date().toISOString().split("T")[0],
      endDate: body.endDate || null,
      totalDeducted: 0,
      totalRequired: body.totalRequired || null,
      status: "active",
      issuingAuthority: body.issuingAuthority || "Unknown",
    };

    return NextResponse.json(newGarnishment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
