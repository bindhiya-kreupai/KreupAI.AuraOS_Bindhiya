'use client';

import { useState, useEffect } from 'react';
import {
  Technician, TechnicianShift, RosterTemplate, ShiftSwapRequest, TimeOffRequest, WorkloadAnalysis,
  SalesCommission, VehicleSale, ServiceSale, CommissionStructure, CommissionReport, SalesPerson,
  Part, InventoryMovement, PurchaseOrder, StockAdjustment, InventoryAnalysis,
  AutomotiveSettings, Toast
} from '../types';
import {
  TechnicianService, ShiftService, RosterTemplateService, ShiftSwapService, TimeOffService, WorkloadAnalysisService,
  SalesPersonService, CommissionService, VehicleSaleService, ServiceSaleService, CommissionStructureService, CommissionReportService,
  PartService, InventoryMovementService, PurchaseOrderService, StockAdjustmentService, InventoryAnalysisService,
  AutomotiveSettingsService
} from '../services';
import {
import { logger } from '@/lib/logger';
  sampleTechnicians, sampleShifts, sampleRosterTemplates, sampleShiftSwapRequests, sampleTimeOffRequests, sampleWorkloadAnalysis,
  sampleSalesPeople, sampleVehicleSales, sampleServiceSales, sampleCommissionStructures, sampleCommissions, sampleCommissionReports,
  sampleParts, sampleInventoryMovements, samplePurchaseOrders, sampleStockAdjustments, sampleInventoryAnalysis,
  sampleAutomotiveSettings
} from '../data';

export const useAutomotive = () => {
  // ============================================================================
  // TECHNICIAN ROSTERING STATE
  // ============================================================================
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [shifts, setShifts] = useState<TechnicianShift[]>([]);
  const [rosterTemplates, setRosterTemplates] = useState<RosterTemplate[]>([]);
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis | null>(null);

  // ============================================================================
  // SALES COMMISSIONS STATE
  // ============================================================================
  const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
  const [commissions, setCommissions] = useState<SalesCommission[]>([]);
  const [vehicleSales, setVehicleSales] = useState<VehicleSale[]>([]);
  const [serviceSales, setServiceSales] = useState<ServiceSale[]>([]);
  const [commissionStructures, setCommissionStructures] = useState<CommissionStructure[]>([]);
  const [commissionReports, setCommissionReports] = useState<CommissionReport[]>([]);

  // ============================================================================
  // PARTS INVENTORY STATE
  // ============================================================================
  const [parts, setParts] = useState<Part[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [inventoryAnalysis, setInventoryAnalysis] = useState<InventoryAnalysis | null>(null);
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);

  // ============================================================================
  // SHARED STATE
  // ============================================================================
  const [settings, setSettings] = useState<AutomotiveSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Check if data exists, if not initialize with sample data
      const existing = await TechnicianService.getAllTechnicians();
      if (existing.length === 0) {
        localStorage.setItem('automotive_technicians', JSON.stringify(sampleTechnicians));
        localStorage.setItem('automotive_shifts', JSON.stringify(sampleShifts));
        localStorage.setItem('automotive_roster_templates', JSON.stringify(sampleRosterTemplates));
        localStorage.setItem('automotive_shift_swaps', JSON.stringify(sampleShiftSwapRequests));
        localStorage.setItem('automotive_time_off', JSON.stringify(sampleTimeOffRequests));
        localStorage.setItem('automotive_sales_people', JSON.stringify(sampleSalesPeople));
        localStorage.setItem('automotive_vehicle_sales', JSON.stringify(sampleVehicleSales));
        localStorage.setItem('automotive_service_sales', JSON.stringify(sampleServiceSales));
        localStorage.setItem('automotive_commission_structures', JSON.stringify(sampleCommissionStructures));
        localStorage.setItem('automotive_commissions', JSON.stringify(sampleCommissions));
        localStorage.setItem('automotive_parts', JSON.stringify(sampleParts));
        localStorage.setItem('automotive_inventory_movements', JSON.stringify(sampleInventoryMovements));
        localStorage.setItem('automotive_purchase_orders', JSON.stringify(samplePurchaseOrders));
        localStorage.setItem('automotive_stock_adjustments', JSON.stringify(sampleStockAdjustments));
      }

      await Promise.all([
        loadTechnicians(),
        loadShifts(),
        loadRosterTemplates(),
        loadShiftSwapRequests(),
        loadTimeOffRequests(),
        loadSalesPeople(),
        loadCommissions(),
        loadVehicleSales(),
        loadServiceSales(),
        loadCommissionStructures(),
        loadParts(),
        loadInventoryMovements(),
        loadPurchaseOrders(),
        loadStockAdjustments(),
        loadSettings(),
      ]);
    } catch (error) {
      logger.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load automotive data' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TECHNICIAN ROSTERING METHODS
  // ============================================================================
  const loadTechnicians = async () => {
    try {
      const data = await TechnicianService.getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      logger.error('Error loading technicians:', error);
    }
  };

  const createTechnician = async (technicianData: Partial<Technician>) => {
    setLoading(true);
    try {
      const technician = await TechnicianService.createTechnician(technicianData);
      await loadTechnicians();
      addToast({ type: 'success', message: 'Technician created successfully' });
      return technician;
    } catch (error) {
      logger.error('Error creating technician:', error);
      addToast({ type: 'error', message: 'Failed to create technician' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTechnician = async (technicianId: string, updates: Partial<Technician>) => {
    setLoading(true);
    try {
      const technician = await TechnicianService.updateTechnician(technicianId, updates);
      await loadTechnicians();
      addToast({ type: 'success', message: 'Technician updated successfully' });
      return technician;
    } catch (error) {
      logger.error('Error updating technician:', error);
      addToast({ type: 'error', message: 'Failed to update technician' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTechnician = async (technicianId: string) => {
    setLoading(true);
    try {
      await TechnicianService.deleteTechnician(technicianId);
      await loadTechnicians();
      addToast({ type: 'success', message: 'Technician deleted successfully' });
    } catch (error) {
      logger.error('Error deleting technician:', error);
      addToast({ type: 'error', message: 'Failed to delete technician' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = async () => {
    try {
      const data = await ShiftService.getAllShifts();
      setShifts(data);
    } catch (error) {
      logger.error('Error loading shifts:', error);
    }
  };

  const createShift = async (shiftData: Partial<TechnicianShift>) => {
    setLoading(true);
    try {
      const shift = await ShiftService.createShift(shiftData);
      await loadShifts();
      addToast({ type: 'success', message: 'Shift created successfully' });
      return shift;
    } catch (error) {
      logger.error('Error creating shift:', error);
      addToast({ type: 'error', message: 'Failed to create shift' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateShift = async (shiftId: string, updates: Partial<TechnicianShift>) => {
    setLoading(true);
    try {
      const shift = await ShiftService.updateShift(shiftId, updates);
      await loadShifts();
      addToast({ type: 'success', message: 'Shift updated successfully' });
      return shift;
    } catch (error) {
      logger.error('Error updating shift:', error);
      addToast({ type: 'error', message: 'Failed to update shift' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bulkCreateShifts = async (shiftsData: Partial<TechnicianShift>[]) => {
    setLoading(true);
    try {
      await ShiftService.bulkCreateShifts(shiftsData);
      await loadShifts();
      addToast({ type: 'success', message: `${shiftsData.length} shifts created successfully` });
    } catch (error) {
      logger.error('Error creating shifts:', error);
      addToast({ type: 'error', message: 'Failed to create shifts' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadRosterTemplates = async () => {
    try {
      const data = await RosterTemplateService.getAllTemplates();
      setRosterTemplates(data);
    } catch (error) {
      logger.error('Error loading roster templates:', error);
    }
  };

  const createRosterTemplate = async (templateData: Partial<RosterTemplate>) => {
    setLoading(true);
    try {
      const template = await RosterTemplateService.createTemplate(templateData);
      await loadRosterTemplates();
      addToast({ type: 'success', message: 'Roster template created successfully' });
      return template;
    } catch (error) {
      logger.error('Error creating roster template:', error);
      addToast({ type: 'error', message: 'Failed to create roster template' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyRosterTemplate = async (templateId: string, startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const shifts = await RosterTemplateService.applyTemplate(templateId, startDate, endDate);
      await loadShifts();
      addToast({ type: 'success', message: 'Roster template applied successfully' });
      return shifts;
    } catch (error) {
      logger.error('Error applying roster template:', error);
      addToast({ type: 'error', message: 'Failed to apply roster template' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadShiftSwapRequests = async () => {
    try {
      const data = await ShiftSwapService.getAllSwapRequests();
      setShiftSwapRequests(data);
    } catch (error) {
      logger.error('Error loading shift swap requests:', error);
    }
  };

  const createShiftSwapRequest = async (requestData: Partial<ShiftSwapRequest>) => {
    setLoading(true);
    try {
      const request = await ShiftSwapService.createSwapRequest(requestData);
      await loadShiftSwapRequests();
      addToast({ type: 'success', message: 'Shift swap request created successfully' });
      return request;
    } catch (error) {
      logger.error('Error creating shift swap request:', error);
      addToast({ type: 'error', message: 'Failed to create shift swap request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateShiftSwapRequest = async (requestId: string, updates: Partial<ShiftSwapRequest>) => {
    setLoading(true);
    try {
      const request = await ShiftSwapService.updateSwapRequest(requestId, updates);
      await loadShiftSwapRequests();
      addToast({ type: 'success', message: 'Shift swap request updated successfully' });
      return request;
    } catch (error) {
      logger.error('Error updating shift swap request:', error);
      addToast({ type: 'error', message: 'Failed to update shift swap request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTimeOffRequests = async () => {
    try {
      const data = await TimeOffService.getAllTimeOffRequests();
      setTimeOffRequests(data);
    } catch (error) {
      logger.error('Error loading time off requests:', error);
    }
  };

  const createTimeOffRequest = async (requestData: Partial<TimeOffRequest>) => {
    setLoading(true);
    try {
      const request = await TimeOffService.createTimeOffRequest(requestData);
      await loadTimeOffRequests();
      addToast({ type: 'success', message: 'Time off request created successfully' });
      return request;
    } catch (error) {
      logger.error('Error creating time off request:', error);
      addToast({ type: 'error', message: 'Failed to create time off request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeOffRequest = async (requestId: string, updates: Partial<TimeOffRequest>) => {
    setLoading(true);
    try {
      const request = await TimeOffService.updateTimeOffRequest(requestId, updates);
      await loadTimeOffRequests();
      addToast({ type: 'success', message: 'Time off request updated successfully' });
      return request;
    } catch (error) {
      logger.error('Error updating time off request:', error);
      addToast({ type: 'error', message: 'Failed to update time off request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateWorkloadAnalysis = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const analysis = await WorkloadAnalysisService.getWorkloadAnalysis(startDate, endDate);
      setWorkloadAnalysis(analysis);
      addToast({ type: 'success', message: 'Workload analysis generated successfully' });
      return analysis;
    } catch (error) {
      logger.error('Error generating workload analysis:', error);
      addToast({ type: 'error', message: 'Failed to generate workload analysis' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SALES COMMISSIONS METHODS
  // ============================================================================
  const loadSalesPeople = async () => {
    try {
      const data = await SalesPersonService.getAllSalesPeople();
      setSalesPeople(data);
    } catch (error) {
      logger.error('Error loading sales people:', error);
    }
  };

  const createSalesPerson = async (salesPersonData: Partial<SalesPerson>) => {
    setLoading(true);
    try {
      const salesPerson = await SalesPersonService.createSalesPerson(salesPersonData);
      await loadSalesPeople();
      addToast({ type: 'success', message: 'Sales person created successfully' });
      return salesPerson;
    } catch (error) {
      logger.error('Error creating sales person:', error);
      addToast({ type: 'error', message: 'Failed to create sales person' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadCommissions = async () => {
    try {
      const data = await CommissionService.getAllCommissions();
      setCommissions(data);
    } catch (error) {
      logger.error('Error loading commissions:', error);
    }
  };

  const calculateCommission = async (salesPersonId: string, startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const commission = await CommissionService.calculateCommission(salesPersonId, startDate, endDate);
      await loadCommissions();
      addToast({ type: 'success', message: 'Commission calculated successfully' });
      return commission;
    } catch (error) {
      logger.error('Error calculating commission:', error);
      addToast({ type: 'error', message: 'Failed to calculate commission' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCommission = async (commissionId: string, updates: Partial<SalesCommission>) => {
    setLoading(true);
    try {
      const commission = await CommissionService.updateCommission(commissionId, updates);
      await loadCommissions();
      addToast({ type: 'success', message: 'Commission updated successfully' });
      return commission;
    } catch (error) {
      logger.error('Error updating commission:', error);
      addToast({ type: 'error', message: 'Failed to update commission' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleSales = async () => {
    try {
      const data = await VehicleSaleService.getAllVehicleSales();
      setVehicleSales(data);
    } catch (error) {
      logger.error('Error loading vehicle sales:', error);
    }
  };

  const createVehicleSale = async (saleData: Partial<VehicleSale>) => {
    setLoading(true);
    try {
      const sale = await VehicleSaleService.createVehicleSale(saleData);
      await loadVehicleSales();
      addToast({ type: 'success', message: 'Vehicle sale recorded successfully' });
      return sale;
    } catch (error) {
      logger.error('Error creating vehicle sale:', error);
      addToast({ type: 'error', message: 'Failed to record vehicle sale' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadServiceSales = async () => {
    try {
      const data = await ServiceSaleService.getAllServiceSales();
      setServiceSales(data);
    } catch (error) {
      logger.error('Error loading service sales:', error);
    }
  };

  const createServiceSale = async (saleData: Partial<ServiceSale>) => {
    setLoading(true);
    try {
      const sale = await ServiceSaleService.createServiceSale(saleData);
      await loadServiceSales();
      addToast({ type: 'success', message: 'Service sale recorded successfully' });
      return sale;
    } catch (error) {
      logger.error('Error creating service sale:', error);
      addToast({ type: 'error', message: 'Failed to record service sale' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadCommissionStructures = async () => {
    try {
      const data = await CommissionStructureService.getAllStructures();
      setCommissionStructures(data);
    } catch (error) {
      logger.error('Error loading commission structures:', error);
    }
  };

  const createCommissionStructure = async (structureData: Partial<CommissionStructure>) => {
    setLoading(true);
    try {
      const structure = await CommissionStructureService.createStructure(structureData);
      await loadCommissionStructures();
      addToast({ type: 'success', message: 'Commission structure created successfully' });
      return structure;
    } catch (error) {
      logger.error('Error creating commission structure:', error);
      addToast({ type: 'error', message: 'Failed to create commission structure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateCommissionReport = async (reportType: string, startDate: Date, endDate: Date, salesPersonId?: string) => {
    setLoading(true);
    try {
      const report = await CommissionReportService.generateReport(reportType, startDate, endDate, salesPersonId);
      addToast({ type: 'success', message: 'Commission report generated successfully' });
      return report;
    } catch (error) {
      logger.error('Error generating commission report:', error);
      addToast({ type: 'error', message: 'Failed to generate commission report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PARTS INVENTORY METHODS
  // ============================================================================
  const loadParts = async () => {
    try {
      const data = await PartService.getAllParts();
      setParts(data);
      const lowStock = await PartService.getLowStockParts();
      setLowStockParts(lowStock);
    } catch (error) {
      logger.error('Error loading parts:', error);
    }
  };

  const createPart = async (partData: Partial<Part>) => {
    setLoading(true);
    try {
      const part = await PartService.createPart(partData);
      await loadParts();
      addToast({ type: 'success', message: 'Part created successfully' });
      return part;
    } catch (error) {
      logger.error('Error creating part:', error);
      addToast({ type: 'error', message: 'Failed to create part' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePart = async (partId: string, updates: Partial<Part>) => {
    setLoading(true);
    try {
      const part = await PartService.updatePart(partId, updates);
      await loadParts();
      addToast({ type: 'success', message: 'Part updated successfully' });
      return part;
    } catch (error) {
      logger.error('Error updating part:', error);
      addToast({ type: 'error', message: 'Failed to update part' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchParts = async (query: string) => {
    setLoading(true);
    try {
      const results = await PartService.searchParts(query);
      return results;
    } catch (error) {
      logger.error('Error searching parts:', error);
      addToast({ type: 'error', message: 'Failed to search parts' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryMovements = async () => {
    try {
      const data = await InventoryMovementService.getAllMovements();
      setInventoryMovements(data);
    } catch (error) {
      logger.error('Error loading inventory movements:', error);
    }
  };

  const createInventoryMovement = async (movementData: Partial<InventoryMovement>) => {
    setLoading(true);
    try {
      const movement = await InventoryMovementService.createMovement(movementData);
      await loadInventoryMovements();
      await loadParts(); // Refresh parts to update quantities
      addToast({ type: 'success', message: 'Inventory movement recorded successfully' });
      return movement;
    } catch (error) {
      logger.error('Error creating inventory movement:', error);
      addToast({ type: 'error', message: 'Failed to record inventory movement' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const data = await PurchaseOrderService.getAllPurchaseOrders();
      setPurchaseOrders(data);
    } catch (error) {
      logger.error('Error loading purchase orders:', error);
    }
  };

  const createPurchaseOrder = async (poData: Partial<PurchaseOrder>) => {
    setLoading(true);
    try {
      const po = await PurchaseOrderService.createPurchaseOrder(poData);
      await loadPurchaseOrders();
      addToast({ type: 'success', message: 'Purchase order created successfully' });
      return po;
    } catch (error) {
      logger.error('Error creating purchase order:', error);
      addToast({ type: 'error', message: 'Failed to create purchase order' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePurchaseOrder = async (poId: string, updates: Partial<PurchaseOrder>) => {
    setLoading(true);
    try {
      const po = await PurchaseOrderService.updatePurchaseOrder(poId, updates);
      await loadPurchaseOrders();
      addToast({ type: 'success', message: 'Purchase order updated successfully' });
      return po;
    } catch (error) {
      logger.error('Error updating purchase order:', error);
      addToast({ type: 'error', message: 'Failed to update purchase order' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const receivePurchaseOrder = async (poId: string, receivedItems: any[]) => {
    setLoading(true);
    try {
      const po = await PurchaseOrderService.receivePurchaseOrder(poId, receivedItems);
      await loadPurchaseOrders();
      await loadParts(); // Refresh parts to update quantities
      addToast({ type: 'success', message: 'Purchase order received successfully' });
      return po;
    } catch (error) {
      logger.error('Error receiving purchase order:', error);
      addToast({ type: 'error', message: 'Failed to receive purchase order' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadStockAdjustments = async () => {
    try {
      const data = await StockAdjustmentService.getAllAdjustments();
      setStockAdjustments(data);
    } catch (error) {
      logger.error('Error loading stock adjustments:', error);
    }
  };

  const createStockAdjustment = async (adjustmentData: Partial<StockAdjustment>) => {
    setLoading(true);
    try {
      const adjustment = await StockAdjustmentService.createAdjustment(adjustmentData);
      await loadStockAdjustments();
      addToast({ type: 'success', message: 'Stock adjustment created successfully' });
      return adjustment;
    } catch (error) {
      logger.error('Error creating stock adjustment:', error);
      addToast({ type: 'error', message: 'Failed to create stock adjustment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStockAdjustment = async (adjustmentId: string, updates: Partial<StockAdjustment>) => {
    setLoading(true);
    try {
      const adjustment = await StockAdjustmentService.updateAdjustment(adjustmentId, updates);
      await loadStockAdjustments();
      if (updates.status === 'approved') {
        await loadParts(); // Refresh parts to update quantities
      }
      addToast({ type: 'success', message: 'Stock adjustment updated successfully' });
      return adjustment;
    } catch (error) {
      logger.error('Error updating stock adjustment:', error);
      addToast({ type: 'error', message: 'Failed to update stock adjustment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryAnalysis = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const analysis = await InventoryAnalysisService.generateAnalysis(startDate, endDate);
      setInventoryAnalysis(analysis);
      addToast({ type: 'success', message: 'Inventory analysis generated successfully' });
      return analysis;
    } catch (error) {
      logger.error('Error generating inventory analysis:', error);
      addToast({ type: 'error', message: 'Failed to generate inventory analysis' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SETTINGS METHODS
  // ============================================================================
  const loadSettings = async () => {
    try {
      const data = await AutomotiveSettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      logger.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<AutomotiveSettings>) => {
    setLoading(true);
    try {
      const updated = await AutomotiveSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated successfully' });
      return updated;
    } catch (error) {
      logger.error('Error updating settings:', error);
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // TOAST METHODS
  // ============================================================================
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Technician Rostering
    technicians,
    shifts,
    rosterTemplates,
    shiftSwapRequests,
    timeOffRequests,
    workloadAnalysis,
    loadTechnicians,
    createTechnician,
    updateTechnician,
    deleteTechnician,
    loadShifts,
    createShift,
    updateShift,
    bulkCreateShifts,
    loadRosterTemplates,
    createRosterTemplate,
    applyRosterTemplate,
    loadShiftSwapRequests,
    createShiftSwapRequest,
    updateShiftSwapRequest,
    loadTimeOffRequests,
    createTimeOffRequest,
    updateTimeOffRequest,
    generateWorkloadAnalysis,

    // Sales Commissions
    salesPeople,
    commissions,
    vehicleSales,
    serviceSales,
    commissionStructures,
    commissionReports,
    loadSalesPeople,
    createSalesPerson,
    loadCommissions,
    calculateCommission,
    updateCommission,
    loadVehicleSales,
    createVehicleSale,
    loadServiceSales,
    createServiceSale,
    loadCommissionStructures,
    createCommissionStructure,
    generateCommissionReport,

    // Parts Inventory
    parts,
    inventoryMovements,
    purchaseOrders,
    stockAdjustments,
    inventoryAnalysis,
    lowStockParts,
    loadParts,
    createPart,
    updatePart,
    searchParts,
    loadInventoryMovements,
    createInventoryMovement,
    loadPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    receivePurchaseOrder,
    loadStockAdjustments,
    createStockAdjustment,
    updateStockAdjustment,
    generateInventoryAnalysis,

    // Shared
    settings,
    loading,
    toasts,
    loadSettings,
    updateSettings,
    addToast,
    removeToast,
  };
};
