// Automotive Module - Service Layer

import { APIClient } from '@/lib/api-client';
import type {
  Technician, TechnicianShift, RosterTemplate, ShiftSwapRequest, TimeOffRequest, WorkloadAnalysis,
  SalesCommission, VehicleSale, ServiceSale, CommissionStructure, CommissionReport, SalesPerson,
  Part, InventoryMovement, PurchaseOrder, StockAdjustment, InventoryAnalysis,
  AutomotiveSettings
} from './types';

// ============================================================================
// TECHNICIAN ROSTERING SERVICES
// ============================================================================

export class TechnicianService {
  private static endpoint = '/automotive/technicians';

  static async getAllTechnicians(): Promise<Technician[]> {
    try {
      const response = await APIClient.get<{ technicians?: Technician[] }>(this.endpoint);
      return response.technicians || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getTechnicianById(technicianId: string): Promise<Technician | null> {
    try {
      const response = await APIClient.get<{ technician?: Technician }>(`${this.endpoint}/${technicianId}`);
      return response.technician || null;
    } catch (error: any) {
            return null;
    }
  }

  static async createTechnician(technicianData: Partial<Technician>): Promise<Technician> {
    const response = await APIClient.post<{ technician: Technician }>(this.endpoint, technicianData);
    return response.technician;
  }

  static async updateTechnician(technicianId: string, updates: Partial<Technician>): Promise<Technician> {
    const response = await APIClient.put<{ technician: Technician }>(`${this.endpoint}/${technicianId}`, updates);
    return response.technician;
  }

  static async deleteTechnician(technicianId: string): Promise<void> {
    await APIClient.delete<void>(`${this.endpoint}/${technicianId}`);
  }
}

export class ShiftService {
  private static endpoint = '/automotive/shifts';

  static async getAllShifts(): Promise<TechnicianShift[]> {
    try {
      const response = await APIClient.get<{ shifts?: TechnicianShift[] }>(this.endpoint);
      return response.shifts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getShiftsByTechnician(technicianId: string, startDate?: Date, endDate?: Date): Promise<TechnicianShift[]> {
    try {
      const response = await APIClient.get<{ shifts?: TechnicianShift[] }>(`${this.endpoint}/technician/${technicianId}`, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      return response.shifts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getShiftsByDate(date: Date): Promise<TechnicianShift[]> {
    try {
      const response = await APIClient.get<{ shifts?: TechnicianShift[] }>(`${this.endpoint}/date`, {
        date: date.toISOString(),
      });
      return response.shifts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createShift(shiftData: Partial<TechnicianShift>): Promise<TechnicianShift> {
    const response = await APIClient.post<{ shift: TechnicianShift }>(this.endpoint, shiftData);
    return response.shift;
  }

  static async updateShift(shiftId: string, updates: Partial<TechnicianShift>): Promise<TechnicianShift> {
    const response = await APIClient.put<{ shift: TechnicianShift }>(`${this.endpoint}/${shiftId}`, updates);
    return response.shift;
  }

  static async bulkCreateShifts(shifts: Partial<TechnicianShift>[]): Promise<TechnicianShift[]> {
    const response = await APIClient.post<{ shifts: TechnicianShift[] }>(`${this.endpoint}/bulk`, { shifts });
    return response.shifts;
  }
}

export class RosterTemplateService {
  private static endpoint = '/automotive/roster-templates';

  static async getAllTemplates(): Promise<RosterTemplate[]> {
    try {
      const response = await APIClient.get<{ templates?: RosterTemplate[] }>(this.endpoint);
      return response.templates || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createTemplate(templateData: Partial<RosterTemplate>): Promise<RosterTemplate> {
    const response = await APIClient.post<{ template: RosterTemplate }>(this.endpoint, templateData);
    return response.template;
  }

  static async applyTemplate(templateId: string, startDate: Date, endDate: Date): Promise<TechnicianShift[]> {
    const response = await APIClient.post<{ shifts: TechnicianShift[] }>(`${this.endpoint}/${templateId}/apply`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.shifts;
  }
}

export class ShiftSwapService {
  private static endpoint = '/automotive/shift-swaps';

  static async getAllSwapRequests(): Promise<ShiftSwapRequest[]> {
    try {
      const response = await APIClient.get<{ swapRequests?: ShiftSwapRequest[] }>(this.endpoint);
      return response.swapRequests || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createSwapRequest(requestData: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> {
    const response = await APIClient.post<{ swapRequest: ShiftSwapRequest }>(this.endpoint, requestData);
    return response.swapRequest;
  }

  static async updateSwapRequest(requestId: string, updates: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> {
    const response = await APIClient.put<{ swapRequest: ShiftSwapRequest }>(`${this.endpoint}/${requestId}`, updates);
    return response.swapRequest;
  }
}

export class TimeOffService {
  private static endpoint = '/automotive/time-off';

  static async getAllTimeOffRequests(): Promise<TimeOffRequest[]> {
    try {
      const response = await APIClient.get<{ timeOffRequests?: TimeOffRequest[] }>(this.endpoint);
      return response.timeOffRequests || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createTimeOffRequest(requestData: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const response = await APIClient.post<{ timeOffRequest: TimeOffRequest }>(this.endpoint, requestData);
    return response.timeOffRequest;
  }

  static async updateTimeOffRequest(requestId: string, updates: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const response = await APIClient.put<{ timeOffRequest: TimeOffRequest }>(`${this.endpoint}/${requestId}`, updates);
    return response.timeOffRequest;
  }
}

export class WorkloadAnalysisService {
  private static endpoint = '/automotive/workload-analysis';

  static async getWorkloadAnalysis(startDate: Date, endDate: Date): Promise<WorkloadAnalysis> {
    const response = await APIClient.get<{ analysis: WorkloadAnalysis }>(this.endpoint, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.analysis;
  }
}

// ============================================================================
// SALES COMMISSIONS SERVICES
// ============================================================================

export class SalesPersonService {
  private static endpoint = '/automotive/sales-people';

  static async getAllSalesPeople(): Promise<SalesPerson[]> {
    try {
      const response = await APIClient.get<{ salesPeople?: SalesPerson[] }>(this.endpoint);
      return response.salesPeople || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createSalesPerson(salesPersonData: Partial<SalesPerson>): Promise<SalesPerson> {
    const response = await APIClient.post<{ salesPerson: SalesPerson }>(this.endpoint, salesPersonData);
    return response.salesPerson;
  }
}

export class CommissionService {
  private static endpoint = '/automotive/commissions';

  static async getAllCommissions(): Promise<SalesCommission[]> {
    try {
      const response = await APIClient.get<{ commissions?: SalesCommission[] }>(this.endpoint);
      return response.commissions || [];
    } catch (error: any) {
            return [];
    }
  }

  static async calculateCommission(salesPersonId: string, startDate: Date, endDate: Date): Promise<SalesCommission> {
    const response = await APIClient.post<{ commission: SalesCommission }>(`${this.endpoint}/calculate`, {
      salesPersonId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.commission;
  }

  static async updateCommission(commissionId: string, updates: Partial<SalesCommission>): Promise<SalesCommission> {
    const response = await APIClient.put<{ commission: SalesCommission }>(`${this.endpoint}/${commissionId}`, updates);
    return response.commission;
  }
}

export class VehicleSaleService {
  private static endpoint = '/automotive/vehicle-sales';

  static async getAllVehicleSales(): Promise<VehicleSale[]> {
    try {
      const response = await APIClient.get<{ vehicleSales?: VehicleSale[] }>(this.endpoint);
      return response.vehicleSales || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createVehicleSale(saleData: Partial<VehicleSale>): Promise<VehicleSale> {
    const response = await APIClient.post<{ vehicleSale: VehicleSale }>(this.endpoint, saleData);
    return response.vehicleSale;
  }
}

export class ServiceSaleService {
  private static endpoint = '/automotive/service-sales';

  static async getAllServiceSales(): Promise<ServiceSale[]> {
    try {
      const response = await APIClient.get<{ serviceSales?: ServiceSale[] }>(this.endpoint);
      return response.serviceSales || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createServiceSale(saleData: Partial<ServiceSale>): Promise<ServiceSale> {
    const response = await APIClient.post<{ serviceSale: ServiceSale }>(this.endpoint, saleData);
    return response.serviceSale;
  }
}

export class CommissionStructureService {
  private static endpoint = '/automotive/commission-structures';

  static async getAllStructures(): Promise<CommissionStructure[]> {
    try {
      const response = await APIClient.get<{ structures?: CommissionStructure[] }>(this.endpoint);
      return response.structures || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createStructure(structureData: Partial<CommissionStructure>): Promise<CommissionStructure> {
    const response = await APIClient.post<{ structure: CommissionStructure }>(this.endpoint, structureData);
    return response.structure;
  }
}

export class CommissionReportService {
  private static endpoint = '/automotive/commission-reports';

  static async generateReport(reportType: string, startDate: Date, endDate: Date, salesPersonId?: string): Promise<CommissionReport> {
    const response = await APIClient.post<{ report: CommissionReport }>(`${this.endpoint}/generate`, {
      reportType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      salesPersonId,
    });
    return response.report;
  }
}

// ============================================================================
// PARTS INVENTORY SERVICES
// ============================================================================

export class PartService {
  private static endpoint = '/automotive/parts';

  static async getAllParts(): Promise<Part[]> {
    try {
      const response = await APIClient.get<{ parts?: Part[] }>(this.endpoint);
      return response.parts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async getPartById(partId: string): Promise<Part | null> {
    try {
      const response = await APIClient.get<{ part?: Part }>(`${this.endpoint}/${partId}`);
      return response.part || null;
    } catch (error: any) {
            return null;
    }
  }

  static async searchParts(query: string): Promise<Part[]> {
    try {
      const response = await APIClient.get<{ parts?: Part[] }>(`${this.endpoint}/search`, { query });
      return response.parts || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createPart(partData: Partial<Part>): Promise<Part> {
    const response = await APIClient.post<{ part: Part }>(this.endpoint, partData);
    return response.part;
  }

  static async updatePart(partId: string, updates: Partial<Part>): Promise<Part> {
    const response = await APIClient.put<{ part: Part }>(`${this.endpoint}/${partId}`, updates);
    return response.part;
  }

  static async getLowStockParts(): Promise<Part[]> {
    try {
      const response = await APIClient.get<{ parts?: Part[] }>(`${this.endpoint}/low-stock`);
      return response.parts || [];
    } catch (error: any) {
            return [];
    }
  }
}

export class InventoryMovementService {
  private static endpoint = '/automotive/inventory-movements';

  static async getAllMovements(): Promise<InventoryMovement[]> {
    try {
      const response = await APIClient.get<{ movements?: InventoryMovement[] }>(this.endpoint);
      return response.movements || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createMovement(movementData: Partial<InventoryMovement>): Promise<InventoryMovement> {
    const response = await APIClient.post<{ movement: InventoryMovement }>(this.endpoint, movementData);
    return response.movement;
  }

  static async getMovementsByPart(partId: string): Promise<InventoryMovement[]> {
    try {
      const response = await APIClient.get<{ movements?: InventoryMovement[] }>(`${this.endpoint}/part/${partId}`);
      return response.movements || [];
    } catch (error: any) {
            return [];
    }
  }
}

export class PurchaseOrderService {
  private static endpoint = '/automotive/purchase-orders';

  static async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const response = await APIClient.get<{ purchaseOrders?: PurchaseOrder[] }>(this.endpoint);
      return response.purchaseOrders || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createPurchaseOrder(poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await APIClient.post<{ purchaseOrder: PurchaseOrder }>(this.endpoint, poData);
    return response.purchaseOrder;
  }

  static async updatePurchaseOrder(poId: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await APIClient.put<{ purchaseOrder: PurchaseOrder }>(`${this.endpoint}/${poId}`, updates);
    return response.purchaseOrder;
  }

  static async receivePurchaseOrder(poId: string, receivedItems: any[]): Promise<PurchaseOrder> {
    const response = await APIClient.post<{ purchaseOrder: PurchaseOrder }>(`${this.endpoint}/${poId}/receive`, { receivedItems });
    return response.purchaseOrder;
  }
}

export class StockAdjustmentService {
  private static endpoint = '/automotive/stock-adjustments';

  static async getAllAdjustments(): Promise<StockAdjustment[]> {
    try {
      const response = await APIClient.get<{ adjustments?: StockAdjustment[] }>(this.endpoint);
      return response.adjustments || [];
    } catch (error: any) {
            return [];
    }
  }

  static async createAdjustment(adjustmentData: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const response = await APIClient.post<{ adjustment: StockAdjustment }>(this.endpoint, adjustmentData);
    return response.adjustment;
  }

  static async updateAdjustment(adjustmentId: string, updates: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const response = await APIClient.put<{ adjustment: StockAdjustment }>(`${this.endpoint}/${adjustmentId}`, updates);
    return response.adjustment;
  }
}

export class InventoryAnalysisService {
  private static endpoint = '/automotive/inventory-analysis';

  static async generateAnalysis(startDate: Date, endDate: Date): Promise<InventoryAnalysis> {
    const response = await APIClient.post<{ analysis: InventoryAnalysis }>(`${this.endpoint}/generate`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.analysis;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AutomotiveSettingsService {
  private static endpoint = '/automotive/settings';

  static async getSettings(): Promise<AutomotiveSettings> {
    const response = await APIClient.get<{ settings: AutomotiveSettings }>(this.endpoint);
    return response.settings;
  }

  static async updateSettings(updates: Partial<AutomotiveSettings>): Promise<AutomotiveSettings> {
    const response = await APIClient.put<{ settings: AutomotiveSettings }>(this.endpoint, updates);
    return response.settings;
  }
}
