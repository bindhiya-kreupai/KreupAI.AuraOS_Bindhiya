/**
 * @seed Asset Categories
 * @description Seed data for asset categories with depreciation rates
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const assetCategories = [
  {
    code: 'COMPUTER',
    name: 'Computer Equipment',
    description: 'Desktop computers, laptops, servers, and workstations',
    depreciationRate: 33.33, // 3-year straight-line depreciation
    status: 'Active',
  },
  {
    code: 'FURNITURE',
    name: 'Office Furniture',
    description: 'Desks, chairs, cabinets, and other office furniture',
    depreciationRate: 10.0, // 10-year straight-line depreciation
    status: 'Active',
  },
  {
    code: 'VEHICLE',
    name: 'Vehicles',
    description: 'Company cars, trucks, and other transportation vehicles',
    depreciationRate: 20.0, // 5-year straight-line depreciation
    status: 'Active',
  },
  {
    code: 'MOBILE',
    name: 'Mobile Devices',
    description: 'Smartphones, tablets, and mobile accessories',
    depreciationRate: 25.0, // 4-year straight-line depreciation
    status: 'Active',
  },
  {
    code: 'EQUIPMENT',
    name: 'Equipment & Machinery',
    description: 'Specialized equipment, tools, and machinery',
    depreciationRate: 15.0, // 6.67-year straight-line depreciation
    status: 'Active',
  },
  {
    code: 'OTHER',
    name: 'Other Assets',
    description: 'Miscellaneous assets not categorized elsewhere',
    depreciationRate: 20.0, // 5-year straight-line depreciation
    status: 'Active',
  },
];

export async function seedAssetCategories() {
  console.log('🌱 Seeding Asset Categories...');

  for (const category of assetCategories) {
    await prisma.assetCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Seeded ${assetCategories.length} asset categories`);
}

// Run if executed directly
if (require.main === module) {
  seedAssetCategories()
    .catch((e) => {
      console.error('❌ Error seeding asset categories:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
