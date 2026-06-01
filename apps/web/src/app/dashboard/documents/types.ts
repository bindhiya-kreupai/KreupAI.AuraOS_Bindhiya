// Document Management Module Types

export type DocumentType = 'policy' | 'procedure' | 'form' | 'template' | 'employee_document' | 'contract' | 'report' | 'handbook' | 'certificate' | 'other';
export type DocumentStatus = 'draft' | 'under_review' | 'approved' | 'published' | 'archived' | 'expired' | 'rejected';
export type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'private';
export type DocumentCategory = 'hr_policies' | 'company_policies' | 'procedures' | 'forms' | 'templates' | 'employee_docs' | 'contracts' | 'legal' | 'compliance' | 'training' | 'other';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'not_required';
export type FileFormat = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'jpg' | 'png' | 'zip' | 'other';
export type SharePermission = 'view' | 'download' | 'edit' | 'admin';

export interface Document {
  id: string;
  documentCode: string;
  title: string;
  description: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  folderId?: string;
  folderPath?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileFormat: FileFormat;
  version: number;
  versionHistory: DocumentVersion[];
  tags: string[];
  owner: DocumentOwner;
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
  lastModifiedBy?: string;
  lastModifiedByName?: string;
  lastModified: string;
  approvalRequired: boolean;
  approvalStatus: ApprovalStatus;
  approvers?: DocumentApprover[];
  expiryDate?: string;
  isExpired: boolean;
  reminderDays?: number;
  viewCount: number;
  downloadCount: number;
  shares: DocumentShare[];
  metadata: DocumentMetadata;
  relatedDocuments?: string[];
  isTemplate: boolean;
  isMandatory: boolean;
  applicableTo?: ApplicableEntity[];
  createdDate: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedDate: string;
  changes: string;
  isCurrent: boolean;
}

export interface DocumentOwner {
  ownerId: string;
  ownerName: string;
  ownerType: 'employee' | 'department' | 'company';
  departmentId?: string;
  departmentName?: string;
}

export interface DocumentApprover {
  id: string;
  approverLevel: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedDate?: string;
  comments?: string;
  rejectionReason?: string;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  sharedWith: string;
  sharedWithName: string;
  sharedWithType: 'employee' | 'department' | 'role' | 'public';
  permission: SharePermission;
  sharedBy: string;
  sharedByName: string;
  sharedDate: string;
  expiryDate?: string;
  message?: string;
}

export interface DocumentMetadata {
  author?: string;
  subject?: string;
  keywords?: string[];
  language?: string;
  department?: string;
  effectiveDate?: string;
  reviewDate?: string;
  retentionPeriod?: number;
  customFields?: { [key: string]: string };
}

export interface ApplicableEntity {
  entityType: 'employee' | 'department' | 'location' | 'grade' | 'role';
  entityId: string;
  entityName: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  path: string;
  accessLevel: AccessLevel;
  createdBy: string;
  createdByName: string;
  createdDate: string;
  lastModified: string;
  documentCount: number;
  subFolderCount: number;
}

export interface DocumentTemplate {
  id: string;
  templateName: string;
  description: string;
  category: DocumentCategory;
  fileUrl: string;
  fileName: string;
  fileFormat: FileFormat;
  fields: TemplateField[];
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

export interface TemplateField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';
  isRequired: boolean;
  defaultValue?: string;
  options?: string[];
  placeholder?: string;
}

export interface DocumentRequest {
  id: string;
  requestCode: string;
  requestedBy: string;
  requestedByName: string;
  requestedFrom: string;
  requestedFromName: string;
  documentType: DocumentType;
  documentTitle: string;
  description: string;
  purpose: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled';
  requestedDate: string;
  requiredByDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  fulfilledBy?: string;
  fulfilledDate?: string;
  documentId?: string;
  comments?: string;
  rejectionReason?: string;
}

export interface DocumentCheckout {
  id: string;
  documentId: string;
  checkedOutBy: string;
  checkedOutByName: string;
  checkoutDate: string;
  expectedReturnDate?: string;
  returnDate?: string;
  status: 'checked_out' | 'returned' | 'overdue';
  notes?: string;
}

export interface DocumentReview {
  id: string;
  documentId: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewDate: string;
  rating?: number;
  feedback: string;
  isHelpful: boolean;
  improvementSuggestions?: string;
}

export interface DocumentAudit {
  id: string;
  documentId: string;
  action: 'created' | 'viewed' | 'downloaded' | 'edited' | 'deleted' | 'shared' | 'approved' | 'rejected' | 'archived';
  performedBy: string;
  performedByName: string;
  performedDate: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface DocumentPolicy {
  id: string;
  policyName: string;
  description: string;
  isActive: boolean;
  retentionRules: RetentionRule[];
  approvalRules: ApprovalRule[];
  accessRules: AccessRule[];
  namingConvention?: string;
  versionControl: boolean;
  requireApproval: boolean;
  maxFileSize: number;
  allowedFormats: FileFormat[];
  createdBy: string;
  createdDate: string;
}

export interface RetentionRule {
  documentType: DocumentType;
  retentionPeriodDays: number;
  archiveAfterDays?: number;
  deleteAfterDays?: number;
  autoArchive: boolean;
  autoDelete: boolean;
}

export interface ApprovalRule {
  documentType: DocumentType;
  category: DocumentCategory;
  requireApproval: boolean;
  approvalLevels: number;
  approverRoles: string[];
}

export interface AccessRule {
  documentType: DocumentType;
  category: DocumentCategory;
  defaultAccessLevel: AccessLevel;
  allowedRoles: string[];
  restrictedRoles: string[];
}

export interface DocumentMetrics {
  totalDocuments: number;
  documentsByType: { type: DocumentType; count: number }[];
  documentsByCategory: { category: DocumentCategory; count: number }[];
  documentsByStatus: { status: DocumentStatus; count: number }[];
  expiringDocuments: number;
  expiredDocuments: number;
  pendingApprovals: number;
  totalStorage: number;
  averageFileSize: number;
  mostViewedDocuments: { documentId: string; title: string; views: number }[];
  mostDownloadedDocuments: { documentId: string; title: string; downloads: number }[];
  recentUploads: { documentId: string; title: string; uploadedDate: string }[];
  activeUsers: number;
  documentsByDepartment: { departmentId: string; departmentName: string; count: number }[];
}

export interface DocumentSettings {
  enableVersioning: boolean;
  enableApprovalWorkflow: boolean;
  enableDocumentExpiry: boolean;
  defaultExpiryDays: number;
  enableDocumentSharing: boolean;
  enableDocumentRequests: boolean;
  enableDocumentCheckout: boolean;
  maxFileSize: number;
  allowedFileFormats: FileFormat[];
  requireTags: boolean;
  minTags: number;
  maxTags: number;
  enableOCR: boolean;
  enableFullTextSearch: boolean;
  enableAuditLog: boolean;
  storageLocation: 'local' | 's3' | 'azure' | 'gcs';
  notificationEmail: string;
}

export interface BulkUploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: { file: string; error: string }[];
}

export interface SearchFilters {
  query?: string;
  documentType?: DocumentType;
  category?: DocumentCategory;
  status?: DocumentStatus;
  accessLevel?: AccessLevel;
  folderId?: string;
  tags?: string[];
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  fileFormat?: FileFormat;
  expiringOnly?: boolean;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards: id, type, message,
 * optional duration in ms.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
