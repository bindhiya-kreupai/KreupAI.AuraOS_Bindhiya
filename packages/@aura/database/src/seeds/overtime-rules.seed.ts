import { PrismaClient } from '@prisma/client';

export interface OvertimeRule {
  jurisdiction: string;
  dailyThreshold?: number;
  weeklyThreshold: number;
  multiplier: number;
  doubleTimeThreshold?: number;
}

export const overtimeRules: OvertimeRule[] = [
  // US Federal
  { jurisdiction: 'US-Federal', weeklyThreshold: 40, multiplier: 1.5 },

  // US States
  { jurisdiction: 'US-CA', dailyThreshold: 8, weeklyThreshold: 40, multiplier: 1.5, doubleTimeThreshold: 12 },
  { jurisdiction: 'US-AK', dailyThreshold: 8, weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-NV', dailyThreshold: 8, weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-CO', dailyThreshold: 12, weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-OR', weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-WA', weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-NY', weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-CT', weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-MA', weeklyThreshold: 40, multiplier: 1.5 },
  { jurisdiction: 'US-IL', weeklyThreshold: 40, multiplier: 1.5 },

  // UK
  { jurisdiction: 'UK', weeklyThreshold: 48, multiplier: 1.0 },

  // India
  { jurisdiction: 'IN', dailyThreshold: 9, weeklyThreshold: 48, multiplier: 2.0 },

  // UAE
  { jurisdiction: 'AE', dailyThreshold: 8, weeklyThreshold: 48, multiplier: 1.25 },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding overtime rules...');

  for (const rule of overtimeRules) {
    await prisma.overtimeRule.upsert({
      where: { jurisdiction: rule.jurisdiction },
      update: {
        dailyThreshold: rule.dailyThreshold ?? null,
        weeklyThreshold: rule.weeklyThreshold,
        multiplier: rule.multiplier,
        doubleTimeThreshold: rule.doubleTimeThreshold ?? null,
      },
      create: {
        jurisdiction: rule.jurisdiction,
        dailyThreshold: rule.dailyThreshold ?? null,
        weeklyThreshold: rule.weeklyThreshold,
        multiplier: rule.multiplier,
        doubleTimeThreshold: rule.doubleTimeThreshold ?? null,
      },
    });
  }

  console.log(`Seeded ${overtimeRules.length} overtime rules.`);
}
