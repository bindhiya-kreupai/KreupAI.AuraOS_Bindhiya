/**
 * Aviation Module - Service Layer
 * Handles all business logic for Cabin Crew, Pilot Training, and Ground Operations
 */

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

// Storage keys for localStorage
const STORAGE_KEYS = {
  CREW_MEMBERS: 'aviation_crew_members',
  FLIGHT_ASSIGNMENTS: 'aviation_flight_assignments',
  DUTY_TIMES: 'aviation_duty_times',
  REST_PERIODS: 'aviation_rest_periods',
  PILOTS: 'aviation_pilots',
  TRAINING_RECORDS: 'aviation_training_records',
  SIMULATOR_SESSIONS: 'aviation_simulator_sessions',
  PROFICIENCY_CHECKS: 'aviation_proficiency_checks',
  GROUND_STAFF: 'aviation_ground_staff',
  TURNAROUNDS: 'aviation_turnarounds',
  GROUND_EQUIPMENT: 'aviation_ground_equipment',
  RAMP_PROCEDURES: 'aviation_ramp_procedures',
  SAFETY_COMPLIANCE: 'aviation_safety_compliance',
  SETTINGS: 'aviation_settings',
  ALERTS: 'aviation_alerts',
};

/**
 * Cabin Crew Service
 * Manages cabin crew members, assignments, duty times, and rest periods
 */
export class CabinCrewService {
  // TODO: Replace localStorage with actual API calls

  static async getAllCrewMembers(): Promise<CrewMemberProfile[]> {
    const data = localStorage.getItem(STORAGE_KEYS.CREW_MEMBERS);
    return data ? JSON.parse(data) : [];
  }

  static async getCrewMemberById(crewId: string): Promise<CrewMemberProfile | null> {
    const members = await this.getAllCrewMembers();
    return members.find(m => m.crewId === crewId) || null;
  }

  static async createCrewMember(memberData: Partial<CrewMemberProfile>): Promise<CrewMemberProfile> {
    const members = await this.getAllCrewMembers();
    const newMember: CrewMemberProfile = {
      crewId: `crew-${Date.now()}`,
      employeeId: memberData.employeeId || `EMP-${Date.now()}`,
      personalInfo: memberData.personalInfo || {} as any,
      crewType: memberData.crewType || 'flight_attendant',
      seniority: memberData.seniority || {
        hireDate: new Date().toISOString().split('T')[0],
        seniorityNumber: members.length + 1,
        yearsOfService: 0,
      },
      qualifications: memberData.qualifications || [],
      languages: memberData.languages || [],
      certifications: memberData.certifications || [],
      medicalStatus: memberData.medicalStatus || {} as any,
      dutyStatus: memberData.dutyStatus || 'off_duty',
      preferences: memberData.preferences || { preferredBases: [], preferredAircraftTypes: [], bidPreferences: [] },
      status: memberData.status || 'active',
      createdAt: new Date().toISOString(),
      ...memberData,
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.CREW_MEMBERS, JSON.stringify(members));
    return newMember;
  }

  static async updateCrewMember(crewId: string, updates: Partial<CrewMemberProfile>): Promise<CrewMemberProfile> {
    const members = await this.getAllCrewMembers();
    const index = members.findIndex(m => m.crewId === crewId);
    if (index === -1) throw new Error('Crew member not found');

    members[index] = { ...members[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CREW_MEMBERS, JSON.stringify(members));
    return members[index];
  }

  static async deleteCrewMember(crewId: string): Promise<boolean> {
    const members = await this.getAllCrewMembers();
    const filtered = members.filter(m => m.crewId !== crewId);
    localStorage.setItem(STORAGE_KEYS.CREW_MEMBERS, JSON.stringify(filtered));
    return true;
  }

  // Flight Assignments
  static async getAllFlightAssignments(): Promise<FlightAssignment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.FLIGHT_ASSIGNMENTS);
    return data ? JSON.parse(data) : [];
  }

  static async getFlightAssignmentById(assignmentId: string): Promise<FlightAssignment | null> {
    const assignments = await this.getAllFlightAssignments();
    return assignments.find(a => a.assignmentId === assignmentId) || null;
  }

  static async getCrewAssignments(crewId: string): Promise<FlightAssignment[]> {
    const assignments = await this.getAllFlightAssignments();
    return assignments.filter(a =>
      a.crewComplement.cabinDirector === crewId ||
      a.crewComplement.pursers.includes(crewId) ||
      a.crewComplement.flightAttendants.includes(crewId)
    );
  }

  static async createFlightAssignment(assignmentData: Partial<FlightAssignment>): Promise<FlightAssignment> {
    const assignments = await this.getAllFlightAssignments();
    const newAssignment: FlightAssignment = {
      assignmentId: `assign-${Date.now()}`,
      flightNumber: assignmentData.flightNumber || '',
      flightDate: assignmentData.flightDate || new Date().toISOString().split('T')[0],
      departure: assignmentData.departure || {} as any,
      arrival: assignmentData.arrival || {} as any,
      aircraftType: assignmentData.aircraftType || '',
      aircraftRegistration: assignmentData.aircraftRegistration || '',
      position: assignmentData.position || 'forward',
      scheduledDutyStart: assignmentData.scheduledDutyStart || '',
      scheduledDutyEnd: assignmentData.scheduledDutyEnd || '',
      status: assignmentData.status || 'scheduled',
      crewComplement: assignmentData.crewComplement || { cabinDirector: '', pursers: [], flightAttendants: [], totalCrew: 0 },
      briefingTime: assignmentData.briefingTime || '',
      briefingLocation: assignmentData.briefingLocation || '',
      ...assignmentData,
    };
    assignments.push(newAssignment);
    localStorage.setItem(STORAGE_KEYS.FLIGHT_ASSIGNMENTS, JSON.stringify(assignments));
    return newAssignment;
  }

  static async updateFlightAssignment(assignmentId: string, updates: Partial<FlightAssignment>): Promise<FlightAssignment> {
    const assignments = await this.getAllFlightAssignments();
    const index = assignments.findIndex(a => a.assignmentId === assignmentId);
    if (index === -1) throw new Error('Assignment not found');

    assignments[index] = { ...assignments[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.FLIGHT_ASSIGNMENTS, JSON.stringify(assignments));
    return assignments[index];
  }

  // Duty Time Management
  static async getAllDutyTimes(): Promise<DutyTime[]> {
    const data = localStorage.getItem(STORAGE_KEYS.DUTY_TIMES);
    return data ? JSON.parse(data) : [];
  }

  static async getCrewDutyTimes(crewId: string): Promise<DutyTime[]> {
    const dutyTimes = await this.getAllDutyTimes();
    return dutyTimes.filter(d => d.crewId === crewId);
  }

  static async recordDutyTime(dutyData: Partial<DutyTime>): Promise<DutyTime> {
    const dutyTimes = await this.getAllDutyTimes();
    const newDuty: DutyTime = {
      dutyTimeId: `duty-${Date.now()}`,
      crewId: dutyData.crewId || '',
      flightNumber: dutyData.flightNumber || '',
      dutyDate: dutyData.dutyDate || new Date().toISOString().split('T')[0],
      dutyPeriod: dutyData.dutyPeriod || { reportTime: '', releaseTime: '', totalDutyHours: 0 },
      flightTime: dutyData.flightTime || { blockOff: '', blockOn: '', totalFlightHours: 0 },
      sectors: dutyData.sectors || 1,
      regulations: dutyData.regulations || { maxDutyHours: 14, maxFlightHours: 9, minRestHours: 10, regulatoryBody: 'FAA' },
      compliance: dutyData.compliance || { withinLimits: true },
      createdAt: new Date().toISOString(),
      ...dutyData,
    };
    dutyTimes.push(newDuty);
    localStorage.setItem(STORAGE_KEYS.DUTY_TIMES, JSON.stringify(dutyTimes));
    return newDuty;
  }

  // Rest Period Management
  static async getAllRestPeriods(): Promise<RestPeriod[]> {
    const data = localStorage.getItem(STORAGE_KEYS.REST_PERIODS);
    return data ? JSON.parse(data) : [];
  }

  static async getCrewRestPeriods(crewId: string): Promise<RestPeriod[]> {
    const restPeriods = await this.getAllRestPeriods();
    return restPeriods.filter(r => r.crewId === crewId);
  }

  static async recordRestPeriod(restData: Partial<RestPeriod>): Promise<RestPeriod> {
    const restPeriods = await this.getAllRestPeriods();
    const newRest: RestPeriod = {
      restPeriodId: `rest-${Date.now()}`,
      crewId: restData.crewId || '',
      restType: restData.restType || 'minimum_rest',
      startTime: restData.startTime || new Date().toISOString(),
      endTime: restData.endTime || '',
      durationHours: restData.durationHours || 0,
      location: restData.location || {} as any,
      requiredHours: restData.requiredHours || 10,
      actualHours: restData.actualHours || 0,
      compliant: restData.compliant !== undefined ? restData.compliant : true,
      createdAt: new Date().toISOString(),
      ...restData,
    };
    restPeriods.push(newRest);
    localStorage.setItem(STORAGE_KEYS.REST_PERIODS, JSON.stringify(restPeriods));
    return newRest;
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
  // TODO: Replace localStorage with actual API calls

  static async getAllPilots(): Promise<PilotProfile[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PILOTS);
    return data ? JSON.parse(data) : [];
  }

  static async getPilotById(pilotId: string): Promise<PilotProfile | null> {
    const pilots = await this.getAllPilots();
    return pilots.find(p => p.pilotId === pilotId) || null;
  }

  static async createPilot(pilotData: Partial<PilotProfile>): Promise<PilotProfile> {
    const pilots = await this.getAllPilots();
    const newPilot: PilotProfile = {
      pilotId: `pilot-${Date.now()}`,
      employeeId: pilotData.employeeId || `PILOT-${Date.now()}`,
      personalInfo: pilotData.personalInfo || {} as any,
      rank: pilotData.rank || 'first_officer',
      license: pilotData.license || {} as any,
      typeRatings: pilotData.typeRatings || [],
      medicalCertificate: pilotData.medicalCertificate || {} as any,
      flightHours: pilotData.flightHours || {
        totalHours: 0, pic: 0, sic: 0, multiEngine: 0, night: 0, instrument: 0,
        simulator: 0, last30Days: 0, last90Days: 0, last12Months: 0,
        byAircraftType: {}, lastUpdated: new Date().toISOString()
      },
      trainingRecords: pilotData.trainingRecords || [],
      checkResults: pilotData.checkResults || [],
      currentQualifications: pilotData.currentQualifications || [],
      status: pilotData.status || 'active',
      createdAt: new Date().toISOString(),
      ...pilotData,
    };
    pilots.push(newPilot);
    localStorage.setItem(STORAGE_KEYS.PILOTS, JSON.stringify(pilots));
    return newPilot;
  }

  static async updatePilot(pilotId: string, updates: Partial<PilotProfile>): Promise<PilotProfile> {
    const pilots = await this.getAllPilots();
    const index = pilots.findIndex(p => p.pilotId === pilotId);
    if (index === -1) throw new Error('Pilot not found');

    pilots[index] = { ...pilots[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PILOTS, JSON.stringify(pilots));
    return pilots[index];
  }

  static async deletePilot(pilotId: string): Promise<boolean> {
    const pilots = await this.getAllPilots();
    const filtered = pilots.filter(p => p.pilotId !== pilotId);
    localStorage.setItem(STORAGE_KEYS.PILOTS, JSON.stringify(filtered));
    return true;
  }

  // Training Records
  static async getAllTrainingRecords(): Promise<TrainingRecord[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINING_RECORDS);
    return data ? JSON.parse(data) : [];
  }

  static async getPilotTrainingRecords(pilotId: string): Promise<TrainingRecord[]> {
    const pilot = await this.getPilotById(pilotId);
    return pilot?.trainingRecords || [];
  }

  static async createTrainingRecord(pilotId: string, recordData: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const records = await this.getAllTrainingRecords();
    const newRecord: TrainingRecord = {
      recordId: `train-${Date.now()}`,
      trainingType: recordData.trainingType || 'initial',
      trainingName: recordData.trainingName || '',
      aircraftType: recordData.aircraftType || '',
      trainingProvider: recordData.trainingProvider || '',
      scheduledDate: recordData.scheduledDate || new Date().toISOString().split('T')[0],
      duration: recordData.duration || { groundSchoolHours: 0, simulatorHours: 0, flightHours: 0 },
      syllabus: recordData.syllabus || {} as any,
      progress: recordData.progress || {
        overallCompletion: 0,
        modulesCompleted: 0,
        modulesTotal: 0,
        hoursCompleted: { groundSchool: 0, simulator: 0, flight: 0 }
      },
      assessments: recordData.assessments || [],
      instructor: recordData.instructor || {} as any,
      status: recordData.status || 'scheduled',
      createdAt: new Date().toISOString(),
      ...recordData,
    };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.TRAINING_RECORDS, JSON.stringify(records));

    // Update pilot's training records
    const pilot = await this.getPilotById(pilotId);
    if (pilot) {
      pilot.trainingRecords.push(newRecord);
      await this.updatePilot(pilotId, { trainingRecords: pilot.trainingRecords });
    }

    return newRecord;
  }

  static async updateTrainingRecord(recordId: string, updates: Partial<TrainingRecord>): Promise<TrainingRecord> {
    const records = await this.getAllTrainingRecords();
    const index = records.findIndex(r => r.recordId === recordId);
    if (index === -1) throw new Error('Training record not found');

    records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.TRAINING_RECORDS, JSON.stringify(records));
    return records[index];
  }

  // Simulator Sessions
  static async getAllSimulatorSessions(): Promise<SimulatorSession[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SIMULATOR_SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  static async getPilotSimulatorSessions(pilotId: string): Promise<SimulatorSession[]> {
    const sessions = await this.getAllSimulatorSessions();
    return sessions.filter(s => s.pilotId === pilotId);
  }

  static async createSimulatorSession(sessionData: Partial<SimulatorSession>): Promise<SimulatorSession> {
    const sessions = await this.getAllSimulatorSessions();
    const newSession: SimulatorSession = {
      sessionId: `sim-${Date.now()}`,
      pilotId: sessionData.pilotId || '',
      aircraftType: sessionData.aircraftType || '',
      simulatorType: sessionData.simulatorType || 'level_d',
      simulatorLocation: sessionData.simulatorLocation || '',
      scheduledDate: sessionData.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: sessionData.scheduledTime || '',
      duration: sessionData.duration || 4,
      sessionType: sessionData.sessionType || 'training',
      scenarios: sessionData.scenarios || [],
      performance: sessionData.performance || {
        overallRating: 0,
        technicalSkills: 0,
        decisionMaking: 0,
        situationalAwareness: 0,
        communication: 0,
        crm: 0,
        maneuvers: [],
        systemsKnowledge: 0,
        emergencyResponse: 0,
      },
      status: sessionData.status || 'scheduled',
      createdAt: new Date().toISOString(),
      ...sessionData,
    };
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.SIMULATOR_SESSIONS, JSON.stringify(sessions));
    return newSession;
  }

  static async updateSimulatorSession(sessionId: string, updates: Partial<SimulatorSession>): Promise<SimulatorSession> {
    const sessions = await this.getAllSimulatorSessions();
    const index = sessions.findIndex(s => s.sessionId === sessionId);
    if (index === -1) throw new Error('Simulator session not found');

    sessions[index] = { ...sessions[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SIMULATOR_SESSIONS, JSON.stringify(sessions));
    return sessions[index];
  }

  // Proficiency Checks
  static async getAllProficiencyChecks(): Promise<ProficiencyCheck[]> {
    const data = localStorage.getItem(STORAGE_KEYS.PROFICIENCY_CHECKS);
    return data ? JSON.parse(data) : [];
  }

  static async getPilotProficiencyChecks(pilotId: string): Promise<ProficiencyCheck[]> {
    const checks = await this.getAllProficiencyChecks();
    return checks.filter(c => c.pilotId === pilotId);
  }

  static async createProficiencyCheck(checkData: Partial<ProficiencyCheck>): Promise<ProficiencyCheck> {
    const checks = await this.getAllProficiencyChecks();
    const newCheck: ProficiencyCheck = {
      checkId: `check-${Date.now()}`,
      pilotId: checkData.pilotId || '',
      checkType: checkData.checkType || 'recurrent',
      aircraftType: checkData.aircraftType || '',
      checkDate: checkData.checkDate || new Date().toISOString().split('T')[0],
      examiner: checkData.examiner || {} as any,
      checklist: checkData.checklist || [],
      maneuvers: checkData.maneuvers || [],
      overallResult: checkData.overallResult || 'satisfactory',
      nextCheckDue: checkData.nextCheckDue || '',
      createdAt: new Date().toISOString(),
      ...checkData,
    };
    checks.push(newCheck);
    localStorage.setItem(STORAGE_KEYS.PROFICIENCY_CHECKS, JSON.stringify(checks));

    // Update pilot's check results
    const pilot = await this.getPilotById(checkData.pilotId || '');
    if (pilot) {
      pilot.checkResults.push(newCheck);
      await this.updatePilot(checkData.pilotId || '', { checkResults: pilot.checkResults });
    }

    return newCheck;
  }

  static async updateFlightHours(pilotId: string, hours: Partial<any>): Promise<PilotProfile> {
    const pilot = await this.getPilotById(pilotId);
    if (!pilot) throw new Error('Pilot not found');

    const updatedHours = { ...pilot.flightHours, ...hours, lastUpdated: new Date().toISOString() };
    return this.updatePilot(pilotId, { flightHours: updatedHours });
  }
}

/**
 * Ground Operations Service
 * Manages ground staff, equipment, turnaround operations, and safety compliance
 */
export class GroundOperationsService {
  // TODO: Replace localStorage with actual API calls

  static async getAllGroundStaff(): Promise<GroundStaffMember[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GROUND_STAFF);
    return data ? JSON.parse(data) : [];
  }

  static async getGroundStaffById(staffId: string): Promise<GroundStaffMember | null> {
    const staff = await this.getAllGroundStaff();
    return staff.find(s => s.staffId === staffId) || null;
  }

  static async createGroundStaff(staffData: Partial<GroundStaffMember>): Promise<GroundStaffMember> {
    const staff = await this.getAllGroundStaff();
    const newStaff: GroundStaffMember = {
      staffId: `staff-${Date.now()}`,
      employeeId: staffData.employeeId || `GND-${Date.now()}`,
      personalInfo: staffData.personalInfo || {} as any,
      role: staffData.role || 'ramp_agent',
      station: staffData.station || '',
      shift: staffData.shift || {} as any,
      certifications: staffData.certifications || [],
      equipmentQualifications: staffData.equipmentQualifications || [],
      safetyRecords: staffData.safetyRecords || [],
      performanceMetrics: staffData.performanceMetrics || {
        turnaroundsCompleted: 0,
        averageTurnaroundTime: 0,
        onTimePerformance: 0,
        safetyScore: 100,
        qualityScore: 0,
        equipmentDamageIncidents: 0,
        commendations: 0,
        monthlyMetrics: []
      },
      status: staffData.status || 'off_duty',
      createdAt: new Date().toISOString(),
      ...staffData,
    };
    staff.push(newStaff);
    localStorage.setItem(STORAGE_KEYS.GROUND_STAFF, JSON.stringify(staff));
    return newStaff;
  }

  static async updateGroundStaff(staffId: string, updates: Partial<GroundStaffMember>): Promise<GroundStaffMember> {
    const staff = await this.getAllGroundStaff();
    const index = staff.findIndex(s => s.staffId === staffId);
    if (index === -1) throw new Error('Ground staff not found');

    staff[index] = { ...staff[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GROUND_STAFF, JSON.stringify(staff));
    return staff[index];
  }

  static async deleteGroundStaff(staffId: string): Promise<boolean> {
    const staff = await this.getAllGroundStaff();
    const filtered = staff.filter(s => s.staffId !== staffId);
    localStorage.setItem(STORAGE_KEYS.GROUND_STAFF, JSON.stringify(filtered));
    return true;
  }

  // Turnaround Operations
  static async getAllTurnarounds(): Promise<TurnaroundAssignment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.TURNAROUNDS);
    return data ? JSON.parse(data) : [];
  }

  static async getTurnaroundById(assignmentId: string): Promise<TurnaroundAssignment | null> {
    const turnarounds = await this.getAllTurnarounds();
    return turnarounds.find(t => t.assignmentId === assignmentId) || null;
  }

  static async createTurnaround(turnaroundData: Partial<TurnaroundAssignment>): Promise<TurnaroundAssignment> {
    const turnarounds = await this.getAllTurnarounds();
    const newTurnaround: TurnaroundAssignment = {
      assignmentId: `turn-${Date.now()}`,
      flightNumber: turnaroundData.flightNumber || '',
      aircraftRegistration: turnaroundData.aircraftRegistration || '',
      aircraftType: turnaroundData.aircraftType || '',
      gate: turnaroundData.gate || '',
      scheduledArrival: turnaroundData.scheduledArrival || '',
      scheduledDeparture: turnaroundData.scheduledDeparture || '',
      turnaroundTime: turnaroundData.turnaroundTime || 45,
      role: turnaroundData.role || 'ramp_agent',
      tasks: turnaroundData.tasks || [],
      status: turnaroundData.status || 'scheduled',
      ...turnaroundData,
    };
    turnarounds.push(newTurnaround);
    localStorage.setItem(STORAGE_KEYS.TURNAROUNDS, JSON.stringify(turnarounds));
    return newTurnaround;
  }

  static async updateTurnaround(assignmentId: string, updates: Partial<TurnaroundAssignment>): Promise<TurnaroundAssignment> {
    const turnarounds = await this.getAllTurnarounds();
    const index = turnarounds.findIndex(t => t.assignmentId === assignmentId);
    if (index === -1) throw new Error('Turnaround not found');

    turnarounds[index] = { ...turnarounds[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TURNAROUNDS, JSON.stringify(turnarounds));
    return turnarounds[index];
  }

  // Ground Equipment
  static async getAllEquipment(): Promise<GroundEquipment[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GROUND_EQUIPMENT);
    return data ? JSON.parse(data) : [];
  }

  static async getEquipmentById(equipmentId: string): Promise<GroundEquipment | null> {
    const equipment = await this.getAllEquipment();
    return equipment.find(e => e.equipmentId === equipmentId) || null;
  }

  static async createEquipment(equipmentData: Partial<GroundEquipment>): Promise<GroundEquipment> {
    const equipment = await this.getAllEquipment();
    const newEquipment: GroundEquipment = {
      equipmentId: `equip-${Date.now()}`,
      equipmentType: equipmentData.equipmentType || 'tug',
      equipmentName: equipmentData.equipmentName || '',
      manufacturer: equipmentData.manufacturer || '',
      model: equipmentData.model || '',
      serialNumber: equipmentData.serialNumber || '',
      registrationNumber: equipmentData.registrationNumber || '',
      station: equipmentData.station || '',
      operationalStatus: equipmentData.operationalStatus || 'operational',
      specifications: equipmentData.specifications || {},
      maintenanceSchedule: equipmentData.maintenanceSchedule || {
        lastMaintenance: '',
        nextMaintenanceDue: '',
        maintenanceInterval: 0,
        maintenanceType: 'hours_based',
        maintenanceProvider: '',
        maintenanceHistory: []
      },
      usageLog: equipmentData.usageLog || [],
      location: equipmentData.location || { zone: '', lastUpdated: new Date().toISOString() },
      inspections: equipmentData.inspections || [],
      createdAt: new Date().toISOString(),
      ...equipmentData,
    };
    equipment.push(newEquipment);
    localStorage.setItem(STORAGE_KEYS.GROUND_EQUIPMENT, JSON.stringify(equipment));
    return newEquipment;
  }

  static async updateEquipment(equipmentId: string, updates: Partial<GroundEquipment>): Promise<GroundEquipment> {
    const equipment = await this.getAllEquipment();
    const index = equipment.findIndex(e => e.equipmentId === equipmentId);
    if (index === -1) throw new Error('Equipment not found');

    equipment[index] = { ...equipment[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GROUND_EQUIPMENT, JSON.stringify(equipment));
    return equipment[index];
  }

  static async deleteEquipment(equipmentId: string): Promise<boolean> {
    const equipment = await this.getAllEquipment();
    const filtered = equipment.filter(e => e.equipmentId !== equipmentId);
    localStorage.setItem(STORAGE_KEYS.GROUND_EQUIPMENT, JSON.stringify(filtered));
    return true;
  }

  static async recordUsage(equipmentId: string, usageData: any): Promise<GroundEquipment> {
    const equipment = await this.getEquipmentById(equipmentId);
    if (!equipment) throw new Error('Equipment not found');

    const newUsageEntry = {
      logId: `log-${Date.now()}`,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      hoursLogged: 0,
      ...usageData,
    };

    equipment.usageLog.push(newUsageEntry);
    return this.updateEquipment(equipmentId, { usageLog: equipment.usageLog });
  }

  // Ramp Handling Procedures
  static async getAllProcedures(): Promise<RampHandlingProcedure[]> {
    const data = localStorage.getItem(STORAGE_KEYS.RAMP_PROCEDURES);
    return data ? JSON.parse(data) : [];
  }

  static async getProcedureById(procedureId: string): Promise<RampHandlingProcedure | null> {
    const procedures = await this.getAllProcedures();
    return procedures.find(p => p.procedureId === procedureId) || null;
  }

  static async createProcedure(procedureData: Partial<RampHandlingProcedure>): Promise<RampHandlingProcedure> {
    const procedures = await this.getAllProcedures();
    const newProcedure: RampHandlingProcedure = {
      procedureId: `proc-${Date.now()}`,
      procedureName: procedureData.procedureName || '',
      aircraftType: procedureData.aircraftType || '',
      procedureType: procedureData.procedureType || 'arrival',
      steps: procedureData.steps || [],
      safetyPrecautions: procedureData.safetyPrecautions || [],
      requiredEquipment: procedureData.requiredEquipment || [],
      estimatedDuration: procedureData.estimatedDuration || 30,
      lastUpdated: new Date().toISOString(),
      ...procedureData,
    };
    procedures.push(newProcedure);
    localStorage.setItem(STORAGE_KEYS.RAMP_PROCEDURES, JSON.stringify(procedures));
    return newProcedure;
  }

  static async updateProcedure(procedureId: string, updates: Partial<RampHandlingProcedure>): Promise<RampHandlingProcedure> {
    const procedures = await this.getAllProcedures();
    const index = procedures.findIndex(p => p.procedureId === procedureId);
    if (index === -1) throw new Error('Procedure not found');

    procedures[index] = { ...procedures[index], ...updates, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.RAMP_PROCEDURES, JSON.stringify(procedures));
    return procedures[index];
  }

  // Safety Compliance
  static async getAllSafetyCompliance(): Promise<SafetyCompliance[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SAFETY_COMPLIANCE);
    return data ? JSON.parse(data) : [];
  }

  static async getSafetyComplianceById(complianceId: string): Promise<SafetyCompliance | null> {
    const compliance = await this.getAllSafetyCompliance();
    return compliance.find(c => c.complianceId === complianceId) || null;
  }

  static async createSafetyCompliance(complianceData: Partial<SafetyCompliance>): Promise<SafetyCompliance> {
    const compliance = await this.getAllSafetyCompliance();
    const newCompliance: SafetyCompliance = {
      complianceId: `comp-${Date.now()}`,
      station: complianceData.station || '',
      auditDate: complianceData.auditDate || new Date().toISOString().split('T')[0],
      auditType: complianceData.auditType || 'internal',
      auditor: complianceData.auditor || {} as any,
      areas: complianceData.areas || [],
      findings: complianceData.findings || [],
      overallScore: complianceData.overallScore || 100,
      status: complianceData.status || 'compliant',
      correctiveActions: complianceData.correctiveActions || [],
      nextAuditDue: complianceData.nextAuditDue || '',
      createdAt: new Date().toISOString(),
      ...complianceData,
    };
    compliance.push(newCompliance);
    localStorage.setItem(STORAGE_KEYS.SAFETY_COMPLIANCE, JSON.stringify(compliance));
    return newCompliance;
  }

  static async updateSafetyCompliance(complianceId: string, updates: Partial<SafetyCompliance>): Promise<SafetyCompliance> {
    const compliance = await this.getAllSafetyCompliance();
    const index = compliance.findIndex(c => c.complianceId === complianceId);
    if (index === -1) throw new Error('Safety compliance not found');

    compliance[index] = { ...compliance[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.SAFETY_COMPLIANCE, JSON.stringify(compliance));
    return compliance[index];
  }
}

/**
 * Aviation Settings Service
 * Manages module settings and configurations
 */
export class AviationSettingsService {
  // TODO: Replace localStorage with actual API calls

  static async getSettings(): Promise<AviationSettings | null> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  static async updateSettings(settings: Partial<AviationSettings>): Promise<AviationSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings: AviationSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    } as AviationSettings;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }
}

/**
 * Alerts Service
 * Manages alerts and notifications
 */
export class AlertsService {
  // TODO: Replace localStorage with actual API calls

  static async getAllAlerts(): Promise<Alert[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  }

  static async createAlert(alertData: Partial<Alert>): Promise<Alert> {
    const alerts = await this.getAllAlerts();
    const newAlert: Alert = {
      alertId: `alert-${Date.now()}`,
      alertType: alertData.alertType || 'certification_expiring',
      severity: alertData.severity || 'medium',
      title: alertData.title || '',
      message: alertData.message || '',
      affectedEntity: alertData.affectedEntity || {} as any,
      status: alertData.status || 'active',
      createdAt: new Date().toISOString(),
      ...alertData,
    };
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return newAlert;
  }

  static async updateAlert(alertId: string, updates: Partial<Alert>): Promise<Alert> {
    const alerts = await this.getAllAlerts();
    const index = alerts.findIndex(a => a.alertId === alertId);
    if (index === -1) throw new Error('Alert not found');

    alerts[index] = { ...alerts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    return alerts[index];
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<Alert> {
    return this.updateAlert(alertId, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
    });
  }

  static async resolveAlert(alertId: string): Promise<Alert> {
    return this.updateAlert(alertId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });
  }
}
