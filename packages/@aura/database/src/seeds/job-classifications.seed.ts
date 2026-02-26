/**
 * @module JobClassificationsSeed
 * @description Industry codes, job families, job levels, and salary bands.
 *   These are stored as SystemSetting JSON payloads since there is no dedicated
 *   JobClassification model — the data is consumed at runtime when creating
 *   job profiles and compensation bands.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 4
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface IndustryCode {
  code: string;
  name: string;
  description: string;
  naceCodes?: string[];
}

export interface SalaryRange {
  currency: string;
  min: number;
  mid: number;
  max: number;
  region?: string;
}

export interface JobLevel {
  code: string;
  name: string;
  order: number;
  description: string;
  typicalYearsExperience: string;
  salaryRanges: SalaryRange[];
}

export interface JobFamily {
  code: string;
  name: string;
  description: string;
  industry?: string;
  levels: JobLevel[];
}

// ---------------------------------------------------------------------------
// 10 Industry Codes
// ---------------------------------------------------------------------------

export const industryCodes: IndustryCode[] = [
  {
    code: 'IND_TECH',
    name: 'Technology & IT Services',
    description: 'Software development, IT infrastructure, cybersecurity, and digital transformation',
    naceCodes: ['J62', 'J63'],
  },
  {
    code: 'IND_HEALTH',
    name: 'Healthcare & Life Sciences',
    description: 'Hospitals, clinics, pharmaceuticals, medical devices, and health insurance',
    naceCodes: ['Q86', 'Q87', 'M72'],
  },
  {
    code: 'IND_FINANCE',
    name: 'Financial Services & Banking',
    description: 'Banking, investment management, insurance, and fintech',
    naceCodes: ['K64', 'K65', 'K66'],
  },
  {
    code: 'IND_MANUFACTURING',
    name: 'Manufacturing & Industrial',
    description: 'Discrete and process manufacturing, industrial equipment, and supply chain',
    naceCodes: ['C10', 'C20', 'C25', 'C28'],
  },
  {
    code: 'IND_RETAIL',
    name: 'Retail & Consumer Goods',
    description: 'E-commerce, brick-and-mortar retail, FMCG, and consumer electronics',
    naceCodes: ['G47', 'G46'],
  },
  {
    code: 'IND_EDUCATION',
    name: 'Education & Training',
    description: 'K-12, higher education, vocational training, e-learning, and EdTech',
    naceCodes: ['P85'],
  },
  {
    code: 'IND_GOVERNMENT',
    name: 'Government & Public Sector',
    description: 'Federal, state, and municipal government, defence, and public utilities',
    naceCodes: ['O84'],
  },
  {
    code: 'IND_ENERGY',
    name: 'Energy & Utilities',
    description: 'Oil & gas, renewable energy, electricity generation, and water utilities',
    naceCodes: ['B06', 'D35', 'E36'],
  },
  {
    code: 'IND_TELECOM',
    name: 'Telecommunications',
    description: 'Mobile, broadband, satellite, and enterprise connectivity services',
    naceCodes: ['J61'],
  },
  {
    code: 'IND_CONSTRUCTION',
    name: 'Construction & Real Estate',
    description: 'Civil engineering, property development, facilities management, and architecture',
    naceCodes: ['F41', 'F42', 'L68'],
  },
];

// ---------------------------------------------------------------------------
// 8 Job Families with 5 levels each
// ---------------------------------------------------------------------------

export const jobFamilies: JobFamily[] = [
  // ---- 1. Engineering ----
  {
    code: 'JF_ENG',
    name: 'Engineering',
    description: 'Software, hardware, and systems engineering roles',
    levels: [
      {
        code: 'JF_ENG_ENTRY',
        name: 'Associate Engineer',
        order: 1,
        description: 'Entry-level engineer with 0–2 years experience; works on defined tasks with close supervision',
        typicalYearsExperience: '0–2 years',
        salaryRanges: [
          { currency: 'AED', min: 72000, mid: 90000, max: 108000, region: 'UAE' },
          { currency: 'SAR', min: 72000, mid: 90000, max: 108000, region: 'KSA' },
          { currency: 'INR', min: 400000, mid: 600000, max: 800000, region: 'India' },
          { currency: 'USD', min: 60000, mid: 75000, max: 90000, region: 'US' },
        ],
      },
      {
        code: 'JF_ENG_MID',
        name: 'Engineer',
        order: 2,
        description: 'Mid-level engineer with 2–5 years experience; works independently on complex features',
        typicalYearsExperience: '2–5 years',
        salaryRanges: [
          { currency: 'AED', min: 108000, mid: 144000, max: 180000, region: 'UAE' },
          { currency: 'SAR', min: 108000, mid: 144000, max: 180000, region: 'KSA' },
          { currency: 'INR', min: 800000, mid: 1200000, max: 1800000, region: 'India' },
          { currency: 'USD', min: 90000, mid: 120000, max: 150000, region: 'US' },
        ],
      },
      {
        code: 'JF_ENG_SENIOR',
        name: 'Senior Engineer',
        order: 3,
        description: 'Senior engineer with 5–8 years; leads technical design and mentors junior engineers',
        typicalYearsExperience: '5–8 years',
        salaryRanges: [
          { currency: 'AED', min: 180000, mid: 240000, max: 300000, region: 'UAE' },
          { currency: 'SAR', min: 180000, mid: 240000, max: 300000, region: 'KSA' },
          { currency: 'INR', min: 1800000, mid: 2400000, max: 3600000, region: 'India' },
          { currency: 'USD', min: 150000, mid: 190000, max: 230000, region: 'US' },
        ],
      },
      {
        code: 'JF_ENG_LEAD',
        name: 'Lead Engineer',
        order: 4,
        description: 'Technical lead with 8–12 years; drives architecture, sets engineering standards',
        typicalYearsExperience: '8–12 years',
        salaryRanges: [
          { currency: 'AED', min: 300000, mid: 390000, max: 480000, region: 'UAE' },
          { currency: 'SAR', min: 300000, mid: 390000, max: 480000, region: 'KSA' },
          { currency: 'INR', min: 3600000, mid: 4800000, max: 6000000, region: 'India' },
          { currency: 'USD', min: 200000, mid: 250000, max: 300000, region: 'US' },
        ],
      },
      {
        code: 'JF_ENG_DIR',
        name: 'Director of Engineering',
        order: 5,
        description: 'Engineering director with 12+ years; leads multiple engineering teams and defines technology strategy',
        typicalYearsExperience: '12+ years',
        salaryRanges: [
          { currency: 'AED', min: 480000, mid: 660000, max: 840000, region: 'UAE' },
          { currency: 'SAR', min: 480000, mid: 660000, max: 840000, region: 'KSA' },
          { currency: 'INR', min: 6000000, mid: 9000000, max: 12000000, region: 'India' },
          { currency: 'USD', min: 280000, mid: 360000, max: 450000, region: 'US' },
        ],
      },
    ],
  },

  // ---- 2. Sales ----
  {
    code: 'JF_SALES',
    name: 'Sales',
    description: 'Revenue generation, business development, and account management roles',
    levels: [
      { code: 'JF_SALES_ENTRY', name: 'Sales Development Representative', order: 1, description: 'Inbound/outbound prospecting, lead qualification', typicalYearsExperience: '0–2 years', salaryRanges: [{ currency: 'AED', min: 60000, mid: 84000, max: 108000, region: 'UAE' }, { currency: 'USD', min: 45000, mid: 60000, max: 75000, region: 'US' }] },
      { code: 'JF_SALES_MID', name: 'Account Executive', order: 2, description: 'Full-cycle sales, pipeline management, and quota attainment', typicalYearsExperience: '2–5 years', salaryRanges: [{ currency: 'AED', min: 120000, mid: 180000, max: 240000, region: 'UAE' }, { currency: 'USD', min: 80000, mid: 110000, max: 140000, region: 'US' }] },
      { code: 'JF_SALES_SENIOR', name: 'Senior Account Executive', order: 3, description: 'Enterprise accounts, complex deal structures, strategic selling', typicalYearsExperience: '5–8 years', salaryRanges: [{ currency: 'AED', min: 240000, mid: 360000, max: 480000, region: 'UAE' }, { currency: 'USD', min: 130000, mid: 175000, max: 220000, region: 'US' }] },
      { code: 'JF_SALES_LEAD', name: 'Sales Manager', order: 4, description: 'Team management, territory strategy, coaching, and forecasting', typicalYearsExperience: '8–12 years', salaryRanges: [{ currency: 'AED', min: 300000, mid: 420000, max: 540000, region: 'UAE' }, { currency: 'USD', min: 160000, mid: 210000, max: 260000, region: 'US' }] },
      { code: 'JF_SALES_DIR', name: 'VP of Sales', order: 5, description: 'Regional sales leadership, GTM strategy, and revenue targets', typicalYearsExperience: '12+ years', salaryRanges: [{ currency: 'AED', min: 540000, mid: 720000, max: 900000, region: 'UAE' }, { currency: 'USD', min: 250000, mid: 330000, max: 420000, region: 'US' }] },
    ],
  },

  // ---- 3. Human Resources ----
  {
    code: 'JF_HR',
    name: 'Human Resources',
    description: 'HR generalist, specialist, and HR business partner roles',
    levels: [
      { code: 'JF_HR_ENTRY', name: 'HR Associate', order: 1, description: 'HR admin, onboarding support, data entry', typicalYearsExperience: '0–2 years', salaryRanges: [{ currency: 'AED', min: 54000, mid: 72000, max: 90000, region: 'UAE' }, { currency: 'INR', min: 300000, mid: 450000, max: 600000, region: 'India' }] },
      { code: 'JF_HR_MID', name: 'HR Executive', order: 2, description: 'Recruitment, employee relations, HRIS management', typicalYearsExperience: '2–5 years', salaryRanges: [{ currency: 'AED', min: 90000, mid: 120000, max: 150000, region: 'UAE' }, { currency: 'INR', min: 600000, mid: 900000, max: 1200000, region: 'India' }] },
      { code: 'JF_HR_SENIOR', name: 'Senior HR Executive / HRBP', order: 3, description: 'HR business partnering, talent management, compensation', typicalYearsExperience: '5–8 years', salaryRanges: [{ currency: 'AED', min: 150000, mid: 210000, max: 270000, region: 'UAE' }, { currency: 'INR', min: 1200000, mid: 1800000, max: 2400000, region: 'India' }] },
      { code: 'JF_HR_LEAD', name: 'HR Manager', order: 4, description: 'HR strategy, team leadership, policy development', typicalYearsExperience: '8–12 years', salaryRanges: [{ currency: 'AED', min: 240000, mid: 330000, max: 420000, region: 'UAE' }, { currency: 'INR', min: 2400000, mid: 3600000, max: 4800000, region: 'India' }] },
      { code: 'JF_HR_DIR', name: 'HR Director / CHRO', order: 5, description: 'HR function leadership, C-suite advisory, workforce transformation', typicalYearsExperience: '12+ years', salaryRanges: [{ currency: 'AED', min: 420000, mid: 600000, max: 780000, region: 'UAE' }, { currency: 'USD', min: 200000, mid: 280000, max: 360000, region: 'US' }] },
    ],
  },

  // ---- 4. Finance ----
  {
    code: 'JF_FIN',
    name: 'Finance',
    description: 'Financial planning, accounting, treasury, and FP&A roles',
    levels: [
      { code: 'JF_FIN_ENTRY', name: 'Finance Analyst', order: 1, description: 'Financial reporting, reconciliation, and analysis support', typicalYearsExperience: '0–3 years', salaryRanges: [{ currency: 'AED', min: 72000, mid: 96000, max: 120000, region: 'UAE' }, { currency: 'USD', min: 55000, mid: 70000, max: 85000, region: 'US' }] },
      { code: 'JF_FIN_MID', name: 'Senior Finance Analyst', order: 2, description: 'Budgeting, forecasting, and complex financial modelling', typicalYearsExperience: '3–6 years', salaryRanges: [{ currency: 'AED', min: 120000, mid: 168000, max: 216000, region: 'UAE' }, { currency: 'USD', min: 80000, mid: 105000, max: 130000, region: 'US' }] },
      { code: 'JF_FIN_SENIOR', name: 'Finance Manager', order: 3, description: 'P&L ownership, treasury, compliance, and team leadership', typicalYearsExperience: '6–10 years', salaryRanges: [{ currency: 'AED', min: 216000, mid: 300000, max: 384000, region: 'UAE' }, { currency: 'USD', min: 120000, mid: 155000, max: 190000, region: 'US' }] },
      { code: 'JF_FIN_LEAD', name: 'Senior Finance Manager / Controller', order: 4, description: 'Financial control, statutory reporting, audit management', typicalYearsExperience: '10–15 years', salaryRanges: [{ currency: 'AED', min: 360000, mid: 480000, max: 600000, region: 'UAE' }, { currency: 'USD', min: 175000, mid: 225000, max: 275000, region: 'US' }] },
      { code: 'JF_FIN_DIR', name: 'CFO / Finance Director', order: 5, description: 'Financial strategy, investor relations, and enterprise risk management', typicalYearsExperience: '15+ years', salaryRanges: [{ currency: 'AED', min: 600000, mid: 900000, max: 1200000, region: 'UAE' }, { currency: 'USD', min: 300000, mid: 420000, max: 550000, region: 'US' }] },
    ],
  },

  // ---- 5. Operations ----
  {
    code: 'JF_OPS',
    name: 'Operations',
    description: 'Business operations, process management, logistics, and supply chain',
    levels: [
      { code: 'JF_OPS_ENTRY', name: 'Operations Coordinator', order: 1, description: 'Day-to-day operational support, data entry, scheduling', typicalYearsExperience: '0–2 years', salaryRanges: [{ currency: 'AED', min: 54000, mid: 72000, max: 90000, region: 'UAE' }, { currency: 'USD', min: 40000, mid: 52000, max: 64000, region: 'US' }] },
      { code: 'JF_OPS_MID', name: 'Operations Analyst', order: 2, description: 'Process analysis, KPI tracking, operational improvement projects', typicalYearsExperience: '2–5 years', salaryRanges: [{ currency: 'AED', min: 90000, mid: 120000, max: 150000, region: 'UAE' }, { currency: 'USD', min: 65000, mid: 80000, max: 95000, region: 'US' }] },
      { code: 'JF_OPS_SENIOR', name: 'Senior Operations Manager', order: 3, description: 'End-to-end operations ownership, SLA management, team leadership', typicalYearsExperience: '5–10 years', salaryRanges: [{ currency: 'AED', min: 180000, mid: 240000, max: 300000, region: 'UAE' }, { currency: 'USD', min: 100000, mid: 130000, max: 160000, region: 'US' }] },
      { code: 'JF_OPS_LEAD', name: 'Head of Operations', order: 4, description: 'Cross-functional operations leadership, strategic planning, vendor management', typicalYearsExperience: '10–15 years', salaryRanges: [{ currency: 'AED', min: 300000, mid: 420000, max: 540000, region: 'UAE' }, { currency: 'USD', min: 155000, mid: 200000, max: 245000, region: 'US' }] },
      { code: 'JF_OPS_DIR', name: 'COO / VP Operations', order: 5, description: 'Company-wide operational excellence, transformation, and C-suite leadership', typicalYearsExperience: '15+ years', salaryRanges: [{ currency: 'AED', min: 540000, mid: 780000, max: 1020000, region: 'UAE' }, { currency: 'USD', min: 280000, mid: 375000, max: 470000, region: 'US' }] },
    ],
  },

  // ---- 6. Marketing ----
  {
    code: 'JF_MKT',
    name: 'Marketing',
    description: 'Brand management, digital marketing, product marketing, and content strategy',
    levels: [
      { code: 'JF_MKT_ENTRY', name: 'Marketing Associate', order: 1, description: 'Content creation, social media, event coordination', typicalYearsExperience: '0–2 years', salaryRanges: [{ currency: 'AED', min: 60000, mid: 78000, max: 96000, region: 'UAE' }, { currency: 'USD', min: 45000, mid: 58000, max: 70000, region: 'US' }] },
      { code: 'JF_MKT_MID', name: 'Marketing Executive', order: 2, description: 'Campaign execution, digital channels, analytics, and SEO', typicalYearsExperience: '2–5 years', salaryRanges: [{ currency: 'AED', min: 96000, mid: 132000, max: 168000, region: 'UAE' }, { currency: 'USD', min: 65000, mid: 85000, max: 105000, region: 'US' }] },
      { code: 'JF_MKT_SENIOR', name: 'Senior Marketing Manager', order: 3, description: 'Full-funnel marketing, brand strategy, team lead', typicalYearsExperience: '5–9 years', salaryRanges: [{ currency: 'AED', min: 168000, mid: 240000, max: 312000, region: 'UAE' }, { currency: 'USD', min: 110000, mid: 145000, max: 180000, region: 'US' }] },
      { code: 'JF_MKT_LEAD', name: 'Head of Marketing', order: 4, description: 'Multi-channel marketing leadership, budget ownership, brand identity', typicalYearsExperience: '9–14 years', salaryRanges: [{ currency: 'AED', min: 312000, mid: 432000, max: 552000, region: 'UAE' }, { currency: 'USD', min: 175000, mid: 225000, max: 275000, region: 'US' }] },
      { code: 'JF_MKT_DIR', name: 'CMO / VP Marketing', order: 5, description: 'Marketing strategy, brand vision, and growth leadership', typicalYearsExperience: '14+ years', salaryRanges: [{ currency: 'AED', min: 552000, mid: 780000, max: 1008000, region: 'UAE' }, { currency: 'USD', min: 270000, mid: 365000, max: 460000, region: 'US' }] },
    ],
  },

  // ---- 7. Legal ----
  {
    code: 'JF_LEGAL',
    name: 'Legal',
    description: 'Corporate legal, compliance, contract management, and dispute resolution',
    levels: [
      { code: 'JF_LEGAL_ENTRY', name: 'Legal Officer / Paralegal', order: 1, description: 'Contract drafting support, legal research, document management', typicalYearsExperience: '0–3 years', salaryRanges: [{ currency: 'AED', min: 72000, mid: 96000, max: 120000, region: 'UAE' }, { currency: 'USD', min: 50000, mid: 65000, max: 80000, region: 'US' }] },
      { code: 'JF_LEGAL_MID', name: 'In-House Counsel', order: 2, description: 'Contract negotiations, regulatory compliance, M&A support', typicalYearsExperience: '3–7 years', salaryRanges: [{ currency: 'AED', min: 150000, mid: 210000, max: 270000, region: 'UAE' }, { currency: 'USD', min: 100000, mid: 135000, max: 170000, region: 'US' }] },
      { code: 'JF_LEGAL_SENIOR', name: 'Senior Counsel', order: 3, description: 'Complex legal matters, litigation oversight, policy development', typicalYearsExperience: '7–12 years', salaryRanges: [{ currency: 'AED', min: 270000, mid: 390000, max: 510000, region: 'UAE' }, { currency: 'USD', min: 165000, mid: 215000, max: 265000, region: 'US' }] },
      { code: 'JF_LEGAL_LEAD', name: 'Legal Director', order: 4, description: 'Legal function leadership, risk management, board advisory', typicalYearsExperience: '12–18 years', salaryRanges: [{ currency: 'AED', min: 480000, mid: 660000, max: 840000, region: 'UAE' }, { currency: 'USD', min: 245000, mid: 320000, max: 395000, region: 'US' }] },
      { code: 'JF_LEGAL_DIR', name: 'Chief Legal Officer / GC', order: 5, description: 'Corporate governance, legal strategy, and C-suite advisory', typicalYearsExperience: '18+ years', salaryRanges: [{ currency: 'AED', min: 840000, mid: 1200000, max: 1560000, region: 'UAE' }, { currency: 'USD', min: 350000, mid: 475000, max: 600000, region: 'US' }] },
    ],
  },

  // ---- 8. Executive ----
  {
    code: 'JF_EXEC',
    name: 'Executive',
    description: 'C-suite and senior executive leadership roles',
    levels: [
      { code: 'JF_EXEC_ENTRY', name: 'Executive Assistant', order: 1, description: 'C-suite support, calendar management, stakeholder coordination', typicalYearsExperience: '2–5 years', salaryRanges: [{ currency: 'AED', min: 96000, mid: 132000, max: 168000, region: 'UAE' }, { currency: 'USD', min: 55000, mid: 72000, max: 89000, region: 'US' }] },
      { code: 'JF_EXEC_MID', name: 'Senior Manager / Department Head', order: 2, description: 'Department leadership, cross-functional coordination, P&L ownership', typicalYearsExperience: '10–15 years', salaryRanges: [{ currency: 'AED', min: 360000, mid: 540000, max: 720000, region: 'UAE' }, { currency: 'USD', min: 200000, mid: 270000, max: 340000, region: 'US' }] },
      { code: 'JF_EXEC_SENIOR', name: 'Vice President', order: 3, description: 'Business unit leadership, strategy execution, board reporting', typicalYearsExperience: '15–20 years', salaryRanges: [{ currency: 'AED', min: 720000, mid: 1020000, max: 1320000, region: 'UAE' }, { currency: 'USD', min: 300000, mid: 400000, max: 500000, region: 'US' }] },
      { code: 'JF_EXEC_LEAD', name: 'SVP / EVP', order: 4, description: 'Enterprise-wide strategy, multi-market leadership', typicalYearsExperience: '20–25 years', salaryRanges: [{ currency: 'AED', min: 1200000, mid: 1680000, max: 2160000, region: 'UAE' }, { currency: 'USD', min: 450000, mid: 600000, max: 750000, region: 'US' }] },
      { code: 'JF_EXEC_DIR', name: 'CEO / President', order: 5, description: 'Company vision, Board accountability, investor relations', typicalYearsExperience: '25+ years', salaryRanges: [{ currency: 'AED', min: 2400000, mid: 3600000, max: 4800000, region: 'UAE' }, { currency: 'USD', min: 700000, mid: 1000000, max: 1500000, region: 'US' }] },
    ],
  },
];

/**
 * Seed industry codes and job families into SystemSetting.
 * Idempotent — safe to run multiple times.
 */
export async function seedJobClassifications(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding job classifications...');
  let industryCount = 0;
  let familyCount = 0;
  let levelCount = 0;

  // Seed industry codes
  for (const industry of industryCodes) {
    const key = `job_classification.industry.${industry.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(industry), description: industry.description },
      create: {
        key,
        value: JSON.stringify(industry),
        group: 'job_classifications',
        description: industry.description,
      },
    });
    industryCount++;
  }

  // Seed job families and their levels
  for (const family of jobFamilies) {
    const familyKey = `job_classification.family.${family.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key: familyKey },
      update: {
        value: JSON.stringify({ code: family.code, name: family.name, description: family.description }),
        description: family.description,
      },
      create: {
        key: familyKey,
        value: JSON.stringify({ code: family.code, name: family.name, description: family.description }),
        group: 'job_families',
        description: family.description,
      },
    });
    familyCount++;

    // Seed each level
    for (const level of family.levels) {
      const levelKey = `job_classification.level.${level.code.toLowerCase()}`;
      await prisma.systemSetting.upsert({
        where: { key: levelKey },
        update: { value: JSON.stringify({ ...level, familyCode: family.code, familyName: family.name }) },
        create: {
          key: levelKey,
          value: JSON.stringify({ ...level, familyCode: family.code, familyName: family.name }),
          group: 'job_levels',
          description: `${family.name} — ${level.name}: ${level.description}`,
        },
      });
      levelCount++;
    }
  }

  console.log(`  ✓ Job classifications: ${industryCount} industries, ${familyCount} families, ${levelCount} levels seeded`);
}

// Legacy named export for backward compatibility
export { seedJobClassifications as seed };
