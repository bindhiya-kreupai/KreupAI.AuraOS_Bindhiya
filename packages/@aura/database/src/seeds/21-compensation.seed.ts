/**
 * Compensation Seed
 *
 * Schema alignment fixes:
 *  - compensationGrade    → CompensationBand (closest match; gradeCode maps to bandName)
 *  - salaryBand           → CompensationBand (merged into same model)
 *  - salaryStructure      → not directly representable; stored as metadata on CompensationBand
 *  - employeeCompensation → EmployeeSalaryStructure
 *  - marketBenchmark      → no matching model; seeded as SystemSetting JSON blob instead
 *
 *  SalaryComponent field renames (schema model has different field names):
 *    type              → componentType
 *    calculationType   → calculationType (kept)
 *    isStatutory       → isStatutory (kept)
 *    isTaxable         → isTaxable (kept)
 *    isPartOfCTC/Gross/Basic → removed (not in schema)
 *    displayOrder      → removed (not in schema)
 *    glCode            → removed (not in schema)
 *    defaultValue      → percentage (for percentage-based) or amount (for fixed)
 *
 *  EmployeeSalaryStructure field mapping:
 *    annualBasic       → basicSalary (monthly stored as basicSalary, annual computed)
 *    annualGross/gross → grossSalary (stored as gross per pay frequency)
 *    annualCTC         → ctc
 *    hraComponent      → houseRentAllowance
 *    daComponent       → otherAllowances (Json)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function compensationSeed(tenantId: string) {
    console.log('  Seeding Compensation data...');

    // -----------------------------------------------------------------------
    // 1. Salary Components  →  SalaryComponent
    //    Field renames: type → componentType; others as noted above
    // -----------------------------------------------------------------------
    console.log('    Creating salary components...');

    const basicComponent = await prisma.salaryComponent.upsert({
        where: { tenantId_componentCode: { tenantId, componentCode: 'BASIC' } },
        update: {},
        create: {
            tenantId,
            componentCode: 'BASIC',
            componentName: 'Basic Salary',
            componentType: 'earning',               // was `type: 'EARNING'`
            calculationType: 'fixed',               // was 'FIXED'
            isStatutory: false,
            isTaxable: true,
            isActive: true,
            description: 'Basic salary component',
        },
    });

    const hraComponent = await prisma.salaryComponent.upsert({
        where: { tenantId_componentCode: { tenantId, componentCode: 'HRA' } },
        update: {},
        create: {
            tenantId,
            componentCode: 'HRA',
            componentName: 'House Rent Allowance',
            componentType: 'earning',
            calculationType: 'percentage',          // was 'PERCENTAGE_OF_BASIC'
            percentage: 40,                         // was `defaultValue`
            isStatutory: false,
            isTaxable: true,
            isActive: true,
            description: '40% of basic salary',
        },
    });

    const daComponent = await prisma.salaryComponent.upsert({
        where: { tenantId_componentCode: { tenantId, componentCode: 'DA' } },
        update: {},
        create: {
            tenantId,
            componentCode: 'DA',
            componentName: 'Dearness Allowance',
            componentType: 'earning',
            calculationType: 'percentage',
            percentage: 20,
            isStatutory: false,
            isTaxable: true,
            isActive: true,
            description: '20% of basic salary',
        },
    });

    await prisma.salaryComponent.upsert({
        where: { tenantId_componentCode: { tenantId, componentCode: 'PF' } },
        update: {},
        create: {
            tenantId,
            componentCode: 'PF',
            componentName: 'Provident Fund',
            componentType: 'deduction',             // was 'DEDUCTION'
            calculationType: 'percentage',
            percentage: 12,
            isStatutory: true,
            isTaxable: false,
            isActive: true,
            description: '12% of basic salary',
        },
    });

    // -----------------------------------------------------------------------
    // 2. Compensation Bands  →  CompensationBand
    //    Replaces both compensationGrade and salaryBand (they are merged here).
    // -----------------------------------------------------------------------
    console.log('    Creating compensation bands...');

    const bandL1 = await prisma.compensationBand.create({
        data: {
            tenantId,
            bandName: 'L1 – Entry Level (USD)',
            minSalary: 40000,
            midSalary: 50000,
            maxSalary: 60000,
            currency: 'USD',
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
        },
    });

    const bandL2 = await prisma.compensationBand.create({
        data: {
            tenantId,
            bandName: 'L2 – Professional (USD)',
            minSalary: 60000,
            midSalary: 80000,
            maxSalary: 100000,
            currency: 'USD',
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
        },
    });

    await prisma.compensationBand.create({
        data: {
            tenantId,
            bandName: 'L3 – Senior Professional (USD)',
            minSalary: 100000,
            midSalary: 130000,
            maxSalary: 160000,
            currency: 'USD',
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
        },
    });

    // -----------------------------------------------------------------------
    // 3. Employee Salary Structures  →  EmployeeSalaryStructure
    //    Maps from the old employeeCompensation model.
    //    basicSalary = annual basic / 12; grossSalary = annual gross / 12; ctc = annual ctc / 12
    // -----------------------------------------------------------------------
    console.log('    Creating employee salary structures...');

    await prisma.employeeSalaryStructure.create({
        data: {
            tenantId,
            employeeId: 'emp-001',
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
            basicSalary: 2500,                      // monthly basic (30000/12)
            houseRentAllowance: 1000,               // monthly HRA (12000/12)
            transportAllowance: 0,
            otherAllowances: [
                {
                    code: daComponent.componentCode,
                    name: daComponent.componentName,
                    amount: 500,                    // monthly DA (6000/12)
                },
            ],
            grossSalary: 3800,                      // monthly gross (45600/12)
            ctc: 4000,                              // monthly ctc (48000/12)
            payFrequency: 'MONTHLY',
            medicalInsurance: 0,
            lifeInsurance: 0,
            remarks: 'Initial compensation for new hire. Band: ' + bandL1.bandName,
            createdBy: 'system',
        },
    });

    await prisma.employeeSalaryStructure.create({
        data: {
            tenantId,
            employeeId: 'emp-002',
            effectiveFrom: new Date('2024-01-01'),
            isActive: true,
            basicSalary: 4167,                      // monthly basic (50000/12)
            houseRentAllowance: 1667,               // monthly HRA (20000/12)
            transportAllowance: 0,
            otherAllowances: [
                {
                    code: daComponent.componentCode,
                    name: daComponent.componentName,
                    amount: 833,                    // monthly DA (10000/12)
                },
            ],
            grossSalary: 6333,                      // monthly gross (76000/12)
            ctc: 6667,                              // monthly ctc (80000/12)
            payFrequency: 'MONTHLY',
            medicalInsurance: 0,
            lifeInsurance: 0,
            remarks: 'Promoted to Senior Engineer. Band: ' + bandL2.bandName,
            createdBy: 'system',
        },
    });

    // -----------------------------------------------------------------------
    // 4. Market Benchmarks  →  SystemSetting (no MarketBenchmark model in schema)
    //    Stored as a JSON system setting for later migration when the model lands.
    // -----------------------------------------------------------------------
    console.log('    Storing market benchmark as system setting...');

    await prisma.systemSetting.upsert({
        where: { key: 'market_benchmark.SWE-US-2024' },
        update: {},
        create: {
            key: 'market_benchmark.SWE-US-2024',
            value: JSON.stringify({
                benchmarkCode: 'SWE-US-2024',
                jobTitle: 'Software Engineer',
                jobFamily: 'Engineering',
                jobLevel: 'Entry Level',
                geography: 'United States',
                industry: 'Technology',
                source: 'MARKET_SURVEY',
                sourceName: 'Tech Salary Survey 2024',
                surveyDate: '2024-01-01',
                currency: 'USD',
                sampleSize: 500,
                percentile10: 40000,
                percentile25: 45000,
                percentile50: 50000,
                percentile75: 55000,
                percentile90: 60000,
                average: 50500,
                standardDeviation: 5000,
                effectiveFrom: '2024-01-01',
            }),
            group: 'market_benchmarks',
            description: 'Market salary benchmark data (temporary storage until MarketBenchmark model is added)',
        },
    });

    console.log('  Compensation seed data created successfully!');
}
