/**
 * Budget API — Finance Module (AURA-151, AURA-158)
 * DB-backed, tenant-scoped. Supports create + from-template via POST action.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { BudgetRepo, TemplateRepo } from '@/lib/services/finance/finance.service';

export const GET = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const approvalStatus = searchParams.get('approvalStatus') || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 100;

  const result = await BudgetRepo.list((auth as any).tenantId, {
    status,
    approvalStatus,
    page,
    pageSize,
  });
  return NextResponse.json({
    success: true,
    budgets: result.items,
    ...result,
    summary: {
      totalBudgets: result.total,
      activeBudgets: result.items.filter(
        (b: any) => b.status === 'active' || b.status === 'approved'
      ).length,
      totalBudgetAmount: result.items.reduce(
        (s: number, b: any) => s + Number(b.totalBudget || 0),
        0
      ),
      totalSpent: result.items.reduce((s: number, b: any) => s + Number(b.totalSpent || 0), 0),
      totalRemaining: result.items.reduce(
        (s: number, b: any) => s + Number(b.totalRemaining || 0),
        0
      ),
    },
  });
});

export const POST = createProtectedRoute(async (request: NextRequest, { auth }) => {
  const body = await request.json().catch(() => ({}));
  const action = body.action || 'create';
  const tenantId = (auth as any).tenantId;
  const userId = (auth as any).userId;

  if (action === 'from-template') {
    const { templateId, budgetData } = body;
    if (!templateId) {
      return NextResponse.json(
        { success: false, message: 'templateId is required.', messageAr: 'معرّف القالب مطلوب.' },
        { status: 400 }
      );
    }
    const template = await TemplateRepo.get(tenantId, templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Template not found.', messageAr: 'القالب غير موجود.' },
        { status: 404 }
      );
    }
    const budget = await BudgetRepo.create(tenantId, userId, {
      budgetName: budgetData?.budgetName || `${template.templateName} Budget`,
      budgetType: template.templateType,
      period: template.defaultPeriod,
      lines: template.templateLines,
      ...budgetData,
    });
    await TemplateRepo.recordUsage(tenantId, templateId);
    return NextResponse.json({ success: true, budget }, { status: 201 });
  }

  if (!body.budgetName) {
    return NextResponse.json(
      { success: false, message: 'budgetName is required.', messageAr: 'اسم الميزانية مطلوب.' },
      { status: 400 }
    );
  }
  const budget = await BudgetRepo.create(tenantId, userId, body);
  return NextResponse.json({ success: true, budget }, { status: 201 });
});
