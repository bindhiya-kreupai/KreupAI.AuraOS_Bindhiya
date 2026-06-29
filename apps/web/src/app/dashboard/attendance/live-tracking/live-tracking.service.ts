import { APIClient } from '@/lib/api-client';

export interface LiveCapture {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  location?: { latitude?: number; longitude?: number; address?: string };
  deviceInfo?: { deviceType?: string };
  photo?: string | null;
  ipAddress?: string | null;
  isValid?: boolean;
  validationStatus?: string;
  createdAt?: string;
  notes?: string | null;
}

export interface LiveTrackingSummary {
  total: number;
  checkIns: number;
  checkOuts: number;
  breaks: number;
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  currentStatus: string;
}

export interface LiveTrackingData {
  captures: LiveCapture[];
  summary: LiveTrackingSummary;
}

export interface EmployeeStatus {
  employeeId: string;
  employeeName: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ON_BREAK' | 'NO_DATA';
  lastCapture: LiveCapture | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  latestLocation?: string;
  deviceType?: string;
}

export class LiveTrackingService {
  private static endpoint = '/attendance/time-capture';

  static async getLiveTrackingData(date?: string): Promise<LiveTrackingData> {
    try {
      const today = date || new Date().toISOString().split('T')[0];
      const response = await APIClient.get<{
        success?: boolean;
        data?: { captures?: LiveCapture[]; summary?: LiveTrackingSummary };
      }>(this.endpoint, { date: today });
      const data = response.data || {};
      return {
        captures: data.captures || [],
        summary: data.summary || {
          total: 0,
          checkIns: 0,
          checkOuts: 0,
          breaks: 0,
          lastCheckIn: null,
          lastCheckOut: null,
          currentStatus: 'CHECKED_OUT',
        },
      };
    } catch {
      return {
        captures: [],
        summary: {
          total: 0,
          checkIns: 0,
          checkOuts: 0,
          breaks: 0,
          lastCheckIn: null,
          lastCheckOut: null,
          currentStatus: 'CHECKED_OUT',
        },
      };
    }
  }

  static computeEmployeeStatuses(captures: LiveCapture[]): EmployeeStatus[] {
    const employeeMap = new Map<string, LiveCapture[]>();
    for (const cap of captures) {
      const existing = employeeMap.get(cap.employeeId) || [];
      existing.push(cap);
      employeeMap.set(cap.employeeId, existing);
    }

    const statuses: EmployeeStatus[] = [];
    for (const [employeeId, caps] of employeeMap) {
      const sorted = [...caps].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latest = sorted[0];
      const firstCheckIn = sorted.find((c) => c.type === 'CHECK_IN');
      const lastCheckOut = sorted.find((c) => c.type === 'CHECK_OUT');

      let status: EmployeeStatus['status'] = 'CHECKED_IN';
      if (!latest) {
        status = 'NO_DATA';
      } else if (latest.type === 'CHECK_OUT') {
        status = 'CHECKED_OUT';
      } else if (latest.type === 'BREAK_START') {
        status = 'ON_BREAK';
      }

      statuses.push({
        employeeId,
        employeeName: latest?.employeeName || 'Unknown',
        status,
        lastCapture: latest,
        checkInTime: firstCheckIn?.timestamp || null,
        checkOutTime: lastCheckOut?.timestamp || null,
        latestLocation:
          latest?.location?.address ||
          (latest?.location?.latitude != null
            ? `${latest.location.latitude},${latest.location.longitude}`
            : undefined),
        deviceType: latest?.deviceInfo?.deviceType,
      });
    }

    return statuses.sort((a, b) => {
      const order = { CHECKED_IN: 0, ON_BREAK: 1, CHECKED_OUT: 2, NO_DATA: 3 };
      return order[a.status] - order[b.status];
    });
  }
}
