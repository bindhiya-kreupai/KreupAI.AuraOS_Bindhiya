import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Directory summary derived from completed ExitRequest records.
export const GET = withEnhancedAuth(async (_request: NextRequest, context) => {
  try {
    const { user } = context;

    const exitRequests = await prisma.exitRequest.findMany({
      where: { tenantId: user.tenantId, status: 'COMPLETED', isDeleted: false },
      select: {
        rehireEligible: true,
        lastWorkingDate: true,
        employee: { select: { department: { select: { name: true } } } },
      },
    });

    const totalAlumni = exitRequests.length;
    const activeAlumni = exitRequests.filter((r) => r.rehireEligible).length;

    const byDept = new Map<string, number>();
    const byYear = new Map<number, number>();
    for (const r of exitRequests) {
      const dept = r.employee?.department?.name || 'Unassigned';
      byDept.set(dept, (byDept.get(dept) || 0) + 1);
      const year = new Date(r.lastWorkingDate).getFullYear();
      byYear.set(year, (byYear.get(year) || 0) + 1);
    }

    const categories = [
      ...Array.from(byDept.entries()).map(([name, count], i) => ({
        categoryId: `dept-${i}`,
        categoryName: name,
        categoryType: 'department' as const,
        alumniCount: count,
      })),
      ...Array.from(byYear.entries()).map(([year, count]) => ({
        categoryId: `year-${year}`,
        categoryName: String(year),
        categoryType: 'year' as const,
        alumniCount: count,
      })),
    ];

    return NextResponse.json(
      {
        directoryId: `dir-${user.tenantId}`,
        totalAlumni,
        activeAlumni,
        lastUpdatedDate: new Date().toISOString(),
        categories,
        featuredAlumni: [] as string[],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch alumni directory',
        messageAr: 'فشل في جلب دليل الخريجين',
      },
      { status: 500 }
    );
  }
});
