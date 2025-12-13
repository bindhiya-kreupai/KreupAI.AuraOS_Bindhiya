// Assets Management Services
import type {
  Asset, AssetAssignment, MaintenanceRecord, AssetRequest, AssetTransfer,
  AssetAudit, AssetDisposal, AssetMetrics, AssetSettings
} from './types';

const STORAGE_KEYS = {
  ASSETS: 'assets',
  ASSIGNMENTS: 'asset_assignments',
  MAINTENANCE: 'asset_maintenance',
  REQUESTS: 'asset_requests',
  TRANSFERS: 'asset_transfers',
  AUDITS: 'asset_audits',
  DISPOSALS: 'asset_disposals',
  METRICS: 'asset_metrics',
  SETTINGS: 'asset_settings',
};

export class AssetService {
  static async getAssets(filters?: { status?: string; assetType?: string; departmentId?: string }): Promise<Asset[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
    let assets: Asset[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.status) assets = assets.filter(a => a.status === filters.status);
      if (filters.assetType) assets = assets.filter(a => a.assetType === filters.assetType);
      if (filters.departmentId) assets = assets.filter(a => a.department === filters.departmentId);
    }

    return assets;
  }

  static async getAssetById(id: string): Promise<Asset | null> {
    const assets = await this.getAssets();
    return assets.find(a => a.id === id) || null;
  }

  static async createAsset(asset: Asset): Promise<Asset> {
    // TODO: Replace with actual API call
    const assets = await this.getAssets();
    assets.push(asset);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return asset;
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    // TODO: Replace with actual API call
    const assets = await this.getAssets();
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');

    assets[index] = { ...assets[index], ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    return assets[index];
  }

  static async deleteAsset(id: string): Promise<void> {
    // TODO: Replace with actual API call
    const assets = await this.getAssets();
    const filteredAssets = assets.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(filteredAssets));
  }

  static async updateAssetStatus(id: string, status: Asset['status']): Promise<Asset> {
    return this.updateAsset(id, { status });
  }

  static async updateAssetCondition(id: string, condition: Asset['condition']): Promise<Asset> {
    return this.updateAsset(id, { condition });
  }

  static async calculateDepreciation(id: string): Promise<Asset> {
    const asset = await this.getAssetById(id);
    if (!asset || !asset.depreciation) throw new Error('Asset or depreciation info not found');

    const purchaseDate = new Date(asset.purchaseDate);
    const now = new Date();
    const yearsElapsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    let accumulatedDepreciation = 0;
    const purchasePrice = asset.purchasePrice;
    const salvageValue = asset.depreciation.salvageValue;
    const usefulLife = asset.depreciation.usefulLifeYears;

    if (asset.depreciation.method === 'straight_line') {
      const annualDepreciation = (purchasePrice - salvageValue) / usefulLife;
      accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, purchasePrice - salvageValue);
    }

    const currentBookValue = purchasePrice - accumulatedDepreciation;
    const annualDepreciation = (purchasePrice - salvageValue) / usefulLife;
    const monthlyDepreciation = annualDepreciation / 12;

    const updatedDepreciation = {
      ...asset.depreciation,
      currentBookValue,
      accumulatedDepreciation,
      annualDepreciation,
      monthlyDepreciation,
      lastCalculationDate: now.toISOString(),
      nextCalculationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    return this.updateAsset(id, { depreciation: updatedDepreciation });
  }
}

export class AssetAssignmentService {
  static async getAssignments(filters?: { employeeId?: string; assetId?: string }): Promise<AssetAssignment[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    let assignments: AssetAssignment[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.employeeId) assignments = assignments.filter(a => a.employeeId === filters.employeeId);
      if (filters.assetId) assignments = assignments.filter(a => a.assetId === filters.assetId);
    }

    return assignments;
  }

  static async assignAsset(assignment: AssetAssignment): Promise<AssetAssignment> {
    // TODO: Replace with actual API call
    const assignments = await this.getAssignments();
    assignments.push(assignment);
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    // Update asset status
    await AssetService.updateAsset(assignment.assetId, {
      status: 'assigned',
      assignedTo: assignment
    });

    return assignment;
  }

  static async returnAsset(assignmentId: string, returnCondition: Asset['condition'], returnNotes?: string): Promise<AssetAssignment> {
    // TODO: Replace with actual API call
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index === -1) throw new Error('Assignment not found');

    assignments[index] = {
      ...assignments[index],
      actualReturnDate: new Date().toISOString(),
      returnCondition,
      returnNotes,
      isActive: false
    };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

    // Update asset status
    await AssetService.updateAsset(assignments[index].assetId, {
      status: 'available',
      assignedTo: undefined,
      condition: returnCondition
    });

    return assignments[index];
  }

  static async acknowledgeAssignment(assignmentId: string, employeeId: string, signature?: string): Promise<AssetAssignment> {
    // TODO: Replace with actual API call
    const assignments = await this.getAssignments();
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index === -1) throw new Error('Assignment not found');

    assignments[index] = {
      ...assignments[index],
      acknowledgedBy: employeeId,
      acknowledgedDate: new Date().toISOString(),
      digitalSignature: signature
    };
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  }
}

export class MaintenanceService {
  static async getMaintenanceRecords(assetId?: string): Promise<MaintenanceRecord[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    let records: MaintenanceRecord[] = data ? JSON.parse(data) : [];

    if (assetId) {
      records = records.filter(r => r.assetId === assetId);
    }

    return records;
  }

  static async scheduleMainten ance(record: MaintenanceRecord): Promise<MaintenanceRecord> {
    // TODO: Replace with actual API call
    const records = await this.getMaintenanceRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));

    // Update asset status
    if (record.status === 'in_progress') {
      await AssetService.updateAssetStatus(record.assetId, 'under_maintenance');
    }

    return record;
  }

  static async completeMaintenance(id: string, afterCondition: Asset['condition'], notes?: string): Promise<MaintenanceRecord> {
    // TODO: Replace with actual API call
    const records = await this.getMaintenanceRecords();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Maintenance record not found');

    records[index] = {
      ...records[index],
      status: 'completed',
      completedDate: new Date().toISOString(),
      afterCondition,
      notes
    };
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));

    // Update asset status and condition
    await AssetService.updateAsset(records[index].assetId, {
      status: 'available',
      condition: afterCondition
    });

    return records[index];
  }
}

export class AssetRequestService {
  static async getRequests(filters?: { requestedBy?: string; status?: string }): Promise<AssetRequest[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    let requests: AssetRequest[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.requestedBy) requests = requests.filter(r => r.requestedBy === filters.requestedBy);
      if (filters.status) requests = requests.filter(r => r.status === filters.status);
    }

    return requests;
  }

  static async submitRequest(request: AssetRequest): Promise<AssetRequest> {
    // TODO: Replace with actual API call
    const requests = await this.getRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return request;
  }

  static async updateRequest(id: string, updates: Partial<AssetRequest>): Promise<AssetRequest> {
    // TODO: Replace with actual API call
    const requests = await this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Request not found');

    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return requests[index];
  }

  static async approveRequest(id: string, approverId: string, comments?: string): Promise<AssetRequest> {
    const request = await this.getRequests().then(reqs => reqs.find(r => r.id === id));
    if (!request) throw new Error('Request not found');

    const approverIndex = request.approvers.findIndex(a => a.approverId === approverId);
    if (approverIndex === -1) throw new Error('Approver not found');

    request.approvers[approverIndex].status = 'approved';
    request.approvers[approverIndex].approvedDate = new Date().toISOString();
    if (comments) request.approvers[approverIndex].comments = comments;

    const allApproved = request.approvers.every(a => a.status === 'approved');
    if (allApproved) {
      request.status = 'approved';
      request.approvedDate = new Date().toISOString();
    }

    return this.updateRequest(id, request);
  }

  static async fulfillRequest(id: string, fulfilledBy: string, assetIds: string[]): Promise<AssetRequest> {
    return this.updateRequest(id, {
      status: 'fulfilled',
      fulfilledDate: new Date().toISOString(),
      fulfilledBy,
      assignedAssets: assetIds
    });
  }
}

export class AssetTransferService {
  static async getTransfers(filters?: { assetId?: string; status?: string }): Promise<AssetTransfer[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    let transfers: AssetTransfer[] = data ? JSON.parse(data) : [];

    if (filters) {
      if (filters.assetId) transfers = transfers.filter(t => t.assetId === filters.assetId);
      if (filters.status) transfers = transfers.filter(t => t.status === filters.status);
    }

    return transfers;
  }

  static async initiateTransfer(transfer: AssetTransfer): Promise<AssetTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getTransfers();
    transfers.push(transfer);
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));

    // Update asset status
    await AssetService.updateAssetStatus(transfer.assetId, 'assigned');

    return transfer;
  }

  static async completeTransfer(id: string): Promise<AssetTransfer> {
    // TODO: Replace with actual API call
    const transfers = await this.getTransfers();
    const index = transfers.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transfer not found');

    transfers[index] = {
      ...transfers[index],
      status: 'completed',
      actualDeliveryDate: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
    return transfers[index];
  }
}

export class AssetAuditService {
  static async getAudits(): Promise<AssetAudit[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.AUDITS);
    return data ? JSON.parse(data) : [];
  }

  static async createAudit(audit: AssetAudit): Promise<AssetAudit> {
    // TODO: Replace with actual API call
    const audits = await this.getAudits();
    audits.push(audit);
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    return audit;
  }

  static async updateAudit(id: string, updates: Partial<AssetAudit>): Promise<AssetAudit> {
    // TODO: Replace with actual API call
    const audits = await this.getAudits();
    const index = audits.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Audit not found');

    audits[index] = { ...audits[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    return audits[index];
  }

  static async completeAudit(id: string): Promise<AssetAudit> {
    return this.updateAudit(id, {
      status: 'completed',
      completedDate: new Date().toISOString()
    });
  }
}

export class AssetDisposalService {
  static async getDisposals(): Promise<AssetDisposal[]> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.DISPOSALS);
    return data ? JSON.parse(data) : [];
  }

  static async initiateDisposal(disposal: AssetDisposal): Promise<AssetDisposal> {
    // TODO: Replace with actual API call
    const disposals = await this.getDisposals();
    disposals.push(disposal);
    localStorage.setItem(STORAGE_KEYS.DISPOSALS, JSON.stringify(disposals));

    // Update asset status
    await AssetService.updateAssetStatus(disposal.assetId, 'disposed');

    return disposal;
  }
}

export class AssetAnalyticsService {
  static async getMetrics(): Promise<AssetMetrics> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.METRICS);
    return data ? JSON.parse(data) : {
      totalAssets: 0,
      totalAssetValue: 0,
      totalDepreciation: 0,
      currentBookValue: 0,
      assetsByType: [],
      assetsByStatus: [],
      assetsByDepartment: [],
      assignedAssets: 0,
      availableAssets: 0,
      underMaintenanceAssets: 0,
      pendingRequests: 0,
      maintenanceCostThisMonth: 0,
      maintenanceCostThisYear: 0,
      assetsNearingWarrantyExpiry: 0,
      overdueMaintenanceAssets: 0,
      topAssetsByValue: [],
      recentAcquisitions: []
    };
  }
}

export class AssetSettingsService {
  static async getSettings(): Promise<AssetSettings> {
    // TODO: Replace with actual API call
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      enableAutoTagging: true,
      tagPrefix: 'AST',
      enableDepreciation: true,
      defaultDepreciationMethod: 'straight_line',
      enableMaintenanceTracking: true,
      enableWarrantyTracking: true,
      warrantyReminderDays: 30,
      enableAssetRequests: true,
      requireApprovalForRequests: true,
      enableAssetAudits: true,
      auditFrequency: 'quarterly',
      enableQRCodes: true,
      enableBarcodeScanning: true,
      enableGeolocation: false,
      lowStockThreshold: 5,
      notificationEmail: 'assets@company.com'
    };
  }

  static async updateSettings(updates: Partial<AssetSettings>): Promise<AssetSettings> {
    // TODO: Replace with actual API call
    const settings = await this.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
