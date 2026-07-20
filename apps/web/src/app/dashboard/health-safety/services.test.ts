import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from '@/lib/api-client';
import {
  IncidentService,
  HealthCheckupService,
  EmergencyService,
  SafetyTrainingService,
  HealthSafetyAnalyticsService,
} from './services';

vi.mock('@/lib/api-client', () => {
  const actual = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    unwrapList: (res: any) => (Array.isArray(res?.data) ? res.data : []),
    unwrapItem: (res: any) => res?.data ?? null,
  };
  return { APIClient: actual };
});

const mockGet = APIClient.get as unknown as ReturnType<typeof vi.fn>;
const mockPost = APIClient.post as unknown as ReturnType<typeof vi.fn>;

describe('health-safety services schema mapping', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps persisted incident (incidentDate/incidentNumber/REPORTED) to UI shape', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'inc-1',
          incidentNumber: 'INC-100',
          incidentDate: '2026-06-01T10:00:00.000Z',
          type: 'Near Miss',
          severity: 'Minor',
          description: 'Spill',
          location: 'Pantry',
          reportedBy: 'emp-1',
          status: 'REPORTED',
        },
      ],
    });
    const list = await IncidentService.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].date).toBe('2026-06-01');
    expect(list[0].status).toBe('Open');
    expect(list[0].incidentNumber).toBe('INC-100');
  });

  it('create incident sends REPORTED status and an incidentNumber', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'x', status: 'REPORTED' } });
    await IncidentService.create({
      type: 'Near Miss',
      description: 'd',
      location: 'l',
      severity: 'Minor',
      reportedBy: 'emp-1',
    });
    const payload = mockPost.mock.calls[0][1];
    expect(payload.status).toBe('REPORTED');
    expect(payload.incidentNumber).toMatch(/^INC-/);
    expect(payload.reportedBy).toBe('emp-1');
  });

  it('maps checkup (checkupType/scheduledFor/completedAt) to UI shape', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: 'c-1',
          checkupType: 'Annual Physical',
          scheduledFor: '2026-05-10T09:00:00.000Z',
          completedAt: '2026-05-10T10:00:00.000Z',
          result: 'Healthy',
          notes: 'City Clinic',
          employeeId: 'emp-1',
        },
      ],
    });
    const list = await HealthCheckupService.getAll();
    expect(list[0].type).toBe('Annual Physical');
    expect(list[0].date).toBe('2026-05-10');
    expect(list[0].status).toBe('Completed');
  });

  it('maps emergency contact (FIRE/phone) to UI type/number', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: 'e-1', type: 'FIRE', name: 'Fire Dept', phone: '911' }],
    });
    const list = await EmergencyService.getContacts();
    expect(list[0].type).toBe('emergency');
    expect(list[0].number).toBe('911');
  });

  it('dispatchAlert posts to the alert endpoint', async () => {
    mockPost.mockResolvedValueOnce({
      data: { id: 'i', incidentNumber: 'SOS-1', location: 'GPS' },
    });
    await EmergencyService.dispatchAlert({ drill: false, latitude: 1, longitude: 2 });
    expect(mockPost.mock.calls[0][0]).toBe('/health-safety/emergency/alert');
  });

  it('merges training catalog with enrollment progress', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: [{ id: 't-1', title: 'Fire Safety', durationHours: 2, mandatory: true }],
      })
      .mockResolvedValueOnce({
        data: [
          { id: 'en-1', trainingId: 't-1', progress: 50, dueDate: '2026-12-31T00:00:00.000Z' },
        ],
      });
    const list = await SafetyTrainingService.getAll('emp-1');
    expect(list[0].duration).toBe(120);
    expect(list[0].progress).toBe(50);
    expect(list[0].enrollmentId).toBe('en-1');
    expect(list[0].type).toBe('Mandatory');
  });

  it('analytics getMetrics hits the metrics endpoint (not settings)', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        totalIncidents: 3,
        openIncidents: 1,
        closedIncidents: 2,
        resolutionRate: 67,
        daysWithoutIncident: 12,
        totalCheckups: 0,
        totalContacts: 0,
        totalTrainings: 0,
      },
    });
    const m = await HealthSafetyAnalyticsService.getMetrics();
    expect(mockGet.mock.calls[0][0]).toBe('/health-safety/metrics');
    expect(m.daysWithoutIncident).toBe(12);
    expect(m.resolutionRate).toBe(67);
  });
});
