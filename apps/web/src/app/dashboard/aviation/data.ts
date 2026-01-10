/**
 * Aviation Module - Sample Data
 * Comprehensive sample data for Cabin Crew, Pilot Training, and Ground Operations
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
  AviationSettings
} from './types';

// ==================== Cabin Crew Sample Data ====================

export const sampleCrewMembers: CrewMemberProfile[] = [
  {
    crewId: 'crew-001',
    employeeId: 'FA-4521',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Martinez',
      dateOfBirth: '1992-05-15',
      nationality: 'USA',
      passportNumber: 'P12345678',
      passportExpiry: '2028-05-14',
      homeBase: 'JFK',
      email: 'sarah.martinez@airline.com',
      phone: '+1-555-0101',
      emergencyContact: {
        name: 'John Martinez',
        relationship: 'Spouse',
        phone: '+1-555-0102',
        email: 'john.martinez@email.com'
      }
    },
    crewType: 'purser',
    seniority: {
      hireDate: '2015-03-10',
      seniorityNumber: 245,
      yearsOfService: 9
    },
    qualifications: [
      {
        qualificationId: 'qual-001',
        qualificationType: 'aircraft_type',
        name: 'Boeing 777 Cabin Crew',
        aircraftType: 'B777',
        issueDate: '2020-06-15',
        expiryDate: '2025-06-14',
        certifyingAuthority: 'FAA',
        status: 'valid',
        documents: []
      },
      {
        qualificationId: 'qual-002',
        qualificationType: 'safety',
        name: 'Emergency Evacuation Procedures',
        issueDate: '2024-01-20',
        expiryDate: '2025-01-19',
        certifyingAuthority: 'FAA',
        status: 'valid',
        documents: []
      }
    ],
    languages: [
      {
        languageCode: 'en',
        languageName: 'English',
        proficiencyLevel: 'native',
        certified: true,
        certificationDate: '2015-03-10'
      },
      {
        languageCode: 'es',
        languageName: 'Spanish',
        proficiencyLevel: 'advanced',
        certified: true,
        certificationDate: '2018-07-15',
        certificationExpiry: '2026-07-14'
      },
      {
        languageCode: 'fr',
        languageName: 'French',
        proficiencyLevel: 'intermediate',
        certified: true,
        certificationDate: '2019-09-20',
        certificationExpiry: '2027-09-19'
      }
    ],
    certifications: [
      {
        certificationId: 'cert-001',
        certificationType: 'safety',
        certificationName: 'First Aid & CPR',
        certificationBody: 'American Red Cross',
        certificationNumber: 'ARC-FA-12345',
        issueDate: '2024-02-15',
        expiryDate: '2026-02-14',
        renewalRequired: true,
        nextRenewalDate: '2026-01-15',
        status: 'valid',
        documents: []
      },
      {
        certificationId: 'cert-002',
        certificationType: 'security',
        certificationName: 'Aviation Security',
        certificationBody: 'TSA',
        certificationNumber: 'TSA-SEC-67890',
        issueDate: '2023-11-10',
        expiryDate: '2025-11-09',
        renewalRequired: true,
        nextRenewalDate: '2025-10-10',
        status: 'expiring_soon',
        documents: []
      }
    ],
    medicalStatus: {
      medicalId: 'med-001',
      medicalClass: 'class_2',
      examDate: '2024-08-20',
      expiryDate: '2025-08-19',
      examiner: 'Dr. Emily Chen',
      examinerLicense: 'AME-12345',
      fitnessStatus: 'fit',
      nextExamDate: '2025-07-20',
      vaccinationStatus: {
        yellowFever: { date: '2022-03-15', expiryDate: '2032-03-14' },
        covid19: { doses: 3, lastDoseDate: '2023-09-10', boosterDate: '2023-09-10' },
        hepatitisB: { date: '2015-04-01', status: 'complete' }
      }
    },
    dutyStatus: 'available',
    preferences: {
      preferredBases: ['JFK', 'LAX'],
      preferredAircraftTypes: ['B777', 'B787'],
      maxFlightsPerMonth: 20,
      daysOffPreferred: [0, 6], // Sunday and Saturday
      bidPreferences: [
        { preferenceType: 'route', value: 'JFK-LHR', priority: 1 },
        { preferenceType: 'layover', value: 'London', priority: 2 },
        { preferenceType: 'position', value: 'purser', priority: 3 }
      ]
    },
    performanceRating: {
      ratingId: 'rating-001',
      reviewPeriod: { startDate: '2024-01-01', endDate: '2024-06-30' },
      overallRating: 4.7,
      competencies: [
        { competencyName: 'Safety Procedures', rating: 5, comments: 'Excellent knowledge and execution' },
        { competencyName: 'Customer Service', rating: 5, comments: 'Outstanding passenger feedback' },
        { competencyName: 'Team Leadership', rating: 4.5, comments: 'Strong leadership as purser' },
        { competencyName: 'Communication', rating: 4.5 }
      ],
      strengths: ['Exceptional customer service', 'Strong safety knowledge', 'Multilingual capabilities'],
      areasForImprovement: ['Continue developing leadership skills'],
      commendations: 5,
      incidents: 0,
      customerFeedbackScore: 4.8,
      reviewedBy: 'Cabin Services Manager',
      reviewDate: '2024-07-15',
      comments: 'Outstanding crew member, recommended for training captain role'
    },
    status: 'active',
    createdAt: '2015-03-10T00:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z'
  },
  {
    crewId: 'crew-002',
    employeeId: 'FA-4892',
    personalInfo: {
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: '1995-08-22',
      nationality: 'USA',
      passportNumber: 'P87654321',
      passportExpiry: '2029-08-21',
      homeBase: 'LAX',
      email: 'michael.chen@airline.com',
      phone: '+1-555-0201',
      emergencyContact: {
        name: 'Linda Chen',
        relationship: 'Mother',
        phone: '+1-555-0202'
      }
    },
    crewType: 'senior_flight_attendant',
    seniority: {
      hireDate: '2018-09-15',
      seniorityNumber: 892,
      yearsOfService: 6
    },
    qualifications: [
      {
        qualificationId: 'qual-003',
        qualificationType: 'aircraft_type',
        name: 'Airbus A350 Cabin Crew',
        aircraftType: 'A350',
        issueDate: '2021-03-10',
        expiryDate: '2026-03-09',
        certifyingAuthority: 'FAA',
        status: 'valid',
        documents: []
      }
    ],
    languages: [
      {
        languageCode: 'en',
        languageName: 'English',
        proficiencyLevel: 'native',
        certified: true
      },
      {
        languageCode: 'zh',
        languageName: 'Mandarin',
        proficiencyLevel: 'native',
        certified: true,
        certificationDate: '2018-09-15'
      }
    ],
    certifications: [
      {
        certificationId: 'cert-003',
        certificationType: 'safety',
        certificationName: 'First Aid & CPR',
        certificationBody: 'American Red Cross',
        certificationNumber: 'ARC-FA-54321',
        issueDate: '2024-05-20',
        expiryDate: '2026-05-19',
        renewalRequired: true,
        status: 'valid',
        documents: []
      }
    ],
    medicalStatus: {
      medicalId: 'med-002',
      medicalClass: 'class_2',
      examDate: '2024-10-15',
      expiryDate: '2025-10-14',
      examiner: 'Dr. Robert Kim',
      examinerLicense: 'AME-67890',
      fitnessStatus: 'fit',
      nextExamDate: '2025-09-15',
      vaccinationStatus: {
        covid19: { doses: 2, lastDoseDate: '2023-06-01' }
      }
    },
    dutyStatus: 'in_flight',
    currentAssignment: {
      assignmentId: 'assign-001',
      flightNumber: 'AA100',
      flightDate: '2024-12-13',
      departure: {
        airportCode: 'LAX',
        airportName: 'Los Angeles International',
        city: 'Los Angeles',
        country: 'USA',
        scheduledTime: '2024-12-13T14:00:00Z',
        actualTime: '2024-12-13T14:05:00Z',
        gate: 'A12',
        terminal: 'T1'
      },
      arrival: {
        airportCode: 'NRT',
        airportName: 'Narita International',
        city: 'Tokyo',
        country: 'Japan',
        scheduledTime: '2024-12-14T18:00:00Z',
        gate: 'G5',
        terminal: 'T1'
      },
      aircraftType: 'B777-300ER',
      aircraftRegistration: 'N12345',
      position: 'mid',
      scheduledDutyStart: '2024-12-13T12:00:00Z',
      scheduledDutyEnd: '2024-12-14T20:00:00Z',
      actualDutyStart: '2024-12-13T11:55:00Z',
      status: 'in_flight',
      crewComplement: {
        cabinDirector: 'crew-001',
        pursers: ['crew-003'],
        flightAttendants: ['crew-002', 'crew-004', 'crew-005', 'crew-006', 'crew-007', 'crew-008'],
        totalCrew: 9
      },
      briefingTime: '2024-12-13T11:30:00Z',
      briefingLocation: 'Crew Room A'
    },
    preferences: {
      preferredBases: ['LAX', 'SFO'],
      preferredAircraftTypes: ['A350', 'B777'],
      bidPreferences: []
    },
    status: 'active',
    createdAt: '2018-09-15T00:00:00Z',
    updatedAt: '2024-12-13T12:00:00Z'
  }
];

export const sampleDutyTimes: DutyTime[] = [
  {
    dutyTimeId: 'duty-001',
    crewId: 'crew-001',
    flightNumber: 'AA100',
    dutyDate: '2024-12-10',
    dutyPeriod: {
      reportTime: '2024-12-10T05:00:00Z',
      releaseTime: '2024-12-10T18:30:00Z',
      totalDutyHours: 13.5
    },
    flightTime: {
      blockOff: '2024-12-10T07:00:00Z',
      blockOn: '2024-12-10T17:00:00Z',
      totalFlightHours: 10.0
    },
    sectors: 2,
    regulations: {
      maxDutyHours: 14,
      maxFlightHours: 9,
      minRestHours: 10,
      regulatoryBody: 'FAA'
    },
    compliance: {
      withinLimits: true,
      warnings: ['Flight hours exceeded by 1 hour - requires special authorization']
    },
    fatigueSelfAssessment: {
      assessmentId: 'fatigue-001',
      assessmentTime: '2024-12-10T18:30:00Z',
      fatigueLevel: 2,
      sleepHoursLast24: 7,
      sleepQuality: 'good',
      reportedBy: 'crew-001'
    },
    createdAt: '2024-12-10T18:30:00Z'
  }
];

export const sampleRestPeriods: RestPeriod[] = [
  {
    restPeriodId: 'rest-001',
    crewId: 'crew-001',
    restType: 'layover',
    startTime: '2024-12-10T18:30:00Z',
    endTime: '2024-12-11T12:00:00Z',
    durationHours: 17.5,
    location: {
      airportCode: 'LHR',
      city: 'London',
      country: 'UK',
      accommodation: {
        hotelName: 'Hilton London Heathrow',
        hotelAddress: 'Terminal 4, Heathrow Airport',
        confirmationNumber: 'HLH-12345',
        checkIn: '2024-12-10T19:00:00Z',
        checkOut: '2024-12-11T11:00:00Z',
        roomType: 'Standard Queen',
        transportProvided: true
      }
    },
    requiredHours: 12,
    actualHours: 17.5,
    compliant: true,
    nextDutyTime: '2024-12-11T13:00:00Z',
    createdAt: '2024-12-10T18:30:00Z'
  }
];

// ==================== Pilot Training Sample Data ====================

export const samplePilots: PilotProfile[] = [
  {
    pilotId: 'pilot-001',
    employeeId: 'CPT-1245',
    personalInfo: {
      firstName: 'James',
      lastName: 'Thompson',
      dateOfBirth: '1985-03-12',
      nationality: 'USA',
      email: 'james.thompson@airline.com',
      phone: '+1-555-0301'
    },
    rank: 'captain',
    license: {
      licenseNumber: 'ATP-987654',
      licenseType: 'ATPL',
      issuingAuthority: 'FAA',
      issueDate: '2012-06-15',
      ratings: ['Multi-Engine', 'Instrument', 'Type Rating B777'],
      endorsements: ['High Altitude', 'ETOPS']
    },
    typeRatings: [
      {
        ratingId: 'rating-001',
        aircraftType: 'B777-300ER',
        aircraftCategory: 'jet',
        issueDate: '2015-08-20',
        status: 'valid',
        seats: 'both'
      },
      {
        ratingId: 'rating-002',
        aircraftType: 'B787-9',
        aircraftCategory: 'jet',
        issueDate: '2020-11-15',
        status: 'valid',
        seats: 'both'
      }
    ],
    medicalCertificate: {
      medicalId: 'med-pilot-001',
      medicalClass: 'class_1',
      examDate: '2024-10-05',
      expiryDate: '2025-04-05',
      examiner: 'Dr. Aviation Medical Center',
      fitnessStatus: 'fit',
      nextExamDate: '2025-03-05'
    },
    flightHours: {
      totalHours: 12500,
      pic: 8200,
      sic: 4300,
      multiEngine: 12500,
      night: 2800,
      instrument: 3500,
      simulator: 450,
      last30Days: 85,
      last90Days: 240,
      last12Months: 950,
      byAircraftType: {
        'B777-300ER': 6800,
        'B787-9': 3200,
        'A320': 2500
      },
      lastUpdated: '2024-12-13T00:00:00Z'
    },
    trainingRecords: [],
    checkResults: [],
    currentQualifications: [
      {
        qualificationId: 'qual-pilot-001',
        qualificationType: 'ETOPS',
        description: 'Extended Twin Operations',
        issueDate: '2016-05-20',
        expiryDate: '2026-05-19',
        status: 'valid'
      }
    ],
    status: 'active',
    createdAt: '2010-04-15T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z'
  },
  {
    pilotId: 'pilot-002',
    employeeId: 'FO-2789',
    personalInfo: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      dateOfBirth: '1990-11-08',
      nationality: 'USA',
      email: 'emily.rodriguez@airline.com',
      phone: '+1-555-0401'
    },
    rank: 'first_officer',
    license: {
      licenseNumber: 'CPL-456789',
      licenseType: 'CPL',
      issuingAuthority: 'FAA',
      issueDate: '2016-09-20',
      ratings: ['Multi-Engine', 'Instrument'],
      endorsements: []
    },
    typeRatings: [
      {
        ratingId: 'rating-003',
        aircraftType: 'A320',
        aircraftCategory: 'jet',
        issueDate: '2017-03-15',
        status: 'valid',
        seats: 'right_seat'
      }
    ],
    medicalCertificate: {
      medicalId: 'med-pilot-002',
      medicalClass: 'class_1',
      examDate: '2024-09-10',
      expiryDate: '2025-03-10',
      examiner: 'Dr. Flight Medicine',
      fitnessStatus: 'fit',
      nextExamDate: '2025-02-10'
    },
    flightHours: {
      totalHours: 3200,
      pic: 500,
      sic: 2700,
      multiEngine: 3200,
      night: 680,
      instrument: 950,
      simulator: 180,
      last30Days: 75,
      last90Days: 220,
      last12Months: 850,
      byAircraftType: {
        'A320': 3200
      },
      lastUpdated: '2024-12-13T00:00:00Z'
    },
    trainingRecords: [],
    checkResults: [],
    currentQualifications: [],
    status: 'training',
    createdAt: '2017-01-10T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z'
  }
];

export const sampleTrainingRecords: TrainingRecord[] = [
  {
    recordId: 'train-001',
    trainingType: 'transition',
    trainingName: 'B787 Type Rating',
    aircraftType: 'B787-9',
    trainingProvider: 'FlightSafety International',
    scheduledDate: '2024-10-01',
    completionDate: '2024-11-15',
    duration: {
      groundSchoolHours: 72,
      simulatorHours: 40,
      flightHours: 25
    },
    syllabus: {
      syllabusId: 'syl-b787-001',
      syllabusName: 'B787 Type Rating Course',
      modules: [
        {
          moduleId: 'mod-001',
          moduleName: 'Systems Overview',
          moduleType: 'ground_school',
          topics: ['Electrical', 'Hydraulics', 'Fuel', 'Avionics'],
          duration: 24,
          objectives: ['Understand B787 systems', 'Identify system failures'],
          requiredScore: 80,
          completed: true,
          score: 92,
          completionDate: '2024-10-15'
        },
        {
          moduleId: 'mod-002',
          moduleName: 'Normal Procedures',
          moduleType: 'simulator',
          topics: ['Preflight', 'Takeoff', 'Cruise', 'Landing'],
          duration: 16,
          objectives: ['Execute normal procedures'],
          completed: true,
          score: 88,
          completionDate: '2024-10-25'
        },
        {
          moduleId: 'mod-003',
          moduleName: 'Abnormal & Emergency Procedures',
          moduleType: 'simulator',
          topics: ['Engine Failure', 'System Malfunctions', 'Weather Diversion'],
          duration: 24,
          objectives: ['Handle abnormal situations'],
          completed: true,
          score: 90,
          completionDate: '2024-11-05'
        }
      ],
      totalHours: 137,
      requiredPassScore: 80
    },
    progress: {
      overallCompletion: 100,
      modulesCompleted: 3,
      modulesTotal: 3,
      hoursCompleted: {
        groundSchool: 72,
        simulator: 40,
        flight: 25
      }
    },
    assessments: [
      {
        assessmentId: 'assess-001',
        assessmentType: 'written',
        assessmentName: 'B787 Systems Exam',
        assessmentDate: '2024-10-20',
        score: 92,
        passingScore: 80,
        result: 'pass',
        assessor: 'FAA Examiner',
        topics: ['Systems', 'Procedures', 'Limitations']
      },
      {
        assessmentId: 'assess-002',
        assessmentType: 'practical',
        assessmentName: 'B787 Type Rating Checkride',
        assessmentDate: '2024-11-15',
        score: 90,
        passingScore: 80,
        result: 'pass',
        assessor: 'FAA Designated Pilot Examiner',
        topics: ['Flight Operations', 'Emergency Procedures'],
        strengths: ['Excellent systems knowledge', 'Smooth flight control'],
        comments: 'Highly competent, recommended for line operations'
      }
    ],
    instructor: {
      instructorId: 'inst-001',
      name: 'Captain Robert Wilson',
      qualifications: ['B787 Check Airman', 'Training Captain'],
      rating: 4.8
    },
    status: 'completed',
    result: 'pass',
    certification: {
      certificateNumber: 'B787-TYPE-2024-1234',
      issueDate: '2024-11-15',
      expiryDate: '2029-11-14',
      issuingAuthority: 'FAA',
      certificateUrl: 'https://certificates.faa.gov/b787-type-2024-1234.pdf'
    },
    comments: 'Excellent performance throughout training. Pilot demonstrates strong systems knowledge and decision-making skills.',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z'
  }
];

export const sampleSimulatorSessions: SimulatorSession[] = [
  {
    sessionId: 'sim-001',
    pilotId: 'pilot-001',
    aircraftType: 'B777-300ER',
    simulatorType: 'level_d',
    simulatorLocation: 'Training Center A - Sim Bay 3',
    scheduledDate: '2024-12-15',
    scheduledTime: '09:00:00',
    duration: 4,
    sessionType: 'recurrent',
    scenarios: [
      {
        scenarioId: 'scen-001',
        scenarioName: 'Engine Failure on Takeoff',
        scenarioType: 'emergency',
        description: 'V1 cut - left engine failure at rotation',
        objectives: ['Execute rejected takeoff or continue takeoff procedures', 'Maintain aircraft control'],
        conditions: {
          weather: 'VMC, winds 270/15',
          time: 'Day',
          location: 'JFK Runway 31L',
          systemFailures: ['Engine 1']
        },
        completed: true,
        performance: {
          rating: 5,
          criteriaEvaluated: [
            { criterion: 'Decision Making', rating: 5, notes: 'Correct decision to continue' },
            { criterion: 'Aircraft Control', rating: 5, notes: 'Maintained centerline' },
            { criterion: 'Callouts', rating: 5, notes: 'Clear and timely' }
          ],
          errorsCommitted: [],
          decisionsCorrect: true,
          proceduresFollowed: true,
          communicationEffective: true
        }
      },
      {
        scenarioId: 'scen-002',
        scenarioName: 'Depressurization at FL390',
        scenarioType: 'emergency',
        description: 'Rapid depressurization requiring emergency descent',
        objectives: ['Execute emergency descent', 'Communicate with ATC', 'Divert to suitable airport'],
        conditions: {
          weather: 'IMC',
          time: 'Night',
          location: 'Over Atlantic - Oceanic Airspace',
          systemFailures: ['Pressurization System']
        },
        completed: true,
        performance: {
          rating: 4.5,
          criteriaEvaluated: [
            { criterion: 'Emergency Response', rating: 5, notes: 'Immediate mask donning' },
            { criterion: 'Descent Profile', rating: 4, notes: 'Slight overspeed during descent' },
            { criterion: 'Communication', rating: 5, notes: 'Clear Mayday call' }
          ],
          errorsCommitted: ['Brief VMO exceedance during emergency descent'],
          decisionsCorrect: true,
          proceduresFollowed: true,
          communicationEffective: true
        }
      }
    ],
    instructor: 'inst-002',
    performance: {
      overallRating: 4.8,
      technicalSkills: 5,
      decisionMaking: 5,
      situationalAwareness: 4.5,
      communication: 5,
      crm: 4.5,
      maneuvers: [
        { maneuver: 'Engine Failure Takeoff', rating: 5, withinLimits: true },
        { maneuver: 'Emergency Descent', rating: 4.5, withinLimits: true, deviations: ['Brief VMO overspeed'] },
        { maneuver: 'Diversion Landing', rating: 5, withinLimits: true }
      ],
      systemsKnowledge: 5,
      emergencyResponse: 5
    },
    debriefing: {
      debriefingId: 'debrief-001',
      debriefingDate: '2024-12-15',
      instructor: 'Captain Sarah Lee',
      strengths: [
        'Excellent decision making under pressure',
        'Strong systems knowledge',
        'Effective crew communication',
        'Smooth aircraft control'
      ],
      areasForImprovement: [
        'Monitor airspeed closely during emergency descent to avoid VMO exceedance'
      ],
      recommendations: [
        'Continue to maintain high proficiency',
        'Review speed limits during emergency procedures'
      ],
      instructorComments: 'Captain Thompson demonstrates exceptional proficiency and airmanship. Minor speed exceedance was brief and understandable given the emergency nature of the scenario. Overall excellent performance.',
      pilotComments: 'Great learning experience. Will focus on speed management during high-workload situations.'
    },
    status: 'completed',
    createdAt: '2024-11-20T00:00:00Z'
  }
];

export const sampleProficiencyChecks: ProficiencyCheck[] = [
  {
    checkId: 'check-001',
    pilotId: 'pilot-001',
    checkType: 'recurrent',
    aircraftType: 'B777-300ER',
    checkDate: '2024-06-15',
    examiner: {
      examinerId: 'exam-001',
      name: 'Captain David Martinez',
      designation: 'FAA Designated Pilot Examiner',
      licenseNumber: 'DPE-12345',
      qualifications: ['B777 Check Airman', 'ATPL', '15000+ hours']
    },
    checklist: [
      {
        itemId: 'item-001',
        category: 'Preflight',
        item: 'Aircraft Documentation Review',
        required: true,
        completed: true,
        result: 'satisfactory'
      },
      {
        itemId: 'item-002',
        category: 'Normal Procedures',
        item: 'Normal Takeoff',
        required: true,
        completed: true,
        result: 'satisfactory'
      },
      {
        itemId: 'item-003',
        category: 'Abnormal Procedures',
        item: 'Engine Failure After Takeoff',
        required: true,
        completed: true,
        result: 'satisfactory',
        comments: 'Excellent handling, smooth and safe'
      }
    ],
    maneuvers: [
      {
        maneuver: 'Steep Turns',
        category: 'normal',
        performed: true,
        result: 'satisfactory',
        comments: 'Within ACS standards'
      },
      {
        maneuver: 'Engine Failure on Approach',
        category: 'abnormal',
        performed: true,
        result: 'satisfactory',
        comments: 'Proper procedures followed, safe landing executed'
      },
      {
        maneuver: 'Rejected Takeoff',
        category: 'emergency',
        performed: true,
        result: 'satisfactory',
        comments: 'Decision-making excellent, smooth stop'
      }
    ],
    overallResult: 'satisfactory',
    recommendations: ['Maintain current proficiency level', 'Continue excellent CRM practices'],
    nextCheckDue: '2025-06-14',
    certificationIssued: {
      certificateNumber: 'PC-B777-2024-001',
      issueDate: '2024-06-15',
      expiryDate: '2025-06-14',
      issuingAuthority: 'FAA'
    },
    createdAt: '2024-06-15T00:00:00Z'
  }
];

// ==================== Ground Operations Sample Data ====================

export const sampleGroundStaff: GroundStaffMember[] = [
  {
    staffId: 'staff-001',
    employeeId: 'GND-3421',
    personalInfo: {
      firstName: 'Carlos',
      lastName: 'Rivera',
      email: 'carlos.rivera@groundops.com',
      phone: '+1-555-0501',
      dateOfBirth: '1988-07-14'
    },
    role: 'supervisor',
    station: 'JFK',
    shift: {
      shiftId: 'shift-morning',
      shiftType: 'morning',
      startTime: '06:00:00',
      endTime: '14:00:00',
      breakSchedule: [
        { breakType: 'rest', startTime: '09:00:00', duration: 15 },
        { breakType: 'meal', startTime: '11:00:00', duration: 30 }
      ]
    },
    certifications: [
      {
        certificationId: 'gcert-001',
        certificationType: 'safety',
        certificationName: 'Ramp Safety',
        issueDate: '2023-03-20',
        expiryDate: '2026-03-19',
        certifyingBody: 'IATA',
        status: 'valid',
        renewalRequired: true
      },
      {
        certificationId: 'gcert-002',
        certificationType: 'dangerous_goods',
        certificationName: 'Dangerous Goods Handling',
        issueDate: '2024-01-15',
        expiryDate: '2026-01-14',
        certifyingBody: 'IATA',
        status: 'valid',
        renewalRequired: true
      }
    ],
    equipmentQualifications: [
      { qualificationId: 'eq-001', equipmentType: 'tug', qualificationDate: '2020-05-10', qualified: true, trainingHours: 40 },
      { qualificationId: 'eq-002', equipmentType: 'belt_loader', qualificationDate: '2020-06-15', qualified: true, trainingHours: 24 },
      { qualificationId: 'eq-003', equipmentType: 'gpu', qualificationDate: '2021-02-20', qualified: true, trainingHours: 16 }
    ],
    safetyRecords: [],
    performanceMetrics: {
      turnaroundsCompleted: 1250,
      averageTurnaroundTime: 38,
      onTimePerformance: 96.5,
      safetyScore: 98,
      qualityScore: 95,
      equipmentDamageIncidents: 2,
      commendations: 8,
      monthlyMetrics: [
        { month: 'November', year: 2024, turnarounds: 105, avgTime: 37, onTimePercent: 97, incidents: 0 },
        { month: 'October', year: 2024, turnarounds: 108, avgTime: 39, onTimePercent: 96, incidents: 0 }
      ]
    },
    status: 'active',
    createdAt: '2020-04-15T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z'
  }
];

export const sampleTurnarounds: TurnaroundAssignment[] = [
  {
    assignmentId: 'turn-001',
    flightNumber: 'AA100',
    aircraftRegistration: 'N12345',
    aircraftType: 'B777-300ER',
    gate: 'A12',
    scheduledArrival: '2024-12-13T14:30:00Z',
    scheduledDeparture: '2024-12-13T16:00:00Z',
    actualArrival: '2024-12-13T14:25:00Z',
    turnaroundTime: 90,
    role: 'supervisor',
    tasks: [
      {
        taskId: 'task-001',
        taskName: 'Chocks and Cones Placement',
        taskCategory: 'safety',
        priority: 'critical',
        assignedTo: 'staff-002',
        scheduledStart: '2024-12-13T14:25:00Z',
        scheduledEnd: '2024-12-13T14:30:00Z',
        actualStart: '2024-12-13T14:25:00Z',
        actualEnd: '2024-12-13T14:28:00Z',
        duration: 3,
        status: 'completed'
      },
      {
        taskId: 'task-002',
        taskName: 'GPU Connection',
        taskCategory: 'servicing',
        priority: 'high',
        assignedTo: 'staff-003',
        scheduledStart: '2024-12-13T14:30:00Z',
        scheduledEnd: '2024-12-13T14:35:00Z',
        actualStart: '2024-12-13T14:31:00Z',
        actualEnd: '2024-12-13T14:35:00Z',
        duration: 4,
        status: 'completed'
      },
      {
        taskId: 'task-003',
        taskName: 'Cargo Unloading',
        taskCategory: 'loading',
        priority: 'high',
        assignedTo: 'staff-004',
        scheduledStart: '2024-12-13T14:35:00Z',
        scheduledEnd: '2024-12-13T15:05:00Z',
        actualStart: '2024-12-13T14:36:00Z',
        actualEnd: '2024-12-13T15:03:00Z',
        duration: 27,
        status: 'completed'
      },
      {
        taskId: 'task-004',
        taskName: 'Refueling',
        taskCategory: 'servicing',
        priority: 'critical',
        scheduledStart: '2024-12-13T14:40:00Z',
        scheduledEnd: '2024-12-13T15:20:00Z',
        status: 'in_progress'
      },
      {
        taskId: 'task-005',
        taskName: 'Cabin Cleaning',
        taskCategory: 'cleaning',
        priority: 'high',
        scheduledStart: '2024-12-13T14:45:00Z',
        scheduledEnd: '2024-12-13T15:30:00Z',
        status: 'in_progress'
      }
    ],
    status: 'in_progress'
  }
];

export const sampleGroundEquipment: GroundEquipment[] = [
  {
    equipmentId: 'equip-001',
    equipmentType: 'tug',
    equipmentName: 'Pushback Tug #12',
    manufacturer: 'TLD',
    model: 'TMX-150',
    serialNumber: 'TLD-TMX-2018-0456',
    registrationNumber: 'TUG-JFK-012',
    station: 'JFK',
    operationalStatus: 'operational',
    specifications: {
      capacity: '150,000 lbs',
      powerOutput: '450 HP',
      dimensions: { length: 6.5, width: 3.2, height: 2.8 },
      weight: 28000,
      fuelType: 'Diesel',
      maxSpeed: 25
    },
    maintenanceSchedule: {
      lastMaintenance: '2024-11-20',
      nextMaintenanceDue: '2025-02-20',
      maintenanceInterval: 500,
      maintenanceType: 'hours_based',
      maintenanceProvider: 'TLD Service Center',
      maintenanceHistory: [
        {
          recordId: 'maint-001',
          maintenanceDate: '2024-11-20',
          maintenanceType: 'routine',
          workPerformed: 'Oil change, filter replacement, brake inspection',
          partsReplaced: [
            { partNumber: 'TLD-OIL-001', partName: 'Engine Oil Filter', quantity: 2 },
            { partNumber: 'TLD-BRK-005', partName: 'Brake Pads', quantity: 4 }
          ],
          technicianId: 'tech-001',
          technicianName: 'Mike Johnson',
          cost: 850,
          nextServiceDue: '2025-02-20',
          notes: 'All systems operating normally'
        }
      ]
    },
    usageLog: [
      {
        logId: 'log-001',
        operatorId: 'staff-002',
        operatorName: 'John Smith',
        flightNumber: 'AA100',
        startTime: '2024-12-13T06:30:00Z',
        endTime: '2024-12-13T06:45:00Z',
        duration: 0.25,
        hoursLogged: 0.25,
        location: 'Gate A12',
        notes: 'Pushback for departure'
      }
    ],
    location: {
      zone: 'Terminal A',
      gate: 'A12',
      coordinates: { latitude: 40.6413, longitude: -73.7781 },
      lastUpdated: '2024-12-13T06:45:00Z'
    },
    inspections: [
      {
        inspectionId: 'insp-001',
        inspectionDate: '2024-12-13',
        inspectorId: 'staff-001',
        inspectorName: 'Carlos Rivera',
        inspectionType: 'daily',
        checklistItems: [
          { itemId: 'item-001', item: 'Tire Pressure', category: 'Safety', status: 'pass' },
          { itemId: 'item-002', item: 'Fluid Levels', category: 'Maintenance', status: 'pass' },
          { itemId: 'item-003', item: 'Lights & Signals', category: 'Safety', status: 'pass' }
        ],
        overallCondition: 'excellent',
        issuesFound: [],
        result: 'pass',
        nextInspectionDue: '2024-12-14',
        notes: 'Equipment in excellent condition'
      }
    ],
    createdAt: '2018-08-15T00:00:00Z',
    updatedAt: '2024-12-13T06:45:00Z'
  }
];

export const sampleRampProcedures: RampHandlingProcedure[] = [
  {
    procedureId: 'proc-001',
    procedureName: 'B777 Arrival Procedures',
    aircraftType: 'B777-300ER',
    procedureType: 'arrival',
    steps: [
      {
        stepNumber: 1,
        stepDescription: 'Position marshaller and guide aircraft to parking position',
        responsibleRole: 'ramp_agent',
        timing: 'As aircraft approaches gate',
        criticalStep: true,
        verificationRequired: true
      },
      {
        stepNumber: 2,
        stepDescription: 'Place chocks and safety cones',
        responsibleRole: 'ramp_agent',
        timing: 'Immediately after aircraft stops',
        criticalStep: true,
        verificationRequired: true
      },
      {
        stepNumber: 3,
        stepDescription: 'Connect GPU and air conditioning',
        responsibleRole: 'ramp_agent',
        timing: 'After chocks in place',
        criticalStep: false,
        verificationRequired: false,
        dependencies: [2]
      },
      {
        stepNumber: 4,
        stepDescription: 'Position jet bridge',
        responsibleRole: 'ramp_agent',
        timing: 'After aircraft secured',
        criticalStep: false,
        verificationRequired: true,
        dependencies: [2]
      }
    ],
    safetyPrecautions: [
      'Maintain 15-foot clearance from engines until shutdown',
      'Wear hi-visibility vest and hearing protection',
      'Verify aircraft parking brake set before approaching',
      'Check for hydraulic leaks'
    ],
    requiredEquipment: ['Chocks', 'Safety Cones', 'GPU', 'Marshalling Wands'],
    estimatedDuration: 15,
    certificationRequired: ['Ramp Safety', 'Aircraft Marshalling'],
    regulatoryReferences: ['FAA AC 150/5210-20', 'IATA AHM'],
    lastUpdated: '2024-06-01T00:00:00Z'
  }
];

export const sampleSafetyCompliance: SafetyCompliance[] = [
  {
    complianceId: 'comp-001',
    station: 'JFK',
    auditDate: '2024-09-15',
    auditType: 'regulatory',
    auditor: {
      auditorId: 'aud-001',
      name: 'Jane Wilson',
      organization: 'FAA',
      certification: 'Aviation Safety Inspector'
    },
    areas: [
      {
        areaName: 'Ramp Safety Procedures',
        standards: ['FAA AC 150/5210-20', 'OSHA 1910'],
        score: 95,
        status: 'compliant'
      },
      {
        areaName: 'Equipment Maintenance',
        standards: ['Manufacturer Guidelines', 'FAA Advisory Circulars'],
        score: 92,
        status: 'compliant'
      },
      {
        areaName: 'Personnel Training',
        standards: ['IATA AHM Chapter 12', 'Company Training Manual'],
        score: 88,
        status: 'compliant'
      }
    ],
    findings: [
      {
        findingId: 'find-001',
        category: 'Training Records',
        severity: 'minor',
        description: 'Two staff members have training records that are 30 days past due for renewal',
        regulation: 'IATA AHM 12.3',
        recommendedAction: 'Schedule refresher training within 14 days',
        dueDate: '2024-10-01',
        status: 'resolved'
      }
    ],
    overallScore: 92,
    status: 'compliant',
    correctiveActions: [
      {
        actionId: 'action-001',
        findingId: 'find-001',
        actionDescription: 'Schedule and complete refresher training for affected staff',
        responsiblePerson: 'Training Coordinator',
        targetDate: '2024-09-30',
        completionDate: '2024-09-28',
        status: 'completed',
        verification: {
          verifiedBy: 'Safety Manager',
          verificationDate: '2024-09-29',
          effective: true,
          notes: 'Training completed and documented'
        }
      }
    ],
    nextAuditDue: '2025-09-15',
    createdAt: '2024-09-15T00:00:00Z'
  }
];

// ==================== Settings ====================

export const sampleAviationSettings: AviationSettings = {
  settingsId: 'settings-001',
  organizationId: 'org-001',
  cabinCrewSettings: {
    maxDutyHours: 14,
    minRestHours: 10,
    maxFlightDutyPeriod: 16,
    maxConsecutiveDutyDays: 6,
    fatigueReportingEnabled: true
  },
  pilotTrainingSettings: {
    recurrentTrainingInterval: 12,
    simulatorSessionsPerYear: 2,
    proficiencyCheckInterval: 12,
    minimumFlightHoursPerYear: 500,
    trainingRecordRetention: 10
  },
  groundOperationsSettings: {
    turnaroundTargets: {
      'B777-300ER': 90,
      'B787-9': 75,
      'A350-900': 75,
      'A320': 45
    },
    safetyAuditFrequency: 12,
    equipmentInspectionFrequency: 1,
    shiftDuration: 8
  },
  regulatoryBody: 'FAA',
  notifications: {
    certificationExpiry: true,
    medicalExpiry: true,
    trainingDue: true,
    equipmentMaintenance: true,
    safetyIncidents: true,
    complianceIssues: true,
    advanceNoticeDays: 30
  },
  updatedAt: '2024-01-01T00:00:00Z'
};
