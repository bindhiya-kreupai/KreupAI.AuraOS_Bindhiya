import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  const { user } = context;
  try {
    const tenantId = user.tenantId;

    const locations = await prisma.location.findMany({
      where: {
        company: { tenantId },
        isDeleted: false,
      },
      include: {
        address: {
          include: { city: { include: { state: { include: { country: true } } } } },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    const formatted = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      city: loc.address?.city?.name || '',
      country: loc.address?.country?.name || '',
      timezone: 'UTC',
      employeeCount: loc._count.employees,
      address: loc.address ? `${loc.address.line1}, ${loc.address.line2 || ''}`.trim() : undefined,
      isHeadquarters: loc.type === 'HEADQUARTERS',
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[Directory Locations API] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch directory locations' }, { status: 500 });
  }
});
