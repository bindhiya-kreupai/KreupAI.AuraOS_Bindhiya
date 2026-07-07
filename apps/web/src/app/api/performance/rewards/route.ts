/**
 * Rewards catalog + points balance API — backed by new models
 * aura_reward_catalog and aura_reward_point_ledger, accessed via
 * (prisma as any).rewardCatalog / (prisma as any).rewardPointLedger.
 * Tenant-scoped; the employee balance is always derived from the authenticated
 * user server-side — never trusted from the client.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  cost: z.number().int().min(0).default(0),
  image: z.string().optional(),
  stock: z.number().int().min(0).optional(),
});

function currentActor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

function err(code: string, message: string, messageAr: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, messageAr, ...(details ? { details } : {}) } },
    { status }
  );
}

async function balanceFor(tenantId: string, employeeId: string): Promise<number> {
  const agg = await (prisma as any).rewardPointLedger.aggregate({
    where: { tenantId, employeeId },
    _sum: { points: true },
  });
  return agg?._sum?.points ?? 0;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const { searchParams } = new URL(request.url);

    const where: any = { tenantId: user.tenantId, isDeleted: false, isActive: true };
    const category = searchParams.get('category');
    if (category && category !== 'All') where.category = category;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100')));
    const skip = (page - 1) * limit;

    const [rows, total, balance] = await Promise.all([
      (prisma as any).rewardCatalog.findMany({
        where,
        orderBy: [{ cost: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      (prisma as any).rewardCatalog.count({ where }),
      balanceFor(user.tenantId, actorId),
    ]);

    return NextResponse.json({
      items: rows,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + rows.length < total,
      balance,
    });
  } catch (error) {
    return err('E5001', 'Failed to fetch rewards', 'فشل في جلب المكافآت', 500);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => null);
    if (!body) return err('E2001', 'Invalid JSON body', 'نص الطلب غير صالح', 400);

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }
    const data = parsed.data;
    const created = await (prisma as any).rewardCatalog.create({
      data: {
        tenantId: user.tenantId,
        name: data.name,
        description: data.description || null,
        category: data.category || 'Perks',
        cost: data.cost,
        image: data.image || null,
        stock: data.stock ?? null,
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    return err('E5001', 'Failed to create reward', 'فشل في إنشاء المكافأة', 500);
  }
});
