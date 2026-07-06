/**
 * Corporate Bank Accounts API — Localization / Payroll (AURA-606).
 * Real corporate disbursement bank-account CRUD backed by
 * CorporateBankAccount (aura_corporate_bank_account). Tenant-scoped;
 * tenantId/userId are derived from the session and any client-sent id is ignored.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

const db = () => (prisma as any).corporateBankAccount;

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const tenantId = (auth as any).tenantId;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 100;

  const where = { tenantId, ...(status ? { status } : {}) };
  const [items, total] = await Promise.all([
    db().findMany({
      where,
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
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

  if (!body || !body.accountName || !body.bankName || !body.accountNumber) {
    return NextResponse.json(
      {
        success: false,
        message: 'accountName, bankName and accountNumber are required.',
        messageAr: 'اسم الحساب واسم البنك ورقم الحساب مطلوبة.',
      },
      { status: 400 }
    );
  }

  const isPrimary = body.isPrimary === true;
  // Only one primary account per tenant — demote existing primary if needed.
  if (isPrimary) {
    await db().updateMany({ where: { tenantId, isPrimary: true }, data: { isPrimary: false } });
  }

  const account = await db().create({
    data: {
      tenantId,
      accountName: String(body.accountName),
      bankName: String(body.bankName),
      accountNumber: String(body.accountNumber),
      ifscCode: body.ifscCode ?? null,
      swiftCode: body.swiftCode ?? null,
      iban: body.iban ?? null,
      branchName: body.branchName ?? null,
      currency: body.currency ?? 'USD',
      disbursementFormat: body.disbursementFormat ?? 'NEFT',
      isPrimary,
      status: body.status ?? 'active',
      notes: body.notes ?? null,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return NextResponse.json({ success: true, account }, { status: 201 });
});
