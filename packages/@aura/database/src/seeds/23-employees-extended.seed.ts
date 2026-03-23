/**
 * 23-employees-extended.seed.ts
 * Creates additional employees, emergency contacts, dependents,
 * and compliance details for a realistic multi-entity org.
 */
import { PrismaClient } from '@prisma/client';

export async function seedExtendedEmployees(prisma: PrismaClient, tenantId: string) {
  console.log('...Seeding Extended Employees');

  const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });
  if (!company) { console.warn('⚠️ Company KREUP_GLOBAL not found. Skipping.'); return; }

  const dept = await prisma.department.findFirst({ where: { companyId: company.id } });
  const depts = await prisma.department.findMany({ where: { companyId: company.id } });
  const locations = await prisma.location.findMany({ where: { companyId: company.id } });
  const jobProfiles = await prisma.jobProfile.findMany();
  const grades = await prisma.grade.findMany({ orderBy: { level: 'asc' } });
  const empStatusActive = await prisma.employeeStatus.findFirst({ where: { code: 'ACTIVE' } });
  const empStatusProbation = await prisma.employeeStatus.findFirst({ where: { code: 'PROBATION' } });
  const empTypeFull = await prisma.employmentType.findFirst({ where: { code: 'FULL_TIME' } });
  const empTypePart = await prisma.employmentType.findFirst({ where: { code: 'PART_TIME' } });
  const empTypeContract = await prisma.employmentType.findFirst({ where: { code: 'CONTRACT' } });

  if (!dept || !empStatusActive || !empTypeFull || jobProfiles.length === 0 || grades.length === 0) {
    console.warn('⚠️ Missing prerequisite data. Skipping extended employees.');
    return;
  }

  const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];
  const empStatus = empStatusProbation ?? empStatusActive;
  const empTypes = [empTypeFull, empTypePart ?? empTypeFull, empTypeContract ?? empTypeFull];

  const employeeDefs = [
    { code: 'EMP-002', first: 'Sarah', last: 'Ahmed', email: 'sarah.ahmed@kreupai.com', gradeIdx: 3, deptIdx: 0, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-003', first: 'Mohammed', last: 'Al-Rashid', email: 'mohammed.alrashid@kreupai.com', gradeIdx: 4, deptIdx: 1, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-004', first: 'Priya', last: 'Sharma', email: 'priya.sharma@kreupai.com', gradeIdx: 2, deptIdx: 0, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-005', first: 'Ahmed', last: 'Hassan', email: 'ahmed.hassan@kreupai.com', gradeIdx: 5, deptIdx: 2, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-006', first: 'Fatima', last: 'Al-Zahra', email: 'fatima.alzahra@kreupai.com', gradeIdx: 1, deptIdx: 0, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-007', first: 'Raj', last: 'Patel', email: 'raj.patel@kreupai.com', gradeIdx: 3, deptIdx: 1, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-008', first: 'Lisa', last: 'Chen', email: 'lisa.chen@kreupai.com', gradeIdx: 6, deptIdx: 2, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-009', first: 'Omar', last: 'Khalil', email: 'omar.khalil@kreupai.com', gradeIdx: 2, deptIdx: 0, locIdx: 0, typeIdx: 1 },
    { code: 'EMP-010', first: 'Aisha', last: 'Begum', email: 'aisha.begum@kreupai.com', gradeIdx: 4, deptIdx: 1, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-011', first: 'John', last: 'Williams', email: 'john.williams@kreupai.com', gradeIdx: 7, deptIdx: 2, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-012', first: 'Noura', last: 'Al-Mansoori', email: 'noura.almansoori@kreupai.com', gradeIdx: 3, deptIdx: 0, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-013', first: 'Vikram', last: 'Singh', email: 'vikram.singh@kreupai.com', gradeIdx: 5, deptIdx: 1, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-014', first: 'Maria', last: 'Garcia', email: 'maria.garcia@kreupai.com', gradeIdx: 2, deptIdx: 2, locIdx: 0, typeIdx: 2 },
    { code: 'EMP-015', first: 'Khalid', last: 'Al-Saud', email: 'khalid.alsaud@kreupai.com', gradeIdx: 8, deptIdx: 0, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-016', first: 'Deepa', last: 'Nair', email: 'deepa.nair@kreupai.com', gradeIdx: 1, deptIdx: 1, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-017', first: 'James', last: 'O\'Brien', email: 'james.obrien@kreupai.com', gradeIdx: 4, deptIdx: 2, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-018', first: 'Layla', last: 'Ibrahim', email: 'layla.ibrahim@kreupai.com', gradeIdx: 3, deptIdx: 0, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-019', first: 'Arjun', last: 'Kumar', email: 'arjun.kumar@kreupai.com', gradeIdx: 2, deptIdx: 1, locIdx: 1, typeIdx: 0 },
    { code: 'EMP-020', first: 'Sophie', last: 'Martin', email: 'sophie.martin@kreupai.com', gradeIdx: 6, deptIdx: 2, locIdx: 0, typeIdx: 0 },
    { code: 'EMP-021', first: 'Tariq', last: 'Al-Bakri', email: 'tariq.albakri@kreupai.com', gradeIdx: 5, deptIdx: 0, locIdx: 0, typeIdx: 0 },
  ];

  const createdEmployees: string[] = [];
  const existingAdmin = await prisma.employee.findFirst({ where: { employeeCode: 'EMP-001' } });
  if (existingAdmin) createdEmployees.push(existingAdmin.id);

  for (const def of employeeDefs) {
    const existing = await prisma.employee.findFirst({ where: { employeeCode: def.code } });
    if (existing) { createdEmployees.push(existing.id); continue; }

    const emp = await prisma.employee.create({
      data: {
        employeeCode: def.code,
        firstName: def.first,
        lastName: def.last,
        email: def.email,
        companyId: company.id,
        departmentId: pick(depts, def.deptIdx).id,
        locationId: pick(locations, def.locIdx).id,
        jobProfileId: pick(jobProfiles, def.gradeIdx).id,
        gradeId: pick(grades, def.gradeIdx).id,
        statusId: def.gradeIdx <= 1 ? empStatus.id : empStatusActive!.id,
        typeId: pick(empTypes, def.typeIdx)!.id,
        joiningDate: new Date(2022 + (def.gradeIdx % 3), def.deptIdx * 3 + 1, 15),
        managerId: createdEmployees.length >= 3 ? pick(createdEmployees, def.gradeIdx) : undefined,
      },
    });
    createdEmployees.push(emp.id);
  }
  console.log(`✅ Created/verified ${createdEmployees.length} employees`);

  // ── Emergency Contacts ──
  console.log('...Seeding Emergency Contacts');
  const emergencyDefs = [
    { name: 'Kareem Ahmed', relation: 'Spouse', phone: '+971501234567' },
    { name: 'Fatima Al-Rashid', relation: 'Mother', phone: '+966501234567' },
    { name: 'Suresh Sharma', relation: 'Father', phone: '+919876543210' },
    { name: 'Noor Hassan', relation: 'Sibling', phone: '+971509876543' },
    { name: 'Ravi Patel', relation: 'Spouse', phone: '+919876543211' },
  ];
  for (let i = 0; i < Math.min(emergencyDefs.length, createdEmployees.length); i++) {
    const existing = await prisma.emergencyContact.findFirst({
      where: { employeeId: createdEmployees[i], name: emergencyDefs[i].name },
    });
    if (!existing) {
      await prisma.emergencyContact.create({
        data: {
          tenantId,
          employeeId: createdEmployees[i],
          name: emergencyDefs[i].name,
          relationship: emergencyDefs[i].relation,
          phone: emergencyDefs[i].phone,
          isPrimary: true,
        },
      });
    }
  }

  // ── Employee Compliance Details ──
  console.log('...Seeding Employee Compliance Details');
  const complianceDefs = [
    { countryCode: 'AE', labourCard: 'LC-2024-00001', emiratesId: '784-2024-1234567-1', wpsNum: 'WPS-00001' },
    { countryCode: 'SA', iqamaNumber: '2488765432', gosiSub: 'GOSI-100001' },
    { countryCode: 'IN', panNumber: 'ABCPS1234F', aadhaarNumber: '123456789012', uanNumber: '100123456789' },
    { countryCode: 'AE', labourCard: 'LC-2024-00002', emiratesId: '784-2024-2345678-2', wpsNum: 'WPS-00002' },
    { countryCode: 'IN', panNumber: 'DEFGH5678J', aadhaarNumber: '234567890123', uanNumber: '100234567890' },
  ];
  for (let i = 0; i < Math.min(complianceDefs.length, createdEmployees.length); i++) {
    const def = complianceDefs[i];
    const existing = await prisma.employeeComplianceDetails.findFirst({ where: { employeeId: createdEmployees[i] } });
    if (!existing) {
      await prisma.employeeComplianceDetails.create({
        data: {
          tenantId,
          employeeId: createdEmployees[i],
          countryCode: def.countryCode,
          labourCardNumber: def.labourCard,
          emiratesId: def.emiratesId,
          wpsPersonalNumber: def.wpsNum,
          iqamaNumber: def.iqamaNumber,
          gosiSubscriptionNumber: def.gosiSub,
          panNumber: def.panNumber,
          aadhaarNumber: def.aadhaarNumber,
          uanNumber: def.uanNumber,
          nationality: def.countryCode === 'AE' ? 'Emirati' : def.countryCode === 'SA' ? 'Saudi' : 'Indian',
          isLocalNational: true,
          contractType: 'Indefinite',
          contractStartDate: new Date(2022, i * 2, 1),
          bankName: def.countryCode === 'IN' ? 'State Bank of India' : 'Emirates NBD',
          bankAccountNumber: `ACC-${1000 + i}`,
          bankIBAN: def.countryCode !== 'IN' ? `AE${String(600000000000000 + i)}` : undefined,
        },
      });
    }
  }

  // ── Dependents ──
  console.log('...Seeding Dependents');
  const dependentDefs = [
    { first: 'Amira', last: 'Ahmed', dob: '1990-05-15', relationship: 'SPOUSE' as const, gender: 'Female' },
    { first: 'Youssef', last: 'Ahmed', dob: '2015-08-20', relationship: 'CHILD' as const, gender: 'Male' },
    { first: 'Ravi', last: 'Sharma', dob: '1988-11-10', relationship: 'SPOUSE' as const, gender: 'Male' },
    { first: 'Anaya', last: 'Sharma', dob: '2019-03-25', relationship: 'CHILD' as const, gender: 'Female' },
    { first: 'Nour', last: 'Hassan', dob: '1992-07-18', relationship: 'SPOUSE' as const, gender: 'Female' },
  ];
  for (let i = 0; i < Math.min(dependentDefs.length, createdEmployees.length); i++) {
    const def = dependentDefs[i];
    const existing = await prisma.dependent.findFirst({
      where: { employeeId: createdEmployees[i], firstName: def.first, lastName: def.last },
    });
    if (!existing) {
      await prisma.dependent.create({
        data: {
          tenantId,
          employeeId: createdEmployees[i],
          firstName: def.first,
          lastName: def.last,
          dateOfBirth: new Date(def.dob),
          relationship: def.relationship,
          gender: def.gender,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log('✅ Extended Employees, Emergency Contacts, Compliance Details & Dependents seeded');
  return createdEmployees;
}
