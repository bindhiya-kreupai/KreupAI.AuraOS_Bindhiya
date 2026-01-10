/**
 * Aviation Module - Custom Hook
 * Centralized state management and business logic for all aviation features
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import type {
  CrewMemberProfile,
  FlightAssignment,
  DutyTime,
  RestPeriod,
  PilotProfile,
  TrainingRecord,
  SimulatorSession,
  ProficiencyCheck,
  GroundStaffMember,
  TurnaroundAssignment,
  GroundEquipment,
  RampHandlingProcedure,
  SafetyCompliance,
  AviationSettings,
  Alert
} from '../types';
import {
  CabinCrewService,
  PilotTrainingService,
  GroundOperationsService,
  AviationSettingsService,
  AlertsService
} from '../services';
import {
  sampleCrewMembers,
  sampleDutyTimes,
  sampleRestPeriods,
  samplePilots,
  sampleTrainingRecords,
  sampleSimulatorSessions,
  sampleProficiencyChecks,
  sampleGroundStaff,
  sampleTurnarounds,
  sampleGroundEquipment,
  sampleRampProcedures,
  sampleSafetyCompliance,
  sampleAviationSettings
} from '../data';

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useAviation = () => {
  // ==================== State Management ====================

  // Cabin Crew State
  const [crewMembers, setCrewMembers] = useState<CrewMemberProfile[]>([]);
  const [flightAssignments, setFlightAssignments] = useState<FlightAssignment[]>([]);
  const [dutyTimes, setDutyTimes] = useState<DutyTime[]>([]);
  const [restPeriods, setRestPeriods] = useState<RestPeriod[]>([]);

  // Pilot Training State
  const [pilots, setPilots] = useState<PilotProfile[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [simulatorSessions, setSimulatorSessions] = useState<SimulatorSession[]>([]);
  const [proficiencyChecks, setProficiencyChecks] = useState<ProficiencyCheck[]>([]);

  // Ground Operations State
  const [groundStaff, setGroundStaff] = useState<GroundStaffMember[]>([]);
  const [turnarounds, setTurnarounds] = useState<TurnaroundAssignment[]>([]);
  const [groundEquipment, setGroundEquipment] = useState<GroundEquipment[]>([]);
  const [rampProcedures, setRampProcedures] = useState<RampHandlingProcedure[]>([]);
  const [safetyCompliance, setSafetyCompliance] = useState<SafetyCompliance[]>([]);

  // Common State
  const [settings, setSettings] = useState<AviationSettings | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ==================== Toast Management ====================

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
  }, []);

  // ==================== Data Loading ====================

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [
        crewData,
        assignmentsData,
        dutyData,
        restData,
        pilotsData,
        trainingData,
        simData,
        checksData,
        staffData,
        turnaroundsData,
        equipmentData,
        proceduresData,
        complianceData,
        settingsData,
        alertsData
      ] = await Promise.all([
        CabinCrewService.getAllCrewMembers(),
        CabinCrewService.getAllFlightAssignments(),
        CabinCrewService.getAllDutyTimes(),
        CabinCrewService.getAllRestPeriods(),
        PilotTrainingService.getAllPilots(),
        PilotTrainingService.getAllTrainingRecords(),
        PilotTrainingService.getAllSimulatorSessions(),
        PilotTrainingService.getAllProficiencyChecks(),
        GroundOperationsService.getAllGroundStaff(),
        GroundOperationsService.getAllTurnarounds(),
        GroundOperationsService.getAllEquipment(),
        GroundOperationsService.getAllProcedures(),
        GroundOperationsService.getAllSafetyCompliance(),
        AviationSettingsService.getSettings(),
        AlertsService.getAllAlerts()
      ]);

      // Initialize with sample data if empty
      if (crewData.length === 0) {
        for (const crew of sampleCrewMembers) {
          await CabinCrewService.createCrewMember(crew);
        }
        setCrewMembers(sampleCrewMembers);
      } else {
        setCrewMembers(crewData);
      }

      if (dutyData.length === 0) {
        for (const duty of sampleDutyTimes) {
          await CabinCrewService.recordDutyTime(duty);
        }
        setDutyTimes(sampleDutyTimes);
      } else {
        setDutyTimes(dutyData);
      }

      if (restData.length === 0) {
        for (const rest of sampleRestPeriods) {
          await CabinCrewService.recordRestPeriod(rest);
        }
        setRestPeriods(sampleRestPeriods);
      } else {
        setRestPeriods(restData);
      }

      if (pilotsData.length === 0) {
        for (const pilot of samplePilots) {
          await PilotTrainingService.createPilot(pilot);
        }
        setPilots(samplePilots);
      } else {
        setPilots(pilotsData);
      }

      if (trainingData.length === 0) {
        for (const training of sampleTrainingRecords) {
          await PilotTrainingService.createTrainingRecord('pilot-002', training);
        }
        setTrainingRecords(sampleTrainingRecords);
      } else {
        setTrainingRecords(trainingData);
      }

      if (simData.length === 0) {
        for (const sim of sampleSimulatorSessions) {
          await PilotTrainingService.createSimulatorSession(sim);
        }
        setSimulatorSessions(sampleSimulatorSessions);
      } else {
        setSimulatorSessions(simData);
      }

      if (checksData.length === 0) {
        for (const check of sampleProficiencyChecks) {
          await PilotTrainingService.createProficiencyCheck(check);
        }
        setProficiencyChecks(sampleProficiencyChecks);
      } else {
        setProficiencyChecks(checksData);
      }

      if (staffData.length === 0) {
        for (const staff of sampleGroundStaff) {
          await GroundOperationsService.createGroundStaff(staff);
        }
        setGroundStaff(sampleGroundStaff);
      } else {
        setGroundStaff(staffData);
      }

      if (turnaroundsData.length === 0) {
        for (const turn of sampleTurnarounds) {
          await GroundOperationsService.createTurnaround(turn);
        }
        setTurnarounds(sampleTurnarounds);
      } else {
        setTurnarounds(turnaroundsData);
      }

      if (equipmentData.length === 0) {
        for (const equip of sampleGroundEquipment) {
          await GroundOperationsService.createEquipment(equip);
        }
        setGroundEquipment(sampleGroundEquipment);
      } else {
        setGroundEquipment(equipmentData);
      }

      if (proceduresData.length === 0) {
        for (const proc of sampleRampProcedures) {
          await GroundOperationsService.createProcedure(proc);
        }
        setRampProcedures(sampleRampProcedures);
      } else {
        setRampProcedures(proceduresData);
      }

      if (complianceData.length === 0) {
        for (const comp of sampleSafetyCompliance) {
          await GroundOperationsService.createSafetyCompliance(comp);
        }
        setSafetyCompliance(sampleSafetyCompliance);
      } else {
        setSafetyCompliance(complianceData);
      }

      if (!settingsData) {
        await AviationSettingsService.updateSettings(sampleAviationSettings);
        setSettings(sampleAviationSettings);
      } else {
        setSettings(settingsData);
      }

      setFlightAssignments(assignmentsData);
      setAlerts(alertsData);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
      addToast({ type: 'error', message: 'Failed to load aviation data' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== Cabin Crew Methods ====================

  const loadCrewMembers = async () => {
    const data = await CabinCrewService.getAllCrewMembers();
    setCrewMembers(data);
  };

  const createCrewMember = async (memberData: Partial<CrewMemberProfile>) => {
    setLoading(true);
    try {
      const member = await CabinCrewService.createCrewMember(memberData);
      await loadCrewMembers();
      addToast({ type: 'success', message: 'Crew member created successfully' });
      return member;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create crew member' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCrewMember = async (crewId: string, updates: Partial<CrewMemberProfile>) => {
    setLoading(true);
    try {
      const member = await CabinCrewService.updateCrewMember(crewId, updates);
      await loadCrewMembers();
      addToast({ type: 'success', message: 'Crew member updated successfully' });
      return member;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update crew member' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCrewMember = async (crewId: string) => {
    setLoading(true);
    try {
      await CabinCrewService.deleteCrewMember(crewId);
      await loadCrewMembers();
      addToast({ type: 'success', message: 'Crew member deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete crew member' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadFlightAssignments = async () => {
    const data = await CabinCrewService.getAllFlightAssignments();
    setFlightAssignments(data);
  };

  const createFlightAssignment = async (assignmentData: Partial<FlightAssignment>) => {
    setLoading(true);
    try {
      const assignment = await CabinCrewService.createFlightAssignment(assignmentData);
      await loadFlightAssignments();
      addToast({ type: 'success', message: 'Flight assignment created successfully' });
      return assignment;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create flight assignment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFlightAssignment = async (assignmentId: string, updates: Partial<FlightAssignment>) => {
    setLoading(true);
    try {
      const assignment = await CabinCrewService.updateFlightAssignment(assignmentId, updates);
      await loadFlightAssignments();
      addToast({ type: 'success', message: 'Flight assignment updated successfully' });
      return assignment;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update flight assignment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordDutyTime = async (dutyData: Partial<DutyTime>) => {
    setLoading(true);
    try {
      const duty = await CabinCrewService.recordDutyTime(dutyData);
      const data = await CabinCrewService.getAllDutyTimes();
      setDutyTimes(data);
      addToast({ type: 'success', message: 'Duty time recorded successfully' });
      return duty;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to record duty time' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordRestPeriod = async (restData: Partial<RestPeriod>) => {
    setLoading(true);
    try {
      const rest = await CabinCrewService.recordRestPeriod(restData);
      const data = await CabinCrewService.getAllRestPeriods();
      setRestPeriods(data);
      addToast({ type: 'success', message: 'Rest period recorded successfully' });
      return rest;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to record rest period' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDutyStatus = async (crewId: string, status: any) => {
    setLoading(true);
    try {
      const member = await CabinCrewService.updateDutyStatus(crewId, status);
      await loadCrewMembers();
      addToast({ type: 'success', message: 'Duty status updated successfully' });
      return member;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update duty status' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCrewMemberById = async (crewId: string) => {
    return await CabinCrewService.getCrewMemberById(crewId);
  };

  const getCrewAssignments = async (crewId: string) => {
    return await CabinCrewService.getCrewAssignments(crewId);
  };

  const getCrewDutyTimes = async (crewId: string) => {
    return await CabinCrewService.getCrewDutyTimes(crewId);
  };

  const getCrewRestPeriods = async (crewId: string) => {
    return await CabinCrewService.getCrewRestPeriods(crewId);
  };

  // ==================== Pilot Training Methods ====================

  const loadPilots = async () => {
    const data = await PilotTrainingService.getAllPilots();
    setPilots(data);
  };

  const createPilot = async (pilotData: Partial<PilotProfile>) => {
    setLoading(true);
    try {
      const pilot = await PilotTrainingService.createPilot(pilotData);
      await loadPilots();
      addToast({ type: 'success', message: 'Pilot created successfully' });
      return pilot;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create pilot' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePilot = async (pilotId: string, updates: Partial<PilotProfile>) => {
    setLoading(true);
    try {
      const pilot = await PilotTrainingService.updatePilot(pilotId, updates);
      await loadPilots();
      addToast({ type: 'success', message: 'Pilot updated successfully' });
      return pilot;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update pilot' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePilot = async (pilotId: string) => {
    setLoading(true);
    try {
      await PilotTrainingService.deletePilot(pilotId);
      await loadPilots();
      addToast({ type: 'success', message: 'Pilot deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete pilot' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingRecords = async () => {
    const data = await PilotTrainingService.getAllTrainingRecords();
    setTrainingRecords(data);
  };

  const createTrainingRecord = async (pilotId: string, recordData: Partial<TrainingRecord>) => {
    setLoading(true);
    try {
      const record = await PilotTrainingService.createTrainingRecord(pilotId, recordData);
      await loadTrainingRecords();
      await loadPilots();
      addToast({ type: 'success', message: 'Training record created successfully' });
      return record;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create training record' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTrainingRecord = async (recordId: string, updates: Partial<TrainingRecord>) => {
    setLoading(true);
    try {
      const record = await PilotTrainingService.updateTrainingRecord(recordId, updates);
      await loadTrainingRecords();
      addToast({ type: 'success', message: 'Training record updated successfully' });
      return record;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update training record' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSimulatorSessions = async () => {
    const data = await PilotTrainingService.getAllSimulatorSessions();
    setSimulatorSessions(data);
  };

  const createSimulatorSession = async (sessionData: Partial<SimulatorSession>) => {
    setLoading(true);
    try {
      const session = await PilotTrainingService.createSimulatorSession(sessionData);
      await loadSimulatorSessions();
      addToast({ type: 'success', message: 'Simulator session created successfully' });
      return session;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create simulator session' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSimulatorSession = async (sessionId: string, updates: Partial<SimulatorSession>) => {
    setLoading(true);
    try {
      const session = await PilotTrainingService.updateSimulatorSession(sessionId, updates);
      await loadSimulatorSessions();
      addToast({ type: 'success', message: 'Simulator session updated successfully' });
      return session;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update simulator session' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadProficiencyChecks = async () => {
    const data = await PilotTrainingService.getAllProficiencyChecks();
    setProficiencyChecks(data);
  };

  const createProficiencyCheck = async (checkData: Partial<ProficiencyCheck>) => {
    setLoading(true);
    try {
      const check = await PilotTrainingService.createProficiencyCheck(checkData);
      await loadProficiencyChecks();
      await loadPilots();
      addToast({ type: 'success', message: 'Proficiency check created successfully' });
      return check;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create proficiency check' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateFlightHours = async (pilotId: string, hours: Partial<any>) => {
    setLoading(true);
    try {
      const pilot = await PilotTrainingService.updateFlightHours(pilotId, hours);
      await loadPilots();
      addToast({ type: 'success', message: 'Flight hours updated successfully' });
      return pilot;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update flight hours' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPilotById = async (pilotId: string) => {
    return await PilotTrainingService.getPilotById(pilotId);
  };

  const getPilotTrainingRecords = async (pilotId: string) => {
    return await PilotTrainingService.getPilotTrainingRecords(pilotId);
  };

  const getPilotSimulatorSessions = async (pilotId: string) => {
    return await PilotTrainingService.getPilotSimulatorSessions(pilotId);
  };

  const getPilotProficiencyChecks = async (pilotId: string) => {
    return await PilotTrainingService.getPilotProficiencyChecks(pilotId);
  };

  // ==================== Ground Operations Methods ====================

  const loadGroundStaff = async () => {
    const data = await GroundOperationsService.getAllGroundStaff();
    setGroundStaff(data);
  };

  const createGroundStaff = async (staffData: Partial<GroundStaffMember>) => {
    setLoading(true);
    try {
      const staff = await GroundOperationsService.createGroundStaff(staffData);
      await loadGroundStaff();
      addToast({ type: 'success', message: 'Ground staff created successfully' });
      return staff;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create ground staff' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGroundStaff = async (staffId: string, updates: Partial<GroundStaffMember>) => {
    setLoading(true);
    try {
      const staff = await GroundOperationsService.updateGroundStaff(staffId, updates);
      await loadGroundStaff();
      addToast({ type: 'success', message: 'Ground staff updated successfully' });
      return staff;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update ground staff' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroundStaff = async (staffId: string) => {
    setLoading(true);
    try {
      await GroundOperationsService.deleteGroundStaff(staffId);
      await loadGroundStaff();
      addToast({ type: 'success', message: 'Ground staff deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete ground staff' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadTurnarounds = async () => {
    const data = await GroundOperationsService.getAllTurnarounds();
    setTurnarounds(data);
  };

  const createTurnaround = async (turnaroundData: Partial<TurnaroundAssignment>) => {
    setLoading(true);
    try {
      const turnaround = await GroundOperationsService.createTurnaround(turnaroundData);
      await loadTurnarounds();
      addToast({ type: 'success', message: 'Turnaround created successfully' });
      return turnaround;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create turnaround' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTurnaround = async (assignmentId: string, updates: Partial<TurnaroundAssignment>) => {
    setLoading(true);
    try {
      const turnaround = await GroundOperationsService.updateTurnaround(assignmentId, updates);
      await loadTurnarounds();
      addToast({ type: 'success', message: 'Turnaround updated successfully' });
      return turnaround;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update turnaround' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadGroundEquipment = async () => {
    const data = await GroundOperationsService.getAllEquipment();
    setGroundEquipment(data);
  };

  const createEquipment = async (equipmentData: Partial<GroundEquipment>) => {
    setLoading(true);
    try {
      const equipment = await GroundOperationsService.createEquipment(equipmentData);
      await loadGroundEquipment();
      addToast({ type: 'success', message: 'Equipment created successfully' });
      return equipment;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create equipment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEquipment = async (equipmentId: string, updates: Partial<GroundEquipment>) => {
    setLoading(true);
    try {
      const equipment = await GroundOperationsService.updateEquipment(equipmentId, updates);
      await loadGroundEquipment();
      addToast({ type: 'success', message: 'Equipment updated successfully' });
      return equipment;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update equipment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    setLoading(true);
    try {
      await GroundOperationsService.deleteEquipment(equipmentId);
      await loadGroundEquipment();
      addToast({ type: 'success', message: 'Equipment deleted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete equipment' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recordEquipmentUsage = async (equipmentId: string, usageData: any) => {
    setLoading(true);
    try {
      const equipment = await GroundOperationsService.recordUsage(equipmentId, usageData);
      await loadGroundEquipment();
      addToast({ type: 'success', message: 'Equipment usage recorded successfully' });
      return equipment;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to record equipment usage' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadRampProcedures = async () => {
    const data = await GroundOperationsService.getAllProcedures();
    setRampProcedures(data);
  };

  const createRampProcedure = async (procedureData: Partial<RampHandlingProcedure>) => {
    setLoading(true);
    try {
      const procedure = await GroundOperationsService.createProcedure(procedureData);
      await loadRampProcedures();
      addToast({ type: 'success', message: 'Ramp procedure created successfully' });
      return procedure;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create ramp procedure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRampProcedure = async (procedureId: string, updates: Partial<RampHandlingProcedure>) => {
    setLoading(true);
    try {
      const procedure = await GroundOperationsService.updateProcedure(procedureId, updates);
      await loadRampProcedures();
      addToast({ type: 'success', message: 'Ramp procedure updated successfully' });
      return procedure;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update ramp procedure' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSafetyCompliance = async () => {
    const data = await GroundOperationsService.getAllSafetyCompliance();
    setSafetyCompliance(data);
  };

  const createSafetyCompliance = async (complianceData: Partial<SafetyCompliance>) => {
    setLoading(true);
    try {
      const compliance = await GroundOperationsService.createSafetyCompliance(complianceData);
      await loadSafetyCompliance();
      addToast({ type: 'success', message: 'Safety compliance record created successfully' });
      return compliance;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to create safety compliance record' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSafetyCompliance = async (complianceId: string, updates: Partial<SafetyCompliance>) => {
    setLoading(true);
    try {
      const compliance = await GroundOperationsService.updateSafetyCompliance(complianceId, updates);
      await loadSafetyCompliance();
      addToast({ type: 'success', message: 'Safety compliance record updated successfully' });
      return compliance;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update safety compliance record' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGroundStaffById = async (staffId: string) => {
    return await GroundOperationsService.getGroundStaffById(staffId);
  };

  const getTurnaroundById = async (assignmentId: string) => {
    return await GroundOperationsService.getTurnaroundById(assignmentId);
  };

  const getEquipmentById = async (equipmentId: string) => {
    return await GroundOperationsService.getEquipmentById(equipmentId);
  };

  const getProcedureById = async (procedureId: string) => {
    return await GroundOperationsService.getProcedureById(procedureId);
  };

  const getSafetyComplianceById = async (complianceId: string) => {
    return await GroundOperationsService.getSafetyComplianceById(complianceId);
  };

  // ==================== Settings Methods ====================

  const loadSettings = async () => {
    const data = await AviationSettingsService.getSettings();
    setSettings(data);
  };

  const updateSettings = async (updates: Partial<AviationSettings>) => {
    setLoading(true);
    try {
      const settingsData = await AviationSettingsService.updateSettings(updates);
      setSettings(settingsData);
      addToast({ type: 'success', message: 'Settings updated successfully' });
      return settingsData;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update settings' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== Alerts Methods ====================

  const loadAlerts = async () => {
    const data = await AlertsService.getAllAlerts();
    setAlerts(data);
  };

  const createAlert = async (alertData: Partial<Alert>) => {
    setLoading(true);
    try {
      const alert = await AlertsService.createAlert(alertData);
      await loadAlerts();
      addToast({ type: 'info', message: 'Alert created' });
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
      await loadAlerts();
      addToast({ type: 'success', message: 'Alert acknowledged' });
      return alert;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to acknowledge alert' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      const alert = await AlertsService.resolveAlert(alertId);
      await loadAlerts();
      addToast({ type: 'success', message: 'Alert resolved' });
      return alert;
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to resolve alert' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== Return Hook API ====================

  return {
    // State
    crewMembers,
    flightAssignments,
    dutyTimes,
    restPeriods,
    pilots,
    trainingRecords,
    simulatorSessions,
    proficiencyChecks,
    groundStaff,
    turnarounds,
    groundEquipment,
    rampProcedures,
    safetyCompliance,
    settings,
    alerts,
    loading,
    error,
    toasts,

    // Cabin Crew Methods
    createCrewMember,
    updateCrewMember,
    deleteCrewMember,
    getCrewMemberById,
    createFlightAssignment,
    updateFlightAssignment,
    getCrewAssignments,
    recordDutyTime,
    getCrewDutyTimes,
    recordRestPeriod,
    getCrewRestPeriods,
    updateDutyStatus,
    loadCrewMembers,
    loadFlightAssignments,

    // Pilot Training Methods
    createPilot,
    updatePilot,
    deletePilot,
    getPilotById,
    createTrainingRecord,
    updateTrainingRecord,
    getPilotTrainingRecords,
    createSimulatorSession,
    updateSimulatorSession,
    getPilotSimulatorSessions,
    createProficiencyCheck,
    getPilotProficiencyChecks,
    updateFlightHours,
    loadPilots,
    loadTrainingRecords,
    loadSimulatorSessions,
    loadProficiencyChecks,

    // Ground Operations Methods
    createGroundStaff,
    updateGroundStaff,
    deleteGroundStaff,
    getGroundStaffById,
    createTurnaround,
    updateTurnaround,
    getTurnaroundById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById,
    recordEquipmentUsage,
    createRampProcedure,
    updateRampProcedure,
    getProcedureById,
    createSafetyCompliance,
    updateSafetyCompliance,
    getSafetyComplianceById,
    loadGroundStaff,
    loadTurnarounds,
    loadGroundEquipment,
    loadRampProcedures,
    loadSafetyCompliance,

    // Settings Methods
    updateSettings,
    loadSettings,

    // Alerts Methods
    createAlert,
    acknowledgeAlert,
    resolveAlert,
    loadAlerts,

    // Utility
    loadAllData,
  };
};
