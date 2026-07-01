import { APIClient } from '@/lib/api-client';

// ---------------------------------------------------------------------------
// UI-facing types. These stay stable for the pages; the service layer maps
// them to/from the persisted Prisma shapes (incidentDate/incidentNumber/etc).
// ---------------------------------------------------------------------------

export interface Incident {
  id: string;
  incidentNumber?: string;
  type: string;
  description: string;
  location: string;
  date: string;
  severity: string;
  status: string;
  reportedBy: string;
  rootCause?: string;
  correctiveActions?: string;
  tenantId?: string;
}

export interface HealthCheckup {
  id: string;
  type: string;
  date: string;
  doctor: string;
  clinic: string;
  status: string;
  employeeId?: string;
  result?: string;
  notes?: string;
  tenantId?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  email?: string;
  type: string;
  notes?: string;
  tenantId?: string;
}

export interface SafetyTraining {
  id: string;
  title: string;
  duration: number;
  progress: number;
  deadline: string;
  type: string;
  enrollmentId?: string;
  certificateId?: string;
  mandatory?: boolean;
  tenantId?: string;
}

export interface HealthSafetyMetrics {
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  resolutionRate: number;
  daysWithoutIncident: number;
  totalCheckups: number;
  totalContacts: number;
  totalTrainings: number;
}

export interface HealthSafetySettings {
  settingsId?: string;
  organizationId?: string;
  incidentReporting: {
    requirePhotos: boolean;
    autoNotifySupervisor: boolean;
    escalationThresholdHours: number;
  };
  safetyTraining: {
    mandatoryRefreshMonths: number;
    autoEnroll: boolean;
  };
  notifications: {
    incidentReported: boolean;
    trainingDue: boolean;
    checkupReminder: boolean;
  };
  updatedAt?: string;
  tenantId?: string;
}

// ---------------------------------------------------------------------------
// Mappers: persisted (Prisma) row -> UI shape.
// ---------------------------------------------------------------------------

const STATUS_LABEL: Record<string, string> = {
  REPORTED: 'Open',
  INVESTIGATING: 'Investigating',
  ACTION_TAKEN: 'Action Taken',
  RESOLVED: 'Closed',
  CLOSED: 'Closed',
};

const STATUS_API: Record<string, string> = {
  Open: 'REPORTED',
  Investigating: 'INVESTIGATING',
  'Action Taken': 'ACTION_TAKEN',
  Closed: 'CLOSED',
};

function fmtDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

function mapIncident(row: any): Incident {
  return {
    id: row.id,
    incidentNumber: row.incidentNumber,
    type: row.type ?? '',
    description: row.description ?? '',
    location: row.location ?? '',
    date: fmtDate(row.incidentDate ?? row.createdAt),
    severity: row.severity ?? '',
    status: STATUS_LABEL[row.status] ?? row.status ?? 'Open',
    reportedBy: row.reportedBy ?? '',
    rootCause: row.rootCause ?? undefined,
    correctiveActions: row.correctiveActions ?? undefined,
    tenantId: row.tenantId,
  };
}

function mapCheckup(row: any): HealthCheckup {
  const completed = Boolean(row.completedAt);
  return {
    id: row.id,
    type: row.checkupType ?? '',
    date: fmtDate(row.scheduledFor ?? row.createdAt),
    doctor: row.result ?? '',
    clinic: row.notes ?? '',
    status: completed ? 'Completed' : 'Scheduled',
    employeeId: row.employeeId,
    result: row.result ?? undefined,
    notes: row.notes ?? undefined,
    tenantId: row.tenantId,
  };
}

const CONTACT_TYPE_LABEL: Record<string, string> = {
  FIRE: 'emergency',
  MEDICAL: 'emergency',
  SECURITY: 'workplace',
  UTILITY: 'workplace',
  PERSONAL: 'personal',
};

function mapContact(row: any): EmergencyContact {
  return {
    id: row.id,
    name: row.name ?? '',
    number: row.phone ?? '',
    email: row.email ?? undefined,
    type: CONTACT_TYPE_LABEL[row.type] ?? (row.type ?? '').toLowerCase(),
    notes: row.notes ?? undefined,
    tenantId: row.tenantId,
  };
}

// ---------------------------------------------------------------------------
// Services.
// ---------------------------------------------------------------------------

export class IncidentService {
  static async getAll(): Promise<Incident[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/incidents');
      return APIClient.unwrapList<any>(response, 'data').map(mapIncident);
    } catch {
      return [];
    }
  }

  static async getById(id: string): Promise<Incident | null> {
    try {
      const response = await APIClient.get<unknown>(`/health-safety/incidents/${id}`);
      const row = APIClient.unwrapItem<any>(response, 'data');
      return row ? mapIncident(row) : null;
    } catch {
      return null;
    }
  }

  static async create(data: {
    type: string;
    description: string;
    location: string;
    severity: string;
    reportedBy: string;
    photoUrls?: string[];
  }): Promise<Incident> {
    const payload = {
      type: data.type,
      description: data.description,
      location: data.location,
      severity: data.severity,
      reportedBy: data.reportedBy,
      incidentDate: new Date().toISOString(),
      incidentNumber: `INC-${Date.now()}`,
      status: 'REPORTED',
      ...(data.photoUrls && data.photoUrls.length > 0
        ? { correctiveActions: `Photos: ${data.photoUrls.join(', ')}` }
        : {}),
    };
    const response = await APIClient.post<unknown>('/health-safety/incidents', payload);
    return mapIncident(APIClient.unwrapItem<any>(response, 'data'));
  }
}

export class HealthCheckupService {
  static async getAll(): Promise<HealthCheckup[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/checkups');
      return APIClient.unwrapList<any>(response, 'data').map(mapCheckup);
    } catch {
      return [];
    }
  }

  static async create(data: {
    checkupType: string;
    scheduledFor: string;
    employeeId: string;
    notes?: string;
    result?: string;
    completed?: boolean;
  }): Promise<HealthCheckup> {
    const payload = {
      checkupType: data.checkupType,
      scheduledFor: data.scheduledFor,
      employeeId: data.employeeId,
      ...(data.notes ? { notes: data.notes } : {}),
      ...(data.result ? { result: data.result } : {}),
      ...(data.completed ? { completedAt: new Date().toISOString() } : {}),
    };
    const response = await APIClient.post<unknown>('/health-safety/checkups', payload);
    return mapCheckup(APIClient.unwrapItem<any>(response, 'data'));
  }
}

export class EmergencyService {
  static async getContacts(): Promise<EmergencyContact[]> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/emergency');
      return APIClient.unwrapList<any>(response, 'data').map(mapContact);
    } catch {
      return [];
    }
  }

  static async create(data: {
    name: string;
    phone: string;
    type: string;
    email?: string;
    notes?: string;
  }): Promise<EmergencyContact> {
    const response = await APIClient.post<unknown>('/health-safety/emergency', data);
    return mapContact(APIClient.unwrapItem<any>(response, 'data'));
  }

  static async dispatchAlert(data: {
    drill?: boolean;
    latitude?: number;
    longitude?: number;
    locationLabel?: string;
  }): Promise<{ id: string; incidentNumber: string; location: string }> {
    const response = await APIClient.post<unknown>('/health-safety/emergency/alert', data);
    return APIClient.unwrapItem<any>(response, 'data');
  }
}

export class SafetyTrainingService {
  static async getAll(employeeId?: string): Promise<SafetyTraining[]> {
    try {
      const [catalogRes, enrollRes] = await Promise.all([
        APIClient.get<unknown>('/health-safety/training'),
        employeeId
          ? APIClient.get<unknown>(`/health-safety/training/enrollments?employeeId=${employeeId}`)
          : Promise.resolve(null),
      ]);
      const catalog = APIClient.unwrapList<any>(catalogRes, 'data');
      const enrollments = enrollRes ? APIClient.unwrapList<any>(enrollRes, 'data') : [];
      const byTraining = new Map<string, any>();
      for (const e of enrollments) byTraining.set(e.trainingId, e);
      return catalog.map((course: any) => {
        const enr = byTraining.get(course.id);
        return {
          id: course.id,
          title: course.title ?? '',
          duration: Math.round((course.durationHours ?? 1) * 60),
          progress: enr?.progress ?? 0,
          deadline: enr?.dueDate
            ? fmtDate(enr.dueDate)
            : enr?.completedAt
              ? fmtDate(enr.completedAt)
              : 'Not enrolled',
          type: course.mandatory ? 'Mandatory' : 'Optional',
          mandatory: course.mandatory ?? false,
          enrollmentId: enr?.id,
          certificateId: enr?.certificateId,
          tenantId: course.tenantId,
        };
      });
    } catch {
      return [];
    }
  }

  static async enroll(trainingId: string, employeeId: string): Promise<void> {
    await APIClient.post('/health-safety/training/enrollments', { trainingId, employeeId });
  }

  static async updateProgress(
    enrollmentId: string,
    progress: number
  ): Promise<{ certificateId?: string }> {
    const response = await APIClient.put<unknown>(
      `/health-safety/training/enrollments/${enrollmentId}`,
      { progress }
    );
    const row = APIClient.unwrapItem<any>(response, 'data');
    return { certificateId: row?.certificateId };
  }
}

export class HealthSafetyAnalyticsService {
  static async getMetrics(): Promise<HealthSafetyMetrics> {
    try {
      const response = await APIClient.get<unknown>('/health-safety/metrics');
      const data = APIClient.unwrapItem<HealthSafetyMetrics>(response, 'data');
      return (
        data ?? {
          totalIncidents: 0,
          openIncidents: 0,
          closedIncidents: 0,
          resolutionRate: 0,
          daysWithoutIncident: 0,
          totalCheckups: 0,
          totalContacts: 0,
          totalTrainings: 0,
        }
      );
    } catch {
      return {
        totalIncidents: 0,
        openIncidents: 0,
        closedIncidents: 0,
        resolutionRate: 0,
        daysWithoutIncident: 0,
        totalCheckups: 0,
        totalContacts: 0,
        totalTrainings: 0,
      };
    }
  }
}

export class HealthSafetySettingsService {
  static async getSettings(): Promise<HealthSafetySettings | null> {
    try {
      const response = await APIClient.get<{ data?: HealthSafetySettings }>(
        '/health-safety/settings'
      );
      return APIClient.unwrapItem<HealthSafetySettings>(response, 'data');
    } catch {
      return null;
    }
  }

  static async updateSettings(
    settings: Partial<HealthSafetySettings>
  ): Promise<HealthSafetySettings> {
    const response = await APIClient.put<{ data: HealthSafetySettings }>(
      '/health-safety/settings',
      settings
    );
    return response.data;
  }
}

export { STATUS_API };
