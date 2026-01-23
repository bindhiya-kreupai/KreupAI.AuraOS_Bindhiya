import { NextRequest, NextResponse } from "next/server";

interface TaxDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "W2" | "1099";
  taxYear: number;
  status: "generated" | "pending" | "delivered" | "corrected";
  generatedAt: string | null;
  deliveredAt: string | null;
  downloadUrl: string | null;
}

const mockDocuments: TaxDocument[] = [
  {
    id: "td-001",
    employeeId: "emp-001",
    employeeName: "John Smith",
    type: "W2",
    taxYear: 2024,
    status: "delivered",
    generatedAt: "2025-01-15T00:00:00Z",
    deliveredAt: "2025-01-20T00:00:00Z",
    downloadUrl: "/api/v1/payroll/tax-documents/td-001/download",
  },
  {
    id: "td-002",
    employeeId: "emp-002",
    employeeName: "Jane Doe",
    type: "W2",
    taxYear: 2024,
    status: "generated",
    generatedAt: "2025-01-15T00:00:00Z",
    deliveredAt: null,
    downloadUrl: "/api/v1/payroll/tax-documents/td-002/download",
  },
  {
    id: "td-003",
    employeeId: "con-001",
    employeeName: "Alex Contractor",
    type: "1099",
    taxYear: 2024,
    status: "pending",
    generatedAt: null,
    deliveredAt: null,
    downloadUrl: null,
  },
  {
    id: "td-004",
    employeeId: "emp-003",
    employeeName: "Bob Wilson",
    type: "W2",
    taxYear: 2024,
    status: "corrected",
    generatedAt: "2025-01-15T00:00:00Z",
    deliveredAt: "2025-01-22T00:00:00Z",
    downloadUrl: "/api/v1/payroll/tax-documents/td-004/download",
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const year = searchParams.get("year");

  let filtered = mockDocuments;

  if (type) {
    filtered = filtered.filter((doc) => doc.type === type);
  }
  if (year) {
    filtered = filtered.filter((doc) => doc.taxYear === parseInt(year));
  }

  return NextResponse.json({
    documents: filtered,
    total: filtered.length,
    summary: {
      w2Count: filtered.filter((d) => d.type === "W2").length,
      form1099Count: filtered.filter((d) => d.type === "1099").length,
      pendingCount: filtered.filter((d) => d.status === "pending").length,
      deliveredCount: filtered.filter((d) => d.status === "delivered").length,
    },
  });
}
