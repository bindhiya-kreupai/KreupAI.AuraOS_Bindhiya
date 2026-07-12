/**
 * Aviation Module - Service Layer
 * Handles all business logic for Cabin Crew, Pilot Training, and Ground Operations
 */

import { APIClient } from '@/lib/api-client';
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
  Alert,
} from './types';

/**
 * Cabin Crew Service
 * Manages cabin crew members, assignments, duty times, and rest periods
 */
export class CabinCrewService {
  private static endpoint = '/industry-aviation/cabin-crew';
  static async getAllCrewMembers(): Promise<CrewMemberProfile[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);

      return APIClient.unwrapList<CrewMemberProfile>(response, 'crewMembers');
    } catch (_error: any) {
      return [];
    }
  }

  static async getCrewMemberById(crewId: string): Promise<CrewMemberProfile | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/members/${crewId}`);
      return APIClient.unwrapItem<CrewMemberProfile>(response, 'crewMember');
    } catch (_error: any) {
      return null;
    }
  }

  static async createCrewMember(
    memberData: Partial<CrewMemberProfile>
  ): Promise<CrewMemberProfile> {
    const response = await APIClient.post<unknown>(this.endpoint, memberData);

    const crewMember = APIClient.unwrapItem<CrewMemberProfile>(response, 'crewMember');

    if (!crewMember) {
      throw new Error('Crew member was not returned by the API');
    }

    return crewMember;
  }
  static async updateCrewMember(
    crewId: string,
    updates: Partial<CrewMemberProfile>
  ): Promise<CrewMemberProfile> {
    const response = await APIClient.put<unknown>(`${this.endpoint}/${crewId}`, updates);

    const crewMember = APIClient.unwrapItem<CrewMemberProfile>(response, 'crewMember');

    if (!crewMember) {
      throw new Error('Updated crew member was not returned by the API');
    }

    return crewMember;
  }

  static async deleteCrewMember(crewId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/${crewId}`);
    return true;
  }
  // Flight Assignments
  static async getAllFlightAssignments(): Promise<FlightAssignment[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/assignments`);
      return APIClient.unwrapList<FlightAssignment>(response, 'assignments');
    } catch (_error: any) {
      return [];
    }
  }

  static async getFlightAssignmentById(assignmentId: string): Promise<FlightAssignment | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/assignments/${assignmentId}`);
      return APIClient.unwrapItem<FlightAssignment>(response, 'assignment');
    } catch (_error: any) {
      return null;
    }
  }

  static async getCrewAssignments(crewId: string): Promise<FlightAssignment[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/members/${crewId}/assignments`
      );
      return APIClient.unwrapList<FlightAssignment>(response, 'assignments');
    } catch (_error: any) {
      return [];
    }
  }

  static async createFlightAssignment(
    assignmentData: Partial<FlightAssignment>
  ): Promise<FlightAssignment> {
    const response = await APIClient.post<{ assignment: FlightAssignment }>(
      `${this.endpoint}/assignments`,
      assignmentData
    );
    return response.assignment;
  }

  static async updateFlightAssignment(
    assignmentId: string,
    updates: Partial<FlightAssignment>
  ): Promise<FlightAssignment> {
    const response = await APIClient.put<{ assignment: FlightAssignment }>(
      `${this.endpoint}/assignments/${assignmentId}`,
      updates
    );
    return response.assignment;
  }

  // Duty Time Management
  static async getAllDutyTimes(): Promise<DutyTime[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/duty-times`);
      return APIClient.unwrapList<DutyTime>(response, 'dutyTimes');
    } catch (_error: any) {
      return [];
    }
  }

  static async getCrewDutyTimes(crewId: string): Promise<DutyTime[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/members/${crewId}/duty-times`
      );
      return APIClient.unwrapList<DutyTime>(response, 'dutyTimes');
    } catch (_error: any) {
      return [];
    }
  }

  static async recordDutyTime(dutyData: Partial<DutyTime>): Promise<DutyTime> {
    const response = await APIClient.post<{ dutyTime: DutyTime }>(
      `${this.endpoint}/duty-times`,
      dutyData
    );
    return response.dutyTime;
  }

  // Rest Period Management
  static async getAllRestPeriods(): Promise<RestPeriod[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/rest-periods`);
      return APIClient.unwrapList<RestPeriod>(response, 'restPeriods');
    } catch (_error: any) {
      return [];
    }
  }

  static async getCrewRestPeriods(crewId: string): Promise<RestPeriod[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/members/${crewId}/rest-periods`
      );
      return APIClient.unwrapList<RestPeriod>(response, 'restPeriods');
    } catch (_error: any) {
      return [];
    }
  }

  static async recordRestPeriod(restData: Partial<RestPeriod>): Promise<RestPeriod> {
    const response = await APIClient.post<{ restPeriod: RestPeriod }>(
      `${this.endpoint}/rest-periods`,
      restData
    );
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
  private static endpoint = '/industry-aviation/pilot-training';

  static async getAllPilots(): Promise<PilotProfile[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);

      return APIClient.unwrapList<PilotProfile>(response, 'pilots');
    } catch (_error: any) {
      return [];
    }
  }

  static async getPilotById(pilotId: string): Promise<PilotProfile | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/pilots/${pilotId}`);
      return APIClient.unwrapItem<PilotProfile>(response, 'pilot');
    } catch (_error: any) {
      return null;
    }
  }
  static async createPilot(pilotData: Partial<PilotProfile>): Promise<PilotProfile> {
    const response = await APIClient.post<unknown>(this.endpoint, pilotData);

    const pilot = APIClient.unwrapItem<PilotProfile>(response, 'pilot');

    if (!pilot) {
      throw new Error('Pilot training record was not returned by the API');
    }

    return pilot;
  }
  static async updatePilot(pilotId: string, updates: Partial<PilotProfile>): Promise<PilotProfile> {
    const response = await APIClient.put<{ pilot: PilotProfile }>(
      `${this.endpoint}/pilots/${pilotId}`,
      updates
    );
    return response.pilot;
  }

  static async deletePilot(pilotId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/pilots/${pilotId}`);
    return true;
  }

  // Training Records
  static async getAllTrainingRecords(): Promise<TrainingRecord[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/training-records`);
      return APIClient.unwrapList<TrainingRecord>(response, 'trainingRecords');
    } catch (_error: any) {
      return [];
    }
  }

  static async getPilotTrainingRecords(pilotId: string): Promise<TrainingRecord[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/pilots/${pilotId}/training-records`
      );
      return APIClient.unwrapList<TrainingRecord>(response, 'trainingRecords');
    } catch (_error: any) {
      return [];
    }
  }

  static async createTrainingRecord(
    pilotId: string,
    recordData: Partial<TrainingRecord>
  ): Promise<TrainingRecord> {
    const response = await APIClient.post<{ trainingRecord: TrainingRecord }>(
      `${this.endpoint}/pilots/${pilotId}/training-records`,
      recordData
    );
    return response.trainingRecord;
  }

  static async updateTrainingRecord(
    recordId: string,
    updates: Partial<TrainingRecord>
  ): Promise<TrainingRecord> {
    const response = await APIClient.put<{ trainingRecord: TrainingRecord }>(
      `${this.endpoint}/training-records/${recordId}`,
      updates
    );
    return response.trainingRecord;
  }

  // Simulator Sessions
  static async getAllSimulatorSessions(): Promise<SimulatorSession[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/simulator-sessions`);
      return APIClient.unwrapList<SimulatorSession>(response, 'simulatorSessions');
    } catch (_error: any) {
      return [];
    }
  }

  static async getPilotSimulatorSessions(pilotId: string): Promise<SimulatorSession[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/pilots/${pilotId}/simulator-sessions`
      );
      return APIClient.unwrapList<SimulatorSession>(response, 'simulatorSessions');
    } catch (_error: any) {
      return [];
    }
  }

  static async createSimulatorSession(
    sessionData: Partial<SimulatorSession>
  ): Promise<SimulatorSession> {
    const response = await APIClient.post<{ simulatorSession: SimulatorSession }>(
      `${this.endpoint}/simulator-sessions`,
      sessionData
    );
    return response.simulatorSession;
  }

  static async updateSimulatorSession(
    sessionId: string,
    updates: Partial<SimulatorSession>
  ): Promise<SimulatorSession> {
    const response = await APIClient.put<{ simulatorSession: SimulatorSession }>(
      `${this.endpoint}/simulator-sessions/${sessionId}`,
      updates
    );
    return response.simulatorSession;
  }

  // Proficiency Checks
  static async getAllProficiencyChecks(): Promise<ProficiencyCheck[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/proficiency-checks`);
      return APIClient.unwrapList<ProficiencyCheck>(response, 'proficiencyChecks');
    } catch (_error: any) {
      return [];
    }
  }

  static async getPilotProficiencyChecks(pilotId: string): Promise<ProficiencyCheck[]> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/pilots/${pilotId}/proficiency-checks`
      );
      return APIClient.unwrapList<ProficiencyCheck>(response, 'proficiencyChecks');
    } catch (_error: any) {
      return [];
    }
  }

  static async createProficiencyCheck(
    checkData: Partial<ProficiencyCheck>
  ): Promise<ProficiencyCheck> {
    const response = await APIClient.post<{ proficiencyCheck: ProficiencyCheck }>(
      `${this.endpoint}/proficiency-checks`,
      checkData
    );
    return response.proficiencyCheck;
  }

  static async updateFlightHours(pilotId: string, hours: Partial<any>): Promise<PilotProfile> {
    const response = await APIClient.put<{ pilot: PilotProfile }>(
      `${this.endpoint}/pilots/${pilotId}/flight-hours`,
      hours
    );
    return response.pilot;
  }
}

/**
 * Ground Operations Service
 * Manages ground staff, equipment, turnaround operations, and safety compliance
 */
export class GroundOperationsService {
  private static endpoint = '/industry-aviation/ground-operations';

  static async getAllGroundStaff(): Promise<GroundStaffMember[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/staff`);
      return APIClient.unwrapList<GroundStaffMember>(response, 'groundStaff');
    } catch (_error: any) {
      return [];
    }
  }

  static async getGroundStaffById(staffId: string): Promise<GroundStaffMember | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/staff/${staffId}`);
      return APIClient.unwrapItem<GroundStaffMember>(response, 'groundStaff');
    } catch (_error: any) {
      return null;
    }
  }

  static async createGroundStaff(
    staffData: Partial<GroundStaffMember>
  ): Promise<GroundStaffMember> {
    const response = await APIClient.post<unknown>(`${this.endpoint}/staff`, staffData);

    const groundStaff = APIClient.unwrapItem<GroundStaffMember>(response, 'groundStaff');

    if (!groundStaff) {
      throw new Error('Ground staff record was not returned by the API');
    }

    return groundStaff;
  }
  static async updateGroundStaff(
    staffId: string,
    updates: Partial<GroundStaffMember>
  ): Promise<GroundStaffMember> {
    const response = await APIClient.put<{ groundStaff: GroundStaffMember }>(
      `${this.endpoint}/staff/${staffId}`,
      updates
    );
    return response.groundStaff;
  }

  static async deleteGroundStaff(staffId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/staff/${staffId}`);
    return true;
  }

  // Turnaround Operations
  static async getAllTurnarounds(): Promise<TurnaroundAssignment[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/turnarounds`);
      return APIClient.unwrapList<TurnaroundAssignment>(response, 'turnarounds');
    } catch (_error: any) {
      return [];
    }
  }

  static async getTurnaroundById(assignmentId: string): Promise<TurnaroundAssignment | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/turnarounds/${assignmentId}`);
      return APIClient.unwrapItem<TurnaroundAssignment>(response, 'turnaround');
    } catch (_error: any) {
      return null;
    }
  }

  static async createTurnaround(
    turnaroundData: Partial<TurnaroundAssignment>
  ): Promise<TurnaroundAssignment> {
    const response = await APIClient.post<unknown>(`${this.endpoint}/turnarounds`, turnaroundData);

    const turnaround = APIClient.unwrapItem<TurnaroundAssignment>(response, 'turnaround');

    if (!turnaround) {
      throw new Error('Turnaround record was not returned by the API');
    }

    return turnaround;
  }

  static async updateTurnaround(
    assignmentId: string,
    updates: Partial<TurnaroundAssignment>
  ): Promise<TurnaroundAssignment> {
    const response = await APIClient.put<{ turnaround: TurnaroundAssignment }>(
      `${this.endpoint}/turnarounds/${assignmentId}`,
      updates
    );
    return response.turnaround;
  }

  // Ground Equipment
  static async getAllEquipment(): Promise<GroundEquipment[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/equipment`);
      return APIClient.unwrapList<GroundEquipment>(response, 'equipment');
    } catch (_error: any) {
      return [];
    }
  }

  static async getEquipmentById(equipmentId: string): Promise<GroundEquipment | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/equipment/${equipmentId}`);
      return APIClient.unwrapItem<GroundEquipment>(response, 'equipment');
    } catch (_error: any) {
      return null;
    }
  }

  static async createEquipment(equipmentData: Partial<GroundEquipment>): Promise<GroundEquipment> {
    const response = await APIClient.post<{ equipment: GroundEquipment }>(
      `${this.endpoint}/equipment`,
      equipmentData
    );
    return response.equipment;
  }

  static async updateEquipment(
    equipmentId: string,
    updates: Partial<GroundEquipment>
  ): Promise<GroundEquipment> {
    const response = await APIClient.put<{ equipment: GroundEquipment }>(
      `${this.endpoint}/equipment/${equipmentId}`,
      updates
    );
    return response.equipment;
  }

  static async deleteEquipment(equipmentId: string): Promise<boolean> {
    await APIClient.delete(`${this.endpoint}/equipment/${equipmentId}`);
    return true;
  }

  static async recordUsage(equipmentId: string, usageData: any): Promise<GroundEquipment> {
    const response = await APIClient.post<{ equipment: GroundEquipment }>(
      `${this.endpoint}/equipment/${equipmentId}/usage`,
      usageData
    );
    return response.equipment;
  }

  // Ramp Handling Procedures
  static async getAllProcedures(): Promise<RampHandlingProcedure[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/procedures`);
      return APIClient.unwrapList<RampHandlingProcedure>(response, 'procedures');
    } catch (_error: any) {
      return [];
    }
  }

  static async getProcedureById(procedureId: string): Promise<RampHandlingProcedure | null> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/procedures/${procedureId}`);
      return APIClient.unwrapItem<RampHandlingProcedure>(response, 'procedure');
    } catch (_error: any) {
      return null;
    }
  }

  static async createProcedure(
    procedureData: Partial<RampHandlingProcedure>
  ): Promise<RampHandlingProcedure> {
    const response = await APIClient.post<{ procedure: RampHandlingProcedure }>(
      `${this.endpoint}/procedures`,
      procedureData
    );
    return response.procedure;
  }

  static async updateProcedure(
    procedureId: string,
    updates: Partial<RampHandlingProcedure>
  ): Promise<RampHandlingProcedure> {
    const response = await APIClient.put<{ procedure: RampHandlingProcedure }>(
      `${this.endpoint}/procedures/${procedureId}`,
      updates
    );
    return response.procedure;
  }

  // Safety Compliance
  static async getAllSafetyCompliance(): Promise<SafetyCompliance[]> {
    try {
      const response = await APIClient.get<unknown>(`${this.endpoint}/safety-compliance`);
      return APIClient.unwrapList<SafetyCompliance>(response, 'safetyCompliance');
    } catch (_error: any) {
      return [];
    }
  }

  static async getSafetyComplianceById(complianceId: string): Promise<SafetyCompliance | null> {
    try {
      const response = await APIClient.get<unknown>(
        `${this.endpoint}/safety-compliance/${complianceId}`
      );
      return APIClient.unwrapItem<SafetyCompliance>(response, 'safetyCompliance');
    } catch (_error: any) {
      return null;
    }
  }

  static async createSafetyCompliance(
    complianceData: Partial<SafetyCompliance>
  ): Promise<SafetyCompliance> {
    const response = await APIClient.post<{ safetyCompliance: SafetyCompliance }>(
      `${this.endpoint}/safety-compliance`,
      complianceData
    );
    return response.safetyCompliance;
  }

  static async updateSafetyCompliance(
    complianceId: string,
    updates: Partial<SafetyCompliance>
  ): Promise<SafetyCompliance> {
    const response = await APIClient.put<{ safetyCompliance: SafetyCompliance }>(
      `${this.endpoint}/safety-compliance/${complianceId}`,
      updates
    );
    return response.safetyCompliance;
  }
}

/**
 * Aviation Settings Service
 * Manages module settings and configurations
 */
export class AviationSettingsService {
  private static endpoint = '/industry-aviation/settings';

  static async getSettings(): Promise<AviationSettings | null> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapItem<AviationSettings>(response, 'settings');
    } catch (_error: any) {
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
  private static endpoint = '/industry-aviation/alerts';

  static async getAll(): Promise<Alert[]> {
    try {
      const response = await APIClient.get<unknown>(this.endpoint);
      return APIClient.unwrapList<Alert>(response, 'alerts');
    } catch (_error: any) {
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
    const response = await APIClient.post<{ alert: Alert }>(
      `${this.endpoint}/${alertId}/acknowledge`,
      { userId }
    );
    return response.alert;
  }

  static async resolveAlert(alertId: string): Promise<Alert> {
    const response = await APIClient.post<{ alert: Alert }>(
      `${this.endpoint}/${alertId}/resolve`,
      {}
    );
    return response.alert;
  }
}
