import { prisma } from '@aura/database';
import { BaseService } from './base.service';
import { cloudCostService } from './cloud-cost.service';

export type BudgetScope = 'TENANT' | 'SERVICE' | 'REGION' | 'PLATFORM';

export interface BudgetEvaluation {
  budgetId: string;
  name: string;
  monthlyBudget: number;
  actualSpend: number;
  utilisationPct: number;
  alertTripped: boolean; // crossed alertThresholdPct
  forecastTripped: boolean; // projected to cross forecastThresholdPct
  forecastSpend: number;
  alertThresholdPct: number;
  forecastThresholdPct: number;
}

export class InvalidThresholdError extends Error {
  constructor(field: string, value: number) {
    super(`${field} must be in (0, 200]. Got ${value}.`);
    this.name = 'InvalidThresholdError';
  }
}

export class CostBudgetService extends BaseService {
  constructor() {
    super('CostBudgetService');
  }

  private validateThresholds(alertPct?: number, forecastPct?: number): void {
    if (alertPct !== undefined && (alertPct <= 0 || alertPct > 200)) {
      throw new InvalidThresholdError('alertThresholdPct', alertPct);
    }
    if (forecastPct !== undefined && (forecastPct <= 0 || forecastPct > 200)) {
      throw new InvalidThresholdError('forecastThresholdPct', forecastPct);
    }
  }

  /**
   * Pure: linear-rate forecast. Project total monthly spend by extrapolating
   * the current burn-rate to the end of month.
   */
  forecastEndOfMonth(actualSpend: number, dayOfMonth: number, daysInMonth: number): number {
    if (dayOfMonth <= 0 || dayOfMonth > daysInMonth) return actualSpend;
    return Math.round((actualSpend / dayOfMonth) * daysInMonth * 100) / 100;
  }

  /**
   * Pure: evaluate a single budget given actual + day-of-month context.
   */
  evaluate(
    budget: {
      id: string;
      name: string;
      monthlyBudget: number | string;
      alertThresholdPct: number;
      forecastThresholdPct: number;
    },
    actualSpend: number,
    dayOfMonth: number,
    daysInMonth: number
  ): BudgetEvaluation {
    const monthly =
      typeof budget.monthlyBudget === 'string'
        ? Number(budget.monthlyBudget)
        : budget.monthlyBudget;
    const forecastSpend = this.forecastEndOfMonth(actualSpend, dayOfMonth, daysInMonth);
    const utilisationPct = monthly === 0 ? 0 : (actualSpend / monthly) * 100;
    return {
      budgetId: budget.id,
      name: budget.name,
      monthlyBudget: monthly,
      actualSpend: Math.round(actualSpend * 100) / 100,
      utilisationPct: Math.round(utilisationPct * 100) / 100,
      alertTripped: utilisationPct >= budget.alertThresholdPct,
      forecastTripped:
        monthly > 0 && (forecastSpend / monthly) * 100 >= budget.forecastThresholdPct,
      forecastSpend,
      alertThresholdPct: budget.alertThresholdPct,
      forecastThresholdPct: budget.forecastThresholdPct,
    };
  }

  async create(input: {
    tenantId?: string | null;
    name: string;
    scope: BudgetScope;
    scopeValue?: string;
    monthlyBudget: number;
    currency?: string;
    alertThresholdPct?: number;
    forecastThresholdPct?: number;
    ownerEmail?: string;
    actorId: string;
  }) {
    this.validateThresholds(input.alertThresholdPct, input.forecastThresholdPct);
    return (prisma as any).costBudget.create({
      data: {
        tenantId: input.tenantId ?? null,
        name: input.name,
        scope: input.scope,
        scopeValue: input.scopeValue ?? null,
        monthlyBudget: input.monthlyBudget,
        currency: input.currency ?? 'USD',
        alertThresholdPct: input.alertThresholdPct ?? 80,
        forecastThresholdPct: input.forecastThresholdPct ?? 100,
        ownerEmail: input.ownerEmail ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string | null,
    actorId: string,
    patch: Partial<{
      monthlyBudget: number;
      alertThresholdPct: number;
      forecastThresholdPct: number;
      ownerEmail: string;
      isActive: boolean;
    }>
  ) {
    this.validateThresholds(patch.alertThresholdPct, patch.forecastThresholdPct);
    const existing = await (prisma as any).costBudget.findFirst({
      where: { id, tenantId: tenantId ?? null },
    });
    if (!existing) return null;
    return (prisma as any).costBudget.update({
      where: { id },
      data: { ...patch, updatedBy: actorId },
    });
  }

  /**
   * Cron-friendly: evaluate every active budget against current-month spend.
   * Returns evaluations so the caller can fire notifications for tripped rows.
   */
  async evaluateAll(tenantId: string | null, now = new Date()): Promise<BudgetEvaluation[]> {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const dayOfMonth = now.getUTCDate();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const rollup = await cloudCostService.monthSoFar(tenantId, year, month);
    const budgets = await (prisma as any).costBudget.findMany({
      where: { tenantId: tenantId ?? null, isActive: true },
    });
    return budgets.map((b: any) => {
      let spend = rollup.total;
      if (b.scope === 'SERVICE' && b.scopeValue) {
        spend = rollup.byService[b.scopeValue] ?? 0;
      } else if (b.scope === 'REGION' && b.scopeValue) {
        spend = rollup.byRegion[b.scopeValue] ?? 0;
      }
      return this.evaluate(
        {
          id: b.id,
          name: b.name,
          monthlyBudget: b.monthlyBudget.toString(),
          alertThresholdPct: b.alertThresholdPct,
          forecastThresholdPct: b.forecastThresholdPct,
        },
        spend,
        dayOfMonth,
        daysInMonth
      );
    });
  }

  async list(params: {
    tenantId?: string | null;
    scope?: BudgetScope;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (params.tenantId !== undefined) where.tenantId = params.tenantId;
    if (params.scope) where.scope = params.scope;
    if (params.activeOnly) where.isActive = true;
    const [items, total] = await Promise.all([
      (prisma as any).costBudget.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).costBudget.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }
}

export const costBudgetService = new CostBudgetService();
