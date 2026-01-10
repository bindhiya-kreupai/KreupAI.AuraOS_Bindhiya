/**
 * Construction & Real Estate Module - Custom Hook
 * Centralized state management and business logic for all construction features
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ConstructionProject, ProjectTask, SafetyInspection, SafetyIncident, SafetyTraining, PPETracking, HazardIdentification, EquipmentLease, SubcontractorProfile, BidInvitation, Bid, SubcontractorContract, SubcontractorInvoice, ConstructionSettings, ConstructionAlert } from '../types';
import { ProjectManagementService, SiteSafetyService, EquipmentLeasingService, SubcontractorPortalService, ConstructionSettingsService, AlertsService } from '../services';
import { sampleProjects, sampleSafetyInspections, sampleEquipmentLeases, sampleSubcontractors, sampleConstructionSettings } from '../data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useConstruction = () => {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [safetyInspections, setSafetyInspections] = useState<SafetyInspection[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>([]);
  const [safetyTraining, setSafetyTraining] = useState<SafetyTraining[]>([]);
  const [ppeTracking, setPPETracking] = useState<PPETracking[]>([]);
  const [hazards, setHazards] = useState<HazardIdentification[]>([]);
  const [equipmentLeases, setEquipmentLeases] = useState<EquipmentLease[]>([]);
  const [subcontractors, setSubcontractors] = useState<SubcontractorProfile[]>([]);
  const [bidInvitations, setBidInvitations] = useState<BidInvitation[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [contracts, setContracts] = useState<SubcontractorContract[]>([]);
  const [invoices, setInvoices] = useState<SubcontractorInvoice[]>([]);
  const [settings, setSettings] = useState<ConstructionSettings | null>(null);
  const [alerts, setAlerts] = useState<ConstructionAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsData, inspectionsData, leasesData, subcontractorsData, settingsData] = await Promise.all([
        ProjectManagementService.getAllProjects(),
        SiteSafetyService.getAllInspections(),
        EquipmentLeasingService.getAllLeases(),
        SubcontractorPortalService.getAllSubcontractors(),
        ConstructionSettingsService.getSettings()
      ]);

      if (projectsData.length === 0) {
        for (const proj of sampleProjects) await ProjectManagementService.createProject(proj);
        setProjects(sampleProjects);
      } else setProjects(projectsData);

      if (inspectionsData.length === 0) {
        for (const insp of sampleSafetyInspections) await SiteSafetyService.createInspection(insp);
        setSafetyInspections(sampleSafetyInspections);
      } else setSafetyInspections(inspectionsData);

      if (leasesData.length === 0) {
        for (const lease of sampleEquipmentLeases) await EquipmentLeasingService.createLease(lease);
        setEquipmentLeases(sampleEquipmentLeases);
      } else setEquipmentLeases(leasesData);

      if (subcontractorsData.length === 0) {
        for (const sub of sampleSubcontractors) await SubcontractorPortalService.createSubcontractor(sub);
        setSubcontractors(sampleSubcontractors);
      } else setSubcontractors(subcontractorsData);

      if (!settingsData) {
        await ConstructionSettingsService.updateSettings(sampleConstructionSettings);
        setSettings(sampleConstructionSettings);
      } else setSettings(settingsData);

    } catch (error) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load construction data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  // Project Management Methods
  const createProject = async (projectData: Partial<ConstructionProject>) => {
    setLoading(true);
    try {
      const project = await ProjectManagementService.createProject(projectData);
      setProjects(await ProjectManagementService.getAllProjects());
      addToast({ type: 'success', message: 'Project created successfully' });
      return project;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create project' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<ConstructionProject>) => {
    setLoading(true);
    try {
      const project = await ProjectManagementService.updateProject(projectId, updates);
      setProjects(await ProjectManagementService.getAllProjects());
      addToast({ type: 'success', message: 'Project updated successfully' });
      return project;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update project' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      await ProjectManagementService.deleteProject(projectId);
      setProjects(await ProjectManagementService.getAllProjects());
      addToast({ type: 'success', message: 'Project deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete project' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Partial<ProjectTask>) => {
    setLoading(true);
    try {
      const task = await ProjectManagementService.createTask(taskData);
      setTasks(await ProjectManagementService.getAllTasks());
      addToast({ type: 'success', message: 'Task created successfully' });
      return task;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create task' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    setLoading(true);
    try {
      const task = await ProjectManagementService.updateTask(taskId, updates);
      setTasks(await ProjectManagementService.getAllTasks());
      addToast({ type: 'success', message: 'Task updated successfully' });
      return task;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update task' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Safety Methods
  const createSafetyInspection = async (inspectionData: Partial<SafetyInspection>) => {
    setLoading(true);
    try {
      const inspection = await SiteSafetyService.createInspection(inspectionData);
      setSafetyInspections(await SiteSafetyService.getAllInspections());
      addToast({ type: 'success', message: 'Safety inspection created' });
      return inspection;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create inspection' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyInspection = async (inspectionId: string, updates: Partial<SafetyInspection>) => {
    setLoading(true);
    try {
      const inspection = await SiteSafetyService.updateInspection(inspectionId, updates);
      setSafetyInspections(await SiteSafetyService.getAllInspections());
      addToast({ type: 'success', message: 'Inspection updated' });
      return inspection;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update inspection' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createSafetyIncident = async (incidentData: Partial<SafetyIncident>) => {
    setLoading(true);
    try {
      const incident = await SiteSafetyService.createIncident(incidentData);
      setSafetyIncidents(await SiteSafetyService.getAllIncidents());
      addToast({ type: 'success', message: 'Incident reported' });
      return incident;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to report incident' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyIncident = async (incidentId: string, updates: Partial<SafetyIncident>) => {
    setLoading(true);
    try {
      const incident = await SiteSafetyService.updateIncident(incidentId, updates);
      setSafetyIncidents(await SiteSafetyService.getAllIncidents());
      addToast({ type: 'success', message: 'Incident updated' });
      return incident;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update incident' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createSafetyTraining = async (trainingData: Partial<SafetyTraining>) => {
    setLoading(true);
    try {
      const training = await SiteSafetyService.createTraining(trainingData);
      setSafetyTraining(await SiteSafetyService.getAllTrainings());
      addToast({ type: 'success', message: 'Training record created' });
      return training;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create training' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createHazard = async (hazardData: Partial<HazardIdentification>) => {
    setLoading(true);
    try {
      const hazard = await SiteSafetyService.createHazard(hazardData);
      setHazards(await SiteSafetyService.getAllHazards());
      addToast({ type: 'success', message: 'Hazard identified' });
      return hazard;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create hazard' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Equipment Leasing Methods
  const createEquipmentLease = async (leaseData: Partial<EquipmentLease>) => {
    setLoading(true);
    try {
      const lease = await EquipmentLeasingService.createLease(leaseData);
      setEquipmentLeases(await EquipmentLeasingService.getAllLeases());
      addToast({ type: 'success', message: 'Equipment lease created' });
      return lease;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create lease' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEquipmentLease = async (leaseId: string, updates: Partial<EquipmentLease>) => {
    setLoading(true);
    try {
      const lease = await EquipmentLeasingService.updateLease(leaseId, updates);
      setEquipmentLeases(await EquipmentLeasingService.getAllLeases());
      addToast({ type: 'success', message: 'Lease updated' });
      return lease;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update lease' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipmentLease = async (leaseId: string) => {
    setLoading(true);
    try {
      await EquipmentLeasingService.deleteLease(leaseId);
      setEquipmentLeases(await EquipmentLeasingService.getAllLeases());
      addToast({ type: 'success', message: 'Lease deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete lease' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Subcontractor Methods
  const createSubcontractor = async (subData: Partial<SubcontractorProfile>) => {
    setLoading(true);
    try {
      const sub = await SubcontractorPortalService.createSubcontractor(subData);
      setSubcontractors(await SubcontractorPortalService.getAllSubcontractors());
      addToast({ type: 'success', message: 'Subcontractor created' });
      return sub;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create subcontractor' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubcontractor = async (subId: string, updates: Partial<SubcontractorProfile>) => {
    setLoading(true);
    try {
      const sub = await SubcontractorPortalService.updateSubcontractor(subId, updates);
      setSubcontractors(await SubcontractorPortalService.getAllSubcontractors());
      addToast({ type: 'success', message: 'Subcontractor updated' });
      return sub;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update subcontractor' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBidInvitation = async (inviteData: Partial<BidInvitation>) => {
    setLoading(true);
    try {
      const invite = await SubcontractorPortalService.createBidInvitation(inviteData);
      setBidInvitations(await SubcontractorPortalService.getAllBidInvitations());
      addToast({ type: 'success', message: 'Bid invitation sent' });
      return invite;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to send invitation' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBid = async (bidData: Partial<Bid>) => {
    setLoading(true);
    try {
      const bid = await SubcontractorPortalService.createBid(bidData);
      setBids(await SubcontractorPortalService.getAllBids());
      addToast({ type: 'success', message: 'Bid submitted' });
      return bid;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to submit bid' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBid = async (bidId: string, updates: Partial<Bid>) => {
    setLoading(true);
    try {
      const bid = await SubcontractorPortalService.updateBid(bidId, updates);
      setBids(await SubcontractorPortalService.getAllBids());
      addToast({ type: 'success', message: 'Bid updated' });
      return bid;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update bid' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData: Partial<SubcontractorContract>) => {
    setLoading(true);
    try {
      const contract = await SubcontractorPortalService.createContract(contractData);
      setContracts(await SubcontractorPortalService.getAllContracts());
      addToast({ type: 'success', message: 'Contract created' });
      return contract;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (contractId: string, updates: Partial<SubcontractorContract>) => {
    setLoading(true);
    try {
      const contract = await SubcontractorPortalService.updateContract(contractId, updates);
      setContracts(await SubcontractorPortalService.getAllContracts());
      addToast({ type: 'success', message: 'Contract updated' });
      return contract;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Partial<SubcontractorInvoice>) => {
    setLoading(true);
    try {
      const invoice = await SubcontractorPortalService.createInvoice(invoiceData);
      setInvoices(await SubcontractorPortalService.getAllInvoices());
      addToast({ type: 'success', message: 'Invoice created' });
      return invoice;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create invoice' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<SubcontractorInvoice>) => {
    setLoading(true);
    try {
      const invoice = await SubcontractorPortalService.updateInvoice(invoiceId, updates);
      setInvoices(await SubcontractorPortalService.getAllInvoices());
      addToast({ type: 'success', message: 'Invoice updated' });
      return invoice;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update invoice' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<ConstructionSettings>) => {
    setLoading(true);
    try {
      const settingsData = await ConstructionSettingsService.updateSettings(updates);
      setSettings(settingsData);
      addToast({ type: 'success', message: 'Settings updated' });
      return settingsData;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Partial<ConstructionAlert>) => {
    setLoading(true);
    try {
      const alert = await AlertsService.createAlert(alertData);
      setAlerts(await AlertsService.getAllAlerts());
      return alert;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create alert' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string, userId: string) => {
    setLoading(true);
    try {
      const alert = await AlertsService.acknowledgeAlert(alertId, userId);
      setAlerts(await AlertsService.getAllAlerts());
      addToast({ type: 'success', message: 'Alert acknowledged' });
      return alert;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to acknowledge alert' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects, tasks, safetyInspections, safetyIncidents, safetyTraining, ppeTracking, hazards, equipmentLeases, subcontractors, bidInvitations, bids, contracts, invoices, settings, alerts, loading, error, toasts,
    createProject, updateProject, deleteProject, createTask, updateTask,
    createSafetyInspection, updateSafetyInspection, createSafetyIncident, updateSafetyIncident, createSafetyTraining, createHazard,
    createEquipmentLease, updateEquipmentLease, deleteEquipmentLease,
    createSubcontractor, updateSubcontractor, createBidInvitation, createBid, updateBid, createContract, updateContract, createInvoice, updateInvoice,
    updateSettings, createAlert, acknowledgeAlert, loadAllData
  };
};
