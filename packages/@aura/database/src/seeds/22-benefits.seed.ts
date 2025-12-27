import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function benefitsSeed(tenantId: string) {
  console.log('  💊 Seeding Benefits data...');

  // Create Benefit Plans
  console.log('    - Creating benefit plans...');

  const healthPlan = await prisma.benefitPlan.create({
    data: {
      tenantId,
      planCode: 'HEALTH-PPO-2024',
      planName: 'Comprehensive PPO Health Plan',
      category: 'HEALTH_INSURANCE',
      planTier: 'PREMIUM',
      carrierName: 'Blue Cross Blue Shield',
      carrierPolicyNumber: 'BCBS-2024-CORP-001',
      description: 'Comprehensive PPO health insurance with nationwide network coverage',
      coverage: {
        inNetwork: {
          preventiveCare: '100% covered',
          primaryCare: '$20 copay',
          specialist: '$40 copay',
          emergency: '$100 copay',
          hospitalStay: '$500 deductible then 20% coinsurance',
        },
        outOfNetwork: {
          deductible: '$2000 individual',
          coinsurance: '40% after deductible',
        },
      },
      exclusions: ['Cosmetic surgery', 'Experimental treatments'],
      eligibilityCriteria: {
        minHours: 30,
        waitingPeriod: 30,
        eligibleEmployeeTypes: ['Full-time', 'Part-time'],
      },
      employeePremium: 150,
      employerPremium: 450,
      spousePremium: 200,
      childPremium: 100,
      familyPremium: 400,
      deductible: 1000,
      outOfPocketMax: 5000,
      copay: 20,
      coinsurance: 20,
      networkInfo: {
        networkName: 'Blue Choice PPO',
        providerCount: 50000,
        nationalCoverage: true,
      },
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      waitingPeriodDays: 30,
      isEmployeeContribution: true,
      displayOrder: 1,
    },
  });

  const dentalPlan = await prisma.benefitPlan.create({
    data: {
      tenantId,
      planCode: 'DENTAL-STD-2024',
      planName: 'Standard Dental Coverage',
      category: 'DENTAL',
      planTier: 'STANDARD',
      carrierName: 'Delta Dental',
      carrierPolicyNumber: 'DD-2024-STD-001',
      description: 'Comprehensive dental coverage including preventive, basic, and major services',
      coverage: {
        preventive: '100% covered (cleanings, exams, X-rays)',
        basic: '80% covered after deductible (fillings, extractions)',
        major: '50% covered after deductible (crowns, bridges, root canals)',
        orthodontics: '50% covered up to $2000 lifetime max',
      },
      employeePremium: 25,
      employerPremium: 35,
      spousePremium: 25,
      childPremium: 20,
      familyPremium: 75,
      deductible: 50,
      outOfPocketMax: 1500,
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      waitingPeriodDays: 0,
      isEmployeeContribution: true,
      displayOrder: 2,
    },
  });

  const visionPlan = await prisma.benefitPlan.create({
    data: {
      tenantId,
      planCode: 'VISION-BAS-2024',
      planName: 'Basic Vision Plan',
      category: 'VISION',
      planTier: 'BASIC',
      carrierName: 'VSP Vision Care',
      carrierPolicyNumber: 'VSP-2024-BAS-001',
      description: 'Annual eye exams and vision correction coverage',
      coverage: {
        exam: '$10 copay annually',
        lenses: '$25 copay annually',
        frames: '$150 allowance annually',
        contacts: '$150 allowance in lieu of glasses',
      },
      employeePremium: 10,
      employerPremium: 15,
      spousePremium: 10,
      childPremium: 8,
      familyPremium: 30,
      copay: 10,
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      waitingPeriodDays: 0,
      isEmployeeContribution: true,
      displayOrder: 3,
    },
  });

  const retirementPlan = await prisma.benefitPlan.create({
    data: {
      tenantId,
      planCode: '401K-MATCH-2024',
      planName: '401(k) Retirement Plan with Employer Match',
      category: 'RETIREMENT',
      planTier: 'STANDARD',
      carrierName: 'Fidelity Investments',
      carrierPolicyNumber: 'FID-401K-2024-001',
      description: '401(k) plan with 50% employer match up to 6% of salary',
      coverage: {
        matchFormula: '50% match up to 6% of salary',
        vestingSchedule: 'Immediate vesting',
        contributionLimit: '$23000 annual (2024)',
        catchUpLimit: '$7500 for age 50+ (2024)',
      },
      employeePremium: 0,
      employerPremium: 0,
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      waitingPeriodDays: 0,
      isEmployeeContribution: false,
      displayOrder: 4,
    },
  });

  // Create Premium Rates for Health Plan
  console.log('    - Creating premium rates...');

  await prisma.premiumRate.createMany({
    data: [
      {
        tenantId,
        planId: healthPlan.id,
        coverageLevel: 'EMPLOYEE_ONLY',
        ageMin: 0,
        ageMax: 30,
        employeePremium: 120,
        employerPremium: 380,
        totalPremium: 500,
        effectiveFrom: new Date('2024-01-01'),
      },
      {
        tenantId,
        planId: healthPlan.id,
        coverageLevel: 'EMPLOYEE_ONLY',
        ageMin: 31,
        ageMax: 50,
        employeePremium: 150,
        employerPremium: 450,
        totalPremium: 600,
        effectiveFrom: new Date('2024-01-01'),
      },
      {
        tenantId,
        planId: healthPlan.id,
        coverageLevel: 'FAMILY',
        employeePremium: 400,
        employerPremium: 1100,
        totalPremium: 1500,
        effectiveFrom: new Date('2024-01-01'),
      },
    ],
  });

  // Create Dependents
  console.log('    - Creating dependents...');

  const dependent1 = await prisma.dependent.create({
    data: {
      tenantId,
      employeeId: 'emp-001',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1988-05-15'),
      relationship: 'SPOUSE',
      gender: 'Female',
      ssn: '***-**-1234',
      email: 'jane.doe@example.com',
      phone: '+1-555-0102',
      status: 'VERIFIED',
      verifiedBy: 'HR Manager',
      verifiedDate: new Date('2024-01-10'),
    },
  });

  const dependent2 = await prisma.dependent.create({
    data: {
      tenantId,
      employeeId: 'emp-001',
      firstName: 'Tommy',
      lastName: 'Doe',
      dateOfBirth: new Date('2015-03-20'),
      relationship: 'CHILD',
      gender: 'Male',
      status: 'VERIFIED',
      isStudent: true,
      verifiedBy: 'HR Manager',
      verifiedDate: new Date('2024-01-10'),
    },
  });

  // Create Enrollment Window
  console.log('    - Creating enrollment window...');

  await prisma.enrollmentWindow.create({
    data: {
      tenantId,
      windowName: '2024 Open Enrollment',
      windowType: 'Open Enrollment',
      planYear: 2024,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2023-11-30'),
      description: 'Annual open enrollment period for 2024 benefits',
      eligibleCategories: ['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'RETIREMENT'],
      instructions: 'Please review your benefit options and make your selections by November 30th',
      isActive: true,
    },
  });

  // Create Benefit Enrollments
  console.log('    - Creating benefit enrollments...');

  const enrollment1 = await prisma.benefitEnrollment.create({
    data: {
      tenantId,
      employeeId: 'emp-001',
      employeeName: 'John Doe',
      employeeCode: 'E001',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      planId: healthPlan.id,
      coverageLevel: 'FAMILY',
      enrollmentType: 'OPEN_ENROLLMENT',
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      employeePremium: 400,
      employerPremium: 1100,
      totalPremium: 1500,
      paymentFrequency: 'MONTHLY',
      enrolledDependents: [dependent1.id, dependent2.id],
      enrollmentDate: new Date('2023-11-15'),
      approvedBy: 'HR Manager',
      approvedDate: new Date('2023-11-16'),
    },
  });

  await prisma.benefitEnrollment.create({
    data: {
      tenantId,
      employeeId: 'emp-001',
      employeeName: 'John Doe',
      employeeCode: 'E001',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
      planId: dentalPlan.id,
      coverageLevel: 'FAMILY',
      enrollmentType: 'OPEN_ENROLLMENT',
      status: 'ACTIVE',
      effectiveFrom: new Date('2024-01-01'),
      employeePremium: 75,
      employerPremium: 110,
      totalPremium: 185,
      paymentFrequency: 'MONTHLY',
      enrolledDependents: [dependent1.id, dependent2.id],
      enrollmentDate: new Date('2023-11-15'),
      approvedBy: 'HR Manager',
      approvedDate: new Date('2023-11-16'),
    },
  });

  // Create Benefit Claims
  console.log('    - Creating benefit claims...');

  await prisma.benefitClaim.create({
    data: {
      tenantId,
      claimNumber: 'CLM-2024-000001',
      enrollmentId: enrollment1.id,
      employeeId: 'emp-001',
      employeeName: 'John Doe',
      planId: healthPlan.id,
      planName: healthPlan.planName,
      claimType: 'HEALTH_INSURANCE',
      claimDate: new Date('2024-01-20'),
      serviceDate: new Date('2024-01-18'),
      providerId: 'prov-001',
      providerName: 'City General Hospital',
      claimAmount: 2500,
      approvedAmount: 2200,
      paidAmount: 1800,
      employeeResponsibility: 400,
      deductibleApplied: 200,
      coinsuranceApplied: 200,
      copay: 0,
      status: 'PAID',
      submittedDate: new Date('2024-01-20'),
      reviewedBy: 'Claims Processor',
      reviewedDate: new Date('2024-01-22'),
      approvedBy: 'Claims Manager',
      approvedDate: new Date('2024-01-23'),
      paidDate: new Date('2024-01-25'),
      paymentMethod: 'Direct Deposit',
      diagnosisCodes: ['J06.9'],
      procedureCodes: ['99213'],
      notes: 'Routine office visit with diagnostic tests',
    },
  });

  await prisma.benefitClaim.create({
    data: {
      tenantId,
      claimNumber: 'CLM-2024-000002',
      enrollmentId: enrollment1.id,
      employeeId: 'emp-001',
      employeeName: 'John Doe',
      planId: healthPlan.id,
      planName: healthPlan.planName,
      claimType: 'HEALTH_INSURANCE',
      claimDate: new Date('2024-02-10'),
      serviceDate: new Date('2024-02-08'),
      providerId: 'prov-002',
      providerName: 'Downtown Medical Center',
      claimAmount: 850,
      status: 'UNDER_REVIEW',
      submittedDate: new Date('2024-02-10'),
      reviewedBy: 'Claims Processor',
      reviewedDate: new Date('2024-02-11'),
      diagnosisCodes: ['M54.5'],
      procedureCodes: ['99214', '73610'],
      notes: 'Lower back pain - X-ray and consultation',
    },
  });

  // Create Healthcare Providers
  console.log('    - Creating healthcare providers...');

  await prisma.healthcareProvider.createMany({
    data: [
      {
        tenantId,
        providerCode: 'PROV-001',
        providerName: 'City General Hospital',
        providerType: 'HOSPITAL',
        specialty: 'General Medicine',
        npiNumber: '1234567890',
        taxId: '12-3456789',
        address: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
        },
        phone: '+1-555-0100',
        email: 'info@citygeneralhospital.com',
        website: 'https://citygeneralhospital.com',
        networkStatus: 'In-Network',
        acceptingNewPatients: true,
        languages: ['English', 'Spanish'],
        rating: 4.5,
        isActive: true,
      },
      {
        tenantId,
        providerCode: 'PROV-002',
        providerName: 'Downtown Medical Center',
        providerType: 'CLINIC',
        specialty: 'Family Medicine',
        npiNumber: '0987654321',
        address: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103',
        },
        phone: '+1-555-0200',
        email: 'contact@downtownmedical.com',
        website: 'https://downtownmedical.com',
        networkStatus: 'In-Network',
        acceptingNewPatients: true,
        languages: ['English'],
        rating: 4.8,
        isActive: true,
      },
      {
        tenantId,
        providerCode: 'PROV-003',
        providerName: 'Smile Dental Group',
        providerType: 'DENTAL',
        specialty: 'General Dentistry',
        npiNumber: '1122334455',
        address: {
          street: '789 Elm St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94104',
        },
        phone: '+1-555-0300',
        email: 'hello@smiledentalgroup.com',
        networkStatus: 'In-Network',
        acceptingNewPatients: true,
        languages: ['English', 'Mandarin'],
        rating: 4.7,
        isActive: true,
      },
    ],
  });

  // Create Qualifying Events
  console.log('    - Creating qualifying events...');

  await prisma.qualifyingEvent.create({
    data: {
      tenantId,
      employeeId: 'emp-002',
      employeeName: 'Jane Smith',
      eventType: 'MARRIAGE',
      eventDate: new Date('2024-02-14'),
      reportedDate: new Date('2024-02-15'),
      description: 'Marriage - eligible for special enrollment',
      supportingDocuments: ['marriage-certificate.pdf'],
      allowsEnrollment: true,
      enrollmentDeadline: new Date('2024-03-16'),
      verifiedBy: 'HR Manager',
      verifiedDate: new Date('2024-02-16'),
      isActive: true,
    },
  });

  // Create Premium Deductions
  console.log('    - Creating premium deductions...');

  await prisma.premiumDeduction.createMany({
    data: [
      {
        tenantId,
        enrollmentId: enrollment1.id,
        employeeId: 'emp-001',
        payrollDate: new Date('2024-01-31'),
        deductionAmount: 400,
        paymentMethod: 'Payroll Deduction',
        status: 'PROCESSED',
        processedDate: new Date('2024-01-31'),
      },
      {
        tenantId,
        enrollmentId: enrollment1.id,
        employeeId: 'emp-001',
        payrollDate: new Date('2024-02-29'),
        deductionAmount: 400,
        paymentMethod: 'Payroll Deduction',
        status: 'PROCESSED',
        processedDate: new Date('2024-02-29'),
      },
    ],
  });

  console.log('  ✅ Benefits data seeded successfully');
}
