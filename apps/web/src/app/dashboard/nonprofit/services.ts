import { APIClient } from '@/lib/api-client';
import type { Volunteer, FieldMission, Donor, NonprofitSettings, NonprofitAlert } from './types';

export class VolunteerService {
  private static endpoint = '/industry-nonprofit/volunteers';

  static async getAll(): Promise<Volunteer[]> {
    try {
      const response = await APIClient.get<{ volunteers?: Volunteer[] }>(this.endpoint);
      return response.volunteers || [];
    } catch (error) {
            return [];
    }
  }

  static async create(data: Partial<Volunteer>): Promise<Volunteer> {
    const response = await APIClient.post<{ volunteer: Volunteer }>(this.endpoint, data);
    return response.volunteer;
  }

  static async update(id: string, updates: Partial<Volunteer>): Promise<Volunteer> {
    const response = await APIClient.put<{ volunteer: Volunteer }>(`${this.endpoint}/${id}`, updates);
    return response.volunteer;
  }
}

export class MissionService {
  private static endpoint = '/industry-nonprofit/missions';

  static async getAll(): Promise<FieldMission[]> {
    try {
      const response = await APIClient.get<{ missions?: FieldMission[] }>(this.endpoint);
      return response.missions || [];
    } catch (error) {
            return [];
    }
  }

  static async create(data: Partial<FieldMission>): Promise<FieldMission> {
    const response = await APIClient.post<{ mission: FieldMission }>(this.endpoint, data);
    return response.mission;
  }

  static async update(id: string, updates: Partial<FieldMission>): Promise<FieldMission> {
    const response = await APIClient.put<{ mission: FieldMission }>(`${this.endpoint}/${id}`, updates);
    return response.mission;
  }
}

export class DonorService {
  private static endpoint = '/industry-nonprofit/donors';

  static async getAll(): Promise<Donor[]> {
    try {
      const response = await APIClient.get<{ donors?: Donor[] }>(this.endpoint);
      return response.donors || [];
    } catch (error) {
            return [];
    }
  }

  static async create(data: Partial<Donor>): Promise<Donor> {
    const response = await APIClient.post<{ donor: Donor }>(this.endpoint, data);
    return response.donor;
  }
}

export class NonprofitSettingsService {
  private static endpoint = '/industry-nonprofit/settings';

  static async get(): Promise<NonprofitSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: NonprofitSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
            return null;
    }
  }

  static async update(settings: Partial<NonprofitSettings>): Promise<NonprofitSettings> {
    const response = await APIClient.put<{ settings: NonprofitSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-nonprofit/alerts';

  static async getAll(): Promise<NonprofitAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: NonprofitAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
            return [];
    }
  }

  static async create(data: Partial<NonprofitAlert>): Promise<NonprofitAlert> {
    const response = await APIClient.post<{ alert: NonprofitAlert }>(this.endpoint, data);
    return response.alert;
  }
}
