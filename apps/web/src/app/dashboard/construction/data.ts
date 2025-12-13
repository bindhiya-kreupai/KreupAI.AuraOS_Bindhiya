/**
 * Construction & Real Estate Module - Sample Data
 * Comprehensive sample data for all construction features
 */

import { ConstructionProject, SafetyInspection, EquipmentLease, SubcontractorProfile, ConstructionSettings } from './types';

export const sampleProjects: ConstructionProject[] = [{
  projectId: 'proj-001',
  projectName: 'Downtown Office Tower',
  projectNumber: 'PRJ-2024-001',
  projectType: 'commercial',
  client: { clientId: 'cli-001', clientName: 'Apex Development Corp', contactPerson: 'John Smith', email: 'john@apex.com', phone: '+1-555-0100', address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' } },
  location: { address: { street: '456 Park Ave', city: 'New York', state: 'NY', zipCode: '10022', country: 'USA' }, coordinates: { latitude: 40.7589, longitude: -73.9686 }, siteArea: 50000, zoning: 'C6-4', accessibility: 'Excellent - Metro accessible' },
  description: '25-story Class A office building with ground floor retail and underground parking',
  scope: { description: 'New construction of premium office space', totalArea: 450000, numberOfUnits: 1, numberOfFloors: 25, phases: [], deliverables: ['Completed building', 'Certificate of Occupancy', 'As-built drawings'], exclusions: ['Tenant improvements', 'Furniture'] },
  timeline: { startDate: '2024-01-15', plannedEndDate: '2026-12-31', currentPhase: 'Foundation', daysRemaining: 600, daysElapsed: 185, totalDuration: 1000, weatherDelays: 12, otherDelays: [] },
  budget: { totalBudget: 125000000, contingency: 6250000, allocations: [{ category: 'Foundation & Structure', allocatedAmount: 35000000, spentAmount: 18500000, committedAmount: 8000000, remainingAmount: 8500000, percentage: 28 }], actualCosts: [], changeOrders: [], variance: { amount: -1500000, percentage: -1.2, trend: 'under' } },
  team: { projectManager: { memberId: 'pm-001', name: 'Sarah Johnson', role: 'Project Manager', email: 'sarah@construction.com', phone: '+1-555-0201', responsibilities: ['Overall project oversight'], startDate: '2024-01-01' } } as any,
  milestones: [{ milestoneId: 'ms-001', milestoneName: 'Foundation Complete', description: 'All foundation work completed and inspected', targetDate: '2024-06-30', actualDate: '2024-06-25', status: 'achieved', dependencies: [], deliverables: ['Foundation inspection report'], paymentTrigger: true, paymentAmount: 12500000, completion: 100 }],
  status: 'in_progress',
  permits: [{ permitId: 'prm-001', permitType: 'Building Permit', permitNumber: 'BP-2024-0156', issuingAuthority: 'NYC Department of Buildings', applicationDate: '2023-11-01', approvalDate: '2024-01-10', status: 'approved', cost: 75000, documents: [] }],
  risks: [],
  documents: [],
  photos: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-12-13T00:00:00Z'
}];

export const sampleSafetyInspections: SafetyInspection[] = [{
  inspectionId: 'insp-001',
  projectId: 'proj-001',
  inspectionType: 'weekly',
  inspectionDate: '2024-12-10',
  inspector: { inspectorId: 'insp-user-001', name: 'Mike Williams', organization: 'Safety Solutions Inc', certification: 'OSHA 30', licenseNumber: 'OSH-12345' },
  areas: [{ areaId: 'area-001', areaName: 'Foundation Level', location: 'Level B2', checklistItems: [{ itemId: 'item-001', item: 'Fall Protection', category: 'Safety', required: true, status: 'pass' }], score: 95, status: 'pass' }],
  findings: [],
  overallScore: 95,
  status: 'completed',
  nextInspectionDue: '2024-12-17',
  createdAt: '2024-12-10T00:00:00Z'
}];

export const sampleEquipmentLeases: EquipmentLease[] = [{
  leaseId: 'lease-001',
  projectId: 'proj-001',
  equipment: { equipmentId: 'eq-001', equipmentName: 'Tower Crane TC7032', category: 'heavy', manufacturer: 'Liebherr', model: 'TC7032', year: 2022, serialNumber: 'LH-TC-2022-0456', specifications: { liftHeight: 200, maxLoad: 16000 } as any, capacity: '16 tons', condition: 'excellent' },
  lessor: { lessorId: 'lessor-001', companyName: 'Premium Equipment Rentals', contactPerson: 'David Lee', email: 'david@premiumequip.com', phone: '+1-555-0300', address: { street: '789 Industrial Way', city: 'New York', state: 'NY', zipCode: '10003', country: 'USA' }, taxId: '12-3456789', insurance: 'General Liability $5M' },
  leaseTerms: { leaseType: 'long_term', startDate: '2024-02-01', endDate: '2026-12-31', duration: 1065, renewalOption: true, earlyTerminationAllowed: false, securityDeposit: 50000, terms: ['24-hour notice for maintenance'], operatorRequired: true, operatorProvided: true },
  delivery: { deliveryDate: '2024-01-28', deliveryTime: '08:00', deliveryLocation: 'Site Gate A', deliveryCharge: 15000, receivedBy: 'Site Supervisor', receivedDate: '2024-01-28', condition: 'Excellent' },
  maintenance: { responsibility: 'lessor', scheduledMaintenance: [], maintenanceRecords: [], breakdownCoverage: true, responseTime: 4 },
  insurance: { policyNumber: 'INS-2024-7890', provider: 'Construction Insurance Co', coverage: 2000000, deductible: 10000, expiryDate: '2025-12-31', responsibleParty: 'lessor' },
  costs: { monthlyRate: 35000, totalLeaseCost: 1225000, additionalCharges: [], payments: [], totalPaid: 385000, balance: 840000 },
  utilization: { totalHours: 2840, hoursPerDay: {}, utilizationRate: 78, idleTime: 625, productiveTime: 2215 },
  inspection: [],
  status: 'active',
  documents: [],
  createdAt: '2024-01-15T00:00:00Z'
}];

export const sampleSubcontractors: SubcontractorProfile[] = [{
  subcontractorId: 'sub-001',
  companyName: 'Elite Steel Works Inc',
  businessRegistration: 'NY-BUS-123456',
  taxId: '98-7654321',
  specialty: ['Structural Steel', 'Metal Fabrication'],
  contactInfo: { primaryContact: 'Robert Garcia', title: 'President', email: 'robert@elitesteel.com', phone: '+1-555-0400', website: 'www.elitesteel.com' },
  address: { street: '321 Steel Ave', city: 'Newark', state: 'NJ', zipCode: '07102', country: 'USA' },
  qualifications: [],
  certifications: [{ certificationId: 'cert-001', certificationType: 'AISC', certificationName: 'AISC Certified Fabricator', issueDate: '2020-03-15', expiryDate: '2025-03-14', certifyingBody: 'American Institute of Steel Construction', certificateNumber: 'AISC-2020-456', status: 'valid' }],
  insurance: { generalLiability: { policyNumber: 'GL-2024-001', provider: 'Insurance Corp', coverageAmount: 5000000, deductible: 25000, effectiveDate: '2024-01-01', expiryDate: '2025-01-01', status: 'active' }, workersCompensation: { policyNumber: 'WC-2024-001', provider: 'Insurance Corp', coverageAmount: 1000000, deductible: 10000, effectiveDate: '2024-01-01', expiryDate: '2025-01-01', status: 'active' } },
  licenses: [],
  experience: [{ projectName: 'Manhattan Tower Complex', client: 'ABC Development', projectType: 'commercial', projectValue: 18000000, role: 'Structural Steel Contractor', startDate: '2022-06-01', endDate: '2023-12-31', description: '35-story structural steel erection' }],
  references: [],
  financialInfo: { numberOfEmployees: 145, paymentTerms: 'Net 30' },
  performanceRating: { overallRating: 4.7, projectsCompleted: 28, onTimeCompletion: 96, budgetCompliance: 98, qualityRating: 4.8, safetyRating: 4.9, communicationRating: 4.5, reviews: [], lastReviewDate: '2024-11-15' },
  status: 'active',
  documents: [],
  createdAt: '2020-03-01T00:00:00Z',
  updatedAt: '2024-12-01T00:00:00Z'
}];

export const sampleConstructionSettings: ConstructionSettings = {
  settingsId: 'settings-001',
  organizationId: 'org-001',
  projectSettings: { defaultContingency: 5, defaultRetainage: 10, budgetThresholds: { warning: 85, critical: 95 }, scheduleThresholds: { warning: 7, critical: 14 } },
  safetySettings: { inspectionFrequency: { 'daily': 1, 'weekly': 7, 'monthly': 30 }, incidentReportingDeadline: 24, trainingRequirements: ['OSHA 10', 'Fall Protection', 'Confined Space'], ppeRequirements: ['Hard Hat', 'Safety Glasses', 'Steel-Toe Boots', 'Hi-Vis Vest'] },
  equipmentSettings: { inspectionFrequency: 7, maintenanceAlertDays: 14, utilizationTarget: 75 },
  subcontractorSettings: { insuranceRequirements: { generalLiability: 2000000, workersCompensation: true, additionalInsured: true, certificateRequired: true }, minimumRating: 3.5, backgroundCheckRequired: true, bondingRequired: true, retainagePercentage: 10 },
  notifications: { budgetAlerts: true, scheduleAlerts: true, safetyAlerts: true, equipmentAlerts: true, paymentReminders: true, permitExpiry: true, advanceNoticeDays: 30 },
  updatedAt: '2024-01-01T00:00:00Z'
};
