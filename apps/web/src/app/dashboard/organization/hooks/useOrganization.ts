// Organization Chart Custom Hook
import { useState, useEffect, useCallback } from 'react';
import type {
  Department,
  Position,
  ReportingRelationship,
  OrganizationLevel,
  PositionRequest,
  OrganizationChange,
  DepartmentTransfer,
  OrganizationMetrics,
  OrganizationSettings,
  OrganizationNode,
  SpanOfControl
} from '../types';
import {
  DepartmentService,
  PositionService,
  ReportingRelationshipService,
  OrganizationLevelService,
  PositionRequestService,
  OrganizationChangeService,
  DepartmentTransferService,
  OrganizationAnalyticsService,
  OrganizationSettingsService,
  OrgChartService
} from '../services';
import { organizationData } from '../data';
import { useToast } from '../components/Toast';

export const useOrganization = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [relationships, setRelationships] = useState<ReportingRelationship[]>([]);
  const [levels, setLevels] = useState<OrganizationLevel[]>([]);
  const [positionRequests, setPositionRequests] = useState<PositionRequest[]>([]);
  const [orgChanges, setOrgChanges] = useState<OrganizationChange[]>([]);
  const [transfers, setTransfers] = useState<DepartmentTransfer[]>([]);
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [orgChart, setOrgChart] = useState<OrganizationNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Department operations
  const loadDepartments = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await DepartmentService.getDepartments(filters);
      setDepartments(data);
    } catch (error) {
      toast.error(`Failed to load departments: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createDepartment = useCallback(async (department: Department) => {
    try {
      setIsSaving(true);
      const created = await DepartmentService.createDepartment(department);
      setDepartments(prev => [...prev, created]);
      toast.success('Department created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create department: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateDepartment = useCallback(async (id: string, updates: Partial<Department>) => {
    try {
      setIsSaving(true);
      const updated = await DepartmentService.updateDepartment(id, updates);
      setDepartments(prev => prev.map(d => d.id === id ? updated : d));
      toast.success('Department updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update department: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await DepartmentService.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success('Department deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete department: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Position operations
  const loadPositions = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      const data = await PositionService.getPositions(filters);
      setPositions(data);
    } catch (error) {
      toast.error(`Failed to load positions: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createPosition = useCallback(async (position: Position) => {
    try {
      setIsSaving(true);
      const created = await PositionService.createPosition(position);
      setPositions(prev => [...prev, created]);
      toast.success('Position created successfully');
      return created;
    } catch (error) {
      toast.error(`Failed to create position: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updatePosition = useCallback(async (id: string, updates: Partial<Position>) => {
    try {
      setIsSaving(true);
      const updated = await PositionService.updatePosition(id, updates);
      setPositions(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Position updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update position: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deletePosition = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await PositionService.deletePosition(id);
      setPositions(prev => prev.filter(p => p.id !== id));
      toast.success('Position deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete position: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const assignEmployee = useCallback(async (positionId: string, employeeId: string, employeeName: string, employeeEmail: string, startDate: string) => {
    try {
      setIsSaving(true);
      const updated = await PositionService.assignEmployee(positionId, employeeId, employeeName, employeeEmail, startDate);
      setPositions(prev => prev.map(p => p.id === positionId ? updated : p));
      toast.success('Employee assigned to position');
      return updated;
    } catch (error) {
      toast.error(`Failed to assign employee: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const removeEmployee = useCallback(async (positionId: string) => {
    try {
      setIsSaving(true);
      const updated = await PositionService.removeEmployee(positionId);
      setPositions(prev => prev.map(p => p.id === positionId ? updated : p));
      toast.success('Employee removed from position');
      return updated;
    } catch (error) {
      toast.error(`Failed to remove employee: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const getVacantPositions = useCallback(async () => {
    try {
      const vacant = await PositionService.getVacantPositions();
      return vacant;
    } catch (error) {
      toast.error(`Failed to load vacant positions: ${(error as Error).message}`);
      return [];
    }
  }, [toast]);

  // Reporting relationship operations
  const loadRelationships = useCallback(async (filters?: any) => {
    try {
      const data = await ReportingRelationshipService.getRelationships(filters);
      setRelationships(data);
    } catch (error) {
      toast.error(`Failed to load relationships: ${(error as Error).message}`);
    }
  }, [toast]);

  const createRelationship = useCallback(async (relationship: ReportingRelationship) => {
    try {
      setIsSaving(true);
      const created = await ReportingRelationshipService.createRelationship(relationship);
      setRelationships(prev => [...prev, created]);
      toast.success('Reporting relationship created');
      return created;
    } catch (error) {
      toast.error(`Failed to create relationship: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const deleteRelationship = useCallback(async (id: string) => {
    try {
      setIsSaving(true);
      await ReportingRelationshipService.deleteRelationship(id);
      setRelationships(prev => prev.filter(r => r.id !== id));
      toast.success('Reporting relationship deleted');
    } catch (error) {
      toast.error(`Failed to delete relationship: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const calculateSpanOfControl = useCallback(async (managerId: string): Promise<SpanOfControl | null> => {
    try {
      const span = await ReportingRelationshipService.calculateSpanOfControl(managerId);
      return span;
    } catch (error) {
      toast.error(`Failed to calculate span of control: ${(error as Error).message}`);
      return null;
    }
  }, [toast]);

  // Position request operations
  const loadPositionRequests = useCallback(async (filters?: any) => {
    try {
      const data = await PositionRequestService.getRequests(filters);
      setPositionRequests(data);
    } catch (error) {
      toast.error(`Failed to load position requests: ${(error as Error).message}`);
    }
  }, [toast]);

  const submitPositionRequest = useCallback(async (request: PositionRequest) => {
    try {
      setIsSaving(true);
      const submitted = await PositionRequestService.submitRequest(request);
      setPositionRequests(prev => [...prev, submitted]);
      toast.success('Position request submitted');
      return submitted;
    } catch (error) {
      toast.error(`Failed to submit request: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approvePositionRequest = useCallback(async (id: string, approverId: string, approverName: string, approverTitle: string, level: number) => {
    try {
      setIsSaving(true);
      const approved = await PositionRequestService.approveRequest(id, approverId, approverName, approverTitle, level);
      setPositionRequests(prev => prev.map(r => r.id === id ? approved : r));
      toast.success('Position request approved');
      return approved;
    } catch (error) {
      toast.error(`Failed to approve request: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const rejectPositionRequest = useCallback(async (id: string, approverId: string, approverName: string, approverTitle: string, level: number, comments: string) => {
    try {
      setIsSaving(true);
      const rejected = await PositionRequestService.rejectRequest(id, approverId, approverName, approverTitle, level, comments);
      setPositionRequests(prev => prev.map(r => r.id === id ? rejected : r));
      toast.success('Position request rejected');
      return rejected;
    } catch (error) {
      toast.error(`Failed to reject request: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Organization change operations
  const loadOrgChanges = useCallback(async (filters?: any) => {
    try {
      const data = await OrganizationChangeService.getChanges(filters);
      setOrgChanges(data);
    } catch (error) {
      toast.error(`Failed to load organization changes: ${(error as Error).message}`);
    }
  }, [toast]);

  const createOrgChange = useCallback(async (change: OrganizationChange) => {
    try {
      setIsSaving(true);
      const created = await OrganizationChangeService.createChange(change);
      setOrgChanges(prev => [...prev, created]);
      toast.success('Organization change created');
      return created;
    } catch (error) {
      toast.error(`Failed to create change: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const updateOrgChange = useCallback(async (id: string, updates: Partial<OrganizationChange>) => {
    try {
      setIsSaving(true);
      const updated = await OrganizationChangeService.updateChange(id, updates);
      setOrgChanges(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Organization change updated');
      return updated;
    } catch (error) {
      toast.error(`Failed to update change: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Transfer operations
  const loadTransfers = useCallback(async (filters?: any) => {
    try {
      const data = await DepartmentTransferService.getTransfers(filters);
      setTransfers(data);
    } catch (error) {
      toast.error(`Failed to load transfers: ${(error as Error).message}`);
    }
  }, [toast]);

  const createTransfer = useCallback(async (transfer: DepartmentTransfer) => {
    try {
      setIsSaving(true);
      const created = await DepartmentTransferService.createTransfer(transfer);
      setTransfers(prev => [...prev, created]);
      toast.success('Transfer request created');
      return created;
    } catch (error) {
      toast.error(`Failed to create transfer: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const approveTransfer = useCallback(async (id: string, approverId: string, approverName: string) => {
    try {
      setIsSaving(true);
      const approved = await DepartmentTransferService.approveTransfer(id, approverId, approverName);
      setTransfers(prev => prev.map(t => t.id === id ? approved : t));
      toast.success('Transfer approved');
      return approved;
    } catch (error) {
      toast.error(`Failed to approve transfer: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Organization chart operations
  const buildOrgChart = useCallback(async (rootDepartmentId?: string) => {
    try {
      setIsLoading(true);
      const chart = await OrgChartService.buildOrgChart(rootDepartmentId);
      setOrgChart(chart);
      return chart;
    } catch (error) {
      toast.error(`Failed to build org chart: ${(error as Error).message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Analytics
  const loadMetrics = useCallback(async () => {
    try {
      const data = await OrganizationAnalyticsService.getMetrics();
      setMetrics(data);
    } catch (error) {
      toast.error(`Failed to load metrics: ${(error as Error).message}`);
    }
  }, [toast]);

  const calculateMetrics = useCallback(async () => {
    try {
      const data = await OrganizationAnalyticsService.calculateMetrics();
      setMetrics(data);
      toast.success('Metrics calculated successfully');
    } catch (error) {
      toast.error(`Failed to calculate metrics: ${(error as Error).message}`);
    }
  }, [toast]);

  // Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await OrganizationSettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      toast.error(`Failed to load settings: ${(error as Error).message}`);
    }
  }, [toast]);

  const updateSettings = useCallback(async (updates: Partial<OrganizationSettings>) => {
    try {
      setIsSaving(true);
      const updated = await OrganizationSettingsService.updateSettings(updates);
      setSettings(updated);
      toast.success('Settings updated successfully');
      return updated;
    } catch (error) {
      toast.error(`Failed to update settings: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Initialize sample data
  const initializeSampleData = useCallback(async () => {
    try {
      setIsSaving(true);

      // Create departments
      for (const dept of organizationData.departments) {
        await DepartmentService.createDepartment(dept);
      }

      // Create positions
      for (const pos of organizationData.positions) {
        await PositionService.createPosition(pos);
      }

      // Create relationships
      for (const rel of organizationData.relationships) {
        await ReportingRelationshipService.createRelationship(rel);
      }

      // Create levels
      for (const level of organizationData.levels) {
        await OrganizationLevelService.createLevel(level);
      }

      await loadDepartments();
      await loadPositions();
      await loadRelationships();
      await loadMetrics();

      toast.success('Sample data initialized');
    } catch (error) {
      toast.error(`Failed to initialize data: ${(error as Error).message}`);
    } finally {
      setIsSaving(false);
    }
  }, [loadDepartments, loadPositions, loadRelationships, loadMetrics, toast]);

  useEffect(() => {
    loadDepartments();
    loadPositions();
    loadRelationships();
    loadMetrics();
    loadSettings();
  }, []);

  return {
    // State
    departments,
    positions,
    relationships,
    levels,
    positionRequests,
    orgChanges,
    transfers,
    metrics,
    settings,
    orgChart,
    isLoading,
    isSaving,
    error,

    // Department operations
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // Position operations
    loadPositions,
    createPosition,
    updatePosition,
    deletePosition,
    assignEmployee,
    removeEmployee,
    getVacantPositions,

    // Reporting operations
    loadRelationships,
    createRelationship,
    deleteRelationship,
    calculateSpanOfControl,

    // Position requests
    loadPositionRequests,
    submitPositionRequest,
    approvePositionRequest,
    rejectPositionRequest,

    // Organization changes
    loadOrgChanges,
    createOrgChange,
    updateOrgChange,

    // Transfers
    loadTransfers,
    createTransfer,
    approveTransfer,

    // Org chart
    buildOrgChart,

    // Analytics & Settings
    loadMetrics,
    calculateMetrics,
    loadSettings,
    updateSettings,
    initializeSampleData
  };
};
