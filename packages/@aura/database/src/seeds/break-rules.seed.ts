import { PrismaClient } from '@prisma/client';

export interface BreakRule {
  jurisdiction: string;
  type: 'meal' | 'rest';
  afterHours: number;
  durationMinutes: number;
  paid: boolean;
}

export const breakRules: BreakRule[] = [
  // US Federal (no federal mandate, but common practice)
  { jurisdiction: 'US-Federal', type: 'rest', afterHours: 4, durationMinutes: 15, paid: true },
  { jurisdiction: 'US-Federal', type: 'meal', afterHours: 6, durationMinutes: 30, paid: false },

  // California
  { jurisdiction: 'US-CA', type: 'meal', afterHours: 5, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-CA', type: 'meal', afterHours: 10, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-CA', type: 'rest', afterHours: 3.5, durationMinutes: 10, paid: true },

  // New York
  { jurisdiction: 'US-NY', type: 'meal', afterHours: 6, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-NY', type: 'meal', afterHours: 6, durationMinutes: 45, paid: false },

  // Washington
  { jurisdiction: 'US-WA', type: 'meal', afterHours: 5, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-WA', type: 'rest', afterHours: 4, durationMinutes: 10, paid: true },

  // Oregon
  { jurisdiction: 'US-OR', type: 'meal', afterHours: 6, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-OR', type: 'rest', afterHours: 4, durationMinutes: 10, paid: true },

  // Colorado
  { jurisdiction: 'US-CO', type: 'meal', afterHours: 5, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-CO', type: 'rest', afterHours: 4, durationMinutes: 10, paid: true },

  // Massachusetts
  { jurisdiction: 'US-MA', type: 'meal', afterHours: 6, durationMinutes: 30, paid: false },

  // Connecticut
  { jurisdiction: 'US-CT', type: 'meal', afterHours: 7.5, durationMinutes: 30, paid: false },

  // Illinois
  { jurisdiction: 'US-IL', type: 'meal', afterHours: 7.5, durationMinutes: 20, paid: false },

  // Nevada
  { jurisdiction: 'US-NV', type: 'meal', afterHours: 8, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-NV', type: 'rest', afterHours: 3.5, durationMinutes: 10, paid: true },

  // Minnesota
  { jurisdiction: 'US-MN', type: 'meal', afterHours: 8, durationMinutes: 30, paid: false },
  { jurisdiction: 'US-MN', type: 'rest', afterHours: 4, durationMinutes: 10, paid: true },

  // UK
  { jurisdiction: 'UK', type: 'rest', afterHours: 6, durationMinutes: 20, paid: false },

  // India
  { jurisdiction: 'IN', type: 'meal', afterHours: 5, durationMinutes: 30, paid: false },
  { jurisdiction: 'IN', type: 'rest', afterHours: 5, durationMinutes: 15, paid: true },

  // UAE
  { jurisdiction: 'AE', type: 'meal', afterHours: 5, durationMinutes: 60, paid: false },
  { jurisdiction: 'AE', type: 'rest', afterHours: 5, durationMinutes: 30, paid: false },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding break rules...');

  for (let i = 0; i < breakRules.length; i++) {
    const rule = breakRules[i];
    const key = `${rule.jurisdiction}_${rule.type}_${rule.afterHours}h`;
    await prisma.breakRule.upsert({
      where: { key },
      update: {
        jurisdiction: rule.jurisdiction,
        type: rule.type,
        afterHours: rule.afterHours,
        durationMinutes: rule.durationMinutes,
        paid: rule.paid,
      },
      create: {
        key,
        jurisdiction: rule.jurisdiction,
        type: rule.type,
        afterHours: rule.afterHours,
        durationMinutes: rule.durationMinutes,
        paid: rule.paid,
      },
    });
  }

  console.log(`Seeded ${breakRules.length} break rules.`);
}
