/**
 * Employee Search API — Prisma-backed implementation.
 * Previously used @aura/search (Elasticsearch); rewired to Postgres so the
 * endpoint works without the search backend running.
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const sp = request.nextUrl.searchParams;
    const query = (sp.get('q') || '').trim();
    const department = sp.get('department') || undefined;
    const status = sp.get('status') || undefined;
    const location = sp.get('location') || undefined;
    const from = Math.max(0, parseInt(sp.get('from') || '0', 10));
    const size = Math.min(100, Math.max(1, parseInt(sp.get('size') || '20', 10)));
    const sortBy = sp.get('sortBy') || 'firstName';
    const sortOrder = (sp.get('sortOrder') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

    // Tenant filter via Company relation (Employee has no tenantId scalar).
    const where: any = {
      company: { tenantId: auth!.tenantId },
      isDeleted: false,
    };

    if (department) where.departmentId = department;
    if (location) where.locationId = location;
    if (status) where.status = { code: status };

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { employeeCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = { [sortBy]: sortOrder };

    const [total, rows] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          joiningDate: true,
          department: { select: { id: true, name: true, code: true } },
          location: { select: { id: true, name: true } },
          status: { select: { id: true, code: true, name: true } },
        },
        orderBy,
        skip: from,
        take: size,
      }),
    ]);

    return {
      employees: rows,
      pagination: {
        total,
        from,
        size,
        hasMore: from + size < total,
      },
    };
  },
  {
    requiredPermissions: ['employees:read'],
    rateLimit: 'API_USER',
  }
);
