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

export const naicsSubsectors: IndustryCode[] = [
  // Agriculture
  { system: 'NAICS', code: '111', title: 'Crop Production', level: 3 },
  { system: 'NAICS', code: '112', title: 'Animal Production and Aquaculture', level: 3 },
  { system: 'NAICS', code: '113', title: 'Forestry and Logging', level: 3 },
  { system: 'NAICS', code: '114', title: 'Fishing, Hunting and Trapping', level: 3 },
  { system: 'NAICS', code: '115', title: 'Support Activities for Agriculture and Forestry', level: 3 },
  // Mining
  { system: 'NAICS', code: '211', title: 'Oil and Gas Extraction', level: 3 },
  { system: 'NAICS', code: '212', title: 'Mining (except Oil and Gas)', level: 3 },
  { system: 'NAICS', code: '213', title: 'Support Activities for Mining', level: 3 },
  // Utilities
  { system: 'NAICS', code: '221', title: 'Utilities', level: 3 },
  // Construction
  { system: 'NAICS', code: '236', title: 'Construction of Buildings', level: 3 },
  { system: 'NAICS', code: '237', title: 'Heavy and Civil Engineering Construction', level: 3 },
  { system: 'NAICS', code: '238', title: 'Specialty Trade Contractors', level: 3 },
  // Manufacturing
  { system: 'NAICS', code: '311', title: 'Food Manufacturing', level: 3 },
  { system: 'NAICS', code: '312', title: 'Beverage and Tobacco Product Manufacturing', level: 3 },
  { system: 'NAICS', code: '313', title: 'Textile Mills', level: 3 },
  { system: 'NAICS', code: '321', title: 'Wood Product Manufacturing', level: 3 },
  { system: 'NAICS', code: '322', title: 'Paper Manufacturing', level: 3 },
  { system: 'NAICS', code: '324', title: 'Petroleum and Coal Products Manufacturing', level: 3 },
  { system: 'NAICS', code: '325', title: 'Chemical Manufacturing', level: 3 },
  { system: 'NAICS', code: '326', title: 'Plastics and Rubber Products Manufacturing', level: 3 },
  { system: 'NAICS', code: '331', title: 'Primary Metal Manufacturing', level: 3 },
  { system: 'NAICS', code: '332', title: 'Fabricated Metal Product Manufacturing', level: 3 },
  { system: 'NAICS', code: '333', title: 'Machinery Manufacturing', level: 3 },
  { system: 'NAICS', code: '334', title: 'Computer and Electronic Product Manufacturing', level: 3 },
  { system: 'NAICS', code: '335', title: 'Electrical Equipment, Appliance, and Component Manufacturing', level: 3 },
  { system: 'NAICS', code: '336', title: 'Transportation Equipment Manufacturing', level: 3 },
  { system: 'NAICS', code: '337', title: 'Furniture and Related Product Manufacturing', level: 3 },
  { system: 'NAICS', code: '339', title: 'Miscellaneous Manufacturing', level: 3 },
  // Wholesale Trade
  { system: 'NAICS', code: '423', title: 'Merchant Wholesalers, Durable Goods', level: 3 },
  { system: 'NAICS', code: '424', title: 'Merchant Wholesalers, Nondurable Goods', level: 3 },
  { system: 'NAICS', code: '425', title: 'Wholesale Trade Agents and Brokers', level: 3 },
  // Retail Trade
  { system: 'NAICS', code: '441', title: 'Motor Vehicle and Parts Dealers', level: 3 },
  { system: 'NAICS', code: '444', title: 'Building Material and Garden Equipment Dealers', level: 3 },
  { system: 'NAICS', code: '445', title: 'Food and Beverage Retailers', level: 3 },
  { system: 'NAICS', code: '449', title: 'Furniture, Home Furnishings, Electronics, and Appliance Retailers', level: 3 },
  { system: 'NAICS', code: '455', title: 'General Merchandise Retailers', level: 3 },
  { system: 'NAICS', code: '456', title: 'Health and Personal Care Retailers', level: 3 },
  // Transportation
  { system: 'NAICS', code: '481', title: 'Air Transportation', level: 3 },
  { system: 'NAICS', code: '482', title: 'Rail Transportation', level: 3 },
  { system: 'NAICS', code: '483', title: 'Water Transportation', level: 3 },
  { system: 'NAICS', code: '484', title: 'Truck Transportation', level: 3 },
  { system: 'NAICS', code: '485', title: 'Transit and Ground Passenger Transportation', level: 3 },
  { system: 'NAICS', code: '491', title: 'Postal Service', level: 3 },
  { system: 'NAICS', code: '492', title: 'Couriers and Messengers', level: 3 },
  { system: 'NAICS', code: '493', title: 'Warehousing and Storage', level: 3 },
  // Information
  { system: 'NAICS', code: '511', title: 'Publishing Industries', level: 3 },
  { system: 'NAICS', code: '512', title: 'Motion Picture and Sound Recording Industries', level: 3 },
  { system: 'NAICS', code: '515', title: 'Broadcasting (except Internet)', level: 3 },
  { system: 'NAICS', code: '517', title: 'Telecommunications', level: 3 },
  { system: 'NAICS', code: '518', title: 'Computing Infrastructure Providers, Data Processing, and Related Services', level: 3 },
  { system: 'NAICS', code: '519', title: 'Web Search Portals, Libraries, Archives, and Other Information Services', level: 3 },
  // Finance and Insurance
  { system: 'NAICS', code: '521', title: 'Monetary Authorities - Central Bank', level: 3 },
  { system: 'NAICS', code: '522', title: 'Credit Intermediation and Related Activities', level: 3 },
  { system: 'NAICS', code: '523', title: 'Securities, Commodity Contracts, and Other Financial Investments', level: 3 },
  { system: 'NAICS', code: '524', title: 'Insurance Carriers and Related Activities', level: 3 },
  { system: 'NAICS', code: '525', title: 'Funds, Trusts, and Other Financial Vehicles', level: 3 },
  // Real Estate
  { system: 'NAICS', code: '531', title: 'Real Estate', level: 3 },
  { system: 'NAICS', code: '532', title: 'Rental and Leasing Services', level: 3 },
  { system: 'NAICS', code: '533', title: 'Lessors of Nonfinancial Intangible Assets', level: 3 },
  // Professional Services
  { system: 'NAICS', code: '541', title: 'Professional, Scientific, and Technical Services', level: 3 },
  // Management
  { system: 'NAICS', code: '551', title: 'Management of Companies and Enterprises', level: 3 },
  // Administrative
  { system: 'NAICS', code: '561', title: 'Administrative and Support Services', level: 3 },
  { system: 'NAICS', code: '562', title: 'Waste Management and Remediation Services', level: 3 },
  // Education
  { system: 'NAICS', code: '611', title: 'Educational Services', level: 3 },
  // Health Care
  { system: 'NAICS', code: '621', title: 'Ambulatory Health Care Services', level: 3 },
  { system: 'NAICS', code: '622', title: 'Hospitals', level: 3 },
  { system: 'NAICS', code: '623', title: 'Nursing and Residential Care Facilities', level: 3 },
  { system: 'NAICS', code: '624', title: 'Social Assistance', level: 3 },
  // Arts and Entertainment
  { system: 'NAICS', code: '711', title: 'Performing Arts, Spectator Sports, and Related Industries', level: 3 },
  { system: 'NAICS', code: '712', title: 'Museums, Historical Sites, and Similar Institutions', level: 3 },
  { system: 'NAICS', code: '713', title: 'Amusement, Gambling, and Recreation Industries', level: 3 },
  // Accommodation and Food
  { system: 'NAICS', code: '721', title: 'Accommodation', level: 3 },
  { system: 'NAICS', code: '722', title: 'Food Services and Drinking Places', level: 3 },
  // Other Services
  { system: 'NAICS', code: '811', title: 'Repair and Maintenance', level: 3 },
  { system: 'NAICS', code: '812', title: 'Personal and Laundry Services', level: 3 },
  { system: 'NAICS', code: '813', title: 'Religious, Grantmaking, Civic, Professional, and Similar Organizations', level: 3 },
  { system: 'NAICS', code: '814', title: 'Private Households', level: 3 },
  // Public Administration
  { system: 'NAICS', code: '921', title: 'Executive, Legislative, and Other General Government Support', level: 3 },
  { system: 'NAICS', code: '922', title: 'Justice, Public Order, and Safety Activities', level: 3 },
  { system: 'NAICS', code: '923', title: 'Administration of Human Resource Programs', level: 3 },
  { system: 'NAICS', code: '924', title: 'Administration of Environmental Quality Programs', level: 3 },
  { system: 'NAICS', code: '925', title: 'Administration of Housing Programs, Urban Planning, and Community Development', level: 3 },
  { system: 'NAICS', code: '926', title: 'Administration of Economic Programs', level: 3 },
  { system: 'NAICS', code: '928', title: 'National Security and International Affairs', level: 3 },
];

export const naicsIndustryGroups: IndustryCode[] = [
  // Key industry groups (level 4)
  { system: 'NAICS', code: '1111', title: 'Oilseed and Grain Farming', level: 4 },
  { system: 'NAICS', code: '1112', title: 'Vegetable and Melon Farming', level: 4 },
  { system: 'NAICS', code: '1113', title: 'Fruit and Tree Nut Farming', level: 4 },
  { system: 'NAICS', code: '2111', title: 'Oil and Gas Extraction', level: 4 },
  { system: 'NAICS', code: '2211', title: 'Electric Power Generation, Transmission and Distribution', level: 4 },
  { system: 'NAICS', code: '2212', title: 'Natural Gas Distribution', level: 4 },
  { system: 'NAICS', code: '2361', title: 'Residential Building Construction', level: 4 },
  { system: 'NAICS', code: '2362', title: 'Nonresidential Building Construction', level: 4 },
  { system: 'NAICS', code: '3111', title: 'Animal Food Manufacturing', level: 4 },
  { system: 'NAICS', code: '3114', title: 'Fruit and Vegetable Preserving and Specialty Food Manufacturing', level: 4 },
  { system: 'NAICS', code: '3116', title: 'Animal Slaughtering and Processing', level: 4 },
  { system: 'NAICS', code: '3241', title: 'Petroleum and Coal Products Manufacturing', level: 4 },
  { system: 'NAICS', code: '3251', title: 'Basic Chemical Manufacturing', level: 4 },
  { system: 'NAICS', code: '3254', title: 'Pharmaceutical and Medicine Manufacturing', level: 4 },
  { system: 'NAICS', code: '3341', title: 'Computer and Peripheral Equipment Manufacturing', level: 4 },
  { system: 'NAICS', code: '3342', title: 'Communications Equipment Manufacturing', level: 4 },
  { system: 'NAICS', code: '3344', title: 'Semiconductor and Other Electronic Component Manufacturing', level: 4 },
  { system: 'NAICS', code: '3345', title: 'Navigational, Measuring, Electromedical, and Control Instruments', level: 4 },
  { system: 'NAICS', code: '3361', title: 'Motor Vehicle Manufacturing', level: 4 },
  { system: 'NAICS', code: '3364', title: 'Aerospace Product and Parts Manufacturing', level: 4 },
  { system: 'NAICS', code: '4231', title: 'Motor Vehicle and Motor Vehicle Parts and Supplies Merchant Wholesalers', level: 4 },
  { system: 'NAICS', code: '4234', title: 'Professional and Commercial Equipment Merchant Wholesalers', level: 4 },
  { system: 'NAICS', code: '4411', title: 'Automobile Dealers', level: 4 },
  { system: 'NAICS', code: '4451', title: 'Grocery and Convenience Retailers', level: 4 },
  { system: 'NAICS', code: '4551', title: 'General Merchandise Retailers, including Warehouse Clubs', level: 4 },
  { system: 'NAICS', code: '4811', title: 'Scheduled Air Transportation', level: 4 },
  { system: 'NAICS', code: '4841', title: 'General Freight Trucking', level: 4 },
  { system: 'NAICS', code: '4842', title: 'Specialized Freight Trucking', level: 4 },
  { system: 'NAICS', code: '4931', title: 'Warehousing and Storage', level: 4 },
  { system: 'NAICS', code: '5111', title: 'Newspaper, Periodical, Book, and Directory Publishers', level: 4 },
  { system: 'NAICS', code: '5112', title: 'Software Publishers', level: 4 },
  { system: 'NAICS', code: '5171', title: 'Wired and Wireless Telecommunications Carriers', level: 4 },
  { system: 'NAICS', code: '5182', title: 'Computing Infrastructure Providers, Data Processing, and Related Services', level: 4 },
  { system: 'NAICS', code: '5191', title: 'Web Search Portals and All Other Information Services', level: 4 },
  { system: 'NAICS', code: '5221', title: 'Depository Credit Intermediation', level: 4 },
  { system: 'NAICS', code: '5231', title: 'Securities and Commodity Contracts Intermediation and Brokerage', level: 4 },
  { system: 'NAICS', code: '5241', title: 'Insurance Carriers', level: 4 },
  { system: 'NAICS', code: '5242', title: 'Agencies, Brokerages, and Other Insurance Related Activities', level: 4 },
  { system: 'NAICS', code: '5311', title: 'Lessors of Real Estate', level: 4 },
  { system: 'NAICS', code: '5312', title: 'Offices of Real Estate Agents and Brokers', level: 4 },
  { system: 'NAICS', code: '5411', title: 'Legal Services', level: 4 },
  { system: 'NAICS', code: '5412', title: 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services', level: 4 },
  { system: 'NAICS', code: '5413', title: 'Architectural, Engineering, and Related Services', level: 4 },
  { system: 'NAICS', code: '5415', title: 'Computer Systems Design and Related Services', level: 4 },
  { system: 'NAICS', code: '5416', title: 'Management, Scientific, and Technical Consulting Services', level: 4 },
  { system: 'NAICS', code: '5417', title: 'Scientific Research and Development Services', level: 4 },
  { system: 'NAICS', code: '5511', title: 'Management of Companies and Enterprises', level: 4 },
  { system: 'NAICS', code: '5611', title: 'Office Administrative Services', level: 4 },
  { system: 'NAICS', code: '5613', title: 'Employment Services', level: 4 },
  { system: 'NAICS', code: '5614', title: 'Business Support Services', level: 4 },
  { system: 'NAICS', code: '5615', title: 'Travel Arrangement and Reservation Services', level: 4 },
  { system: 'NAICS', code: '5616', title: 'Investigation and Security Services', level: 4 },
  { system: 'NAICS', code: '6111', title: 'Elementary and Secondary Schools', level: 4 },
  { system: 'NAICS', code: '6113', title: 'Colleges, Universities, and Professional Schools', level: 4 },
  { system: 'NAICS', code: '6211', title: 'Offices of Physicians', level: 4 },
  { system: 'NAICS', code: '6214', title: 'Outpatient Care Centers', level: 4 },
  { system: 'NAICS', code: '6221', title: 'General Medical and Surgical Hospitals', level: 4 },
  { system: 'NAICS', code: '6231', title: 'Nursing Care Facilities (Skilled Nursing Facilities)', level: 4 },
  { system: 'NAICS', code: '6241', title: 'Individual and Family Services', level: 4 },
  { system: 'NAICS', code: '6244', title: 'Child Day Care Services', level: 4 },
  { system: 'NAICS', code: '7211', title: 'Traveler Accommodation', level: 4 },
  { system: 'NAICS', code: '7225', title: 'Restaurants and Other Eating Places', level: 4 },
  { system: 'NAICS', code: '8111', title: 'Automotive Repair and Maintenance', level: 4 },
  { system: 'NAICS', code: '8121', title: 'Personal Care Services', level: 4 },
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
  ...naicsSubsectors,
  ...naicsIndustryGroups,
  ...sicCodes,
];

/**
 * NOTE: IndustryCode is not a dedicated Prisma model.
 * Codes are stored in SystemSetting under the `industry_codes` group.
 */
export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding industry codes...');

  for (const code of industryCodes) {
    const settingKey = `industry_code.${code.system}_${code.code}`;
    await prisma.systemSetting.upsert({
      where: { key: settingKey },
      update: { value: JSON.stringify(code) },
      create: {
        key: settingKey,
        value: JSON.stringify(code),
        group: 'industry_codes',
        description: `${code.system} code ${code.code}: ${code.title}`,
      },
    });
  }

  console.log(`Seeded ${industryCodes.length} industry codes.`);
}
