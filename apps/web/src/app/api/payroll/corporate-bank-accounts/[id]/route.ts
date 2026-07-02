/**
 * Corporate Bank Account detail API — Localization / Payroll (AURA-606).
 * PUT/DELETE a single corporate bank account. Tenant-scoped; the record is
 * verified to belong to the caller's tenant before any mutation.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

const db = () => (prisma as any).corporateBankAccount;

const notFound = () =>
  NextResponse.json(
    { success: false, message: 'Bank account not found.', messageAr: 'الحساب البنكي غير موجود.' },
    { status: 404 }
  );

export const PUT = createProtectedRoute(async (request: NextRequest, { auth, params }) => {
  const tenantId = (auth as any).tenantId;
  const userId = (auth as any).userId;
  const id = params.id;
  const body = await request.json().catch(() => ({}));

  const existing = await db().findFirst({ where: { id, tenantId } });
  if (!existing) return notFound();

  if (body.isPrimary === true) {
    await db().updateMany({
      where: { tenantId, isPrimary: true, NOT: { id } },
      data: { isPrimary: false },
    });
  }

  const data: Record<string, unknown> = { updatedBy: userId };
  for (const field of [
    'accountName',
    'bankName',
    'accountNumber',
    'ifscCode',
    'swiftCode',
    'iban',
    'branchName',
    'currency',
    'disbursementFormat',
    'isPrimary',
    'status',
    'notes',
  ]) {
    if (body[field] !== undefined) data[field] = body[field];
  }

  const account = await db().update({ where: { id }, data });
  return NextResponse.json({ success: true, account });
});

export const DELETE = createProtectedRoute(async (_request: NextRequest, { auth, params }) => {
  const tenantId = (auth as any).tenantId;
  const id = params.id;

  const existing = await db().findFirst({ where: { id, tenantId } });
  if (!existing) return notFound();

  await db().delete({ where: { id } });
  return NextResponse.json({
    success: true,
    message: 'Bank account deleted.',
    messageAr: 'تم حذف الحساب البنكي.',
  });
});
