/**
 * Government Reports API — Localization (AURA-610).
 * Records generated statutory filings and lists past filings. Backed by
 * GovernmentReportArchive (aura_government_report_archive). Tenant-scoped;
 * tenantId/userId are derived from the session and any client-sent id is ignored.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

const db = () => (prisma as any).governmentReportArchive;

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const tenantId = (auth as any).tenantId;
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || undefined;
  const status = searchParams.get('status') || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 50;

  const where = {
    tenantId,
    ...(country ? { country } : {}),
    ...(status ? { status } : {}),
  };
  const [items, total] = await Promise.all([
    db().findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db().count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    items,
    total,
    page,
    pageSize,
    hasNextPage: page * pageSize < total,
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const tenantId = (auth as any).tenantId;
  const userId = (auth as any).userId;
  const body = await request.json().catch(() => null);

  if (!body || !body.country || !body.reportType || !body.period) {
    return NextResponse.json(
      {
        success: false,
        message: 'country, reportType and period are required.',
        messageAr: 'الدولة ونوع التقرير والفترة مطلوبة.',
      },
      { status: 400 }
    );
  }

  const entry = await db().create({
    data: {
      tenantId,
      country: String(body.country),
      countryName: body.countryName ?? null,
      reportType: String(body.reportType),
      authority: body.authority ?? null,
      frequency: body.frequency ?? null,
      period: String(body.period),
      status: body.status ?? 'generated',
      fileRef: body.fileRef ?? `GOVRPT-${String(body.country)}-${Date.now()}`,
      notes: body.notes ?? null,
      generatedAt: new Date(),
      createdBy: userId,
    },
  });

  return NextResponse.json({ success: true, entry }, { status: 201 });
});
