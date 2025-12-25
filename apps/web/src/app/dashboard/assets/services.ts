// Assets Management Services
import { APIClient } from '@/lib/api-client';
import type {
  Asset, AssetAssignment, MaintenanceRecord, AssetRequest, AssetTransfer,
  AssetAudit, AssetDisposal, AssetMetrics, AssetSettings
} from './types';

export class AssetService {
  static async getAssets(filters?: { status?: string; assetType?: string; departmentId?: string }): Promise<Asset[]> {
    return APIClient.get<Asset[]>('/assets', filters);
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    return APIClient.get<Asset | null>(`/assets/${id}`);
  }

  static async createAsset(asset: Asset): Promise<Asset> {
    return APIClient.post<Asset>('/assets', asset);
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    return APIClient.put<Asset>(`/assets/${id}`, updates);
  }

  static async deleteAsset(id: string): Promise<void> {
    return APIClient.delete<void>(`/assets/${id}`);
  }

  static async updateAssetStatus(id: string, status: Asset['status']): Promise<Asset> {
    return APIClient.put<Asset>(`/assets/${id}/status`, { status });
  }

  static async updateAssetCondition(id: string, condition: Asset['condition']): Promise<Asset> {
    return APIClient.put<Asset>(`/assets/${id}/condition`, { condition });
  }

  static async calculateDepreciation(id: string): Promise<Asset> {
    return APIClient.post<Asset>(`/assets/${id}/depreciation`, {});
  }
}

export class AssetAssignmentService {
  static async getAssignments(filters?: { employeeId?: string; assetId?: string }): Promise<AssetAssignment[]> {
    return APIClient.get<AssetAssignment[]>('/assets/assignments', filters);
  }

  static async assignAsset(assignment: AssetAssignment): Promise<AssetAssignment> {
    return APIClient.post<AssetAssignment>('/assets/assignments', assignment);
  }

  static async returnAsset(assignmentId: string, returnCondition: Asset['condition'], returnNotes?: string): Promise<AssetAssignment> {
    return APIClient.post<AssetAssignment>(`/assets/assignments/${assignmentId}/return`, { returnCondition, returnNotes });
  }

  static async acknowledgeAssignment(assignmentId: string, employeeId: string, signature?: string): Promise<AssetAssignment> {
    return APIClient.post<AssetAssignment>(`/assets/assignments/${assignmentId}/acknowledge`, { employeeId, signature });
  }
}

export class MaintenanceService {
  static async getMaintenanceRecords(assetId?: string): Promise<MaintenanceRecord[]> {
    return APIClient.get<MaintenanceRecord[]>('/assets/maintenance', assetId ? { assetId } : undefined);
  }

  static async scheduleMaintenance(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    return APIClient.post<MaintenanceRecord>('/assets/maintenance', record);
  }

  static async completeMaintenance(id: string, afterCondition: Asset['condition'], notes?: string): Promise<MaintenanceRecord> {
    return APIClient.post<MaintenanceRecord>(`/assets/maintenance/${id}/complete`, { afterCondition, notes });
  }
}

export class AssetRequestService {
  static async getRequests(filters?: { requestedBy?: string; status?: string }): Promise<AssetRequest[]> {
    return APIClient.get<AssetRequest[]>('/assets/requests', filters);
  }

  static async submitRequest(request: AssetRequest): Promise<AssetRequest> {
    return APIClient.post<AssetRequest>('/assets/requests', request);
  }

  static async updateRequest(id: string, updates: Partial<AssetRequest>): Promise<AssetRequest> {
    return APIClient.put<AssetRequest>(`/assets/requests/${id}`, updates);
  }

  static async approveRequest(id: string, approverId: string, comments?: string): Promise<AssetRequest> {
    return APIClient.post<AssetRequest>(`/assets/requests/${id}/approve`, { approverId, comments });
  }

  static async fulfillRequest(id: string, fulfilledBy: string, assetIds: string[]): Promise<AssetRequest> {
    return APIClient.post<AssetRequest>(`/assets/requests/${id}/fulfill`, { fulfilledBy, assetIds });
  }
}

export class AssetTransferService {
  static async getTransfers(filters?: { assetId?: string; status?: string }): Promise<AssetTransfer[]> {
    return APIClient.get<AssetTransfer[]>('/assets/transfers', filters);
  }

  static async initiateTransfer(transfer: AssetTransfer): Promise<AssetTransfer> {
    return APIClient.post<AssetTransfer>('/assets/transfers', transfer);
  }

  static async completeTransfer(id: string): Promise<AssetTransfer> {
    return APIClient.post<AssetTransfer>(`/assets/transfers/${id}/complete`, {});
  }
}

export class AssetAuditService {
  static async getAudits(): Promise<AssetAudit[]> {
    return APIClient.get<AssetAudit[]>('/assets/audits');
  }

  static async createAudit(audit: AssetAudit): Promise<AssetAudit> {
    return APIClient.post<AssetAudit>('/assets/audits', audit);
  }

  static async updateAudit(id: string, updates: Partial<AssetAudit>): Promise<AssetAudit> {
    return APIClient.put<AssetAudit>(`/assets/audits/${id}`, updates);
  }

  static async completeAudit(id: string): Promise<AssetAudit> {
    return APIClient.post<AssetAudit>(`/assets/audits/${id}/complete`, {});
  }
}

export class AssetDisposalService {
  static async getDisposals(): Promise<AssetDisposal[]> {
    return APIClient.get<AssetDisposal[]>('/assets/disposals');
  }

  static async initiateDisposal(disposal: AssetDisposal): Promise<AssetDisposal> {
    return APIClient.post<AssetDisposal>('/assets/disposals', disposal);
  }
}

export class AssetAnalyticsService {
  static async getMetrics(): Promise<AssetMetrics> {
    return APIClient.get<AssetMetrics>('/assets/analytics/metrics');
  }
}

export class AssetSettingsService {
  static async getSettings(): Promise<AssetSettings> {
    return APIClient.get<AssetSettings>('/assets/settings');
  }

  static async updateSettings(updates: Partial<AssetSettings>): Promise<AssetSettings> {
    return APIClient.put<AssetSettings>('/assets/settings', updates);
  }
}
