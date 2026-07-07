/**
 * Employee Autocomplete API — Prisma-backed implementation.
 * Previously used @aura/search (Elasticsearch); rewired to Postgres.
 */

import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';
import { ValidationError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const sp = request.nextUrl.searchParams;
    const prefix = (sp.get('q') || sp.get('prefix') || '').trim();
    const size = Math.min(50, Math.max(1, parseInt(sp.get('size') || '10', 10)));

    if (prefix.length < 2) {
      throw new ValidationError('Prefix must be at least 2 characters');
    }

    const rows = await prisma.employee.findMany({
      where: {
        company: { tenantId: auth!.tenantId },
        isDeleted: false,
        OR: [
          { firstName: { startsWith: prefix, mode: 'insensitive' } },
          { lastName: { startsWith: prefix, mode: 'insensitive' } },
          { employeeCode: { startsWith: prefix, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
      },
      orderBy: { firstName: 'asc' },
      take: size,
    });

    const suggestions = rows.map((r) => `${r.firstName} ${r.lastName}`);

    return { suggestions, count: suggestions.length };
  },
  {
    requiredPermissions: ['employees:read'],
    rateLimit: 'API_USER',
  }
);
