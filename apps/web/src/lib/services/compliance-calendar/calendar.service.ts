import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { CATEGORY_SEEDS, RECURRENCE_RULE_SEEDS } from './seeds';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

/**
 * EPIC-35-S01..S06 + S09: Recurring statutory task scheduler with
 * holiday/weekend shifting and idempotent generation.
 */
export class ComplianceCalendarService {
  async seedCategories(auth: AuthContext) {
    const created: string[] = [];
    for (const c of CATEGORY_SEEDS) {
      const existing = await (prisma as any).calendarCategory.findUnique({
        where: { aura_calendar_category_unique: { tenantId: auth.tenantId, code: c.code } },
      });
      if (existing) continue;
      await (prisma as any).calendarCategory.create({
        data: { tenantId: auth.tenantId, ...c },
      });
      created.push(c.code);
    }
    return { created };
  }

  async seedRules(auth: AuthContext) {
    const created: string[] = [];
    for (const r of RECURRENCE_RULE_SEEDS) {
      const existing = await (prisma as any).recurrenceRule.findUnique({
        where: { aura_recurrence_rule_unique: { tenantId: auth.tenantId, code: r.code } },
      });
      if (existing) continue;
      await (prisma as any).recurrenceRule.create({
        data: {
          tenantId: auth.tenantId,
          code: r.code,
          name: r.name,
          categoryCode: r.categoryCode,
          countryCode: r.countryCode,
          cadence: r.cadence,
          dayOfMonth: r.dayOfMonth,
          monthOfYear: r.monthOfYear,
          ownerRole: r.ownerRole,
          escalationRole: r.escalationRole,
          leadDays: r.leadDays,
          tierAlerts: r.tierAlerts,
          isActive: true,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      created.push(r.code);
    }
    return { created };
  }

  async listCategories(tenantId: string) {
    return (prisma as any).calendarCategory.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async listRules(tenantId: string, filter: { categoryCode?: string; countryCode?: string } = {}) {
    return (prisma as any).recurrenceRule.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(filter.categoryCode ? { categoryCode: filter.categoryCode } : {}),
        ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
      },
      orderBy: { code: 'asc' },
    });
  }

  async listHolidays(tenantId: string, countryCode: string, year: number) {
    return (prisma as any).holidayCalendar.findMany({
      where: { tenantId, countryCode: countryCode.toUpperCase(), year },
      orderBy: { date: 'asc' },
    });
  }

  async addHoliday(
    input: {
      countryCode: string;
      date: Date;
      name: string;
      isPublic?: boolean;
      isRamadan?: boolean;
    },
    auth: AuthContext
  ) {
    const cc = input.countryCode.toUpperCase();
    return (prisma as any).holidayCalendar.create({
      data: {
        tenantId: auth.tenantId,
        countryCode: cc,
        year: input.date.getFullYear(),
        date: input.date,
        name: input.name,
        isPublic: input.isPublic ?? true,
        isRamadan: input.isRamadan ?? false,
      },
    });
  }

  /**
   * Resolve the next due date for a recurrence rule occurring in a given
   * (year, month). Shifts on weekend/holiday per shiftOnHoliday policy.
   */
  resolveDueDate(
    rule: {
      cadence: string;
      dayOfMonth?: number | null;
      monthOfYear?: number | null;
      shiftOnHoliday: string;
    },
    holidays: Date[],
    year: number,
    month: number // 1..12
  ): Date {
    const dom = rule.dayOfMonth ?? 1;
    const monthToUse = rule.cadence === 'ANNUAL' && rule.monthOfYear ? rule.monthOfYear : month;
    let candidate = new Date(Date.UTC(year, monthToUse - 1, dom));
    // Clamp to last day of month
    const lastDom = new Date(Date.UTC(year, monthToUse, 0)).getUTCDate();
    if (dom > lastDom) candidate = new Date(Date.UTC(year, monthToUse - 1, lastDom));

    const shift = rule.shiftOnHoliday ?? 'PREVIOUS_BUSINESS_DAY';
    const isFri = (d: Date) => d.getUTCDay() === 5;
    const isSat = (d: Date) => d.getUTCDay() === 6;
    const isSun = (d: Date) => d.getUTCDay() === 0;
    const sameDay = (a: Date, b: Date) =>
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate();
    const isHoliday = (d: Date) => holidays.some((h) => sameDay(d, h));
    // GCC weekend default = FRI/SAT — accept either FRI/SAT or SAT/SUN as non-working
    const isWeekend = (d: Date) => isFri(d) || isSat(d) || isSun(d);
    const isNonWorking = (d: Date) => isWeekend(d) || isHoliday(d);

    const stepDays = shift === 'NEXT_BUSINESS_DAY' ? 1 : -1;
    let safety = 14;
    while (isNonWorking(candidate) && safety-- > 0) {
      candidate = new Date(candidate.getTime() + stepDays * 24 * 3600 * 1000);
    }
    return candidate;
  }

  /**
   * Generate (idempotent) compliance tasks for a window of months.
   * `monthsAhead` controls how far into the future we roll-forward.
   */
  async generateTasks(input: { monthsAhead?: number } = {}, auth: AuthContext) {
    const rules = await (prisma as any).recurrenceRule.findMany({
      where: { tenantId: auth.tenantId, isActive: true },
    });
    const now = new Date();
    const window = input.monthsAhead ?? 3;
    let created = 0;
    let skipped = 0;
    for (const rule of rules as Array<Record<string, unknown>>) {
      for (let i = 0; i < window; i++) {
        const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
        const year = target.getUTCFullYear();
        const month = target.getUTCMonth() + 1;
        // Quarterly: only the first month of each quarter
        if ((rule as any).cadence === 'QUARTERLY' && (month - 1) % 3 !== 0) continue;
        // Annual: only the configured month
        if (
          (rule as any).cadence === 'ANNUAL' &&
          (rule as any).monthOfYear != null &&
          month !== (rule as any).monthOfYear
        )
          continue;
        const holidays = (await this.listHolidays(
          auth.tenantId,
          ((rule as any).countryCode as string) ?? 'AE',
          year
        )) as Array<{ date: Date }>;
        const dueDate = this.resolveDueDate(
          {
            cadence: (rule as any).cadence,
            dayOfMonth: (rule as any).dayOfMonth,
            monthOfYear: (rule as any).monthOfYear,
            shiftOnHoliday: (rule as any).shiftOnHoliday,
          },
          holidays.map((h) => new Date(h.date)),
          year,
          month
        );
        const scheduledFor = new Date(Date.UTC(year, month - 1, 1));
        try {
          await (prisma as any).complianceTask.create({
            data: {
              tenantId: auth.tenantId,
              ruleCode: (rule as any).code,
              categoryCode: (rule as any).categoryCode,
              countryCode: (rule as any).countryCode,
              legalEntityId: (rule as any).legalEntityId,
              subject: (rule as any).name,
              ownerRole: (rule as any).ownerRole,
              dueDate,
              scheduledFor,
              originalDueDate: dueDate,
              status: 'OPEN',
              metadata: {},
            },
          });
          created += 1;
        } catch (err) {
          if (String(err).includes('Unique')) skipped += 1;
          else throw err;
        }
      }
    }
    return { created, skipped };
  }

  async listTasks(
    tenantId: string,
    filter: {
      status?: string;
      categoryCode?: string;
      countryCode?: string;
      from?: Date;
      to?: Date;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = {
      tenantId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.categoryCode ? { categoryCode: filter.categoryCode } : {}),
      ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
      ...(filter.from || filter.to
        ? {
            dueDate: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).complianceTask.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).complianceTask.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async completeTask(taskId: string, input: { evidenceUrl?: string }, auth: AuthContext) {
    return (prisma as any).complianceTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: auth.userId,
        evidenceUrl: input.evidenceUrl,
      },
    });
  }

  async deferTask(taskId: string, reason: string, newDueDate: Date, auth: AuthContext) {
    return (prisma as any).complianceTask.update({
      where: { id: taskId },
      data: {
        status: 'DEFERRED',
        dueDate: newDueDate,
        deferReason: reason,
      },
    });
  }

  async escalateOverdue(auth: AuthContext) {
    const overdue = await (prisma as any).complianceTask.findMany({
      where: {
        tenantId: auth.tenantId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
        escalatedAt: null,
      },
      take: 200,
    });
    const escalated: string[] = [];
    for (const t of overdue as Array<Record<string, unknown>>) {
      const rule = await (prisma as any).recurrenceRule.findUnique({
        where: {
          aura_recurrence_rule_unique: { tenantId: auth.tenantId, code: (t as any).ruleCode },
        },
      });
      await (prisma as any).complianceTask.update({
        where: { id: (t as any).id },
        data: {
          status: 'OVERDUE',
          escalatedAt: new Date(),
          escalatedToRole: rule?.escalationRole ?? 'COMPLIANCE_OFFICER',
        },
      });
      escalated.push((t as any).id as string);
    }
    return { escalated };
  }

  /**
   * Re-derive dueDates on future open tasks when holiday/rule changes.
   */
  async rederiveFutureTasks(auth: AuthContext) {
    const tasks = await (prisma as any).complianceTask.findMany({
      where: {
        tenantId: auth.tenantId,
        status: 'OPEN',
        dueDate: { gte: new Date() },
      },
      take: 1000,
    });
    let updated = 0;
    for (const t of tasks as Array<Record<string, unknown>>) {
      if (!(t as any).ruleCode) continue;
      const rule = await (prisma as any).recurrenceRule.findUnique({
        where: {
          aura_recurrence_rule_unique: { tenantId: auth.tenantId, code: (t as any).ruleCode },
        },
      });
      if (!rule) continue;
      const orig = new Date((t as any).originalDueDate as Date);
      const holidays = (await this.listHolidays(
        auth.tenantId,
        (rule.countryCode as string) ?? 'AE',
        orig.getUTCFullYear()
      )) as Array<{ date: Date }>;
      const due = this.resolveDueDate(
        {
          cadence: rule.cadence,
          dayOfMonth: rule.dayOfMonth,
          monthOfYear: rule.monthOfYear,
          shiftOnHoliday: rule.shiftOnHoliday,
        },
        holidays.map((h) => new Date(h.date)),
        orig.getUTCFullYear(),
        orig.getUTCMonth() + 1
      );
      if (due.getTime() !== new Date((t as any).dueDate as Date).getTime()) {
        await (prisma as any).complianceTask.update({
          where: { id: (t as any).id },
          data: { dueDate: due },
        });
        updated += 1;
      }
    }
    return { updated };
  }
}

export const complianceCalendarService = new ComplianceCalendarService();
