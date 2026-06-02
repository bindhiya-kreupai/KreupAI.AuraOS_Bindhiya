// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
import type {
  Equipment,
  MaintenanceSchedule,
  WorkOrder,
  ProductionLine,
  ProductionRun,
  OEEMetrics,
  SafetyIncident,
  SafetyInspection,
  PPEInventory,
  SafetyTraining,
  ManufacturingSettings
} from './types';

export const sampleEquipment: Equipment[] = [
  {
    equipmentId: 'equip-001',
    equipmentNumber: 'EQ-001',
    equipmentName: 'CNC Milling Machine',
    equipmentType: 'Machining',
    manufacturer: 'Haas Automation',
    model: 'VF-4SS',
    serialNumber: 'SN-12345',
    location: {
      plant: 'Main Plant',
      building: 'Building A',
      floor: 'Floor 1',
      area: 'Machining Area',
      line: 'Line 1'
    },
    installationDate: '2020-06-15',
    warrantyExpiry: '2025-06-15',
    status: 'operational',
    specifications: {
      capacity: 5000,
      capacityUnit: 'parts/day',
      powerRequirement: 30,
      voltage: 480,
      dimensions: {
        length: 3.5,
        width: 2.8,
        height: 2.5,
        unit: 'meters'
      },
      weight: 4500,
      weightUnit: 'kg'
    },
    maintenanceHistory: [
      {
        recordId: 'maint-001',
        maintenanceType: 'preventive',
        performedDate: '2024-11-15',
        performedBy: 'John Smith',
        duration: 4,
        cost: 800,
        partsReplaced: [
          {
            partNumber: 'P-12345',
            partName: 'Spindle Bearings',
            quantity: 2,
            cost: 400
          }
        ],
        findings: 'All systems operating normally. Spindle bearings replaced as scheduled.',
        recommendations: 'Next preventive maintenance in 3 months'
      }
    ],
    currentCondition: {
      overallHealth: 92,
      vibrationLevel: 2.5,
      temperature: 45,
      pressure: 6.8,
      lastInspectionDate: '2024-11-15',
      nextInspectionDate: '2025-02-15',
      notes: 'Equipment in excellent condition'
    },
    criticality: 'high',
    createdAt: '2020-06-15T00:00:00Z'
  }
];

export const sampleMaintenanceSchedules: MaintenanceSchedule[] = [
  {
    scheduleId: 'sched-001',
    equipmentId: 'equip-001',
    equipmentName: 'CNC Milling Machine',
    maintenanceType: 'preventive',
    frequency: {
      value: 90,
      unit: 'days'
    },
    lastPerformed: '2024-11-15',
    nextDue: '2025-02-15',
    estimatedDuration: 4,
    assignedTo: 'John Smith',
    priority: 'high',
    checklist: [
      {
        taskId: 'task-001',
        taskDescription: 'Inspect spindle bearings',
        estimatedTime: 1,
        requiredSkills: ['Mechanical', 'CNC'],
        requiredTools: ['Bearing puller', 'Dial indicator'],
        safetyPrecautions: ['Lock-out/Tag-out', 'PPE required'],
        completed: false
      },
      {
        taskId: 'task-002',
        taskDescription: 'Lubricate guide ways',
        estimatedTime: 0.5,
        requiredSkills: ['Mechanical'],
        requiredTools: ['Grease gun'],
        safetyPrecautions: ['PPE required'],
        completed: false
      }
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const sampleWorkOrders: WorkOrder[] = [
  {
    workOrderId: 'wo-001',
    workOrderNumber: 'WO-2024-001',
    equipmentId: 'equip-001',
    equipmentName: 'CNC Milling Machine',
    maintenanceType: 'corrective',
    priority: 'high',
    description: 'Unusual vibration detected during operation',
    requestedBy: 'Mike Johnson',
    requestedDate: '2024-12-10',
    scheduledDate: '2024-12-12',
    assignedTo: 'John Smith',
    assignedTeam: 'Maintenance Team A',
    status: 'scheduled',
    estimatedCost: 1500,
    estimatedHours: 6,
    parts: [
      {
        partNumber: 'P-12346',
        partName: 'Spindle Motor',
        quantity: 1,
        unitCost: 1200,
        available: true,
        vendor: 'Haas Parts'
      }
    ],
    createdAt: '2024-12-10T00:00:00Z'
  }
];

export const sampleProductionLines: ProductionLine[] = [
  {
    lineId: 'line-001',
    lineName: 'Assembly Line 1',
    lineNumber: 'AL-001',
    plant: 'Main Plant',
    department: 'Assembly',
    productType: 'Widget A',
    capacity: {
      ratedCapacity: 1000,
      capacityUnit: 'units/day',
      cycleTime: 45,
      shiftsPerDay: 3,
      daysPerWeek: 6
    },
    equipment: ['equip-001', 'equip-002', 'equip-003'],
    staffing: {
      operators: 8,
      technicians: 2,
      supervisor: 'Sarah Williams',
      currentStaffCount: 10,
      requiredStaffCount: 10
    },
    status: 'running',
    currentShift: {
      shiftId: 'shift-001',
      shiftName: 'Day Shift',
      startTime: '07:00',
      endTime: '15:00',
      supervisor: 'Sarah Williams'
    },
    performance: {
      oee: 78.5,
      availability: 92.0,
      performance: 88.5,
      quality: 96.5,
      unitsProduced: 780,
      targetUnits: 1000,
      defectRate: 3.5,
      downtime: 45,
      lastUpdated: '2024-12-13T14:00:00Z'
    },
    createdAt: '2022-01-01T00:00:00Z'
  }
];

export const sampleProductionRuns: ProductionRun[] = [
  {
    runId: 'run-001',
    lineId: 'line-001',
    lineName: 'Assembly Line 1',
    productId: 'prod-001',
    productName: 'Widget A',
    batchNumber: 'BATCH-2024-1213-001',
    startTime: '2024-12-13T07:00:00Z',
    plannedQuantity: 1000,
    actualQuantity: 780,
    goodUnits: 752,
    defectiveUnits: 28,
    scrapUnits: 12,
    status: 'running',
    operators: [
      {
        employeeId: 'emp-001',
        employeeName: 'Tom Anderson',
        role: 'Line Operator',
        hoursWorked: 7
      },
      {
        employeeId: 'emp-002',
        employeeName: 'Lisa Brown',
        role: 'Quality Inspector',
        hoursWorked: 7
      }
    ],
    qualityChecks: [
      {
        checkId: 'qc-001',
        checkTime: '2024-12-13T10:00:00Z',
        inspector: 'Lisa Brown',
        sampleSize: 50,
        passedUnits: 48,
        failedUnits: 2,
        defectTypes: [
          {
            defectCode: 'DEF-001',
            defectDescription: 'Surface finish',
            count: 2
          }
        ]
      }
    ],
    downtimeEvents: [
      {
        eventId: 'dt-001',
        startTime: '2024-12-13T09:30:00Z',
        endTime: '2024-12-13T10:15:00Z',
        duration: 45,
        reason: {
          reasonCode: 'EQ-001',
          reasonDescription: 'Equipment adjustment',
          category: 'equipment'
        },
        category: 'unplanned',
        description: 'Adjusting conveyor belt tension',
        resolvedBy: 'John Smith',
        impact: 33.75
      }
    ],
    createdAt: '2024-12-13T07:00:00Z'
  }
];

export const sampleOEEMetrics: OEEMetrics[] = [
  {
    metricId: 'metric-001',
    lineId: 'line-001',
    lineName: 'Assembly Line 1',
    period: {
      startDate: '2024-12-01',
      endDate: '2024-12-07',
      periodType: 'week'
    },
    availability: {
      plannedProductionTime: 2400,
      actualRunTime: 2208,
      downtime: 192,
      availability: 92.0,
      availabilityLoss: 8.0
    },
    performanceMetrics: {
      idealCycleTime: 45,
      actualCycleTime: 51,
      totalUnitsProduced: 5200,
      performanceRate: 88.2,
      speedLoss: 11.8
    },
    qualityMetrics: {
      totalUnitsProduced: 5200,
      goodUnits: 5018,
      defectiveUnits: 182,
      qualityRate: 96.5,
      qualityLoss: 3.5
    },
    overallOEE: 78.5,
    worldClassOEE: 85,
    trend: 'improving',
    createdAt: '2024-12-07T00:00:00Z'
  }
];

export const sampleSafetyIncidents: SafetyIncident[] = [
  {
    incidentId: 'incident-001',
    incidentNumber: 'INC-2024-001',
    incidentType: {
      typeCode: 'INJ-001',
      typeName: 'Minor Injury',
      category: 'injury'
    },
    severity: 'minor',
    reportedDate: '2024-12-10',
    incidentDate: '2024-12-10',
    incidentTime: '14:30:00',
    location: {
      plant: 'Main Plant',
      building: 'Building A',
      area: 'Assembly Area',
      specificLocation: 'Line 1 Station 3'
    },
    affectedPerson: {
      employeeId: 'emp-003',
      employeeName: 'Robert Davis',
      department: 'Assembly',
      jobTitle: 'Line Operator',
      injuryType: 'Cut',
      injuryDescription: 'Minor cut on left hand',
      medicalTreatment: 'First aid administered on-site',
      daysAway: 0,
      restrictedDuty: 0
    },
    description: 'Employee sustained a minor cut while handling sharp components',
    immediateAction: 'First aid administered, area inspected for hazards',
    witnesses: [
      {
        witnessId: 'wit-001',
        witnessName: 'Tom Anderson',
        department: 'Assembly',
        contactInfo: 'tom.anderson@company.com',
        statement: 'I saw Robert handle the component without cut-resistant gloves'
      }
    ],
    investigation: {
      investigatorId: 'inv-001',
      investigatorName: 'Safety Manager',
      investigationStartDate: '2024-12-10',
      investigationEndDate: '2024-12-11',
      findings: 'Employee was not wearing required cut-resistant gloves',
      evidenceCollected: [
        {
          evidenceId: 'ev-001',
          evidenceType: 'photo',
          description: 'Photo of workstation and component',
          collectedBy: 'Safety Manager',
          collectedDate: '2024-12-10'
        }
      ],
      interviewsConducted: [
        {
          interviewId: 'int-001',
          interviewee: 'Robert Davis',
          interviewDate: '2024-12-10',
          interviewer: 'Safety Manager',
          summary: 'Employee acknowledged not wearing gloves'
        }
      ]
    },
    rootCause: {
      primaryCause: 'Failure to use required PPE',
      contributingFactors: ['Inadequate supervision', 'Need for refresher training'],
      analysisMethod: 'five_why',
      analysisSummary: 'Root cause identified as lack of PPE compliance'
    },
    correctiveActions: [
      {
        actionId: 'ca-001',
        actionDescription: 'Conduct PPE refresher training for all assembly staff',
        assignedTo: 'Training Manager',
        dueDate: '2024-12-20',
        priority: 'high',
        status: 'in_progress'
      },
      {
        actionId: 'ca-002',
        actionDescription: 'Implement daily PPE compliance checks',
        assignedTo: 'Line Supervisor',
        dueDate: '2024-12-15',
        priority: 'high',
        status: 'completed',
        completionDate: '2024-12-12',
        verifiedBy: 'Safety Manager',
        verificationDate: '2024-12-13'
      }
    ],
    status: 'investigating',
    reportedBy: 'Sarah Williams',
    createdAt: '2024-12-10T14:45:00Z'
  }
];

export const sampleSafetyInspections: SafetyInspection[] = [
  {
    inspectionId: 'insp-001',
    inspectionType: 'routine',
    scheduledDate: '2024-12-15',
    inspector: 'Safety Manager',
    location: {
      plant: 'Main Plant',
      building: 'Building A',
      areas: ['Assembly Area', 'Machining Area', 'Warehouse']
    },
    checklist: [
      {
        itemId: 'check-001',
        category: 'PPE',
        checkDescription: 'Verify all employees wearing required PPE',
        compliant: true,
        severity: 'high',
        photoRequired: false
      },
      {
        itemId: 'check-002',
        category: 'Equipment Guards',
        checkDescription: 'All machine guards in place and functional',
        compliant: true,
        severity: 'high',
        photoRequired: true
      }
    ],
    findings: [],
    overallScore: 95,
    status: 'scheduled',
    followUpRequired: false,
    createdAt: '2024-12-01T00:00:00Z'
  }
];

export const samplePPEInventory: PPEInventory[] = [
  {
    inventoryId: 'ppe-001',
    itemCode: 'PPE-SG-001',
    itemName: 'Safety Glasses - Clear Lens',
    category: {
      categoryCode: 'EYE',
      categoryName: 'Eye Protection',
      type: 'eye'
    },
    certifications: ['ANSI Z87.1', 'CSA Z94.3'],
    supplier: 'SafetyPro Inc',
    unitCost: 12.50,
    quantity: {
      onHand: 500,
      allocated: 50,
      available: 450,
      onOrder: 200
    },
    reorderPoint: 200,
    location: 'PPE Storage Room A',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    inventoryId: 'ppe-002',
    itemCode: 'PPE-GL-001',
    itemName: 'Cut-Resistant Gloves - Level 5',
    category: {
      categoryCode: 'HAND',
      categoryName: 'Hand Protection',
      type: 'hand'
    },
    size: 'L',
    certifications: ['ANSI/ISEA 105', 'EN 388'],
    supplier: 'Industrial Gloves Co',
    unitCost: 18.75,
    quantity: {
      onHand: 150,
      allocated: 30,
      available: 120,
      onOrder: 100
    },
    reorderPoint: 100,
    location: 'PPE Storage Room A',
    status: 'low_stock',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const sampleSafetyTraining: SafetyTraining[] = [
  {
    trainingId: 'train-001',
    trainingName: 'Lock-out/Tag-out Procedures',
    trainingType: 'annual',
    requiredFor: ['Maintenance', 'Technicians', 'Electricians'],
    duration: 4,
    validityPeriod: 365,
    instructor: 'Safety Manager',
    scheduledDate: '2024-12-20',
    location: 'Training Room A',
    maxParticipants: 20,
    enrolledParticipants: [
      {
        employeeId: 'emp-004',
        employeeName: 'John Smith',
        department: 'Maintenance',
        enrollmentDate: '2024-12-01',
        attendanceStatus: 'enrolled'
      }
    ],
    completionCriteria: ['Attend full session', 'Pass written test (80%)', 'Demonstrate proper procedure'],
    certificationIssued: true,
    status: 'scheduled',
    createdAt: '2024-12-01T00:00:00Z'
  }
];

export const sampleManufacturingSettings: ManufacturingSettings = {
  settingsId: 'settings-001',
  organizationId: 'org-001',
  plantSettings: {
    targetOEE: 85,
    minimumAvailability: 90,
    maximumDowntime: 60,
    qualityTarget: 98
  },
  maintenanceSettings: {
    preventiveMaintenanceFrequency: 90,
    criticalEquipmentInspectionDays: 30,
    workOrderAutoAssignment: true,
    maintenanceBudgetLimit: 50000
  },
  safetySettings: {
    incidentReportingDeadline: 24,
    inspectionFrequency: 30,
    mandatoryTrainingRefresh: 365,
    ppeReorderThreshold: 20
  },
  notifications: {
    equipmentDown: true,
    maintenanceOverdue: true,
    safetyIncident: true,
    lowOEE: true
  },
  updatedAt: '2024-01-01T00:00:00Z'
};
