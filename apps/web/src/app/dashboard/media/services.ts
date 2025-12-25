import { APIClient } from '@/lib/api-client';
import { ContentRights, BandwidthMetrics, AudienceMetrics, NetworkOperations, MediaSettings, MediaAlert } from './types';

export class ContentRightsService {
  private static endpoint = '/industry-media/content-rights';

  static async getAllRights(): Promise<ContentRights[]> {
    try {
      const response = await APIClient.get<{ rights?: ContentRights[] }>(this.endpoint);
      return response.rights || [];
    } catch (error) {
      console.error('Error fetching content rights:', error);
      return [];
    }
  }

  static async createRights(rightsData: Partial<ContentRights>): Promise<ContentRights> {
    const response = await APIClient.post<{ rights: ContentRights }>(this.endpoint, rightsData);
    return response.rights;
  }

  static async updateRights(rightsId: string, updates: Partial<ContentRights>): Promise<ContentRights> {
    const response = await APIClient.put<{ rights: ContentRights }>(`${this.endpoint}/${rightsId}`, updates);
    return response.rights;
  }
}

export class BandwidthAnalyticsService {
  private static endpoint = '/industry-media/bandwidth-analytics';

  static async getAllMetrics(): Promise<BandwidthMetrics[]> {
    try {
      const response = await APIClient.get<{ metrics?: BandwidthMetrics[] }>(this.endpoint);
      return response.metrics || [];
    } catch (error) {
      console.error('Error fetching bandwidth metrics:', error);
      return [];
    }
  }

  static async createMetrics(metricsData: Partial<BandwidthMetrics>): Promise<BandwidthMetrics> {
    const response = await APIClient.post<{ metrics: BandwidthMetrics }>(this.endpoint, metricsData);
    return response.metrics;
  }
}

export class AudienceMetricsService {
  private static endpoint = '/industry-media/audience-metrics';

  static async getAllMetrics(): Promise<AudienceMetrics[]> {
    try {
      const response = await APIClient.get<{ metrics?: AudienceMetrics[] }>(this.endpoint);
      return response.metrics || [];
    } catch (error) {
      console.error('Error fetching audience metrics:', error);
      return [];
    }
  }

  static async createMetrics(metricsData: Partial<AudienceMetrics>): Promise<AudienceMetrics> {
    const response = await APIClient.post<{ metrics: AudienceMetrics }>(this.endpoint, metricsData);
    return response.metrics;
  }
}

export class NetworkOperationsService {
  private static endpoint = '/industry-media/network-operations';

  static async getAllOperations(): Promise<NetworkOperations[]> {
    try {
      const response = await APIClient.get<{ operations?: NetworkOperations[] }>(this.endpoint);
      return response.operations || [];
    } catch (error) {
      console.error('Error fetching network operations:', error);
      return [];
    }
  }

  static async createOperation(operationData: Partial<NetworkOperations>): Promise<NetworkOperations> {
    const response = await APIClient.post<{ operation: NetworkOperations }>(this.endpoint, operationData);
    return response.operation;
  }

  static async updateOperation(operationId: string, updates: Partial<NetworkOperations>): Promise<NetworkOperations> {
    const response = await APIClient.put<{ operation: NetworkOperations }>(`${this.endpoint}/${operationId}`, updates);
    return response.operation;
  }
}

export class MediaSettingsService {
  private static endpoint = '/industry-media/settings';

  static async getSettings(): Promise<MediaSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: MediaSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  static async updateSettings(settings: Partial<MediaSettings>): Promise<MediaSettings> {
    const response = await APIClient.put<{ settings: MediaSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

export class AlertsService {
  private static endpoint = '/industry-media/alerts';

  static async getAllAlerts(): Promise<MediaAlert[]> {
    try {
      const response = await APIClient.get<{ alerts?: MediaAlert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async createAlert(alertData: Partial<MediaAlert>): Promise<MediaAlert> {
    const response = await APIClient.post<{ alert: MediaAlert }>(this.endpoint, alertData);
    return response.alert;
  }
}
