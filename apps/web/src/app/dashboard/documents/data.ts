// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Document Management Sample Data
import type {
  Document, Folder, DocumentTemplate, DocumentRequest, DocumentMetrics, DocumentSettings,
  DocumentVersion, DocumentShare, DocumentApprover
} from './types';

// Sample Folders
export const sampleFolders: Folder[] = [
  {
    id: 'folder-001',
    name: 'HR Policies',
    description: 'Human Resources policies and procedures',
    path: '/HR Policies',
    accessLevel: 'internal',
    createdBy: 'admin-001',
    createdByName: 'Admin User',
    createdDate: '2024-01-01',
    lastModified: '2024-01-15',
    documentCount: 12,
    subFolderCount: 3
  },
  {
    id: 'folder-002',
    name: 'Employee Handbook',
    description: 'Company employee handbook and guidelines',
    parentFolderId: 'folder-001',
    path: '/HR Policies/Employee Handbook',
    accessLevel: 'public',
    createdBy: 'admin-001',
    createdByName: 'Admin User',
    createdDate: '2024-01-01',
    lastModified: '2024-02-01',
    documentCount: 5,
    subFolderCount: 0
  },
  {
    id: 'folder-003',
    name: 'Forms & Templates',
    description: 'HR forms and document templates',
    path: '/Forms & Templates',
    accessLevel: 'internal',
    createdBy: 'admin-001',
    createdByName: 'Admin User',
    createdDate: '2024-01-01',
    lastModified: '2024-02-10',
    documentCount: 25,
    subFolderCount: 4
  },
  {
    id: 'folder-004',
    name: 'Compliance',
    description: 'Legal and compliance documents',
    path: '/Compliance',
    accessLevel: 'restricted',
    createdBy: 'admin-001',
    createdByName: 'Admin User',
    createdDate: '2024-01-01',
    lastModified: '2024-01-20',
    documentCount: 18,
    subFolderCount: 2
  }
];

// Sample Documents
export const sampleDocuments: Document[] = [
  {
    id: 'doc-001',
    documentCode: 'POL-2024-001',
    title: 'Code of Conduct',
    description: 'Company code of conduct and ethics policy for all employees',
    documentType: 'policy',
    category: 'company_policies',
    status: 'published',
    accessLevel: 'public',
    folderId: 'folder-001',
    folderPath: '/HR Policies',
    fileUrl: '/documents/code-of-conduct.pdf',
    fileName: 'code-of-conduct.pdf',
    fileSize: 2457600,
    fileFormat: 'pdf',
    version: 3,
    versionHistory: [
      {
        id: 'ver-001',
        versionNumber: 1,
        fileUrl: '/documents/code-of-conduct-v1.pdf',
        fileName: 'code-of-conduct-v1.pdf',
        fileSize: 2100000,
        uploadedBy: 'admin-001',
        uploadedByName: 'Admin User',
        uploadedDate: '2024-01-01',
        changes: 'Initial version',
        isCurrent: false
      },
      {
        id: 'ver-002',
        versionNumber: 2,
        fileUrl: '/documents/code-of-conduct-v2.pdf',
        fileName: 'code-of-conduct-v2.pdf',
        fileSize: 2250000,
        uploadedBy: 'admin-001',
        uploadedByName: 'Admin User',
        uploadedDate: '2024-03-15',
        changes: 'Updated social media policy section',
        isCurrent: false
      },
      {
        id: 'ver-003',
        versionNumber: 3,
        fileUrl: '/documents/code-of-conduct.pdf',
        fileName: 'code-of-conduct.pdf',
        fileSize: 2457600,
        uploadedBy: 'hr-001',
        uploadedByName: 'Sarah Johnson',
        uploadedDate: '2024-06-01',
        changes: 'Added remote work guidelines and updated harassment policy',
        isCurrent: true
      }
    ],
    tags: ['policy', 'ethics', 'conduct', 'mandatory'],
    owner: {
      ownerId: 'dept-001',
      ownerName: 'Human Resources',
      ownerType: 'department',
      departmentId: 'dept-001',
      departmentName: 'Human Resources'
    },
    uploadedBy: 'hr-001',
    uploadedByName: 'Sarah Johnson',
    uploadedDate: '2024-01-01',
    lastModifiedBy: 'hr-001',
    lastModifiedByName: 'Sarah Johnson',
    lastModified: '2024-06-01',
    approvalRequired: true,
    approvalStatus: 'approved',
    approvers: [
      {
        id: 'app-001',
        approverLevel: 1,
        approverId: 'legal-001',
        approverName: 'David Williams',
        approverRole: 'Legal Counsel',
        status: 'approved',
        approvedDate: '2024-05-25',
        comments: 'Reviewed and approved with minor edits'
      },
      {
        id: 'app-002',
        approverLevel: 2,
        approverId: 'ceo-001',
        approverName: 'Jennifer Martinez',
        approverRole: 'CEO',
        status: 'approved',
        approvedDate: '2024-05-28',
        comments: 'Approved for publication'
      }
    ],
    expiryDate: '2025-06-01',
    isExpired: false,
    reminderDays: 30,
    viewCount: 1250,
    downloadCount: 385,
    shares: [
      {
        id: 'share-001',
        documentId: 'doc-001',
        sharedWith: 'all-employees',
        sharedWithName: 'All Employees',
        sharedWithType: 'public',
        permission: 'view',
        sharedBy: 'hr-001',
        sharedByName: 'Sarah Johnson',
        sharedDate: '2024-06-01',
        message: 'Updated Code of Conduct - please review'
      }
    ],
    metadata: {
      author: 'HR Department',
      subject: 'Code of Conduct and Ethics',
      keywords: ['ethics', 'conduct', 'policy', 'behavior'],
      language: 'English',
      department: 'Human Resources',
      effectiveDate: '2024-06-01',
      reviewDate: '2025-06-01',
      retentionPeriod: 365,
      customFields: {
        documentOwner: 'HR Director',
        classification: 'Public',
        requiresAcknowledgment: 'Yes'
      }
    },
    relatedDocuments: ['doc-002', 'doc-005'],
    isTemplate: false,
    isMandatory: true,
    applicableTo: [
      { entityType: 'role', entityId: 'all', entityName: 'All Employees' }
    ],
    createdDate: '2024-01-01'
  },
  {
    id: 'doc-002',
    documentCode: 'POL-2024-002',
    title: 'Leave Policy',
    description: 'Company leave policy including annual leave, sick leave, and special leave provisions',
    documentType: 'policy',
    category: 'hr_policies',
    status: 'published',
    accessLevel: 'internal',
    folderId: 'folder-001',
    folderPath: '/HR Policies',
    fileUrl: '/documents/leave-policy.pdf',
    fileName: 'leave-policy.pdf',
    fileSize: 1894400,
    fileFormat: 'pdf',
    version: 2,
    versionHistory: [
      {
        id: 'ver-004',
        versionNumber: 1,
        fileUrl: '/documents/leave-policy-v1.pdf',
        fileName: 'leave-policy-v1.pdf',
        fileSize: 1750000,
        uploadedBy: 'hr-001',
        uploadedByName: 'Sarah Johnson',
        uploadedDate: '2024-01-15',
        changes: 'Initial policy document',
        isCurrent: false
      },
      {
        id: 'ver-005',
        versionNumber: 2,
        fileUrl: '/documents/leave-policy.pdf',
        fileName: 'leave-policy.pdf',
        fileSize: 1894400,
        uploadedBy: 'hr-001',
        uploadedByName: 'Sarah Johnson',
        uploadedDate: '2024-04-01',
        changes: 'Added parental leave policy and extended sick leave provisions',
        isCurrent: true
      }
    ],
    tags: ['policy', 'leave', 'time-off', 'hr'],
    owner: {
      ownerId: 'dept-001',
      ownerName: 'Human Resources',
      ownerType: 'department',
      departmentId: 'dept-001',
      departmentName: 'Human Resources'
    },
    uploadedBy: 'hr-001',
    uploadedByName: 'Sarah Johnson',
    uploadedDate: '2024-01-15',
    lastModifiedBy: 'hr-001',
    lastModifiedByName: 'Sarah Johnson',
    lastModified: '2024-04-01',
    approvalRequired: true,
    approvalStatus: 'approved',
    approvers: [
      {
        id: 'app-003',
        approverLevel: 1,
        approverId: 'hr-dir-001',
        approverName: 'Amanda White',
        approverRole: 'HR Director',
        status: 'approved',
        approvedDate: '2024-03-25',
        comments: 'Policy updates align with industry standards'
      }
    ],
    expiryDate: '2025-04-01',
    isExpired: false,
    reminderDays: 30,
    viewCount: 890,
    downloadCount: 245,
    shares: [],
    metadata: {
      author: 'HR Department',
      subject: 'Leave and Time Off Policy',
      keywords: ['leave', 'vacation', 'sick', 'policy'],
      language: 'English',
      department: 'Human Resources',
      effectiveDate: '2024-04-01',
      reviewDate: '2025-04-01',
      retentionPeriod: 365
    },
    relatedDocuments: ['doc-001'],
    isTemplate: false,
    isMandatory: true,
    applicableTo: [
      { entityType: 'role', entityId: 'all', entityName: 'All Employees' }
    ],
    createdDate: '2024-01-15'
  },
  {
    id: 'doc-003',
    documentCode: 'FORM-2024-001',
    title: 'Leave Application Form',
    description: 'Standard leave application form for all leave types',
    documentType: 'form',
    category: 'forms',
    status: 'published',
    accessLevel: 'internal',
    folderId: 'folder-003',
    folderPath: '/Forms & Templates',
    fileUrl: '/documents/leave-application-form.pdf',
    fileName: 'leave-application-form.pdf',
    fileSize: 524288,
    fileFormat: 'pdf',
    version: 1,
    versionHistory: [
      {
        id: 'ver-006',
        versionNumber: 1,
        fileUrl: '/documents/leave-application-form.pdf',
        fileName: 'leave-application-form.pdf',
        fileSize: 524288,
        uploadedBy: 'hr-001',
        uploadedByName: 'Sarah Johnson',
        uploadedDate: '2024-01-20',
        changes: 'Initial form template',
        isCurrent: true
      }
    ],
    tags: ['form', 'leave', 'application', 'hr'],
    owner: {
      ownerId: 'dept-001',
      ownerName: 'Human Resources',
      ownerType: 'department',
      departmentId: 'dept-001',
      departmentName: 'Human Resources'
    },
    uploadedBy: 'hr-001',
    uploadedByName: 'Sarah Johnson',
    uploadedDate: '2024-01-20',
    lastModified: '2024-01-20',
    approvalRequired: false,
    approvalStatus: 'not_required',
    isExpired: false,
    viewCount: 2150,
    downloadCount: 1250,
    shares: [],
    metadata: {
      author: 'HR Department',
      subject: 'Leave Application',
      keywords: ['form', 'leave', 'application'],
      language: 'English',
      department: 'Human Resources'
    },
    relatedDocuments: ['doc-002'],
    isTemplate: true,
    isMandatory: false,
    applicableTo: [
      { entityType: 'role', entityId: 'all', entityName: 'All Employees' }
    ],
    createdDate: '2024-01-20'
  },
  {
    id: 'doc-004',
    documentCode: 'PROC-2024-001',
    title: 'Onboarding Procedure',
    description: 'Step-by-step procedure for new employee onboarding',
    documentType: 'procedure',
    category: 'procedures',
    status: 'published',
    accessLevel: 'confidential',
    folderId: 'folder-001',
    folderPath: '/HR Policies',
    fileUrl: '/documents/onboarding-procedure.docx',
    fileName: 'onboarding-procedure.docx',
    fileSize: 1048576,
    fileFormat: 'docx',
    version: 1,
    versionHistory: [
      {
        id: 'ver-007',
        versionNumber: 1,
        fileUrl: '/documents/onboarding-procedure.docx',
        fileName: 'onboarding-procedure.docx',
        fileSize: 1048576,
        uploadedBy: 'hr-002',
        uploadedByName: 'Jessica Lee',
        uploadedDate: '2024-02-01',
        changes: 'Initial procedure document',
        isCurrent: true
      }
    ],
    tags: ['procedure', 'onboarding', 'hr', 'recruitment'],
    owner: {
      ownerId: 'dept-001',
      ownerName: 'Human Resources',
      ownerType: 'department',
      departmentId: 'dept-001',
      departmentName: 'Human Resources'
    },
    uploadedBy: 'hr-002',
    uploadedByName: 'Jessica Lee',
    uploadedDate: '2024-02-01',
    lastModified: '2024-02-01',
    approvalRequired: true,
    approvalStatus: 'approved',
    approvers: [
      {
        id: 'app-004',
        approverLevel: 1,
        approverId: 'hr-dir-001',
        approverName: 'Amanda White',
        approverRole: 'HR Director',
        status: 'approved',
        approvedDate: '2024-01-28',
        comments: 'Comprehensive onboarding procedure - approved'
      }
    ],
    isExpired: false,
    viewCount: 450,
    downloadCount: 125,
    shares: [
      {
        id: 'share-002',
        documentId: 'doc-004',
        sharedWith: 'dept-001',
        sharedWithName: 'HR Department',
        sharedWithType: 'department',
        permission: 'edit',
        sharedBy: 'hr-dir-001',
        sharedByName: 'Amanda White',
        sharedDate: '2024-02-01'
      }
    ],
    metadata: {
      author: 'Jessica Lee',
      subject: 'Employee Onboarding',
      keywords: ['onboarding', 'new hire', 'procedure'],
      language: 'English',
      department: 'Human Resources',
      effectiveDate: '2024-02-01',
      reviewDate: '2025-02-01',
      retentionPeriod: 365
    },
    relatedDocuments: [],
    isTemplate: false,
    isMandatory: false,
    applicableTo: [
      { entityType: 'department', entityId: 'dept-001', entityName: 'Human Resources' }
    ],
    createdDate: '2024-02-01'
  },
  {
    id: 'doc-005',
    documentCode: 'POL-2024-003',
    title: 'Remote Work Policy',
    description: 'Policy governing remote and hybrid work arrangements',
    documentType: 'policy',
    category: 'hr_policies',
    status: 'under_review',
    accessLevel: 'internal',
    folderId: 'folder-001',
    folderPath: '/HR Policies',
    fileUrl: '/documents/remote-work-policy-draft.pdf',
    fileName: 'remote-work-policy-draft.pdf',
    fileSize: 1572864,
    fileFormat: 'pdf',
    version: 1,
    versionHistory: [
      {
        id: 'ver-008',
        versionNumber: 1,
        fileUrl: '/documents/remote-work-policy-draft.pdf',
        fileName: 'remote-work-policy-draft.pdf',
        fileSize: 1572864,
        uploadedBy: 'hr-001',
        uploadedByName: 'Sarah Johnson',
        uploadedDate: '2024-07-01',
        changes: 'Draft version for review',
        isCurrent: true
      }
    ],
    tags: ['policy', 'remote-work', 'hybrid', 'draft'],
    owner: {
      ownerId: 'dept-001',
      ownerName: 'Human Resources',
      ownerType: 'department',
      departmentId: 'dept-001',
      departmentName: 'Human Resources'
    },
    uploadedBy: 'hr-001',
    uploadedByName: 'Sarah Johnson',
    uploadedDate: '2024-07-01',
    lastModified: '2024-07-01',
    approvalRequired: true,
    approvalStatus: 'pending',
    approvers: [
      {
        id: 'app-005',
        approverLevel: 1,
        approverId: 'it-dir-001',
        approverName: 'Michael Chen',
        approverRole: 'IT Director',
        status: 'pending'
      },
      {
        id: 'app-006',
        approverLevel: 2,
        approverId: 'hr-dir-001',
        approverName: 'Amanda White',
        approverRole: 'HR Director',
        status: 'pending'
      },
      {
        id: 'app-007',
        approverLevel: 3,
        approverId: 'coo-001',
        approverName: 'Robert Taylor',
        approverRole: 'COO',
        status: 'pending'
      }
    ],
    isExpired: false,
    viewCount: 85,
    downloadCount: 12,
    shares: [],
    metadata: {
      author: 'HR Department',
      subject: 'Remote and Hybrid Work Policy',
      keywords: ['remote', 'hybrid', 'work-from-home', 'policy'],
      language: 'English',
      department: 'Human Resources',
      effectiveDate: '2024-08-01',
      reviewDate: '2025-08-01',
      retentionPeriod: 365
    },
    relatedDocuments: ['doc-001'],
    isTemplate: false,
    isMandatory: false,
    applicableTo: [
      { entityType: 'role', entityId: 'all', entityName: 'All Employees' }
    ],
    createdDate: '2024-07-01'
  }
];

// Sample Templates
export const sampleTemplates: DocumentTemplate[] = [
  {
    id: 'temp-001',
    templateName: 'Offer Letter',
    description: 'Employment offer letter template',
    category: 'forms',
    fileUrl: '/templates/offer-letter.docx',
    fileName: 'offer-letter-template.docx',
    fileFormat: 'docx',
    fields: [
      {
        id: 'field-001',
        fieldName: 'candidateName',
        fieldLabel: 'Candidate Name',
        fieldType: 'text',
        isRequired: true,
        placeholder: 'Enter candidate full name'
      },
      {
        id: 'field-002',
        fieldName: 'position',
        fieldLabel: 'Position',
        fieldType: 'text',
        isRequired: true,
        placeholder: 'Job title'
      },
      {
        id: 'field-003',
        fieldName: 'salary',
        fieldLabel: 'Annual Salary',
        fieldType: 'number',
        isRequired: true,
        placeholder: 'Enter salary amount'
      },
      {
        id: 'field-004',
        fieldName: 'startDate',
        fieldLabel: 'Start Date',
        fieldType: 'date',
        isRequired: true
      }
    ],
    isActive: true,
    createdBy: 'hr-001',
    createdDate: '2024-01-10'
  },
  {
    id: 'temp-002',
    templateName: 'Performance Review Form',
    description: 'Annual performance review form template',
    category: 'forms',
    fileUrl: '/templates/performance-review.xlsx',
    fileName: 'performance-review-template.xlsx',
    fileFormat: 'xlsx',
    fields: [
      {
        id: 'field-005',
        fieldName: 'employeeName',
        fieldLabel: 'Employee Name',
        fieldType: 'text',
        isRequired: true
      },
      {
        id: 'field-006',
        fieldName: 'reviewPeriod',
        fieldLabel: 'Review Period',
        fieldType: 'text',
        isRequired: true
      },
      {
        id: 'field-007',
        fieldName: 'rating',
        fieldLabel: 'Overall Rating',
        fieldType: 'dropdown',
        isRequired: true,
        options: ['Outstanding', 'Exceeds Expectations', 'Meets Expectations', 'Needs Improvement', 'Unsatisfactory']
      }
    ],
    isActive: true,
    createdBy: 'hr-001',
    createdDate: '2024-01-15'
  }
];

// Sample Document Requests
export const sampleRequests: DocumentRequest[] = [
  {
    id: 'req-001',
    requestCode: 'REQ-2024-001',
    requestedBy: 'emp-001',
    requestedByName: 'John Smith',
    requestedFrom: 'hr-001',
    requestedFromName: 'Sarah Johnson',
    documentType: 'certificate',
    documentTitle: 'Employment Verification Letter',
    description: 'Need employment verification letter for visa application',
    purpose: 'Visa application documentation',
    urgency: 'high',
    status: 'fulfilled',
    requestedDate: '2024-06-15',
    requiredByDate: '2024-06-20',
    approvedBy: 'hr-dir-001',
    approvedDate: '2024-06-16',
    fulfilledBy: 'hr-001',
    fulfilledDate: '2024-06-17',
    documentId: 'doc-emp-001',
    comments: 'Document generated and provided to employee'
  },
  {
    id: 'req-002',
    requestCode: 'REQ-2024-002',
    requestedBy: 'emp-002',
    requestedByName: 'Emily Chen',
    requestedFrom: 'hr-001',
    requestedFromName: 'Sarah Johnson',
    documentType: 'form',
    documentTitle: 'Tax Declaration Form',
    description: 'Request for updated tax declaration form for FY 2024-25',
    purpose: 'Tax filing',
    urgency: 'medium',
    status: 'pending',
    requestedDate: '2024-07-05',
    requiredByDate: '2024-07-31'
  }
];

// Sample Metrics
export const sampleMetrics: DocumentMetrics = {
  totalDocuments: 487,
  documentsByType: [
    { type: 'policy', count: 45 },
    { type: 'procedure', count: 38 },
    { type: 'form', count: 125 },
    { type: 'template', count: 42 },
    { type: 'employee_document', count: 180 },
    { type: 'contract', count: 32 },
    { type: 'report', count: 15 },
    { type: 'handbook', count: 5 },
    { type: 'certificate', count: 3 },
    { type: 'other', count: 2 }
  ],
  documentsByCategory: [
    { category: 'hr_policies', count: 35 },
    { category: 'company_policies', count: 28 },
    { category: 'procedures', count: 40 },
    { category: 'forms', count: 125 },
    { category: 'templates', count: 42 },
    { category: 'employee_docs', count: 180 },
    { category: 'contracts', count: 25 },
    { category: 'legal', count: 8 },
    { category: 'compliance', count: 3 },
    { category: 'training', count: 1 }
  ],
  documentsByStatus: [
    { status: 'published', count: 385 },
    { status: 'draft', count: 45 },
    { status: 'under_review', count: 35 },
    { status: 'approved', count: 12 },
    { status: 'archived', count: 8 },
    { status: 'expired', count: 2 }
  ],
  expiringDocuments: 15,
  expiredDocuments: 2,
  pendingApprovals: 18,
  totalStorage: 5242880000, // 5GB
  averageFileSize: 10752000,
  mostViewedDocuments: [
    { documentId: 'doc-003', title: 'Leave Application Form', views: 2150 },
    { documentId: 'doc-001', title: 'Code of Conduct', views: 1250 },
    { documentId: 'doc-002', title: 'Leave Policy', views: 890 }
  ],
  mostDownloadedDocuments: [
    { documentId: 'doc-003', title: 'Leave Application Form', downloads: 1250 },
    { documentId: 'doc-001', title: 'Code of Conduct', downloads: 385 },
    { documentId: 'doc-002', title: 'Leave Policy', downloads: 245 }
  ],
  recentUploads: [
    { documentId: 'doc-005', title: 'Remote Work Policy', uploadedDate: '2024-07-01' },
    { documentId: 'doc-004', title: 'Onboarding Procedure', uploadedDate: '2024-02-01' },
    { documentId: 'doc-003', title: 'Leave Application Form', uploadedDate: '2024-01-20' }
  ],
  activeUsers: 128,
  documentsByDepartment: [
    { departmentId: 'dept-001', departmentName: 'Human Resources', count: 245 },
    { departmentId: 'dept-002', departmentName: 'Legal', count: 85 },
    { departmentId: 'dept-003', departmentName: 'Finance', count: 72 },
    { departmentId: 'dept-004', departmentName: 'IT', count: 48 },
    { departmentId: 'dept-005', departmentName: 'Operations', count: 37 }
  ]
};

// Sample Settings
export const sampleSettings: DocumentSettings = {
  enableVersioning: true,
  enableApprovalWorkflow: true,
  enableDocumentExpiry: true,
  defaultExpiryDays: 365,
  enableDocumentSharing: true,
  enableDocumentRequests: true,
  enableDocumentCheckout: false,
  maxFileSize: 10485760, // 10MB
  allowedFileFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
  requireTags: false,
  minTags: 1,
  maxTags: 10,
  enableOCR: false,
  enableFullTextSearch: true,
  enableAuditLog: true,
  storageLocation: 'local',
  notificationEmail: 'documents@company.com'
};

// Helper function to generate document code
export const generateDocumentCode = (type: string): string => {
  const prefix = type === 'policy' ? 'POL' :
                 type === 'procedure' ? 'PROC' :
                 type === 'form' ? 'FORM' :
                 type === 'template' ? 'TEMP' : 'DOC';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};

// Helper function to check if document is expiring soon
export const isExpiringSoon = (expiryDate: string, days: number = 30): boolean => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= days && daysUntilExpiry > 0;
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Export all data
export const documentData = {
  documents: sampleDocuments,
  folders: sampleFolders,
  templates: sampleTemplates,
  requests: sampleRequests,
  metrics: sampleMetrics,
  settings: sampleSettings
};
