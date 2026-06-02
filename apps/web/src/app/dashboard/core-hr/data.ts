// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
import type {
  Employee, OrganizationUnit, EmploymentHistory, EmployeeDocument, Position,
  CostCenter, LifeEvent, MassUpdate, IDCard, LetterRequest, ExitProcess,
  Anniversary, AutoNumberSequence, ProbationRecord, ConfirmationLetter, Asset,
  CoreHRSettings, DocumentTemplate, LetterTemplate, ClearanceTemplate
} from './types';

// Sample Employees
export const sampleEmployees: Employee[] = [
  {
    employeeId: 'emp-1',
    employeeNumber: 'EMP-2024-001',
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      middleName: 'Marie',
      dateOfBirth: '1990-05-15',
      gender: 'female',
      nationality: 'American',
      maritalStatus: 'married',
      bloodGroup: 'O+',
      photoUrl: '/avatars/sarah.jpg'
    },
    employmentInfo: {
      dateOfJoining: '2020-01-15',
      employmentType: 'permanent',
      probationPeriod: 90,
      probationEndDate: '2020-04-15',
      confirmationDate: '2020-04-15',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      reportingManagerId: 'emp-2',
      reportingManagerName: 'Michael Chen',
      workLocation: 'San Francisco HQ',
      shiftPattern: 'day',
      workSchedule: '9:00 AM - 5:00 PM',
      employmentStatus: 'confirmed'
    },
    contactInfo: {
      email: 'sarah.johnson@company.com',
      personalEmail: 'sarah.j@email.com',
      phone: '+1-555-0101',
      mobile: '+1-555-0102',
      address: {
        street: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94102'
      }
    },
    emergencyContacts: [
      {
        name: 'David Johnson',
        relationship: 'spouse',
        phone: '+1-555-0103',
        alternatePhone: '+1-555-0104',
        address: '123 Market Street, San Francisco, CA 94102'
      }
    ],
    bankDetails: {
      accountNumber: '****1234',
      bankName: 'Chase Bank',
      branchName: 'Downtown SF',
      ifscCode: 'CHASE0001',
      accountType: 'checking'
    },
    taxInfo: {
      taxId: '***-**-1234',
      taxResidency: 'USA',
      w4Form: true,
      taxExemptions: 2
    },
    status: 'active',
    createdAt: '2020-01-15T08:00:00Z',
    updatedAt: '2024-12-13T08:00:00Z',
    createdBy: 'system',
    updatedBy: 'hr-admin'
  },
  {
    employeeId: 'emp-2',
    employeeNumber: 'EMP-2024-002',
    personalInfo: {
      firstName: 'Michael',
      lastName: 'Chen',
      dateOfBirth: '1985-08-22',
      gender: 'male',
      nationality: 'American',
      maritalStatus: 'single',
      bloodGroup: 'A+',
      photoUrl: '/avatars/michael.jpg'
    },
    employmentInfo: {
      dateOfJoining: '2018-03-01',
      employmentType: 'permanent',
      probationPeriod: 90,
      probationEndDate: '2018-06-01',
      confirmationDate: '2018-06-01',
      department: 'Engineering',
      designation: 'Engineering Manager',
      reportingManagerId: 'emp-10',
      reportingManagerName: 'Jennifer Lee',
      workLocation: 'San Francisco HQ',
      shiftPattern: 'day',
      workSchedule: '9:00 AM - 5:00 PM',
      employmentStatus: 'confirmed'
    },
    contactInfo: {
      email: 'michael.chen@company.com',
      personalEmail: 'mchen@email.com',
      phone: '+1-555-0201',
      mobile: '+1-555-0202',
      address: {
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94103'
      }
    },
    emergencyContacts: [
      {
        name: 'Linda Chen',
        relationship: 'mother',
        phone: '+1-555-0203',
        address: '789 Pine Street, San Francisco, CA 94104'
      }
    ],
    status: 'active',
    createdAt: '2018-03-01T08:00:00Z',
    updatedAt: '2024-12-13T08:00:00Z',
    createdBy: 'system',
    updatedBy: 'hr-admin'
  },
  {
    employeeId: 'emp-3',
    employeeNumber: 'EMP-2024-003',
    personalInfo: {
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: '1992-11-08',
      gender: 'female',
      nationality: 'Indian',
      maritalStatus: 'single',
      bloodGroup: 'B+',
      photoUrl: '/avatars/priya.jpg'
    },
    employmentInfo: {
      dateOfJoining: '2024-10-01',
      employmentType: 'permanent',
      probationPeriod: 90,
      probationEndDate: '2024-12-30',
      department: 'HR',
      designation: 'HR Generalist',
      reportingManagerId: 'emp-4',
      reportingManagerName: 'Amanda Rodriguez',
      workLocation: 'San Francisco HQ',
      shiftPattern: 'day',
      workSchedule: '9:00 AM - 5:00 PM',
      employmentStatus: 'on_probation'
    },
    contactInfo: {
      email: 'priya.sharma@company.com',
      personalEmail: 'priya.s@email.com',
      phone: '+1-555-0301',
      mobile: '+1-555-0302',
      address: {
        street: '789 Mission Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: '94105'
      }
    },
    emergencyContacts: [
      {
        name: 'Raj Sharma',
        relationship: 'father',
        phone: '+91-98765-43210',
        address: 'Mumbai, India'
      }
    ],
    status: 'active',
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2024-12-13T08:00:00Z',
    createdBy: 'system',
    updatedBy: 'hr-admin'
  }
];

// Sample Organization Units
export const sampleOrganizationUnits: OrganizationUnit[] = [
  {
    unitId: 'org-1',
    unitCode: 'ROOT',
    unitName: 'TechCorp Inc.',
    unitType: 'company',
    level: 1,
    isActive: true,
    employeeCount: 500,
    headOfUnit: 'Jennifer Lee',
    headEmployeeId: 'emp-10',
    effectiveDate: '2015-01-01',
    createdAt: '2015-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    unitId: 'org-2',
    unitCode: 'ENG',
    unitName: 'Engineering Division',
    unitType: 'division',
    parentUnitId: 'org-1',
    level: 2,
    isActive: true,
    employeeCount: 200,
    headOfUnit: 'Jennifer Lee',
    headEmployeeId: 'emp-10',
    effectiveDate: '2015-01-01',
    createdAt: '2015-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    unitId: 'org-3',
    unitCode: 'ENG-SW',
    unitName: 'Software Engineering Department',
    unitType: 'department',
    parentUnitId: 'org-2',
    level: 3,
    isActive: true,
    employeeCount: 120,
    headOfUnit: 'Michael Chen',
    headEmployeeId: 'emp-2',
    effectiveDate: '2015-01-01',
    costCenterId: 'cc-1',
    createdAt: '2015-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    unitId: 'org-4',
    unitCode: 'HR',
    unitName: 'Human Resources Division',
    unitType: 'division',
    parentUnitId: 'org-1',
    level: 2,
    isActive: true,
    employeeCount: 25,
    headOfUnit: 'Amanda Rodriguez',
    headEmployeeId: 'emp-4',
    effectiveDate: '2015-01-01',
    costCenterId: 'cc-2',
    createdAt: '2015-01-01T00:00:00Z',
    createdBy: 'system'
  }
];

// Sample Employment History
export const sampleEmploymentHistory: EmploymentHistory[] = [
  {
    historyId: 'hist-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    changeType: 'promotion',
    changeDate: '2022-01-15',
    effectiveDate: '2022-01-15',
    previousValue: 'Software Engineer',
    newValue: 'Senior Software Engineer',
    field: 'designation',
    reason: 'Annual promotion based on excellent performance',
    approvedBy: 'Michael Chen',
    approverEmployeeId: 'emp-2',
    approvalDate: '2022-01-10',
    documentId: 'doc-101',
    createdAt: '2022-01-15T08:00:00Z',
    createdBy: 'hr-admin'
  },
  {
    historyId: 'hist-2',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    changeType: 'transfer',
    changeDate: '2021-06-01',
    effectiveDate: '2021-06-01',
    previousValue: 'Backend Team',
    newValue: 'Full Stack Team',
    field: 'team',
    reason: 'Internal transfer to support full stack initiatives',
    approvedBy: 'Michael Chen',
    approverEmployeeId: 'emp-2',
    approvalDate: '2021-05-25',
    createdAt: '2021-06-01T08:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Document Templates
export const sampleDocumentTemplates: DocumentTemplate[] = [
  {
    templateId: 'tpl-1',
    templateName: 'Offer Letter',
    templateCode: 'OFFER_LETTER',
    category: 'offer_letter',
    description: 'Standard offer letter template',
    content: `Dear {{employeeName}},

We are pleased to offer you the position of {{designation}} at {{companyName}}.

Your start date will be {{joiningDate}}. Your annual compensation will be {{salary}}.

This offer is contingent upon successful completion of background verification.

Please sign and return this letter by {{responseDeadline}}.

We look forward to welcoming you to our team.

Sincerely,
{{hrManagerName}}
HR Manager`,
    variables: [
      { name: 'employeeName', type: 'text', required: true, description: 'Employee full name' },
      { name: 'designation', type: 'text', required: true, description: 'Job title' },
      { name: 'companyName', type: 'text', required: true, description: 'Company name' },
      { name: 'joiningDate', type: 'date', required: true, description: 'Start date' },
      { name: 'salary', type: 'number', required: true, description: 'Annual salary' },
      { name: 'responseDeadline', type: 'date', required: true, description: 'Offer acceptance deadline' },
      { name: 'hrManagerName', type: 'text', required: true, description: 'HR manager name' }
    ],
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  },
  {
    templateId: 'tpl-2',
    templateName: 'Confirmation Letter',
    templateCode: 'CONFIRMATION_LETTER',
    category: 'confirmation_letter',
    description: 'Employee confirmation letter after probation',
    content: `Dear {{employeeName}},

We are pleased to inform you that you have successfully completed your probation period.

Your employment is now confirmed effective {{confirmationDate}}.

Your annual salary will be {{salary}}, effective from the confirmation date.

Congratulations on your confirmation!

Sincerely,
{{hrManagerName}}
HR Manager`,
    variables: [
      { name: 'employeeName', type: 'text', required: true, description: 'Employee full name' },
      { name: 'confirmationDate', type: 'date', required: true, description: 'Confirmation date' },
      { name: 'salary', type: 'number', required: true, description: 'Annual salary' },
      { name: 'hrManagerName', type: 'text', required: true, description: 'HR manager name' }
    ],
    isActive: true,
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Employee Documents
export const sampleEmployeeDocuments: EmployeeDocument[] = [
  {
    documentId: 'doc-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    documentType: 'offer_letter',
    documentName: 'Offer Letter - Sarah Johnson',
    documentNumber: 'OFFER-2020-001',
    description: 'Initial offer letter',
    fileUrl: '/documents/offer-letter-sarah.pdf',
    fileType: 'application/pdf',
    fileSize: 245678,
    category: 'recruitment',
    uploadDate: '2020-01-10',
    expiryDate: '2025-01-10',
    issuedDate: '2020-01-10',
    issuedBy: 'HR Department',
    isVerified: true,
    verifiedBy: 'hr-admin',
    verifiedDate: '2020-01-10',
    isConfidential: false,
    tags: ['offer', 'onboarding'],
    version: 1,
    status: 'active',
    createdAt: '2020-01-10T08:00:00Z',
    createdBy: 'hr-admin'
  },
  {
    documentId: 'doc-2',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    documentType: 'id_proof',
    documentName: 'Passport Copy',
    documentNumber: 'PASS-2020-001',
    description: 'Passport for identity verification',
    fileUrl: '/documents/passport-sarah.pdf',
    fileType: 'application/pdf',
    fileSize: 156789,
    category: 'personal',
    uploadDate: '2020-01-12',
    expiryDate: '2030-05-15',
    isVerified: true,
    verifiedBy: 'hr-admin',
    verifiedDate: '2020-01-12',
    isConfidential: true,
    tags: ['identity', 'passport'],
    version: 1,
    status: 'active',
    createdAt: '2020-01-12T08:00:00Z',
    createdBy: 'emp-1'
  }
];

// Sample Positions
export const samplePositions: Position[] = [
  {
    positionId: 'pos-1',
    positionNumber: 'POS-2024-001',
    positionTitle: 'Senior Software Engineer',
    department: 'Engineering',
    reportingTo: 'Engineering Manager',
    reportingPositionId: 'pos-2',
    grade: 'E4',
    level: 'senior',
    employmentType: 'permanent',
    workLocation: 'San Francisco HQ',
    numberOfOpenings: 2,
    filledCount: 1,
    salaryRange: {
      currency: 'USD',
      minSalary: 120000,
      maxSalary: 160000,
      midpointSalary: 140000
    },
    jobDescription: 'Design and develop scalable software solutions',
    requiredQualifications: ['BS in Computer Science', '5+ years experience', 'React, Node.js'],
    responsibilities: ['Lead feature development', 'Code reviews', 'Mentoring junior developers'],
    effectiveDate: '2024-01-01',
    status: 'active',
    costCenterId: 'cc-1',
    budgetAllocated: 300000,
    budgetUtilized: 150000,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  },
  {
    positionId: 'pos-2',
    positionNumber: 'POS-2024-002',
    positionTitle: 'Engineering Manager',
    department: 'Engineering',
    reportingTo: 'VP Engineering',
    grade: 'M3',
    level: 'management',
    employmentType: 'permanent',
    workLocation: 'San Francisco HQ',
    numberOfOpenings: 1,
    filledCount: 1,
    salaryRange: {
      currency: 'USD',
      minSalary: 150000,
      maxSalary: 200000,
      midpointSalary: 175000
    },
    jobDescription: 'Lead and manage engineering team',
    requiredQualifications: ['BS in Computer Science', '8+ years experience', 'Leadership skills'],
    responsibilities: ['Team management', 'Project planning', 'Stakeholder communication'],
    effectiveDate: '2024-01-01',
    status: 'active',
    costCenterId: 'cc-1',
    budgetAllocated: 200000,
    budgetUtilized: 180000,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Cost Centers
export const sampleCostCenters: CostCenter[] = [
  {
    costCenterId: 'cc-1',
    costCenterCode: 'CC-ENG-001',
    costCenterName: 'Engineering Operations',
    description: 'Engineering department cost center',
    department: 'Engineering',
    organizationUnitId: 'org-3',
    costCenterType: 'operational',
    ownerEmployeeId: 'emp-2',
    ownerName: 'Michael Chen',
    parentCostCenterId: undefined,
    level: 1,
    isActive: true,
    effectiveDate: '2024-01-01',
    endDate: undefined,
    budgetAllocated: 5000000,
    budgetUtilized: 3200000,
    budgetAvailable: 1800000,
    budgetYear: 2024,
    currency: 'USD',
    glCode: 'GL-4100',
    tags: ['engineering', 'r&d'],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'finance-admin',
    updatedAt: '2024-12-13T00:00:00Z',
    updatedBy: 'finance-admin'
  },
  {
    costCenterId: 'cc-2',
    costCenterCode: 'CC-HR-001',
    costCenterName: 'Human Resources',
    description: 'HR department cost center',
    department: 'HR',
    organizationUnitId: 'org-4',
    costCenterType: 'administrative',
    ownerEmployeeId: 'emp-4',
    ownerName: 'Amanda Rodriguez',
    level: 1,
    isActive: true,
    effectiveDate: '2024-01-01',
    budgetAllocated: 800000,
    budgetUtilized: 520000,
    budgetAvailable: 280000,
    budgetYear: 2024,
    currency: 'USD',
    glCode: 'GL-6200',
    tags: ['hr', 'admin'],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'finance-admin',
    updatedAt: '2024-12-13T00:00:00Z',
    updatedBy: 'finance-admin'
  }
];

// Sample Life Events
export const sampleLifeEvents: LifeEvent[] = [
  {
    eventId: 'evt-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    eventType: 'marriage',
    eventDate: '2021-06-15',
    description: 'Employee got married',
    documentIds: ['doc-201', 'doc-202'],
    impactedFields: ['maritalStatus', 'emergencyContact', 'taxInfo'],
    changes: [
      { field: 'maritalStatus', oldValue: 'single', newValue: 'married' },
      { field: 'lastName', oldValue: 'Smith', newValue: 'Johnson' }
    ],
    status: 'processed',
    processedBy: 'hr-admin',
    processedDate: '2021-06-20',
    notificationsSent: true,
    createdAt: '2021-06-16T08:00:00Z',
    createdBy: 'emp-1'
  },
  {
    eventId: 'evt-2',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    eventType: 'child_birth',
    eventDate: '2023-08-10',
    description: 'Employee had a baby',
    documentIds: ['doc-301'],
    impactedFields: ['dependents', 'beneficiaries', 'taxExemptions'],
    changes: [
      { field: 'dependents', oldValue: '0', newValue: '1' }
    ],
    status: 'processed',
    processedBy: 'hr-admin',
    processedDate: '2023-08-15',
    notificationsSent: true,
    createdAt: '2023-08-11T08:00:00Z',
    createdBy: 'emp-1'
  }
];

// Sample Mass Updates
export const sampleMassUpdates: MassUpdate[] = [
  {
    updateId: 'mass-1',
    updateName: 'Annual Salary Increment 2024',
    updateType: 'salary_revision',
    description: 'Annual salary increment for all confirmed employees',
    scope: {
      scopeType: 'filter',
      employeeCount: 250,
      filters: {
        employmentStatus: ['confirmed'],
        department: ['Engineering', 'Sales', 'Marketing']
      }
    },
    changes: {
      field: 'salary',
      changeType: 'percentage_increase',
      value: 8,
      applyTo: 'all'
    },
    effectiveDate: '2024-01-01',
    status: 'completed',
    scheduledDate: '2024-01-01',
    executedDate: '2024-01-01T00:00:00Z',
    executedBy: 'hr-admin',
    approvalRequired: true,
    approvedBy: 'finance-director',
    approverEmployeeId: 'emp-50',
    approvalDate: '2023-12-15',
    affectedEmployees: 250,
    successCount: 250,
    failureCount: 0,
    validationErrors: [],
    previewGenerated: true,
    backupCreated: true,
    backupId: 'backup-2024-001',
    createdAt: '2023-12-10T00:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample ID Cards
export const sampleIDCards: IDCard[] = [
  {
    cardId: 'id-1',
    cardNumber: 'ID-2024-001',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    employeeNumber: 'EMP-2024-001',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    photoUrl: '/avatars/sarah.jpg',
    issueDate: '2020-01-15',
    expiryDate: '2025-01-15',
    cardType: 'employee',
    accessLevel: 'standard',
    barcodeData: 'EMP-2024-001',
    qrCodeData: JSON.stringify({ employeeId: 'emp-1', cardNumber: 'ID-2024-001' }),
    status: 'active',
    issuedBy: 'hr-admin',
    bloodGroup: 'O+',
    emergencyContact: '+1-555-0103',
    createdAt: '2020-01-15T08:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Letter Templates
export const sampleLetterTemplates: LetterTemplate[] = [
  {
    templateId: 'ltr-tpl-1',
    templateName: 'Experience Letter',
    templateCode: 'EXPERIENCE_LETTER',
    letterType: 'experience',
    category: 'exit',
    description: 'Experience certificate for employees',
    content: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employeeName}} was employed with {{companyName}} from {{joiningDate}} to {{exitDate}}.

During this period, {{he/she}} worked as {{designation}} in the {{department}} department.

We found {{him/her}} to be hardworking and sincere in {{his/her}} duties.

We wish {{him/her}} all the best for future endeavors.

Sincerely,
{{hrManagerName}}
HR Manager
{{companyName}}`,
    variables: [
      { name: 'employeeName', type: 'text', required: true, description: 'Employee full name' },
      { name: 'companyName', type: 'text', required: true, description: 'Company name' },
      { name: 'joiningDate', type: 'date', required: true, description: 'Joining date' },
      { name: 'exitDate', type: 'date', required: true, description: 'Exit date' },
      { name: 'designation', type: 'text', required: true, description: 'Job title' },
      { name: 'department', type: 'text', required: true, description: 'Department name' },
      { name: 'hrManagerName', type: 'text', required: true, description: 'HR manager name' }
    ],
    isActive: true,
    requiresApproval: true,
    approvers: ['hr-manager', 'department-head'],
    version: 1,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Letter Requests
export const sampleLetterRequests: LetterRequest[] = [
  {
    requestId: 'req-1',
    requestNumber: 'LTR-REQ-2024-001',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    letterType: 'experience',
    templateId: 'ltr-tpl-1',
    purpose: 'Visa application',
    deliveryMethod: 'email',
    deliveryAddress: 'sarah.j@email.com',
    status: 'approved',
    requestDate: '2024-12-01',
    requiredBy: '2024-12-10',
    approvedBy: 'hr-manager',
    approverEmployeeId: 'emp-4',
    approvalDate: '2024-12-02',
    generatedDate: '2024-12-02',
    generatedBy: 'hr-admin',
    documentId: 'doc-401',
    createdAt: '2024-12-01T08:00:00Z',
    createdBy: 'emp-1'
  }
];

// Sample Clearance Templates
export const sampleClearanceTemplates: ClearanceTemplate[] = [
  {
    templateId: 'clr-tpl-1',
    templateName: 'Standard Exit Clearance',
    description: 'Standard clearance checklist for all employees',
    items: [
      {
        itemId: 'clr-item-1',
        itemName: 'IT Asset Return',
        department: 'IT',
        description: 'Return laptop, phone, and access cards',
        isMandatory: true,
        approverRole: 'it-manager',
        sequence: 1,
        estimatedDays: 2
      },
      {
        itemId: 'clr-item-2',
        itemName: 'HR Exit Interview',
        department: 'HR',
        description: 'Complete exit interview',
        isMandatory: true,
        approverRole: 'hr-manager',
        sequence: 2,
        estimatedDays: 3
      },
      {
        itemId: 'clr-item-3',
        itemName: 'Finance Clearance',
        department: 'Finance',
        description: 'Clear pending dues and expenses',
        isMandatory: true,
        approverRole: 'finance-manager',
        sequence: 3,
        estimatedDays: 5
      },
      {
        itemId: 'clr-item-4',
        itemName: 'Knowledge Transfer',
        department: 'Department',
        description: 'Complete knowledge transfer to team',
        isMandatory: true,
        approverRole: 'reporting-manager',
        sequence: 4,
        estimatedDays: 10
      }
    ],
    isActive: true,
    applicableFor: ['all'],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Exit Processes
export const sampleExitProcesses: ExitProcess[] = [
  {
    exitId: 'exit-1',
    exitNumber: 'EXIT-2024-001',
    employeeId: 'emp-5',
    employeeName: 'John Doe',
    exitType: 'resignation',
    resignationDate: '2024-11-15',
    noticeDate: '2024-11-15',
    lastWorkingDate: '2024-12-15',
    noticePeriod: 30,
    noticePeriodServed: 30,
    reason: 'Career growth opportunity',
    detailedReason: 'Accepted offer from competitor with better role',
    status: 'in_progress',
    clearanceItems: [
      {
        itemId: 'clr-item-1',
        itemName: 'IT Asset Return',
        department: 'IT',
        status: 'completed',
        completedDate: '2024-11-20',
        approvedBy: 'it-manager',
        approverEmployeeId: 'emp-20'
      },
      {
        itemId: 'clr-item-2',
        itemName: 'HR Exit Interview',
        department: 'HR',
        status: 'pending'
      }
    ],
    clearanceProgress: 25,
    exitInterviewCompleted: false,
    initiatedBy: 'emp-5',
    initiatedDate: '2024-11-15',
    createdAt: '2024-11-15T08:00:00Z',
    createdBy: 'emp-5'
  }
];

// Sample Anniversaries
export const sampleAnniversaries: Anniversary[] = [
  {
    anniversaryId: 'ann-1',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    anniversaryType: 'work',
    originalDate: '2020-01-15',
    anniversaryDate: '2025-01-15',
    yearsCompleted: 5,
    milestone: 'years_5',
    status: 'upcoming',
    notificationsSent: false,
    notificationDate: '2024-12-15',
    recognitionPlan: {
      certificateGenerated: false,
      emailSent: false,
      giftAssigned: false,
      publicAnnouncement: true
    },
    createdAt: '2024-12-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    anniversaryId: 'ann-2',
    employeeId: 'emp-2',
    employeeName: 'Michael Chen',
    anniversaryType: 'birthday',
    originalDate: '1985-08-22',
    anniversaryDate: '2025-08-22',
    status: 'upcoming',
    notificationsSent: false,
    notificationDate: '2025-08-15',
    recognitionPlan: {
      emailSent: false,
      publicAnnouncement: true
    },
    createdAt: '2024-12-01T00:00:00Z',
    createdBy: 'system'
  }
];

// Sample Auto Number Sequences
export const sampleAutoNumberSequences: AutoNumberSequence[] = [
  {
    sequenceId: 'seq-1',
    entityType: 'employee',
    prefix: 'EMP',
    suffix: '',
    currentNumber: 3,
    nextNumber: 4,
    numberLength: 3,
    format: '{prefix}-{year}-{number}',
    sample: 'EMP-2024-001',
    incrementBy: 1,
    resetFrequency: 'yearly',
    lastResetDate: '2024-01-01',
    nextResetDate: '2025-01-01',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    sequenceId: 'seq-2',
    entityType: 'position',
    prefix: 'POS',
    suffix: '',
    currentNumber: 2,
    nextNumber: 3,
    numberLength: 3,
    format: '{prefix}-{year}-{number}',
    sample: 'POS-2024-001',
    incrementBy: 1,
    resetFrequency: 'yearly',
    lastResetDate: '2024-01-01',
    nextResetDate: '2025-01-01',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    sequenceId: 'seq-3',
    entityType: 'exit',
    prefix: 'EXIT',
    suffix: '',
    currentNumber: 1,
    nextNumber: 2,
    numberLength: 3,
    format: '{prefix}-{year}-{number}',
    sample: 'EXIT-2024-001',
    incrementBy: 1,
    resetFrequency: 'yearly',
    lastResetDate: '2024-01-01',
    nextResetDate: '2025-01-01',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  }
];

// Sample Probation Records
export const sampleProbationRecords: ProbationRecord[] = [
  {
    recordId: 'prob-1',
    employeeId: 'emp-3',
    employeeName: 'Priya Sharma',
    startDate: '2024-10-01',
    endDate: '2024-12-30',
    duration: 90,
    status: 'active',
    reviews: [
      {
        reviewId: 'rev-1',
        reviewDate: '2024-11-01',
        reviewType: 'monthly',
        reviewerEmployeeId: 'emp-4',
        reviewerName: 'Amanda Rodriguez',
        rating: 4,
        strengths: ['Quick learner', 'Good communication', 'Team player'],
        areasOfImprovement: ['Time management', 'Technical depth in specific areas'],
        comments: 'Priya is doing well. Showing good progress in learning our systems.',
        recommendation: 'continue',
        nextReviewDate: '2024-12-01'
      }
    ],
    extensionRequested: false,
    finalReview: false,
    finalRecommendation: undefined,
    createdAt: '2024-10-01T08:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Confirmation Letters
export const sampleConfirmationLetters: ConfirmationLetter[] = [
  {
    letterId: 'conf-1',
    letterNumber: 'CONF-2020-001',
    employeeId: 'emp-1',
    employeeName: 'Sarah Johnson',
    probationStartDate: '2020-01-15',
    probationEndDate: '2020-04-15',
    confirmationDate: '2020-04-15',
    finalReviewDate: '2020-04-10',
    finalReviewRating: 4.5,
    finalRecommendation: 'confirmed',
    newDesignation: 'Software Engineer',
    newSalary: 95000,
    benefits: ['Health insurance', 'Stock options', '401k matching'],
    status: 'issued',
    templateId: 'tpl-2',
    generatedDate: '2020-04-15',
    issuedBy: 'hr-manager',
    issuerEmployeeId: 'emp-4',
    documentId: 'doc-501',
    createdAt: '2020-04-15T08:00:00Z',
    createdBy: 'hr-admin'
  }
];

// Sample Assets
export const sampleAssets: Asset[] = [
  {
    assetId: 'asset-1',
    assetTag: 'LAPTOP-001',
    assetNumber: 'AST-2024-001',
    assetName: 'MacBook Pro 16"',
    assetType: 'laptop',
    category: 'IT Equipment',
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" M3',
    serialNumber: 'C02XL0ABJG5H',
    purchaseDate: '2024-01-15',
    purchasePrice: 2999,
    currency: 'USD',
    warrantyExpiry: '2027-01-15',
    supplier: 'Apple Store',
    assignedTo: 'emp-1',
    assignedToName: 'Sarah Johnson',
    assignmentDate: '2024-01-20',
    location: 'San Francisco HQ',
    department: 'Engineering',
    costCenterId: 'cc-1',
    status: 'assigned',
    condition: 'excellent',
    depreciationRate: 20,
    currentValue: 2399,
    maintenanceSchedule: 'annual',
    lastMaintenanceDate: '2024-12-01',
    nextMaintenanceDate: '2025-12-01',
    insurancePolicyNumber: 'INS-LAPTOP-2024-001',
    insuranceExpiry: '2025-01-15',
    disposal: undefined,
    tags: ['laptop', 'apple', 'high-value'],
    createdAt: '2024-01-15T08:00:00Z',
    createdBy: 'it-admin',
    updatedAt: '2024-01-20T08:00:00Z',
    updatedBy: 'it-admin'
  },
  {
    assetId: 'asset-2',
    assetTag: 'PHONE-001',
    assetNumber: 'AST-2024-002',
    assetName: 'iPhone 15 Pro',
    assetType: 'phone',
    category: 'IT Equipment',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro',
    serialNumber: 'F2L3K4M5N6P7',
    purchaseDate: '2024-02-01',
    purchasePrice: 999,
    currency: 'USD',
    warrantyExpiry: '2025-02-01',
    supplier: 'Apple Store',
    assignedTo: 'emp-2',
    assignedToName: 'Michael Chen',
    assignmentDate: '2024-02-05',
    location: 'San Francisco HQ',
    department: 'Engineering',
    costCenterId: 'cc-1',
    status: 'assigned',
    condition: 'good',
    depreciationRate: 30,
    currentValue: 699,
    tags: ['phone', 'apple'],
    createdAt: '2024-02-01T08:00:00Z',
    createdBy: 'it-admin',
    updatedAt: '2024-02-05T08:00:00Z',
    updatedBy: 'it-admin'
  },
  {
    assetId: 'asset-3',
    assetTag: 'MONITOR-001',
    assetNumber: 'AST-2024-003',
    assetName: 'Dell UltraSharp 27"',
    assetType: 'monitor',
    category: 'IT Equipment',
    manufacturer: 'Dell',
    model: 'U2723DE',
    serialNumber: 'CN-0ABC123',
    purchaseDate: '2024-03-01',
    purchasePrice: 599,
    currency: 'USD',
    warrantyExpiry: '2027-03-01',
    supplier: 'Dell Direct',
    status: 'available',
    condition: 'new',
    location: 'IT Storage Room',
    department: 'IT',
    costCenterId: 'cc-1',
    depreciationRate: 15,
    currentValue: 599,
    tags: ['monitor', 'dell', 'new'],
    createdAt: '2024-03-01T08:00:00Z',
    createdBy: 'it-admin'
  }
];

// Sample Core HR Settings
export const sampleCoreHRSettings: CoreHRSettings = {
  employeeNumbering: {
    enabled: true,
    prefix: 'EMP',
    suffix: '',
    numberLength: 3,
    format: '{prefix}-{year}-{number}',
    startFrom: 1,
    incrementBy: 1,
    resetFrequency: 'yearly'
  },
  probationSettings: {
    defaultDuration: 90,
    allowExtension: true,
    maxExtensionDays: 60,
    reviewFrequency: 'monthly',
    autoConfirmation: false,
    confirmationLetterAutoGenerate: true
  },
  documentSettings: {
    allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
    maxFileSize: 10485760,
    requireVerification: true,
    autoExpiryReminders: true,
    reminderDays: [30, 15, 7, 1],
    retentionPeriod: 2555
  },
  exitSettings: {
    noticePeriod: 30,
    allowBuyout: true,
    requireExitInterview: true,
    clearanceRequired: true,
    autoClearanceReminders: true,
    finalSettlementDays: 45
  },
  anniversarySettings: {
    trackWorkAnniversaries: true,
    trackBirthdays: true,
    milestones: ['years_1', 'years_3', 'years_5', 'years_10', 'years_15', 'years_20', 'years_25'],
    notificationDays: 7,
    autoRecognition: true,
    publicAnnouncement: true
  },
  assetSettings: {
    assetNumbering: {
      enabled: true,
      prefix: 'AST',
      numberLength: 3,
      format: '{prefix}-{year}-{number}'
    },
    trackDepreciation: true,
    maintenanceTracking: true,
    insuranceTracking: true,
    disposalApprovalRequired: true
  },
  organizationSettings: {
    allowMultipleReporting: false,
    maxHierarchyLevels: 10,
    requireCostCenter: true,
    allowMatrixStructure: false
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    digestFrequency: 'daily'
  }
};
