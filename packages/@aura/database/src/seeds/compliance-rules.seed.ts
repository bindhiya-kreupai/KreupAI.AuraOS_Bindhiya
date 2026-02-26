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

  // US Sick Leave Mandates (State-Level)
  { jurisdiction: 'US-CA', category: 'sick_leave', rule: 'Paid sick leave accrual', value: 1, unit: 'hour per 30 hours worked' },
  { jurisdiction: 'US-CA', category: 'sick_leave', rule: 'Annual usage cap', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-NY', category: 'sick_leave', rule: 'Paid sick leave (5+ employees)', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-NY', category: 'sick_leave', rule: 'Paid sick leave (100+ employees)', value: 56, unit: 'hours/year' },
  { jurisdiction: 'US-WA', category: 'sick_leave', rule: 'Paid sick leave accrual', value: 1, unit: 'hour per 40 hours worked' },
  { jurisdiction: 'US-NJ', category: 'sick_leave', rule: 'Earned sick leave', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-AZ', category: 'sick_leave', rule: 'Paid sick leave (15+ employees)', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-CO', category: 'sick_leave', rule: 'Paid sick leave accrual', value: 1, unit: 'hour per 30 hours worked' },
  { jurisdiction: 'US-CO', category: 'sick_leave', rule: 'Annual accrual cap', value: 48, unit: 'hours/year' },
  { jurisdiction: 'US-MA', category: 'sick_leave', rule: 'Earned sick time', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-CT', category: 'sick_leave', rule: 'Paid sick leave (50+ employees)', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-OR', category: 'sick_leave', rule: 'Paid sick leave (10+ employees)', value: 40, unit: 'hours/year' },
  { jurisdiction: 'US-MD', category: 'sick_leave', rule: 'Earned sick and safe leave', value: 40, unit: 'hours/year' },

  // UK Working Time Regulations
  { jurisdiction: 'UK', category: 'working_time', rule: 'Maximum weekly working hours', value: 48, unit: 'hours/week' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Reference period for average', value: 17, unit: 'weeks' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Minimum daily rest period', value: 11, unit: 'consecutive hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Minimum weekly rest period', value: 24, unit: 'consecutive hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Rest break after working', value: 6, unit: 'hours' },
  { jurisdiction: 'UK', category: 'working_time', rule: 'Rest break duration', value: 20, unit: 'minutes' },
  { jurisdiction: 'UK', category: 'leave', rule: 'Statutory annual leave', value: 28, unit: 'days/year including bank holidays' },
  { jurisdiction: 'UK', category: 'minimum_wage', rule: 'National living wage (21+)', value: 11.44, unit: 'GBP/hour' },

  // UK Statutory Sick Pay
  { jurisdiction: 'UK', category: 'sick_pay', rule: 'SSP weekly rate', value: 109.40, unit: 'GBP/week' },
  { jurisdiction: 'UK', category: 'sick_pay', rule: 'SSP qualifying days', value: 3, unit: 'waiting days' },
  { jurisdiction: 'UK', category: 'sick_pay', rule: 'SSP maximum duration', value: 28, unit: 'weeks' },
  { jurisdiction: 'UK', category: 'sick_pay', rule: 'SSP lower earnings limit', value: 123, unit: 'GBP/week' },

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

  // Notice Period Requirements by Jurisdiction
  { jurisdiction: 'US-Federal', category: 'notice_period', rule: 'At-will termination notice', value: 0, unit: 'days (at-will)' },
  { jurisdiction: 'US-Federal', category: 'notice_period', rule: 'WARN Act mass layoff notice', value: 60, unit: 'days (100+ employees)' },
  { jurisdiction: 'US-CA', category: 'notice_period', rule: 'Cal-WARN notice', value: 60, unit: 'days (75+ employees)' },
  { jurisdiction: 'UK', category: 'notice_period', rule: 'Statutory minimum (<2 years)', value: 1, unit: 'week' },
  { jurisdiction: 'UK', category: 'notice_period', rule: 'Statutory minimum (2-12 years)', value: 1, unit: 'week per year of service' },
  { jurisdiction: 'UK', category: 'notice_period', rule: 'Statutory minimum (12+ years)', value: 12, unit: 'weeks' },
  { jurisdiction: 'UK', category: 'notice_period', rule: 'Employee notice to employer', value: 1, unit: 'week' },
  { jurisdiction: 'IN', category: 'notice_period', rule: 'During probation', value: 0, unit: 'days (or as per appointment letter)' },
  { jurisdiction: 'IN', category: 'notice_period', rule: 'Post confirmation (typical)', value: 30, unit: 'days' },
  { jurisdiction: 'IN', category: 'notice_period', rule: 'Senior roles (typical)', value: 90, unit: 'days' },
  { jurisdiction: 'IN', category: 'notice_period', rule: 'Industrial workers (Sec 25F)', value: 30, unit: 'days' },
  { jurisdiction: 'CA', category: 'notice_period', rule: 'Individual termination (3m-2y)', value: 1, unit: 'week' },
  { jurisdiction: 'CA', category: 'notice_period', rule: 'Individual termination (2-4 years)', value: 2, unit: 'weeks' },
  { jurisdiction: 'CA', category: 'notice_period', rule: 'Individual termination (4-6 years)', value: 4, unit: 'weeks' },
  { jurisdiction: 'CA', category: 'notice_period', rule: 'Individual termination (6-8 years)', value: 5, unit: 'weeks' },
  { jurisdiction: 'CA', category: 'notice_period', rule: 'Individual termination (8+ years)', value: 8, unit: 'weeks' },
  { jurisdiction: 'DE', category: 'notice_period', rule: 'During probation', value: 14, unit: 'days' },
  { jurisdiction: 'DE', category: 'notice_period', rule: 'Statutory minimum', value: 4, unit: 'weeks' },
  { jurisdiction: 'DE', category: 'notice_period', rule: 'After 2 years', value: 1, unit: 'month (to end of month)' },
  { jurisdiction: 'DE', category: 'notice_period', rule: 'After 5 years', value: 2, unit: 'months (to end of month)' },
  { jurisdiction: 'DE', category: 'notice_period', rule: 'After 20 years', value: 7, unit: 'months (to end of month)' },
  { jurisdiction: 'FR', category: 'notice_period', rule: 'Employees (<6 months)', value: 0, unit: 'days (per collective agreement)' },
  { jurisdiction: 'FR', category: 'notice_period', rule: 'Employees (6m-2y)', value: 1, unit: 'month' },
  { jurisdiction: 'FR', category: 'notice_period', rule: 'Employees (2+ years)', value: 2, unit: 'months' },
  { jurisdiction: 'AU', category: 'notice_period', rule: 'Employment (1-3 years)', value: 2, unit: 'weeks' },
  { jurisdiction: 'AU', category: 'notice_period', rule: 'Employment (3-5 years)', value: 3, unit: 'weeks' },
  { jurisdiction: 'AU', category: 'notice_period', rule: 'Employment (5+ years)', value: 4, unit: 'weeks' },
  { jurisdiction: 'AU', category: 'notice_period', rule: 'Over 45 years old (2+ years service)', value: 1, unit: 'additional week' },
  { jurisdiction: 'SG', category: 'notice_period', rule: 'Employment (<26 weeks)', value: 1, unit: 'day' },
  { jurisdiction: 'SG', category: 'notice_period', rule: 'Employment (26w-2y)', value: 1, unit: 'week' },
  { jurisdiction: 'SG', category: 'notice_period', rule: 'Employment (2-5 years)', value: 2, unit: 'weeks' },
  { jurisdiction: 'SG', category: 'notice_period', rule: 'Employment (5+ years)', value: 4, unit: 'weeks' },
  { jurisdiction: 'JP', category: 'notice_period', rule: 'Statutory minimum', value: 30, unit: 'days' },
];

/**
 * NOTE: ComplianceRule is not a dedicated Prisma model.
 * Rules are stored in SystemSetting under the `compliance_rules` group.
 */
export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding compliance rules...');

  for (const rule of complianceRules) {
    // Create a deterministic key from jurisdiction + category + rule text
    const keySlug = `${rule.jurisdiction}_${rule.category}_${rule.rule}`
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 200);
    const key = `compliance_rule.${keySlug}`;

    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(rule) },
      create: {
        key,
        value: JSON.stringify(rule),
        group: 'compliance_rules',
        description: `${rule.jurisdiction} – ${rule.category}: ${rule.rule}`,
      },
    });
  }

  console.log(`Seeded ${complianceRules.length} compliance rules.`);
}
