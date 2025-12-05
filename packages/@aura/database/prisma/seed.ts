import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// RE-WRITING MAIN TO BE SAFE
async function main() {
    console.log('🌱 Starting Master Data Seeding...');

    // 1. TENANT
    const tenant = await prisma.tenant.upsert({
        where: { code: 'KREUP_AI' },
        update: {},
        create: { code: 'KREUP_AI', name: 'KreupAI Technologies' },
    });
    console.log(`✅ Tenant: ${tenant.name}`);

    // 2. COUNTRIES
    const countries = [
        { isoCode: 'US', name: 'United States', currency: 'USD' },
        { isoCode: 'IN', name: 'India', currency: 'INR' },
        { isoCode: 'GB', name: 'United Kingdom', currency: 'GBP' },
        { isoCode: 'AE', name: 'United Arab Emirates', currency: 'AED' },
        { isoCode: 'SG', name: 'Singapore', currency: 'SGD' },
        { isoCode: 'DE', name: 'Germany', currency: 'EUR' },
        { isoCode: 'JP', name: 'Japan', currency: 'JPY' },
        { isoCode: 'AU', name: 'Australia', currency: 'AUD' },
    ];

    for (const c of countries) {
        await prisma.country.upsert({
            where: { isoCode: c.isoCode },
            update: {},
            create: c,
        });
    }
    console.log(`✅ Countries: ${countries.length} seeded`);

    // 3. GRADES (Independent)
    const grades = [
        { code: 'L1', name: 'Intern', level: 1 },
        { code: 'L2', name: 'Junior', level: 2 },
        { code: 'L3', name: 'Associate', level: 3 },
        { code: 'L4', name: 'Senior', level: 4 },
        { code: 'L5', name: 'Lead', level: 5 },
        { code: 'L6', name: 'Principal', level: 6 },
        { code: 'L7', name: 'Staff', level: 7 },
        { code: 'L8', name: 'Director', level: 8 },
        { code: 'L9', name: 'VP', level: 9 },
        { code: 'L10', name: 'CXO', level: 10 },
    ];

    // Note: Grade code might not be unique in schema. I should check.
    // If not unique, I'll findFirst.
    for (const g of grades) {
        const existing = await prisma.grade.findFirst({ where: { code: g.code } });
        if (!existing) {
            await prisma.grade.create({ data: g });
        }
    }
    console.log(`✅ Grades: ${grades.length} seeded`);

    // 4. JOB FUNCTIONS (Independent)
    const jobFunctions = [
        { code: 'ENG', name: 'Engineering' },
        { code: 'PROD', name: 'Product' },
        { code: 'DESIGN', name: 'Design' },
        { code: 'HR', name: 'Human Resources' },
        { code: 'SALES', name: 'Sales' },
        { code: 'MKT', name: 'Marketing' },
        { code: 'FIN', name: 'Finance' },
        { code: 'OPS', name: 'Operations' },
        { code: 'LEG', name: 'Legal' },
        { code: 'IT', name: 'Information Technology' },
    ];

    for (const jf of jobFunctions) {
        const existing = await prisma.jobFunction.findFirst({ where: { code: jf.code } });
        if (!existing) {
            await prisma.jobFunction.create({ data: jf });
        }
    }
    console.log(`✅ Job Functions: ${jobFunctions.length} seeded`);

    // 5. EMPLOYMENT TYPES
    const employmentTypes = [
        { code: 'FULL_TIME', name: 'Full Time' },
        { code: 'PART_TIME', name: 'Part Time' },
        { code: 'CONTRACTOR', name: 'Contractor' },
        { code: 'INTERN', name: 'Intern' },
        { code: 'CONSULTANT', name: 'Consultant' },
    ];

    for (const et of employmentTypes) {
        const existing = await prisma.employmentType.findUnique({ where: { code: et.code } });
        if (!existing) {
            await prisma.employmentType.create({ data: et });
        }
    }
    console.log(`✅ Employment Types: ${employmentTypes.length} seeded`);

    // 6. EMPLOYEE STATUSES
    const employeeStatuses = [
        { code: 'ACTIVE', name: 'Active' },
        { code: 'PROBATION', name: 'Probation' },
        { code: 'NOTICE_PERIOD', name: 'Notice Period' },
        { code: 'TERMINATED', name: 'Terminated' },
        { code: 'RESIGNED', name: 'Resigned' },
        { code: 'RETIRED', name: 'Retired' },
        { code: 'ON_LEAVE', name: 'On Leave' },
    ];

    for (const es of employeeStatuses) {
        const existing = await prisma.employeeStatus.findUnique({ where: { code: es.code } });
        if (!existing) {
            await prisma.employeeStatus.create({ data: es });
        }
    }
    console.log(`✅ Employee Statuses: ${employeeStatuses.length} seeded`);

    // 7. ADDRESSES (For Locations)
    // Need to find IDs for City, State, Country first.
    // Assuming US, NY, New York exist from previous steps or manual entry if not seeded fully.
    // For simplicity in this seed script, we'll try to find US -> NY -> New York.
    const us = await prisma.country.findUnique({ where: { isoCode: 'US' } });
    if (us) {
        // Create State NY if not exists (since we didn't seed states above)
        const ny = await prisma.state.upsert({
            where: { id: 'seed-state-ny' }, // Using fixed ID for seed stability
            update: {},
            create: {
                id: 'seed-state-ny',
                countryId: us.id,
                code: 'NY',
                name: 'New York'
            }
        });

        // Create City New York
        const nyc = await prisma.city.upsert({
            where: { id: 'seed-city-nyc' },
            update: {},
            create: {
                id: 'seed-city-nyc',
                stateId: ny.id,
                name: 'New York City'
            }
        });

        const addresses = [
            {
                line1: '123 Wall Street',
                postalCode: '10005',
                cityId: nyc.id,
                stateId: ny.id,
                countryId: us.id
            },
            {
                line1: '350 Fifth Avenue',
                postalCode: '10118',
                cityId: nyc.id,
                stateId: ny.id,
                countryId: us.id
            }
        ];

        for (const addr of addresses) {
            // Check existence by line1 to avoid dupes
            const existing = await prisma.address.findFirst({ where: { line1: addr.line1 } });
            if (!existing) {
                await prisma.address.create({ data: addr });
            }
        }
        console.log(`✅ Addresses: ${addresses.length} seeded`);
    }

    console.log('🏁 Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
