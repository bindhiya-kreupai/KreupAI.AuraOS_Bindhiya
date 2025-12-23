/**
 * Integration Marketplace Types
 * Phase 4: Enterprise Expansion - Integration Framework
 */

// ============================================================================
// INTEGRATION REGISTRY
// ============================================================================

export type IntegrationCategory =
  | 'ERP'
  | 'ACCOUNTING'
  | 'ATS'
  | 'PAYROLL_PROVIDER'
  | 'BANKING'
  | 'GOVERNMENT'
  | 'COMMUNICATION'
  | 'PRODUCTIVITY'
  | 'SSO'
  | 'CUSTOM';

export type IntegrationStatus = 'AVAILABLE' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING' | 'DEPRECATED';

export type AuthType = 'OAUTH2' | 'API_KEY' | 'BASIC' | 'JWT' | 'CERTIFICATE' | 'CUSTOM';

export type DataDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';

export interface Integration {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: IntegrationCategory;
  vendor: string;
  logoUrl?: string;
  websiteUrl?: string;
  documentationUrl?: string;

  // Capabilities
  features: IntegrationFeature[];
  supportedEntities: EntityMapping[];
  supportedActions: IntegrationAction[];

  // Authentication
  authType: AuthType;
  authConfig: AuthConfiguration;

  // Configuration
  configSchema: ConfigurationSchema;
  requiredScopes?: string[];

  // Regional
  supportedCountries?: string[]; // ISO 3166-1 alpha-2
  supportedLanguages?: string[];

  // Status
  isSystem: boolean;
  isPremium: boolean;
  status: 'ACTIVE' | 'BETA' | 'DEPRECATED';

  // Metadata
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationFeature {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  isPremium: boolean;
}

export interface EntityMapping {
  localEntity: string; // e.g., 'Employee', 'Payslip'
  remoteEntity: string; // e.g., 'HREmployee', 'PayCheck'
  direction: DataDirection;
  fieldMappings: FieldMapping[];
  transformations?: DataTransformation[];
}

export interface FieldMapping {
  localField: string;
  remoteField: string;
  dataType: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'OBJECT' | 'ARRAY';
  required: boolean;
  defaultValue?: any;
  transformation?: string; // Expression or function name
}

export interface DataTransformation {
  id: string;
  type: 'CONVERT' | 'MAP' | 'CALCULATE' | 'LOOKUP' | 'CUSTOM';
  sourceField?: string;
  targetField?: string;
  expression?: string;
  config?: Record<string, any>;
}

export interface IntegrationAction {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  type: 'SYNC' | 'PUSH' | 'PULL' | 'WEBHOOK' | 'BATCH';
  entity: string;
  direction: DataDirection;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  triggers?: ActionTrigger[];
  rateLimit?: {
    requests: number;
    period: 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY';
  };
}

export interface ActionTrigger {
  type: 'SCHEDULE' | 'EVENT' | 'MANUAL' | 'WEBHOOK';
  config: {
    cron?: string;
    event?: string;
    webhookUrl?: string;
  };
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface AuthConfiguration {
  type: AuthType;
  oauth2?: OAuth2Config;
  apiKey?: ApiKeyConfig;
  basic?: BasicAuthConfig;
  jwt?: JWTConfig;
  certificate?: CertificateConfig;
}

export interface OAuth2Config {
  authorizationUrl: string;
  tokenUrl: string;
  refreshUrl?: string;
  revokeUrl?: string;
  scopes: { scope: string; description: string }[];
  clientId?: string;
  grantTypes: ('authorization_code' | 'client_credentials' | 'refresh_token')[];
  pkceRequired?: boolean;
}

export interface ApiKeyConfig {
  headerName: string;
  prefix?: string; // e.g., 'Bearer', 'Api-Key'
  location: 'HEADER' | 'QUERY' | 'BODY';
}

export interface BasicAuthConfig {
  usernameField: string;
  passwordField: string;
}

export interface JWTConfig {
  algorithm: 'RS256' | 'HS256' | 'ES256';
  issuer?: string;
  audience?: string;
  expiresIn: number;
}

export interface CertificateConfig {
  type: 'PEM' | 'PFX' | 'P12';
  requiresPassword: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ConfigurationSchema {
  properties: ConfigProperty[];
  sections: ConfigSection[];
}

export interface ConfigProperty {
  id: string;
  label: string;
  labelAr: string;
  type: 'TEXT' | 'PASSWORD' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT' | 'URL' | 'DATE';
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: { value: any; label: string; labelAr: string }[];
  };
  helpText?: string;
  helpTextAr?: string;
  section: string;
}

export interface ConfigSection {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  order: number;
}

// ============================================================================
// TENANT CONNECTION
// ============================================================================

export interface TenantIntegration {
  id: string;
  tenantId: string;
  integrationId: string;
  integrationName: string;
  status: IntegrationStatus;

  // Configuration
  configuration: Record<string, any>;
  credentials: EncryptedCredentials;
  fieldMappings: EntityMapping[];

  // Sync Settings
  syncEnabled: boolean;
  syncFrequency?: string; // Cron expression
  lastSyncAt?: Date;
  nextSyncAt?: Date;

  // Connection
  connectedAt?: Date;
  connectedBy?: string;
  disconnectedAt?: Date;

  // Health
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  lastHealthCheck?: Date;
  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptedCredentials {
  encryptedData: string;
  encryptionVersion: string;
  expiresAt?: Date;
}

// ============================================================================
// SYNC & LOGS
// ============================================================================

export interface SyncJob {
  id: string;
  tenantId: string;
  integrationId: string;
  connectionId: string;

  // Job Details
  type: 'FULL' | 'INCREMENTAL' | 'DELTA';
  direction: DataDirection;
  entity: string;
  action: string;

  // Status
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number; // 0-100

  // Results
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];

  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds

  // Trigger
  triggeredBy: 'SCHEDULE' | 'MANUAL' | 'EVENT' | 'WEBHOOK';
  triggeredByUser?: string;

  createdAt: Date;
}

export interface SyncError {
  recordId?: string;
  field?: string;
  errorCode: string;
  message: string;
  messageAr?: string;
  timestamp: Date;
  retryable: boolean;
}

export interface IntegrationLog {
  id: string;
  tenantId: string;
  integrationId: string;
  connectionId: string;

  // Request
  direction: 'INBOUND' | 'OUTBOUND';
  method: string;
  endpoint: string;
  requestHeaders?: Record<string, string>;
  requestBody?: string;

  // Response
  statusCode: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  responseTime: number; // milliseconds

  // Context
  action?: string;
  entity?: string;
  recordId?: string;
  syncJobId?: string;

  // Status
  success: boolean;
  errorMessage?: string;

  timestamp: Date;
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export interface WebhookConfig {
  id: string;
  tenantId: string;
  integrationId: string;
  connectionId: string;

  // Webhook Details
  name: string;
  nameAr: string;
  description?: string;
  direction: 'INBOUND' | 'OUTBOUND';

  // Inbound (receiving webhooks)
  inboundUrl?: string;
  inboundSecret?: string;
  inboundEvents?: string[];

  // Outbound (sending webhooks)
  outboundUrl?: string;
  outboundEvents?: string[];
  outboundHeaders?: Record<string, string>;

  // Security
  signatureType?: 'HMAC_SHA256' | 'HMAC_SHA1' | 'RSA_SHA256';
  signatureHeader?: string;

  // Retry
  retryEnabled: boolean;
  maxRetries: number;
  retryDelay: number; // seconds

  // Status
  enabled: boolean;
  lastTriggeredAt?: Date;
  successCount: number;
  failureCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;

  // Delivery
  attempts: WebhookAttempt[];
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  scheduledAt: Date;

  createdAt: Date;
}

export interface WebhookAttempt {
  attemptNumber: number;
  timestamp: Date;
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
  success: boolean;
}

// ============================================================================
// MARKETPLACE
// ============================================================================

export interface MarketplaceCategory {
  id: IntegrationCategory;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  integrationCount: number;
}

export interface MarketplaceListing {
  integration: Integration;
  rating: number;
  reviewCount: number;
  installCount: number;
  isInstalled: boolean;
  isPremium: boolean;
  pricing?: {
    type: 'FREE' | 'PAID' | 'FREEMIUM';
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
  };
}
