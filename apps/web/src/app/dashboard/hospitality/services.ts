import { APIClient } from '@/lib/api-client';
import type {
  TipPool,
  Event,
  HousekeepingTask,
  HospitalitySettings,
  HospitalityAlert,
} from './types';

export class TipManagementService {
  private static endpoint = '/industry-hospitality/tip-management';

  static async getAllTipPools(): Promise<TipPool[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/pools`);
      return APIClient.unwrapList<TipPool>(response, 'pools');
    } catch (error: any) {
      return [];
    }
  }

  static async createTipPool(data: Partial<TipPool>): Promise<TipPool> {
    const response = await APIClient.post<{ pool: TipPool }>(`${this.endpoint}/pools`, data);
    return response.pool;
  }

  static async updateTipPool(poolId: string, updates: Partial<TipPool>): Promise<TipPool> {
    const response = await APIClient.put<{ pool: TipPool }>(
      `${this.endpoint}/pools/${poolId}`,
      updates
    );
    return response.pool;
  }
}

export class EventStaffingService {
  private static endpoint = '/industry-hospitality/event-staffing';

  static async getAllEvents(): Promise<Event[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/events`);
      return APIClient.unwrapList<Event>(response, 'events');
    } catch (error: any) {
      return [];
    }
  }

  static async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await APIClient.post<{ event: Event }>(`${this.endpoint}/events`, data);
    return response.event;
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    const response = await APIClient.put<{ event: Event }>(
      `${this.endpoint}/events/${eventId}`,
      updates
    );
    return response.event;
  }
}

export class HousekeepingService {
  private static endpoint = '/industry-hospitality/housekeeping';

  static async getAllTasks(): Promise<HousekeepingTask[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/tasks`);
      return APIClient.unwrapList<HousekeepingTask>(response, 'tasks');
    } catch (error: any) {
      return [];
    }
  }

  static async createTask(data: Partial<HousekeepingTask>): Promise<HousekeepingTask> {
    const response = await APIClient.post<{ task: HousekeepingTask }>(
      `${this.endpoint}/tasks`,
      data
    );
    return response.task;
  }

  static async updateTask(
    taskId: string,
    updates: Partial<HousekeepingTask>
  ): Promise<HousekeepingTask> {
    const response = await APIClient.put<{ task: HousekeepingTask }>(
      `${this.endpoint}/tasks/${taskId}`,
      updates
    );
    return response.task;
  }
}

export class HospitalitySettingsService {
  private static endpoint = '/industry-hospitality/settings';

  static async getSettings(): Promise<HospitalitySettings | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<HospitalitySettings>(response, 'settings');
    } catch (error: any) {
      return null;
    }
  }

  static async updateSettings(
    settings: Partial<HospitalitySettings>
  ): Promise<HospitalitySettings> {
    const response = await APIClient.put<{ settings: HospitalitySettings }>(
      this.endpoint,
      settings
    );
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-hospitality/alerts';

  static async getAllAlerts(): Promise<HospitalityAlert[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<HospitalityAlert>(response, 'alerts');
    } catch (error: any) {
      return [];
    }
  }

  static async createAlert(data: Partial<HospitalityAlert>): Promise<HospitalityAlert> {
    const response = await APIClient.post<{ alert: HospitalityAlert }>(this.endpoint, data);
    return response.alert;
  }
}
