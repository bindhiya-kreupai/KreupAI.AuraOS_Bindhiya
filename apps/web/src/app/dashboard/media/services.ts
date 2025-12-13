import { ContentRights, BandwidthMetrics, AudienceMetrics, NetworkOperations, MediaSettings, MediaAlert } from './types';

const STORAGE_KEYS = { CONTENT_RIGHTS: 'media_content_rights', BANDWIDTH_METRICS: 'media_bandwidth_metrics', AUDIENCE_METRICS: 'media_audience_metrics', NETWORK_OPERATIONS: 'media_network_operations', SETTINGS: 'media_settings', ALERTS: 'media_alerts' };

export class ContentRightsService {
  static async getAllRights(): Promise<ContentRights[]> { const data = localStorage.getItem(STORAGE_KEYS.CONTENT_RIGHTS); return data ? JSON.parse(data) : []; }
  static async createRights(rightsData: Partial<ContentRights>): Promise<ContentRights> { const rights = await this.getAllRights(); const newRights: ContentRights = { rightsId: 'rights-' + Date.now(), contentId: rightsData.contentId || '', contentTitle: rightsData.contentTitle || '', contentType: rightsData.contentType || 'video', rightsHolder: rightsData.rightsHolder || '', licenseType: rightsData.licenseType || '', territory: rightsData.territory || [], exclusivity: rightsData.exclusivity || false, startDate: rightsData.startDate || '', endDate: rightsData.endDate || '', usageRights: rightsData.usageRights || {} as any, royalties: rightsData.royalties || {} as any, restrictions: rightsData.restrictions || [], sublicensing: rightsData.sublicensing || false, status: rightsData.status || 'active', createdAt: new Date().toISOString(), ...rightsData }; rights.push(newRights); localStorage.setItem(STORAGE_KEYS.CONTENT_RIGHTS, JSON.stringify(rights)); return newRights; }
  static async updateRights(rightsId: string, updates: Partial<ContentRights>): Promise<ContentRights> { const rights = await this.getAllRights(); const index = rights.findIndex(r => r.rightsId === rightsId); if (index === -1) throw new Error('Rights not found'); rights[index] = { ...rights[index], ...updates }; localStorage.setItem(STORAGE_KEYS.CONTENT_RIGHTS, JSON.stringify(rights)); return rights[index]; }
}

export class BandwidthAnalyticsService {
  static async getAllMetrics(): Promise<BandwidthMetrics[]> { const data = localStorage.getItem(STORAGE_KEYS.BANDWIDTH_METRICS); return data ? JSON.parse(data) : []; }
  static async createMetrics(metricsData: Partial<BandwidthMetrics>): Promise<BandwidthMetrics> { const metrics = await this.getAllMetrics(); const newMetrics: BandwidthMetrics = { metricId: 'bw-' + Date.now(), period: metricsData.period || {} as any, totalBandwidth: metricsData.totalBandwidth || 0, averageBandwidth: metricsData.averageBandwidth || 0, peakBandwidth: metricsData.peakBandwidth || 0, peakTime: metricsData.peakTime || '', dataTransferred: metricsData.dataTransferred || 0, unit: metricsData.unit || 'GB', costPerUnit: metricsData.costPerUnit || 0, totalCost: metricsData.totalCost || 0, utilizationRate: metricsData.utilizationRate || 0, trendData: metricsData.trendData || [], ...metricsData }; metrics.push(newMetrics); localStorage.setItem(STORAGE_KEYS.BANDWIDTH_METRICS, JSON.stringify(metrics)); return newMetrics; }
}

export class AudienceMetricsService {
  static async getAllMetrics(): Promise<AudienceMetrics[]> { const data = localStorage.getItem(STORAGE_KEYS.AUDIENCE_METRICS); return data ? JSON.parse(data) : []; }
  static async createMetrics(metricsData: Partial<AudienceMetrics>): Promise<AudienceMetrics> { const metrics = await this.getAllMetrics(); const newMetrics: AudienceMetrics = { metricId: 'aud-' + Date.now(), period: metricsData.period || {} as any, totalViews: metricsData.totalViews || 0, uniqueViewers: metricsData.uniqueViewers || 0, avgWatchTime: metricsData.avgWatchTime || 0, completionRate: metricsData.completionRate || 0, engagementRate: metricsData.engagementRate || 0, demographics: metricsData.demographics || {} as any, geography: metricsData.geography || [], devices: metricsData.devices || [], sources: metricsData.sources || [], ...metricsData }; metrics.push(newMetrics); localStorage.setItem(STORAGE_KEYS.AUDIENCE_METRICS, JSON.stringify(metrics)); return newMetrics; }
}

export class NetworkOperationsService {
  static async getAllOperations(): Promise<NetworkOperations[]> { const data = localStorage.getItem(STORAGE_KEYS.NETWORK_OPERATIONS); return data ? JSON.parse(data) : []; }
  static async createOperation(operationData: Partial<NetworkOperations>): Promise<NetworkOperations> { const operations = await this.getAllOperations(); const newOperation: NetworkOperations = { operationId: 'netop-' + Date.now(), operationType: operationData.operationType || 'maintenance', facilityId: operationData.facilityId || '', facilityName: operationData.facilityName || '', equipment: operationData.equipment || [], scheduledStart: operationData.scheduledStart || '', scheduledEnd: operationData.scheduledEnd || '', technicians: operationData.technicians || [], status: operationData.status || 'scheduled', impact: operationData.impact || {} as any, createdAt: new Date().toISOString(), ...operationData }; operations.push(newOperation); localStorage.setItem(STORAGE_KEYS.NETWORK_OPERATIONS, JSON.stringify(operations)); return newOperation; }
  static async updateOperation(operationId: string, updates: Partial<NetworkOperations>): Promise<NetworkOperations> { const operations = await this.getAllOperations(); const index = operations.findIndex(o => o.operationId === operationId); if (index === -1) throw new Error('Operation not found'); operations[index] = { ...operations[index], ...updates }; localStorage.setItem(STORAGE_KEYS.NETWORK_OPERATIONS, JSON.stringify(operations)); return operations[index]; }
}

export class MediaSettingsService {
  static async getSettings(): Promise<MediaSettings | null> { const data = localStorage.getItem(STORAGE_KEYS.SETTINGS); return data ? JSON.parse(data) : null; }
  static async updateSettings(settings: Partial<MediaSettings>): Promise<MediaSettings> { const current = await this.getSettings(); const updated: MediaSettings = { ...current, ...settings, updatedAt: new Date().toISOString() } as MediaSettings; localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated)); return updated; }
}

export class AlertsService {
  static async getAllAlerts(): Promise<MediaAlert[]> { const data = localStorage.getItem(STORAGE_KEYS.ALERTS); return data ? JSON.parse(data) : []; }
  static async createAlert(alertData: Partial<MediaAlert>): Promise<MediaAlert> { const alerts = await this.getAllAlerts(); const newAlert: MediaAlert = { alertId: 'alert-' + Date.now(), alertType: alertData.alertType || 'rights', severity: alertData.severity || 'low', title: alertData.title || '', message: alertData.message || '', relatedEntity: alertData.relatedEntity || {} as any, status: alertData.status || 'active', createdAt: new Date().toISOString(), ...alertData }; alerts.push(newAlert); localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts)); return newAlert; }
}
