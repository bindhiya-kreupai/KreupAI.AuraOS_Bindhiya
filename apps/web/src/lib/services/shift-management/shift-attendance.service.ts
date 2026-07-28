import { prisma } from '@aura/database';

export type ClockResult = {
  punchId: string;
  status: 'ON_TIME' | 'LATE' | 'EARLY_OUT' | 'PRESENT';
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  breakMinutes: number;
  workMinutes: number;
  shiftId: string | null;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
};

export class ShiftAttendanceService {
  async processClockIn(
    tenantId: string,
    employeeId: string,
    clockInTime: Date
  ): Promise<ClockResult> {
    const today = new Date(
      clockInTime.getFullYear(),
      clockInTime.getMonth(),
      clockInTime.getDate()
    );
    const shiftAssignment = await (prisma as any).shiftAssignment.findFirst({
      where: {
        tenantId,
        employeeId,
        isActive: true,
        effectiveFrom: { lte: clockInTime },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: clockInTime } }],
      },
      include: { shift: true },
    });

    let lateMinutes = 0;
    let shiftStartTime: string | null = null;
    let shiftEndTime: string | null = null;
    let shiftId: string | null = null;

    if (shiftAssignment) {
      shiftId = shiftAssignment.shiftId;
      shiftStartTime = shiftAssignment.shift.startTime;
      shiftEndTime = shiftAssignment.shift.endTime;
      const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);
      const graceMinutes = shiftAssignment.shift.graceInMinutes || 0;
      const shiftStart = new Date(today);
      shiftStart.setHours(shiftHour, shiftMin + graceMinutes, 0, 0);
      if (clockInTime > shiftStart) {
        lateMinutes = Math.floor((clockInTime.getTime() - shiftStart.getTime()) / (1000 * 60));
      }
    }

    const status = lateMinutes > 0 ? 'LATE' : 'ON_TIME';

    const punch = await prisma.attendancePunch.create({
      data: {
        tenantId,
        employeeId,
        punchDate: today,
        punchTime: clockInTime,
        punchType: 'CLOCK_IN',
        device: 'WEB',
      },
    });

    await prisma.attendanceRecord.upsert({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
      create: {
        tenantId,
        employeeId,
        date: today,
        shiftId,
        shiftStartTime: shiftStartTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftStartTime}:00`)
          : null,
        shiftEndTime: shiftEndTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftEndTime}:00`)
          : null,
        clockIn: clockInTime,
        status: status === 'LATE' ? 'LATE' : 'PRESENT',
        isLate: status === 'LATE',
        approvalStatus: 'PENDING',
      },
      update: {
        clockIn: clockInTime,
        shiftId: shiftId || undefined,
        shiftStartTime: shiftStartTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftStartTime}:00`)
          : undefined,
        shiftEndTime: shiftEndTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftEndTime}:00`)
          : undefined,
        isLate: status === 'LATE',
        status: status === 'LATE' ? 'LATE' : 'PRESENT',
      },
    });

    return {
      punchId: punch.id,
      status,
      lateMinutes,
      earlyLeaveMinutes: 0,
      overtimeMinutes: 0,
      breakMinutes: 0,
      workMinutes: 0,
      shiftId,
      shiftStartTime,
      shiftEndTime,
    };
  }

  async processClockOut(
    tenantId: string,
    employeeId: string,
    clockOutTime: Date
  ): Promise<ClockResult> {
    const today = new Date(
      clockOutTime.getFullYear(),
      clockOutTime.getMonth(),
      clockOutTime.getDate()
    );

    const clockInPunch = await prisma.attendancePunch.findFirst({
      where: { tenantId, employeeId, punchDate: today, punchType: 'CLOCK_IN' },
      orderBy: { punchTime: 'desc' },
    });

    if (!clockInPunch) {
      throw new Error('No clock-in record found for today');
    }

    const existingClockOut = await prisma.attendancePunch.findFirst({
      where: {
        tenantId,
        employeeId,
        punchDate: today,
        punchType: 'CLOCK_OUT',
        punchTime: { gt: clockInPunch.punchTime },
      },
    });

    if (existingClockOut) {
      throw new Error('Already clocked out for today');
    }

    const punch = await prisma.attendancePunch.create({
      data: {
        tenantId,
        employeeId,
        punchDate: today,
        punchTime: clockOutTime,
        punchType: 'CLOCK_OUT',
        device: 'WEB',
      },
    });

    const workDurationMinutes = Math.floor(
      (clockOutTime.getTime() - clockInPunch.punchTime.getTime()) / (1000 * 60)
    );

    const shiftAssignment = await (prisma as any).shiftAssignment.findFirst({
      where: {
        tenantId,
        employeeId,
        isActive: true,
        effectiveFrom: { lte: clockOutTime },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: clockOutTime } }],
      },
      include: { shift: true },
    });

    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let overtimeMinutes = 0;
    let expectedWorkMinutes = 480;
    let shiftId: string | null = null;
    let shiftStartTime: string | null = null;
    let shiftEndTime: string | null = null;
    let configBreakMinutes = 0;

    if (shiftAssignment) {
      shiftId = shiftAssignment.shiftId;
      shiftStartTime = shiftAssignment.shift.startTime;
      shiftEndTime = shiftAssignment.shift.endTime;
      expectedWorkMinutes = Math.round(shiftAssignment.shift.workHours * 60);
      configBreakMinutes = shiftAssignment.shift.breakDuration || 0;

      const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);
      const graceIn = shiftAssignment.shift.graceInMinutes || 0;
      const expectedStart = new Date(today);
      expectedStart.setHours(shiftHour, shiftMin + graceIn, 0, 0);
      if (clockInPunch.punchTime > expectedStart) {
        lateMinutes = Math.floor(
          (clockInPunch.punchTime.getTime() - expectedStart.getTime()) / (1000 * 60)
        );
      }

      const [endHour, endMin] = shiftEndTime.split(':').map(Number);
      const graceOut = shiftAssignment.shift.graceOutMinutes || 0;
      const expectedEnd = new Date(today);
      expectedEnd.setHours(endHour, endMin - graceOut, 0, 0);
      if (clockOutTime < expectedEnd) {
        earlyLeaveMinutes = Math.floor(
          (expectedEnd.getTime() - clockOutTime.getTime()) / (1000 * 60)
        );
      }

      if (shiftAssignment.shift.overtimeAllowed) {
        overtimeMinutes = workDurationMinutes - expectedWorkMinutes;
        const maxOt = shiftAssignment.shift.maxOvertimeHours || 0;
        if (maxOt > 0) {
          overtimeMinutes = Math.min(overtimeMinutes, Math.round(maxOt * 60));
        }
      }
    } else {
      if (workDurationMinutes > expectedWorkMinutes) {
        overtimeMinutes = workDurationMinutes - expectedWorkMinutes;
      }
    }

    const breakPunches = await prisma.attendancePunch.findMany({
      where: {
        tenantId,
        employeeId,
        punchDate: today,
        punchType: { in: ['BREAK_START', 'BREAK_END'] },
      },
      orderBy: { punchTime: 'asc' },
    });

    let actualBreakMinutes = 0;
    for (let i = 0; i < breakPunches.length - 1; i += 2) {
      if (
        breakPunches[i].punchType === 'BREAK_START' &&
        breakPunches[i + 1]?.punchType === 'BREAK_END'
      ) {
        actualBreakMinutes += Math.floor(
          (breakPunches[i + 1].punchTime.getTime() - breakPunches[i].punchTime.getTime()) /
            (1000 * 60)
        );
      }
    }

    const totalBreakMinutes = actualBreakMinutes > 0 ? actualBreakMinutes : configBreakMinutes;
    const netWorkMinutes = workDurationMinutes - totalBreakMinutes;

    const workHours = parseFloat((netWorkMinutes / 60).toFixed(2));
    const breakHours = parseFloat((totalBreakMinutes / 60).toFixed(2));
    const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

    const status = lateMinutes > 0 ? 'LATE' : earlyLeaveMinutes > 0 ? 'EARLY_OUT' : 'PRESENT';

    await prisma.attendanceRecord.upsert({
      where: { tenantId_employeeId_date: { tenantId, employeeId, date: today } },
      create: {
        tenantId,
        employeeId,
        date: today,
        shiftId,
        shiftStartTime: shiftStartTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftStartTime}:00`)
          : null,
        shiftEndTime: shiftEndTime
          ? new Date(`${today.toISOString().split('T')[0]}T${shiftEndTime}:00`)
          : null,
        clockIn: clockInPunch.punchTime,
        clockOut: clockOutTime,
        workHours,
        breakHours,
        overtimeHours,
        status,
        isLate: lateMinutes > 0,
        isEarlyOut: earlyLeaveMinutes > 0,
        approvalStatus: 'PENDING',
      },
      update: {
        clockOut: clockOutTime,
        workHours,
        breakHours,
        overtimeHours,
        shiftId: shiftId || undefined,
        isLate: lateMinutes > 0,
        isEarlyOut: earlyLeaveMinutes > 0,
        status,
      },
    });

    return {
      punchId: punch.id,
      status,
      lateMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      breakMinutes: totalBreakMinutes,
      workMinutes: netWorkMinutes,
      shiftId,
      shiftStartTime,
      shiftEndTime,
    };
  }

  async detectAbsences(
    tenantId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<{ employeeId: string; employeeName: string; shiftName: string; date: Date }[]> {
    const rosters = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: { gte: dateFrom, lte: dateTo },
        isWeekOff: false,
        isHoliday: false,
        isDeleted: false,
      },
      include: { shift: { select: { name: true } } },
    });

    const results: { employeeId: string; employeeName: string; shiftName: string; date: Date }[] =
      [];

    for (const roster of rosters) {
      const record = await prisma.attendanceRecord.findUnique({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: roster.employeeId,
            date: roster.rosterDate,
          },
        },
      });

      if (!record || record.status === 'ABSENT') {
        const emp = await prisma.employee.findUnique({
          where: { id: roster.employeeId },
          select: { firstName: true, lastName: true, employeeCode: true },
        });
        results.push({
          employeeId: roster.employeeId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : roster.employeeId,
          shiftName: roster.shift?.name || '—',
          date: roster.rosterDate,
        });
      }
    }

    return results;
  }

  async detectMissingPunches(
    tenantId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<
    {
      employeeId: string;
      employeeName: string;
      shiftName: string;
      date: Date;
      hasClockIn: boolean;
      hasClockOut: boolean;
    }[]
  > {
    const rosters = await prisma.shiftRoster.findMany({
      where: {
        tenantId,
        rosterDate: { gte: dateFrom, lte: dateTo },
        isWeekOff: false,
        isHoliday: false,
        isDeleted: false,
      },
      include: { shift: { select: { name: true } } },
    });

    const results: {
      employeeId: string;
      employeeName: string;
      shiftName: string;
      date: Date;
      hasClockIn: boolean;
      hasClockOut: boolean;
    }[] = [];

    for (const roster of rosters) {
      const record = await prisma.attendanceRecord.findUnique({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: roster.employeeId,
            date: roster.rosterDate,
          },
        },
      });

      if (!record || !record.clockIn || !record.clockOut) {
        const emp = await prisma.employee.findUnique({
          where: { id: roster.employeeId },
          select: { firstName: true, lastName: true, employeeCode: true },
        });
        results.push({
          employeeId: roster.employeeId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : roster.employeeId,
          shiftName: roster.shift?.name || '—',
          date: roster.rosterDate,
          hasClockIn: !!record?.clockIn,
          hasClockOut: !!record?.clockOut,
        });
      }
    }

    return results;
  }
}

export const shiftAttendanceService = new ShiftAttendanceService();
