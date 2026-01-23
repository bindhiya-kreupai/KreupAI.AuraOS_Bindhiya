import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'current';

  const headcountData = {
    period,
    snapshot: '2026-01-23T00:00:00Z',
    total: 1247,
    byDepartment: [
      { department: 'Engineering', count: 342, percentage: 27.4, change: +12 },
      { department: 'Sales', count: 215, percentage: 17.2, change: +5 },
      { department: 'Marketing', count: 128, percentage: 10.3, change: -2 },
      { department: 'Human Resources', count: 86, percentage: 6.9, change: +3 },
      { department: 'Finance', count: 104, percentage: 8.3, change: +1 },
      { department: 'Operations', count: 178, percentage: 14.3, change: +8 },
      { department: 'Product', count: 95, percentage: 7.6, change: +4 },
      { department: 'Customer Success', count: 99, percentage: 7.9, change: +6 },
    ],
    byLocation: [
      { location: 'New York HQ', count: 425, percentage: 34.1 },
      { location: 'San Francisco', count: 312, percentage: 25.0 },
      { location: 'London', count: 198, percentage: 15.9 },
      { location: 'Singapore', count: 156, percentage: 12.5 },
      { location: 'Remote', count: 156, percentage: 12.5 },
    ],
    byEmploymentType: [
      { type: 'Full-time', count: 1089, percentage: 87.3 },
      { type: 'Part-time', count: 68, percentage: 5.5 },
      { type: 'Contract', count: 56, percentage: 4.5 },
      { type: 'Intern', count: 34, percentage: 2.7 },
    ],
    trends: [
      { month: '2025-07', count: 1180 },
      { month: '2025-08', count: 1195 },
      { month: '2025-09', count: 1208 },
      { month: '2025-10', count: 1220 },
      { month: '2025-11', count: 1235 },
      { month: '2025-12', count: 1240 },
      { month: '2026-01', count: 1247 },
    ],
    newHires: { thisMonth: 18, lastMonth: 22, ytd: 18 },
    separations: { thisMonth: 11, lastMonth: 17, ytd: 11 },
    netGrowth: { thisMonth: 7, lastMonth: 5, ytd: 7, growthRate: 0.56 },
  };

  return NextResponse.json({ success: true, data: headcountData });
}
