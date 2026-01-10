'use client';

import { useState, useEffect } from 'react';
import {
  Employee, OrganizationUnit, EmploymentHistory, EmployeeDocument, Position,
  CostCenter, LifeEvent, MassUpdate, IDCard, LetterRequest, ExitProcess,
  Anniversary, AutoNumberSequence, ProbationRecord, ConfirmationLetter, Asset,
  CoreHRSettings, Toast, DocumentTemplate, LetterTemplate, ClearanceTemplate
} from '../types';
import {
  EmployeeService, OrganizationService, EmploymentHistoryService, DocumentService,
  PositionService, CostCenterService, LifeEventService, MassUpdateService,
  IDCardService, LetterService, ExitService, AnniversaryService, AutoNumberService,
  ProbationService, ConfirmationService, AssetService, CoreHRSettingsService
} from '../services';
import {
  sampleEmployees, sampleOrganizationUnits, sampleEmploymentHistory, sampleEmployeeDocuments,
  samplePositions, sampleCostCenters, sampleLifeEvents, sampleMassUpdates, sampleIDCards,
  sampleLetterRequests, sampleExitProcesses, sampleAnniversaries, sampleAutoNumberSequences,
  sampleProbationRecords, sampleConfirmationLetters, sampleAssets, sampleCoreHRSettings,
  sampleDocumentTemplates, sampleLetterTemplates, sampleClearanceTemplates
} from '../data';

export const useCoreHR = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnit[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<EmploymentHistory[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<DocumentTemplate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [massUpdates, setMassUpdates] = useState<MassUpdate[]>([]);
  const [idCards, setIDCards] = useState<IDCard[]>([]);
  const [letterRequests, setLetterRequests] = useState<LetterRequest[]>([]);
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([]);
  const [exitProcesses, setExitProcesses] = useState<ExitProcess[]>([]);
  const [clearanceTemplates, setClearanceTemplates] = useState<ClearanceTemplate[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [autoNumberSequences, setAutoNumberSequences] = useState<AutoNumberSequence[]>([]);
  const [probationRecords, setProbationRecords] = useState<ProbationRecord[]>([]);
  const [confirmationLetters, setConfirmationLetters] = useState<ConfirmationLetter[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [settings, setSettings] = useState<CoreHRSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existing = await EmployeeService.getAllEmployees();
      if (existing.length === 0) {
        localStorage.setItem('core_hr_employees', JSON.stringify(sampleEmployees));
        localStorage.setItem('core_hr_organization_units', JSON.stringify(sampleOrganizationUnits));
        localStorage.setItem('core_hr_employment_history', JSON.stringify(sampleEmploymentHistory));
        localStorage.setItem('core_hr_documents', JSON.stringify(sampleEmployeeDocuments));
        localStorage.setItem('core_hr_document_templates', JSON.stringify(sampleDocumentTemplates));
        localStorage.setItem('core_hr_positions', JSON.stringify(samplePositions));
        localStorage.setItem('core_hr_cost_centers', JSON.stringify(sampleCostCenters));
        localStorage.setItem('core_hr_life_events', JSON.stringify(sampleLifeEvents));
        localStorage.setItem('core_hr_mass_updates', JSON.stringify(sampleMassUpdates));
        localStorage.setItem('core_hr_id_cards', JSON.stringify(sampleIDCards));
        localStorage.setItem('core_hr_letter_requests', JSON.stringify(sampleLetterRequests));
        localStorage.setItem('core_hr_letter_templates', JSON.stringify(sampleLetterTemplates));
        localStorage.setItem('core_hr_exit_processes', JSON.stringify(sampleExitProcesses));
        localStorage.setItem('core_hr_clearance_templates', JSON.stringify(sampleClearanceTemplates));
        localStorage.setItem('core_hr_anniversaries', JSON.stringify(sampleAnniversaries));
        localStorage.setItem('core_hr_auto_number_sequences', JSON.stringify(sampleAutoNumberSequences));
        localStorage.setItem('core_hr_probation_records', JSON.stringify(sampleProbationRecords));
        localStorage.setItem('core_hr_confirmation_letters', JSON.stringify(sampleConfirmationLetters));
        localStorage.setItem('core_hr_assets', JSON.stringify(sampleAssets));
        localStorage.setItem('core_hr_settings', JSON.stringify(sampleCoreHRSettings));
      }

      await Promise.all([
        loadEmployees(), loadOrganizationUnits(), loadPositions(), loadCostCenters(),
        loadAssets(), loadExitProcesses(), loadAnniversaries(), loadSettings()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load Core HR data' });
    } finally {
      setLoading(false);
    }
  };

  // Employee Methods
  const loadEmployees = async () => {
    const data = await EmployeeService.getAllEmployees();
    setEmployees(data);
  };

  const createEmployee = async (employeeData: Partial<Employee>) => {
    setLoading(true);
    try {
      const employee = await EmployeeService.createEmployee(employeeData);
      await loadEmployees();
      addToast({ type: 'success', message: 'Employee created successfully' });
      return employee;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create employee' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    setLoading(true);
    try {
      const employee = await EmployeeService.updateEmployee(employeeId, updates);
      await loadEmployees();
      addToast({ type: 'success', message: 'Employee updated successfully' });
      return employee;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update employee' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const terminateEmployee = async (employeeId: string, terminationDate: string, reason: string) => {
    setLoading(true);
    try {
      await EmployeeService.terminateEmployee(employeeId, terminationDate, reason);
      await loadEmployees();
      addToast({ type: 'success', message: 'Employee terminated' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to terminate employee' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async (searchTerm: string) => {
    setLoading(true);
    try {
      const results = await EmployeeService.searchEmployees(searchTerm);
      return results;
    } catch (error) {
      addToast({ type: 'error', message: 'Search failed' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Organization Methods
  const loadOrganizationUnits = async () => {
    const data = await OrganizationService.getAllUnits();
    setOrganizationUnits(data);
  };

  const createOrganizationUnit = async (unitData: Partial<OrganizationUnit>) => {
    setLoading(true);
    try {
      const unit = await OrganizationService.createUnit(unitData);
      await loadOrganizationUnits();
      addToast({ type: 'success', message: 'Organization unit created' });
      return unit;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create unit' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationUnit = async (unitId: string, updates: Partial<OrganizationUnit>) => {
    setLoading(true);
    try {
      const unit = await OrganizationService.updateUnit(unitId, updates);
      await loadOrganizationUnits();
      addToast({ type: 'success', message: 'Organization unit updated' });
      return unit;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update unit' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrganizationHierarchy = async () => {
    setLoading(true);
    try {
      const hierarchy = await OrganizationService.getHierarchy();
      return hierarchy;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load hierarchy' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Employment History Methods
  const loadEmploymentHistory = async (employeeId: string) => {
    setLoading(true);
    try {
      const history = await EmploymentHistoryService.getEmployeeHistory(employeeId);
      setEmploymentHistory(history);
      return history;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load history' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordEmploymentChange = async (historyData: Partial<EmploymentHistory>) => {
    setLoading(true);
    try {
      const history = await EmploymentHistoryService.recordChange(historyData);
      addToast({ type: 'success', message: 'Change recorded successfully' });
      return history;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to record change' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Document Methods
  const loadDocuments = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? await DocumentService.getEmployeeDocuments(employeeId)
        : await DocumentService.getAllDocuments();
      setDocuments(data);
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load documents' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentData: Partial<EmployeeDocument>) => {
    setLoading(true);
    try {
      const document = await DocumentService.uploadDocument(documentData);
      await loadDocuments();
      addToast({ type: 'success', message: 'Document uploaded successfully' });
      return document;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to upload document' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (documentId: string, verifiedBy: string) => {
    setLoading(true);
    try {
      await DocumentService.verifyDocument(documentId, verifiedBy);
      await loadDocuments();
      addToast({ type: 'success', message: 'Document verified' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to verify document' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTemplates = async () => {
    const data = await DocumentService.getAllTemplates();
    setDocumentTemplates(data);
  };

  // Position Methods
  const loadPositions = async () => {
    const data = await PositionService.getAllPositions();
    setPositions(data);
  };

  const createPosition = async (positionData: Partial<Position>) => {
    setLoading(true);
    try {
      const position = await PositionService.createPosition(positionData);
      await loadPositions();
      addToast({ type: 'success', message: 'Position created successfully' });
      return position;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async (positionId: string, updates: Partial<Position>) => {
    setLoading(true);
    try {
      const position = await PositionService.updatePosition(positionId, updates);
      await loadPositions();
      addToast({ type: 'success', message: 'Position updated' });
      return position;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    setLoading(true);
    try {
      await PositionService.closePosition(positionId);
      await loadPositions();
      addToast({ type: 'success', message: 'Position closed' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to close position' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cost Center Methods
  const loadCostCenters = async () => {
    const data = await CostCenterService.getAllCostCenters();
    setCostCenters(data);
  };

  const createCostCenter = async (costCenterData: Partial<CostCenter>) => {
    setLoading(true);
    try {
      const costCenter = await CostCenterService.createCostCenter(costCenterData);
      await loadCostCenters();
      addToast({ type: 'success', message: 'Cost center created' });
      return costCenter;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create cost center' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCostCenter = async (costCenterId: string, updates: Partial<CostCenter>) => {
    setLoading(true);
    try {
      const costCenter = await CostCenterService.updateCostCenter(costCenterId, updates);
      await loadCostCenters();
      addToast({ type: 'success', message: 'Cost center updated' });
      return costCenter;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update cost center' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const allocateBudget = async (costCenterId: string, amount: number, year: number) => {
    setLoading(true);
    try {
      await CostCenterService.allocateBudget(costCenterId, amount, year);
      await loadCostCenters();
      addToast({ type: 'success', message: 'Budget allocated' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to allocate budget' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Life Event Methods
  const loadLifeEvents = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? await LifeEventService.getEmployeeEvents(employeeId)
        : await LifeEventService.getAllEvents();
      setLifeEvents(data);
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load life events' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordLifeEvent = async (eventData: Partial<LifeEvent>) => {
    setLoading(true);
    try {
      const event = await LifeEventService.recordEvent(eventData);
      await loadLifeEvents();
      addToast({ type: 'success', message: 'Life event recorded' });
      return event;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to record event' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processLifeEvent = async (eventId: string, processedBy: string) => {
    setLoading(true);
    try {
      await LifeEventService.processEvent(eventId, processedBy);
      await loadLifeEvents();
      addToast({ type: 'success', message: 'Event processed' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to process event' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mass Update Methods
  const loadMassUpdates = async () => {
    const data = await MassUpdateService.getAllUpdates();
    setMassUpdates(data);
  };

  const createMassUpdate = async (updateData: Partial<MassUpdate>) => {
    setLoading(true);
    try {
      const update = await MassUpdateService.createUpdate(updateData);
      await loadMassUpdates();
      addToast({ type: 'success', message: 'Mass update created' });
      return update;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create update' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executeMassUpdate = async (updateId: string, executedBy: string) => {
    setLoading(true);
    try {
      const result = await MassUpdateService.executeUpdate(updateId, executedBy);
      await loadMassUpdates();
      addToast({ type: 'success', message: `Update executed. ${result.successCount} successful, ${result.failureCount} failed` });
      return result;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to execute update' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const previewMassUpdate = async (updateId: string) => {
    setLoading(true);
    try {
      const preview = await MassUpdateService.previewUpdate(updateId);
      return preview;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to generate preview' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ID Card Methods
  const loadIDCards = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? [await IDCardService.getEmployeeCard(employeeId)]
        : await IDCardService.getAllCards();
      setIDCards(data.filter(Boolean));
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load ID cards' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateIDCard = async (employeeId: string, cardType: 'employee' | 'contractor' | 'visitor' | 'temporary') => {
    setLoading(true);
    try {
      const card = await IDCardService.generateCard(employeeId, cardType);
      await loadIDCards();
      addToast({ type: 'success', message: 'ID card generated' });
      return card;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to generate ID card' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deactivateIDCard = async (cardId: string) => {
    setLoading(true);
    try {
      await IDCardService.deactivateCard(cardId);
      await loadIDCards();
      addToast({ type: 'success', message: 'ID card deactivated' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to deactivate card' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Letter Methods
  const loadLetterRequests = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? await LetterService.getEmployeeRequests(employeeId)
        : await LetterService.getAllRequests();
      setLetterRequests(data);
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load letter requests' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestLetter = async (requestData: Partial<LetterRequest>) => {
    setLoading(true);
    try {
      const request = await LetterService.createRequest(requestData);
      await loadLetterRequests();
      addToast({ type: 'success', message: 'Letter request created' });
      return request;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create request' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveLetter = async (requestId: string, approvedBy: string, approverEmployeeId: string) => {
    setLoading(true);
    try {
      await LetterService.approveRequest(requestId, approvedBy, approverEmployeeId);
      await loadLetterRequests();
      addToast({ type: 'success', message: 'Letter approved and generated' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to approve letter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadLetterTemplates = async () => {
    const data = await LetterService.getAllTemplates();
    setLetterTemplates(data);
  };

  // Exit Management Methods
  const loadExitProcesses = async () => {
    const data = await ExitService.getAllExits();
    setExitProcesses(data);
  };

  const initiateExit = async (exitData: Partial<ExitProcess>) => {
    setLoading(true);
    try {
      const exit = await ExitService.initiateExit(exitData);
      await loadExitProcesses();
      addToast({ type: 'success', message: 'Exit process initiated' });
      return exit;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to initiate exit' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClearanceItem = async (exitId: string, itemId: string, status: 'pending' | 'completed' | 'waived', approvedBy?: string) => {
    setLoading(true);
    try {
      await ExitService.updateClearanceItem(exitId, itemId, status, approvedBy);
      await loadExitProcesses();
      addToast({ type: 'success', message: 'Clearance item updated' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update clearance' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeFinalSettlement = async (exitId: string, settlementData: any) => {
    setLoading(true);
    try {
      await ExitService.completeFinalSettlement(exitId, settlementData);
      await loadExitProcesses();
      addToast({ type: 'success', message: 'Final settlement completed' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to complete settlement' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadClearanceTemplates = async () => {
    const data = await ExitService.getAllClearanceTemplates();
    setClearanceTemplates(data);
  };

  // Anniversary Methods
  const loadAnniversaries = async () => {
    const data = await AnniversaryService.getAllAnniversaries();
    setAnniversaries(data);
  };

  const generateAnniversaries = async (year: number) => {
    setLoading(true);
    try {
      const count = await AnniversaryService.generateAnniversaries(year);
      await loadAnniversaries();
      addToast({ type: 'success', message: `Generated ${count} anniversaries for ${year}` });
      return count;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to generate anniversaries' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendAnniversaryNotifications = async (anniversaryId: string) => {
    setLoading(true);
    try {
      await AnniversaryService.sendNotifications(anniversaryId);
      await loadAnniversaries();
      addToast({ type: 'success', message: 'Notifications sent' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to send notifications' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auto-Numbering Methods
  const loadAutoNumberSequences = async () => {
    const data = await AutoNumberService.getAllSequences();
    setAutoNumberSequences(data);
  };

  const createSequence = async (sequenceData: Partial<AutoNumberSequence>) => {
    setLoading(true);
    try {
      const sequence = await AutoNumberService.createSequence(sequenceData);
      await loadAutoNumberSequences();
      addToast({ type: 'success', message: 'Sequence created' });
      return sequence;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create sequence' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetSequence = async (sequenceId: string) => {
    setLoading(true);
    try {
      await AutoNumberService.resetSequence(sequenceId);
      await loadAutoNumberSequences();
      addToast({ type: 'success', message: 'Sequence reset' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to reset sequence' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Probation Methods
  const loadProbationRecords = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? [await ProbationService.getEmployeeProbation(employeeId)]
        : await ProbationService.getAllRecords();
      setProbationRecords(data.filter(Boolean));
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load probation records' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addProbationReview = async (recordId: string, reviewData: any) => {
    setLoading(true);
    try {
      await ProbationService.addReview(recordId, reviewData);
      await loadProbationRecords();
      addToast({ type: 'success', message: 'Review added' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to add review' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const extendProbation = async (recordId: string, extensionDays: number, reason: string) => {
    setLoading(true);
    try {
      await ProbationService.extendProbation(recordId, extensionDays, reason);
      await loadProbationRecords();
      addToast({ type: 'success', message: 'Probation extended' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to extend probation' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirmation Methods
  const loadConfirmationLetters = async (employeeId?: string) => {
    setLoading(true);
    try {
      const data = employeeId
        ? await ConfirmationService.getEmployeeConfirmations(employeeId)
        : await ConfirmationService.getAllConfirmations();
      setConfirmationLetters(data);
      return data;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load confirmations' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateConfirmationLetter = async (employeeId: string, confirmationData: any) => {
    setLoading(true);
    try {
      const letter = await ConfirmationService.generateLetter(employeeId, confirmationData);
      await loadConfirmationLetters();
      addToast({ type: 'success', message: 'Confirmation letter generated' });
      return letter;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to generate letter' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Asset Methods
  const loadAssets = async () => {
    const data = await AssetService.getAllAssets();
    setAssets(data);
  };

  const createAsset = async (assetData: Partial<Asset>) => {
    setLoading(true);
    try {
      const asset = await AssetService.createAsset(assetData);
      await loadAssets();
      addToast({ type: 'success', message: 'Asset created successfully' });
      return asset;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
    setLoading(true);
    try {
      const asset = await AssetService.updateAsset(assetId, updates);
      await loadAssets();
      addToast({ type: 'success', message: 'Asset updated' });
      return asset;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const assignAsset = async (assetId: string, employeeId: string, employeeName: string) => {
    setLoading(true);
    try {
      await AssetService.assignAsset(assetId, employeeId, employeeName);
      await loadAssets();
      addToast({ type: 'success', message: 'Asset assigned successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to assign asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const returnAsset = async (assetId: string) => {
    setLoading(true);
    try {
      await AssetService.returnAsset(assetId);
      await loadAssets();
      addToast({ type: 'success', message: 'Asset returned successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to return asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const retireAsset = async (assetId: string, disposalMethod?: string, disposalDate?: string) => {
    setLoading(true);
    try {
      await AssetService.retireAsset(assetId, disposalMethod, disposalDate);
      await loadAssets();
      addToast({ type: 'success', message: 'Asset retired' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to retire asset' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeAssets = async (employeeId: string) => {
    setLoading(true);
    try {
      const assets = await AssetService.getEmployeeAssets(employeeId);
      return assets;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load employee assets' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Settings Methods
  const loadSettings = async () => {
    const data = await CoreHRSettingsService.getSettings();
    setSettings(data);
  };

  const updateSettings = async (updates: Partial<CoreHRSettings>) => {
    setLoading(true);
    try {
      const updated = await CoreHRSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated successfully' });
      return updated;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toast Methods
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    // State
    employees, organizationUnits, employmentHistory, documents, documentTemplates,
    positions, costCenters, lifeEvents, massUpdates, idCards, letterRequests,
    letterTemplates, exitProcesses, clearanceTemplates, anniversaries, autoNumberSequences,
    probationRecords, confirmationLetters, assets, settings, loading, toasts,

    // Employee Methods
    loadEmployees, createEmployee, updateEmployee, terminateEmployee, searchEmployees,

    // Organization Methods
    loadOrganizationUnits, createOrganizationUnit, updateOrganizationUnit, getOrganizationHierarchy,

    // Employment History Methods
    loadEmploymentHistory, recordEmploymentChange,

    // Document Methods
    loadDocuments, uploadDocument, verifyDocument, loadDocumentTemplates,

    // Position Methods
    loadPositions, createPosition, updatePosition, closePosition,

    // Cost Center Methods
    loadCostCenters, createCostCenter, updateCostCenter, allocateBudget,

    // Life Event Methods
    loadLifeEvents, recordLifeEvent, processLifeEvent,

    // Mass Update Methods
    loadMassUpdates, createMassUpdate, executeMassUpdate, previewMassUpdate,

    // ID Card Methods
    loadIDCards, generateIDCard, deactivateIDCard,

    // Letter Methods
    loadLetterRequests, requestLetter, approveLetter, loadLetterTemplates,

    // Exit Methods
    loadExitProcesses, initiateExit, updateClearanceItem, completeFinalSettlement, loadClearanceTemplates,

    // Anniversary Methods
    loadAnniversaries, generateAnniversaries, sendAnniversaryNotifications,

    // Auto-Numbering Methods
    loadAutoNumberSequences, createSequence, resetSequence,

    // Probation Methods
    loadProbationRecords, addProbationReview, extendProbation,

    // Confirmation Methods
    loadConfirmationLetters, generateConfirmationLetter,

    // Asset Methods
    loadAssets, createAsset, updateAsset, assignAsset, returnAsset, retireAsset, getEmployeeAssets,

    // Settings Methods
    loadSettings, updateSettings,

    // Toast Methods
    addToast, removeToast,
  };
};
