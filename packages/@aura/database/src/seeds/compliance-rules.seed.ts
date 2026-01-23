import { PrismaClient } from '@prisma/client';

export interface ComplianceRule {
  jurisdiction: string;
  category: string;
  rule: string;
  value: number | string;
  unit: string;
}

export const complianceRules: ComplianceRule[] = [
  // US FLSA Overtime
  { jurisdiction: 'US-Federal', category: 'overtime', rule: 'Weekly overtime threshold', value: 40, unit: 'hours/week' },
  { jurisdiction: 'US-Federal', category: 'overtime', rule: 'Overtime multiplier', value: 1.5, unit: 'x regular rate' },

  // California Daily Overtime
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Daily overtime threshold', value: 8, unit: 'hours/day' },
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Daily overtime multiplier', value: 1.5, unit: 'x regular rate' },
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Daily double time threshold', value: 12, unit: 'hours/day' },
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Daily double time multiplier', value: 2.0, unit: 'x regular rate' },
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Seventh consecutive day first 8 hours', value: 1.5, unit: 'x regular rate' },
  { jurisdiction: 'US-CA', category: 'overtime', rule: 'Seventh consecutive day after 8 hours', value: 2.0, unit: 'x regular rate' },

  // California Meal & Rest Breaks
  { jurisdiction: 'US-CA', category: 'meal_break', rule: 'First meal break after', value: 5, unit: 'hours worked' },
  { jurisdiction: 'US-CA', category: 'meal_break', rule: 'First meal break duration', value: 30, unit: 'minutes' },
  { jurisdiction: 'US-CA', category: 'meal_break', rule: 'Second meal break after', value: 10, unit: 'hours worked' },
  { jurisdiction: 'US-CA', category: 'meal_break', rule: 'Meal break penalty', value: 1, unit: 'hour of pay' },
  { jurisdiction: 'US-CA', category: 'rest_break', rule: 'Rest break frequency', value: 4, unit: 'hours worked' },
  { jurisdiction: 'US-CA', category: 'rest_break', rule: 'Rest break duration', value: 10, unit: 'minutes' },
  { jurisdiction: 'US-CA', category: 'rest_break', rule: 'Rest break penalty', value: 1, unit: 'hour of pay' },

  // US FMLA
  { jurisdiction: 'US-Federal', category: 'leave', rule: 'FMLA leave entitlement', value: 12, unit: 'weeks/year' },
  { jurisdiction: 'US-Federal', category: 'leave', rule: 'FMLA eligibility months', value: 12, unit: 'months employed' },
  { jurisdiction: 'US-Federal', category: 'leave', rule: 'FMLA eligibility hours', value: 1250, unit: 'hours in prior 12 months' },
  { jurisdiction: 'US-Federal', category: 'leave', rule: 'FMLA employer threshold', value: 50, unit: 'employees within 75 miles' },

  // US Minimum Wages
  { jurisdiction: 'US-Federal', category: 'minimum_wage', rule: 'Federal minimum wage', value: 7.25, unit: 'USD/hour' },
  { jurisdiction: 'US-CA', category: 'minimum_wage', rule: 'California minimum wage', value: 16.00, unit: 'USD/hour' },
  { jurisdiction: 'US-WA', category: 'minimum_wage', rule: 'Washington minimum wage', value: 16.28, unit: 'USD/hour' },
  { jurisdiction: 'US-NY', category: 'minimum_wage', rule: 'New York City minimum wage', value: 16.00, unit: 'USD/hour' },
  { jurisdiction: 'US-MA', category: 'minimum_wage', rule: 'Massachusetts minimum wage', value: 15.00, unit: 'USD/hour' },
  { jurisdiction: 'US-CT', category: 'minimum_wage', rule: 'Connecticut minimum wage', value: 15.69, unit: 'USD/hour' },
  { jurisdiction: 'US-NJ', category: 'minimum_wage', rule: 'New Jersey minimum wage', value: 15.49, unit: 'USD/hour' },
  { jurisdiction: 'US-AZ', category: 'minimum_wage', rule: 'Arizona minimum wage', value: 14.35, unit: 'USD/hour' },
  { jurisdiction: 'US-CO', category: 'minimum_wage', rule: 'Colorado minimum wage', value: 14.42, unit: 'USD/hour' },
  { jurisdiction: 'US-IL', category: 'minimum_wage', rule: 'Illinois minimum wage', value: 14.00, unit: 'USD/hour' },
  { jurisdiction: 'US-FL', category: 'minimum_wage', rule: 'Florida minimum wage', value: 13.00, unit: 'USD/hour' },

  // UK Working Time Regulations
  { jurisdiction: 'UK', category: 'working_time', rule: 'Maximum weekly working hours', value: 48, unit: 'hours/week' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Reference period for average', value: 17, unit: 'weeks' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Minimum daily rest period', value: 11, unit: 'consecutive hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Minimum weekly rest period', value: 24, unit: 'consecutive hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Rest break after working', value: 6, unit: 'hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Rest break duration', value: 20, unit: 'minutes' },
  { jurisdiction: 'UK', category: 'leave', rule: 'Statutory annual leave', value: 28, unit: 'days/year including bank holidays' },
  { jurisdiction: 'UK', category: 'minimum_wage', rule: 'National living wage (21+)', value: 11.44, unit: 'GBP/hour' },

  // India Shops & Establishments
  { jurisdiction: 'IN', category: 'working_time', rule: 'Maximum daily working hours', value: 9, unit: 'hours/day' },
  { jurisdiction: 'IN', category: 'working_time', rule: 'Maximum weekly working hours', value: 48, unit: 'hours/week' },
  { jurisdiction: 'IN', category: 'working_time', rule: 'Maximum spread over hours', value: 10.5, unit: 'hours/day' },
  { jurisdiction: 'IN', category: 'overtime', rule: 'Overtime multiplier', value: 2.0, unit: 'x regular rate' },
  { jurisdiction: 'IN', category: 'leave', rule: 'Earned leave entitlement', value: 15, unit: 'days/year' },
  { jurisdiction: 'IN', category: 'leave', rule: 'Sick leave entitlement', value: 12, unit: 'days/year' },
  { jurisdiction: 'IN', category: 'leave', rule: 'Casual leave entitlement', value: 12, unit: 'days/year' },
  { jurisdiction: 'IN', category: 'leave', rule: 'Maternity leave', value: 26, unit: 'weeks' },
  { jurisdiction: 'IN', category: 'leave', rule: 'Paternity leave', value: 15, unit: 'days' },
  { jurisdiction: 'IN', category: 'minimum_wage', rule: 'Central minimum wage floor', value: 178, unit: 'INR/day' },

  // UAE Labor Law
  { jurisdiction: 'AE', category: 'working_time', rule: 'Maximum daily working hours', value: 8, unit: 'hours/day' },
  { jurisdiction: 'AE', category: 'working_time', rule: 'Maximum weekly working hours', value: 48, unit: 'hours/week' },
  { jurisdiction: 'AE', category: 'working_time', rule: 'Ramadan reduced hours', value: 6, unit: 'hours/day' },
  { jurisdiction: 'AE', category: 'overtime', rule: 'Overtime multiplier (day)', value: 1.25, unit: 'x regular rate' },
  { jurisdiction: 'AE', category: 'overtime', rule: 'Overtime multiplier (night 10pm-4am)', value: 1.5, unit: 'x regular rate' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Annual leave (<1 year)', value: 2, unit: 'days/month' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Annual leave (>1 year)', value: 30, unit: 'days/year' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Sick leave (full pay)', value: 15, unit: 'days' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Sick leave (half pay)', value: 30, unit: 'days' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Maternity leave', value: 60, unit: 'days' },
  { jurisdiction: 'AE', category: 'leave', rule: 'Paternity leave', value: 5, unit: 'days' },
  { jurisdiction: 'AE', category: 'probation', rule: 'Maximum probation period', value: 6, unit: 'months' },
  { jurisdiction: 'AE', category: 'termination', rule: 'Notice period (probation)', value: 14, unit: 'days' },
  { jurisdiction: 'AE', category: 'termination', rule: 'Notice period (post-probation)', value: 30, unit: 'days' },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding compliance rules...');

  for (const rule of complianceRules) {
    const key = `${rule.jurisdiction}_${rule.category}_${rule.rule}`;
    await prisma.complianceRule.upsert({
      where: { key },
      update: {
        jurisdiction: rule.jurisdiction,
        category: rule.category,
        rule: rule.rule,
        value: String(rule.value),
        unit: rule.unit,
      },
      create: {
        key,
        jurisdiction: rule.jurisdiction,
        category: rule.category,
        rule: rule.rule,
        value: String(rule.value),
        unit: rule.unit,
      },
    });
  }

  console.log(`Seeded ${complianceRules.length} compliance rules.`);
}
