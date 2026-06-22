// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
// Attendance Module Services - API Integrated
import { APIClient } from '@/lib/api-client';
import type {
  Shift,
  ShiftAssignment,
  AttendanceRecord,
  AttendanceCheck,
  AttendanceRegularization,
  OvertimeRequest,
  BiometricDevice,
  AttendancePolicy,
  WorkLocation,
  WFHRequest,
  AttendanceMetrics,
  AttendanceSettings,
  MonthlyAttendanceReport,
} from './types';

type TimesheetApiEntry = {
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  hours?: number;
  status?: string;
};

type TimesheetApiResponse = {
  id: string;
  employeeId: string;
  employeeName?: string;
  weekEnding: string;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  status?: string;
  entries?: TimesheetApiEntry[];
  submittedAt?: string;
};

type CompOffApiResponse = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  workDate?: string;
  workHours?: number;
  reason?: string;
  status?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedAt?: string;
  earnedDate?: string;
  expiryDate?: string;
  balance?: number;
  used?: number;
  usedOn?: string;
  remarks?: string;
};

type CompOffSummaryResponse = {
  total?: number;
  earned?: number;
  used?: number;
  pending?: number;
  expiring?: number;
  totalEarned?: number;
  totalUsed?: number;
  balance?: number;
};

type ShiftSwapApiResponse = {
  id: string;
  requestorId?: string;
  requestorName?: string;
  targetEmployeeId?: string;
  targetEmployeeName?: string;
  requestorDate?: string;
  targetDate?: string;
  reason?: string;
  status?: string;
  requestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  requestorShiftId?: string;
  requestorTime?: string;
  requestorShiftType?: string;
  requestorLocation?: string;
};

type ScheduleApiResponse = {
  id: string;
  employeeId: string;
  employeeName?: string;
  shiftId: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  isActive?: boolean;
};

type WFHApiResponse = {
  id: string;
  requestCode?: string;
  employeeId?: string;
  employeeName?: string;
  startDate?: string;
  endDate?: string;
  numberOfDays?: number;
  reason?: string;
  isRecurring?: boolean;
  recurringDays?: number[];
  status?: string;
  submittedDate?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvedDate?: string;
  requestedAt?: string;
  rejectionReason?: string;
  requiresCheckIn?: boolean;
  checkInRequired?: string;
  checkOutRequired?: string;
};

type RosterApiResponse = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  shiftId?: string;
  shiftName?: string;
  shiftTime?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  recurringDays?: number[];
  status?: string;
  department?: string;
};

type OvertimeApiResponse = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  overtimeDate?: string | Date;
  startTime?: string | Date;
  endTime?: string | Date;
  totalHours?: number;
  actualHours?: number;
  overtimeType?: string;
  reason?: string;
  workDescription?: string;
  status?: string;
  approvedBy?: string;
  approvedAt?: string | Date;
  rejectionReason?: string;
  createdAt?: string | Date;
  paymentAmount?: number;
  compOffGranted?: boolean;
};

type ExceptionApiResponse = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  date?: string;
  type?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workHours?: number | null;
  status?: string | null;
  isRegularized?: boolean;
  remarks?: string | null;
};

type CompOffManagementApiResponse = {
  id: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  earnedDate?: string;
  earnedHours?: number;
  status?: string;
  appliedDate?: string | null;
  expiryDate?: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  remarks?: string | null;
  createdAt?: string;
};

export type DashboardTimesheet = {
  id: string;
  employeeId: string;
  employeeName: string;
  weekEnding: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: string;
  entries: Array<{
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    hours: number;
    status: string;
  }>;
  submittedAt?: string;
};

type RegularizationApiResponse = {
  id: string;
  employeeId?: string | null;
  employeeName?: string | null;
  date?: string | Date | null;
  type?: string | null;
  regularizationType?: string | null;
  requestedClockIn?: string | null;
  requestedClockOut?: string | null;
  reason?: string | null;
  status?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | Date | null;
  rejectionReason?: string | null;
  createdAt?: string | Date | null;
  attachments?: string[] | null;
};

const REGULARIZATION_TYPE_MAP: Record<string, AttendanceRegularization['regularizationType']> = {
  MISSED_PUNCH: 'missed_punch',
  MISSEDPUNCH: 'missed_punch',
  LATE_IN: 'late_arrival',
  LATE_ARRIVAL: 'late_arrival',
  LATE_ENTRY: 'late_arrival',
  EARLY_OUT: 'early_departure',
  EARLY_DEPARTURE: 'early_departure',
  EARLY_EXIT: 'early_departure',
  WRONG_PUNCH: 'incorrect_punch',
  INCORRECT_PUNCH: 'incorrect_punch',
  MANUAL_ENTRY: 'incorrect_punch',
  ON_DUTY: 'incorrect_punch',
};

const REGULARIZATION_STATUS_MAP: Record<string, AttendanceRegularization['status']> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

function normalizeRegularizationType(
  value?: string | null
): AttendanceRegularization['regularizationType'] {
  if (!value) {
    return 'missed_punch';
  }

  return REGULARIZATION_TYPE_MAP[value.trim().toUpperCase().replace(/\s+/g, '_')] || 'missed_punch';
}

function normalizeRegularizationStatus(value?: string | null): AttendanceRegularization['status'] {
  if (!value) {
    return 'pending';
  }

  return REGULARIZATION_STATUS_MAP[value.trim().toUpperCase()] || 'pending';
}

function normalizeDateValue(value?: string | Date | null): string {
  if (!value) {
    return '';
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function mapRegularization(raw: RegularizationApiResponse): AttendanceRegularization {
  return {
    id: raw.id,
    requestCode: raw.id,
    employeeId: raw.employeeId || '',
    employeeName: raw.employeeName || 'Unknown Employee',
    managerId: raw.approvedBy || '',
    managerName: '',
    date: normalizeDateValue(raw.date),
    regularizationType: normalizeRegularizationType(raw.type || raw.regularizationType),
    scheduledIn: '',
    scheduledOut: '',
    requestedIn: raw.requestedClockIn || undefined,
    requestedOut: raw.requestedClockOut || undefined,
    reason: raw.reason || '',
    status: normalizeRegularizationStatus(raw.status),
    submittedDate: normalizeDateValue(raw.createdAt || raw.date),
    reviewedBy: raw.approvedBy || undefined,
    reviewedDate: raw.approvedAt ? normalizeDateValue(raw.approvedAt) : undefined,
    reviewComments: raw.rejectionReason || undefined,
    attachments: raw.attachments || [],
  };
}

function normalizeCompOffStatus(status?: string | null): string {
  return status?.trim().toUpperCase() || 'PENDING';
}

function mapCompOff(raw: CompOffApiResponse) {
  return {
    id: raw.id,
    employeeId: raw.employeeId || '',
    employeeName: raw.employeeName || 'Unknown Employee',
    workDate: raw.workDate || '',
    workHours: raw.workHours || 0,
    reason: raw.reason || '',
    status: normalizeCompOffStatus(raw.status),
    approvedBy: raw.approvedBy,
    approvedAt: raw.approvedAt,
    requestedAt: raw.requestedAt,
    earnedDate: raw.earnedDate,
    expiryDate: raw.expiryDate,
    balance: raw.balance ?? 0,
    used: raw.used ?? 0,
    usedOn: raw.usedOn,
    remarks: raw.remarks,
  };
}

function normalizeCompOffPayload(compOff: {
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
}) {
  const payload: Record<string, unknown> = {
    workDate: compOff.date,
    workHours: compOff.hours,
    reason: compOff.reason,
  };

  if (compOff.employeeId && !['current-user', 'current-user-id'].includes(compOff.employeeId)) {
    payload.employeeId = compOff.employeeId;
  }

  return payload;
}

function normalizePlaceholderEmployeeId(employeeId?: string) {
  if (!employeeId || ['current-user', 'current-user-id'].includes(employeeId)) {
    return undefined;
  }

  return employeeId;
}

function inferShiftCardType(
  shiftName?: string,
  startTime?: string
): 'Morning' | 'Evening' | 'Night' {
  const normalizedName = shiftName?.toLowerCase() || '';

  if (normalizedName.includes('night')) {
    return 'Night';
  }

  if (normalizedName.includes('evening') || normalizedName.includes('afternoon')) {
    return 'Evening';
  }

  const hour = Number.parseInt(startTime?.split(':')[0] || '', 10);

  if (!Number.isNaN(hour)) {
    if (hour >= 18 || hour < 6) {
      return 'Night';
    }

    if (hour >= 12) {
      return 'Evening';
    }
  }

  return 'Morning';
}

function mapShiftSwapStatus(status?: string | null): 'Scheduled' | 'Swap Requested' | 'Swapped' {
  switch ((status || '').trim().toUpperCase()) {
    case 'PENDING':
      return 'Swap Requested';
    case 'APPROVED':
    case 'APPROVED_BY_PEER':
    case 'APPROVED_BY_MANAGER':
    case 'COMPLETED':
      return 'Swapped';
    default:
      return 'Scheduled';
  }
}

function avatarClassForSwap(name?: string): string {
  const palette = [
    'bg-celestial-indigo',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-sky-500',
  ];
  const source = (name || 'A').charCodeAt(0);
  return palette[source % palette.length];
}

function mapMarketplaceSwap(raw: ShiftSwapApiResponse) {
  return {
    id: raw.id,
    offeredBy: {
      name: raw.requestorName || 'Unknown Employee',
      role: 'Colleague',
      avatar: avatarClassForSwap(raw.requestorName),
    },
    date: raw.requestorDate || '',
    time: raw.requestorTime || '09:00 - 18:00',
    type: raw.requestorShiftType
      ? inferShiftCardType(raw.requestorShiftType, raw.requestorTime?.split(' - ')[0])
      : 'Morning',
    reason: raw.reason || 'Shift swap request',
  };
}

function normalizeWFHStatus(status?: string | null): WFHRequest['status'] {
  const normalized = status?.trim().toUpperCase();

  switch (normalized) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function differenceInDaysInclusive(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / (24 * 60 * 60 * 1000)) + 1;
}

function mapWFHRequest(raw: WFHApiResponse): WFHRequest {
  return {
    id: raw.id,
    requestCode: raw.requestCode || raw.id,
    employeeId: raw.employeeId || '',
    employeeName: raw.employeeName || 'Unknown Employee',
    managerId: raw.approvedBy || '',
    managerName: '',
    startDate: raw.startDate || '',
    endDate: raw.endDate || raw.startDate || '',
    numberOfDays:
      raw.numberOfDays ?? differenceInDaysInclusive(raw.startDate, raw.endDate || raw.startDate),
    reason: raw.reason || '',
    status: normalizeWFHStatus(raw.status),
    submittedDate: raw.submittedDate || raw.createdAt || '',
    approvedBy: raw.approvedBy || undefined,
    approvedDate: raw.approvedAt || raw.approvedDate || undefined,
    rejectionReason: raw.rejectionReason || undefined,
    requiresCheckIn: raw.requiresCheckIn ?? false,
    checkInRequired: raw.checkInRequired || undefined,
    checkOutRequired: raw.checkOutRequired || undefined,
    workPlan: '',
    contactNumber: '',
    emergencyContact: '',
    isRecurring: raw.isRecurring || false,
    recurringPattern: raw.recurringDays?.length ? raw.recurringDays.join(',') : undefined,
  };
}

function normalizeWFHPayload(request: Partial<WFHRequest>) {
  const payload: Record<string, unknown> = {
    startDate: request.startDate,
    endDate: request.endDate,
    reason: request.reason,
    isRecurring: request.isRecurring || false,
  };

  if (request.recurringPattern) {
    payload.recurringDays = request.recurringPattern
      .split(',')
      .map((value: any) => Number.parseInt(value.trim(), 10))
      .filter((value: any) => !Number.isNaN(value));
  }

  const employeeId = normalizePlaceholderEmployeeId(request.employeeId);
  if (employeeId) {
    payload.employeeId = employeeId;
  }

  return payload;
}

function mapRosterShiftCode(raw: RosterApiResponse): string {
  const normalizedShiftName = raw.shiftName?.toLowerCase() || '';

  if (normalizedShiftName.includes('week off') || normalizedShiftName.includes('off')) {
    return 'WO';
  }

  if (normalizedShiftName.includes('night')) {
    return 'N';
  }

  if (normalizedShiftName.includes('morning')) {
    return 'M';
  }

  return 'G';
}

function mapRosterRow(raw: RosterApiResponse) {
  const assignedCode = mapRosterShiftCode(raw);
  const recurringDays = raw.recurringDays || [];
  const shifts = Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    if (raw.isRecurring) {
      return recurringDays.includes(dayNumber) ? assignedCode : 'WO';
    }

    return index === 0 ? assignedCode : '';
  });

  return {
    id: raw.id,
    employeeId: raw.employeeId || raw.id,
    employeeName: raw.employeeName || 'Unknown Employee',
    name: raw.employeeName || 'Unknown Employee',
    role: raw.department || raw.shiftName || '',
    department: raw.department || '',
    shiftId: raw.shiftId || '',
    shiftName: raw.shiftName || '',
    shiftTime: raw.shiftTime || '',
    startDate: raw.startDate || '',
    endDate: raw.endDate || raw.startDate || '',
    isRecurring: raw.isRecurring || false,
    recurringDays,
    status: raw.status || 'ACTIVE',
    shifts,
  };
}

function normalizeOvertimeStatus(status?: string | null): OvertimeRequest['status'] {
  const normalized = status?.trim().toUpperCase();

  switch (normalized) {
    case 'APPROVED':
      return 'approved';
    case 'REJECTED':
      return 'rejected';
    case 'PAID':
      return 'paid';
    case 'COMP_OFF_GRANTED':
    case 'COMP_OFF_GRANT':
      return 'comp_off_granted';
    default:
      return 'pending';
  }
}

function normalizeOvertimeType(value?: string | null): OvertimeRequest['overtimeType'] {
  const normalized = value?.trim().toUpperCase();

  switch (normalized) {
    case 'WEEKEND':
      return 'weekend';
    case 'HOLIDAY':
      return 'holiday';
    case 'COMPENSATORY':
    case 'COMP_OFF':
      return 'compensatory';
    default:
      return 'regular';
  }
}

function mapOvertimeRequest(raw: OvertimeApiResponse): OvertimeRequest {
  return {
    id: raw.id,
    requestCode: raw.id,
    employeeId: raw.employeeId || '',
    employeeName: raw.employeeName || 'Unknown Employee',
    managerId: raw.approvedBy || '',
    managerName: '',
    date: normalizeDateValue(raw.overtimeDate),
    overtimeType: normalizeOvertimeType(raw.overtimeType),
    startTime: normalizeDateValue(raw.startTime),
    endTime: normalizeDateValue(raw.endTime),
    requestedHours: raw.totalHours || 0,
    approvedHours: raw.actualHours || undefined,
    reason: raw.reason || '',
    workDescription: raw.workDescription || '',
    status: normalizeOvertimeStatus(raw.status),
    submittedDate: normalizeDateValue(raw.createdAt || raw.overtimeDate),
    approvedBy: raw.approvedBy || undefined,
    approvedDate: raw.approvedAt ? normalizeDateValue(raw.approvedAt) : undefined,
    rejectionReason: raw.rejectionReason || undefined,
    paymentAmount: raw.paymentAmount,
    compOffGranted: raw.compOffGranted,
  };
}

function normalizeOvertimePayload(request: Partial<OvertimeRequest> & Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    date: request.date,
    overtimeMinutes:
      typeof request.overtimeMinutes === 'number'
        ? request.overtimeMinutes
        : typeof request.requestedHours === 'number'
          ? request.requestedHours * 60
          : undefined,
    reason: request.reason,
    overtimeType: request.overtimeType,
    startTime: request.startTime,
    endTime: request.endTime,
    workDescription: request.workDescription,
    project: request.project,
    compensationType: request.compensationType,
  };

  const employeeId = normalizePlaceholderEmployeeId(
    typeof request.employeeId === 'string' ? request.employeeId : undefined
  );
  if (employeeId) {
    payload.employeeId = employeeId;
  }

  return payload;
}

function formatExceptionTypeLabel(type?: string | null): string {
  switch ((type || '').trim().toUpperCase()) {
    case 'LATE_ARRIVAL':
      return 'Late Arrival';
    case 'EARLY_DEPARTURE':
      return 'Early Departure';
    case 'MISSING_PUNCH':
      return 'Missing Punch';
    case 'SHORT_DURATION':
      return 'Short Duration';
    case 'ABSENT':
      return 'Absent';
    default:
      return 'Exception';
  }
}

function formatExceptionStatus(status?: string | null): string {
  switch ((status || '').trim().toUpperCase()) {
    case 'APPROVED':
      return 'Regularized';
    case 'REJECTED':
      return 'Deducted';
    default:
      return 'Pending';
  }
}

function formatExceptionTime(value?: string | null): string {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(11, 16);
}

function mapAttendanceException(raw: ExceptionApiResponse) {
  const displayType = formatExceptionTypeLabel(raw.type);
  let expected = '09:00 - 18:00';
  let actual = `${formatExceptionTime(raw.checkIn)} - ${formatExceptionTime(raw.checkOut)}`;

  switch ((raw.type || '').trim().toUpperCase()) {
    case 'LATE_ARRIVAL':
      expected = '09:00';
      actual = formatExceptionTime(raw.checkIn);
      break;
    case 'EARLY_DEPARTURE':
      expected = '18:00';
      actual = formatExceptionTime(raw.checkOut);
      break;
    case 'MISSING_PUNCH':
      expected = 'In/Out Required';
      actual =
        raw.checkIn || raw.checkOut
          ? `${formatExceptionTime(raw.checkIn)} / ${formatExceptionTime(raw.checkOut)}`
          : '--';
      break;
    case 'ABSENT':
      expected = 'Present';
      actual = 'Absent';
      break;
    case 'SHORT_DURATION':
      expected = 'Full Day';
      actual = raw.workHours ? `${raw.workHours} hrs` : '--';
      break;
  }

  return {
    id: raw.id,
    emp: raw.employeeName || 'Unknown Employee',
    employeeId: raw.employeeId || '',
    date: raw.date || '',
    type: displayType,
    actual,
    expected,
    status: formatExceptionStatus(raw.status),
    isRegularized: raw.isRegularized || false,
    remarks: raw.remarks || '',
  };
}

function mapCompOffManagementStatus(status?: string | null): string {
  switch ((status || '').trim().toUpperCase()) {
    case 'APPROVED':
    case 'EARNED':
      return 'Credited';
    case 'AVAILED':
      return 'Utilized';
    case 'APPLIED':
    case 'PENDING':
      return 'Pending';
    case 'EXPIRED':
      return 'Expired';
    default:
      return 'Pending';
  }
}

function mapCompOffTransaction(raw: CompOffManagementApiResponse) {
  const creditedDays = (raw.earnedHours || 0) / 8;
  const status = mapCompOffManagementStatus(raw.status);

  return {
    id: raw.id,
    dateWorked: raw.earnedDate || raw.appliedDate || raw.createdAt || '',
    reason: raw.remarks || raw.rejectionReason || 'Comp-off credit',
    credit: status === 'Utilized' ? -Math.abs(creditedDays) : creditedDays,
    expiry: raw.expiryDate || '-',
    status,
  };
}

function normalizeRegularizationPayload(
  regularization: Partial<AttendanceRegularization> & Record<string, unknown>
) {
  const typeSource = regularization.regularizationType || regularization.type || 'MISSED_PUNCH';
  const requestedClockIn =
    regularization.requestedClockIn ||
    regularization.requestedCheckIn ||
    regularization.requestedIn ||
    regularization.requestedInTime;
  const requestedClockOut =
    regularization.requestedClockOut ||
    regularization.requestedCheckOut ||
    regularization.requestedOut ||
    regularization.requestedOutTime;
  const employeeId =
    regularization.employeeId &&
    regularization.employeeId !== 'current-user' &&
    regularization.employeeId !== 'current-user-id'
      ? regularization.employeeId
      : undefined;

  return {
    action: 'submit',
    employeeId,
    date: regularization.date,
    regularizationType:
      Object.entries(REGULARIZATION_TYPE_MAP).find(([, mapped]) => mapped === typeSource)?.[0] ||
      String(typeSource).trim().toUpperCase().replace(/\s+/g, '_'),
    requestedClockIn,
    requestedClockOut,
    reason: regularization.reason,
    attachments: regularization.attachments || [],
  };
}

function mapTimesheet(raw: TimesheetApiResponse): DashboardTimesheet {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    employeeName: raw.employeeName || 'Unknown Employee',
    weekEnding: raw.weekEnding,
    totalHours: raw.totalHours || 0,
    regularHours: raw.regularHours || 0,
    overtimeHours: raw.overtimeHours || 0,
    status: String(raw.status || 'DRAFT').toUpperCase(),
    entries: (raw.entries || []).map((entry) => ({
      date: entry.date,
      checkIn: entry.checkIn || null,
      checkOut: entry.checkOut || null,
      hours: entry.hours || 0,
      status: String(entry.status || 'PRESENT').toUpperCase(),
    })),
    submittedAt: raw.submittedAt,
  };
}

// ============================================================================
// SHIFT SERVICE
// ============================================================================

export class ShiftService {
  private static endpoint = '/attendance/shifts';

  static async getShifts(): Promise<Shift[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Shift>(response, 'shifts');
    } catch (error: any) {
      return [];
    }
  }

  static async getShiftById(id: string): Promise<Shift | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<Shift>(response, 'shift');
    } catch (error: any) {
      return null;
    }
  }

  static async createShift(shift: Partial<Shift>): Promise<Shift> {
    const response = await APIClient.post<{ shift: Shift }>(this.endpoint, shift);
    return response.shift;
  }

  static async updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
    const response = await APIClient.put<{ shift: Shift }>(`${this.endpoint}/${id}`, updates);
    return response.shift;
  }

  static async deleteShift(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// ATTENDANCE RECORD SERVICE
// ============================================================================

export class AttendanceRecordService {
  private static endpoint = '/attendance';

  static async getRecords(filters?: {
    employeeId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    type?: 'records' | 'summary' | 'calendar';
  }): Promise<AttendanceRecord[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<AttendanceRecord>(response, 'records');
    } catch (error: any) {
      return [];
    }
  }

  static async getRecordById(id: string): Promise<AttendanceRecord | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/${id}`);
      return APIClient.unwrapItem<AttendanceRecord>(response, 'record');
    } catch (error: any) {
      return null;
    }
  }

  static async createRecord(record: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const response = await APIClient.post<{ record: AttendanceRecord }>(this.endpoint, record);
    return response.record;
  }

  static async updateRecord(
    id: string,
    updates: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    const response = await APIClient.put<{ record: AttendanceRecord }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.record;
  }

  static async deleteRecord(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async getMonthlyReport(
    employeeId: string,
    month: string
  ): Promise<MonthlyAttendanceReport | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, {
        employeeId,
        month,
        type: 'summary',
      });
      return APIClient.unwrapItem<MonthlyAttendanceReport>(response, 'report');
    } catch (error: any) {
      return null;
    }
  }
}

// ============================================================================
// CHECK-IN/OUT SERVICE (GPS PUNCH)
// ============================================================================

export class AttendanceCheckService {
  private static timeCaptureEndpoint = '/attendance/time-capture';

  private static mapCheck(raw: any): AttendanceCheck {
    return {
      id: raw.id,
      employeeId: raw.employeeId || '',
      employeeName: raw.employeeName || 'Unknown Employee',
      date: raw.timestamp || raw.checkTime || raw.createdAt || '',
      checkType: String(
        raw.type || raw.checkType || 'CHECK_IN'
      ).toLowerCase() as AttendanceCheck['checkType'],
      checkTime: raw.timestamp || raw.checkTime || raw.createdAt || '',
      deviceType: raw.deviceInfo?.deviceType || raw.deviceType,
      location: raw.location?.address || raw.location,
      latitude: raw.location?.latitude || raw.latitude,
      longitude: raw.location?.longitude || raw.longitude,
      isManual: false,
      photoUrl: raw.photo || raw.photoUrl,
      notes: raw.notes || undefined,
      createdDate: raw.createdAt || raw.timestamp || '',
    };
  }

  static async recordCheck(check: Partial<AttendanceCheck>): Promise<AttendanceCheck> {
    const response = await APIClient.post<{ data?: any }>(this.timeCaptureEndpoint, check);
    return this.mapCheck(response.data || {});
  }

  static async getChecks(filters?: {
    employeeId?: string;
    date?: string;
  }): Promise<AttendanceCheck[]> {
    try {
      const response = await APIClient.get<{ data?: { captures?: any[] } }>(
        this.timeCaptureEndpoint,
        filters
      );
      return (response.data?.captures || []).map((capture) => this.mapCheck(capture));
    } catch (error: any) {
      return [];
    }
  }

  static async getTodayCheck(employeeId: string): Promise<AttendanceCheck | null> {
    const today = new Date().toISOString().split('T')[0];
    const checks = await this.getChecks({ employeeId, date: today });
    return checks.length > 0 ? checks[0] : null;
  }
}

// ============================================================================
// TIMESHEET SERVICE
// ============================================================================

export class TimesheetService {
  private static endpoint = '/attendance/timesheets';

  static async getTimesheets(filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<DashboardTimesheet[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<TimesheetApiResponse>(response).map(mapTimesheet);
    } catch (_error: any) {
      return [];
    }
  }

  static async submitTimesheet(data: {
    employeeId?: string;
    weekEnding: string;
    entries: Array<{
      date: string;
      checkIn?: string | null;
      checkOut?: string | null;
      hours: number;
      status: string;
    }>;
  }): Promise<DashboardTimesheet> {
    const payload = {
      ...data,
      employeeId:
        data.employeeId &&
        data.employeeId !== 'current-user' &&
        data.employeeId !== 'current-user-id'
          ? data.employeeId
          : undefined,
    };

    const response = await APIClient.post<{ data?: TimesheetApiResponse }>(this.endpoint, payload);
    return mapTimesheet(response.data!);
  }
}

// ============================================================================
// REGULARIZATION SERVICE
// ============================================================================

export class RegularizationService {
  private static endpoint = '/attendance/regularization';
  private static requestEndpoint = '/attendance/regularization-request';

  static async getRegularizations(filters?: {
    employeeId?: string;
    status?: string;
    pending?: boolean;
  }): Promise<AttendanceRegularization[]> {
    try {
      const response = await APIClient.get<{ data?: { requests?: RegularizationApiResponse[] } }>(
        this.requestEndpoint,
        filters
      );
      return (response.data?.requests || []).map(mapRegularization);
    } catch (error: any) {
      return [];
    }
  }

  static async submitRegularization(
    regularization: Partial<AttendanceRegularization>
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ success: boolean; data?: RegularizationApiResponse }>(
      this.endpoint,
      normalizeRegularizationPayload(
        regularization as Partial<AttendanceRegularization> & Record<string, unknown>
      )
    );
    return mapRegularization(response.data!);
  }

  static async approveRegularization(
    id: string,
    reviewedBy: string,
    comments?: string
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ success: boolean; data?: RegularizationApiResponse }>(
      this.endpoint,
      {
        action: 'approve',
        regularizationId: id,
        approverId:
          reviewedBy !== 'current-user' && reviewedBy !== 'current-user-id'
            ? reviewedBy
            : undefined,
        comments,
      }
    );
    return mapRegularization(response.data!);
  }

  static async rejectRegularization(
    id: string,
    reviewedBy: string,
    reason: string
  ): Promise<AttendanceRegularization> {
    const response = await APIClient.post<{ success: boolean; data?: RegularizationApiResponse }>(
      this.endpoint,
      {
        action: 'reject',
        regularizationId: id,
        approverId:
          reviewedBy !== 'current-user' && reviewedBy !== 'current-user-id'
            ? reviewedBy
            : undefined,
        comments: reason,
      }
    );
    return mapRegularization(response.data!);
  }

  static async getPendingRequests(filters?: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRegularization[]> {
    try {
      const response = await APIClient.get<{ data?: { requests?: RegularizationApiResponse[] } }>(
        this.requestEndpoint,
        filters
      );
      return (response.data?.requests || []).map(mapRegularization);
    } catch (error: any) {
      return [];
    }
  }
}

// ============================================================================
// OVERTIME SERVICE
// ============================================================================

export class OvertimeService {
  private static endpoint = '/attendance/overtime';
  private static managementEndpoint = '/attendance/overtime-management';

  static async getOvertimeRequests(filters?: {
    employeeId?: string;
    month?: string;
    status?: string;
  }): Promise<OvertimeRequest[]> {
    try {
      const normalizedEmployeeId = normalizePlaceholderEmployeeId(filters?.employeeId);
      const response = await APIClient.get<{
        success?: boolean;
        data?: { overtime?: OvertimeApiResponse[]; summary?: unknown };
      }>(this.endpoint, { ...filters, employeeId: normalizedEmployeeId });
      return (response.data?.overtime || []).map(mapOvertimeRequest);
    } catch (error: any) {
      return [];
    }
  }

  static async submitOvertimeRequest(request: Partial<OvertimeRequest>): Promise<OvertimeRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: OvertimeApiResponse;
      request?: OvertimeApiResponse;
      overtime?: OvertimeApiResponse;
    }>(
      this.endpoint,
      normalizeOvertimePayload(request as Partial<OvertimeRequest> & Record<string, unknown>)
    );
    return mapOvertimeRequest(response.data || response.request || response.overtime || { id: '' });
  }

  static async approveOvertime(
    id: string,
    approvedBy: string,
    approvedHours?: number
  ): Promise<OvertimeRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: OvertimeApiResponse;
      request?: OvertimeApiResponse;
    }>(this.endpoint, {
      action: 'approve',
      overtimeId: id,
      approverId: approvedBy,
      approvedMinutes: approvedHours ? approvedHours * 60 : undefined,
    });
    return mapOvertimeRequest(response.data || response.request || { id: '' });
  }

  static async rejectOvertime(
    id: string,
    rejectedBy: string,
    reason: string
  ): Promise<OvertimeRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: OvertimeApiResponse;
      request?: OvertimeApiResponse;
    }>(this.endpoint, {
      action: 'reject',
      overtimeId: id,
      approverId: rejectedBy,
      rejectionReason: reason,
    });
    return mapOvertimeRequest(response.data || response.request || { id: '' });
  }

  static async getOvertimeManagement(filters?: {
    department?: string;
    status?: string;
    month?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(this.managementEndpoint, filters);
      return APIClient.unwrapList<any>(response, 'data');
    } catch (error: any) {
      return [];
    }
  }
}

// ============================================================================
// ANALYTICS & METRICS SERVICE
// ============================================================================

export class AttendanceAnalyticsService {
  private static endpoint = '/attendance';

  static async getMetrics(): Promise<AttendanceMetrics> {
    try {
      const response = await APIClient.get<{ metrics?: AttendanceMetrics }>(this.endpoint, {
        type: 'summary',
      });
      return (
        response.metrics || {
          totalEmployees: 0,
          presentToday: 0,
          absentToday: 0,
          onLeaveToday: 0,
          lateToday: 0,
          averageAttendanceRate: 0,
          averagePunctualityRate: 0,
          totalOvertimeHours: 0,
          pendingRegularizations: 0,
          pendingOvertimeRequests: 0,
          departmentAttendance: [],
          attendanceTrend: [],
          topAbsentees: [],
          topLatecomers: [],
          overtimeByDepartment: [],
        }
      );
    } catch (error: any) {
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        lateToday: 0,
        averageAttendanceRate: 0,
        averagePunctualityRate: 0,
        totalOvertimeHours: 0,
        pendingRegularizations: 0,
        pendingOvertimeRequests: 0,
        departmentAttendance: [],
        attendanceTrend: [],
        topAbsentees: [],
        topLatecomers: [],
        overtimeByDepartment: [],
      };
    }
  }

  static async getExceptions(filters?: {
    date?: string;
    type?: string;
    status?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{
        success?: boolean;
        data?: { exceptions?: ExceptionApiResponse[]; summary?: unknown };
      }>('/attendance/exceptions', filters);
      return (response.data?.exceptions || []).map(mapAttendanceException);
    } catch (error: any) {
      return [];
    }
  }

  static async resolveException(
    id: string | number,
    action: 'regularize' | 'deduct',
    remarks?: string
  ): Promise<any> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: ExceptionApiResponse;
    }>('/attendance/exceptions', {
      id,
      action,
      remarks,
    });

    return response.data ? mapAttendanceException(response.data) : null;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AttendanceSettingsService {
  private static endpoint = '/attendance/settings';

  static async getSettings(): Promise<AttendanceSettings> {
    try {
      const response = await APIClient.get<{ settings?: AttendanceSettings }>(this.endpoint);
      return (
        response.settings || {
          workingDaysPerWeek: 5,
          weekendDays: [0, 6],
          standardWorkingHours: 8,
          enableBiometric: true,
          enableGeofencing: false,
          enableMobileCheckIn: true,
          requirePhotoOnCheckIn: false,
          autoMarkAbsent: true,
          autoMarkAbsentAfterHours: 4,
          enableOvertimeTracking: true,
          overtimeAutoApproval: false,
          maxOvertimeHoursPerDay: 4,
          maxOvertimeHoursPerMonth: 40,
          enableShiftRotation: false,
          enableAttendanceRegularization: true,
          regularizationRequiresApproval: true,
          regularizationDeadlineDays: 7,
          enableWFH: true,
          wfhRequiresApproval: true,
          maxWFHDaysPerMonth: 10,
          notificationEmail: 'hr@company.com',
          hrNotificationEmail: 'hr@company.com',
          managerNotificationEmail: '',
          sendDailySummary: true,
          sendWeeklySummary: true,
          sendMonthlySummary: true,
        }
      );
    } catch (error: any) {
      return {
        workingDaysPerWeek: 5,
        weekendDays: [0, 6],
        standardWorkingHours: 8,
        enableBiometric: true,
        enableGeofencing: false,
        enableMobileCheckIn: true,
        requirePhotoOnCheckIn: false,
        autoMarkAbsent: true,
        autoMarkAbsentAfterHours: 4,
        enableOvertimeTracking: true,
        overtimeAutoApproval: false,
        maxOvertimeHoursPerDay: 4,
        maxOvertimeHoursPerMonth: 40,
        enableShiftRotation: false,
        enableAttendanceRegularization: true,
        regularizationRequiresApproval: true,
        regularizationDeadlineDays: 7,
        enableWFH: true,
        wfhRequiresApproval: true,
        maxWFHDaysPerMonth: 10,
        notificationEmail: 'hr@company.com',
        hrNotificationEmail: 'hr@company.com',
        managerNotificationEmail: '',
        sendDailySummary: true,
        sendWeeklySummary: true,
        sendMonthlySummary: true,
      };
    }
  }

  static async updateSettings(updates: Partial<AttendanceSettings>): Promise<AttendanceSettings> {
    const response = await APIClient.put<{ settings: AttendanceSettings }>(this.endpoint, updates);
    return response.settings;
  }
}

// ============================================================================
// COMP-OFF SERVICE
// ============================================================================

export class CompOffService {
  private static endpoint = '/attendance/comp-off';

  static async getCompOffs(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{
        success?: boolean;
        data?: { compOffs?: CompOffApiResponse[]; summary?: CompOffSummaryResponse };
      }>(this.endpoint, filters);
      return (response.data?.compOffs || []).map(mapCompOff);
    } catch (error: any) {
      return [];
    }
  }

  static async submitCompOff(compOff: {
    employeeId: string;
    date: string;
    hours: number;
    reason: string;
  }): Promise<any> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: CompOffApiResponse;
      compOff?: CompOffApiResponse;
    }>(this.endpoint, normalizeCompOffPayload(compOff));
    return mapCompOff(response.data || response.compOff || { id: '' });
  }

  static async getCompOffSummary(employeeId: string): Promise<any> {
    try {
      const params = ['current-user', 'current-user-id'].includes(employeeId)
        ? undefined
        : { employeeId };
      const response = await APIClient.get<{
        success?: boolean;
        data?: { compOffs?: CompOffApiResponse[]; summary?: CompOffSummaryResponse };
      }>(this.endpoint, params);
      const summary = response.data?.summary;
      return {
        total: summary?.total ?? summary?.balance ?? 0,
        earned: summary?.earned ?? summary?.totalEarned ?? 0,
        used: summary?.used ?? summary?.totalUsed ?? 0,
        pending: summary?.pending ?? 0,
        expiring: summary?.expiring ?? 0,
        totalEarned: summary?.earned ?? summary?.totalEarned ?? 0,
        totalUsed: summary?.used ?? summary?.totalUsed ?? 0,
        balance: summary?.total ?? summary?.balance ?? 0,
      };
    } catch (error: any) {
      return {
        total: 0,
        earned: 0,
        used: 0,
        pending: 0,
        expiring: 0,
        totalEarned: 0,
        totalUsed: 0,
        balance: 0,
      };
    }
  }
}

// ============================================================================
// WORK FROM HOME SERVICE
// ============================================================================

export class WFHService {
  private static endpoint = '/attendance/wfh-requests';

  static async getWFHRequests(filters?: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<WFHRequest[]> {
    try {
      const normalizedEmployeeId = normalizePlaceholderEmployeeId(filters?.employeeId);
      const response = await APIClient.get<{ success?: boolean; data?: WFHApiResponse[] }>(
        this.endpoint,
        { ...filters, employeeId: normalizedEmployeeId }
      );
      return (response.data || []).map(mapWFHRequest);
    } catch (error: any) {
      return [];
    }
  }

  static async submitWFHRequest(request: Partial<WFHRequest>): Promise<WFHRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: WFHApiResponse;
      request?: WFHApiResponse;
    }>(this.endpoint, normalizeWFHPayload(request));
    return mapWFHRequest(response.data || response.request || { id: '' });
  }

  static async approveWFHRequest(
    id: string,
    approverId: string,
    comments?: string
  ): Promise<WFHRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: WFHApiResponse;
      request?: WFHApiResponse;
    }>(this.endpoint, { action: 'approve', id, approverId, comments });
    return mapWFHRequest(response.data || response.request || { id: '' });
  }

  static async rejectWFHRequest(
    id: string,
    approverId: string,
    reason: string
  ): Promise<WFHRequest> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: WFHApiResponse;
      request?: WFHApiResponse;
    }>(this.endpoint, { action: 'reject', id, approverId, reason });
    return mapWFHRequest(response.data || response.request || { id: '' });
  }

  static async getWFHSummary(employeeId: string, month: string): Promise<any> {
    try {
      const normalizedEmployeeId = normalizePlaceholderEmployeeId(employeeId);
      const requests = await this.getWFHRequests({ employeeId: normalizedEmployeeId });
      const targetMonth = month.trim();

      const usedDays = requests
        .filter(
          (request) => request.status === 'approved' && request.startDate.startsWith(targetMonth)
        )
        .reduce((sum, request) => sum + request.numberOfDays, 0);

      const pendingDays = requests
        .filter(
          (request) => request.status === 'pending' && request.startDate.startsWith(targetMonth)
        )
        .reduce((sum, request) => sum + request.numberOfDays, 0);

      const totalDays = 24;
      return {
        totalDays,
        usedDays,
        remainingDays: Math.max(totalDays - usedDays, 0),
        pendingDays,
      };
    } catch (error: any) {
      return { totalDays: 0, usedDays: 0, remainingDays: 0, pendingDays: 0 };
    }
  }
}

// ============================================================================
// SHIFT SWAP SERVICE
// ============================================================================

export class ShiftSwapService {
  private static endpoint = '/attendance/shift-swap';

  static async getMyShifts(
    employeeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    try {
      const normalizedEmployeeId = normalizePlaceholderEmployeeId(employeeId);
      const [scheduleResponse, swapResponse] = await Promise.all([
        APIClient.get<{
          success?: boolean;
          data?: { schedules?: ScheduleApiResponse[] };
        }>('/v1/attendance/schedules'),
        APIClient.get<{ success?: boolean; data?: ShiftSwapApiResponse[] }>(this.endpoint, {
          employeeId: normalizedEmployeeId,
          status: 'PENDING',
        }),
      ]);

      const schedules = scheduleResponse.data?.schedules || [];
      const swaps = swapResponse.data || [];

      return schedules
        .filter((schedule) => {
          if (!normalizedEmployeeId) {
            return true;
          }

          return schedule.employeeId === normalizedEmployeeId;
        })
        .map((schedule) => {
          const matchedSwap = swaps.find(
            (swap) =>
              swap.requestorId === schedule.employeeId &&
              (swap.requestorShiftId === schedule.id || swap.requestorShiftId === schedule.shiftId)
          );

          return {
            id: schedule.id,
            date: schedule.effectiveFrom || '',
            time: `${schedule.startTime || '09:00'} - ${schedule.endTime || '18:00'}`,
            type: inferShiftCardType(schedule.shiftName, schedule.startTime),
            location: schedule.shiftName || 'Assigned Shift',
            status: mapShiftSwapStatus(matchedSwap?.status),
          };
        });
    } catch (error: any) {
      return [];
    }
  }

  static async getMarketplace(filters?: {
    date?: string;
    shiftId?: string;
    department?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ success?: boolean; data?: ShiftSwapApiResponse[] }>(
        this.endpoint,
        { ...filters, status: 'PENDING' }
      );
      return (response.data || []).map(mapMarketplaceSwap);
    } catch (error: any) {
      return [];
    }
  }

  static async requestSwap(swap: {
    fromEmployeeId: string;
    toEmployeeId?: string;
    shiftId: string;
    date: string;
    reason: string;
  }): Promise<any> {
    const payload: Record<string, unknown> = {
      requestorShiftId: swap.shiftId,
      requestorDate: swap.date,
      targetDate: swap.date,
      reason: swap.reason,
    };

    const requestorId = normalizePlaceholderEmployeeId(swap.fromEmployeeId);
    const targetEmployeeId = normalizePlaceholderEmployeeId(swap.toEmployeeId);

    if (requestorId) {
      payload.requestorId = requestorId;
    }

    if (targetEmployeeId) {
      payload.targetEmployeeId = targetEmployeeId;
    }

    const response = await APIClient.post<{
      success?: boolean;
      data?: ShiftSwapApiResponse;
      swap?: ShiftSwapApiResponse;
    }>(this.endpoint, payload);
    return response.data || response.swap;
  }

  static async acceptSwap(swapId: string, employeeId: string): Promise<any> {
    const normalizedEmployeeId = normalizePlaceholderEmployeeId(employeeId);
    const response = await APIClient.put<{
      success?: boolean;
      data?: ShiftSwapApiResponse;
      swap?: ShiftSwapApiResponse;
    }>(this.endpoint, {
      id: swapId,
      status: 'APPROVED',
      employeeId: normalizedEmployeeId,
    });
    return response.data || response.swap;
  }

  static async rejectSwap(swapId: string, reason: string): Promise<any> {
    const response = await APIClient.put<{
      success?: boolean;
      data?: ShiftSwapApiResponse;
      swap?: ShiftSwapApiResponse;
    }>(this.endpoint, { id: swapId, status: 'REJECTED', reason });
    return response.data || response.swap;
  }
}

// ============================================================================
// ROSTER SERVICE
// ============================================================================

export class RosterService {
  private static endpoint = '/attendance/roster';

  static async getRosters(filters?: {
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<{ success?: boolean; data?: RosterApiResponse[] }>(
        this.endpoint,
        filters
      );
      return (response.data || []).map(mapRosterRow);
    } catch (error: any) {
      return [];
    }
  }

  static async assignShiftToEmployee(assignment: {
    employeeId: string;
    shiftId: string;
    date: string;
    workLocationId?: string;
  }): Promise<ShiftAssignment> {
    const response = await APIClient.post<{
      success?: boolean;
      data?: any;
      assignment?: ShiftAssignment;
    }>(this.endpoint, {
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      startDate: assignment.date,
      endDate: assignment.date,
    });
    return response.assignment || response.data;
  }

  static async bulkAssignShifts(assignments: {
    employeeIds: string[];
    shiftId: string;
    startDate: string;
    endDate: string;
    workLocationId?: string;
  }): Promise<ShiftAssignment[]> {
    const createdAssignments = await Promise.all(
      assignments.employeeIds.map((employeeId) =>
        this.assignShiftToEmployee({
          employeeId,
          shiftId: assignments.shiftId,
          date: assignments.startDate,
          workLocationId: assignments.workLocationId,
        })
      )
    );
    return createdAssignments;
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${assignmentId}`);
  }
}

// ============================================================================
// GEO-FENCING SERVICE
// ============================================================================

export class GeoFencingService {
  private static endpoint = '/attendance/geo-fencing';

  static async getGeoFences(): Promise<WorkLocation[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<WorkLocation>(response, 'locations');
    } catch (error: any) {
      return [];
    }
  }

  static async createGeoFence(geoFence: Partial<WorkLocation>): Promise<WorkLocation> {
    const response = await APIClient.post<{ location: WorkLocation }>(this.endpoint, geoFence);
    return response.location;
  }

  static async updateGeoFence(id: string, updates: Partial<WorkLocation>): Promise<WorkLocation> {
    const response = await APIClient.put<{ location: WorkLocation }>(
      `${this.endpoint}/${id}`,
      updates
    );
    return response.location;
  }

  static async deleteGeoFence(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }

  static async validateLocation(
    latitude: number,
    longitude: number
  ): Promise<{
    isValid: boolean;
    location?: WorkLocation;
  }> {
    try {
      const response = await APIClient.post<{ isValid: boolean; location?: WorkLocation }>(
        `${this.endpoint}/validate`,
        { latitude, longitude }
      );
      return response;
    } catch (error: any) {
      return { isValid: false };
    }
  }
}

// ============================================================================
// IP RESTRICTION SERVICE
// ============================================================================

export class IPRestrictionService {
  private static endpoint = '/attendance/ip-restriction';

  static async getIPRules(): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<any>(response, 'rules');
    } catch (error: any) {
      return [];
    }
  }

  static async addIPWhitelist(rule: {
    ipAddress: string;
    description?: string;
    departmentId?: string;
  }): Promise<any> {
    const response = await APIClient.post<{ rule: any }>(this.endpoint, rule);
    return response.rule;
  }

  static async removeIPWhitelist(ruleId: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${ruleId}`);
  }

  static async getBlockedAttempts(filters?: {
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/blocked`, filters);
      return APIClient.unwrapList<any>(response, 'attempts');
    } catch (error: any) {
      return [];
    }
  }

  static async validateIP(ipAddress: string): Promise<{ isValid: boolean }> {
    try {
      const response = await APIClient.post<{ isValid: boolean }>(`${this.endpoint}/validate`, {
        ipAddress,
      });
      return response;
    } catch (error: any) {
      return { isValid: false };
    }
  }
}

// ============================================================================
// PUNCH RULES SERVICE
// ============================================================================

export class PunchRulesService {
  private static endpoint = '/attendance/punch-rules';

  static async getPunchRules(): Promise<any> {
    try {
      const response = await APIClient.get<{ rules?: any }>(this.endpoint);
      return (
        response.rules || {
          allowEarlyCheckIn: true,
          earlyCheckInMinutes: 30,
          allowLateCheckOut: true,
          lateCheckOutMinutes: 60,
          requirePhoto: false,
          requireGPS: false,
          requireBiometric: false,
          allowMultiplePunches: false,
          autoCheckOutAfterHours: 12,
          gracePeriodMinutes: 15,
        }
      );
    } catch (error: any) {
      return {
        allowEarlyCheckIn: true,
        earlyCheckInMinutes: 30,
        allowLateCheckOut: true,
        lateCheckOutMinutes: 60,
        requirePhoto: false,
        requireGPS: false,
        requireBiometric: false,
        allowMultiplePunches: false,
        autoCheckOutAfterHours: 12,
        gracePeriodMinutes: 15,
      };
    }
  }

  static async updatePunchRules(rules: any): Promise<any> {
    const response = await APIClient.put<{ rules: any }>(this.endpoint, rules);
    return response.rules;
  }
}

// ============================================================================
// TIME ROUNDING SERVICE
// ============================================================================

export class TimeRoundingService {
  private static endpoint = '/attendance/time-rounding';

  static async getRoundingRules(): Promise<any> {
    try {
      const response = await APIClient.get<{ rules?: any }>(this.endpoint);
      return (
        response.rules || {
          enabled: false,
          checkInRounding: 'none',
          checkOutRounding: 'none',
          roundingInterval: 15,
          roundingType: 'nearest',
        }
      );
    } catch (error: any) {
      return {
        enabled: false,
        checkInRounding: 'none',
        checkOutRounding: 'none',
        roundingInterval: 15,
        roundingType: 'nearest',
      };
    }
  }

  static async updateRoundingRules(rules: any): Promise<any> {
    const response = await APIClient.put<{ rules: any }>(this.endpoint, rules);
    return response.rules;
  }
}

// ============================================================================
// APPROVAL WORKFLOW SERVICE
// ============================================================================

export class ApprovalWorkflowService {
  private static endpoint = '/attendance/approval-workflow';

  static async getWorkflows(): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<any>(response, 'workflows');
    } catch (error: any) {
      return [];
    }
  }

  static async createWorkflow(workflow: {
    name: string;
    type: string;
    levels: any[];
    conditions?: any;
  }): Promise<any> {
    const response = await APIClient.post<{ workflow: any }>(this.endpoint, workflow);
    return response.workflow;
  }

  static async updateWorkflow(id: string, updates: any): Promise<any> {
    const response = await APIClient.put<{ workflow: any }>(`${this.endpoint}/${id}`, updates);
    return response.workflow;
  }

  static async deleteWorkflow(id: string): Promise<void> {
    await APIClient.delete(`${this.endpoint}/${id}`);
  }
}

// ============================================================================
// FIELD FORCE SERVICE
// ============================================================================

export class FieldForceService {
  private static endpoint = '/attendance/field-force';

  static async getFieldAgents(filters?: { department?: string; status?: string }): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint, filters);
      return APIClient.unwrapList<any>(response, 'agents');
    } catch (error: any) {
      return [];
    }
  }

  static async getVisitLogs(filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/visits`, filters);
      return APIClient.unwrapList<any>(response, 'visits');
    } catch (error: any) {
      return [];
    }
  }

  static async trackAgent(employeeId: string): Promise<any> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/track/${employeeId}`);
      return APIClient.unwrapItem<any>(response, 'tracking');
    } catch (error: any) {
      return null;
    }
  }

  static async logVisit(visit: {
    employeeId: string;
    clientName: string;
    location: { latitude: number; longitude: number };
    checkInTime: string;
    checkOutTime?: string;
    notes?: string;
  }): Promise<any> {
    const response = await APIClient.post<{ visit: any }>(`${this.endpoint}/visits`, visit);
    return response.visit;
  }
}

// ============================================================================
// COMP-OFF MANAGEMENT SERVICE
// ============================================================================

export class CompOffManagementService {
  private static endpoint = '/attendance/comp-off-management';

  static async getCompOffData(filters?: {
    department?: string;
    status?: string;
    month?: string;
  }): Promise<any> {
    try {
      const response = await APIClient.get<{
        success?: boolean;
        data?: {
          compOffs?: CompOffManagementApiResponse[];
          summary?: {
            total?: number;
            pending?: number;
            approved?: number;
            rejected?: number;
            earned?: number;
            expired?: number;
          };
        };
      }>(this.endpoint, filters);
      const compOffs = response.data?.compOffs || [];
      const summary = response.data?.summary;
      const transactions = compOffs.map(mapCompOffTransaction);
      const balance = transactions.reduce((sum, transaction) => sum + transaction.credit, 0);
      const now = new Date();
      const expiringSoon = compOffs.filter((compOff) => {
        if (!compOff.expiryDate) {
          return false;
        }

        const expiryDate = new Date(compOff.expiryDate);
        const diffInDays = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );
        return diffInDays >= 0 && diffInDays <= 60;
      }).length;

      return {
        balance,
        expiringDays: 60,
        expiringSoon,
        summary,
        transactions,
      };
    } catch (error: any) {
      return {
        balance: 0,
        expiringDays: 60,
        expiringSoon: 0,
        transactions: [],
      };
    }
  }

  static async requestCompOffCredit(request: {
    employeeId: string;
    date: string;
    hours: number;
    reason: string;
  }): Promise<any> {
    const payload: Record<string, unknown> = {
      action: 'request',
      date: request.date,
      hours: request.hours,
      reason: request.reason,
    };

    const employeeId = normalizePlaceholderEmployeeId(request.employeeId);
    if (employeeId) {
      payload.employeeId = employeeId;
    }

    const response = await APIClient.post<{ success?: boolean; data?: any; request?: any }>(
      this.endpoint,
      payload
    );
    return response.data || response.request;
  }

  static async approveCompOff(id: string, approverId: string, comments?: string): Promise<any> {
    const response = await APIClient.post<{ success?: boolean; data?: any; compOff?: any }>(
      this.endpoint,
      {
        action: 'approve',
        id,
        approverId,
        comments,
      }
    );
    return response.data || response.compOff;
  }

  static async rejectCompOff(id: string, approverId: string, reason: string): Promise<any> {
    const response = await APIClient.post<{ success?: boolean; data?: any; compOff?: any }>(
      this.endpoint,
      {
        action: 'reject',
        id,
        approverId,
        reason,
      }
    );
    return response.data || response.compOff;
  }
}
