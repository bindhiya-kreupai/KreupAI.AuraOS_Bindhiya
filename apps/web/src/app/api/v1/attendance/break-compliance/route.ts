import { NextResponse } from "next/server";

interface BreakComplianceEntry {
  employeeId: string;
  employeeName: string;
  date: string;
  requiredBreakMinutes: number;
  actualBreakMinutes: number;
  isCompliant: boolean;
  violations: string[];
}

interface BreakComplianceReport {
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  totalEmployees: number;
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  entries: BreakComplianceEntry[];
}

export async function GET() {
  const mockReport: BreakComplianceReport = {
    reportDate: new Date().toISOString(),
    periodStart: "2025-01-20",
    periodEnd: "2025-01-26",
    totalEmployees: 55,
    compliantCount: 48,
    nonCompliantCount: 7,
    complianceRate: 87.3,
    entries: [
      {
        employeeId: "emp-012",
        employeeName: "Alice Johnson",
        date: "2025-01-22",
        requiredBreakMinutes: 60,
        actualBreakMinutes: 30,
        isCompliant: false,
        violations: ["Insufficient lunch break duration"],
      },
      {
        employeeId: "emp-023",
        employeeName: "Mike Chen",
        date: "2025-01-21",
        requiredBreakMinutes: 60,
        actualBreakMinutes: 0,
        isCompliant: false,
        violations: ["No lunch break taken", "Worked more than 6 consecutive hours"],
      },
      {
        employeeId: "emp-034",
        employeeName: "Sarah Williams",
        date: "2025-01-23",
        requiredBreakMinutes: 60,
        actualBreakMinutes: 45,
        isCompliant: false,
        violations: ["Insufficient lunch break duration"],
      },
      {
        employeeId: "emp-001",
        employeeName: "John Smith",
        date: "2025-01-22",
        requiredBreakMinutes: 60,
        actualBreakMinutes: 65,
        isCompliant: true,
        violations: [],
      },
    ],
  };

  return NextResponse.json(mockReport);
}
