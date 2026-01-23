import { PrismaClient } from '@prisma/client';

export interface IndustryCode {
  system: string;
  code: string;
  title: string;
  level: number;
}

export const naicsCodes: IndustryCode[] = [
  { system: 'NAICS', code: '11', title: 'Agriculture, Forestry, Fishing and Hunting', level: 2 },
  { system: 'NAICS', code: '21', title: 'Mining, Quarrying, and Oil and Gas Extraction', level: 2 },
  { system: 'NAICS', code: '22', title: 'Utilities', level: 2 },
  { system: 'NAICS', code: '23', title: 'Construction', level: 2 },
  { system: 'NAICS', code: '31-33', title: 'Manufacturing', level: 2 },
  { system: 'NAICS', code: '42', title: 'Wholesale Trade', level: 2 },
  { system: 'NAICS', code: '44-45', title: 'Retail Trade', level: 2 },
  { system: 'NAICS', code: '48-49', title: 'Transportation and Warehousing', level: 2 },
  { system: 'NAICS', code: '51', title: 'Information', level: 2 },
  { system: 'NAICS', code: '52', title: 'Finance and Insurance', level: 2 },
  { system: 'NAICS', code: '53', title: 'Real Estate and Rental and Leasing', level: 2 },
  { system: 'NAICS', code: '54', title: 'Professional, Scientific, and Technical Services', level: 2 },
  { system: 'NAICS', code: '55', title: 'Management of Companies and Enterprises', level: 2 },
  { system: 'NAICS', code: '56', title: 'Administrative and Support and Waste Management and Remediation Services', level: 2 },
  { system: 'NAICS', code: '61', title: 'Educational Services', level: 2 },
  { system: 'NAICS', code: '62', title: 'Health Care and Social Assistance', level: 2 },
  { system: 'NAICS', code: '71', title: 'Arts, Entertainment, and Recreation', level: 2 },
  { system: 'NAICS', code: '72', title: 'Accommodation and Food Services', level: 2 },
  { system: 'NAICS', code: '81', title: 'Other Services (except Public Administration)', level: 2 },
  { system: 'NAICS', code: '92', title: 'Public Administration', level: 2 },
];

export const sicCodes: IndustryCode[] = [
  { system: 'SIC', code: 'A', title: 'Agriculture, Forestry, and Fishing', level: 1 },
  { system: 'SIC', code: 'B', title: 'Mining', level: 1 },
  { system: 'SIC', code: 'C', title: 'Construction', level: 1 },
  { system: 'SIC', code: 'D', title: 'Manufacturing', level: 1 },
  { system: 'SIC', code: 'E', title: 'Transportation, Communications, Electric, Gas, and Sanitary Services', level: 1 },
  { system: 'SIC', code: 'F', title: 'Wholesale Trade', level: 1 },
  { system: 'SIC', code: 'G', title: 'Retail Trade', level: 1 },
  { system: 'SIC', code: 'H', title: 'Finance, Insurance, and Real Estate', level: 1 },
  { system: 'SIC', code: 'I', title: 'Services', level: 1 },
  { system: 'SIC', code: 'J', title: 'Public Administration', level: 1 },
];

export const industryCodes: IndustryCode[] = [
  ...naicsCodes,
  ...sicCodes,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding industry codes...');

  for (const code of industryCodes) {
    const key = `${code.system}_${code.code}`;
    await prisma.industryCode.upsert({
      where: { key },
      update: {
        system: code.system,
        code: code.code,
        title: code.title,
        level: code.level,
      },
      create: {
        key,
        system: code.system,
        code: code.code,
        title: code.title,
        level: code.level,
      },
    });
  }

  console.log(`Seeded ${industryCodes.length} industry codes (${naicsCodes.length} NAICS, ${sicCodes.length} SIC).`);
}
