
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Regional Filtering...');

    // 1. Check System Setting
    // @ts-ignore
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'ACTIVE_REGIONS' }
    });
    console.log('ACTIVE_REGIONS:', setting ? setting.value : 'Not Set');

    if (!setting) {
        console.error('ACTIVE_REGIONS setting not found!');
        return;
    }

    const activeRegions = setting.value.split(',');

    // 2. Check Banks
    // @ts-ignore
    const totalBanks = await prisma.bank.count();
    console.log('Total Banks in DB:', totalBanks);

    // @ts-ignore
    const filteredBanks = await prisma.bank.findMany({
        where: {
            countryCode: { in: activeRegions }
        }
    });

    console.log('Banks matching Active Regions:', filteredBanks.length);
    // @ts-ignore
    filteredBanks.forEach((b) => console.log(`- ${b.name} (${b.countryCode})`));

    // 3. Check Tax Regimes
    // @ts-ignore
    const taxRegimes = await prisma.taxRegime.findMany({
        where: {
            country: { in: activeRegions }
        }
    });
    console.log('Tax Regimes matching Active Regions:', taxRegimes.length);
    // @ts-ignore
    taxRegimes.forEach((t) => console.log(`- ${t.name} (${t.country})`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
