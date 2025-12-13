// Automotive Module - Service Layer

import {
  Technician, TechnicianShift, RosterTemplate, ShiftSwapRequest, TimeOffRequest, WorkloadAnalysis,
  SalesCommission, VehicleSale, ServiceSale, CommissionStructure, CommissionReport, SalesPerson,
  Part, InventoryMovement, PurchaseOrder, StockAdjustment, InventoryAnalysis,
  AutomotiveSettings
} from './types';

const STORAGE_KEYS = {
  TECHNICIANS: 'automotive_technicians',
  SHIFTS: 'automotive_shifts',
  ROSTER_TEMPLATES: 'automotive_roster_templates',
  SHIFT_SWAPS: 'automotive_shift_swaps',
  TIME_OFF: 'automotive_time_off',
  WORKLOAD: 'automotive_workload',
  COMMISSIONS: 'automotive_commissions',
  VEHICLE_SALES: 'automotive_vehicle_sales',
  SERVICE_SALES: 'automotive_service_sales',
  COMMISSION_STRUCTURES: 'automotive_commission_structures',
  COMMISSION_REPORTS: 'automotive_commission_reports',
  SALES_PEOPLE: 'automotive_sales_people',
  PARTS: 'automotive_parts',
  INVENTORY_MOVEMENTS: 'automotive_inventory_movements',
  PURCHASE_ORDERS: 'automotive_purchase_orders',
  STOCK_ADJUSTMENTS: 'automotive_stock_adjustments',
  INVENTORY_ANALYSIS: 'automotive_inventory_analysis',
  SETTINGS: 'automotive_settings',
};

// ============================================================================
// TECHNICIAN ROSTERING SERVICES
// ============================================================================

export class TechnicianService {
  static async getAllTechnicians(): Promise<Technician[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return data ? JSON.parse(data) : [];
  }

  static async getTechnicianById(technicianId: string): Promise<Technician | null> {
    const technicians = await this.getAllTechnicians();
    return technicians.find(t => t.technicianId === technicianId) || null;
  }

  static async createTechnician(technicianData: Partial<Technician>): Promise<Technician> {
    const technicians = await this.getAllTechnicians();
    const newTechnician: Technician = {
      technicianId: `tech-${Date.now()}`,
      employeeId: technicianData.employeeId || '',
      firstName: technicianData.firstName || '',
      lastName: technicianData.lastName || '',
      email: technicianData.email || '',
      phone: technicianData.phone || '',
      certifications: technicianData.certifications || [],
      specializations: technicianData.specializations || [],
      skillLevel: technicianData.skillLevel || 'journeyman',
      hourlyRate: technicianData.hourlyRate || 0,
      employmentType: technicianData.employmentType || 'full_time',
      availability: technicianData.availability || [],
      performanceMetrics: technicianData.performanceMetrics || {
        averageJobTime: 0,
        jobsCompleted: 0,
        customerSatisfactionScore: 0,
        qualityScore: 0,
        efficiency: 0,
        comebackRate: 0,
        lastReviewDate: new Date(),
      },
      status: 'active',
      hireDate: technicianData.hireDate || new Date(),
      department: technicianData.department || 'Service',
      ...technicianData,
    };

    technicians.push(newTechnician);
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
    return newTechnician;
  }

  static async updateTechnician(technicianId: string, updates: Partial<Technician>): Promise<Technician> {
    const technicians = await this.getAllTechnicians();
    const index = technicians.findIndex(t => t.technicianId === technicianId);
    if (index === -1) throw new Error('Technician not found');

    technicians[index] = { ...technicians[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
    return technicians[index];
  }

  // TODO: Replace with actual API calls
  static async deleteTechnician(technicianId: string): Promise<void> {
    const technicians = await this.getAllTechnicians();
    const filtered = technicians.filter(t => t.technicianId !== technicianId);
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(filtered));
  }
}

export class ShiftService {
  static async getAllShifts(): Promise<TechnicianShift[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return data ? JSON.parse(data) : [];
  }

  static async getShiftsByTechnician(technicianId: string, startDate?: Date, endDate?: Date): Promise<TechnicianShift[]> {
    const shifts = await this.getAllShifts();
    return shifts.filter(s => s.technicianId === technicianId);
  }

  static async getShiftsByDate(date: Date): Promise<TechnicianShift[]> {
    const shifts = await this.getAllShifts();
    return shifts.filter(s => new Date(s.date).toDateString() === date.toDateString());
  }

  static async createShift(shiftData: Partial<TechnicianShift>): Promise<TechnicianShift> {
    const shifts = await this.getAllShifts();
    const newShift: TechnicianShift = {
      shiftId: `shift-${Date.now()}`,
      technicianId: shiftData.technicianId || '',
      technicianName: shiftData.technicianName || '',
      date: shiftData.date || new Date(),
      shiftType: shiftData.shiftType || 'morning',
      startTime: shiftData.startTime || '08:00',
      endTime: shiftData.endTime || '17:00',
      breakDuration: shiftData.breakDuration || 60,
      location: shiftData.location || 'Main Service Center',
      assignedJobs: shiftData.assignedJobs || [],
      status: 'scheduled',
      ...shiftData,
    };

    shifts.push(newShift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return newShift;
  }

  static async updateShift(shiftId: string, updates: Partial<TechnicianShift>): Promise<TechnicianShift> {
    const shifts = await this.getAllShifts();
    const index = shifts.findIndex(s => s.shiftId === shiftId);
    if (index === -1) throw new Error('Shift not found');

    shifts[index] = { ...shifts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    return shifts[index];
  }

  // TODO: Replace with actual API calls
  static async bulkCreateShifts(shifts: Partial<TechnicianShift>[]): Promise<TechnicianShift[]> {
    const created: TechnicianShift[] = [];
    for (const shiftData of shifts) {
      const shift = await this.createShift(shiftData);
      created.push(shift);
    }
    return created;
  }
}

export class RosterTemplateService {
  static async getAllTemplates(): Promise<RosterTemplate[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ROSTER_TEMPLATES);
    return data ? JSON.parse(data) : [];
  }

  static async createTemplate(templateData: Partial<RosterTemplate>): Promise<RosterTemplate> {
    const templates = await this.getAllTemplates();
    const newTemplate: RosterTemplate = {
      templateId: `template-${Date.now()}`,
      templateName: templateData.templateName || 'New Template',
      description: templateData.description || '',
      weekPattern: templateData.weekPattern || [],
      effectiveFrom: templateData.effectiveFrom || new Date(),
      isActive: templateData.isActive ?? true,
      createdBy: 'current-user',
      createdDate: new Date(),
      ...templateData,
    };

    templates.push(newTemplate);
    localStorage.setItem(STORAGE_KEYS.ROSTER_TEMPLATES, JSON.stringify(templates));
    return newTemplate;
  }

  // TODO: Replace with actual API calls
  static async applyTemplate(templateId: string, startDate: Date, endDate: Date): Promise<TechnicianShift[]> {
    // Logic to generate shifts from template
    return [];
  }
}

export class ShiftSwapService {
  static async getAllSwapRequests(): Promise<ShiftSwapRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SHIFT_SWAPS);
    return data ? JSON.parse(data) : [];
  }

  static async createSwapRequest(requestData: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> {
    const requests = await this.getAllSwapRequests();
    const newRequest: ShiftSwapRequest = {
      requestId: `swap-${Date.now()}`,
      requestingTechnicianId: requestData.requestingTechnicianId || '',
      requestingTechnicianName: requestData.requestingTechnicianName || '',
      originalShiftId: requestData.originalShiftId || '',
      reason: requestData.reason || '',
      requestDate: new Date(),
      status: 'pending',
      ...requestData,
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.SHIFT_SWAPS, JSON.stringify(requests));
    return newRequest;
  }

  static async updateSwapRequest(requestId: string, updates: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> {
    const requests = await this.getAllSwapRequests();
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index === -1) throw new Error('Swap request not found');

    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SHIFT_SWAPS, JSON.stringify(requests));
    return requests[index];
  }
}

export class TimeOffService {
  static async getAllTimeOffRequests(): Promise<TimeOffRequest[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TIME_OFF);
    return data ? JSON.parse(data) : [];
  }

  static async createTimeOffRequest(requestData: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const requests = await this.getAllTimeOffRequests();
    const newRequest: TimeOffRequest = {
      requestId: `timeoff-${Date.now()}`,
      technicianId: requestData.technicianId || '',
      technicianName: requestData.technicianName || '',
      startDate: requestData.startDate || new Date(),
      endDate: requestData.endDate || new Date(),
      requestType: requestData.requestType || 'vacation',
      affectedShifts: requestData.affectedShifts || [],
      coverageArranged: requestData.coverageArranged || false,
      requestDate: new Date(),
      status: 'pending',
      ...requestData,
    };

    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.TIME_OFF, JSON.stringify(requests));
    return newRequest;
  }

  static async updateTimeOffRequest(requestId: string, updates: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const requests = await this.getAllTimeOffRequests();
    const index = requests.findIndex(r => r.requestId === requestId);
    if (index === -1) throw new Error('Time off request not found');

    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TIME_OFF, JSON.stringify(requests));
    return requests[index];
  }
}

export class WorkloadAnalysisService {
  static async getWorkloadAnalysis(startDate: Date, endDate: Date): Promise<WorkloadAnalysis> {
    // TODO: Replace with actual API call to generate analysis
    const analysis: WorkloadAnalysis = {
      analysisId: `analysis-${Date.now()}`,
      period: { start: startDate, end: endDate },
      totalJobs: 0,
      totalHours: 0,
      averageJobsPerTechnician: 0,
      averageHoursPerTechnician: 0,
      utilizationRate: 0,
      overtimeHours: 0,
      technicianWorkload: [],
      recommendations: [],
      generatedDate: new Date(),
    };
    return analysis;
  }
}

// ============================================================================
// SALES COMMISSIONS SERVICES
// ============================================================================

export class SalesPersonService {
  static async getAllSalesPeople(): Promise<SalesPerson[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SALES_PEOPLE);
    return data ? JSON.parse(data) : [];
  }

  static async createSalesPerson(salesPersonData: Partial<SalesPerson>): Promise<SalesPerson> {
    const salesPeople = await this.getAllSalesPeople();
    const newSalesPerson: SalesPerson = {
      salesPersonId: `sp-${Date.now()}`,
      employeeId: salesPersonData.employeeId || '',
      firstName: salesPersonData.firstName || '',
      lastName: salesPersonData.lastName || '',
      email: salesPersonData.email || '',
      phone: salesPersonData.phone || '',
      department: salesPersonData.department || 'new_vehicles',
      hireDate: salesPersonData.hireDate || new Date(),
      commissionStructureId: salesPersonData.commissionStructureId || '',
      performanceMetrics: salesPersonData.performanceMetrics || {
        ytdSales: 0,
        ytdCommissions: 0,
        ytdUnits: 0,
        mtdSales: 0,
        mtdCommissions: 0,
        mtdUnits: 0,
        averageDealSize: 0,
        closingRate: 0,
        customerSatisfactionScore: 0,
        lastReviewDate: new Date(),
      },
      status: 'active',
      ...salesPersonData,
    };

    salesPeople.push(newSalesPerson);
    localStorage.setItem(STORAGE_KEYS.SALES_PEOPLE, JSON.stringify(salesPeople));
    return newSalesPerson;
  }
}

export class CommissionService {
  static async getAllCommissions(): Promise<SalesCommission[]> {
    const data = localStorage.getItem(STORAGE_KEYS.COMMISSIONS);
    return data ? JSON.parse(data) : [];
  }

  static async calculateCommission(salesPersonId: string, startDate: Date, endDate: Date): Promise<SalesCommission> {
    // TODO: Replace with actual API call to calculate commissions
    const commission: SalesCommission = {
      commissionId: `comm-${Date.now()}`,
      salesPersonId,
      salesPersonName: '',
      period: { start: startDate, end: endDate },
      vehicleSales: [],
      serviceSales: [],
      totalVehicleSales: 0,
      totalServiceSales: 0,
      totalSalesAmount: 0,
      baseCommission: 0,
      bonuses: [],
      totalBonuses: 0,
      deductions: [],
      totalDeductions: 0,
      netCommission: 0,
      commissionRate: 0,
      status: 'calculated',
      calculatedDate: new Date(),
    };

    const commissions = await this.getAllCommissions();
    commissions.push(commission);
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
    return commission;
  }

  static async updateCommission(commissionId: string, updates: Partial<SalesCommission>): Promise<SalesCommission> {
    const commissions = await this.getAllCommissions();
    const index = commissions.findIndex(c => c.commissionId === commissionId);
    if (index === -1) throw new Error('Commission not found');

    commissions[index] = { ...commissions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
    return commissions[index];
  }
}

export class VehicleSaleService {
  static async getAllVehicleSales(): Promise<VehicleSale[]> {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLE_SALES);
    return data ? JSON.parse(data) : [];
  }

  static async createVehicleSale(saleData: Partial<VehicleSale>): Promise<VehicleSale> {
    const sales = await this.getAllVehicleSales();
    const newSale: VehicleSale = {
      saleId: `vs-${Date.now()}`,
      vehicleId: saleData.vehicleId || '',
      vehicleMake: saleData.vehicleMake || '',
      vehicleModel: saleData.vehicleModel || '',
      vehicleYear: saleData.vehicleYear || new Date().getFullYear(),
      vin: saleData.vin || '',
      saleType: saleData.saleType || 'new',
      salePrice: saleData.salePrice || 0,
      cost: saleData.cost || 0,
      grossProfit: saleData.grossProfit || 0,
      customerId: saleData.customerId || '',
      customerName: saleData.customerName || '',
      saleDate: saleData.saleDate || new Date(),
      totalCommission: saleData.totalCommission || 0,
      commissionRate: saleData.commissionRate || 0,
      invoiceNumber: saleData.invoiceNumber || '',
      status: 'pending',
      ...saleData,
    };

    sales.push(newSale);
    localStorage.setItem(STORAGE_KEYS.VEHICLE_SALES, JSON.stringify(sales));
    return newSale;
  }
}

export class ServiceSaleService {
  static async getAllServiceSales(): Promise<ServiceSale[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_SALES);
    return data ? JSON.parse(data) : [];
  }

  static async createServiceSale(saleData: Partial<ServiceSale>): Promise<ServiceSale> {
    const sales = await this.getAllServiceSales();
    const newSale: ServiceSale = {
      serviceId: `ss-${Date.now()}`,
      customerId: saleData.customerId || '',
      customerName: saleData.customerName || '',
      vehicleId: saleData.vehicleId || '',
      serviceType: saleData.serviceType || 'maintenance',
      serviceDescription: saleData.serviceDescription || '',
      serviceDate: saleData.serviceDate || new Date(),
      laborAmount: saleData.laborAmount || 0,
      partsAmount: saleData.partsAmount || 0,
      totalAmount: saleData.totalAmount || 0,
      commissionableAmount: saleData.commissionableAmount || 0,
      commissionRate: saleData.commissionRate || 0,
      commissionAmount: saleData.commissionAmount || 0,
      serviceAdvisorId: saleData.serviceAdvisorId || '',
      invoiceNumber: saleData.invoiceNumber || '',
      isPaid: saleData.isPaid || false,
      ...saleData,
    };

    sales.push(newSale);
    localStorage.setItem(STORAGE_KEYS.SERVICE_SALES, JSON.stringify(sales));
    return newSale;
  }
}

export class CommissionStructureService {
  static async getAllStructures(): Promise<CommissionStructure[]> {
    const data = localStorage.getItem(STORAGE_KEYS.COMMISSION_STRUCTURES);
    return data ? JSON.parse(data) : [];
  }

  static async createStructure(structureData: Partial<CommissionStructure>): Promise<CommissionStructure> {
    const structures = await this.getAllStructures();
    const newStructure: CommissionStructure = {
      structureId: `cs-${Date.now()}`,
      structureName: structureData.structureName || 'New Structure',
      description: structureData.description || '',
      applicableTo: structureData.applicableTo || 'all',
      commissionType: structureData.commissionType || 'percentage',
      effectiveFrom: structureData.effectiveFrom || new Date(),
      isActive: true,
      createdBy: 'current-user',
      createdDate: new Date(),
      ...structureData,
    };

    structures.push(newStructure);
    localStorage.setItem(STORAGE_KEYS.COMMISSION_STRUCTURES, JSON.stringify(structures));
    return newStructure;
  }
}

export class CommissionReportService {
  static async generateReport(reportType: string, startDate: Date, endDate: Date, salesPersonId?: string): Promise<CommissionReport> {
    // TODO: Replace with actual API call
    const report: CommissionReport = {
      reportId: `report-${Date.now()}`,
      reportType: reportType as any,
      period: { start: startDate, end: endDate },
      salesPersonId,
      totalSales: 0,
      totalCommissions: 0,
      averageCommissionRate: 0,
      topPerformers: [],
      trends: [],
      generatedDate: new Date(),
      generatedBy: 'current-user',
    };
    return report;
  }
}

// ============================================================================
// PARTS INVENTORY SERVICES
// ============================================================================

export class PartService {
  static async getAllParts(): Promise<Part[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PARTS);
    return data ? JSON.parse(data) : [];
  }

  static async getPartById(partId: string): Promise<Part | null> {
    const parts = await this.getAllParts();
    return parts.find(p => p.partId === partId) || null;
  }

  static async searchParts(query: string): Promise<Part[]> {
    const parts = await this.getAllParts();
    return parts.filter(p =>
      p.partNumber.toLowerCase().includes(query.toLowerCase()) ||
      p.partName.toLowerCase().includes(query.toLowerCase())
    );
  }

  static async createPart(partData: Partial<Part>): Promise<Part> {
    const parts = await this.getAllParts();
    const newPart: Part = {
      partId: `part-${Date.now()}`,
      partNumber: partData.partNumber || '',
      partName: partData.partName || '',
      description: partData.description || '',
      category: partData.category || '',
      manufacturer: partData.manufacturer || '',
      applicableVehicles: partData.applicableVehicles || [],
      unitOfMeasure: partData.unitOfMeasure || 'EA',
      cost: partData.cost || 0,
      retailPrice: partData.retailPrice || 0,
      markup: partData.markup || 0,
      quantityOnHand: partData.quantityOnHand || 0,
      quantityOnOrder: partData.quantityOnOrder || 0,
      quantityReserved: partData.quantityReserved || 0,
      quantityAvailable: partData.quantityAvailable || 0,
      reorderPoint: partData.reorderPoint || 0,
      reorderQuantity: partData.reorderQuantity || 0,
      minStockLevel: partData.minStockLevel || 0,
      maxStockLevel: partData.maxStockLevel || 0,
      leadTimeDays: partData.leadTimeDays || 0,
      binLocation: partData.binLocation || '',
      isSerialized: partData.isSerialized || false,
      isCore: partData.isCore || false,
      supplier: partData.supplier || {
        supplierId: '',
        supplierName: '',
        leadTimeDays: 0,
        preferredSupplier: false,
      },
      status: 'in_stock',
      createdDate: new Date(),
      updatedDate: new Date(),
      ...partData,
    };

    parts.push(newPart);
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
    return newPart;
  }

  static async updatePart(partId: string, updates: Partial<Part>): Promise<Part> {
    const parts = await this.getAllParts();
    const index = parts.findIndex(p => p.partId === partId);
    if (index === -1) throw new Error('Part not found');

    parts[index] = { ...parts[index], ...updates, updatedDate: new Date() };
    localStorage.setItem(STORAGE_KEYS.PARTS, JSON.stringify(parts));
    return parts[index];
  }

  static async getLowStockParts(): Promise<Part[]> {
    const parts = await this.getAllParts();
    return parts.filter(p => p.quantityOnHand <= p.reorderPoint);
  }
}

export class InventoryMovementService {
  static async getAllMovements(): Promise<InventoryMovement[]> {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createMovement(movementData: Partial<InventoryMovement>): Promise<InventoryMovement> {
    const movements = await this.getAllMovements();
    const newMovement: InventoryMovement = {
      movementId: `move-${Date.now()}`,
      partId: movementData.partId || '',
      partNumber: movementData.partNumber || '',
      partName: movementData.partName || '',
      movementType: movementData.movementType || 'adjustment',
      quantity: movementData.quantity || 0,
      performedBy: 'current-user',
      movementDate: new Date(),
      ...movementData,
    };

    movements.push(newMovement);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(movements));
    return newMovement;
  }

  static async getMovementsByPart(partId: string): Promise<InventoryMovement[]> {
    const movements = await this.getAllMovements();
    return movements.filter(m => m.partId === partId);
  }
}

export class PurchaseOrderService {
  static async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    return data ? JSON.parse(data) : [];
  }

  static async createPurchaseOrder(poData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const orders = await this.getAllPurchaseOrders();
    const newOrder: PurchaseOrder = {
      purchaseOrderId: `po-${Date.now()}`,
      poNumber: `PO-${Date.now()}`,
      supplierId: poData.supplierId || '',
      supplierName: poData.supplierName || '',
      orderDate: new Date(),
      expectedDeliveryDate: poData.expectedDeliveryDate || new Date(),
      items: poData.items || [],
      subtotal: poData.subtotal || 0,
      tax: poData.tax || 0,
      shipping: poData.shipping || 0,
      total: poData.total || 0,
      status: 'draft',
      createdBy: 'current-user',
      ...poData,
    };

    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  static async updatePurchaseOrder(poId: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const orders = await this.getAllPurchaseOrders();
    const index = orders.findIndex(o => o.purchaseOrderId === poId);
    if (index === -1) throw new Error('Purchase order not found');

    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(orders));
    return orders[index];
  }

  // TODO: Replace with actual API call
  static async receivePurchaseOrder(poId: string, receivedItems: any[]): Promise<PurchaseOrder> {
    return this.updatePurchaseOrder(poId, { status: 'received', actualDeliveryDate: new Date() });
  }
}

export class StockAdjustmentService {
  static async getAllAdjustments(): Promise<StockAdjustment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_ADJUSTMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAdjustment(adjustmentData: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const adjustments = await this.getAllAdjustments();
    const newAdjustment: StockAdjustment = {
      adjustmentId: `adj-${Date.now()}`,
      adjustmentDate: new Date(),
      adjustmentType: adjustmentData.adjustmentType || 'physical_count',
      items: adjustmentData.items || [],
      reason: adjustmentData.reason || '',
      totalValue: adjustmentData.totalValue || 0,
      performedBy: 'current-user',
      status: 'draft',
      ...adjustmentData,
    };

    adjustments.push(newAdjustment);
    localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, JSON.stringify(adjustments));
    return newAdjustment;
  }

  static async updateAdjustment(adjustmentId: string, updates: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const adjustments = await this.getAllAdjustments();
    const index = adjustments.findIndex(a => a.adjustmentId === adjustmentId);
    if (index === -1) throw new Error('Adjustment not found');

    adjustments[index] = { ...adjustments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.STOCK_ADJUSTMENTS, JSON.stringify(adjustments));
    return adjustments[index];
  }
}

export class InventoryAnalysisService {
  static async generateAnalysis(startDate: Date, endDate: Date): Promise<InventoryAnalysis> {
    // TODO: Replace with actual API call
    const analysis: InventoryAnalysis = {
      analysisId: `analysis-${Date.now()}`,
      period: { start: startDate, end: endDate },
      totalParts: 0,
      totalValue: 0,
      turnoverRate: 0,
      slowMovingParts: [],
      fastMovingParts: [],
      stockoutParts: [],
      overstockedParts: [],
      deadStock: [],
      reorderRecommendations: [],
      generatedDate: new Date(),
    };
    return analysis;
  }
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export class AutomotiveSettingsService {
  static async getSettings(): Promise<AutomotiveSettings> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return JSON.parse(data);

    const defaultSettings: AutomotiveSettings = {
      settingsId: 'settings-1',
      defaultShiftDuration: 8,
      overtimeThreshold: 40,
      commissionPaymentSchedule: 'monthly',
      inventoryValuationMethod: 'FIFO',
      autoReorderEnabled: false,
      lowStockAlertThreshold: 20,
      defaultMarkupPercentage: 30,
      enableShiftSwaps: true,
      maxShiftSwapsPerMonth: 4,
      requireManagerApproval: true,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'system',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  static async updateSettings(updates: Partial<AutomotiveSettings>): Promise<AutomotiveSettings> {
    const settings = await this.getSettings();
    const updated = {
      ...settings,
      ...updates,
      lastUpdatedDate: new Date(),
      lastUpdatedBy: 'current-user',
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
