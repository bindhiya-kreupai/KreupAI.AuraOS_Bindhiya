'use client';

import { useState, useEffect } from 'react';
import type {
  FacultyMember, TenureApplication, ResearchGrant, GrantReport, AdjunctFaculty,
  AdjunctContract, AdjunctPool, EducationSettings, Toast
} from '../types';
import {
  FacultyTenureService, ResearchGrantsService, AdjunctManagementService,
  EducationSettingsService
} from '../services';
import {
  sampleFacultyMembers, sampleTenureApplications, sampleResearchGrants,
  sampleAdjunctFaculty, sampleAdjunctContracts, sampleAdjunctPools,
  sampleEducationSettings
} from '../data';

export const useEducation = () => {
  // State
  const [facultyMembers, setFacultyMembers] = useState<FacultyMember[]>([]);
  const [tenureApplications, setTenureApplications] = useState<TenureApplication[]>([]);
  const [researchGrants, setResearchGrants] = useState<ResearchGrant[]>([]);
  const [grantReports, setGrantReports] = useState<GrantReport[]>([]);
  const [adjuncts, setAdjuncts] = useState<AdjunctFaculty[]>([]);
  const [contracts, setContracts] = useState<AdjunctContract[]>([]);
  const [adjunctPools, setAdjunctPools] = useState<AdjunctPool[]>([]);
  const [settings, setSettings] = useState<EducationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const existing = await FacultyTenureService.getAllFaculty();
      if (existing.length === 0) {
        localStorage.setItem('education_faculty_members', JSON.stringify(sampleFacultyMembers));
        localStorage.setItem('education_tenure_applications', JSON.stringify(sampleTenureApplications));
        localStorage.setItem('education_research_grants', JSON.stringify(sampleResearchGrants));
        localStorage.setItem('education_adjunct_faculty', JSON.stringify(sampleAdjunctFaculty));
        localStorage.setItem('education_adjunct_contracts', JSON.stringify(sampleAdjunctContracts));
        localStorage.setItem('education_adjunct_pools', JSON.stringify(sampleAdjunctPools));
        localStorage.setItem('education_settings', JSON.stringify(sampleEducationSettings));
      }

      await Promise.all([
        loadFaculty(), loadTenureApplications(), loadGrants(),
        loadAdjuncts(), loadContracts(), loadSettings()
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      addToast({ type: 'error', message: 'Failed to load education data' });
    } finally {
      setLoading(false);
    }
  };

  // Faculty Tenure Methods
  const loadFaculty = async () => {
    const data = await FacultyTenureService.getAllFaculty();
    setFacultyMembers(data);
  };

  const createFaculty = async (facultyData: Partial<FacultyMember>) => {
    setLoading(true);
    try {
      const faculty = await FacultyTenureService.createFaculty(facultyData);
      await loadFaculty();
      addToast({ type: 'success', message: 'Faculty member created' });
      return faculty;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create faculty' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFaculty = async (facultyId: string, updates: Partial<FacultyMember>) => {
    setLoading(true);
    try {
      const faculty = await FacultyTenureService.updateFaculty(facultyId, updates);
      await loadFaculty();
      addToast({ type: 'success', message: 'Faculty updated' });
      return faculty;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update faculty' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addPublication = async (facultyId: string, publication: any) => {
    setLoading(true);
    try {
      await FacultyTenureService.addPublication(facultyId, publication);
      await loadFaculty();
      addToast({ type: 'success', message: 'Publication added' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to add publication' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addEvaluation = async (facultyId: string, evaluation: any) => {
    setLoading(true);
    try {
      await FacultyTenureService.addEvaluation(facultyId, evaluation);
      await loadFaculty();
      addToast({ type: 'success', message: 'Evaluation added' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to add evaluation' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTenureApplications = async () => {
    const data = await FacultyTenureService.getAllTenureApplications();
    setTenureApplications(data);
  };

  const createTenureApplication = async (applicationData: Partial<TenureApplication>) => {
    setLoading(true);
    try {
      const application = await FacultyTenureService.createTenureApplication(applicationData);
      await loadTenureApplications();
      addToast({ type: 'success', message: 'Tenure application created' });
      return application;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create application' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTenureApplication = async (applicationId: string, updates: Partial<TenureApplication>) => {
    setLoading(true);
    try {
      const application = await FacultyTenureService.updateTenureApplication(applicationId, updates);
      await loadTenureApplications();
      addToast({ type: 'success', message: 'Application updated' });
      return application;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update application' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitTenureApplication = async (applicationId: string) => {
    setLoading(true);
    try {
      await FacultyTenureService.submitApplication(applicationId);
      await loadTenureApplications();
      addToast({ type: 'success', message: 'Application submitted' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to submit application' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordCommitteeVote = async (applicationId: string, vote: any) => {
    setLoading(true);
    try {
      await FacultyTenureService.recordCommitteeVote(applicationId, vote);
      await loadTenureApplications();
      addToast({ type: 'success', message: 'Vote recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record vote' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordTenureDecision = async (applicationId: string, decision: any) => {
    setLoading(true);
    try {
      await FacultyTenureService.recordDecision(applicationId, decision);
      await loadTenureApplications();
      addToast({ type: 'success', message: 'Decision recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record decision' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Research Grants Methods
  const loadGrants = async () => {
    const data = await ResearchGrantsService.getAllGrants();
    setResearchGrants(data);
  };

  const createGrant = async (grantData: Partial<ResearchGrant>) => {
    setLoading(true);
    try {
      const grant = await ResearchGrantsService.createGrant(grantData);
      await loadGrants();
      addToast({ type: 'success', message: 'Grant created' });
      return grant;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create grant' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGrant = async (grantId: string, updates: Partial<ResearchGrant>) => {
    setLoading(true);
    try {
      const grant = await ResearchGrantsService.updateGrant(grantId, updates);
      await loadGrants();
      addToast({ type: 'success', message: 'Grant updated' });
      return grant;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update grant' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitGrant = async (grantId: string) => {
    setLoading(true);
    try {
      await ResearchGrantsService.submitGrant(grantId);
      await loadGrants();
      addToast({ type: 'success', message: 'Grant submitted' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to submit grant' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const awardGrant = async (grantId: string, awardedAmount: number, startDate: string, endDate: string) => {
    setLoading(true);
    try {
      await ResearchGrantsService.awardGrant(grantId, awardedAmount, startDate, endDate);
      await loadGrants();
      addToast({ type: 'success', message: 'Grant awarded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to award grant' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordExpenditure = async (grantId: string, expenditure: any) => {
    setLoading(true);
    try {
      await ResearchGrantsService.recordExpenditure(grantId, expenditure);
      await loadGrants();
      addToast({ type: 'success', message: 'Expenditure recorded' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to record expenditure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addGrantMilestone = async (grantId: string, milestone: any) => {
    setLoading(true);
    try {
      await ResearchGrantsService.addMilestone(grantId, milestone);
      await loadGrants();
      addToast({ type: 'success', message: 'Milestone added' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to add milestone' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGrantMilestone = async (grantId: string, milestoneId: string, updates: any) => {
    setLoading(true);
    try {
      await ResearchGrantsService.updateMilestone(grantId, milestoneId, updates);
      await loadGrants();
      addToast({ type: 'success', message: 'Milestone updated' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update milestone' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createGrantReport = async (reportData: Partial<GrantReport>) => {
    setLoading(true);
    try {
      const report = await ResearchGrantsService.createReport(reportData);
      addToast({ type: 'success', message: 'Report created' });
      return report;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitGrantReport = async (reportId: string) => {
    setLoading(true);
    try {
      await ResearchGrantsService.submitReport(reportId);
      addToast({ type: 'success', message: 'Report submitted' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to submit report' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Adjunct Management Methods
  const loadAdjuncts = async () => {
    const data = await AdjunctManagementService.getAllAdjuncts();
    setAdjuncts(data);
  };

  const createAdjunct = async (adjunctData: Partial<AdjunctFaculty>) => {
    setLoading(true);
    try {
      const adjunct = await AdjunctManagementService.createAdjunct(adjunctData);
      await loadAdjuncts();
      addToast({ type: 'success', message: 'Adjunct faculty created' });
      return adjunct;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create adjunct' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAdjunct = async (adjunctId: string, updates: Partial<AdjunctFaculty>) => {
    setLoading(true);
    try {
      const adjunct = await AdjunctManagementService.updateAdjunct(adjunctId, updates);
      await loadAdjuncts();
      addToast({ type: 'success', message: 'Adjunct updated' });
      return adjunct;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update adjunct' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyCredentials = async (adjunctId: string, qualificationId: string, verifiedBy: string) => {
    setLoading(true);
    try {
      await AdjunctManagementService.verifyCredentials(adjunctId, qualificationId, verifiedBy);
      await loadAdjuncts();
      addToast({ type: 'success', message: 'Credentials verified' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to verify credentials' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    const data = await AdjunctManagementService.getAllContracts();
    setContracts(data);
  };

  const createContract = async (contractData: Partial<AdjunctContract>) => {
    setLoading(true);
    try {
      const contract = await AdjunctManagementService.createContract(contractData);
      await loadContracts();
      addToast({ type: 'success', message: 'Contract created' });
      return contract;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to create contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (contractId: string, updates: Partial<AdjunctContract>) => {
    setLoading(true);
    try {
      const contract = await AdjunctManagementService.updateContract(contractId, updates);
      await loadContracts();
      addToast({ type: 'success', message: 'Contract updated' });
      return contract;
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to update contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signContract = async (contractId: string, signedBy: string) => {
    setLoading(true);
    try {
      await AdjunctManagementService.signContract(contractId, signedBy);
      await loadContracts();
      addToast({ type: 'success', message: 'Contract signed' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to sign contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveContract = async (contractId: string, approvedBy: string) => {
    setLoading(true);
    try {
      await AdjunctManagementService.approveContract(contractId, approvedBy);
      await loadContracts();
      addToast({ type: 'success', message: 'Contract approved' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to approve contract' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (contractId: string, installmentNumber: number) => {
    setLoading(true);
    try {
      await AdjunctManagementService.processPayment(contractId, installmentNumber);
      await loadContracts();
      addToast({ type: 'success', message: 'Payment processed' });
    } catch (error: any) {
      addToast({ type: 'error', message: 'Failed to process payment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadAdjunctPools = async () => {
    const data = await AdjunctManagementService.getAllPools();
    setAdjunctPools(data);
  };

  // Settings Methods
  const loadSettings = async () => {
    const data = await EducationSettingsService.getSettings();
    setSettings(data);
  };

  const updateSettings = async (updates: Partial<EducationSettings>) => {
    setLoading(true);
    try {
      const updated = await EducationSettingsService.updateSettings(updates);
      setSettings(updated);
      addToast({ type: 'success', message: 'Settings updated' });
      return updated;
    } catch (error: any) {
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
    facultyMembers, tenureApplications, researchGrants, grantReports, adjuncts,
    contracts, adjunctPools, settings, loading, toasts,

    // Faculty Tenure Methods
    loadFaculty, createFaculty, updateFaculty, addPublication, addEvaluation,
    loadTenureApplications, createTenureApplication, updateTenureApplication,
    submitTenureApplication, recordCommitteeVote, recordTenureDecision,

    // Research Grants Methods
    loadGrants, createGrant, updateGrant, submitGrant, awardGrant,
    recordExpenditure, addGrantMilestone, updateGrantMilestone,
    createGrantReport, submitGrantReport,

    // Adjunct Management Methods
    loadAdjuncts, createAdjunct, updateAdjunct, verifyCredentials,
    loadContracts, createContract, updateContract, signContract, approveContract,
    processPayment, loadAdjunctPools,

    // Settings Methods
    loadSettings, updateSettings,

    // Toast Methods
    addToast, removeToast,
  };
};
