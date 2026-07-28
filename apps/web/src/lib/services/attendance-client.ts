/**
 * Attendance Client Service
 * Centralized API calls for all attendance operations
 */

// ===== Time Capture =====
export const timeCapture = {
  async getCaptures(params?: { date?: string; employeeId?: string; type?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/time-capture?${query}`);
    return response.json();
  },

  async createCapture(data: {
    employeeId: string;
    type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
    timestamp?: string;
    location?: { latitude?: number; longitude?: number; address?: string };
    photo?: string;
  }) {
    const response = await fetch('/api/attendance/time-capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Comp-Off =====
export const compOff = {
  async getCompOffs(params?: { employeeId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/comp-off?${query}`);
    return response.json();
  },

  async createCompOff(data: {
    employeeId: string;
    workDate: string;
    workHours: number;
    reason: string;
  }) {
    const response = await fetch('/api/attendance/comp-off', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async approveCompOff(id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const response = await fetch('/api/attendance/comp-off', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, remarks }),
    });
    return response.json();
  },
};

// ===== Overtime =====
export const overtime = {
  async getOvertime(params?: { employeeId?: string; month?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/overtime?${query}`);
    return response.json();
  },

  async submitOvertime(data: {
    employeeId: string;
    date: string;
    overtimeMinutes: number;
    reason?: string;
  }) {
    const response = await fetch('/api/attendance/overtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, action: 'submit' }),
    });
    return response.json();
  },

  async approveOvertime(overtimeId: string, approverId: string, approvedMinutes?: number) {
    const response = await fetch('/api/attendance/overtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', overtimeId, approverId, approvedMinutes }),
    });
    return response.json();
  },
};

// ===== Regularization =====
export const regularization = {
  async getRegularizations(params?: {
    employeeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/regularization?${query}`);
    return response.json();
  },

  async submitRegularization(data: {
    employeeId: string;
    date: string;
    type: 'MISSING_PUNCH' | 'LATE_ARRIVAL' | 'EARLY_DEPARTURE' | 'MANUAL_ENTRY';
    checkIn?: string;
    checkOut?: string;
    reason: string;
    attachments?: string[];
  }) {
    const response = await fetch('/api/attendance/regularization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async approveRegularization(id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const response = await fetch('/api/attendance/regularization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, remarks }),
    });
    return response.json();
  },
};

// ===== Shifts =====
export const shifts = {
  async getShifts(params?: { isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/shifts?${query}`);
    return response.json();
  },

  async createShift(data: {
    name: string;
    code: string;
    startTime: string;
    endTime: string;
    gracePeriod?: number;
    halfDayHours?: number;
    fullDayHours?: number;
    breakDuration?: number;
    weeklyOff?: number[];
  }) {
    const response = await fetch('/api/attendance/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Roster =====
export const roster = {
  async getRosters(params?: { employeeId?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/roster?${query}`);
    return response.json();
  },

  async createRoster(data: {
    employeeId: string;
    shiftId: string;
    startDate: string;
    endDate: string;
    isRecurring?: boolean;
    recurringDays?: number[];
  }) {
    const response = await fetch('/api/attendance/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Shift Swap =====
export const shiftSwap = {
  async getSwaps(params?: { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/shift-swap?${query}`);
    return response.json();
  },

  async requestSwap(data: {
    requestorId: string;
    targetEmployeeId: string;
    requestorDate: string;
    targetDate: string;
    reason: string;
  }) {
    const response = await fetch('/api/attendance/shift-swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async approveSwap(id: string, status: 'APPROVED' | 'REJECTED') {
    const response = await fetch('/api/attendance/shift-swap', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    return response.json();
  },
};

// ===== Exceptions =====
export const exceptions = {
  async getExceptions(params?: { date?: string; type?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/exceptions?${query}`);
    return response.json();
  },
};

// ===== Work From Home =====
export const workFromHome = {
  async getWFHRequests(params?: { employeeId?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/work-from-home?${query}`);
    return response.json();
  },

  async requestWFH(data: {
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    isRecurring?: boolean;
    recurringDays?: number[];
  }) {
    const response = await fetch('/api/attendance/work-from-home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Timesheets =====
export const timesheets = {
  async getTimesheets(params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/timesheets?${query}`);
    return response.json();
  },

  async submitTimesheet(data: {
    employeeId: string;
    weekEnding: string;
    entries: Array<{
      date: string;
      checkIn: string;
      checkOut: string;
      hours: number;
      status: string;
    }>;
  }) {
    const response = await fetch('/api/attendance/timesheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Geo-Fencing =====
export const geoFencing = {
  async getGeoFences(params?: { type?: string; isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/geo-fencing?${query}`);
    return response.json();
  },

  async validateLocation(latitude: number, longitude: number, employeeId?: string) {
    const response = await fetch('/api/attendance/geo-fencing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', latitude, longitude, employeeId }),
    });
    return response.json();
  },

  async createGeoFence(data: {
    name: string;
    type: 'OFFICE' | 'BRANCH' | 'SITE' | 'CUSTOM';
    latitude: number;
    longitude: number;
    radiusMeters: number;
    address?: string;
    strictMode?: boolean;
  }) {
    const { type, ...rest } = data;
    const response = await fetch('/api/attendance/geo-fencing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rest, fenceType: type }),
    });
    return response.json();
  },
};

// ===== IP Restriction =====
export const ipRestriction = {
  async getIPRestrictions(params?: { type?: string; isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/ip-restriction?${query}`);
    return response.json();
  },

  async validateIP(ipAddress: string, employeeId?: string) {
    const response = await fetch('/api/attendance/ip-restriction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', ipAddress, employeeId }),
    });
    return response.json();
  },
};

// ===== Field Force =====
export const fieldForce = {
  async getVisits(params?: {
    employeeId?: string;
    date?: string;
    visitType?: string;
    status?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/field-force?${query}`);
    return response.json();
  },

  async checkIn(data: {
    employeeId: string;
    visitType: 'CLIENT_VISIT' | 'SITE_VISIT' | 'DELIVERY' | 'INSPECTION' | 'OTHER';
    location: { latitude: number; longitude: number; address: string };
    checkIn: string;
    purpose: string;
    clientName?: string;
    notes?: string;
    photos?: string[];
  }) {
    const response = await fetch('/api/attendance/field-force', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async checkOut(
    visitId: string,
    checkOut: string,
    notes?: string,
    photos?: string[],
    distanceTraveled?: number
  ) {
    const response = await fetch('/api/attendance/field-force', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkout',
        visitId,
        checkOut,
        notes,
        photos,
        distanceTraveled,
      }),
    });
    return response.json();
  },
};

// ===== Rules =====
export const rules = {
  async getRules(params?: { category?: string; isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/rules?${query}`);
    return response.json();
  },

  async createRule(data: {
    name: string;
    category: 'GENERAL' | 'OVERTIME' | 'LEAVE' | 'SHIFT' | 'COMPLIANCE';
    applicableTo: 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | 'LOCATION' | 'CUSTOM';
    ruleConfig: Record<string, any>;
  }) {
    const response = await fetch('/api/attendance/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ===== Approval Workflow =====
export const approvalWorkflow = {
  async getWorkflows(params?: { requestType?: string; isActive?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`/api/attendance/approval-workflow?${query}`);
    return response.json();
  },

  async createWorkflow(data: {
    name: string;
    requestType:
      'LEAVE' | 'OVERTIME' | 'COMP_OFF' | 'WFH' | 'SHIFT_SWAP' | 'REGULARIZATION' | 'TIMESHEET';
    applicableTo: 'ALL' | 'DEPARTMENT' | 'DESIGNATION' | 'CUSTOM';
    approvalLevels: Array<{
      level: number;
      approverType: 'REPORTING_MANAGER' | 'DEPARTMENT_HEAD' | 'HR' | 'CUSTOM';
      isRequired: boolean;
    }>;
  }) {
    const response = await fetch('/api/attendance/approval-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
