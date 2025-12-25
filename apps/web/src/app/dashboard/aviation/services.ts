/**
 * Aviation Module - Service Layer
 * Handles all business logic for Cabin Crew, Pilot Training, and Ground Operations
 */

import { APIClient } from '@/lib/api-client';
import {
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
} from './types';

/**
 * Cabin Crew Service
 * Manages cabin crew members, assignments, duty times, and rest periods
 */
export class CabinCrewService {
  private static endpoint = '/aviation/cabin-crew';

  static async getAllCrewMembers(): Promise<CrewMemberProfile[]> {
    try {
      const response = await APIClient.get<{ crewMembers?: CrewMemberProfile[] }>(`${this.endpoint}/members`);
      return response.crewMembers || [];
    } catch (error) {
      console.error('Error fetching crew members:', error);
      return [];
    }
  }

  static async getCrewMemberById(crewId: string): Promise<CrewMemberProfile | null> {
    try {
      const response = await APIClient.get<{ crewMember?: CrewMemberProfile }>(`${this.endpoint}/members/${crewId}`);
      return response.crewMember || null;
    } catch (error) {
      console.error('Error fetching crew member:', error);
      return null;
    }
  }

  static async createCrewMember(memberData: Partial<CrewMemberProfile>): Promise<CrewMemberProfile> {
    const response = await APIClient.post<{ crewMember: CrewMemberProfile }>(`${this.endpoint}/members`, memberData);
    return response.crewMember;
  }

  static async updateCrewMember(crewId: string, updates: Partial<CrewMemberProfile>): Promise<CrewMemberProfile> {
    const response = await APIClient.put<{ crewMember: CrewMemberProfile }>(`${this.endpoint}/members/${crewId}`, updates);
    return response.crewMember;
  }

  static async deleteCrewMember(crewId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/members/${crewId}`);
    return true;
  }

  // Flight Assignments
  static async getAllFlightAssignments(): Promise<FlightAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: FlightAssignment[] }>(`${this.endpoint}/assignments`);
      return response.assignments || [];
    } catch (error) {
      console.error('Error fetching flight assignments:', error);
      return [];
    }
  }

  static async getFlightAssignmentById(assignmentId: string): Promise<FlightAssignment | null> {
    try {
      const response = await APIClient.get<{ assignment?: FlightAssignment }>(`${this.endpoint}/assignments/${assignmentId}`);
      return response.assignment || null;
    } catch (error) {
      console.error('Error fetching flight assignment:', error);
      return null;
    }
  }

  static async getCrewAssignments(crewId: string): Promise<FlightAssignment[]> {
    try {
      const response = await APIClient.get<{ assignments?: FlightAssignment[] }>(`${this.endpoint}/members/${crewId}/assignments`);
      return response.assignments || [];
    } catch (error) {
      console.error('Error fetching crew assignments:', error);
      return [];
    }
  }

  static async createFlightAssignment(assignmentData: Partial<FlightAssignment>): Promise<FlightAssignment> {
    const response = await APIClient.post<{ assignment: FlightAssignment }>(`${this.endpoint}/assignments`, assignmentData);
    return response.assignment;
  }

  static async updateFlightAssignment(assignmentId: string, updates: Partial<FlightAssignment>): Promise<FlightAssignment> {
    const response = await APIClient.put<{ assignment: FlightAssignment }>(`${this.endpoint}/assignments/${assignmentId}`, updates);
    return response.assignment;
  }

  // Duty Time Management
  static async getAllDutyTimes(): Promise<DutyTime[]> {
    try {
      const response = await APIClient.get<{ dutyTimes?: DutyTime[] }>(`${this.endpoint}/duty-times`);
      return response.dutyTimes || [];
    } catch (error) {
      console.error('Error fetching duty times:', error);
      return [];
    }
  }

  static async getCrewDutyTimes(crewId: string): Promise<DutyTime[]> {
    try {
      const response = await APIClient.get<{ dutyTimes?: DutyTime[] }>(`${this.endpoint}/members/${crewId}/duty-times`);
      return response.dutyTimes || [];
    } catch (error) {
      console.error('Error fetching crew duty times:', error);
      return [];
    }
  }

  static async recordDutyTime(dutyData: Partial<DutyTime>): Promise<DutyTime> {
    const response = await APIClient.post<{ dutyTime: DutyTime }>(`${this.endpoint}/duty-times`, dutyData);
    return response.dutyTime;
  }

  // Rest Period Management
  static async getAllRestPeriods(): Promise<RestPeriod[]> {
    try {
      const response = await APIClient.get<{ restPeriods?: RestPeriod[] }>(`${this.endpoint}/rest-periods`);
      return response.restPeriods || [];
    } catch (error) {
      console.error('Error fetching rest periods:', error);
      return [];
    }
  }

  static async getCrewRestPeriods(crewId: string): Promise<RestPeriod[]> {
    try {
      const response = await APIClient.get<{ restPeriods?: RestPeriod[] }>(`${this.endpoint}/members/${crewId}/rest-periods`);
      return response.restPeriods || [];
    } catch (error) {
      console.error('Error fetching crew rest periods:', error);
      return [];
    }
  }

  static async recordRestPeriod(restData: Partial<RestPeriod>): Promise<RestPeriod> {
    const response = await APIClient.post<{ restPeriod: RestPeriod }>(`${this.endpoint}/rest-periods`, restData);
    return response.restPeriod;
  }

  static async updateDutyStatus(crewId: string, status: any): Promise<CrewMemberProfile> {
    return this.updateCrewMember(crewId, { dutyStatus: status });
  }
}

/**
 * Pilot Training Service
 * Manages pilot profiles, training records, simulator sessions, and proficiency checks
 */
export class PilotTrainingService {
  private static endpoint = '/aviation/pilot-training';

  static async getAllPilots(): Promise<PilotProfile[]> {
    try {
      const response = await APIClient.get<{ pilots?: PilotProfile[] }>(`${this.endpoint}/pilots`);
      return response.pilots || [];
    } catch (error) {
      console.error('Error fetching pilots:', error);
      return [];
    }
  }

  static async getPilotById(pilotId: string): Promise<PilotProfile | null> {
    try {
      const response = await APIClient.get<{ pilot?: PilotProfile }>(`${this.endpoint}/pilots/${pilotId}`);
      return response.pilot || null;
    } catch (error) {
      console.error('Error fetching pilot:', error);
      return null;
    }
  }

  static async createPilot(pilotData: Partial<PilotProfile>): Promise<PilotProfile> {
    const response = await APIClient.post<{ pilot: PilotProfile }>(`${this.endpoint}/pilots`, pilotData);
    return response.pilot;
  }

  static async updatePilot(pilotId: string, updates: Partial<PilotProfile>): Promise<PilotProfile> {
    const response = await APIClient.put<{ pilot: PilotProfile }>(`${this.endpoint}/pilots/${pilotId}`, updates);
    return response.pilot;
  }

  static async deletePilot(pilotId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/pilots/${pilotId}`);
    return true;
  }

  // Training Records
  static async getAllTrainingRecords(): Promise<TrainingRecord[]> {
    try {
      const response = await APIClient.get<{ trainingRecords?: TrainingRecord[] }>(`${this.endpoint}/training-records`);
      return response.trainingRecords || [];
    } catch (error) {
      console.error('Error fetching training records:', error);
      return [];
    }
  }

  static async getPilotTrainingRecords(pilotId: string): Promise<TrainingRecord[]> {
    try {
      const response = await APIClient.get<{ trainingRecords?: TrainingRecord[] }>(`${this.endpoint}/pilots/${pilotId}/training-records`);
      return response.trainingRecords || [];
    } catch (error) {
      console.error('Error fetching pilot training records:', error);
      return [];
    }
  }

  static async createTrainingRecord(pilotId: string, recordData: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const response = await APIClient.post<{ trainingRecord: TrainingRecord }>(`${this.endpoint}/pilots/${pilotId}/training-records`, recordData);
    return response.trainingRecord;
  }

  static async updateTrainingRecord(recordId: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const response = await APIClient.put<{ trainingRecord: TrainingRecord }>(`${this.endpoint}/training-records/${recordId}`, updates);
    return response.trainingRecord;
  }

  // Simulator Sessions
  static async getAllSimulatorSessions(): Promise<SimulatorSession[]> {
    try {
      const response = await APIClient.get<{ simulatorSessions?: SimulatorSession[] }>(`${this.endpoint}/simulator-sessions`);
      return response.simulatorSessions || [];
    } catch (error) {
      console.error('Error fetching simulator sessions:', error);
      return [];
    }
  }

  static async getPilotSimulatorSessions(pilotId: string): Promise<SimulatorSession[]> {
    try {
      const response = await APIClient.get<{ simulatorSessions?: SimulatorSession[] }>(`${this.endpoint}/pilots/${pilotId}/simulator-sessions`);
      return response.simulatorSessions || [];
    } catch (error) {
      console.error('Error fetching pilot simulator sessions:', error);
      return [];
    }
  }

  static async createSimulatorSession(sessionData: Partial<SimulatorSession>): Promise<SimulatorSession> {
    const response = await APIClient.post<{ simulatorSession: SimulatorSession }>(`${this.endpoint}/simulator-sessions`, sessionData);
    return response.simulatorSession;
  }

  static async updateSimulatorSession(sessionId: string, updates: Partial<SimulatorSession>): Promise<SimulatorSession> {
    const response = await APIClient.put<{ simulatorSession: SimulatorSession }>(`${this.endpoint}/simulator-sessions/${sessionId}`, updates);
    return response.simulatorSession;
  }

  // Proficiency Checks
  static async getAllProficiencyChecks(): Promise<ProficiencyCheck[]> {
    try {
      const response = await APIClient.get<{ proficiencyChecks?: ProficiencyCheck[] }>(`${this.endpoint}/proficiency-checks`);
      return response.proficiencyChecks || [];
    } catch (error) {
      console.error('Error fetching proficiency checks:', error);
      return [];
    }
  }

  static async getPilotProficiencyChecks(pilotId: string): Promise<ProficiencyCheck[]> {
    try {
      const response = await APIClient.get<{ proficiencyChecks?: ProficiencyCheck[] }>(`${this.endpoint}/pilots/${pilotId}/proficiency-checks`);
      return response.proficiencyChecks || [];
    } catch (error) {
      console.error('Error fetching pilot proficiency checks:', error);
      return [];
    }
  }

  static async createProficiencyCheck(checkData: Partial<ProficiencyCheck>): Promise<ProficiencyCheck> {
    const response = await APIClient.post<{ proficiencyCheck: ProficiencyCheck }>(`${this.endpoint}/proficiency-checks`, checkData);
    return response.proficiencyCheck;
  }

  static async updateFlightHours(pilotId: string, hours: Partial<any>): Promise<PilotProfile> {
    const response = await APIClient.put<{ pilot: PilotProfile }>(`${this.endpoint}/pilots/${pilotId}/flight-hours`, hours);
    return response.pilot;
  }
}

/**
 * Ground Operations Service
 * Manages ground staff, equipment, turnaround operations, and safety compliance
 */
export class GroundOperationsService {
  private static endpoint = '/aviation/ground-operations';

  static async getAllGroundStaff(): Promise<GroundStaffMember[]> {
    try {
      const response = await APIClient.get<{ groundStaff?: GroundStaffMember[] }>(`${this.endpoint}/staff`);
      return response.groundStaff || [];
    } catch (error) {
      console.error('Error fetching ground staff:', error);
      return [];
    }
  }

  static async getGroundStaffById(staffId: string): Promise<GroundStaffMember | null> {
    try {
      const response = await APIClient.get<{ groundStaff?: GroundStaffMember }>(`${this.endpoint}/staff/${staffId}`);
      return response.groundStaff || null;
    } catch (error) {
      console.error('Error fetching ground staff:', error);
      return null;
    }
  }

  static async createGroundStaff(staffData: Partial<GroundStaffMember>): Promise<GroundStaffMember> {
    const response = await APIClient.post<{ groundStaff: GroundStaffMember }>(`${this.endpoint}/staff`, staffData);
    return response.groundStaff;
  }

  static async updateGroundStaff(staffId: string, updates: Partial<GroundStaffMember>): Promise<GroundStaffMember> {
    const response = await APIClient.put<{ groundStaff: GroundStaffMember }>(`${this.endpoint}/staff/${staffId}`, updates);
    return response.groundStaff;
  }

  static async deleteGroundStaff(staffId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/staff/${staffId}`);
    return true;
  }

  // Turnaround Operations
  static async getAllTurnarounds(): Promise<TurnaroundAssignment[]> {
    try {
      const response = await APIClient.get<{ turnarounds?: TurnaroundAssignment[] }>(`${this.endpoint}/turnarounds`);
      return response.turnarounds || [];
    } catch (error) {
      console.error('Error fetching turnarounds:', error);
      return [];
    }
  }

  static async getTurnaroundById(assignmentId: string): Promise<TurnaroundAssignment | null> {
    try {
      const response = await APIClient.get<{ turnaround?: TurnaroundAssignment }>(`${this.endpoint}/turnarounds/${assignmentId}`);
      return response.turnaround || null;
    } catch (error) {
      console.error('Error fetching turnaround:', error);
      return null;
    }
  }

  static async createTurnaround(turnaroundData: Partial<TurnaroundAssignment>): Promise<TurnaroundAssignment> {
    const response = await APIClient.post<{ turnaround: TurnaroundAssignment }>(`${this.endpoint}/turnarounds`, turnaroundData);
    return response.turnaround;
  }

  static async updateTurnaround(assignmentId: string, updates: Partial<TurnaroundAssignment>): Promise<TurnaroundAssignment> {
    const response = await APIClient.put<{ turnaround: TurnaroundAssignment }>(`${this.endpoint}/turnarounds/${assignmentId}`, updates);
    return response.turnaround;
  }

  // Ground Equipment
  static async getAllEquipment(): Promise<GroundEquipment[]> {
    try {
      const response = await APIClient.get<{ equipment?: GroundEquipment[] }>(`${this.endpoint}/equipment`);
      return response.equipment || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  }

  static async getEquipmentById(equipmentId: string): Promise<GroundEquipment | null> {
    try {
      const response = await APIClient.get<{ equipment?: GroundEquipment }>(`${this.endpoint}/equipment/${equipmentId}`);
      return response.equipment || null;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return null;
    }
  }

  static async createEquipment(equipmentData: Partial<GroundEquipment>): Promise<GroundEquipment> {
    const response = await APIClient.post<{ equipment: GroundEquipment }>(`${this.endpoint}/equipment`, equipmentData);
    return response.equipment;
  }

  static async updateEquipment(equipmentId: string, updates: Partial<GroundEquipment>): Promise<GroundEquipment> {
    const response = await APIClient.put<{ equipment: GroundEquipment }>(`${this.endpoint}/equipment/${equipmentId}`, updates);
    return response.equipment;
  }

  static async deleteEquipment(equipmentId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/equipment/${equipmentId}`);
    return true;
  }

  static async recordUsage(equipmentId: string, usageData: any): Promise<GroundEquipment> {
    const response = await APIClient.post<{ equipment: GroundEquipment }>(`${this.endpoint}/equipment/${equipmentId}/usage`, usageData);
    return response.equipment;
  }

  // Ramp Handling Procedures
  static async getAllProcedures(): Promise<RampHandlingProcedure[]> {
    try {
      const response = await APIClient.get<{ procedures?: RampHandlingProcedure[] }>(`${this.endpoint}/procedures`);
      return response.procedures || [];
    } catch (error) {
      console.error('Error fetching procedures:', error);
      return [];
    }
  }

  static async getProcedureById(procedureId: string): Promise<RampHandlingProcedure | null> {
    try {
      const response = await APIClient.get<{ procedure?: RampHandlingProcedure }>(`${this.endpoint}/procedures/${procedureId}`);
      return response.procedure || null;
    } catch (error) {
      console.error('Error fetching procedure:', error);
      return null;
    }
  }

  static async createProcedure(procedureData: Partial<RampHandlingProcedure>): Promise<RampHandlingProcedure> {
    const response = await APIClient.post<{ procedure: RampHandlingProcedure }>(`${this.endpoint}/procedures`, procedureData);
    return response.procedure;
  }

  static async updateProcedure(procedureId: string, updates: Partial<RampHandlingProcedure>): Promise<RampHandlingProcedure> {
    const response = await APIClient.put<{ procedure: RampHandlingProcedure }>(`${this.endpoint}/procedures/${procedureId}`, updates);
    return response.procedure;
  }

  // Safety Compliance
  static async getAllSafetyCompliance(): Promise<SafetyCompliance[]> {
    try {
      const response = await APIClient.get<{ safetyCompliance?: SafetyCompliance[] }>(`${this.endpoint}/safety-compliance`);
      return response.safetyCompliance || [];
    } catch (error) {
      console.error('Error fetching safety compliance:', error);
      return [];
    }
  }

  static async getSafetyComplianceById(complianceId: string): Promise<SafetyCompliance | null> {
    try {
      const response = await APIClient.get<{ safetyCompliance?: SafetyCompliance }>(`${this.endpoint}/safety-compliance/${complianceId}`);
      return response.safetyCompliance || null;
    } catch (error) {
      console.error('Error fetching safety compliance:', error);
      return null;
    }
  }

  static async createSafetyCompliance(complianceData: Partial<SafetyCompliance>): Promise<SafetyCompliance> {
    const response = await APIClient.post<{ safetyCompliance: SafetyCompliance }>(`${this.endpoint}/safety-compliance`, complianceData);
    return response.safetyCompliance;
  }

  static async updateSafetyCompliance(complianceId: string, updates: Partial<SafetyCompliance>): Promise<SafetyCompliance> {
    const response = await APIClient.put<{ safetyCompliance: SafetyCompliance }>(`${this.endpoint}/safety-compliance/${complianceId}`, updates);
    return response.safetyCompliance;
  }
}

/**
 * Aviation Settings Service
 * Manages module settings and configurations
 */
export class AviationSettingsService {
  private static endpoint = '/aviation/settings';

  static async getSettings(): Promise<AviationSettings | null> {
    try {
      const response = await APIClient.get<{ settings?: AviationSettings }>(this.endpoint);
      return response.settings || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  static async updateSettings(settings: Partial<AviationSettings>): Promise<AviationSettings> {
    const response = await APIClient.put<{ settings: AviationSettings }>(this.endpoint, settings);
    return response.settings;
  }
}

/**
 * Alerts Service
 * Manages alerts and notifications
 */
export class AlertsService {
  private static endpoint = '/aviation/alerts';

  static async getAllAlerts(): Promise<Alert[]> {
    try {
      const response = await APIClient.get<{ alerts?: Alert[] }>(this.endpoint);
      return response.alerts || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }

  static async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const response = await APIClient.post<{ alert: Alert }>(this.endpoint, alertData);
    return response.alert;
  }

  static async updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert> {
    const response = await APIClient.put<{ alert: Alert }>(`${this.endpoint}/${alertId}`, updates);
    return response.alert;
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<Alert> {
    const response = await APIClient.post<{ alert: Alert }>(`${this.endpoint}/${alertId}/acknowledge`, { userId });
    return response.alert;
  }

  static async resolveAlert(alertId: string): Promise<Alert> {
    const response = await APIClient.post<{ alert: Alert }>(`${this.endpoint}/${alertId}/resolve`, {});
    return response.alert;
  }
}
