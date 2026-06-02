// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Organization Chart Sample Data
import type {
  Department,
  Position,
  ReportingRelationship,
  OrganizationLevel,
  OrganizationMetrics,
  OrganizationSettings,
  DepartmentHeadcount
} from './types';

export const sampleDepartments: Department[] = [
  {
    id: 'dept-001',
    departmentCode: 'DEPT-001',
    departmentName: 'Executive Office',
    departmentType: 'corporate',
    description: 'Executive leadership and corporate governance',
    managerId: 'emp-ceo',
    managerName: 'Sarah Chen',
    costCenter: 'CC-1000',
    location: 'Corporate HQ',
    level: 1,
    headcount: {
      total: 5,
      fullTime: 5,
      partTime: 0,
      contractors: 0,
      interns: 0,
      approved: 6,
      vacant: 1,
      target: 6
    },
    budget: {
      fiscalYear: '2025',
      budgetedAmount: 2000000,
      spentAmount: 1500000,
      remainingAmount: 500000,
      salaryBudget: 1800000,
      operatingBudget: 200000,
      lastUpdated: '2024-12-01'
    },
    positions: [],
    subDepartments: ['dept-002', 'dept-003', 'dept-004', 'dept-005'],
    isActive: true,
    establishedDate: '2020-01-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-002',
    departmentCode: 'DEPT-002',
    departmentName: 'Engineering',
    departmentType: 'division',
    description: 'Product development and engineering',
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Executive Office',
    managerId: 'emp-cto',
    managerName: 'Michael Zhang',
    costCenter: 'CC-2000',
    location: 'Corporate HQ',
    level: 2,
    headcount: {
      total: 45,
      fullTime: 40,
      partTime: 2,
      contractors: 3,
      interns: 0,
      approved: 50,
      vacant: 5,
      target: 50
    },
    budget: {
      fiscalYear: '2025',
      budgetedAmount: 6000000,
      spentAmount: 5200000,
      remainingAmount: 800000,
      salaryBudget: 5500000,
      operatingBudget: 500000,
      lastUpdated: '2024-12-01'
    },
    positions: [],
    subDepartments: ['dept-006', 'dept-007'],
    isActive: true,
    establishedDate: '2020-01-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-003',
    departmentCode: 'DEPT-003',
    departmentName: 'Human Resources',
    departmentType: 'department',
    description: 'HR operations and talent management',
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Executive Office',
    managerId: 'emp-chro',
    managerName: 'Lisa Anderson',
    costCenter: 'CC-3000',
    location: 'Corporate HQ',
    level: 2,
    headcount: {
      total: 12,
      fullTime: 11,
      partTime: 1,
      contractors: 0,
      interns: 0,
      approved: 15,
      vacant: 3,
      target: 15
    },
    positions: [],
    subDepartments: [],
    isActive: true,
    establishedDate: '2020-01-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-004',
    departmentCode: 'DEPT-004',
    departmentName: 'Finance',
    departmentType: 'department',
    description: 'Financial planning and accounting',
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Executive Office',
    managerId: 'emp-cfo',
    managerName: 'David Kim',
    costCenter: 'CC-4000',
    location: 'Corporate HQ',
    level: 2,
    headcount: {
      total: 18,
      fullTime: 16,
      partTime: 0,
      contractors: 2,
      interns: 0,
      approved: 20,
      vacant: 2,
      target: 20
    },
    positions: [],
    subDepartments: [],
    isActive: true,
    establishedDate: '2020-01-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-005',
    departmentCode: 'DEPT-005',
    departmentName: 'Sales & Marketing',
    departmentType: 'division',
    description: 'Sales operations and marketing',
    parentDepartmentId: 'dept-001',
    parentDepartmentName: 'Executive Office',
    managerId: 'emp-cmo',
    managerName: 'Jennifer Martinez',
    costCenter: 'CC-5000',
    location: 'Corporate HQ',
    level: 2,
    headcount: {
      total: 28,
      fullTime: 25,
      partTime: 1,
      contractors: 2,
      interns: 0,
      approved: 30,
      vacant: 2,
      target: 30
    },
    positions: [],
    subDepartments: [],
    isActive: true,
    establishedDate: '2020-01-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-006',
    departmentCode: 'DEPT-006',
    departmentName: 'Frontend Development',
    departmentType: 'team',
    description: 'Frontend engineering team',
    parentDepartmentId: 'dept-002',
    parentDepartmentName: 'Engineering',
    managerId: 'emp-eng-001',
    managerName: 'Alex Johnson',
    costCenter: 'CC-2100',
    location: 'Corporate HQ',
    level: 3,
    headcount: {
      total: 20,
      fullTime: 18,
      partTime: 0,
      contractors: 2,
      interns: 0,
      approved: 22,
      vacant: 2,
      target: 22
    },
    positions: [],
    subDepartments: [],
    isActive: true,
    establishedDate: '2020-06-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'dept-007',
    departmentCode: 'DEPT-007',
    departmentName: 'Backend Development',
    departmentType: 'team',
    description: 'Backend engineering team',
    parentDepartmentId: 'dept-002',
    parentDepartmentName: 'Engineering',
    managerId: 'emp-eng-002',
    managerName: 'Priya Patel',
    costCenter: 'CC-2200',
    location: 'Corporate HQ',
    level: 3,
    headcount: {
      total: 25,
      fullTime: 22,
      partTime: 2,
      contractors: 1,
      interns: 0,
      approved: 28,
      vacant: 3,
      target: 28
    },
    positions: [],
    subDepartments: [],
    isActive: true,
    establishedDate: '2020-06-01',
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  }
];

export const samplePositions: Position[] = [
  {
    id: 'pos-001',
    positionCode: 'POS-2024-001',
    jobTitle: 'Chief Executive Officer',
    positionType: 'executive',
    departmentId: 'dept-001',
    departmentName: 'Executive Office',
    level: 1,
    grade: 'E1',
    employmentType: 'full_time',
    status: 'active',
    fte: 1.0,
    location: 'Corporate HQ',
    costCenter: 'CC-1000',
    salaryRange: {
      currency: 'USD',
      minSalary: 300000,
      midSalary: 400000,
      maxSalary: 500000,
      targetSalary: 400000
    },
    currentEmployee: {
      employeeId: 'emp-ceo',
      employeeName: 'Sarah Chen',
      employeeEmail: 'sarah.chen@company.com',
      startDate: '2020-01-01',
      isPrimary: true,
      allocationPercentage: 100
    },
    responsibilities: [
      'Set overall company strategy and vision',
      'Lead executive team',
      'Report to Board of Directors',
      'Ensure company profitability and growth'
    ],
    requirements: {
      education: ['MBA or equivalent'],
      experience: '15+ years executive leadership',
      skills: ['Strategic Planning', 'Leadership', 'Financial Management'],
      certifications: [],
      languages: ['English']
    },
    competencies: ['Strategic Thinking', 'Leadership', 'Decision Making'],
    approvalRequired: true,
    approvedBy: 'board-001',
    approvedDate: '2020-01-01',
    effectiveDate: '2020-01-01',
    isRemote: false,
    isCritical: true,
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'pos-002',
    positionCode: 'POS-2024-002',
    jobTitle: 'Chief Technology Officer',
    positionType: 'executive',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    reportsToPositionId: 'pos-001',
    reportsToPositionTitle: 'Chief Executive Officer',
    level: 2,
    grade: 'E2',
    employmentType: 'full_time',
    status: 'active',
    fte: 1.0,
    location: 'Corporate HQ',
    costCenter: 'CC-2000',
    salaryRange: {
      currency: 'USD',
      minSalary: 200000,
      midSalary: 275000,
      maxSalary: 350000,
      targetSalary: 275000
    },
    currentEmployee: {
      employeeId: 'emp-cto',
      employeeName: 'Michael Zhang',
      employeeEmail: 'michael.zhang@company.com',
      startDate: '2020-02-01',
      isPrimary: true,
      allocationPercentage: 100
    },
    responsibilities: [
      'Lead technology strategy and roadmap',
      'Oversee engineering teams',
      'Drive technical innovation',
      'Ensure product quality and scalability'
    ],
    requirements: {
      education: ['BS/MS in Computer Science or related field'],
      experience: '12+ years in software engineering, 5+ years leadership',
      skills: ['Software Architecture', 'Team Leadership', 'Product Development'],
      certifications: [],
      languages: ['English']
    },
    competencies: ['Technical Leadership', 'Innovation', 'Strategic Thinking'],
    approvalRequired: true,
    approvedBy: 'emp-ceo',
    approvedDate: '2020-01-15',
    effectiveDate: '2020-02-01',
    isRemote: false,
    isCritical: true,
    succession: {
      successors: [
        {
          employeeId: 'emp-eng-001',
          employeeName: 'Alex Johnson',
          readiness: 'ready_2_years',
          developmentNeeds: ['Executive Leadership Training', 'Business Acumen']
        }
      ],
      readinessLevel: 'ready_2_years',
      lastReviewed: '2024-10-01'
    },
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'pos-003',
    positionCode: 'POS-2024-003',
    jobTitle: 'Engineering Manager - Frontend',
    positionType: 'management',
    departmentId: 'dept-006',
    departmentName: 'Frontend Development',
    reportsToPositionId: 'pos-002',
    reportsToPositionTitle: 'Chief Technology Officer',
    level: 3,
    grade: 'M1',
    employmentType: 'full_time',
    status: 'active',
    fte: 1.0,
    location: 'Corporate HQ',
    costCenter: 'CC-2100',
    salaryRange: {
      currency: 'USD',
      minSalary: 130000,
      midSalary: 160000,
      maxSalary: 190000,
      targetSalary: 160000
    },
    currentEmployee: {
      employeeId: 'emp-eng-001',
      employeeName: 'Alex Johnson',
      employeeEmail: 'alex.johnson@company.com',
      startDate: '2021-03-15',
      isPrimary: true,
      allocationPercentage: 100
    },
    responsibilities: [
      'Manage frontend development team',
      'Oversee UI/UX implementation',
      'Code reviews and technical guidance',
      'Sprint planning and delivery'
    ],
    requirements: {
      education: ['BS in Computer Science or related field'],
      experience: '7+ years frontend development, 2+ years management',
      skills: ['React', 'TypeScript', 'Team Management', 'Agile'],
      certifications: [],
      languages: ['English']
    },
    competencies: ['Team Leadership', 'Frontend Technologies', 'Agile Methodologies'],
    approvalRequired: true,
    approvedBy: 'emp-cto',
    approvedDate: '2021-03-01',
    effectiveDate: '2021-03-15',
    isRemote: true,
    isCritical: false,
    createdBy: 'system',
    createdDate: '2024-01-01',
    lastModified: '2024-12-10'
  },
  {
    id: 'pos-004',
    positionCode: 'POS-2024-004',
    jobTitle: 'Senior Frontend Developer',
    positionType: 'professional',
    departmentId: 'dept-006',
    departmentName: 'Frontend Development',
    reportsToPositionId: 'pos-003',
    reportsToPositionTitle: 'Engineering Manager - Frontend',
    level: 4,
    grade: 'P3',
    employmentType: 'full_time',
    status: 'vacant',
    fte: 1.0,
    location: 'Corporate HQ',
    costCenter: 'CC-2100',
    salaryRange: {
      currency: 'USD',
      minSalary: 100000,
      midSalary: 125000,
      maxSalary: 150000,
      targetSalary: 125000
    },
    responsibilities: [
      'Develop and maintain frontend applications',
      'Mentor junior developers',
      'Participate in architectural decisions',
      'Write clean, maintainable code'
    ],
    requirements: {
      education: ['BS in Computer Science or related field'],
      experience: '5+ years frontend development',
      skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Testing'],
      certifications: [],
      languages: ['English']
    },
    competencies: ['Frontend Development', 'Problem Solving', 'Communication'],
    approvalRequired: false,
    effectiveDate: '2024-12-01',
    isRemote: true,
    isCritical: false,
    createdBy: 'emp-eng-001',
    createdDate: '2024-11-15',
    lastModified: '2024-12-10'
  }
];

export const sampleRelationships: ReportingRelationship[] = [
  {
    id: 'rel-001',
    relationshipType: 'direct',
    subordinateId: 'emp-cto',
    subordinateName: 'Michael Zhang',
    subordinateTitle: 'Chief Technology Officer',
    managerId: 'emp-ceo',
    managerName: 'Sarah Chen',
    managerTitle: 'Chief Executive Officer',
    departmentId: 'dept-002',
    effectiveDate: '2020-02-01',
    isPrimary: true,
    createdDate: '2024-01-01'
  },
  {
    id: 'rel-002',
    relationshipType: 'direct',
    subordinateId: 'emp-eng-001',
    subordinateName: 'Alex Johnson',
    subordinateTitle: 'Engineering Manager - Frontend',
    managerId: 'emp-cto',
    managerName: 'Michael Zhang',
    managerTitle: 'Chief Technology Officer',
    departmentId: 'dept-006',
    effectiveDate: '2021-03-15',
    isPrimary: true,
    createdDate: '2024-01-01'
  }
];

export const sampleLevels: OrganizationLevel[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    levelName: 'Executive',
    description: 'C-level executives',
    approvalAuthority: {
      expenseLimit: 100000,
      hireApproval: true,
      budgetApproval: true,
      policyApproval: true
    },
    privileges: ['All Access', 'Strategic Planning', 'Budget Control'],
    isActive: true
  },
  {
    id: 'level-2',
    levelNumber: 2,
    levelName: 'Senior Management',
    description: 'VPs and Directors',
    parentLevelId: 'level-1',
    approvalAuthority: {
      expenseLimit: 50000,
      hireApproval: true,
      budgetApproval: true,
      policyApproval: false
    },
    privileges: ['Department Management', 'Budget Planning', 'Hiring Authority'],
    isActive: true
  },
  {
    id: 'level-3',
    levelNumber: 3,
    levelName: 'Management',
    description: 'Managers and Team Leads',
    parentLevelId: 'level-2',
    approvalAuthority: {
      expenseLimit: 10000,
      hireApproval: false,
      budgetApproval: false,
      policyApproval: false
    },
    privileges: ['Team Management', 'Performance Reviews'],
    isActive: true
  }
];

export const sampleMetrics: OrganizationMetrics = {
  totalDepartments: 7,
  totalPositions: 128,
  filledPositions: 108,
  vacantPositions: 20,
  totalHeadcount: 108,
  fullTimeEmployees: 97,
  partTimeEmployees: 6,
  contractors: 5,
  averageSpanOfControl: 5.2,
  organizationLevels: 4,
  departmentsByType: [
    { type: 'corporate', count: 1 },
    { type: 'division', count: 2 },
    { type: 'department', count: 2 },
    { type: 'team', count: 2 },
    { type: 'unit', count: 0 },
    { type: 'section', count: 0 }
  ],
  positionsByType: [
    { type: 'executive', count: 5 },
    { type: 'management', count: 15 },
    { type: 'professional', count: 70 },
    { type: 'technical', count: 25 },
    { type: 'support', count: 10 },
    { type: 'entry_level', count: 3 }
  ],
  headcountByDepartment: [
    { departmentId: 'dept-001', departmentName: 'Executive Office', headcount: 5 },
    { departmentId: 'dept-002', departmentName: 'Engineering', headcount: 45 },
    { departmentId: 'dept-003', departmentName: 'Human Resources', headcount: 12 },
    { departmentId: 'dept-004', departmentName: 'Finance', headcount: 18 },
    { departmentId: 'dept-005', departmentName: 'Sales & Marketing', headcount: 28 }
  ],
  headcountByLocation: [
    { location: 'Corporate HQ', headcount: 85 },
    { location: 'Remote', headcount: 23 }
  ],
  vacancyRate: 15.6,
  turnoverImpact: 3.2,
  topLevelManagers: 5,
  managerToEmployeeRatio: 7.2,
  costCenterDistribution: [
    { costCenter: 'CC-1000', headcount: 5, budget: 2000000 },
    { costCenter: 'CC-2000', headcount: 45, budget: 6000000 },
    { costCenter: 'CC-3000', headcount: 12, budget: 1500000 }
  ],
  growthTrend: [
    { period: '2024-Q1', headcount: 95, positions: 120 },
    { period: '2024-Q2', headcount: 100, positions: 125 },
    { period: '2024-Q3', headcount: 105, positions: 128 },
    { period: '2024-Q4', headcount: 108, positions: 128 }
  ]
};

export const sampleSettings: OrganizationSettings = {
  enableDepartmentHierarchy: true,
  maxOrganizationLevels: 10,
  requirePositionApproval: true,
  approvalLevels: 2,
  allowMatrixReporting: true,
  maxReportingRelationships: 3,
  enableCostCenters: true,
  enableBudgetTracking: true,
  enableSuccessionPlanning: true,
  autoUpdateOrgChart: true,
  showVacantPositions: true,
  showContractors: true,
  enablePositionVersioning: true,
  positionCodeFormat: 'POS-{YYYY}-{####}',
  departmentCodeFormat: 'DEPT-{####}',
  fiscalYearStart: '01-01',
  defaultCurrency: 'USD'
};

export const organizationData = {
  departments: sampleDepartments,
  positions: samplePositions,
  relationships: sampleRelationships,
  levels: sampleLevels,
  metrics: sampleMetrics,
  settings: sampleSettings
};
