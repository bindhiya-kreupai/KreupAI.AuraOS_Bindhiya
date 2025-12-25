import type {
  SmartMeter, EnergyConsumption, LoadManagement, WaterMeter, WaterUsage,
  LeakDetection, ConservationInitiative, RenewableAsset, EnergyProduction,
  UtilityAccount, UtilityBill, EnergySettings
} from './types';

// Sample Smart Meters
export const sampleSmartMeters: SmartMeter[] = [
  {
    meterId: 'meter-1',
    meterNumber: 'SMT-ELC-001',
    meterType: 'electric',
    location: {
      facilityId: 'fac-hq',
      facilityName: 'Corporate Headquarters',
      building: 'Main Building',
      floor: 'Basement',
      room: 'Electrical Room A',
      gpsCoordinates: { latitude: 37.7749, longitude: -122.4194 },
      address: '123 Market Street, San Francisco, CA 94103'
    },
    installationDate: '2023-01-15',
    manufacturer: 'Landis+Gyr',
    model: 'E650',
    firmwareVersion: '2.5.1',
    communicationProtocol: 'cellular',
    readingInterval: 15,
    lastReading: {
      readingId: 'reading-12345',
      timestamp: '2024-12-13T10:00:00Z',
      value: 1250.5,
      unit: 'kwh',
      voltage: 240,
      current: 85.5,
      powerFactor: 0.95,
      frequency: 60,
      quality: 'good',
      source: 'automated'
    },
    status: 'active',
    calibrationDate: '2024-06-01',
    nextCalibrationDate: '2025-06-01',
    alerts: [
      {
        alertId: 'alert-1',
        alertType: 'high_consumption',
        severity: 'medium',
        message: 'Consumption 25% higher than average for this time period',
        timestamp: '2024-12-12T14:30:00Z',
        threshold: 1000,
        actualValue: 1250,
        resolved: false
      }
    ],
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z'
  }
];

// Sample Energy Consumption
export const sampleEnergyConsumption: EnergyConsumption[] = [
  {
    consumptionId: 'cons-1',
    meterId: 'meter-1',
    facilityId: 'fac-hq',
    facilityName: 'Corporate Headquarters',
    period: {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      periodType: 'monthly'
    },
    consumption: 35000,
    unit: 'kwh',
    cost: 5250,
    peakDemand: 450,
    peakDemandTime: '2024-11-15T14:00:00Z',
    averageDemand: 285,
    loadFactor: 0.63,
    breakdown: {
      onPeak: 18000,
      offPeak: 17000,
      byDepartment: [
        { department: 'IT', consumption: 12000, percentage: 34.3, cost: 1800 },
        { department: 'Manufacturing', consumption: 15000, percentage: 42.9, cost: 2250 },
        { department: 'HVAC', consumption: 6000, percentage: 17.1, cost: 900 },
        { department: 'Lighting', consumption: 2000, percentage: 5.7, cost: 300 }
      ]
    },
    comparison: {
      previousPeriod: 32000,
      percentageChange: 9.4,
      sameLastYear: 33500,
      yearOverYearChange: 4.5,
      industryAverage: 38000,
      comparisonToAverage: -7.9
    },
    forecast: 36500
  }
];

// Sample Load Management
export const sampleLoadManagement: LoadManagement[] = [
  {
    loadId: 'load-1',
    facilityId: 'fac-hq',
    managementType: 'peak_shaving',
    startTime: '2024-12-14T14:00:00Z',
    endTime: '2024-12-14T18:00:00Z',
    targetReduction: 100,
    actualReduction: 95,
    affectedEquipment: ['HVAC System 1', 'HVAC System 2', 'Non-critical lighting'],
    status: 'completed',
    costSavings: 450,
    createdBy: 'energy-manager',
    createdAt: '2024-12-13T08:00:00Z'
  }
];

// Sample Water Meters
export const sampleWaterMeters: WaterMeter[] = [
  {
    meterId: 'water-meter-1',
    meterNumber: 'WTR-POT-001',
    meterType: 'potable',
    location: {
      facilityId: 'fac-hq',
      facilityName: 'Corporate Headquarters',
      building: 'Main Building',
      floor: 'Basement',
      room: 'Utility Room',
      address: '123 Market Street, San Francisco, CA 94103'
    },
    flowRate: 45.5,
    totalVolume: 125000,
    pressure: 65,
    leakDetection: true,
    lastReading: {
      readingId: 'water-reading-1',
      timestamp: '2024-12-13T10:00:00Z',
      value: 850.2,
      unit: 'cubic_meters',
      pressure: 65,
      quality: 'good',
      source: 'automated'
    },
    status: 'active',
    installationDate: '2023-01-15',
    createdAt: '2023-01-15T00:00:00Z'
  }
];

// Sample Water Usage
export const sampleWaterUsage: WaterUsage[] = [
  {
    usageId: 'usage-1',
    meterId: 'water-meter-1',
    facilityId: 'fac-hq',
    period: {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      periodType: 'monthly'
    },
    volume: 850,
    cost: 2550,
    breakdown: {
      domestic: 350,
      irrigation: 150,
      industrial: 200,
      cooling: 100,
      other: 50,
      byDepartment: [
        { department: 'Facilities', volume: 400, percentage: 47.1, cost: 1200 },
        { department: 'Manufacturing', volume: 300, percentage: 35.3, cost: 900 },
        { department: 'Cafeteria', volume: 150, percentage: 17.6, cost: 450 }
      ]
    },
    comparison: {
      previousMonth: 900,
      percentageChange: -5.6,
      yearToDate: 9500,
      budget: 10000,
      varianceFromBudget: -5.0
    },
    efficiency: {
      waterIntensity: 4.25,
      recyclingRate: 15,
      reusedWater: 127.5,
      rainwaterHarvested: 50,
      wasteWater: 672.5,
      efficiency: 20.9
    },
    alerts: [
      {
        alertId: 'water-alert-1',
        alertType: 'high_usage',
        severity: 'low',
        location: 'Building A - 3rd Floor',
        timestamp: '2024-11-15T09:00:00Z',
        value: 50,
        threshold: 40,
        status: 'open'
      }
    ]
  }
];

// Sample Leak Detection
export const sampleLeakDetections: LeakDetection[] = [
  {
    leakId: 'leak-1',
    detectionMethod: 'pressure_monitoring',
    location: 'Building A - Restroom 3B',
    detectedDate: '2024-12-01T03:45:00Z',
    severity: 'moderate',
    estimatedFlowRate: 150,
    estimatedDailyLoss: 3600,
    estimatedCost: 10.8,
    repairStatus: 'completed',
    repairDate: '2024-12-02',
    actualLoss: 5400,
    repairCost: 250,
    savings: 394.2
  }
];

// Sample Conservation Initiatives
export const sampleConservationInitiatives: ConservationInitiative[] = [
  {
    initiativeId: 'init-1',
    initiativeName: 'Low-Flow Fixture Upgrade Program',
    type: 'fixture_upgrade',
    description: 'Replace all toilets and faucets with low-flow alternatives',
    startDate: '2024-09-01',
    endDate: '2024-11-30',
    status: 'completed',
    targetReduction: 25,
    actualReduction: 28,
    investment: 15000,
    savings: 6500,
    paybackPeriod: 28,
    metrics: {
      baselineUsage: 1000,
      currentUsage: 720,
      reductionAchieved: 280,
      percentageReduction: 28,
      costSavings: 6500,
      co2Reduction: 1200
    }
  }
];

// Sample Renewable Assets
export const sampleRenewableAssets: RenewableAsset[] = [
  {
    assetId: 'asset-1',
    assetName: 'Rooftop Solar Array - Building A',
    assetType: 'solar_pv',
    location: {
      facilityId: 'fac-hq',
      facilityName: 'Corporate Headquarters',
      site: 'Building A Rooftop',
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      orientation: 'South',
      tilt: 20,
      elevation: 45
    },
    capacity: {
      ratedCapacity: 250,
      unit: 'kw',
      numberOfUnits: 800,
      capacityPerUnit: 0.3125,
      dcRating: 250,
      acRating: 237.5
    },
    installation: {
      installationDate: '2023-06-15',
      installer: 'SunPower Installation Services',
      manufacturer: 'SunPower',
      model: 'Maxeon 3',
      serialNumber: 'SP-MAX3-2023-001',
      warrantyExpiry: '2048-06-15',
      expectedLifespan: 25,
      inverterType: 'SolarEdge SE250K',
      panelType: 'Monocrystalline'
    },
    performance: {
      currentOutput: 195,
      dailyProduction: 1250,
      monthlyProduction: 35000,
      yearlyProduction: 385000,
      lifetimeProduction: 577500,
      capacity: 78,
      efficiency: 22.5,
      availability: 98.5,
      performanceRatio: 84,
      specificYield: 1540,
      co2Avoided: 192500,
      lastUpdated: '2024-12-13T10:00:00Z'
    },
    maintenance: {
      lastMaintenance: '2024-10-15',
      nextMaintenance: '2025-04-15',
      maintenanceInterval: 180,
      maintenanceType: 'preventive',
      maintenanceHistory: [
        {
          recordId: 'maint-1',
          maintenanceDate: '2024-10-15',
          maintenanceType: 'cleaning',
          technician: 'Solar Tech Services',
          findings: ['Light dust accumulation on panels', 'All inverters operational'],
          workPerformed: ['Panel cleaning', 'Inverter inspection', 'Connection checks'],
          cost: 850,
          downtime: 2
        }
      ],
      warrantyStatus: 'active'
    },
    financials: {
      capitalCost: 375000,
      installationCost: 50000,
      totalInvestment: 425000,
      incentivesReceived: [
        {
          incentiveType: 'tax_credit',
          provider: 'Federal ITC',
          amount: 106250,
          receivedDate: '2024-04-15',
          description: '26% Investment Tax Credit'
        }
      ],
      totalIncentives: 106250,
      operatingCosts: {
        annual: 5000,
        maintenance: 3000,
        insurance: 1500,
        monitoring: 500,
        other: 0
      },
      revenue: {
        energySavings: 48125,
        energySold: 50000,
        revenueFromSales: 7500,
        incentivePayments: 5000,
        totalAnnualRevenue: 60625
      },
      roi: {
        paybackPeriod: 5.7,
        npv: 385000,
        irr: 18.5,
        lcoe: 0.055,
        savingsToDate: 91875
      }
    },
    status: 'operational',
    certifications: [
      {
        certificationType: 'rec',
        certificateNumber: 'REC-2024-12345',
        issueDate: '2024-01-01',
        issuer: 'Green-e',
        value: 385,
        status: 'active'
      }
    ],
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-12-13T10:00:00Z'
  }
];

// Sample Energy Production
export const sampleEnergyProduction: EnergyProduction[] = [
  {
    productionId: 'prod-1',
    assetId: 'asset-1',
    timestamp: '2024-12-13T00:00:00Z',
    period: 'daily',
    output: 1250,
    peakOutput: 225,
    averageOutput: 195,
    capacity: 78,
    efficiency: 22.5,
    weather: {
      temperature: 18,
      irradiance: 850,
      humidity: 45,
      cloudCover: 15
    },
    gridExport: 500,
    selfConsumption: 750
  }
];

// Sample Utility Accounts
export const sampleUtilityAccounts: UtilityAccount[] = [
  {
    accountId: 'acc-1',
    accountNumber: 'PGE-12345678',
    accountName: 'Corporate Headquarters - Electric',
    utilityProvider: {
      providerId: 'pge-1',
      providerName: 'Pacific Gas & Electric',
      utilityType: 'electric',
      contactInfo: {
        phone: '1-800-743-5000',
        email: 'business@pge.com',
        website: 'www.pge.com',
        customerService: '1-800-743-5000'
      },
      serviceArea: ['Northern California', 'Central California']
    },
    utilityType: 'electric',
    facilityId: 'fac-hq',
    facilityName: 'Corporate Headquarters',
    serviceAddress: '123 Market Street, San Francisco, CA 94103',
    meterNumbers: ['SMT-ELC-001'],
    rateSchedule: {
      scheduleId: 'rate-1',
      scheduleName: 'E-19 Medium General Demand-Metered TOU',
      effectiveDate: '2024-01-01',
      rateType: 'time_of_use',
      rates: [
        { tier: 1, timeOfUse: 'on_peak', season: 'summer', rate: 0.18, unit: 'kwh' },
        { tier: 1, timeOfUse: 'off_peak', season: 'summer', rate: 0.12, unit: 'kwh' },
        { tier: 1, timeOfUse: 'on_peak', season: 'winter', rate: 0.15, unit: 'kwh' },
        { tier: 1, timeOfUse: 'off_peak', season: 'winter', rate: 0.10, unit: 'kwh' }
      ],
      demandCharge: 15.50,
      customerCharge: 150,
      taxes: [
        { taxName: 'State Tax', taxType: 'percentage', value: 7.5, applicableOn: 'total' }
      ],
      surcharges: [
        { surchargeName: 'Public Purpose Programs', surchargeType: 'regulatory', amount: 0.01, isPercentage: false }
      ]
    },
    billingCycle: {
      cycleName: 'Monthly Billing',
      billingFrequency: 'monthly',
      billingDay: 1,
      dueDate: 21,
      lateFeePercentage: 1.5,
      lateFeeGracePeriod: 5
    },
    paymentMethod: {
      methodType: 'auto_pay',
      bankAccount: {
        accountNumber: '****5678',
        routingNumber: '121000358',
        accountType: 'checking'
      },
      autoPayEnabled: true,
      autoPayDate: 15
    },
    status: 'active',
    balance: 0,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z'
  }
];

// Sample Utility Bills
export const sampleUtilityBills: UtilityBill[] = [
  {
    billId: 'bill-1',
    billNumber: 'PGE-2024-11-12345678',
    accountId: 'acc-1',
    accountNumber: 'PGE-12345678',
    billingPeriod: {
      startDate: '2024-11-01',
      endDate: '2024-11-30',
      days: 30
    },
    issueDate: '2024-12-01',
    dueDate: '2024-12-21',
    utilityType: 'electric',
    consumption: {
      currentReading: 125050,
      previousReading: 90050,
      consumption: 35000,
      unit: 'kwh',
      peakDemand: 450,
      demandUnit: 'kw'
    },
    charges: {
      energyCharges: 4800,
      demandCharges: 6975,
      customerCharge: 150,
      taxes: [
        { taxName: 'State Tax', taxAmount: 893.44, taxRate: 7.5 }
      ],
      surcharges: [
        { surchargeName: 'Public Purpose Programs', amount: 350 }
      ],
      adjustments: [],
      otherCharges: []
    },
    total: {
      subtotal: 11925,
      totalTaxes: 893.44,
      totalSurcharges: 350,
      totalAdjustments: 0,
      previousBalance: 0,
      paymentsReceived: 0,
      currentCharges: 13168.44,
      totalDue: 13168.44
    },
    payment: {},
    status: 'issued',
    documents: [
      {
        documentId: 'doc-1',
        documentType: 'invoice',
        fileName: 'PGE-2024-11-invoice.pdf',
        fileUrl: '/bills/pge-2024-11.pdf',
        fileSize: 256000,
        uploadDate: '2024-12-01'
      }
    ],
    alerts: [
      {
        alertType: 'high_bill',
        message: 'Your bill is 15% higher than last month due to increased demand charges',
        severity: 'warning',
        timestamp: '2024-12-01T08:00:00Z'
      }
    ],
    createdAt: '2024-12-01T00:00:00Z'
  }
];

// Sample Energy Settings
export const sampleEnergySettings: EnergySettings = {
  smartGridSettings: {
    readingInterval: 15,
    alertThresholds: {
      highConsumption: 20,
      communicationTimeout: 30,
      voltageVariance: 5
    },
    demandResponseEnabled: true,
    peakShavingEnabled: true
  },
  waterSettings: {
    leakDetectionSensitivity: 'medium',
    alertThreshold: 100,
    conservationGoal: 20,
    recyclingTarget: 30
  },
  renewableSettings: {
    targetCapacity: 500,
    targetProduction: 750000,
    maintenanceInterval: 180,
    performanceAlertThreshold: 10
  },
  billingSettings: {
    autoPayEnabled: true,
    paymentReminderDays: [7, 3, 1],
    budgetAlertEnabled: true,
    billComparisonEnabled: true,
    paperlessBilling: true
  }
};
