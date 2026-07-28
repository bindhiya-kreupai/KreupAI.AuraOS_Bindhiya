/**
 * 32-remaining-coverage.seed.ts
 *
 * Seeds the remaining 17 models not covered by files 01-31:
 *   Permission, RolePermission, UserRole, UserDelegation, UserDeactivation,
 *   CompetencyRelation, CompetencyRoleMapping, GapAnalysisItem,
 *   SkillAssessmentCompetency, SkillAssessmentResult, DevelopmentMilestone,
 *   IncrementCycle, MentoringProgram, GOSISubmission, GOSIRecord,
 *   WPSSubmission, WPSRecord
 *
 * NOT seeded (runtime-only models):
 *   AuditLog, AuditLogArchive, MFASecret, PasswordResetToken,
 *   RefreshToken, UserSession, WPSAuditLog
 */

import { PrismaClient } from '@prisma/client';

const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];

export async function seedRemainingCoverage(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding Remaining Coverage (32)...');

  const employees = await prisma.employee.findMany({ take: 10 });
  const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });
  const roles = await prisma.role.findMany();
  const company = await prisma.company.findFirst({ where: { code: 'KREUP_GLOBAL' } });

  if (employees.length === 0 || users.length === 0) {
    console.warn('⚠️ No employees or users found. Skipping remaining coverage.');
    return;
  }

  // ============================================================================
  // 1. PERMISSIONS
  // ============================================================================
  console.log('    - Creating permissions...');

  const resources = ['employees', 'departments', 'payroll', 'leave', 'attendance', 'recruitment', 'shifts', 'shift-assignments', 'shift-rosters', 'shift-swaps'];
  const actions = ['create', 'read', 'update', 'delete', 'manage'];
  const createdPermissions: Array<{ id: string; resource: string; action: string }> = [];

  for (const resource of resources) {
    for (const action of actions) {
      const existing = await prisma.permission.findFirst({
        where: { resource, action },
      });
      if (existing) {
        createdPermissions.push({ id: existing.id, resource, action });
      } else {
        const perm = await prisma.permission.create({
          data: {
            resource,
            action,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          },
        });
        createdPermissions.push({ id: perm.id, resource, action });
      }
    }
  }
  console.log(`      Created/verified ${createdPermissions.length} permissions`);

  // ============================================================================
  // 2. ROLE PERMISSIONS
  // ============================================================================
  console.log('    - Creating role permissions...');

  const roleActionMap: Record<string, string[]> = {
    SUPER_ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    ADMIN: ['create', 'read', 'update', 'delete', 'manage'],
    HR_MANAGER: ['create', 'read', 'update', 'delete'],
    MANAGER: ['read', 'update'],
    EMPLOYEE: ['read'],
  };

  let rpCount = 0;
  for (const role of roles) {
    const allowedActions = roleActionMap[role.code] ?? ['read'];
    for (const perm of createdPermissions) {
      if (!allowedActions.includes(perm.action)) continue;
      const existing = await prisma.rolePermission.findFirst({
        where: { roleId: role.id, permissionId: perm.id },
      });
      if (!existing) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
        rpCount++;
      }
    }
  }
  console.log(`      Created ${rpCount} role-permission links`);

  // ============================================================================
  // 3. USER ROLES
  // ============================================================================
  console.log('    - Creating user roles...');

  const roleCodes = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE'];
  let urCount = 0;
  for (let i = 0; i < Math.min(users.length, roleCodes.length); i++) {
    const role = roles.find((r) => r.code === roleCodes[i]);
    if (!role) continue;
    const existing = await prisma.userRole.findFirst({
      where: { userId: users[i].id, roleId: role.id },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: {
          userId: users[i].id,
          roleId: role.id,
          tenantId,
          assignedBy: users[0].id,
        },
      });
      urCount++;
    }
  }
  console.log(`      Created ${urCount} user-role assignments`);

  // ============================================================================
  // 4. USER DELEGATION
  // ============================================================================
  console.log('    - Creating user delegations...');

  if (users.length >= 2) {
    const existing = await prisma.userDelegation.findFirst({
      where: { delegatorId: users[0].id, delegateeId: users[1].id },
    });
    if (!existing) {
      await prisma.userDelegation.create({
        data: {
          delegatorId: users[0].id,
          delegateeId: users[1].id,
          role: 'APPROVER',
          startDate: new Date('2025-03-20'),
          endDate: new Date('2025-04-05'),
          reason: 'Annual vacation — delegating approval authority',
          status: 'Active',
        },
      });
    }
    if (users.length >= 3) {
      const existing2 = await prisma.userDelegation.findFirst({
        where: { delegatorId: users[2].id, delegateeId: users[0].id },
      });
      if (!existing2) {
        await prisma.userDelegation.create({
          data: {
            delegatorId: users[2].id,
            delegateeId: users[0].id,
            role: 'MANAGER',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-15'),
            reason: 'Business travel — delegating team management',
            status: 'Scheduled',
          },
        });
      }
    }
    console.log('      Created user delegations');
  }

  // ============================================================================
  // 5. USER DEACTIVATION
  // ============================================================================
  console.log('    - Creating user deactivation records...');

  // Only seed if there's a user we can safely "deactivate" for record-keeping
  if (users.length >= 5) {
    const existing = await prisma.userDeactivation.findFirst({
      where: { userId: users[4].id },
    });
    if (!existing) {
      await prisma.userDeactivation.create({
        data: {
          userId: users[4].id,
          reason: 'Contract end — project completed',
          deactivatedBy: users[0].id,
        },
      });
      console.log('      Created 1 user deactivation record');
    }
  }

  // ============================================================================
  // 6. COMPETENCY RELATIONS
  // ============================================================================
  console.log('    - Creating competency relations...');

  const competencies = await prisma.competencyCatalog.findMany({ take: 6 });
  let crCount = 0;
  if (competencies.length >= 4) {
    const relations = [
      { srcIdx: 0, relIdx: 1, type: 'Related' },
      { srcIdx: 0, relIdx: 2, type: 'Complementary' },
      { srcIdx: 2, relIdx: 3, type: 'Prerequisite' },
    ];
    for (const rel of relations) {
      const src = competencies[rel.srcIdx];
      const related = competencies[rel.relIdx];
      const existing = await prisma.competencyRelation.findFirst({
        where: { sourceCompetencyId: src.id, relatedCompetencyId: related.id },
      });
      if (!existing) {
        await prisma.competencyRelation.create({
          data: {
            sourceCompetencyId: src.id,
            relatedCompetencyId: related.id,
            relationType: rel.type,
          },
        });
        crCount++;
      }
    }
  }
  console.log(`      Created ${crCount} competency relations`);

  // ============================================================================
  // 7. COMPETENCY ROLE MAPPINGS
  // ============================================================================
  console.log('    - Creating competency role mappings...');

  let crmCount = 0;
  const roleNames = ['Software Engineer', 'HR Manager', 'Project Manager', 'Team Lead'];
  for (let i = 0; i < Math.min(competencies.length, roleNames.length); i++) {
    const existing = await prisma.competencyRoleMapping.findFirst({
      where: { competencyId: competencies[i].id, roleName: roleNames[i] },
    });
    if (!existing) {
      await prisma.competencyRoleMapping.create({
        data: {
          competencyId: competencies[i].id,
          roleName: roleNames[i],
        },
      });
      crmCount++;
    }
  }
  console.log(`      Created ${crmCount} competency-role mappings`);

  // ============================================================================
  // 8. GAP ANALYSIS ITEMS
  // ============================================================================
  console.log('    - Creating gap analysis items...');

  const gapAnalyses = await prisma.gapAnalysis.findMany({ take: 2 });
  const proficiencyLevels = await prisma.proficiencyLevel.findMany({ orderBy: { levelNumber: 'asc' } });

  let gaiCount = 0;
  if (gapAnalyses.length > 0 && proficiencyLevels.length >= 3 && competencies.length >= 3) {
    const items = [
      { gaIdx: 0, compIdx: 0, curLvl: 0, tgtLvl: 2, gap: 2.0, priority: 'High' },
      { gaIdx: 0, compIdx: 1, curLvl: 1, tgtLvl: 3, gap: 2.0, priority: 'Critical' },
      { gaIdx: 0, compIdx: 2, curLvl: 2, tgtLvl: 3, gap: 1.0, priority: 'Medium' },
    ];
    for (const item of items) {
      const ga = gapAnalyses[item.gaIdx];
      const comp = competencies[item.compIdx];
      if (!ga || !comp) continue;
      const existing = await prisma.gapAnalysisItem.findFirst({
        where: { gapAnalysisId: ga.id, competencyId: comp.id },
      });
      if (!existing) {
        await prisma.gapAnalysisItem.create({
          data: {
            gapAnalysisId: ga.id,
            competencyId: comp.id,
            currentLevelId: pick(proficiencyLevels, item.curLvl).id,
            targetLevelId: pick(proficiencyLevels, item.tgtLvl).id,
            gapScore: item.gap,
            priority: item.priority,
            notes: `Gap identified in ${comp.name} — requires development focus`,
          },
        });
        gaiCount++;
      }
    }
  }
  console.log(`      Created ${gaiCount} gap analysis items`);

  // ============================================================================
  // 9. SKILL ASSESSMENT COMPETENCIES
  // ============================================================================
  console.log('    - Creating skill assessment competencies...');

  const skillAssessments = await prisma.skillAssessment.findMany({ take: 3 });
  let sacCount = 0;
  if (skillAssessments.length > 0 && competencies.length >= 3) {
    for (const sa of skillAssessments) {
      for (let i = 0; i < Math.min(3, competencies.length); i++) {
        const existing = await prisma.skillAssessmentCompetency.findFirst({
          where: { assessmentId: sa.id, competencyId: competencies[i].id },
        });
        if (!existing) {
          await prisma.skillAssessmentCompetency.create({
            data: {
              assessmentId: sa.id,
              competencyId: competencies[i].id,
              weight: i === 0 ? 1.0 : 0.8,
            },
          });
          sacCount++;
        }
      }
    }
  }
  console.log(`      Created ${sacCount} skill assessment competencies`);

  // ============================================================================
  // 10. SKILL ASSESSMENT RESULTS
  // ============================================================================
  console.log('    - Creating skill assessment results...');

  let sarCount = 0;
  if (skillAssessments.length > 0 && competencies.length >= 2 && proficiencyLevels.length >= 3) {
    for (const sa of skillAssessments.slice(0, 2)) {
      for (let i = 0; i < Math.min(2, competencies.length); i++) {
        const assessorId = employees.length > i ? employees[i].id : null;
        const existing = await prisma.skillAssessmentResult.findFirst({
          where: { assessmentId: sa.id, competencyId: competencies[i].id, assessorId },
        });
        if (!existing) {
          await prisma.skillAssessmentResult.create({
            data: {
              assessmentId: sa.id,
              competencyId: competencies[i].id,
              assessorId,
              assessorType: i === 0 ? 'Self' : 'Manager',
              ratingLevelId: pick(proficiencyLevels, i + 2).id,
              comments: `Assessment of ${competencies[i].name}: demonstrates ${i === 0 ? 'strong' : 'developing'} capabilities`,
            },
          });
          sarCount++;
        }
      }
    }
  }
  console.log(`      Created ${sarCount} skill assessment results`);

  // ============================================================================
  // 11. DEVELOPMENT MILESTONES
  // ============================================================================
  console.log('    - Creating development milestones...');

  const devPlans = await prisma.developmentPlan.findMany({ take: 3 });
  let dmCount = 0;
  if (devPlans.length > 0) {
    const milestoneDefs = [
      { name: 'Complete initial skills assessment', monthOffset: 1, status: 'Achieved' },
      { name: 'Finish core training modules', monthOffset: 3, status: 'Pending' },
      { name: 'Pass certification exam', monthOffset: 6, status: 'Pending' },
      { name: 'Apply skills in live project', monthOffset: 9, status: 'Pending' },
    ];
    for (const plan of devPlans.slice(0, 2)) {
      for (let i = 0; i < milestoneDefs.length; i++) {
        const def = milestoneDefs[i];
        const existing = await prisma.developmentMilestone.findFirst({
          where: { developmentPlanId: plan.id, name: def.name },
        });
        if (!existing) {
          const targetDate = new Date('2025-01-01');
          targetDate.setMonth(targetDate.getMonth() + def.monthOffset);
          await prisma.developmentMilestone.create({
            data: {
              developmentPlanId: plan.id,
              name: def.name,
              description: `Milestone ${i + 1} for ${plan.name}`,
              targetDate,
              completedAt: def.status === 'Achieved' ? new Date('2025-02-15') : undefined,
              status: def.status,
              sortOrder: i + 1,
            },
          });
          dmCount++;
        }
      }
    }
  }
  console.log(`      Created ${dmCount} development milestones`);

  // ============================================================================
  // 12. INCREMENT CYCLE
  // ============================================================================
  console.log('    - Creating increment cycles...');

  const incCycleDefs = [
    { name: '2025 Annual Increment', effectiveDate: new Date('2025-04-01'), status: 'draft', budgetPct: 8.0 },
    { name: '2024 Annual Increment', effectiveDate: new Date('2024-04-01'), status: 'completed', budgetPct: 7.5 },
  ];
  for (const def of incCycleDefs) {
    const existing = await prisma.incrementCycle.findFirst({
      where: { tenantId, cycleName: def.name },
    });
    if (!existing) {
      await prisma.incrementCycle.create({
        data: {
          tenantId,
          cycleName: def.name,
          effectiveDate: def.effectiveDate,
          status: def.status,
          budgetPercentage: def.budgetPct,
          eligibilityCriteria: {
            minServiceMonths: 12,
            minPerformanceRating: 3,
            excludeProbation: true,
            excludeNotice: true,
          },
          approvalWorkflow: {
            levels: [
              { level: 1, role: 'HR_MANAGER', action: 'APPROVE' },
              { level: 2, role: 'FINANCE_HEAD', action: 'APPROVE' },
              { level: 3, role: 'CEO', action: 'APPROVE' },
            ],
          },
          createdBy: users[0].id,
        },
      });
    }
  }
  console.log('      Created increment cycles');

  // ============================================================================
  // 13. MENTORING PROGRAM
  // ============================================================================
  console.log('    - Creating mentoring programs...');

  if (employees.length >= 4) {
    const mentorDefs = [
      {
        name: 'Engineering Leadership Mentorship',
        mentorIdx: 0,
        menteeIdx: 3,
        status: 'active',
        goals: ['Develop team leadership skills', 'Learn architectural decision-making', 'Improve stakeholder communication'],
        freq: 'biweekly',
      },
      {
        name: 'New Hire Buddy Program',
        mentorIdx: 1,
        menteeIdx: 4 < employees.length ? 4 : 2,
        status: 'active',
        goals: ['Onboarding support', 'Cultural integration', 'Process familiarization'],
        freq: 'weekly',
      },
      {
        name: 'Cross-Functional Development',
        mentorIdx: 2,
        menteeIdx: 5 < employees.length ? 5 : 0,
        status: 'completed',
        goals: ['Learn finance fundamentals', 'Understand budgeting process', 'Build cross-team relationships'],
        freq: 'monthly',
      },
    ];
    for (const def of mentorDefs) {
      const existing = await prisma.mentoringProgram.findFirst({
        where: { tenantId, name: def.name },
      });
      if (!existing) {
        await prisma.mentoringProgram.create({
          data: {
            tenantId,
            name: def.name,
            description: `${def.name} — structured mentorship for professional development`,
            mentorId: employees[def.mentorIdx].id,
            menteeId: employees[def.menteeIdx].id,
            status: def.status,
            startDate: def.status === 'completed' ? new Date('2024-06-01') : new Date('2025-01-15'),
            endDate: def.status === 'completed' ? new Date('2024-12-15') : undefined,
            goals: def.goals,
            meetingFrequency: def.freq,
            createdBy: users[0].id,
          },
        });
      }
    }
    console.log('      Created mentoring programs');
  }

  // ============================================================================
  // 14. GOSI SUBMISSION + RECORDS
  // ============================================================================
  console.log('    - Creating GOSI submissions & records...');

  const gosiConfig = await prisma.gOSIConfiguration.findFirst({ where: { tenantId } });
  if (gosiConfig) {
    // Jan 2025 submission
    let gosiSub = await prisma.gOSISubmission.findFirst({
      where: { tenantId, gosiConfigId: gosiConfig.id, contributionMonth: '2025-01' },
    });
    if (!gosiSub) {
      gosiSub = await prisma.gOSISubmission.create({
        data: {
          tenantId,
          gosiConfigId: gosiConfig.id,
          contributionMonth: '2025-01',
          status: 'SUBMITTED',
          submissionDate: new Date('2025-02-10'),
          totalEmployees: 5,
          totalSaudis: 2,
          totalNonSaudis: 3,
          totalEmployeeContribution: 4875,
          totalEmployerContribution: 6250,
          totalPensionContribution: 9750,
          totalSanedContribution: 750,
          totalOccupationalHazards: 1000,
          grandTotal: 12875,
        },
      });
    }

    // GOSI Records for the submission
    const gosiEmpData = [
      { idx: 0, isSaudi: true, nationalId: '1088765432', basic: 15000, housing: 5000 },
      { idx: 1, isSaudi: true, nationalId: '1099876543', basic: 12000, housing: 4000 },
      { idx: 2, isSaudi: false, iqama: '2488765432', basic: 10000, housing: 3000 },
      { idx: 3, isSaudi: false, iqama: '2477654321', basic: 8000, housing: 2500 },
      { idx: 4, isSaudi: false, iqama: '2466543210', basic: 7000, housing: 2000 },
    ];
    for (const empData of gosiEmpData) {
      if (empData.idx >= employees.length) continue;
      const emp = employees[empData.idx];
      const existing = await prisma.gOSIRecord.findFirst({
        where: { submissionId: gosiSub.id, employeeId: emp.id },
      });
      if (!existing) {
        const contribSalary = Math.min(empData.basic + empData.housing, 45000);
        const empPension = empData.isSaudi ? contribSalary * 0.0975 : 0;
        const erPension = empData.isSaudi ? contribSalary * 0.0975 : 0;
        const sanedEmp = empData.isSaudi ? contribSalary * 0.0075 : 0;
        const sanedEr = empData.isSaudi ? contribSalary * 0.0075 : 0;
        const occHazard = contribSalary * 0.02;

        await prisma.gOSIRecord.create({
          data: {
            submissionId: gosiSub.id,
            employeeId: emp.id,
            iqamaNumber: empData.iqama ?? undefined,
            nationalId: empData.nationalId ?? undefined,
            nationality: empData.isSaudi ? 'Saudi' : 'Indian',
            isSaudi: empData.isSaudi,
            contributableSalary: contribSalary,
            basicSalary: empData.basic,
            housingAllowance: empData.housing,
            employeePension: empPension,
            employerPension: erPension,
            sanedEmployee: sanedEmp,
            sanedEmployer: sanedEr,
            occupationalHazards: occHazard,
            totalEmployee: empPension + sanedEmp,
            totalEmployer: erPension + sanedEr + occHazard,
            status: 'SUBMITTED',
          },
        });
      }
    }
    console.log('      Created GOSI submission with records');
  }

  // ============================================================================
  // 15. WPS SUBMISSION + RECORDS
  // ============================================================================
  console.log('    - Creating WPS submissions & records...');

  const wpsConfig = await prisma.wPSConfiguration.findFirst({ where: { tenantId } });
  if (wpsConfig) {
    let wpsSub = await prisma.wPSSubmission.findFirst({
      where: { tenantId, wpsConfigId: wpsConfig.id, payrollMonth: '2025-01' },
    });
    if (!wpsSub) {
      wpsSub = await prisma.wPSSubmission.create({
        data: {
          tenantId,
          wpsConfigId: wpsConfig.id,
          payrollMonth: '2025-01',
          payrollYear: 2025,
          salaryMonth: 'JAN2025',
          status: 'ACCEPTED',
          submissionDate: new Date('2025-02-01'),
          totalRecords: Math.min(employees.length, 5),
          totalAmount: 75000,
          successCount: Math.min(employees.length, 5),
          failureCount: 0,
          submittedBy: users[0].id,
          submittedAt: new Date('2025-02-01'),
          approvedBy: users.length > 1 ? users[1].id : users[0].id,
          approvedAt: new Date('2025-02-01'),
          createdBy: users[0].id,
          molReferenceNumber: 'MOL-WPS-2025-01-00123',
          processedAt: new Date('2025-02-02'),
        },
      });
    }

    // WPS Records
    const wpsEmpData = [
      { idx: 0, basic: 15000, allow: 8000, deduct: 500, leaveSal: 0, days: 30, labourCard: 'LC-2024-00001', personCode: 'PC-001' },
      { idx: 1, basic: 12000, allow: 6000, deduct: 400, leaveSal: 0, days: 30, labourCard: 'LC-2024-00002', personCode: 'PC-002' },
      { idx: 2, basic: 10000, allow: 5000, deduct: 350, leaveSal: 0, days: 30, labourCard: 'LC-2024-00003', personCode: 'PC-003' },
      { idx: 3, basic: 8000, allow: 4000, deduct: 300, leaveSal: 2000, days: 25, labourCard: 'LC-2024-00004', personCode: 'PC-004' },
      { idx: 4, basic: 7000, allow: 3500, deduct: 250, leaveSal: 0, days: 30, labourCard: 'LC-2024-00005', personCode: 'PC-005' },
    ];
    for (let i = 0; i < Math.min(wpsEmpData.length, employees.length); i++) {
      const empData = wpsEmpData[i];
      const emp = employees[empData.idx];
      const existing = await prisma.wPSRecord.findFirst({
        where: { submissionId: wpsSub.id, employeeId: emp.id },
      });
      if (!existing) {
        const net = empData.basic + empData.allow - empData.deduct + empData.leaveSal;
        await prisma.wPSRecord.create({
          data: {
            tenantId,
            submissionId: wpsSub.id,
            employeeId: emp.id,
            agentId: wpsConfig.agentId ?? 'AGT-001',
            labourCardNumber: empData.labourCard,
            personCode: empData.personCode,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            nationality: 'Indian',
            bankRoutingCode: wpsConfig.bankCode ?? 'ENBD',
            accountNumber: `ACC-${1000 + i}`,
            ibanNumber: `AE${String(600000000000000 + i)}`,
            basicSalary: empData.basic,
            allowances: empData.allow,
            deductions: empData.deduct,
            netSalary: net,
            leaveSalary: empData.leaveSal,
            salaryMonth: 'JAN2025',
            workingDays: 30,
            actualDays: empData.days,
            status: 'ACCEPTED',
            validationStatus: 'VALID',
            lineNumber: i + 1,
          },
        });
      }
    }
    console.log('      Created WPS submission with records');
  }

  console.log('  ✅ Remaining Coverage seed completed');
}

// Run if executed directly
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.argv[2] || process.env.TENANT_ID || 'default-tenant';
  seedRemainingCoverage(_prisma, tenantId)
    .catch((e) => {
      console.error('Error seeding remaining coverage:', e);
      process.exit(1);
    })
    .finally(async () => {
      await _prisma.$disconnect();
    });
}
