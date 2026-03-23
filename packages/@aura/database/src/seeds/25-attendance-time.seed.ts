/**
 * @seed Attendance & Time Management
 * @description Seed data for shifts, shift assignments, rosters, attendance punches,
 *              attendance records, regularizations, overtime, comp-off, and shift swaps.
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

export async function seedAttendanceTime(prisma: PrismaClient, tenantId: string) {
  console.log('  ⏱️  Seeding Attendance & Time Management data...');

  // ── Fetch prerequisite employees ──
  const employees = await prisma.employee.findMany({ take: 10 });
  if (employees.length < 2) {
    console.warn('⚠️ Need at least 2 employees. Skipping attendance seed.');
    return;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SHIFTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating shifts...');

  const shiftDefs = [
    {
      code: 'SHIFT-MORNING',
      name: 'Morning Shift',
      description: 'Standard morning shift 06:00 to 14:00',
      startTime: '06:00',
      endTime: '14:00',
      workHours: 8,
      graceInMinutes: 15,
      graceOutMinutes: 10,
      breakDuration: 30,
      isPaidBreak: true,
      weekendDays: ['Friday', 'Saturday'],
      overtimeAllowed: true,
      maxOvertimeHours: 3,
      isFlexible: false,
      flexWindow: 0,
      isActive: true,
      isDefault: true,
    },
    {
      code: 'SHIFT-EVENING',
      name: 'Evening Shift',
      description: 'Evening shift 14:00 to 22:00',
      startTime: '14:00',
      endTime: '22:00',
      workHours: 8,
      graceInMinutes: 15,
      graceOutMinutes: 10,
      breakDuration: 30,
      isPaidBreak: true,
      weekendDays: ['Friday', 'Saturday'],
      overtimeAllowed: true,
      maxOvertimeHours: 2,
      isFlexible: false,
      flexWindow: 0,
      isActive: true,
      isDefault: false,
    },
    {
      code: 'SHIFT-NIGHT',
      name: 'Night Shift',
      description: 'Night shift 22:00 to 06:00',
      startTime: '22:00',
      endTime: '06:00',
      workHours: 8,
      graceInMinutes: 15,
      graceOutMinutes: 15,
      breakDuration: 45,
      isPaidBreak: true,
      weekendDays: ['Friday', 'Saturday'],
      overtimeAllowed: true,
      maxOvertimeHours: 2,
      isFlexible: false,
      flexWindow: 0,
      isActive: true,
      isDefault: false,
    },
  ];

  const shifts: Array<{ id: string; code: string; startTime: string; endTime: string }> = [];
  for (const def of shiftDefs) {
    const existing = await prisma.shift.findUnique({
      where: { tenantId_code: { tenantId, code: def.code } },
    });
    if (existing) {
      shifts.push({ id: existing.id, code: existing.code, startTime: existing.startTime, endTime: existing.endTime });
      continue;
    }
    const shift = await prisma.shift.create({
      data: { tenantId, ...def },
    });
    shifts.push({ id: shift.id, code: shift.code, startTime: shift.startTime, endTime: shift.endTime });
  }
  console.log(`    ✅ ${shifts.length} shifts created/verified`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SHIFT ASSIGNMENTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating shift assignments...');

  const assignmentDefs = employees.slice(0, Math.min(employees.length, 10)).map((emp, idx) => ({
    employeeId: emp.id,
    shiftId: shifts[idx % shifts.length].id,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null as Date | null,
    isActive: true,
    assignedBy: employees[0].id,
    reason: 'Initial shift assignment',
  }));

  for (const def of assignmentDefs) {
    const existing = await prisma.shiftAssignment.findFirst({
      where: { tenantId, employeeId: def.employeeId, shiftId: def.shiftId },
    });
    if (!existing) {
      await prisma.shiftAssignment.create({
        data: { tenantId, ...def },
      });
    }
  }
  console.log(`    ✅ ${assignmentDefs.length} shift assignments created/verified`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SHIFT ROSTER (5 working days: Mon 2025-03-17 to Fri 2025-03-21)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating shift roster entries...');

  const rosterDates = [
    new Date('2025-03-17'),
    new Date('2025-03-18'),
    new Date('2025-03-19'),
    new Date('2025-03-20'),
    new Date('2025-03-21'),
  ];

  let rosterCount = 0;
  for (const emp of employees.slice(0, 6)) {
    const assignedShift = shifts[employees.indexOf(emp) % shifts.length];
    for (const rosterDate of rosterDates) {
      const existing = await prisma.shiftRoster.findUnique({
        where: {
          tenantId_employeeId_rosterDate: {
            tenantId,
            employeeId: emp.id,
            rosterDate,
          },
        },
      });
      if (!existing) {
        await prisma.shiftRoster.create({
          data: {
            tenantId,
            employeeId: emp.id,
            shiftId: assignedShift.id,
            rosterDate,
            isWeekOff: false,
            isHoliday: false,
            status: 'SCHEDULED',
          },
        });
        rosterCount++;
      }
    }
  }
  console.log(`    ✅ ${rosterCount} roster entries created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ATTENDANCE PUNCHES (clock-in/out for 5 working days)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating attendance punches...');

  // Helper to build a DateTime from a date and "HH:MM" time offset
  function buildDateTime(dateStr: string, hours: number, minutes: number): Date {
    const d = new Date(dateStr);
    d.setUTCHours(hours, minutes, 0, 0);
    return d;
  }

  const punchDates = ['2025-03-17', '2025-03-18', '2025-03-19', '2025-03-20', '2025-03-21'];
  const devices = ['Biometric', 'Mobile', 'Web'];
  const locations = ['Main Office - Gate 1', 'Main Office - Lobby', 'Remote - Home'];

  interface PunchRecord {
    tenantId: string;
    employeeId: string;
    punchDate: Date;
    punchTime: Date;
    punchType: string;
    device: string;
    location: string;
    isVerified: boolean;
    notes: string | null;
  }

  const punchRecords: PunchRecord[] = [];

  for (let empIdx = 0; empIdx < Math.min(employees.length, 6); empIdx++) {
    const emp = employees[empIdx];
    const assignedShift = shifts[empIdx % shifts.length];
    const startHour = parseInt(assignedShift.startTime.split(':')[0], 10);
    const endHour = parseInt(assignedShift.endTime.split(':')[0], 10);

    for (let dayIdx = 0; dayIdx < punchDates.length; dayIdx++) {
      const dateStr = punchDates[dayIdx];
      const device = devices[empIdx % devices.length];
      const location = locations[empIdx % locations.length];

      // Slight variation in clock-in times (0-10 min late)
      const clockInOffset = (empIdx + dayIdx) % 11;
      // Slight variation in clock-out times (0-15 min after shift end)
      const clockOutOffset = ((empIdx * 3) + dayIdx) % 16;

      // Clock-in punch
      punchRecords.push({
        tenantId,
        employeeId: emp.id,
        punchDate: new Date(dateStr),
        punchTime: buildDateTime(dateStr, startHour, clockInOffset),
        punchType: 'CLOCK_IN',
        device,
        location,
        isVerified: true,
        notes: clockInOffset > 5 ? 'Arrived slightly late due to traffic' : null,
      });

      // Clock-out punch
      const actualEndHour = endHour < startHour ? endHour + 24 : endHour; // handle night shift wrap
      const outDate = endHour < startHour
        ? new Date(new Date(dateStr).getTime() + 86400000) // next day
        : new Date(dateStr);
      const outDateStr = outDate.toISOString().split('T')[0];

      punchRecords.push({
        tenantId,
        employeeId: emp.id,
        punchDate: new Date(dateStr),
        punchTime: buildDateTime(outDateStr, endHour, clockOutOffset),
        punchType: 'CLOCK_OUT',
        device,
        location,
        isVerified: true,
        notes: null,
      });
    }
  }

  // Batch create punches
  await prisma.attendancePunch.createMany({
    data: punchRecords,
    skipDuplicates: true,
  });
  console.log(`    ✅ ${punchRecords.length} attendance punches created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ATTENDANCE RECORDS (daily summary for 5 working days)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating attendance records...');

  const statusOptions = ['PRESENT', 'LATE', 'PRESENT', 'PRESENT', 'HALF_DAY'];

  let recordCount = 0;
  for (let empIdx = 0; empIdx < Math.min(employees.length, 6); empIdx++) {
    const emp = employees[empIdx];
    const assignedShift = shifts[empIdx % shifts.length];
    const startHour = parseInt(assignedShift.startTime.split(':')[0], 10);
    const endHour = parseInt(assignedShift.endTime.split(':')[0], 10);

    for (let dayIdx = 0; dayIdx < punchDates.length; dayIdx++) {
      const dateStr = punchDates[dayIdx];
      const date = new Date(dateStr);
      const clockInOffset = (empIdx + dayIdx) % 11;
      const clockOutOffset = ((empIdx * 3) + dayIdx) % 16;
      const status = statusOptions[(empIdx + dayIdx) % statusOptions.length];
      const isLate = clockInOffset > 5;
      const workHours = status === 'HALF_DAY' ? 4 : (status === 'LATE' ? 7.5 : 8);
      const overtimeHours = clockOutOffset > 10 ? (clockOutOffset - 10) / 60 * 2 : 0;

      const outDateStr = endHour < startHour
        ? new Date(new Date(dateStr).getTime() + 86400000).toISOString().split('T')[0]
        : dateStr;

      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          tenantId_employeeId_date: { tenantId, employeeId: emp.id, date },
        },
      });
      if (existing) continue;

      await prisma.attendanceRecord.create({
        data: {
          tenantId,
          employeeId: emp.id,
          date,
          shiftId: assignedShift.id,
          shiftStartTime: buildDateTime(dateStr, startHour, 0),
          shiftEndTime: buildDateTime(outDateStr, endHour, 0),
          clockIn: buildDateTime(dateStr, startHour, clockInOffset),
          clockOut: buildDateTime(outDateStr, endHour, clockOutOffset),
          workHours,
          breakHours: 0.5,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          status,
          isLate,
          isEarlyOut: false,
          isRegularized: false,
          approvalStatus: 'APPROVED',
          approvedBy: employees[0].id,
          approvedAt: new Date(new Date(dateStr).getTime() + 86400000),
          remarks: isLate ? 'Late arrival - traffic delay' : null,
        },
      });
      recordCount++;
    }
  }
  console.log(`    ✅ ${recordCount} attendance records created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 6. ATTENDANCE REGULARIZATIONS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating attendance regularizations...');

  const regularizationDefs = [
    {
      employeeId: employees[1].id,
      date: new Date('2025-03-17'),
      regularizationType: 'MISSED_PUNCH',
      requestedClockIn: buildDateTime('2025-03-17', 6, 5),
      requestedClockOut: buildDateTime('2025-03-17', 14, 10),
      reason: 'Biometric device was not working, missed clock-out punch',
      attachments: ['biometric-issue-screenshot.png'],
      status: 'APPROVED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-18T10:00:00Z'),
    },
    {
      employeeId: employees[2].id,
      date: new Date('2025-03-19'),
      regularizationType: 'LATE_IN',
      requestedClockIn: buildDateTime('2025-03-19', 14, 0),
      requestedClockOut: null,
      reason: 'Was at a client meeting, arrived office late. Manager approved verbally.',
      attachments: [],
      status: 'APPROVED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-20T09:00:00Z'),
    },
    {
      employeeId: employees[3].id,
      date: new Date('2025-03-20'),
      regularizationType: 'WRONG_PUNCH',
      requestedClockIn: buildDateTime('2025-03-20', 22, 0),
      requestedClockOut: buildDateTime('2025-03-21', 6, 5),
      reason: 'Accidentally punched clock-out instead of break-start',
      attachments: [],
      status: 'PENDING',
      approvedBy: null,
      approvedAt: null,
    },
    {
      employeeId: employees[4 % employees.length].id,
      date: new Date('2025-03-18'),
      regularizationType: 'EARLY_OUT',
      requestedClockIn: null,
      requestedClockOut: buildDateTime('2025-03-18', 13, 0),
      reason: 'Left early due to medical appointment, completing remaining hours next day',
      attachments: ['doctor-appointment-slip.pdf'],
      status: 'REJECTED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-19T11:00:00Z'),
      rejectionReason: 'Medical leave should be applied instead',
    },
  ];

  for (const def of regularizationDefs) {
    const existing = await prisma.attendanceRegularization.findFirst({
      where: { tenantId, employeeId: def.employeeId, date: def.date },
    });
    if (!existing) {
      await prisma.attendanceRegularization.create({
        data: {
          tenantId,
          ...def,
        },
      });
    }
  }
  console.log(`    ✅ ${regularizationDefs.length} regularization requests created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 7. OVERTIME REQUESTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating overtime requests...');

  const overtimeDefs = [
    {
      employeeId: employees[0].id,
      overtimeDate: new Date('2025-03-17'),
      startTime: buildDateTime('2025-03-17', 14, 0),
      endTime: buildDateTime('2025-03-17', 17, 0),
      totalHours: 3,
      overtimeType: 'REGULAR',
      reason: 'Critical production deployment required extended hours',
      workDescription: 'Production release monitoring and hotfix deployment',
      project: 'PROJ-AURA-001',
      status: 'APPROVED',
      approvedBy: employees[1 % employees.length].id,
      approvedAt: new Date('2025-03-18T09:00:00Z'),
      compensationType: 'PAID',
      actualHours: 2.75,
      verifiedBy: employees[1 % employees.length].id,
      verifiedAt: new Date('2025-03-18T10:00:00Z'),
    },
    {
      employeeId: employees[1].id,
      overtimeDate: new Date('2025-03-21'),
      startTime: buildDateTime('2025-03-21', 14, 0),
      endTime: buildDateTime('2025-03-21', 16, 30),
      totalHours: 2.5,
      overtimeType: 'REGULAR',
      reason: 'Quarter-end report preparation',
      workDescription: 'Financial data reconciliation and report generation',
      project: 'PROJ-FIN-002',
      status: 'PENDING',
      approvedBy: null,
      approvedAt: null,
      compensationType: 'COMP_OFF',
      actualHours: null,
      verifiedBy: null,
      verifiedAt: null,
    },
    {
      employeeId: employees[2 % employees.length].id,
      overtimeDate: new Date('2025-03-15'), // Saturday — weekend OT
      startTime: buildDateTime('2025-03-15', 10, 0),
      endTime: buildDateTime('2025-03-15', 16, 0),
      totalHours: 6,
      overtimeType: 'WEEKEND',
      reason: 'Client demo preparation for Monday presentation',
      workDescription: 'Prepared demo environment and rehearsed presentation',
      project: 'PROJ-SALES-003',
      status: 'APPROVED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-16T08:00:00Z'),
      compensationType: 'COMP_OFF',
      isCompensated: true,
      compensatedAt: new Date('2025-03-20T00:00:00Z'),
      actualHours: 5.5,
      verifiedBy: employees[0].id,
      verifiedAt: new Date('2025-03-17T09:00:00Z'),
    },
    {
      employeeId: employees[3 % employees.length].id,
      overtimeDate: new Date('2025-03-16'), // Holiday OT
      startTime: buildDateTime('2025-03-16', 9, 0),
      endTime: buildDateTime('2025-03-16', 13, 0),
      totalHours: 4,
      overtimeType: 'HOLIDAY',
      reason: 'Emergency server maintenance during public holiday',
      workDescription: 'Database migration and server patching',
      project: 'PROJ-INFRA-004',
      status: 'COMPLETED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-16T14:00:00Z'),
      compensationType: 'PAID',
      isCompensated: true,
      compensatedAt: new Date('2025-03-20T00:00:00Z'),
      actualHours: 4,
      verifiedBy: employees[0].id,
      verifiedAt: new Date('2025-03-17T09:00:00Z'),
    },
  ];

  for (const def of overtimeDefs) {
    const existing = await prisma.overtimeRequest.findFirst({
      where: { tenantId, employeeId: def.employeeId, overtimeDate: def.overtimeDate },
    });
    if (!existing) {
      await prisma.overtimeRequest.create({
        data: { tenantId, ...def },
      });
    }
  }
  console.log(`    ✅ ${overtimeDefs.length} overtime requests created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 8. COMP-OFF REQUESTS (CompOffRequest model)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating comp-off requests...');

  const compOffRequestDefs = [
    {
      employeeId: employees[2 % employees.length].id,
      earnedDate: new Date('2025-03-15'),
      earnedHours: 6,
      status: 'APPROVED',
      appliedDate: new Date('2025-03-24'),
      expiryDate: new Date('2025-06-15'),
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-17T10:00:00Z'),
      remarks: 'Comp-off earned for weekend work on client demo',
    },
    {
      employeeId: employees[3 % employees.length].id,
      earnedDate: new Date('2025-03-16'),
      earnedHours: 4,
      status: 'EARNED',
      appliedDate: null,
      expiryDate: new Date('2025-06-16'),
      approvedBy: null,
      approvedAt: null,
      remarks: 'Earned from holiday emergency maintenance',
    },
    {
      employeeId: employees[0].id,
      earnedDate: new Date('2025-03-17'),
      earnedHours: 3,
      status: 'AVAILED',
      appliedDate: new Date('2025-03-20'),
      expiryDate: new Date('2025-06-17'),
      approvedBy: employees[1 % employees.length].id,
      approvedAt: new Date('2025-03-18T08:30:00Z'),
      remarks: 'Comp-off for extra hours on production deployment',
    },
  ];

  for (const def of compOffRequestDefs) {
    const existing = await prisma.compOffRequest.findFirst({
      where: { tenantId, employeeId: def.employeeId, earnedDate: def.earnedDate },
    });
    if (!existing) {
      await prisma.compOffRequest.create({
        data: { tenantId, ...def },
      });
    }
  }
  console.log(`    ✅ ${compOffRequestDefs.length} comp-off requests created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 9. COMP-OFF EARNED (CompOffEarned model)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating comp-off earned records...');

  const compOffEarnedDefs = [
    {
      employeeId: employees[2 % employees.length].id,
      workedDate: new Date('2025-03-15'),
      workedHours: 6,
      reason: 'Worked on Saturday for client demo preparation. Full day credited.',
      projectCode: 'PROJ-SALES-003',
      creditedDays: 1.0,
      expiryDate: new Date('2025-06-15'),
      isUsed: false,
      remainingDays: 1.0,
      status: 'APPROVED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-17T10:00:00Z'),
    },
    {
      employeeId: employees[3 % employees.length].id,
      workedDate: new Date('2025-03-16'),
      workedHours: 4,
      reason: 'Emergency server maintenance during public holiday. Half day credited.',
      projectCode: 'PROJ-INFRA-004',
      creditedDays: 0.5,
      expiryDate: new Date('2025-06-16'),
      isUsed: false,
      remainingDays: 0.5,
      status: 'APPROVED',
      approvedBy: employees[0].id,
      approvedAt: new Date('2025-03-17T09:30:00Z'),
    },
    {
      employeeId: employees[0].id,
      workedDate: new Date('2025-03-17'),
      workedHours: 3,
      reason: 'Extended hours for production deployment. Half day credited.',
      projectCode: 'PROJ-AURA-001',
      creditedDays: 0.5,
      expiryDate: new Date('2025-06-17'),
      isUsed: true,
      usedDate: new Date('2025-03-20'),
      remainingDays: 0,
      status: 'USED',
      approvedBy: employees[1 % employees.length].id,
      approvedAt: new Date('2025-03-18T08:30:00Z'),
    },
    {
      employeeId: employees[1].id,
      workedDate: new Date('2025-03-10'),
      workedHours: 8,
      reason: 'Worked full day on weekend for quarterly infrastructure audit.',
      projectCode: 'PROJ-INFRA-005',
      creditedDays: 1.0,
      expiryDate: new Date('2025-06-10'),
      isUsed: false,
      remainingDays: 1.0,
      status: 'PENDING',
    },
  ];

  for (const def of compOffEarnedDefs) {
    const existing = await prisma.compOffEarned.findFirst({
      where: { tenantId, employeeId: def.employeeId, workedDate: def.workedDate },
    });
    if (!existing) {
      await prisma.compOffEarned.create({
        data: { tenantId, ...def },
      });
    }
  }
  console.log(`    ✅ ${compOffEarnedDefs.length} comp-off earned records created`);

  // ──────────────────────────────────────────────────────────────────────────
  // 10. SHIFT SWAP REQUESTS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('    - Creating shift swap requests...');

  if (employees.length >= 4) {
    const shiftSwapDefs = [
      {
        requestorId: employees[0].id,
        swapWithId: employees[1].id,
        requestorDate: new Date('2025-03-24'),
        requestorShiftId: shifts[0].id,
        swapWithDate: new Date('2025-03-24'),
        swapWithShiftId: shifts[1].id,
        reason: 'Need to attend morning medical appointment, requesting evening shift swap',
        status: 'APPROVED_BY_MANAGER',
        swapWithApproval: 'APPROVED',
        managerApproval: 'APPROVED',
        approvedBy: employees[2 % employees.length].id,
        approvedAt: new Date('2025-03-21T14:00:00Z'),
      },
      {
        requestorId: employees[2 % employees.length].id,
        swapWithId: employees[3 % employees.length].id,
        requestorDate: new Date('2025-03-25'),
        requestorShiftId: shifts[2 % shifts.length].id,
        swapWithDate: new Date('2025-03-25'),
        swapWithShiftId: shifts[0].id,
        reason: 'Family event in the morning, requesting to switch to morning shift',
        status: 'PENDING',
        swapWithApproval: 'PENDING',
        managerApproval: 'PENDING',
      },
      {
        requestorId: employees[1].id,
        swapWithId: employees[3 % employees.length].id,
        requestorDate: new Date('2025-03-26'),
        requestorShiftId: shifts[1].id,
        swapWithDate: new Date('2025-03-26'),
        swapWithShiftId: shifts[0].id,
        reason: 'Personal commitment in the evening, need morning shift',
        status: 'REJECTED',
        swapWithApproval: 'APPROVED',
        managerApproval: 'REJECTED',
        approvedBy: employees[0].id,
        approvedAt: new Date('2025-03-22T10:00:00Z'),
        rejectionReason: 'Minimum staffing requirements not met for evening shift on this date',
      },
    ];

    for (const def of shiftSwapDefs) {
      const existing = await prisma.shiftSwapRequest.findFirst({
        where: {
          tenantId,
          requestorId: def.requestorId,
          requestorDate: def.requestorDate,
        },
      });
      if (!existing) {
        await prisma.shiftSwapRequest.create({
          data: { tenantId, ...def },
        });
      }
    }
    console.log(`    ✅ ${shiftSwapDefs.length} shift swap requests created`);
  } else {
    console.log('    ⚠️ Need at least 4 employees for shift swaps. Skipping.');
  }

  console.log('  ✅ Attendance & Time Management data seeded successfully');
}

// Run if executed directly
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.argv[2] || 'default-tenant';
  seedAttendanceTime(_prisma, tenantId)
    .catch((e) => {
      console.error('❌ Error seeding attendance & time data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await _prisma.$disconnect();
    });
}
