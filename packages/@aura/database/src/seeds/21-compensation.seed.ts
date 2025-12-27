import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function compensationSeed(tenantId: string) {
  console.log('  📊 Seeding Compensation data...');

  // 1. Create Salary Components
  console.log('    Creating salary components...');

  const basicComponent = await prisma.salaryComponent.create({
    data: {
      tenantId,
      componentCode: 'BASIC',
      componentName: 'Basic Salary',
      type: 'EARNING',
      calculationType: 'FIXED',
      isStatutory: false,
      isTaxable: true,
      isPartOfCTC: true,
      isPartOfGross: true,
      isPartOfBasic: true,
      displayOrder: 1,
      isActive: true,
      description: 'Basic salary component',
      glCode: 'SAL-001',
    },
  });

  const hraComponent = await prisma.salaryComponent.create({
    data: {
      tenantId,
      componentCode: 'HRA',
      componentName: 'House Rent Allowance',
      type: 'EARNING',
      calculationType: 'PERCENTAGE_OF_BASIC',
      defaultValue: 40,
      isStatutory: false,
      isTaxable: true,
      isPartOfCTC: true,
      isPartOfGross: true,
      isPartOfBasic: false,
      displayOrder: 2,
      isActive: true,
      description: '40% of basic salary',
      glCode: 'SAL-002',
    },
  });

  const daComponent = await prisma.salaryComponent.create({
    data: {
      tenantId,
      componentCode: 'DA',
      componentName: 'Dearness Allowance',
      type: 'EARNING',
      calculationType: 'PERCENTAGE_OF_BASIC',
      defaultValue: 20,
      isStatutory: false,
      isTaxable: true,
      isPartOfCTC: true,
      isPartOfGross: true,
      displayOrder: 3,
      isActive: true,
      description: '20% of basic salary',
      glCode: 'SAL-003',
    },
  });

  const pfDeduction = await prisma.salaryComponent.create({
    data: {
      tenantId,
      componentCode: 'PF',
      componentName: 'Provident Fund',
      type: 'DEDUCTION',
      calculationType: 'PERCENTAGE_OF_BASIC',
      defaultValue: 12,
      isStatutory: true,
      isTaxable: false,
      isPartOfCTC: true,
      isPartOfGross: false,
      displayOrder: 1,
      isActive: true,
      description: '12% of basic salary',
      glCode: 'DED-001',
    },
  });

  // 2. Create Compensation Grades
  console.log('    Creating compensation grades...');

  const gradeL1 = await prisma.compensationGrade.create({
    data: {
      tenantId,
      gradeCode: 'L1',
      gradeName: 'Entry Level',
      gradeType: 'ENTRY_LEVEL',
      level: 1,
      description: 'Entry level positions for fresh graduates',
      competencies: ['Basic technical skills', 'Communication', 'Teamwork'],
      responsibilities: ['Execute assigned tasks', 'Learn and grow', 'Follow processes'],
      minimumExperience: 0,
      educationRequired: "Bachelor's degree",
      reportingLevel: 1,
      isActive: true,
    },
  });

  const gradeL2 = await prisma.compensationGrade.create({
    data: {
      tenantId,
      gradeCode: 'L2',
      gradeName: 'Professional',
      gradeType: 'PROFESSIONAL',
      level: 2,
      description: 'Professional level with 2-5 years experience',
      competencies: ['Advanced technical skills', 'Problem solving', 'Mentoring'],
      responsibilities: ['Independent execution', 'Guide juniors', 'Contribute to planning'],
      minimumExperience: 2,
      educationRequired: "Bachelor's degree",
      reportingLevel: 2,
      isActive: true,
    },
  });

  const gradeL3 = await prisma.compensationGrade.create({
    data: {
      tenantId,
      gradeCode: 'L3',
      gradeName: 'Senior Professional',
      gradeType: 'MANAGEMENT',
      level: 3,
      description: 'Senior level with management responsibilities',
      competencies: ['Expert technical skills', 'Leadership', 'Strategic thinking'],
      responsibilities: ['Lead projects', 'Manage teams', 'Strategic planning'],
      minimumExperience: 5,
      educationRequired: "Bachelor's or Master's degree",
      reportingLevel: 3,
      isActive: true,
    },
  });

  // 3. Create Salary Bands
  console.log('    Creating salary bands...');

  await prisma.salaryBand.create({
    data: {
      tenantId,
      gradeId: gradeL1.id,
      bandName: 'L1 - USD',
      currency: 'USD',
      minSalary: 40000,
      midSalary: 50000,
      maxSalary: 60000,
      spreadPercentage: 50,
      market25thPercentile: 45000,
      market50thPercentile: 50000,
      market75thPercentile: 55000,
      effectiveFrom: new Date('2024-01-01'),
    },
  });

  await prisma.salaryBand.create({
    data: {
      tenantId,
      gradeId: gradeL2.id,
      bandName: 'L2 - USD',
      currency: 'USD',
      minSalary: 60000,
      midSalary: 80000,
      maxSalary: 100000,
      spreadPercentage: 66.67,
      market25thPercentile: 70000,
      market50thPercentile: 80000,
      market75thPercentile: 90000,
      effectiveFrom: new Date('2024-01-01'),
    },
  });

  await prisma.salaryBand.create({
    data: {
      tenantId,
      gradeId: gradeL3.id,
      bandName: 'L3 - USD',
      currency: 'USD',
      minSalary: 100000,
      midSalary: 130000,
      maxSalary: 160000,
      spreadPercentage: 60,
      market25thPercentile: 115000,
      market50thPercentile: 130000,
      market75thPercentile: 145000,
      effectiveFrom: new Date('2024-01-01'),
    },
  });

  // 4. Create Salary Structures
  console.log('    Creating salary structures...');

  const structureL1 = await prisma.salaryStructure.create({
    data: {
      tenantId,
      structureCode: 'STR-L1-001',
      structureName: 'Entry Level Structure',
      description: 'Standard salary structure for L1 grade',
      gradeId: gradeL1.id,
      gradeName: gradeL1.gradeName,
      effectiveFrom: new Date('2024-01-01'),
      currency: 'USD',
      payFrequency: 'MONTHLY',
      components: [
        {
          componentId: basicComponent.id,
          componentCode: basicComponent.componentCode,
          componentName: basicComponent.componentName,
          type: basicComponent.type,
          calculationType: basicComponent.calculationType,
          value: 30000,
          isMandatory: true,
          displayOrder: 1,
        },
        {
          componentId: hraComponent.id,
          componentCode: hraComponent.componentCode,
          componentName: hraComponent.componentName,
          type: hraComponent.type,
          calculationType: hraComponent.calculationType,
          percentage: 40,
          isMandatory: true,
          displayOrder: 2,
        },
        {
          componentId: daComponent.id,
          componentCode: daComponent.componentCode,
          componentName: daComponent.componentName,
          type: daComponent.type,
          calculationType: daComponent.calculationType,
          percentage: 20,
          isMandatory: true,
          displayOrder: 3,
        },
      ],
      isTemplate: true,
      isActive: true,
      createdBy: 'system',
    },
  });

  const structureL2 = await prisma.salaryStructure.create({
    data: {
      tenantId,
      structureCode: 'STR-L2-001',
      structureName: 'Professional Level Structure',
      description: 'Standard salary structure for L2 grade',
      gradeId: gradeL2.id,
      gradeName: gradeL2.gradeName,
      effectiveFrom: new Date('2024-01-01'),
      currency: 'USD',
      payFrequency: 'MONTHLY',
      components: [
        {
          componentId: basicComponent.id,
          componentCode: basicComponent.componentCode,
          componentName: basicComponent.componentName,
          type: basicComponent.type,
          calculationType: basicComponent.calculationType,
          value: 50000,
          isMandatory: true,
          displayOrder: 1,
        },
        {
          componentId: hraComponent.id,
          componentCode: hraComponent.componentCode,
          componentName: hraComponent.componentName,
          type: hraComponent.type,
          calculationType: hraComponent.calculationType,
          percentage: 40,
          isMandatory: true,
          displayOrder: 2,
        },
        {
          componentId: daComponent.id,
          componentCode: daComponent.componentCode,
          componentName: daComponent.componentName,
          type: daComponent.type,
          calculationType: daComponent.calculationType,
          percentage: 20,
          isMandatory: true,
          displayOrder: 3,
        },
      ],
      isTemplate: true,
      isActive: true,
      createdBy: 'system',
    },
  });

  // 5. Create Sample Employee Compensation Records
  console.log('    Creating employee compensation records...');

  await prisma.employeeCompensation.create({
    data: {
      tenantId,
      employeeId: 'emp-001',
      employeeName: 'John Doe',
      employeeCode: 'EMP001',
      departmentId: 'dept-001',
      departmentName: 'Engineering',
      positionId: 'pos-001',
      positionTitle: 'Software Engineer',
      gradeId: gradeL1.id,
      gradeName: gradeL1.gradeName,
      structureId: structureL1.id,
      structureName: structureL1.structureName,
      effectiveFrom: new Date('2024-01-01'),
      currency: 'USD',
      payFrequency: 'MONTHLY',
      annualCTC: 48000,
      monthlyCTC: 4000,
      annualGross: 45600,
      monthlyGross: 3800,
      annualBasic: 30000,
      monthlyBasic: 2500,
      components: [
        {
          componentId: basicComponent.id,
          componentCode: basicComponent.componentCode,
          componentName: basicComponent.componentName,
          type: basicComponent.type,
          calculationType: basicComponent.calculationType,
          annualAmount: 30000,
          monthlyAmount: 2500,
          isVariable: false,
          isTaxable: true,
        },
        {
          componentId: hraComponent.id,
          componentCode: hraComponent.componentCode,
          componentName: hraComponent.componentName,
          type: hraComponent.type,
          calculationType: hraComponent.calculationType,
          annualAmount: 12000,
          monthlyAmount: 1000,
          percentage: 40,
          isVariable: false,
          isTaxable: true,
        },
        {
          componentId: daComponent.id,
          componentCode: daComponent.componentCode,
          componentName: daComponent.componentName,
          type: daComponent.type,
          calculationType: daComponent.calculationType,
          annualAmount: 6000,
          monthlyAmount: 500,
          percentage: 20,
          isVariable: false,
          isTaxable: true,
        },
      ],
      nextReviewDate: new Date('2025-01-01'),
      isActive: true,
      notes: 'Initial compensation for new hire',
    },
  });

  await prisma.employeeCompensation.create({
    data: {
      tenantId,
      employeeId: 'emp-002',
      employeeName: 'Jane Smith',
      employeeCode: 'EMP002',
      departmentId: 'dept-001',
      departmentName: 'Engineering',
      positionId: 'pos-002',
      positionTitle: 'Senior Software Engineer',
      gradeId: gradeL2.id,
      gradeName: gradeL2.gradeName,
      structureId: structureL2.id,
      structureName: structureL2.structureName,
      effectiveFrom: new Date('2024-01-01'),
      currency: 'USD',
      payFrequency: 'MONTHLY',
      annualCTC: 80000,
      monthlyCTC: 6667,
      annualGross: 76000,
      monthlyGross: 6333,
      annualBasic: 50000,
      monthlyBasic: 4167,
      components: [
        {
          componentId: basicComponent.id,
          componentCode: basicComponent.componentCode,
          componentName: basicComponent.componentName,
          type: basicComponent.type,
          calculationType: basicComponent.calculationType,
          annualAmount: 50000,
          monthlyAmount: 4167,
          isVariable: false,
          isTaxable: true,
        },
        {
          componentId: hraComponent.id,
          componentCode: hraComponent.componentCode,
          componentName: hraComponent.componentName,
          type: hraComponent.type,
          calculationType: hraComponent.calculationType,
          annualAmount: 20000,
          monthlyAmount: 1667,
          percentage: 40,
          isVariable: false,
          isTaxable: true,
        },
        {
          componentId: daComponent.id,
          componentCode: daComponent.componentCode,
          componentName: daComponent.componentName,
          type: daComponent.type,
          calculationType: daComponent.calculationType,
          annualAmount: 10000,
          monthlyAmount: 833,
          percentage: 20,
          isVariable: false,
          isTaxable: true,
        },
      ],
      lastRevisionDate: new Date('2024-01-01'),
      nextReviewDate: new Date('2025-01-01'),
      isActive: true,
      notes: 'Promoted to Senior Engineer',
    },
  });

  // 6. Create Market Benchmarks
  console.log('    Creating market benchmarks...');

  await prisma.marketBenchmark.create({
    data: {
      tenantId,
      benchmarkCode: 'SWE-US-2024',
      jobTitle: 'Software Engineer',
      jobFamily: 'Engineering',
      jobLevel: 'Entry Level',
      geography: 'United States',
      industry: 'Technology',
      source: 'MARKET_SURVEY',
      sourceName: 'Tech Salary Survey 2024',
      surveyDate: new Date('2024-01-01'),
      currency: 'USD',
      sampleSize: 500,
      percentile10: 40000,
      percentile25: 45000,
      percentile50: 50000,
      percentile75: 55000,
      percentile90: 60000,
      average: 50500,
      standardDeviation: 5000,
      effectiveFrom: new Date('2024-01-01'),
      notes: 'Market data for entry-level software engineers',
    },
  });

  console.log('  ✅ Compensation seed data created successfully!');
}
