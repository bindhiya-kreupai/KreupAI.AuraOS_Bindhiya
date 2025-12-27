import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPositions() {
  console.log('🔧 Seeding Positions...');

  const tenantId = 'tenant-kreup-001';

  // Get departments for reference
  const engineering = await prisma.department.findFirst({
    where: { name: 'Engineering', tenantId },
  });

  const hr = await prisma.department.findFirst({
    where: { name: 'Human Resources', tenantId },
  });

  const finance = await prisma.department.findFirst({
    where: { name: 'Finance', tenantId },
  });

  const sales = await prisma.department.findFirst({
    where: { name: 'Sales', tenantId },
  });

  // Get locations
  const headquarters = await prisma.location.findFirst({
    where: { name: 'Headquarters', tenantId },
  });

  const remoteLoc = await prisma.location.findFirst({
    where: { name: 'Remote', tenantId },
  });

  // Get grades
  const grades = await prisma.grade.findMany({
    where: { tenantId },
    orderBy: { level: 'asc' },
  });

  // Get job profiles
  const seniorEngineerProfile = await prisma.jobProfile.findFirst({
    where: { title: { contains: 'Senior Software Engineer' }, tenantId },
  });

  const positions = [
    // Engineering Positions - Hierarchy
    {
      positionCode: 'POS-ENG-001',
      title: 'VP of Engineering',
      description: 'Lead the entire engineering organization, set technical strategy and vision',
      departmentId: engineering?.id,
      locationId: headquarters?.id,
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 1]?.id, // Highest grade
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 180000,
      salaryMax: 250000,
      salaryCurrency: 'USD',
      annualBudget: 250000,
      status: 'FILLED',
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-ENG-002',
      title: 'Engineering Manager - Backend',
      description: 'Manage backend engineering team, oversee API development and infrastructure',
      departmentId: engineering?.id,
      locationId: headquarters?.id,
      reportsToPositionCode: 'POS-ENG-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 2]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      annualBudget: 180000,
      status: 'FILLED',
      effectiveDate: new Date('2024-02-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-ENG-003',
      title: 'Senior Backend Engineer',
      description: 'Design and develop scalable backend systems, mentor junior engineers',
      departmentId: engineering?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-ENG-002',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 3]?.id,
      headcount: 3,
      fte: 3.0,
      filledCount: 2,
      vacantCount: 1,
      salaryMin: 120000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      annualBudget: 450000,
      status: 'OPEN',
      effectiveDate: new Date('2024-03-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-ENG-004',
      title: 'Backend Engineer',
      description: 'Develop and maintain backend services and APIs',
      departmentId: engineering?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-ENG-002',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 4]?.id,
      headcount: 5,
      fte: 5.0,
      filledCount: 3,
      vacantCount: 2,
      salaryMin: 90000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      annualBudget: 550000,
      status: 'OPEN',
      effectiveDate: new Date('2024-03-15'),
      isActive: true,
    },
    {
      positionCode: 'POS-ENG-005',
      title: 'Engineering Manager - Frontend',
      description: 'Lead frontend engineering team, drive UI/UX excellence',
      departmentId: engineering?.id,
      locationId: headquarters?.id,
      reportsToPositionCode: 'POS-ENG-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 2]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 0,
      vacantCount: 1,
      salaryMin: 140000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      annualBudget: 180000,
      status: 'OPEN',
      effectiveDate: new Date('2024-04-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-ENG-006',
      title: 'Senior Frontend Engineer',
      description: 'Build responsive and performant user interfaces',
      departmentId: engineering?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-ENG-005',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 3]?.id,
      headcount: 2,
      fte: 2.0,
      filledCount: 0,
      vacantCount: 2,
      salaryMin: 110000,
      salaryMax: 150000,
      salaryCurrency: 'USD',
      annualBudget: 300000,
      status: 'DRAFT',
      isActive: true,
    },

    // HR Positions
    {
      positionCode: 'POS-HR-001',
      title: 'Head of HR',
      description: 'Lead HR strategy, talent acquisition, and employee engagement',
      departmentId: hr?.id,
      locationId: headquarters?.id,
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 1]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 130000,
      salaryMax: 170000,
      salaryCurrency: 'USD',
      annualBudget: 170000,
      status: 'FILLED',
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-HR-002',
      title: 'HR Manager',
      description: 'Manage day-to-day HR operations, employee relations, and compliance',
      departmentId: hr?.id,
      locationId: headquarters?.id,
      reportsToPositionCode: 'POS-HR-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 3]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 80000,
      salaryMax: 110000,
      salaryCurrency: 'USD',
      annualBudget: 110000,
      status: 'FILLED',
      effectiveDate: new Date('2024-02-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-HR-003',
      title: 'Recruiter',
      description: 'Source, screen, and hire top talent',
      departmentId: hr?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-HR-002',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 4]?.id,
      headcount: 2,
      fte: 2.0,
      filledCount: 1,
      vacantCount: 1,
      salaryMin: 60000,
      salaryMax: 85000,
      salaryCurrency: 'USD',
      annualBudget: 150000,
      status: 'OPEN',
      effectiveDate: new Date('2024-03-01'),
      isActive: true,
    },

    // Finance Positions
    {
      positionCode: 'POS-FIN-001',
      title: 'CFO',
      description: 'Lead financial strategy, planning, and reporting',
      departmentId: finance?.id,
      locationId: headquarters?.id,
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 1]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 200000,
      salaryMax: 280000,
      salaryCurrency: 'USD',
      annualBudget: 280000,
      status: 'FILLED',
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-FIN-002',
      title: 'Senior Accountant',
      description: 'Manage accounting operations, financial reporting, and compliance',
      departmentId: finance?.id,
      locationId: headquarters?.id,
      reportsToPositionCode: 'POS-FIN-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 3]?.id,
      headcount: 2,
      fte: 2.0,
      filledCount: 2,
      vacantCount: 0,
      salaryMin: 75000,
      salaryMax: 100000,
      salaryCurrency: 'USD',
      annualBudget: 190000,
      status: 'FILLED',
      effectiveDate: new Date('2024-02-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-FIN-003',
      title: 'Financial Analyst',
      description: 'Conduct financial analysis and support strategic planning',
      departmentId: finance?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-FIN-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 4]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 0,
      vacantCount: 1,
      salaryMin: 65000,
      salaryMax: 90000,
      salaryCurrency: 'USD',
      annualBudget: 90000,
      status: 'FROZEN',
      effectiveDate: new Date('2024-03-01'),
      notes: 'Position frozen due to budget constraints',
      isActive: true,
    },

    // Sales Positions
    {
      positionCode: 'POS-SAL-001',
      title: 'VP of Sales',
      description: 'Drive revenue growth and manage sales organization',
      departmentId: sales?.id,
      locationId: headquarters?.id,
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 1]?.id,
      headcount: 1,
      fte: 1.0,
      filledCount: 1,
      vacantCount: 0,
      salaryMin: 160000,
      salaryMax: 220000,
      salaryCurrency: 'USD',
      annualBudget: 220000,
      status: 'FILLED',
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-SAL-002',
      title: 'Sales Manager',
      description: 'Lead sales team and achieve revenue targets',
      departmentId: sales?.id,
      locationId: headquarters?.id,
      reportsToPositionCode: 'POS-SAL-001',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 2]?.id,
      headcount: 2,
      fte: 2.0,
      filledCount: 2,
      vacantCount: 0,
      salaryMin: 100000,
      salaryMax: 140000,
      salaryCurrency: 'USD',
      annualBudget: 260000,
      status: 'FILLED',
      effectiveDate: new Date('2024-02-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-SAL-003',
      title: 'Account Executive',
      description: 'Acquire new customers and grow existing accounts',
      departmentId: sales?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-SAL-002',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 3]?.id,
      headcount: 5,
      fte: 5.0,
      filledCount: 3,
      vacantCount: 2,
      salaryMin: 70000,
      salaryMax: 100000,
      salaryCurrency: 'USD',
      annualBudget: 450000,
      status: 'OPEN',
      effectiveDate: new Date('2024-03-01'),
      isActive: true,
    },
    {
      positionCode: 'POS-SAL-004',
      title: 'Sales Development Representative',
      description: 'Generate qualified leads and schedule demos',
      departmentId: sales?.id,
      locationId: remoteLoc?.id,
      reportsToPositionCode: 'POS-SAL-002',
      jobProfileId: seniorEngineerProfile?.id,
      gradeId: grades[grades.length - 5]?.id,
      headcount: 3,
      fte: 3.0,
      filledCount: 0,
      vacantCount: 3,
      salaryMin: 50000,
      salaryMax: 70000,
      salaryCurrency: 'USD',
      annualBudget: 180000,
      status: 'CLOSED',
      effectiveDate: new Date('2024-02-01'),
      closedDate: new Date('2024-05-01'),
      notes: 'Position closed - role no longer needed',
      isActive: false,
    },
  ];

  // First pass: Create all positions without hierarchy
  const createdPositions = new Map<string, any>();

  for (const position of positions) {
    const { reportsToPositionCode, ...positionData } = position as any;

    const created = await prisma.position.upsert({
      where: {
        tenantId_positionCode: {
          tenantId,
          positionCode: position.positionCode,
        },
      },
      update: positionData,
      create: {
        ...positionData,
        tenantId,
      },
    });

    createdPositions.set(position.positionCode, created);
    console.log(`  ✓ Position: ${position.positionCode} - ${position.title}`);
  }

  // Second pass: Update hierarchy relationships
  for (const position of positions) {
    const reportsToCode = (position as any).reportsToPositionCode;
    if (reportsToCode) {
      const reportsToPosition = createdPositions.get(reportsToCode);
      if (reportsToPosition) {
        await prisma.position.update({
          where: { id: createdPositions.get(position.positionCode)!.id },
          data: {
            reportsToPositionId: reportsToPosition.id,
          },
        });
        console.log(`  ↳ Hierarchy: ${position.positionCode} → ${reportsToCode}`);
      }
    }
  }

  console.log(`✅ Created/Updated ${positions.length} positions with hierarchy\n`);
}
