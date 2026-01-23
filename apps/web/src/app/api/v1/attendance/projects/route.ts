import { NextResponse } from "next/server";

interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  status: "active" | "on-hold" | "completed";
  budgetHours: number;
  usedHours: number;
  startDate: string;
  endDate: string | null;
}

const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "Website Redesign",
    code: "WEB-2025",
    clientName: "Acme Corp",
    status: "active",
    budgetHours: 500,
    usedHours: 234,
    startDate: "2025-01-15",
    endDate: "2025-06-30",
  },
  {
    id: "proj-002",
    name: "Mobile App Development",
    code: "MOB-2025",
    clientName: "TechStart Inc",
    status: "active",
    budgetHours: 1200,
    usedHours: 780,
    startDate: "2025-02-01",
    endDate: "2025-12-31",
  },
  {
    id: "proj-003",
    name: "Data Migration",
    code: "DAT-2025",
    clientName: "GlobalBank",
    status: "on-hold",
    budgetHours: 300,
    usedHours: 150,
    startDate: "2025-03-01",
    endDate: null,
  },
  {
    id: "proj-004",
    name: "Infrastructure Upgrade",
    code: "INF-2024",
    clientName: "Internal",
    status: "completed",
    budgetHours: 200,
    usedHours: 195,
    startDate: "2024-10-01",
    endDate: "2025-01-31",
  },
];

export async function GET() {
  return NextResponse.json({
    projects: mockProjects,
    total: mockProjects.length,
  });
}
