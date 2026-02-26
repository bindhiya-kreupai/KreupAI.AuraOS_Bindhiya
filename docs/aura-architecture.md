# 🏗️ KreupAI.HCM - Enterprise Solution Architecture & Configuration Guidelines

## 📋 Document Purpose

This document serves as the **single source of truth** for all architectural decisions, configuration standards, and implementation guidelines for KreupAI.HCM. Every feature implementation MUST reference and comply with these standards.

**Architecture Version:** 4.1
**Status:** Enterprise Reference Architecture
**Last Updated:** February 2026
**Classification:** Internal — Confidential
**Compliance Targets:** SOC 2 Type II, ISO 27001, GDPR, UAE PDPL, KSA PDPL
**Functional Coverage:** 72+ HR modules across 28 enterprise domains

---

## 🎯 CORE ARCHITECTURAL PRINCIPLES

### 1. Configuration-First Architecture

**NOTHING IS HARDCODED** - Everything is configurable through:

- Database configurations
- JSON schemas
- Environment variables
- Tenant-specific settings
- User preferences

### 2. Multi-Everything Design

- **Multi-tenant:** Isolated data per organization
- **Multi-language:** RTL/LTR support, Unicode
- **Multi-currency:** Dynamic decimal precision
- **Multi-region:** Data residency compliance
- **Multi-channel:** Web, Mobile, API, Chatbot

### 3. Zero Enumeration Policy

```javascript
// ❌ NEVER DO THIS
enum LeaveType {
  SICK = "SICK",
  CASUAL = "CASUAL",
  EARNED = "EARNED"
}

// ✅ ALWAYS DO THIS
const leaveTypes = await ConfigService.getConfigItems('LEAVE_TYPES', tenantId);
```

---

## 🏛️ SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN Layer                           │
│                    (Static Assets, Fonts)                   │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│            (Kong/AWS API Gateway/Azure APIM)                │
│         [Auth, Rate Limit, Routing, Monitoring]            │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
└─────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
│  Core Services │   │   AI Services   │   │ Worker Services │
│   Cluster      │   │    Cluster      │   │    Cluster      │
└────────────────┘   └─────────────────┘   └─────────────────┘
        │                      │                      │
┌─────────────────────────────────────────────────────────────┐
│                    Message Queue                            │
│              (RabbitMQ/Kafka/Azure Service Bus)            │
└─────────────────────────────────────────────────────────────┘
        │                      │                      │
┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
│   PostgreSQL   │   │    MongoDB      │   │     Redis       │
│   (Primary)    │   │  (Documents)    │   │    (Cache)      │
└────────────────┘   └─────────────────┘   └─────────────────┘
        │                      │                      │
┌─────────────────────────────────────────────────────────────┐
│                    Blob Storage                             │
│              (S3/Azure Blob/Google Storage)                 │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

#### Core Services

```yaml
services:
  # Configuration Service - The Master Controller
  configuration-service:
    responsibilities:
      - Tenant configurations
      - System settings
      - Feature flags
      - Language packs
      - Currency settings
    database: PostgreSQL
    cache: Redis

  # Identity Service
  identity-service:
    responsibilities:
      - Authentication
      - Authorization
      - SSO/SAML/OAuth
      - Session management
    database: PostgreSQL
    cache: Redis

  # Employee Service
  employee-service:
    responsibilities:
      - Employee master data
      - Organization structure
      - Employment history
    database: PostgreSQL
    search: Elasticsearch

  # Payroll Service
  payroll-service:
    responsibilities:
      - Salary processing
      - Tax calculations
      - Statutory compliance
    database: PostgreSQL
    queue: RabbitMQ

  # Leave Service
  leave-service:
    responsibilities:
      - Leave management
      - Holiday calendars
      - Accruals
    database: PostgreSQL

  # Attendance Service
  attendance-service:
    responsibilities:
      - Time tracking
      - Shift management
      - Overtime
    database: PostgreSQL
    timeseries: InfluxDB

  # AI Service
  ai-service:
    responsibilities:
      - Predictions
      - NLP processing
      - Recommendations
    database: MongoDB
    ml: TensorFlow/PyTorch

  # Workflow Service
  workflow-service:
    responsibilities:
      - Approval chains
      - Process automation
      - Notifications
    database: PostgreSQL
    queue: RabbitMQ

  # Document Service
  document-service:
    responsibilities:
      - File management
      - Document generation
      - Templates
    database: MongoDB
    storage: S3/Blob

  # Notification Service
  notification-service:
    responsibilities:
      - Email/SMS/Push
      - In-app notifications
      - Digest management
    database: PostgreSQL
    queue: RabbitMQ

  # Analytics Service
  analytics-service:
    responsibilities:
      - Reports
      - Dashboards
      - Data warehouse
    database: PostgreSQL
    olap: ClickHouse

  # Integration Service
  integration-service:
    responsibilities:
      - External APIs
      - Data sync
      - Webhooks
    database: PostgreSQL
    queue: Kafka
```

---

## 🔧 CONFIGURATION ARCHITECTURE

### Master Configuration Schema

```json
{
  "tenant": {
    "id": "UUID",
    "code": "KREUP001",
    "name": "Organization Name",
    "settings": {
      "localization": {
        "defaultLanguage": "en-US",
        "supportedLanguages": ["en-US", "ar-SA", "fr-FR", "de-DE"],
        "defaultDirection": "ltr",
        "dateFormat": "DD/MM/YYYY",
        "timeFormat": "24h",
        "timezone": "UTC+4",
        "firstDayOfWeek": 0,
        "workingDays": [1, 2, 3, 4, 5]
      },
      "currency": {
        "primary": "AED",
        "supportedCurrencies": ["AED", "USD", "EUR", "GBP"],
        "decimalPlaces": 2,
        "decimalSeparator": ".",
        "thousandSeparator": ",",
        "symbolPosition": "before",
        "exchangeRateSource": "api|manual",
        "roundingMode": "HALF_UP"
      },
      "fiscal": {
        "yearStart": "04-01",
        "yearEnd": "03-31",
        "periodType": "monthly|quarterly",
        "taxRegime": "UAE|US|UK|IN"
      },
      "features": {
        "ai": {
          "enabled": true,
          "modules": ["predictions", "chatbot", "recommendations"]
        },
        "mobile": {
          "enabled": true,
          "biometric": true,
          "offline": true
        },
        "compliance": {
          "gdpr": true,
          "hipaa": false,
          "sox": true
        }
      }
    }
  }
}
```

### Dynamic Configuration Tables

#### 1. Master Configuration Table

```sql
CREATE TABLE config_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  module_code VARCHAR(50) NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  value_type VARCHAR(20) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'array'
  validation_schema JSONB,
  is_encrypted BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  is_overridable BOOLEAN DEFAULT TRUE,
  parent_config_id UUID,
  effective_from TIMESTAMP NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMP,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, module_code, config_key, effective_from)
);

-- Example: Leave Types Configuration
INSERT INTO config_master (tenant_id, module_code, config_key, config_value, value_type)
VALUES
  ('tenant-uuid', 'LEAVE', 'LEAVE_TYPES',
   '[
     {"code": "ANNUAL", "name_key": "leave.type.annual", "paid": true, "accrual": true},
     {"code": "SICK", "name_key": "leave.type.sick", "paid": true, "accrual": false},
     {"code": "MATERNITY", "name_key": "leave.type.maternity", "paid": true, "accrual": false}
   ]'::jsonb,
   'array');
```

#### 2. Language Packs Table

```sql
CREATE TABLE language_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  language_code VARCHAR(10) NOT NULL, -- 'en-US', 'ar-SA', etc.
  module_code VARCHAR(50),
  translation_key VARCHAR(255) NOT NULL,
  translation_value TEXT NOT NULL,
  context_notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, language_code, module_code, translation_key)
);

-- Example: Multi-language Support
INSERT INTO language_packs (tenant_id, language_code, module_code, translation_key, translation_value)
VALUES
  ('tenant-uuid', 'en-US', 'LEAVE', 'leave.type.annual', 'Annual Leave'),
  ('tenant-uuid', 'ar-SA', 'LEAVE', 'leave.type.annual', 'إجازة سنوية'),
  ('tenant-uuid', 'en-US', 'COMMON', 'button.submit', 'Submit'),
  ('tenant-uuid', 'ar-SA', 'COMMON', 'button.submit', 'إرسال');
```

#### 3. List Management (Replacing Enums)

```sql
CREATE TABLE list_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  list_type VARCHAR(100) NOT NULL,
  list_code VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  parent_code VARCHAR(100),
  attributes JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  is_deletable BOOLEAN DEFAULT TRUE,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, list_type, list_code)
);

-- Example: Dynamic Dropdown Values
INSERT INTO list_master (tenant_id, list_type, list_code, attributes)
VALUES
  ('tenant-uuid', 'GENDER', 'M', '{"name_key": "gender.male", "icon": "male"}'),
  ('tenant-uuid', 'GENDER', 'F', '{"name_key": "gender.female", "icon": "female"}'),
  ('tenant-uuid', 'GENDER', 'O', '{"name_key": "gender.other", "icon": "other"}'),
  ('tenant-uuid', 'MARITAL_STATUS', 'S', '{"name_key": "marital.single"}'),
  ('tenant-uuid', 'MARITAL_STATUS', 'M', '{"name_key": "marital.married"}');
```

---

## 🌍 INTERNATIONALIZATION (i18n) ARCHITECTURE

### Language Support Framework

#### 1. RTL/LTR Support

```typescript
// Configuration Service
interface LanguageConfig {
  code: string;           // 'en-US', 'ar-SA'
  direction: 'ltr' | 'rtl';
  name: string;
  nativeName: string;
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    grouping: number[];
  };
  isActive: boolean;
}

// Frontend Implementation
const DirectionProvider: React.FC = ({ children }) => {
  const { language } = useConfig();

  useEffect(() => {
    document.dir = language.direction;
    document.documentElement.lang = language.code;
  }, [language]);

  return (
    <ThemeProvider theme={language.direction === 'rtl' ? rtlTheme : ltrTheme}>
      {children}
    </ThemeProvider>
  );
};
```

#### 2. Translation Service

```typescript
class TranslationService {
  private cache: Map<string, Map<string, string>>;

  async getTranslation(
    key: string,
    language: string,
    variables?: Record<string, any>
  ): Promise<string> {
    const translation = await this.fetchTranslation(key, language);
    return this.interpolate(translation, variables);
  }

  private interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }
}

// Usage
const message = await translationService.getTranslation('welcome.message', 'ar-SA', {
  name: 'أحمد',
  count: 5,
});
```

### Number & Currency Formatting

#### Dynamic Currency Configuration

```typescript
interface CurrencyConfig {
  code: string; // 'AED', 'USD'
  symbol: string; // 'د.إ', '$'
  name_key: string; // Translation key
  decimal_places: number; // 2, 3
  decimal_separator: string; // '.', ','
  thousand_separator: string; // ',', ' '
  symbol_position: 'before' | 'after' | 'before_space' | 'after_space';
  negative_format: string; // '-{amount}', '({amount})'
  rounding_mode: 'UP' | 'DOWN' | 'HALF_UP' | 'HALF_DOWN';
}

class CurrencyFormatter {
  format(amount: number, currencyCode: string, locale: string): string {
    const config = await this.getCurrencyConfig(currencyCode);

    // Apply decimal places
    let formatted = amount.toFixed(config.decimal_places);

    // Apply separators
    formatted = this.applySeparators(
      formatted,
      config.decimal_separator,
      config.thousand_separator
    );

    // Apply symbol position
    return this.applySymbol(formatted, config);
  }
}
```

---

## 💾 DATABASE ARCHITECTURE

### Multi-Tenant Data Isolation

#### 1. Schema-Per-Tenant Approach

```sql
-- Shared Schema (System Level)
CREATE SCHEMA shared;

-- Tenant-Specific Schemas
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;

-- Dynamic Schema Selection
SET search_path TO tenant_001, shared, public;
```

#### 2. Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create Policy
CREATE POLICY tenant_isolation ON employees
  FOR ALL
  TO application_role
  USING (tenant_id = current_setting('app.tenant_id')::UUID);

-- Set tenant context
SET app.tenant_id = 'tenant-uuid';
```

### Audit & Versioning Architecture

#### 1. Temporal Tables Pattern

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  employee_code VARCHAR(50) NOT NULL,
  -- ... other fields
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_to TIMESTAMP DEFAULT '9999-12-31',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- History Table
CREATE TABLE employees_history (
  LIKE employees INCLUDING ALL,
  history_id UUID DEFAULT gen_random_uuid(),
  history_action VARCHAR(10),
  history_timestamp TIMESTAMP DEFAULT NOW()
);

-- Trigger for History
CREATE TRIGGER employee_history_trigger
  BEFORE UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION record_history();
```

#### 2. JSONB for Flexible Fields

```sql
CREATE TABLE employee_custom_fields (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  field_category VARCHAR(50),
  custom_data JSONB NOT NULL,
  schema_version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Index on JSONB fields
CREATE INDEX idx_custom_data ON employee_custom_fields USING gin(custom_data);
```

---

## 🔌 API ARCHITECTURE

### RESTful API Standards

#### 1. URL Structure

```
https://api.kreupai.com/{version}/{tenant}/{module}/{resource}/{id}/{action}

Examples:
GET    /v1/kreup001/employees?page=1&size=20
POST   /v1/kreup001/employees
GET    /v1/kreup001/employees/123
PUT    /v1/kreup001/employees/123
DELETE /v1/kreup001/employees/123
POST   /v1/kreup001/employees/123/terminate
```

#### 2. Standard Response Format

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "language": "en-US",
    "currency": "AED",
    "timezone": "UTC+4"
  },
  "errors": []
}
```

#### 3. Error Response Format

```json
{
  "success": false,
  "data": null,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "field": "email",
      "message_key": "error.email.invalid",
      "message": "Invalid email format",
      "details": {}
    }
  ],
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "requestId": "req-123-456"
  }
}
```

### GraphQL Architecture (Alternative)

```graphql
type Query {
  tenant(id: ID!): Tenant
  employees(
    filter: EmployeeFilter
    pagination: PaginationInput
    language: String = "en-US"
  ): EmployeeConnection
}

type Mutation {
  updateConfiguration(module: String!, key: String!, value: JSON!): Configuration
}

type Subscription {
  configurationChanged(module: String): Configuration
}
```

---

## 🔐 SECURITY ARCHITECTURE

### Authentication & Authorization

#### 1. JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "tenant": "tenant-uuid",
    "roles": ["HR_ADMIN", "PAYROLL_USER"],
    "permissions": ["employee.read", "employee.write"],
    "language": "ar-SA",
    "currency": "AED",
    "timezone": "UTC+4",
    "exp": 1234567890
  }
}
```

#### 2. Permission Matrix

```yaml
permissions:
  structure:
    module.resource.action

  examples:
    - employee.profile.read
    - employee.profile.write
    - employee.salary.read
    - payroll.process.execute
    - configuration.system.modify

  hierarchy:
    - *.*.* (super admin)
    - module.*.* (module admin)
    - module.resource.* (resource admin)
    - module.resource.action (specific permission)
```

### Data Encryption

#### 1. Encryption Configuration

```yaml
encryption:
  at_rest:
    algorithm: AES-256-GCM
    key_management: HashiCorp Vault / AWS KMS / Azure Key Vault
    key_rotation: 90_days
    envelope_encryption: true # Data key encrypted by master key
    fields:
      - salary_amount
      - bank_account_number
      - national_id / emirates_id / iqama_number
      - passport_number
      - tax_identification_number
      - biometric_data
      - medical_records

  in_transit:
    protocol: TLS 1.3
    minimum_version: TLS 1.2 # For legacy integrations only
    cipher_suites:
      - TLS_AES_256_GCM_SHA384
      - TLS_CHACHA20_POLY1305_SHA256
    certificate_management:
      provider: Let's Encrypt / ACM
      auto_renewal: true
      pinning: false # Use CT logs instead

  in_use:
    description: 'Sensitive data decrypted only in memory, never logged'
    pii_logging_prevention:
      - Structured log sanitizer strips PII fields
      - Salary, bank, ID fields replaced with [REDACTED]
      - Error stack traces scrubbed before shipping
```

### Session Security

```yaml
session_security:
  token_type: JWT (access) + Opaque (refresh)
  access_token_ttl: 15 minutes
  refresh_token_ttl: 7 days (sliding window)
  refresh_token_rotation: true        # New refresh token on each use
  refresh_token_reuse_detection: true # Revoke family on reuse
  concurrent_sessions: Configurable per tenant (default: 3)
  session_binding:
    - User agent fingerprint
    - IP range (optional, configurable)
  forced_logout:
    - On password change
    - On role/permission change
    - On admin-triggered revocation
    - On suspicious activity detection
```

### CSRF & Input Protection

```yaml
csrf_protection:
  method: Double-submit cookie + SameSite=Strict
  token_rotation: Per session
  applies_to: All state-changing requests (POST, PUT, DELETE, PATCH)

input_protection:
  xss:
    - CSP headers (strict, no inline scripts)
    - Output encoding on all rendered content
    - DOMPurify for user-generated rich text
  sql_injection:
    - Parameterized queries only (enforced by ORM)
    - No raw SQL in application code without review
  command_injection:
    - No shell execution from user input
    - Allowlist validation on file paths
  file_upload:
    - File type validation (magic bytes, not extension)
    - Antivirus scan before storage
    - Max file size: 25MB (configurable per tenant)
    - Stored in isolated blob storage (no server filesystem)
```

---

## ⚙️ CONFIGURATION SERVICE API

### Core Configuration APIs

```typescript
interface IConfigurationService {
  // Get configuration value
  async get<T>(
    key: string,
    module: string,
    defaultValue?: T,
    context?: ConfigContext
  ): Promise<T>;

  // Set configuration value
  async set<T>(
    key: string,
    module: string,
    value: T,
    context?: ConfigContext
  ): Promise<void>;

  // Get all configurations for a module
  async getModuleConfig(
    module: string,
    context?: ConfigContext
  ): Promise<ModuleConfig>;

  // Get list items (enum replacement)
  async getListItems(
    listType: string,
    context?: ConfigContext
  ): Promise<ListItem[]>;

  // Get translation
  async translate(
    key: string,
    language?: string,
    variables?: Record<string, any>
  ): Promise<string>;

  // Format currency
  async formatCurrency(
    amount: number,
    currencyCode?: string
  ): Promise<string>;

  // Format date
  async formatDate(
    date: Date,
    format?: string
  ): Promise<string>;
}

interface ConfigContext {
  tenantId: string;
  userId?: string;
  language?: string;
  currency?: string;
  timezone?: string;
  overrides?: Record<string, any>;
}
```

### Configuration Hierarchy

```yaml
hierarchy:
  1_system:
    description: 'Global system configurations'
    overridable: false

  2_tenant:
    description: 'Organization-level configurations'
    overridable: true

  3_module:
    description: 'Module-specific configurations'
    overridable: true

  4_role:
    description: 'Role-based configurations'
    overridable: true

  5_user:
    description: 'User preferences'
    overridable: true

resolution_order:
  - user
  - role
  - module
  - tenant
  - system
```

---

## 📦 DEPLOYMENT ARCHITECTURE

### Container Architecture

#### 1. Docker Configuration

```dockerfile
# Base configuration for all services
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Configuration service specific
FROM base AS config-service
COPY ./services/configuration .
RUN npm ci --only=production
EXPOSE 3001
CMD ["node", "index.js"]
```

#### 2. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configuration-service
  namespace: kreupai-hcm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: configuration-service
  template:
    metadata:
      labels:
        app: configuration-service
    spec:
      containers:
        - name: configuration-service
          image: kreupai/configuration-service:latest
          env:
            - name: TENANT_ID
              valueFrom:
                secretKeyRef:
                  name: tenant-config
                  key: tenant-id
          ports:
            - containerPort: 3001
          resources:
            requests:
              memory: '256Mi'
              cpu: '100m'
            limits:
              memory: '512Mi'
              cpu: '200m'
```

### Environment Configuration

#### 1. Environment Variables Structure

```bash
# System Level
SYSTEM_ENV=production
SYSTEM_REGION=ae-central-1
SYSTEM_VERSION=1.0.0

# Database
DB_HOST=postgres.kreupai.com
DB_PORT=5432
DB_NAME=kreupai_hcm
DB_POOL_SIZE=20

# Cache
REDIS_HOST=redis.kreupai.com
REDIS_PORT=6379
REDIS_TTL=3600

# Message Queue
RABBITMQ_HOST=rabbitmq.kreupai.com
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/kreupai

# AI Services
AI_SERVICE_URL=https://ai.kreupai.com
AI_MODEL_VERSION=gpt-4

# Storage
STORAGE_TYPE=s3
STORAGE_BUCKET=kreupai-documents
STORAGE_REGION=ae-central-1

# Feature Flags
FEATURE_AI_ENABLED=true
FEATURE_MOBILE_ENABLED=true
FEATURE_OFFLINE_MODE=true
```

---

## 📊 MONITORING & OBSERVABILITY

### Logging Architecture

```typescript
interface LogEntry {
  timestamp: string; // ISO 8601
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  tenantId: string;
  userId?: string;
  sessionId: string;
  requestId: string; // Unique per HTTP request
  traceId: string; // W3C TraceContext for distributed tracing
  spanId: string;
  module: string;
  action: string;
  message: string;
  duration_ms?: number; // For timed operations
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack: string;
    code: string;
    type: string;
  };
}

// Structured Logging (PII-safe)
logger.info({
  module: 'PAYROLL',
  action: 'PROCESS_SALARY',
  message: 'Salary processing started',
  metadata: {
    employeeCount: 1500,
    payrollMonth: '2024-01',
    currency: 'AED',
    // NEVER log: salary amounts, bank accounts, personal IDs
  },
});
```

### Log Shipping & Retention

```yaml
log_pipeline:
  collection: Pino (structured JSON)
  shipping: Fluentd / Vector
  storage: Elasticsearch / OpenSearch
  visualization: Kibana / Grafana Loki
  retention:
    application_logs: 90 days hot, 1 year cold
    audit_logs: 7 years (compliance requirement)
    access_logs: 2 years
    security_logs: 7 years (immutable storage)
```

### Metrics Collection

```yaml
metrics:
  tool: Prometheus + Grafana

  business:
    - payroll.processing.time
    - payroll.error.count
    - employee.onboarding.duration
    - leave.approval.sla
    - recruitment.time_to_hire
    - attendance.rate.daily
    - wps.submission.success_rate
    - gosi.compliance.rate

  technical:
    - api.response.time (histogram, per endpoint)
    - api.request.count (counter, per endpoint + status code)
    - database.query.duration (histogram)
    - database.connection.pool.utilization (gauge)
    - cache.hit.ratio (gauge)
    - cache.eviction.count (counter)
    - queue.depth (gauge, per queue)
    - queue.processing.time (histogram)

  infrastructure:
    - cpu.utilization (per pod)
    - memory.usage (per pod)
    - disk.io
    - network.throughput
    - kubernetes.pod.restart.count
```

---

## 🔄 DATA MIGRATION & VERSIONING

### Schema Versioning

```sql
CREATE TABLE schema_versions (
  version INT PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  script_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  executed_by VARCHAR(100)
);

-- Migration Script Naming
-- V{version}_{module}_{description}.sql
-- Example: V001_CORE_initial_setup.sql
```

### Configuration Versioning

```typescript
interface ConfigVersion {
  version: number;
  module: string;
  changes: ConfigChange[];
  appliedAt: Date;
  appliedBy: string;
  rollbackScript?: string;
}

interface ConfigChange {
  key: string;
  oldValue: any;
  newValue: any;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
}
```

---

## 🧪 TESTING STRATEGY

### Testing Pyramid

```yaml
testing_pyramid:
  unit_tests:
    coverage_target: 80%
    framework: Vitest
    scope:
      - Service methods
      - Utility functions
      - Business logic (hooks)
      - Validators / formatters
    patterns:
      - Arrange-Act-Assert
      - Test isolation (no shared state)
      - Mock external dependencies

  integration_tests:
    coverage_target: 70%
    framework: Vitest + Supertest
    scope:
      - API endpoint contracts
      - Service-to-database flows
      - Cross-service communication
      - Middleware chains (auth, tenant isolation, rate limiting)
    patterns:
      - Use test database per run (schema isolation)
      - Seed and teardown per test suite
      - Validate full request→response cycle

  e2e_tests:
    coverage_target: Critical paths 100%
    framework: Playwright
    scope:
      - Payroll processing (full run)
      - Leave request → approval → balance update
      - Employee onboarding → offboarding lifecycle
      - Recruitment pipeline (apply → offer)
      - Login → MFA → session → logout
    patterns:
      - Page Object Model
      - Visual regression snapshots
      - Cross-browser (Chrome, Firefox, Safari)
      - Mobile viewport testing

  security_tests:
    framework: OWASP ZAP + custom scripts
    scope:
      - SQL injection on all inputs
      - XSS on all rendered fields
      - CSRF token validation
      - Tenant isolation breach attempts
      - RBAC privilege escalation
      - JWT tampering / expiry
    cadence: Every release + quarterly pen test

  performance_tests:
    framework: k6 + Artillery
    scope:
      - API response time under load
      - Payroll batch processing (10K employees)
      - Concurrent user sessions (5K simultaneous)
      - Database query latency under load
    sla_targets:
      p50_response: 200ms
      p95_response: 500ms
      p99_response: 1000ms
      max_error_rate: 0.1%

  accessibility_tests:
    framework: axe-core + Lighthouse
    standard: WCAG 2.1 AA
    scope:
      - All form inputs (label association, error announcements)
      - Keyboard navigation (tab order, focus traps)
      - Screen reader compatibility
      - Color contrast ratios (4.5:1 minimum)
      - RTL layout validation
```

### Configuration Testing

```typescript
describe('Configuration Service', () => {
  it('should return tenant-specific configuration', async () => {
    const config = await configService.get('dateFormat', 'COMMON', 'DD/MM/YYYY', {
      tenantId: 'tenant-001',
    });
    expect(config).toBe('MM/DD/YYYY');
  });

  it('should handle RTL languages correctly', async () => {
    const translation = await configService.translate('welcome.message', 'ar-SA', { name: 'أحمد' });
    expect(translation).toContain('مرحباً');
  });

  it('should format currency based on configuration', async () => {
    const formatted = await configService.formatCurrency(1234.56, 'AED');
    expect(formatted).toBe('د.إ 1,234.56');
  });
});
```

### Test Data Management

```yaml
test_data:
  strategy: Factory pattern with Faker
  tenant_isolation: Each test suite gets isolated tenant
  pii_handling: Never use real employee data in tests
  seeding:
    - Use deterministic seeds for reproducibility
    - Factories for Employee, Payroll, Leave, Attendance
    - Country-specific fixtures (UAE, KSA, India)
  cleanup:
    - Transaction rollback per test (unit/integration)
    - Database reset per suite (E2E)
```

---

## 🛡️ DISASTER RECOVERY & BUSINESS CONTINUITY

### Recovery Objectives

```yaml
recovery_targets:
  RPO: 1 hour # Maximum data loss tolerance
  RTO: 4 hours # Maximum downtime tolerance
  MTTR: 2 hours # Mean time to repair

  tier_classification:
    tier_1_critical: # RPO: 0, RTO: 15 min
      - identity-service
      - payroll-service # Especially during payroll window
      - configuration-service
    tier_2_high: # RPO: 1h, RTO: 1h
      - employee-service
      - leave-service
      - attendance-service
      - workflow-service
    tier_3_standard: # RPO: 4h, RTO: 4h
      - analytics-service
      - ai-service
      - document-service
      - notification-service
```

### Multi-Region Deployment

```
Primary Region: UAE Central (ae-central-1)
DR Region:      UAE North (ae-north-1) or Bahrain

┌──────────────────────────────────────────────────────────────┐
│                    PRIMARY REGION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   AZ-1      │  │   AZ-2      │  │   AZ-3      │          │
│  │ App Nodes   │  │ App Nodes   │  │ App Nodes   │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                   │
│  ┌──────▼────────────────▼────────────────▼──────┐           │
│  │         PostgreSQL Primary (Synchronous)       │           │
│  └───────────────────┬───────────────────────────┘           │
│                      │ Streaming Replication                  │
└──────────────────────┼───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                    DR REGION                                   │
│  ┌───────────────────────────────────────────────┐           │
│  │         PostgreSQL Standby (Async Replica)     │           │
│  └───────────────────────────────────────────────┘           │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │ App Nodes   │  │ App Nodes   │  (warm standby)            │
│  │ (dormant)   │  │ (dormant)   │                            │
│  └─────────────┘  └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘
```

### Backup Strategy

```yaml
backups:
  postgresql:
    full_backup: Daily at 02:00 UTC
    incremental: Every 1 hour (WAL archiving)
    retention: 90 days
    storage: Cross-region encrypted S3/Blob
    testing: Monthly restore drill

  mongodb:
    method: mongodump with oplog
    frequency: Every 6 hours
    retention: 30 days

  redis:
    method: RDB snapshots + AOF
    frequency: Every 15 minutes
    note: Cache is reconstructible; backups are insurance

  blob_storage:
    method: Cross-region replication (automatic)
    versioning: Enabled (30-day retention)

  secrets:
    method: Vault snapshot
    frequency: Daily
    storage: Separate encrypted bucket

failover_procedure:
  automatic:
    - Database failover via Patroni/PgBouncer
    - DNS failover via Route53/Azure Traffic Manager (health-check based)
    - Redis Sentinel for cache failover
  manual:
    - Cross-region promotion (requires ops approval)
    - Data reconciliation check before promotion

  runbook: /docs/runbooks/disaster-recovery.md
  drill_cadence: Quarterly
```

---

## 🔒 DATA GOVERNANCE, PRIVACY & COMPLIANCE

### Data Classification

```yaml
data_classification:
  restricted:
    description: 'Highly sensitive PII requiring encryption + access logging'
    fields:
      - national_id / emirates_id / iqama_number
      - passport_number
      - bank_account_number / IBAN
      - salary_amount / compensation_details
      - medical_records / disability_status
      - biometric_data
      - tax_identification_numbers
    controls:
      - AES-256-GCM encryption at rest
      - Field-level encryption in database
      - Access logged to immutable audit trail
      - Data masking in non-production environments
      - Minimum 2 approvals for bulk export

  confidential:
    description: 'Sensitive business data with controlled access'
    fields:
      - employee_performance_ratings
      - disciplinary_records
      - grievance_details
      - succession_planning_data
      - salary_benchmarking_data
    controls:
      - Encrypted at rest (volume-level)
      - Role-based access only
      - Audit trail on read/write

  internal:
    description: 'Business data for authorized employees'
    fields:
      - employee_name / email / phone
      - department / job_title
      - leave_balances
      - attendance_records
    controls:
      - Tenant isolation enforced
      - Standard RBAC

  public:
    description: 'Non-sensitive data'
    fields:
      - company_name
      - office_locations
      - public_holiday_calendars
    controls:
      - No special encryption
      - Cache-friendly
```

### Privacy Regulations Compliance Matrix

```yaml
privacy_compliance:
  GDPR:
    applicability: EU employees / EU data subjects
    requirements:
      consent_management:
        - Granular consent per processing purpose
        - Consent withdrawal mechanism
        - Consent audit trail
      data_subject_rights:
        - Right to access (SAR response < 30 days)
        - Right to rectification
        - Right to erasure ("right to be forgotten")
        - Right to data portability (JSON/CSV export)
        - Right to restrict processing
      data_protection:
        - Data Protection Impact Assessment (DPIA) for new modules
        - Data Processing Agreements (DPA) with sub-processors
        - Breach notification within 72 hours
      technical:
        - Pseudonymization capability
        - Data minimization enforcement
        - Purpose limitation via access controls

  UAE_PDPL:
    applicability: UAE-based employees and data
    requirements:
      - Data localization (UAE data stays in UAE)
      - Consent for cross-border transfers
      - Data Protection Officer appointment
      - Personal data processing register

  KSA_PDPL:
    applicability: KSA-based employees and data
    requirements:
      - Data localization (KSA data stays in KSA)
      - Explicit consent for sensitive data
      - Cross-border transfer restrictions
      - Data breach notification to SDAIA

  compliance_frameworks:
    SOC_2_Type_II:
      controls:
        - Access control (CC6.1-CC6.8)
        - Change management (CC8.1)
        - Risk management (CC3.1-CC3.4)
        - Monitoring (CC7.1-CC7.4)
      audit_cadence: Annual

    ISO_27001:
      controls:
        - Information security policies
        - Asset management
        - Access control
        - Cryptography
        - Physical security
        - Operations security
        - Communications security
      certification_cadence: 3-year cycle with annual surveillance
```

### Data Retention & Purging

```sql
-- Retention policy configuration
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  data_category VARCHAR(50) NOT NULL,       -- 'employee_records', 'payroll_data', 'audit_logs'
  retention_period_months INT NOT NULL,      -- 84 = 7 years for financial
  purge_strategy VARCHAR(20) NOT NULL,       -- 'hard_delete', 'anonymize', 'archive'
  legal_basis TEXT,                          -- GDPR Article / UAE PDPL Section
  country_code VARCHAR(5),                   -- Country-specific retention
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, data_category, country_code)
);

-- Default retention periods
INSERT INTO data_retention_policies (tenant_id, data_category, retention_period_months, purge_strategy, legal_basis)
VALUES
  ('system', 'payroll_records',      84, 'archive',    'UAE Commercial Law Art. 26 - 7 years'),
  ('system', 'tax_records',         84, 'archive',    'Tax compliance - 7 years'),
  ('system', 'employee_records',    60, 'anonymize',  'Post-employment retention - 5 years'),
  ('system', 'audit_logs',         84, 'archive',    'SOC 2 / ISO 27001 - 7 years'),
  ('system', 'access_logs',        24, 'hard_delete', 'Security monitoring - 2 years'),
  ('system', 'recruitment_data',   24, 'anonymize',  'GDPR purpose limitation - 2 years'),
  ('system', 'biometric_data',      6, 'hard_delete', 'Data minimization - 6 months post-employment'),
  ('system', 'session_data',        3, 'hard_delete', 'Operational - 3 months');

-- Automated purge job (runs nightly)
-- Anonymization replaces PII with hashed/randomized values
-- Archive moves to cold storage (S3 Glacier / Azure Cool Tier)
```

---

## ⚡ EVENT-DRIVEN ARCHITECTURE

### Event Bus & Domain Events

```yaml
event_architecture:
  pattern: Event Sourcing + CQRS (where beneficial)
  transport: Apache Kafka (primary) / RabbitMQ (task queues)
  schema_registry: Confluent Schema Registry (Avro/JSON Schema)

  event_categories:
    domain_events:
      description: 'Business state changes'
      examples:
        - employee.hired
        - employee.terminated
        - employee.promoted
        - payroll.run.completed
        - payroll.run.failed
        - leave.requested
        - leave.approved
        - leave.rejected
        - attendance.clocked_in
        - attendance.anomaly_detected
        - benefits.enrollment.completed
        - performance.review.submitted

    integration_events:
      description: 'Cross-service communication'
      examples:
        - employee.profile.updated → payroll-service, leave-service, attendance-service
        - payroll.salary.changed → benefits-service (premium recalculation)
        - leave.approved → attendance-service (calendar sync)
        - recruitment.offer.accepted → onboarding-service (initiate)

    system_events:
      description: 'Infrastructure and operational events'
      examples:
        - config.changed
        - tenant.created
        - tenant.suspended
        - cache.invalidated
        - rate_limit.exceeded
```

### Event Schema Standard

```typescript
interface DomainEvent<T = any> {
  eventId: string; // UUID v7 (time-ordered)
  eventType: string; // 'employee.hired'
  aggregateType: string; // 'Employee'
  aggregateId: string; // Employee UUID
  tenantId: string;
  version: number; // Schema version
  timestamp: string; // ISO 8601
  causationId: string; // ID of the command that caused this
  correlationId: string; // Trace ID for distributed tracing
  actor: {
    userId: string;
    role: string;
    ipAddress: string;
  };
  payload: T;
  metadata: Record<string, any>;
}

// Example: Employee Hired Event
interface EmployeeHiredPayload {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  departmentId: string;
  designationId: string;
  joiningDate: string;
  employmentType: string;
  reportingManagerId: string;
}
```

### CQRS Pattern (Applied to Payroll & Analytics)

```
                    ┌─────────────────────────────────────────┐
                    │              API Gateway                  │
                    └───────────┬─────────────┬───────────────┘
                                │             │
                    ┌───────────▼───────┐  ┌──▼──────────────┐
                    │  Command Side     │  │  Query Side      │
                    │  (Write Model)    │  │  (Read Model)    │
                    │                   │  │                   │
                    │  - Payroll Run    │  │  - Payslip View  │
                    │  - Salary Change  │  │  - Analytics     │
                    │  - Tax Calc       │  │  - Reports       │
                    │  - Leave Request  │  │  - Dashboards    │
                    └───────────┬───────┘  └──▲──────────────┘
                                │             │
                    ┌───────────▼─────────────┤
                    │      Event Store        │
                    │   (Kafka / PostgreSQL)   │
                    └─────────────────────────┘

  Commands:  Validate → Execute → Emit Event → Acknowledge
  Queries:   Materialized views optimized for read patterns
  Sync:      Event consumers update read models asynchronously
```

### Saga Pattern (Distributed Transactions)

```typescript
// Payroll Processing Saga (orchestration-based)
interface PayrollProcessingSaga {
  steps: [
    {
      service: 'attendance-service';
      action: 'lock_attendance_period';
      compensate: 'unlock_attendance_period';
    },
    {
      service: 'leave-service';
      action: 'calculate_leave_deductions';
      compensate: 'revert_leave_deductions';
    },
    {
      service: 'payroll-service';
      action: 'calculate_gross_salary';
      compensate: 'void_calculations';
    },
    {
      service: 'payroll-service';
      action: 'apply_statutory_deductions';
      compensate: 'void_deductions';
    },
    { service: 'payroll-service'; action: 'generate_payslips'; compensate: 'void_payslips' },
    {
      service: 'compliance-service';
      action: 'validate_wps_compliance';
      compensate: 'log_compliance_skip';
    },
    { service: 'payment-service'; action: 'initiate_bank_transfer'; compensate: 'cancel_transfer' },
    { service: 'notification-service'; action: 'send_payslip_notifications'; compensate: 'noop' },
  ];
  timeout: '2 hours';
  retryPolicy: { maxRetries: 3; backoff: 'exponential' };
}
```

---

## 🔄 SERVICE RESILIENCE & FAULT TOLERANCE

### Circuit Breaker Pattern

```typescript
interface CircuitBreakerConfig {
  service: string;
  failureThreshold: number; // 5 failures
  successThreshold: number; // 3 successes to close
  timeout: number; // 30 seconds before half-open
  monitoringWindow: number; // 60 seconds sliding window
  fallback?: () => any; // Graceful degradation response
}

const circuitBreakers: Record<string, CircuitBreakerConfig> = {
  'wps-api': {
    service: 'UAE WPS External API',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000,
    monitoringWindow: 120000,
    fallback: () => ({ status: 'queued', message: 'WPS submission queued for retry' }),
  },
  'gosi-api': {
    service: 'KSA GOSI External API',
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 60000,
    monitoringWindow: 120000,
    fallback: () => ({ status: 'queued', message: 'GOSI submission queued for retry' }),
  },
  'ai-service': {
    service: 'AI/ML Prediction Service',
    failureThreshold: 5,
    successThreshold: 3,
    timeout: 30000,
    monitoringWindow: 60000,
    fallback: () => ({
      predictions: [],
      source: 'fallback',
      message: 'AI service temporarily unavailable',
    }),
  },
};
```

### Retry Policies

```yaml
retry_policies:
  default:
    max_retries: 3
    backoff: exponential
    initial_delay: 1s
    max_delay: 30s
    jitter: true
    retryable_errors:
      - 408 # Request Timeout
      - 429 # Too Many Requests
      - 502 # Bad Gateway
      - 503 # Service Unavailable
      - 504 # Gateway Timeout
    non_retryable_errors:
      - 400 # Bad Request
      - 401 # Unauthorized
      - 403 # Forbidden
      - 404 # Not Found
      - 409 # Conflict
      - 422 # Unprocessable Entity

  critical_operations:
    applies_to:
      - Payroll bank file submission
      - WPS file submission
      - GOSI contribution submission
    max_retries: 5
    backoff: exponential
    initial_delay: 5s
    max_delay: 300s
    dead_letter_queue: true
    alert_on_final_failure: true

  idempotency:
    description: 'All mutation APIs must be idempotent'
    implementation:
      - Client sends Idempotency-Key header (UUID)
      - Server stores key → response mapping in Redis (TTL: 24h)
      - Duplicate requests return cached response
```

### Health Checks

```yaml
health_checks:
  liveness:
    path: /health/live
    interval: 10s
    timeout: 5s
    failure_threshold: 3
    checks:
      - process_running
      - event_loop_not_blocked

  readiness:
    path: /health/ready
    interval: 15s
    timeout: 10s
    failure_threshold: 2
    checks:
      - database_connection
      - redis_connection
      - message_queue_connection
      - required_configs_loaded

  startup:
    path: /health/startup
    interval: 5s
    timeout: 30s
    failure_threshold: 30
    checks:
      - database_migrations_complete
      - cache_warmed
      - service_registered
```

---

## 🗄️ CACHING STRATEGY

### Multi-Layer Cache Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Browser Cache (CDN + Service Worker)               │
│  TTL: Static assets (365d), API responses (configurable)     │
└──────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: API Gateway Cache (Varnish / CloudFront)           │
│  TTL: Public endpoints (5 min), Tenant config (15 min)       │
└──────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Application Cache (Redis Cluster)                  │
│  TTL: Session (30 min), Config (1 hour), Lists (15 min)      │
└──────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────────────────────────────────────┐
│  Layer 4: Database Query Cache (PgBouncer + Prepared Stmts)  │
│  TTL: Connection pooling, prepared statement cache            │
└──────────────────────────────────────────────────────────────┘
```

### Cache Key Strategy

```typescript
// Cache key format: {tenant}:{service}:{entity}:{id}:{qualifier}
const cacheKeys = {
  // Configuration (long TTL - rarely changes)
  tenantConfig: (tenantId: string) => `${tenantId}:config:tenant:settings`,
  listItems: (tenantId: string, type: string) => `${tenantId}:config:list:${type}`,
  translations: (tenantId: string, lang: string, module: string) =>
    `${tenantId}:i18n:${lang}:${module}`,
  permissions: (userId: string) => `perms:user:${userId}`,

  // Business data (medium TTL - changes during business hours)
  employeeProfile: (tenantId: string, empId: string) => `${tenantId}:emp:profile:${empId}`,
  leaveBalance: (tenantId: string, empId: string) => `${tenantId}:leave:balance:${empId}`,
  orgChart: (tenantId: string) => `${tenantId}:org:chart`,

  // Volatile data (short TTL or no cache)
  attendanceToday: (tenantId: string, empId: string) => `${tenantId}:att:today:${empId}`,
  dashboardMetrics: (tenantId: string) => `${tenantId}:dashboard:metrics`,
};

// TTL configuration
const cacheTTL = {
  tenantConfig: 3600, // 1 hour
  listItems: 900, // 15 minutes
  translations: 3600, // 1 hour
  permissions: 300, // 5 minutes
  employeeProfile: 600, // 10 minutes
  leaveBalance: 300, // 5 minutes
  orgChart: 1800, // 30 minutes
  attendanceToday: 60, // 1 minute
  dashboardMetrics: 120, // 2 minutes
};
```

### Cache Invalidation

```yaml
invalidation_strategy:
  write_through:
    description: 'Update cache on write operations'
    applies_to:
      - Configuration changes
      - Permission changes
      - Employee profile updates

  event_driven:
    description: 'Invalidate via domain events'
    applies_to:
      - Leave balance (on leave.approved / leave.cancelled)
      - Attendance (on attendance.clocked_in / clocked_out)
      - Org chart (on employee.transferred / employee.terminated)

  ttl_expiry:
    description: 'Natural expiration for non-critical data'
    applies_to:
      - Dashboard metrics
      - Analytics summaries
      - Report caches

  stampede_protection:
    method: 'Probabilistic early expiration (XFetch)'
    description: 'Prevent thundering herd on cache expiry'
```

---

## 📡 REAL-TIME ARCHITECTURE

### WebSocket Architecture

```typescript
interface WebSocketConfig {
  transport: 'ws' | 'wss';
  heartbeat_interval: 30000; // 30 seconds
  reconnect_strategy: 'exponential_backoff';
  max_reconnect_attempts: 10;
  auth: 'jwt_token_in_handshake';
  rooms: 'tenant_id:user_id'; // Room isolation
}

// Real-time event channels
const channels = {
  // Per-user channels
  'user:{userId}:notifications': 'Personal notifications',
  'user:{userId}:approvals': 'Approval requests',
  'user:{userId}:chat': 'AI chatbot responses',

  // Per-tenant channels
  'tenant:{tenantId}:announcements': 'Company-wide announcements',
  'tenant:{tenantId}:attendance': 'Live attendance dashboard',

  // Per-department channels
  'dept:{deptId}:activity': 'Department activity feed',

  // Admin channels
  'admin:{tenantId}:payroll': 'Payroll processing progress',
  'admin:{tenantId}:compliance': 'Compliance alerts',
};
```

### Server-Sent Events (SSE) for Progress Tracking

```typescript
// Used for long-running operations
interface SSEEndpoints {
  '/sse/payroll/{runId}/progress': 'Payroll batch processing progress (0-100%)';
  '/sse/import/{jobId}/progress': 'Data import progress with row-level status';
  '/sse/report/{reportId}/progress': 'Report generation progress';
  '/sse/compliance/{submissionId}': 'WPS/GOSI submission status updates';
}
```

---

## 🔀 WORKFLOW ENGINE ARCHITECTURE

### Workflow Definition Standard

```yaml
workflow_engine:
  pattern: State Machine (finite states with defined transitions)
  storage: PostgreSQL (workflow definitions + instance state)
  execution: Event-driven with saga orchestration
  versioning: Each workflow definition is versioned; running instances complete on their original version

  capabilities:
    - Sequential and parallel task execution
    - Conditional branching (if/else, switch)
    - Timer-based escalation (SLA deadlines)
    - Human task assignment (approval steps)
    - Automatic task execution (API calls, calculations)
    - Sub-workflow invocation
    - Error handling with compensation
    - Delegation and reassignment
    - Bulk approval (batch processing)
```

### Workflow Schema

```typescript
interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  version: number;
  triggerType: 'manual' | 'event' | 'scheduled' | 'api';
  triggerEvent?: string; // e.g., 'leave.requested'
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  slaConfig?: SLAConfig;
  escalationRules?: EscalationRule[];
}

interface WorkflowState {
  id: string;
  name: string;
  type: 'start' | 'human_task' | 'auto_task' | 'condition' | 'parallel' | 'end';
  assignee?: AssigneeRule; // Role-based, manager, specific user
  formId?: string; // UI form for human tasks
  autoAction?: AutoActionConfig; // API call for auto tasks
  timeoutMinutes?: number;
  onTimeout?: 'escalate' | 'auto_approve' | 'reject';
}

interface EscalationRule {
  afterMinutes: number;
  action: 'notify_assignee' | 'notify_manager' | 'reassign' | 'auto_approve';
  notificationTemplate: string;
  reassignTo?: string; // Role or specific user
}

// Pre-built workflow templates for HCM
const HCM_WORKFLOWS = [
  'leave_approval', // Employee → Manager → HR (conditional on days)
  'expense_reimbursement', // Employee → Manager → Finance
  'payroll_approval', // Payroll Officer → Finance Manager → CFO
  'recruitment_pipeline', // Screening → Interview → Offer → Acceptance
  'onboarding_checklist', // IT → HR → Admin → Manager (parallel)
  'offboarding_clearance', // IT → Finance → HR → Admin (parallel)
  'salary_revision', // Manager → HR → Compensation Committee → CFO
  'grievance_resolution', // HR → Investigation → Committee → Resolution
  'travel_request', // Employee → Manager → Finance (budget check)
  'performance_review', // Self → Manager → Calibration → Finalize
];
```

---

## ⏱️ BATCH PROCESSING & JOB QUEUE ARCHITECTURE

### Job Queue Configuration

```yaml
job_queue:
  technology: BullMQ (Redis-backed) for application jobs
  dlq: Dead letter queue for failed jobs
  dashboard: Bull Board for monitoring

  queues:
    payroll_processing:
      concurrency: 1 # Sequential per tenant
      priority: critical
      attempts: 3
      backoff: exponential
      timeout: 7200000 # 2 hours
      cron: null # On-demand

    attendance_sync:
      concurrency: 5
      priority: high
      attempts: 3
      backoff: fixed_1min
      timeout: 300000 # 5 minutes
      cron: '*/15 * * * *' # Every 15 minutes

    leave_accrual:
      concurrency: 3
      priority: normal
      attempts: 3
      timeout: 1800000 # 30 minutes
      cron: '0 1 1 * *' # 1st of every month at 1 AM

    report_generation:
      concurrency: 3
      priority: low
      attempts: 2
      timeout: 600000 # 10 minutes
      cron: null # On-demand

    notification_digest:
      concurrency: 10
      priority: normal
      attempts: 5
      timeout: 60000 # 1 minute per batch
      cron: '0 8 * * 1-5' # Weekdays at 8 AM

    data_retention_purge:
      concurrency: 1
      priority: low
      attempts: 1
      timeout: 3600000 # 1 hour
      cron: '0 3 * * 0' # Sundays at 3 AM

    compliance_check:
      concurrency: 2
      priority: high
      attempts: 3
      timeout: 600000 # 10 minutes
      cron: '0 6 * * *' # Daily at 6 AM

    wps_submission:
      concurrency: 1
      priority: critical
      attempts: 5
      backoff: exponential
      timeout: 1800000 # 30 minutes
      cron: null # On-demand (triggered by payroll completion)
```

### Bulk Operations Pattern

```typescript
interface BulkOperationConfig {
  maxBatchSize: 1000;
  chunkSize: 100; // Process in chunks
  parallelChunks: 5;
  progressReporting: true; // SSE progress updates
  transactional: true; // Rollback on chunk failure
  auditTrail: true; // Log every record processed
}

// Bulk operations supported
const BULK_OPERATIONS = {
  'employee.import': { maxRecords: 10000, format: ['CSV', 'XLSX', 'JSON'] },
  'payroll.batch_process': { maxRecords: 50000, format: 'internal' },
  'attendance.bulk_import': { maxRecords: 100000, format: ['CSV', 'biometric_device'] },
  'leave.year_end_carryover': { maxRecords: 50000, format: 'internal' },
  'salary.bulk_revision': { maxRecords: 5000, format: ['CSV', 'XLSX'] },
  'benefits.open_enrollment': { maxRecords: 10000, format: 'internal' },
};
```

---

## 🖥️ FRONTEND ARCHITECTURE

### Application Structure

```
apps/web/src/
├── app/                          # Next.js 14 App Router
│   ├── (marketing)/              # Public pages (SSG)
│   ├── (auth)/                   # Authentication flows
│   └── dashboard/                # Protected SPA routes
│       ├── layout.tsx            # Authenticated layout shell
│       └── [module]/             # 46+ module routes
├── components/
│   ├── ui/                       # Design system primitives (Button, Card, Input, etc.)
│   ├── [module]/                 # Module-specific components
│   └── layouts/                  # Layout components
├── hooks/                        # Shared React hooks
├── services/                     # API client layer (service-per-module)
├── stores/                       # Zustand global state
├── lib/                          # Utilities, middleware, infrastructure
├── providers/                    # React context providers
├── types/                        # Shared TypeScript definitions
└── styles/                       # Global styles, Tailwind config
```

### State Management Strategy

```yaml
state_management:
  server_state:
    tool: TanStack Query (React Query)
    patterns:
      - All API data fetched via useQuery / useMutation
      - Automatic cache invalidation on mutations
      - Optimistic updates for user actions
      - Background refetching for stale data
      - Prefetching on hover for navigation

  client_state:
    tool: Zustand
    stores:
      - theme-store: Dark/light mode, density preference
      - user-preferences-store: Language, timezone, dashboard layout
      - notification-store: Unread count, toast queue
      - search-store: Global search state
      - dashboard-store: Widget configuration, layout
    patterns:
      - Minimal global state (prefer server state)
      - Persist to localStorage where needed
      - Selector-based subscriptions (no unnecessary rerenders)

  form_state:
    tool: React Hook Form + Zod
    patterns:
      - Schema-first validation (Zod schemas shared with backend)
      - Progressive validation (field-level on blur, form-level on submit)
      - Unsaved changes detection with browser prompt
      - Auto-save drafts for long forms

  url_state:
    tool: Next.js searchParams
    patterns:
      - Filters, pagination, sort encoded in URL
      - Shareable/bookmarkable views
      - Back/forward navigation preserves state
```

### Performance Optimization

```yaml
frontend_performance:
  code_splitting:
    - Route-based splitting (Next.js automatic)
    - Dynamic imports for heavy components (charts, rich text editors)
    - Lazy-load module pages on navigation

  rendering:
    - SSG for marketing pages
    - SSR for SEO-critical pages
    - CSR for dashboard (SPA behavior)
    - Streaming SSR for initial dashboard load

  bundle_optimization:
    - Tree shaking (automatic with Next.js)
    - Module federation for shared packages (future)
    - Image optimization via next/image
    - Font subsetting for Arabic + Latin

  data_loading:
    - Skeleton loaders (not spinners) for perceived performance
    - Infinite scroll for large lists (virtualized with react-window)
    - Pagination with cursor-based API
    - Prefetch next page on scroll near bottom

  accessibility_performance:
    - Reduced motion support (@media prefers-reduced-motion)
    - High contrast mode support
    - Focus management on route transitions
    - Announce loading/error states to screen readers
```

### Design System Standards

```yaml
design_system:
  framework: Tailwind CSS + Radix UI primitives
  theming:
    - CSS custom properties for runtime theme switching
    - Dark mode via class strategy (not media query)
    - RTL via dir attribute + logical properties (start/end, not left/right)
    - Density modes: comfortable, compact (configurable per user)

  component_standards:
    - All interactive components must be keyboard accessible
    - All form fields must have associated labels
    - All icons must have aria-label or aria-hidden
    - All color combinations must pass WCAG AA contrast (4.5:1)
    - All components must support RTL layout
    - All text must use translation keys (no hardcoded strings)

  responsive_breakpoints:
    sm: 640px
    md: 768px
    lg: 1024px
    xl: 1280px
    2xl: 1536px
```

---

## 🔗 INTEGRATION & WEBHOOK ARCHITECTURE

### Integration Framework

```yaml
integration_framework:
  connector_types:
    inbound:
      - REST API (primary)
      - GraphQL (optional)
      - Webhook receivers
      - File upload (SFTP, S3)
      - Biometric device SDKs

    outbound:
      - REST API calls
      - Webhook delivery
      - File generation (WPS SIF, GOSI, PF ECR)
      - Email/SMS/Push
      - Government portal submissions

  pre_built_connectors:
    erp:
      - SAP (RFC + IDoc)
      - Oracle ERP Cloud (REST)
      - Tally Prime (XML/JSON)
    accounting:
      - QuickBooks (OAuth2 REST)
      - Xero (OAuth2 REST)
      - Zoho Books (REST)
    biometric:
      - ZKTeco (SDK + Push)
      - Suprema BioStar (REST)
      - Hikvision (ISAPI)
    job_boards:
      - LinkedIn (Partner API)
      - Indeed (XML feed)
      - Bayt.com (API)
      - Naukri (API)
    government:
      - UAE WPS (API - Dec 2025+)
      - UAE MOHRE Portal
      - KSA GOSI (API)
      - KSA Mudad (API)
      - KSA Qiwa (API)
      - India EPFO (ECR file)
      - India ESIC (Challan)
    communication:
      - Slack (Events API)
      - Microsoft Teams (Bot Framework)
      - Google Workspace (Admin SDK)
```

### Webhook Delivery Architecture

```typescript
interface WebhookConfig {
  maxRetries: 5;
  retryBackoff: 'exponential'; // 1s, 2s, 4s, 8s, 16s
  timeout: 30000; // 30 seconds per attempt
  signatureAlgorithm: 'HMAC-SHA256';
  deliveryGuarantee: 'at-least-once';
  deadLetterQueue: true;
  batchDelivery: false; // One event per request
}

// Webhook event registration
interface WebhookSubscription {
  id: string;
  tenantId: string;
  url: string; // Customer's endpoint
  secret: string; // For HMAC signature verification
  events: string[]; // ['employee.hired', 'payroll.completed']
  isActive: boolean;
  headers?: Record<string, string>; // Custom headers
  createdAt: Date;
}

// Webhook delivery with signature
// Headers sent:
// X-Webhook-Id: {deliveryId}
// X-Webhook-Timestamp: {unixTimestamp}
// X-Webhook-Signature: HMAC-SHA256(secret, timestamp.body)
// X-Webhook-Event: {eventType}
```

### API Versioning Strategy

```yaml
api_versioning:
  strategy: URL path versioning (/v1/, /v2/)
  deprecation_policy:
    - Minimum 12 months notice before removing a version
    - Sunset header on deprecated endpoints
    - Migration guide published per version

  current_versions:
    v1: Stable (current)
    v2: Planning

  breaking_change_definition:
    breaking:
      - Removing a field from response
      - Changing field type
      - Removing an endpoint
      - Changing authentication method
    non_breaking:
      - Adding new fields to response
      - Adding new optional query parameters
      - Adding new endpoints
      - Adding new enum values
```

---

## 🏗️ DEVOPS & CI/CD ARCHITECTURE

### CI/CD Pipeline

```yaml
pipeline:
  trigger:
    - push to main → deploy to staging
    - pull request → run checks only
    - tag v*.*.* → deploy to production
    - manual → deploy to any environment

  stages:
    lint:
      parallel: true
      steps:
        - ESLint (TypeScript)
        - Prettier (formatting)
        - Stylelint (CSS)
        - commitlint (commit messages)
        - SAST scan (Semgrep / CodeQL)

    build:
      steps:
        - TypeScript compilation (strict mode)
        - Next.js build (all pages)
        - Docker image build
        - Image vulnerability scan (Trivy)

    test:
      parallel: true
      steps:
        - Unit tests (Vitest)
        - Integration tests (Vitest + test DB)
        - E2E tests (Playwright, parallelized)
        - Accessibility audit (axe-core)
        - Security scan (OWASP ZAP)
      coverage_gate:
        unit: 80%
        integration: 70%

    deploy_staging:
      steps:
        - Database migrations (forward-only, no destructive)
        - Kubernetes rolling update (zero downtime)
        - Smoke tests against staging
        - Performance baseline check

    deploy_production:
      approval: Required (manual gate)
      steps:
        - Blue-green deployment
        - Canary release (10% → 50% → 100%)
        - Database migrations
        - Health check verification
        - Rollback trigger: error rate > 1% or p95 latency > 2x baseline
```

### Infrastructure as Code

```yaml
iac:
  tool: Terraform (cloud resources) + Helm (Kubernetes)
  environments:
    development:
      cluster: 2 nodes, shared DB
      scaling: Manual
    staging:
      cluster: 3 nodes, dedicated DB
      scaling: Manual
    production:
      cluster: 6+ nodes, HA DB cluster
      scaling: HPA (Horizontal Pod Autoscaler)

  auto_scaling:
    hpa:
      min_replicas: 3
      max_replicas: 20
      cpu_target: 70%
      memory_target: 80%
      scale_up_stabilization: 60s
      scale_down_stabilization: 300s

    database:
      read_replicas: Auto-scale 1-5 based on query load
      connection_pool: PgBouncer (max 200 per service)
```

---

## 🔑 SECRETS MANAGEMENT

### Secrets Architecture

```yaml
secrets_management:
  provider: HashiCorp Vault / AWS Secrets Manager / Azure Key Vault

  secret_categories:
    infrastructure:
      - Database credentials
      - Redis passwords
      - Message queue credentials
      - API gateway keys

    application:
      - JWT signing keys (RSA-2048)
      - Encryption keys (AES-256)
      - OAuth client secrets
      - HMAC webhook secrets

    integration:
      - WPS API credentials
      - GOSI API credentials
      - Payment gateway keys
      - Email service API keys
      - SMS provider keys

  key_rotation:
    jwt_signing_key: 90 days (overlap period: 7 days)
    encryption_keys: 365 days (re-encrypt on rotation)
    database_passwords: 90 days (automated via Vault)
    api_keys: 180 days
    webhook_secrets: On customer request

  access_control:
    - Services only access their own secrets (least privilege)
    - Secrets injected via environment variables (not files)
    - No secrets in source code, CI/CD logs, or container images
    - Audit trail on all secret access
    - Emergency break-glass procedure documented
```

---

## 📈 SLA, SLO & SLI DEFINITIONS

### Service Level Objectives

```yaml
slo_definitions:
  availability:
    target: 99.9% # ~8.7 hours downtime per year
    measurement: Successful HTTP responses / Total requests
    exclusions:
      - Scheduled maintenance (max 4 hours/month, announced 72h ahead)
      - Force majeure events

  latency:
    api_p50: 200ms
    api_p95: 500ms
    api_p99: 1000ms
    page_load_p50: 1.5s
    page_load_p95: 3s
    measurement: End-to-end response time (gateway → service → database → response)

  error_rate:
    target: < 0.1%
    measurement: 5xx responses / Total requests (excluding client errors)

  data_durability:
    target: 99.999999999% # 11 nines
    measurement: No data loss events per year

  payroll_sla:
    processing_time: < 2 hours for 10,000 employees
    accuracy: 100% (zero calculation errors)
    availability_during_window: 99.99% (payroll processing days 1-15 of month)

sli_monitoring:
  tools:
    - Prometheus (metrics collection)
    - Grafana (dashboards & visualization)
    - PagerDuty / OpsGenie (alerting)
    - OpenTelemetry (distributed tracing)
    - Sentry (error tracking)

  alert_thresholds:
    warning:
      - Error rate > 0.05%
      - P95 latency > 800ms
      - CPU > 70%
      - Memory > 80%
      - Disk > 75%
    critical:
      - Error rate > 0.5%
      - P95 latency > 2000ms
      - CPU > 90%
      - Memory > 90%
      - Service unhealthy for > 2 minutes
      - Database replication lag > 30s
    page:
      - Service down > 5 minutes
      - Error rate > 1%
      - Database failover triggered
      - Security incident detected
```

---

## 📊 ENHANCED MONITORING & OBSERVABILITY

### Distributed Tracing

```yaml
distributed_tracing:
  standard: OpenTelemetry
  propagation: W3C TraceContext
  sampling:
    default: 10% # 10% of requests traced
    error: 100% # All errors fully traced
    slow_requests: 100% # Requests > P95 latency fully traced
    critical_paths: 100% # Payroll, compliance always traced

  trace_context:
    - traceId (W3C standard)
    - spanId
    - tenantId (custom attribute)
    - userId (custom attribute)
    - module (custom attribute)
```

### Business Metrics Dashboard

```yaml
business_metrics:
  hr_operations:
    - employee_count_by_status (active, on_leave, terminated)
    - new_hires_this_month
    - attrition_rate_rolling_12m
    - time_to_hire_average
    - offer_acceptance_rate

  payroll:
    - payroll_runs_this_month
    - total_disbursed_amount
    - average_processing_time
    - error_rate_per_run
    - wps_submission_success_rate
    - gosi_compliance_rate

  leave:
    - average_leave_balance_utilization
    - pending_approvals_count
    - leave_request_sla_breach_rate

  attendance:
    - average_attendance_rate
    - late_arrivals_percentage
    - overtime_hours_total
    - geofence_violation_count

  system:
    - active_users_now
    - api_calls_per_minute
    - cache_hit_ratio
    - database_connection_pool_utilization
    - queue_depth_by_queue
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Months 1-2)

- [ ] Set up configuration database schema
- [ ] Create configuration service with Redis caching
- [ ] Implement language pack system (8 languages, Arabic RTL)
- [ ] Set up list management (enum replacement)
- [ ] Create tenant isolation mechanism (schema-per-tenant + RLS)
- [ ] Set up secrets management (Vault / cloud KMS)
- [ ] Implement structured logging with correlation IDs
- [ ] Set up CI/CD pipeline (lint → build → test → deploy)

### Phase 2: Internationalization (Month 2-3)

- [ ] Implement translation service with lazy-loading per module
- [ ] Add RTL/LTR support with Tailwind logical properties
- [ ] Create currency formatting service (GCC + India currencies)
- [ ] Add date/time formatting (Gregorian + Hijri calendar)
- [ ] Implement number formatting per locale
- [ ] Complete Arabic translations for all 46 modules

### Phase 3: Security & Compliance (Months 3-4)

- [ ] Implement JWT with tenant/role/permission context
- [ ] Set up row-level security (PostgreSQL RLS policies)
- [ ] Add field-level encryption (AES-256-GCM for PII)
- [ ] Implement immutable audit logging
- [ ] Set up data classification enforcement
- [ ] Implement data retention and purging automation
- [ ] Configure GDPR/UAE PDPL/KSA PDPL compliance controls
- [ ] Set up SOC 2 control evidence collection
- [ ] Implement rate limiting and DDoS protection

### Phase 4: API Layer (Months 4-5)

- [ ] Create REST API structure with OpenAPI 3.0 specs
- [ ] Add GraphQL support for complex query use cases
- [ ] Implement API versioning (URL path strategy)
- [ ] Add distributed rate limiting (Redis-backed)
- [ ] Implement idempotency for all mutation endpoints
- [ ] Set up webhook delivery system with HMAC signing
- [ ] Create API key management for third-party integrations

### Phase 5: Event Architecture & Resilience (Months 5-6)

- [ ] Set up Kafka/RabbitMQ event bus
- [ ] Implement domain event publishing for all modules
- [ ] Create saga orchestrator for distributed transactions
- [ ] Implement circuit breakers for external APIs
- [ ] Set up retry policies with dead letter queues
- [ ] Create CQRS read models for analytics/reports

### Phase 6: Workflow & Batch Processing (Month 6-7)

- [ ] Build workflow engine (state machine pattern)
- [ ] Create pre-built HCM workflow templates (10+ workflows)
- [ ] Implement job queue system (BullMQ)
- [ ] Set up batch processing for payroll (10K+ employees)
- [ ] Implement bulk import/export capabilities
- [ ] Create progress tracking via SSE

### Phase 7: Frontend Architecture (Months 7-8)

- [ ] Migrate API calls to TanStack Query (React Query)
- [ ] Implement skeleton loaders and optimistic updates
- [ ] Add virtual scrolling for large lists
- [ ] Implement service worker for offline capabilities
- [ ] Add WCAG 2.1 AA compliance across all components
- [ ] Complete dark mode and RTL support end-to-end

### Phase 8: Deployment & Operations (Months 8-9)

- [ ] Create Docker containers for all services
- [ ] Set up Kubernetes configs with HPA auto-scaling
- [ ] Implement health checks (liveness, readiness, startup)
- [ ] Set up distributed tracing (OpenTelemetry)
- [ ] Configure Prometheus + Grafana dashboards
- [ ] Set up alerting (PagerDuty/OpsGenie)
- [ ] Implement blue-green deployment pipeline
- [ ] Create DR runbooks and conduct failover drill

### Phase 9: Disaster Recovery & Scale (Months 9-10)

- [ ] Set up cross-region database replication
- [ ] Implement automated backup verification
- [ ] Configure multi-AZ Kubernetes deployment
- [ ] Set up PgBouncer connection pooling
- [ ] Conduct load testing (5K concurrent users)
- [ ] Validate SLA/SLO targets under load
- [ ] Document and drill DR failover procedure

---

## 📚 REFERENCE IMPLEMENTATION

### Sample Configuration Service Implementation

```typescript
// configuration.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ConfigMaster } from './entities/config-master.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(ConfigMaster)
    private configRepo: Repository<ConfigMaster>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async get<T>(key: string, module: string, defaultValue?: T, context?: ConfigContext): Promise<T> {
    // Check cache first
    const cacheKey = `${context?.tenantId}:${module}:${key}`;
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) return cached;

    // Query database with hierarchy
    const configs = await this.configRepo
      .createQueryBuilder('config')
      .where('config.tenant_id = :tenantId', {
        tenantId: context?.tenantId,
      })
      .andWhere('config.module_code = :module', { module })
      .andWhere('config.config_key = :key', { key })
      .andWhere('config.effective_from <= NOW()')
      .andWhere('(config.effective_to IS NULL OR config.effective_to > NOW())')
      .orderBy('config.created_at', 'DESC')
      .getOne();

    const value = configs?.config_value || defaultValue;

    // Cache the result
    await this.cacheManager.set(cacheKey, value, 3600);

    return value;
  }

  async getListItems(listType: string, context?: ConfigContext): Promise<ListItem[]> {
    const query = `
      SELECT 
        lm.*,
        lp.translation_value as display_name
      FROM list_master lm
      LEFT JOIN language_packs lp ON 
        lp.translation_key = lm.attributes->>'name_key'
        AND lp.language_code = $1
        AND lp.tenant_id = $2
      WHERE 
        lm.tenant_id = $2
        AND lm.list_type = $3
        AND lm.is_active = true
        AND (lm.effective_from <= CURRENT_DATE)
        AND (lm.effective_to IS NULL OR lm.effective_to > CURRENT_DATE)
      ORDER BY lm.display_order, lm.list_code
    `;

    const results = await this.configRepo.query(query, [
      context?.language || 'en-US',
      context?.tenantId,
      listType,
    ]);

    return results.map((r) => ({
      code: r.list_code,
      name: r.display_name || r.list_code,
      attributes: r.attributes,
      parentCode: r.parent_code,
    }));
  }

  async formatCurrency(
    amount: number,
    currencyCode?: string,
    context?: ConfigContext
  ): Promise<string> {
    const currency = currencyCode || context?.currency || 'USD';
    const config = await this.get<CurrencyConfig>('CURRENCY_CONFIG', 'FINANCE', null, context);

    // Apply formatting based on configuration
    const formatter = new CurrencyFormatter(config[currency]);
    return formatter.format(amount);
  }
}
```

---

## 🎯 SUCCESS CRITERIA

### A properly configured system will:

**Functional Requirements:**

1. **Never have hardcoded values** - Everything comes from configuration
2. **Support unlimited languages** - Including RTL languages seamlessly
3. **Handle any currency** - With proper formatting and precision
4. **Scale to thousands of tenants** - With complete data isolation
5. **Allow runtime configuration changes** - Without code deployment
6. **Provide complete audit trail** - Every change tracked and immutable
7. **Support offline operation** - Configuration and critical data cached locally
8. **Enable A/B testing** - Through feature flags
9. **Maintain backward compatibility** - Through API versioning with 12-month deprecation

**Non-Functional Requirements (Enterprise):** 10. **Availability: 99.9%** - Less than 8.7 hours unplanned downtime per year 11. **API Latency: P95 < 500ms** - Sub-second response times under load 12. **Payroll Processing: < 2 hours** - For 10,000 employees end-to-end 13. **Recovery: RPO 1h / RTO 4h** - Data loss and downtime tolerance 14. **Security: Zero data breaches** - SOC 2 Type II and ISO 27001 compliant 15. **Compliance: 100% statutory accuracy** - WPS, GOSI, EPF/ESI/TDS calculations verified 16. **Accessibility: WCAG 2.1 AA** - All interfaces usable with assistive technology 17. **Scalability: 5,000 concurrent users** - Without degradation in performance 18. **Data Durability: 11 nines** - No data loss under any failure scenario 19. **Deployment: Zero-downtime** - Blue-green with automated rollback on error rate spike 20. **Test Coverage: 80% unit, 70% integration** - All critical paths covered by E2E tests

---

## 🏢 MULTI-ENTITY & LEGAL ENTITY ARCHITECTURE

### Entity Hierarchy

```yaml
multi_entity:
  description: 'Support holding companies with multiple legal entities across jurisdictions'

  hierarchy:
    - holding_company: # KreupAI Group
        - legal_entity: # KreupAI LLC (UAE)
            - branch: Dubai HQ
            - branch: Abu Dhabi Office
        - legal_entity: # KreupAI Pvt Ltd (India)
            - branch: Bangalore
            - branch: Mumbai
        - legal_entity: # KreupAI Ltd (UK)
            - branch: London

  data_model:
    legal_entity:
      fields:
        - id, tenant_id, parent_entity_id
        - name, registration_number, tax_id
        - jurisdiction_country, jurisdiction_state
        - currency_code, fiscal_year_start
        - payroll_calendar, statutory_config
      constraints:
        - Each employee belongs to exactly one legal entity
        - Payroll runs per legal entity (different tax regimes)
        - Statutory reports generated per legal entity
        - Consolidated reporting across entities

  inter_company_transfer:
    description: 'Transfer employee between legal entities'
    steps:
      - Initiate transfer (source entity manager)
      - Approval (source HR → destination HR)
      - Full & Final settlement in source entity
      - New employment record in destination entity
      - Benefits re-enrollment in destination entity
      - Asset transfer/return
    data_handling:
      - Employee gets new employee_id in destination entity
      - Employment history links across entities via global_employee_id
      - Compensation recalculated per destination entity pay structure
```

### Consolidated Reporting

```sql
-- Cross-entity reporting view
CREATE VIEW consolidated_headcount AS
SELECT
  le.name AS legal_entity,
  le.jurisdiction_country,
  COUNT(e.id) AS headcount,
  SUM(CASE WHEN e.employment_type = 'FTE' THEN 1 ELSE 0 END) AS fte_count,
  SUM(e.annual_ctc) AS total_labor_cost
FROM employees e
JOIN legal_entities le ON e.legal_entity_id = le.id
WHERE e.tenant_id = current_setting('app.tenant_id')::UUID
  AND e.status = 'ACTIVE'
GROUP BY le.id, le.name, le.jurisdiction_country;
```

---

## 🗂️ POSITION CONTROL & ORG MANAGEMENT ARCHITECTURE

### Position Management Model

```yaml
position_control:
  description: 'Positions exist independently of people. People fill positions.'

  lifecycle:
    - BUDGETED → APPROVED → OPEN → FILLED → FROZEN → CLOSED

  data_model:
    position:
      fields:
        - id, tenant_id, legal_entity_id
        - position_code, title, grade_band
        - department_id, cost_center_id
        - reports_to_position_id # Org chart is position-based, not person-based
        - filled_by_employee_id # NULL when vacant
        - budget_amount, currency
        - status: budgeted | approved | open | filled | frozen | closed
        - headcount: 1 # Some positions allow multiple incumbents
        - effective_from, effective_to
      constraints:
        - Position must be APPROVED before recruitment can start
        - Position must have budget allocation
        - Freezing a position blocks all recruitment requisitions
        - Closing a position requires zero incumbents

  headcount_budget:
    workflow: Department head → Finance review → CHRO approval
    tracking:
      - Budgeted headcount per department per fiscal year
      - Actual headcount vs budget variance
      - Vacancy rate and time-to-fill per position
      - Cost per position (budgeted vs actual)
```

---

## 📜 VISA & IMMIGRATION MANAGEMENT ARCHITECTURE

> Critical for MENA operations — every GCC employee (except nationals) requires valid visa and work permit

### Immigration Data Model

```yaml
immigration:
  visa:
    fields:
      - id, tenant_id, employee_id
      - visa_type: employment | visit | transit | investor | golden
      - visa_number, unified_number (UAE)
      - issuing_authority: MOHRE | GDRFA | MOI
      - issue_date, expiry_date
      - status: applied | issued | active | renewal_pending | expired | cancelled
      - sponsor_entity_id (legal entity that sponsors the visa)

  work_permit:
    fields:
      - id, tenant_id, employee_id
      - permit_number, permit_type
      - issue_date, expiry_date
      - job_title_on_permit # Must match employment contract
      - status: active | expired | cancelled

  document_tracking:
    tracked_documents:
      - Passport (expiry tracking)
      - Emirates ID / Iqama (expiry tracking)
      - Work permit / labor card
      - Entry visa
      - Medical fitness certificate
      - Good conduct certificate

    alert_schedule:
      - 90 days before expiry: Notification to HR + PRO
      - 60 days before expiry: Escalation to HR manager
      - 30 days before expiry: Critical alert to CHRO
      - On expiry: Auto-flag employee as non-compliant

  pro_task_management:
    description: 'PRO (Public Relations Officer) manages government submissions'
    task_types:
      - visa_application
      - visa_renewal
      - labor_card_renewal
      - emirates_id_renewal
      - medical_fitness_test
      - establishment_card_renewal
    workflow: HR creates task → PRO picks up → PRO processes at government office → PRO updates status
```

---

## 💰 ADVANCED PAYROLL ARCHITECTURE

### Multi-Component Salary Structure

```yaml
salary_architecture:
  description: 'Enterprise payroll requires configurable salary structures with multiple components'

  salary_structure:
    name: 'India Standard CTC Structure'
    components:
      - code: BASIC
        name_key: salary.component.basic
        type: earning
        calculation: percentage_of_ctc # 40-50% of CTC
        percentage: 40
        taxable: true
        statutory_ceiling: null

      - code: HRA
        name_key: salary.component.hra
        type: earning
        calculation: percentage_of_basic # 50% of basic (metro) / 40% (non-metro)
        percentage: 50
        taxable: true # Partially exempt under Section 10(13A)
        exemption_rule: HRA_EXEMPTION_CALC

      - code: DA
        name_key: salary.component.da
        type: earning
        calculation: percentage_of_basic
        percentage: 10
        taxable: true

      - code: SPECIAL_ALLOWANCE
        name_key: salary.component.special_allowance
        type: earning
        calculation: balance_of_ctc # CTC minus all other components
        taxable: true

      - code: EPF_EMPLOYEE
        name_key: salary.component.epf_employee
        type: deduction
        calculation: percentage_of_basic_plus_da
        percentage: 12
        statutory: true
        ceiling: 15000 # PF ceiling on basic

      - code: EPF_EMPLOYER
        name_key: salary.component.epf_employer
        type: employer_contribution
        calculation: percentage_of_basic_plus_da
        percentage: 12
        statutory: true

      - code: ESI_EMPLOYEE
        name_key: salary.component.esi_employee
        type: deduction
        calculation: percentage_of_gross
        percentage: 0.75
        statutory: true
        applicability_ceiling: 21000 # ESI only if gross <= 21000

  full_final_settlement:
    components:
      - unpaid_salary: 'Pro-rated salary to last working day'
      - leave_encashment: 'Earned leave balance × daily gross rate'
      - eosb_gratuity: 'Per jurisdiction calculation (UAE: 21/30 days, India: 15 days per year)'
      - bonus_prorata: 'Target bonus × (months served / 12)'
      - notice_recovery: 'If notice period not served, deduct notice period salary'
      - loan_recovery: 'Outstanding loan/advance balance'
      - asset_recovery: 'Unreturned asset value'
      - reimbursements: 'Pending approved reimbursements'
      - tax_computation: 'Final tax calculation on all F&F components'

    workflow:
      - HR initiates F&F calculation
      - System auto-calculates all components
      - HR reviews and adjusts if needed
      - Finance approves F&F amount
      - Payroll processes F&F payment
      - Tax documents generated (Form 16 Part B in India)

  gl_posting:
    description: 'Every payroll run generates double-entry journal entries'
    journal_template:
      debit:
        - Salary Expense (per department cost center)
        - Employer PF Contribution Expense
        - Employer ESI Contribution Expense
        - EOSB Provision Expense
      credit:
        - Salary Payable (net pay to bank)
        - TDS Payable (tax to government)
        - PF Payable (to PF trust)
        - ESI Payable (to ESI corporation)
        - Professional Tax Payable (to state government)
        - Loan Recovery (against loan ledger)

    integration_targets:
      - QuickBooks Online (REST API)
      - Xero (OAuth 2.0 API)
      - SAP FI (IDoc/RFC)
      - Oracle Financials (REST API)
      - Tally (XML import)
      - Custom ERP (configurable webhook with GL data)
```

---

## 📊 EMPLOYEE ENGAGEMENT ARCHITECTURE

### Survey & Engagement Engine

```yaml
engagement_architecture:
  pulse_surveys:
    description: 'Configurable survey engine with anonymity guarantees'
    features:
      - Drag-drop survey builder with question bank
      - Question types: Likert scale, NPS, open text, multiple choice, matrix
      - Anonymous responses (k-anonymity: min 5 responses per group before showing results)
      - Scheduled distribution (weekly/bi-weekly/monthly)
      - Smart targeting (by department, location, tenure band)
      - Trend analysis over time
      - Benchmark against industry data

    anonymity_guarantee:
      - Responses stored without employee_id when anonymous=true
      - Demographic aggregation only shown when group size >= 5
      - No individual response attribution possible
      - Audit log records survey creation/distribution only (not individual responses)

  enps_tracking:
    calculation: '% Promoters (9-10) - % Detractors (0-6)'
    frequency: Monthly or quarterly (configurable)
    benchmarks:
      excellent: '> 50'
      good: '30-50'
      needs_improvement: '10-30'
      critical: '< 10'

  engagement_drivers:
    analysis_dimensions:
      - Manager relationship (skip-level correlation)
      - Growth opportunity (training hours, promotion rate)
      - Compensation satisfaction (vs market benchmark)
      - Work-life balance (overtime hours, leave utilization)
      - Culture alignment (values recognition frequency)
      - Tools & environment (IT satisfaction)

    action_planning:
      - Auto-generate improvement suggestions per driver
      - Track action plan completion by department
      - Correlate engagement score changes with actions taken
```

---

## 🔄 EXIT MANAGEMENT & LIFECYCLE ARCHITECTURE

### Employee Exit Process

```yaml
exit_architecture:
  trigger_types:
    - voluntary_resignation: Employee initiates
    - involuntary_termination: HR/Management initiates
    - retirement: Auto-triggered at retirement age
    - contract_expiry: Auto-triggered for fixed-term contracts
    - mutual_separation: Negotiated exit
    - death_in_service: Special handling with nominee

  exit_workflow:
    1_initiation:
      - Employee submits resignation (self-service) OR HR initiates termination
      - Notice period calculated per employment contract
      - Last working day determined (LWD)
      - Manager notified

    2_clearance:
      parallel_tracks:
        - IT_clearance: Revoke email, VPN, system access, collect laptop/devices
        - Finance_clearance: Settle advances, travel claims, credit card
        - Admin_clearance: Collect ID badge, parking card, office keys
        - Manager_clearance: Knowledge transfer sign-off, handover completion
        - HR_clearance: Benefits termination, exit interview, F&F calculation

    3_settlement:
      - Calculate full & final settlement
      - Generate settlement statement
      - Finance approves payment
      - Process final payroll
      - Generate tax documents (Form 16, etc.)
      - Transfer EOSB/gratuity

    4_post_exit:
      - Archive employee data per retention policy
      - Update org chart / position status
      - Update headcount reports
      - Send exit survey (30 days after departure)
      - Mark rehire eligibility status
      - Generate experience/relieving letter

  rehire_policy:
    eligibility_check:
      - Previous exit reason (voluntary = eligible, termination for cause = ineligible)
      - Performance ratings during previous tenure
      - Manager recommendation
      - Cooling off period (configurable: 6 months default)
    data_handling:
      - Link new employee record to previous via global_employee_id
      - Carry forward relevant data (skills, certifications)
      - Reset leave balances, benefits enrollment
      - New probation period applies
```

---

## 📱 ENTERPRISE MOBILE ARCHITECTURE

### Mobile Technology Stack

```yaml
mobile_stack:
  framework: React Native 0.73 + Expo 50 (managed)
  language: TypeScript 5.3
  state_management: Zustand (client) + TanStack Query (server)
  navigation: React Navigation 6 (native-stack + bottom-tabs)
  http: Axios with interceptors (token refresh, offline queue)
  storage: AsyncStorage (general) + SecureStore (credentials/tokens)
  i18n: i18next + react-i18next (en, ar, hi — RTL support)
  testing: Jest + jest-expo + Detox (E2E)
  crash_reporting: Sentry / Firebase Crashlytics
  analytics: Expo Analytics / Firebase Analytics (privacy-compliant)
  ci_cd: EAS Build + EAS Submit (App Store + Play Store)
```

### Mobile Navigation Architecture

```
RootNavigator (conditional on auth state)
├── AuthNavigator (unauthenticated)
│   ├── LoginScreen
│   ├── ForgotPasswordScreen
│   └── BiometricScreen
│
└── MainNavigator (authenticated — Bottom Tab Navigator)
    ├── Dashboard Stack
    │   ├── DashboardHome (role-based widgets)
    │   ├── Notifications
    │   └── Announcements
    ├── Attendance Stack
    │   ├── AttendanceHome (clock in/out with GPS)
    │   ├── AttendanceHistory
    │   ├── CheckIn (camera + location)
    │   └── ShiftSchedule (shift workers)
    ├── Requests Stack
    │   ├── RequestHub (all request types)
    │   ├── ApplyLeave
    │   ├── ExpenseSubmit (receipt camera)
    │   ├── OvertimeRequest
    │   ├── CompOffRequest
    │   ├── LoanRequest
    │   └── Resignation
    ├── Approvals Stack (manager role)
    │   ├── ApprovalCenter (unified multi-type)
    │   ├── ApprovalDetail
    │   ├── TeamDashboard
    │   ├── TeamAttendance
    │   └── TeamLeaveCalendar
    └── More Stack
        ├── Profile
        ├── Payroll (payslips, tax docs)
        ├── Documents (vault, downloads)
        ├── Benefits
        ├── Learning (courses, quizzes)
        ├── Recognition Wall
        ├── Surveys
        ├── Visa Status (MENA)
        └── Settings
```

### Mobile Security Architecture

```yaml
mobile_security:
  authentication:
    primary: Email/password with MFA
    biometric: expo-local-authentication (Face ID, Touch ID, fingerprint)
    session: JWT access token (15 min) + refresh token (7 days)
    pin_lock: Secondary 6-digit PIN for re-authentication
    inactivity_timeout: Configurable (default: 5 minutes → lock screen)

  data_protection:
    secure_storage: Expo SecureStore for tokens and sensitive data (Keychain/Keystore)
    screenshot_prevention: FLAG_SECURE on Android, screenshot block on iOS (payslip, salary screens)
    clipboard_security: Auto-clear clipboard after 60 seconds for sensitive data copies
    root_jailbreak_detection: Warn user on compromised devices, block if tenant policy requires

  network_security:
    certificate_pinning: Pin API server certificates (prevent MITM)
    transport: TLS 1.3 only
    offline_encryption: Offline cached data encrypted at rest with device key

  compliance:
    mdm_support: Compatible with Microsoft Intune, VMware Workspace ONE, MobileIron
    app_config: Support managed app configuration (MDM-pushed tenant URL, settings)
    remote_wipe: API endpoint to invalidate all mobile sessions for an employee
```

### Mobile Offline Architecture

```yaml
offline_strategy:
  pattern: 'Offline-first for reads, queue for writes'

  read_cache:
    dashboard_data: Cached with 5-minute TTL
    leave_balance: Cached, invalidated on leave action
    payslip_history: Cached indefinitely until new payslip
    employee_directory: Cached with 1-hour TTL
    shift_schedule: Cached with 30-minute TTL

  write_queue:
    mechanism: AsyncStorage-backed FIFO queue
    supported_actions:
      - clock_in / clock_out (with GPS coordinates)
      - leave_request
      - expense_submission
      - feedback_submission
      - approval_action (approve/reject)
      - overtime_request
    sync_trigger:
      - Network restored (NetInfo listener)
      - App comes to foreground
      - Manual pull-to-refresh
      - Background sync (expo-background-fetch, every 15 minutes)
    conflict_resolution: Last-write-wins with user notification
    retry_policy: 3 attempts with exponential backoff, then alert user

  storage_limits:
    max_offline_queue: 100 actions
    max_cache_size: 50MB
    cache_eviction: LRU (least recently used)
```

### Mobile Performance Targets

```yaml
performance_sla:
  app_startup: < 2 seconds (cold start)
  screen_transition: < 300ms
  list_scroll: 60 fps (virtualized lists for 1000+ items)
  api_call_timeout: 10 seconds (show cached data after 3 seconds)
  image_loading: Progressive loading with blur placeholder
  bundle_size: < 50MB (app download size)
  memory_usage: < 200MB peak
  battery_impact: < 5% per hour of active use
```

---

## 🏗️ ENTERPRISE BACKEND PLATFORM ARCHITECTURE

### Backend Inventory (Audited Feb 2026)

```
┌──────────────────────────────────────────────────────┐
│             AURAOS BACKEND PLATFORM                  │
├──────────────────────────────────────────────────────┤
│  API Routes:        656 endpoints (REST + GraphQL)   │
│  Prisma Models:     207 across 4 schema files        │
│  Service Files:     170+ across 25+ categories       │
│  Middleware:        17 components                     │
│  Auth Modules:      13 files                         │
│  Microservices:     10 independent services          │
│  Monitoring:        7 modules (Sentry, APM, etc.)    │
│  Queue Workers:     6 BullMQ workers                 │
│  Background Jobs:   10 scheduled jobs                │
│  Seed Files:        42 production seed datasets      │
│  Migrations:        6 migration sets                 │
└──────────────────────────────────────────────────────┘
```

### Bulk Operations Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 BULK OPERATION PIPELINE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Upload   │───▶│  Parse   │───▶│    Validate      │  │
│  │ CSV/Excel │    │ Stream   │    │ (Row-Level Rules) │  │
│  └──────────┘    └──────────┘    └──────────────────┘  │
│                                          │              │
│                                          ▼              │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Report   │◀──│  Upsert  │◀──│   Transform      │  │
│  │ (Errors)  │    │ (Batch)  │    │ (Field Mapping)  │  │
│  └──────────┘    └──────────┘    └──────────────────┘  │
│                                                         │
│  Encoding: UTF-8, Windows-1256 (Arabic), UTF-16        │
│  Batch Size: 1000 rows per transaction                  │
│  Rollback: Full operation reversal with audit trail     │
│  Status: WebSocket progress updates to client           │
└─────────────────────────────────────────────────────────┘
```

### Enterprise Search Architecture

```
┌─────────────────────────────────────────────────────────┐
│              SEARCH INFRASTRUCTURE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌───────────────────────┐    │
│  │  Prisma Hook  │────────▶│  Search Engine         │    │
│  │  (on change)  │         │  (Meilisearch/ES)      │    │
│  └──────────────┘         └───────────────────────┘    │
│                                    │                    │
│  Indexes:                          │                    │
│  ├── employees (name, ID, dept)    │                    │
│  ├── documents (full-text + OCR)   │                    │
│  ├── policies (title, content)     │                    │
│  └── tickets (subject, body)       │                    │
│                                    ▼                    │
│  Features:                  ┌──────────────┐           │
│  ├── Fuzzy matching         │   Faceted    │           │
│  ├── Phonetic (Arabic/Hindi)│   Results    │           │
│  ├── Synonym expansion      └──────────────┘           │
│  ├── Saved filters                                     │
│  └── Search analytics                                  │
└─────────────────────────────────────────────────────────┘
```

### Report Generation Architecture

```
┌─────────────────────────────────────────────────────────┐
│              REPORT ENGINE                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Client Request                                         │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Queue    │───▶│  Template    │───▶│  Renderer    │  │
│  │ (BullMQ)  │    │  Engine      │    │ PDF / Excel  │  │
│  └──────────┘    └──────────────┘    └──────────────┘  │
│       │                                       │         │
│       │  WebSocket                            ▼         │
│       │  Progress      ┌──────────────────────────┐    │
│       └───────────────▶│  Storage (S3/Azure/GCS)  │    │
│                        │  Signed URL (5min expiry) │    │
│                        └──────────────────────────┘    │
│                                                         │
│  Scheduling: Cron-based (daily/weekly/monthly)          │
│  Access: Per-role, per-entity visibility                │
│  Formats: PDF (branded), Excel (pivot), CSV             │
│  Scale: 100K+ rows async generation                     │
└─────────────────────────────────────────────────────────┘
```

### Notification Orchestration Architecture

```
┌─────────────────────────────────────────────────────────┐
│           NOTIFICATION ORCHESTRATION                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Event Trigger (leave.approved, payroll.processed)      │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────┐    ┌──────────────────────────┐      │
│  │  Preference   │───▶│   Channel Router          │      │
│  │  Center       │    │                           │      │
│  └──────────────┘    │  ┌─────────────────────┐  │      │
│                      │  │ Email (SMTP/SES)     │  │      │
│  Preferences:        │  │ SMS (Twilio/MsgBird) │  │      │
│  Per user ×          │  │ Push (FCM/APNs)      │  │      │
│  Per event type ×    │  │ In-App (WebSocket)   │  │      │
│  Per channel         │  │ WhatsApp Business    │  │      │
│                      │  └─────────────────────┘  │      │
│                      └──────────────────────────┘      │
│                               │                         │
│                               ▼                         │
│  ┌──────────────┐    ┌──────────────────────────┐      │
│  │  Escalation   │    │  Analytics               │      │
│  │  (auto if     │    │  (delivery, open, bounce) │      │
│  │   unread)     │    └──────────────────────────┘      │
│  └──────────────┘                                       │
│                                                         │
│  Templates: i18n (EN, AR, HI) with variable injection   │
│  Digest: Daily/weekly batch of pending actions          │
│  Schedule: Timezone-aware delayed delivery              │
└─────────────────────────────────────────────────────────┘
```

### Inter-Service Communication Architecture

```
┌─────────────────────────────────────────────────────────┐
│          MICROSERVICE COMMUNICATION                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  HTTP/REST  ┌──────────┐                 │
│  │ Service A │◀──────────▶│ Service B │                 │
│  └──────────┘             └──────────┘                 │
│       │                        │                        │
│       │  gRPC (internal)       │                        │
│       ▼                        ▼                        │
│  ┌──────────────────────────────────┐                  │
│  │        Message Queue             │                  │
│  │    (RabbitMQ / Amazon SQS)       │                  │
│  │                                  │                  │
│  │  Exchanges:                      │                  │
│  │  ├── employee.events             │                  │
│  │  ├── payroll.events              │                  │
│  │  ├── leave.events                │                  │
│  │  ├── attendance.events           │                  │
│  │  └── workflow.events             │                  │
│  │                                  │                  │
│  │  Dead Letter Queue + Retry       │                  │
│  └──────────────────────────────────┘                  │
│                                                         │
│  Patterns:                                              │
│  ├── Saga: Distributed transactions (terminate flow)    │
│  ├── Circuit Breaker: Per-service failure isolation     │
│  ├── Correlation ID: Request tracing across services    │
│  └── Service Registry: Health-check aware routing       │
└─────────────────────────────────────────────────────────┘
```

### Audit Trail Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AUDIT & COMPLIANCE ENGINE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Prisma Middleware (auto-capture on write operations)   │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │  Immutable Audit Log (append-only)            │      │
│  │                                               │      │
│  │  Fields captured:                             │      │
│  │  ├── entity_type, entity_id                   │      │
│  │  ├── action (CREATE/UPDATE/DELETE/ACCESS)      │      │
│  │  ├── actor_id, actor_role, actor_ip           │      │
│  │  ├── old_value → new_value (field-level)      │      │
│  │  ├── timestamp, correlation_id                │      │
│  │  └── hash_chain (tamper-evident linking)       │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  Retention: Payroll 7yr | General 3yr | Configurable    │
│  GDPR: Pseudonymize PII, preserve action log           │
│  Export: SOC 2, ISO 27001 evidence packages             │
│  Anomaly: Mass export, bulk delete, off-hours alerts    │
└─────────────────────────────────────────────────────────┘
```

### Data Migration Architecture

```
┌─────────────────────────────────────────────────────────┐
│           HRMS DATA MIGRATION PIPELINE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐                                   │
│  │  Source Adapters  │                                   │
│  │  ├── Workday      │                                   │
│  │  ├── SAP SF       │    ┌──────────┐    ┌──────────┐ │
│  │  ├── BambooHR     │───▶│  Field    │───▶│ Validate │ │
│  │  ├── Oracle HCM   │    │  Mapper   │    │ (Dry Run)│ │
│  │  └── Generic CSV  │    └──────────┘    └──────────┘ │
│  └─────────────────┘                          │        │
│                                                ▼        │
│  ┌──────────────┐    ┌──────────┐    ┌──────────────┐  │
│  │  Verification │◀──│  Load    │◀──│  Transform   │  │
│  │  (Row Counts) │    │ (Batch)  │    │ (Normalize)  │  │
│  └──────────────┘    └──────────┘    └──────────────┘  │
│                                                         │
│  Field Mapper: AI-assisted fuzzy column matching        │
│  Dry Run: Validate without writing (full error report)  │
│  Rollback: Complete migration reversal                  │
│  Dedup: Duplicate detection across source + target      │
└─────────────────────────────────────────────────────────┘
```

---

## 🏥 ENTERPRISE BENEFITS & INSURANCE ARCHITECTURE

### Benefits Platform Inventory (Audited Feb 2026)

```
┌──────────────────────────────────────────────────────────┐
│            AURAOS BENEFITS PLATFORM                      │
├──────────────────────────────────────────────────────────┤
│  API Routes:        11 endpoints                         │
│  Prisma Models:     12 (plans, enrollments, claims,      │
│                     dependents, providers, HSA/FSA,       │
│                     qualifying events, premium rates)     │
│  Frontend:          12 components                        │
│  HSAFSAManagement:  1700+ lines (investments, tax,       │
│                     spending analytics, claims)           │
│  RetirementDash:    1600+ lines (401k, vesting, Roth,    │
│                     projections, catch-up, beneficiaries) │
│  Eligibility Rules: 3 types (waiting, employment, hours) │
│  Plan Types:        medical, dental, vision, life,       │
│                     disability, retirement               │
│  Seed Data:         Health PPO, Dental, Vision, 401k     │
└──────────────────────────────────────────────────────────┘
```

### Benefits Enrollment & Claims Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              BENEFITS LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────────┐    │
│  │  Eligibility │──▶│  Enrollment   │──▶│  Coverage Active   │    │
│  │  Engine      │    │  Wizard       │    │                    │    │
│  │  (3+ rules)  │    │  (5 steps)    │    │  Premium Deduction │    │
│  └────────────┘    └──────────────┘    │  (per payroll)      │    │
│                                         └──────────────────┘    │
│                                                │                 │
│                                                ▼                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CLAIMS PROCESSING (Enterprise Gap)                       │   │
│  │                                                           │   │
│  │  Submit → Adjudicate → Approve/Deny → Pay → EOB          │   │
│  │    │                                                      │   │
│  │    ├── Auto-adjudication (in-network, deductible check)   │   │
│  │    ├── Coordination of Benefits (primary/secondary)       │   │
│  │    ├── ICD/CPT code validation                            │   │
│  │    └── OOP max enforcement                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Life Events:                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Marriage │ Birth │ Divorce │ Death │ Job Loss │ Move     │   │
│  │     │         │        │        │        │         │      │   │
│  │     └─────────┴────────┴────────┴────────┴─────────┘      │   │
│  │                         │                                  │   │
│  │                         ▼                                  │   │
│  │              Special Enrollment Period (30-60 days)        │   │
│  │              Re-evaluate all plan eligibility              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### COBRA / Continuation Coverage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              COBRA ADMINISTRATION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Qualifying Event                                               │
│     │                                                           │
│     ├── Termination (18 months)                                 │
│     ├── Hours Reduction (18 months)                             │
│     ├── Death of Employee (36 months)                           │
│     ├── Divorce/Legal Separation (36 months)                    │
│     ├── Medicare Entitlement (36 months)                        │
│     └── Dependent Aging Out (36 months)                         │
│              │                                                   │
│              ▼                                                   │
│     ┌──────────────┐     ┌──────────────┐     ┌────────────┐  │
│     │ Initial Notice │────▶│ Election      │────▶│ Coverage    │  │
│     │ (14 days)      │     │ (60 days)     │     │ Active      │  │
│     └──────────────┘     └──────────────┘     └────────────┘  │
│                                                      │          │
│                                               ┌──────────────┐ │
│     Premium: 102% of full cost                │ Monthly       │ │
│     Grace Period: 30 days per payment         │ Premium       │ │
│     Auto-terminate: non-payment, max period,  │ Tracking      │ │
│                     new employer coverage      └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits Compliance Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              BENEFITS COMPLIANCE ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  US Compliance:                                                 │
│  ├── ACA Reporting (1095-B/C generation, full-time tracking)    │
│  ├── ERISA (SPD distribution, fiduciary duty, claims appeals)   │
│  ├── COBRA (notices, elections, premium tracking)                │
│  ├── HIPAA (privacy, portability, special enrollment)           │
│  ├── Section 125 (cafeteria plan, election changes)             │
│  ├── Section 105(h) (nondiscrimination testing)                 │
│  ├── IRS Form 8889 (HSA reporting)                              │
│  └── 401(k) ADP/ACP Testing (nondiscrimination)                │
│                                                                 │
│  MENA Compliance:                                               │
│  ├── EOSB (end-of-service benefits — UAE, KSA, GCC)            │
│  ├── Gratuity calculation per labor law                         │
│  ├── Medical insurance mandate (UAE/KSA/Bahrain)                │
│  └── Pension fund contributions                                 │
│                                                                 │
│  India Compliance:                                              │
│  ├── PF contribution tracking                                   │
│  ├── Gratuity Act compliance                                    │
│  ├── Group medical insurance (IRDA regulations)                 │
│  └── NPS (National Pension System) integration                  │
│                                                                 │
│  Annual Compliance Calendar:                                    │
│  ├── Q1: ACA reporting (1095-B/C due March 31)                 │
│  ├── Q2: Nondiscrimination testing                              │
│  ├── Q3: Open enrollment prep, SPD updates                     │
│  └── Q4: Open enrollment, year-end processing                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 ENTERPRISE EMPLOYEE SELF-SERVICE (ESS) ARCHITECTURE

### ESS Portal Capability Map

```
┌─────────────────────────────────────────────────────────────────┐
│                   EMPLOYEE SELF-SERVICE PORTAL                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  MY PROFILE     │  │  MY PAY         │  │  MY LEAVE        │  │
│  │  ├─ Personal    │  │  ├─ Payslips    │  │  ├─ Apply Leave  │  │
│  │  ├─ Bank Details│  │  ├─ Tax Docs    │  │  ├─ Balance      │  │
│  │  ├─ Address     │  │  ├─ Comp Stmt   │  │  ├─ Calendar     │  │
│  │  ├─ Emergency   │  │  ├─ Salary Hist │  │  ├─ Encashment   │  │
│  │  ├─ Dependents  │  │  └─ Advances    │  │  └─ Comp-Off     │  │
│  │  └─ Documents   │  │                 │  │                   │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  MY EXPENSES    │  │  MY REQUESTS    │  │  MY TASKS        │  │
│  │  ├─ Submit      │  │  ├─ Letters     │  │  ├─ Approvals    │  │
│  │  ├─ Receipt OCR │  │  ├─ ID Cards    │  │  ├─ Training     │  │
│  │  ├─ Mileage     │  │  ├─ Helpdesk   │  │  ├─ Reviews      │  │
│  │  ├─ Approvals   │  │  ├─ Change Req │  │  ├─ Documents    │  │
│  │  └─ Analytics   │  │  └─ Loans      │  │  └─ Calendar     │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  MY BENEFITS    │  │  MY WELLNESS    │  │  MY TEAM         │  │
│  │  ├─ Enrollment  │  │  ├─ Programs   │  │  ├─ Directory    │  │
│  │  ├─ Claims      │  │  ├─ Challenges │  │  ├─ Org Chart    │  │
│  │  ├─ HSA/FSA     │  │  ├─ Screening  │  │  ├─ Birthdays   │  │
│  │  └─ Life Events │  │  └─ EAP        │  │  └─ Recognition  │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Expense Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                EXPENSE MANAGEMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Employee                                                       │
│     │                                                           │
│     ├─── Submit Expense ──────────┐                             │
│     │    ├── Manual Entry         │                             │
│     │    ├── Receipt Photo (OCR)  │    ┌─────────────────────┐ │
│     │    └── Mileage Calc         ├───▶│  Policy Engine       │ │
│     │                             │    │  ├─ Max amounts      │ │
│     │                             │    │  ├─ Per-diem rates   │ │
│     │                             │    │  ├─ Receipt required?│ │
│     │                             │    │  ├─ Duplicate check  │ │
│     │                             │    │  └─ Category rules   │ │
│     │                             │    └─────────────────────┘ │
│     │                             │              │              │
│     │                             │              ▼              │
│     │                     ┌───────────────────────────┐        │
│     │                     │    Approval Workflow       │        │
│     │                     │    ├─ Manager (< $500)     │        │
│     │                     │    ├─ Finance (> $500)     │        │
│     │                     │    └─ CFO (> $5000)        │        │
│     │                     └───────────────────────────┘        │
│     │                                    │                      │
│     │                                    ▼                      │
│     │                     ┌───────────────────────────┐        │
│     │                     │  Payment Processing       │        │
│     │                     │  ├─ Add to next payroll    │        │
│     │                     │  └─ Direct reimbursement   │        │
│     │                     └───────────────────────────┘        │
│     │                                                           │
│     └─── Receipt OCR Pipeline ─────────────────────────────────│
│          ├── Image Upload                                       │
│          ├── OCR (Tesseract/Google Vision)                      │
│          ├── Extract: amount, vendor, date, tax                 │
│          └── Auto-fill expense form                             │
│                                                                 │
│  Duplicate Detection:                                           │
│  Same (amount ± 5%) + (date ± 3 days) + (vendor) = flag        │
└─────────────────────────────────────────────────────────────────┘
```

### Profile Change Request Architecture (Maker-Checker)

```
┌─────────────────────────────────────────────────────────────────┐
│              MAKER-CHECKER CHANGE REQUEST FLOW                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Employee (Maker)                                               │
│     │                                                           │
│     ├── Change Request ─────────────────────────────────┐      │
│     │   field: "bank_account"                            │      │
│     │   old_value: "****1234"                            │      │
│     │   new_value: "****5678"                            │      │
│     │   documents: [bank_statement.pdf]                  │      │
│     │                                                    │      │
│     │                                                    ▼      │
│     │                              ┌───────────────────────┐   │
│     │                              │  Sensitivity Router    │   │
│     │                              │                        │   │
│     │   LOW (phone, email)  ──────▶│  Auto-approve          │   │
│     │   MEDIUM (address)   ──────▶│  Manager approval      │   │
│     │   HIGH (bank, SSN)   ──────▶│  Manager + HR approval │   │
│     │   CRITICAL (name)    ──────▶│  HR + Legal approval   │   │
│     │                              └───────────────────────┘   │
│     │                                        │                  │
│     │                                        ▼                  │
│     │                              ┌───────────────────────┐   │
│     │                              │  Apply Change          │   │
│     │                              │  + Immutable Audit Log  │   │
│     │                              │  + Notification to Emp  │   │
│     │                              └───────────────────────┘   │
│     │                                                           │
│  Sensitive Fields (require maker-checker):                      │
│  ├── Bank IBAN / Account Number                                 │
│  ├── Emirates ID / CPR / National ID / SSN                      │
│  ├── Legal Name (requires government document)                  │
│  ├── Nationality / Visa Status                                  │
│  └── Marital Status (may affect benefits/tax)                   │
└─────────────────────────────────────────────────────────────────┘
```

### IT Helpdesk / HR Service Desk Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                HR SERVICE DESK                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Categories:                                                    │
│  ├── IT: Hardware | Software | Access | Network                 │
│  ├── HR: Policy | Payroll | Benefits | Leave                    │
│  ├── Facilities: Workspace | Parking | Security | Catering      │
│  └── Finance: Reimbursement | Tax | Salary Query                │
│                                                                 │
│  Ticket Lifecycle:                                              │
│  ┌────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐       │
│  │  Open   │─▶│ Assigned  │─▶│ In Progress│─▶│ Resolved  │       │
│  └────────┘  └──────────┘  └───────────┘  └──────────┘       │
│       │                          │               │              │
│       │                          ▼               ▼              │
│       │                    ┌──────────┐   ┌──────────┐         │
│       └───────────────────▶│ Escalated │   │  Closed   │         │
│                            └──────────┘   └──────────┘         │
│                                  │               │              │
│                                  └──── Reopen ───┘              │
│                                                                 │
│  SLA Matrix:                                                    │
│  ┌───────────┬────────────┬─────────────┬──────────────┐       │
│  │ Priority  │ Response   │ Resolution  │ Escalation   │       │
│  ├───────────┼────────────┼─────────────┼──────────────┤       │
│  │ Critical  │ 15 min     │ 2 hours     │ Auto → L2    │       │
│  │ High      │ 1 hour     │ 8 hours     │ Auto → L2    │       │
│  │ Medium    │ 4 hours    │ 24 hours    │ Manual       │       │
│  │ Low       │ 24 hours   │ 72 hours    │ Manual       │       │
│  └───────────┴────────────┴─────────────┴──────────────┘       │
│                                                                 │
│  Knowledge Base: FAQ deflection before ticket creation          │
│  Chatbot: AI-powered first response for common queries          │
└─────────────────────────────────────────────────────────────────┘
```

### Unified ESS Dashboard API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              ESS DASHBOARD AGGREGATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GET /api/v1/my-summary                                         │
│     │                                                           │
│     ├── Parallel Fetch ────────────────────────────────────┐   │
│     │                                                       │   │
│     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│     │  │ Leave Svc    │  │ Payroll Svc  │  │ Attendance   │  │   │
│     │  │ Balance: 18d │  │ Next: Mar 28 │  │ Today: 8h12m│  │   │
│     │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│     │                                                       │   │
│     │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│     │  │ Tasks Svc    │  │ Expense Svc  │  │ Training Svc│  │   │
│     │  │ Pending: 5   │  │ Open: 2      │  │ Due: 1      │  │   │
│     │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│     │                                                       │   │
│     └── Aggregate → Cache (5 min TTL) → Return JSON ───────┘   │
│                                                                 │
│  GET /api/v1/my-tasks (Unified Task Aggregator)                 │
│     ├── Pending leave approvals (if manager)                    │
│     ├── Incomplete onboarding tasks                             │
│     ├── Expiring documents (passport, visa, license)            │
│     ├── Pending training assignments                            │
│     ├── Performance review due dates                            │
│     ├── Tax declaration deadlines                               │
│     ├── Pending expense approvals                               │
│     └── Acknowledgment-required announcements                   │
│                                                                 │
│  GET /api/v1/my-calendar (Combined Calendar)                    │
│     ├── Approved leaves                                         │
│     ├── Public holidays                                         │
│     ├── Training sessions                                       │
│     ├── Performance review dates                                │
│     ├── Team birthdays & anniversaries (opt-in)                 │
│     └── Company events & town halls                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚫 ANTI-PATTERNS TO AVOID

### Never Do This:

```typescript
// ❌ Hardcoded values
const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL'];

// ❌ Fixed language strings
const message = 'Welcome to KreupAI';

// ❌ Hardcoded currency
const salary = '$' + amount;

// ❌ Fixed date format
const formatted = moment(date).format('MM/DD/YYYY');

// ❌ Enum in code
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// ❌ Logging PII
logger.info(`Employee ${employee.name} salary: ${employee.salary}`);

// ❌ Raw SQL with user input
const query = `SELECT * FROM employees WHERE name = '${userInput}'`;

// ❌ Shared mutable state across tenants
let globalCache = {};

// ❌ Synchronous blocking in request handlers
const result = fs.readFileSync(largePdfPath);

// ❌ Catching and swallowing errors silently
try {
  await riskyOperation();
} catch (e) {
  /* ignore */
}
```

### Always Do This:

```typescript
// ✅ Configuration-driven
const leaveTypes = await configService.getListItems('LEAVE_TYPES');

// ✅ Translation keys
const message = await t('welcome.message');

// ✅ Dynamic currency
const salary = await formatCurrency(amount, user.currency);

// ✅ Configurable date format
const formatted = await formatDate(date, user.dateFormat);

// ✅ Database-driven lists
const statuses = await configService.getListItems('EMPLOYEE_STATUS');

// ✅ PII-safe logging
logger.info({ module: 'PAYROLL', employeeId: emp.id, action: 'salary_updated' });

// ✅ Parameterized queries
const result = await db.query('SELECT * FROM employees WHERE name = $1', [userInput]);

// ✅ Tenant-scoped state
const cache = getTenantCache(tenantId);

// ✅ Async non-blocking operations
const result = await fs.promises.readFile(largePdfPath);

// ✅ Structured error handling with context
try {
  await riskyOperation();
} catch (error) {
  logger.error({ error, context: 'payroll_processing', tenantId }, 'Operation failed');
  throw new AppError('PAYROLL_PROCESSING_FAILED', error);
}
```

---

## 📝 FINAL NOTES

This architecture ensures:

- **Complete Configurability**: Nothing is hardcoded; everything is tenant-configurable
- **True Multi-tenancy**: Complete data isolation with schema-per-tenant + RLS
- **Multi-Entity Support**: Holding companies with multiple legal entities across jurisdictions
- **International Readiness**: 8+ languages, RTL/LTR, any currency, Hijri calendar, any region
- **Enterprise Scale**: Handles millions of employees across thousands of organizations
- **Regulatory Compliance**: SOC 2 Type II, ISO 27001, GDPR, UAE PDPL, KSA PDPL ready
- **MENA-First**: WPS, GOSI, Emiratisation, Nitaqat, visa management, EOSB natively supported
- **Full Payroll Engine**: Multi-component salary structures, arrears, F&F settlement, GL posting
- **Position Control**: Positions exist independently of people; budget-controlled hiring
- **Employee Lifecycle**: Hire → onboard → perform → grow → exit — fully automated workflows
- **Engagement Intelligence**: Pulse surveys, eNPS, engagement drivers, action planning
- **Operational Excellence**: 99.9% SLA, automated DR, blue-green deployments
- **Security Depth**: Encryption at rest/in-transit, field-level PII protection, immutable audit trails
- **Resilience**: Circuit breakers, retry policies, saga-based distributed transactions
- **Enterprise Backend Platform**: Bulk operations, enterprise search, report engine, notification orchestration
- **Enterprise ESS Portal**: Expense management, helpdesk, profile change requests, salary advances, wellness
- **Maker-Checker Workflows**: Sensitive field changes (bank, SSN, name) require dual approval with audit trail
- **Data Migration**: Import from Workday, SAP, BambooHR, Oracle — accelerate enterprise onboarding
- **Audit & Compliance**: Immutable audit trail, field-level change tracking, GDPR erasure, SOC 2 evidence
- **Future Proof**: Event-driven architecture, API versioning, modular microservices, feature flags
- **Enterprise Payroll**: Global multi-currency payroll, pay equity analysis, commission/tip engine, SOX compliance
- **Enterprise Recruitment**: Talent CRM, job board syndication, DEI analytics, assessment integrations, internal mobility

**Every single feature implementation MUST reference this document and follow these patterns.**

---

## Enterprise Payroll Engine Architecture

### Current Payroll Platform Inventory

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAYROLL PLATFORM INVENTORY                       │
├──────────────────────┬──────────────────────────────────────────────┤
│ API Routes           │ 38 endpoints (v1 + core + compensation)     │
│ Prisma Models        │ 14 core (PayrollRun, Payslip, Salary-       │
│                      │ Structure, TaxDeclaration, Adjustment,      │
│                      │ StatutoryPayment, Garnishment + 7 more)     │
│ Frontend Components  │ 11 (TotalCompStatement 45KB, BonusCalc      │
│                      │ 62KB, EquityMgmt 66KB, SalaryBench 40KB)   │
│ Service Layers       │ 3 (PayrollService 414L, Enhanced 951L,      │
│                      │ Mobile service)                             │
│ Background Jobs      │ 2 (BullMQ payroll calculation + processing) │
│ Countries Supported  │ 7 (IN, AE, SA, QA, KW, BH, OM)            │
│ Statutory Types      │ 6+ (PF, ESI, PT, TDS, GOSI, WPS)          │
│ Tax Regimes          │ Indian OLD/NEW regime, GCC, US (partial)    │
│ Seed Data            │ 508 lines (payroll admin + compensation)    │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Global Payroll Processing Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   GLOBAL PAYROLL ORCHESTRATOR                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐       │
│   │ India    │   │ UAE      │   │ KSA      │   │ US       │       │
│   │ Adapter  │   │ Adapter  │   │ Adapter  │   │ Adapter  │       │
│   ├──────────┤   ├──────────┤   ├──────────┤   ├──────────┤       │
│   │ PF/ESI   │   │ WPS/DEWS │   │ GOSI     │   │ Fed+State│       │
│   │ TDS/PT   │   │ Pension  │   │ SANED    │   │ FICA/SUI │       │
│   │ Gratuity │   │ Gratuity │   │ Gratuity │   │ Medicare │       │
│   │ OLD/NEW  │   │ No Tax   │   │ No Tax   │   │ W2/1099  │       │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘       │
│        │              │              │              │               │
│        ▼              ▼              ▼              ▼               │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              PAYROLL CALCULATION ENGINE                  │       │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐     │       │
│   │  │ Gross   │→│ Statutory│→│ Vol.    │→│ Net Pay  │     │       │
│   │  │ Earnings│ │ Deduct. │ │ Deduct. │ │ Calc.    │     │       │
│   │  └─────────┘ └─────────┘ └─────────┘ └──────────┘     │       │
│   └─────────────────────────────────────────────────────────┘       │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              POST-PROCESSING PIPELINE                    │       │
│   │                                                          │       │
│   │  Payslip Gen → GL Journal → Bank File → Statutory Filing │       │
│   │      ↓            ↓           ↓            ↓             │       │
│   │   PDF/Email    SAP/Xero   ACH/SWIFT    Govt Portal      │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │           GLOBAL CONSOLIDATION & REPORTING               │      │
│   │  FX Conversion → Cost Allocation → Variance Analysis     │      │
│   │  Multi-Currency → Intercompany  → SOX Audit Trail        │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Pay Equity & Compliance Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PAY EQUITY ENGINE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DATA INPUTS:                                                      │
│   ├── Employee Demographics (gender, race, age, disability)         │
│   ├── Compensation Data (base, bonus, equity, total comp)           │
│   ├── Job Architecture (grade, level, family, function)             │
│   ├── Location & Market Data (geo differentials, cost-of-living)    │
│   └── Performance & Tenure (years of service, ratings, promotions)  │
│                                                                     │
│   ANALYSIS ENGINE:                                                  │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│   │ Regression     │  │ Compa-Ratio    │  │ 4/5ths Rule    │       │
│   │ Analysis       │  │ Analysis       │  │ (EEOC)         │       │
│   │ (controlled    │  │ (by demo-      │  │ (adverse       │       │
│   │  for legit.    │  │  graphic       │  │  impact at     │       │
│   │  factors)      │  │  group)        │  │  each stage)   │       │
│   └───────┬────────┘  └───────┬────────┘  └───────┬────────┘       │
│           │                   │                    │                │
│           ▼                   ▼                    ▼                │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              COMPLIANCE REPORTS                          │       │
│   │  • EEO-1 Component 1 (US — EEOC e-file)                │       │
│   │  • EU Pay Transparency Directive (2023/970)             │       │
│   │  • CA SB 1162 / CO EPEWA / NY Pay Transparency          │       │
│   │  • UK Gender Pay Gap Report                             │       │
│   │  • CEO-to-Median Worker Ratio (SEC proxy)               │       │
│   │  • Pay Band Violation Alerts                            │       │
│   └─────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### Payroll Integration Hub Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PAYROLL INTEGRATION HUB                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   INBOUND:                          OUTBOUND:                       │
│   ┌──────────────┐                  ┌──────────────┐                │
│   │ Time &       │──────┐     ┌────→│ GL Journal   │→ SAP/Xero/QB  │
│   │ Attendance   │      │     │     └──────────────┘                │
│   ├──────────────┤      │     │     ┌──────────────┐                │
│   │ Benefits     │──────┤     ├────→│ Bank Files   │→ ACH/SWIFT/WPS│
│   │ Deductions   │      │     │     └──────────────┘                │
│   ├──────────────┤      ▼     │     ┌──────────────┐                │
│   │ Market Data  │──→ PAYROLL ├────→│ Govt Filing  │→ IRS/GOSI/PF  │
│   │ (Mercer)     │   ENGINE   │     └──────────────┘                │
│   ├──────────────┤      ▲     │     ┌──────────────┐                │
│   │ ADP Import   │──────┤     ├────→│ Benefits     │→ Carrier Files│
│   │ (migration)  │      │     │     │ Remittance   │                │
│   ├──────────────┤      │     │     └──────────────┘                │
│   │ Tax Table    │──────┘     │     ┌──────────────┐                │
│   │ Updates      │            └────→│ Payroll Data │→ ADP/Ceridian │
│   └──────────────┘                  │ Export       │                │
│                                     └──────────────┘                │
│                                                                     │
│   CONNECTOR HEALTH: [████████████████░░░░] 80% healthy              │
│   Last Sync: 2026-02-25 00:15 UTC                                   │
│   Active Connectors: 8/10                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Recruitment & Talent Acquisition Architecture

### Current Recruitment Platform Inventory

```
┌─────────────────────────────────────────────────────────────────────┐
│                 RECRUITMENT PLATFORM INVENTORY                       │
├──────────────────────┬──────────────────────────────────────────────┤
│ API Routes           │ 43 endpoints (core + v1 + AI + onboarding)  │
│ Prisma Models        │ 17 (JobPosting, Candidate, Application,     │
│                      │ Interview, Feedback, Offer, BackgroundCheck, │
│                      │ Requisition, Onboarding + 8 supporting)     │
│ Frontend Components  │ 20 (11,973 lines — AICandidateMatching      │
│                      │ 1238L, ESignaturePortal 1078L, CandComm     │
│                      │ 1084L, InterviewRecording 980L, Video 642L) │
│ AI Agent Service     │ RecruitmentAgentService 965 lines           │
│                      │ (Skills 40%, Experience 30%, Education 15%, │
│                      │ Culture Fit 15% — multi-factor scoring)     │
│ Onboarding Routes    │ 14 (programs, tasks, docs, equipment,       │
│                      │ buddies, training, surveys, pre-boarding)    │
│ Background Checks    │ 5 types (criminal, employment, education,   │
│                      │ credit, medical) with vendor integration    │
│ E-Signature          │ DocuSign-compatible envelope system          │
│ Seed Data            │ 6 sample job postings across 4 locations    │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Talent CRM & Pipeline Nurturing Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TALENT CRM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CANDIDATE LIFECYCLE:                                              │
│                                                                     │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐       │
│   │ Unknown  │──→│ Prospect │──→│ Applicant│──→│ Candidate│       │
│   │ (passive)│   │ (CRM)    │   │ (applied)│   │ (active) │       │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘       │
│        │              │              │              │               │
│   Source:        Nurture:       Assess:         Select:            │
│   LinkedIn       Drip emails    Resume parse    Scorecard          │
│   Events         Content        AI matching     Panel debrief      │
│   Referrals      Re-engage      Skills test     Calibration        │
│   Career site    Talent pool    Background ck   Offer approval     │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              ENGAGEMENT SCORING ENGINE                   │       │
│   │                                                          │       │
│   │  Email Opens: +2   │  Event Attend: +10  │  Apply: +25  │       │
│   │  Link Click:  +3   │  Referral:     +15  │  Hired: +50  │       │
│   │  Profile View:+1   │  Assessment:   +20  │  Decay: -5/mo│       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              SILVER MEDALIST REACTIVATION               │       │
│   │  Runner-ups → Tag as "Silver" → Auto-match new roles    │       │
│   │  → Fast-track application → Priority interview slot     │       │
│   └─────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

### Recruitment Funnel & DEI Analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│                RECRUITMENT FUNNEL WITH DEI OVERLAY                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   STAGE           │ TOTAL │ DIVERSE │ CONV.RATE │ 4/5ths CHECK     │
│   ─────────────────┼───────┼─────────┼───────────┼──────────────    │
│   Applications    │  500  │   225   │  100%     │  ✅ Pass          │
│   Screening       │  200  │    90   │  40%→40%  │  ✅ Pass          │
│   Phone Screen    │  100  │    42   │  50%→47%  │  ✅ Pass          │
│   Technical       │   50  │    18   │  50%→43%  │  ⚠️  Watch        │
│   Onsite          │   20  │     6   │  40%→33%  │  ❌ Flag          │
│   Offer           │   10  │     3   │  50%→50%  │  ✅ Pass          │
│   Hired           │    8  │     2   │  80%→67%  │  ⚠️  Watch        │
│                                                                     │
│   COMPLIANCE REPORTS:                                               │
│   ├── EEO-1 Component 1 (US EEOC)                                  │
│   ├── Adverse Impact (4/5ths rule per stage)                        │
│   ├── Diverse Slate (Rooney Rule / Mansfield Rule)                  │
│   ├── Accommodation Requests (ADA tracking)                         │
│   └── Pay Gap at Offer (gender/ethnicity comparison)                │
│                                                                     │
│   JOB DISTRIBUTION ANALYTICS:                                       │
│   ├── Indeed:     234 applies │ $4.20 CPC │ 8.2% conversion        │
│   ├── LinkedIn:   156 applies │ $6.80 CPC │ 12.1% conversion       │
│   ├── Glassdoor:   67 applies │ $3.50 CPC │ 5.4% conversion        │
│   ├── Referrals:   28 applies │ $0.00 CPC │ 28.6% conversion       │
│   └── Career Site: 15 applies │ $0.00 CPC │ 20.0% conversion       │
└─────────────────────────────────────────────────────────────────────┘
```

### Internal Mobility & Assessment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│              INTERNAL MOBILITY & ASSESSMENT PLATFORM                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   INTERNAL TALENT MARKETPLACE:                                      │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  Internal-Only Job Board                                 │      │
│   │  ├── Min Tenure Check (e.g., 12 months)                  │      │
│   │  ├── Performance Gate (meets expectations or above)      │      │
│   │  ├── Manager Notification (optional confidential mode)   │      │
│   │  ├── Gig/Project Marketplace (short-term assignments)    │      │
│   │  └── Career Path AI (next-role recommendations)          │      │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│   ASSESSMENT INTEGRATIONS:                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │HackerRank│  │ Codility │  │ HireVue  │  │TestGorilla│          │
│   │(coding)  │  │(coding)  │  │(video AI)│  │(skills)  │          │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│        └──────────────┴──────────────┴──────────────┘               │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  STRUCTURED SELECTION PROCESS                            │      │
│   │                                                          │      │
│   │  Scorecard   →  Panel    →  Debrief  →  Hire     →  Offer│     │
│   │  Template       Interview   Consensus   Committee   Bench│     │
│   │  (per role)     (rubric)    (vote+discuss) (final)  (mkt)│     │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│   REHIRE MANAGEMENT:                                                │
│   ├── Exit Reason Check (voluntary vs involuntary)                  │
│   ├── Blacklist/No-Rehire Flag                                      │
│   ├── Final Performance Rating                                      │
│   ├── Clearance Status                                              │
│   └── Fast-Track Known Candidates (skip initial screening)          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Learning & Development Architecture

### Current L&D Platform Inventory

```
┌─────────────────────────────────────────────────────────────────────┐
│                      L&D PLATFORM INVENTORY                         │
├──────────────────────┬──────────────────────────────────────────────┤
│ API Routes           │ 34 endpoints (8 core + 11 v1 + 14           │
│                      │ competency library + 1 AI learning)         │
│ Prisma Models        │ 33+ (13 core L&D + 20+ competency library   │
│                      │ in schema-competency.prisma 358 lines)      │
│ Frontend Components  │ 15 (7,000 lines — AIRecommend 850L,         │
│                      │ QuizBuilder 877L, VideoPlayer 788L,         │
│                      │ SkillsGapAnalysis 548L + 11 more)           │
│ Service Layers       │ 2 (LearningPaths 190L + Competency 682L)   │
│ Content Types        │ video, article, quiz, project, workshop,    │
│                      │ interactive                                  │
│ Question Types       │ multiple_choice, true_false, short_answer,  │
│                      │ matching                                     │
│ AI Features          │ Role-based, skill-gap, career-path,         │
│                      │ peer-popular, AI-suggested recommendations  │
│ Industry Training    │ Aviation, Manufacturing, Health & Safety     │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Learning Content & Delivery Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   LEARNING CONTENT RUNTIME                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CONTENT STANDARDS:                                                │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │ SCORM    │  │ SCORM    │  │ xAPI     │  │ cmi5     │          │
│   │ 1.2      │  │ 2004     │  │ (Tin Can)│  │          │          │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│        └──────────────┴──────────────┴──────────────┘               │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  CONTENT DELIVERY ENGINE                                 │      │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐      │      │
│   │  │ Video   │ │ Quiz    │ │ Course  │ │ External │      │      │
│   │  │ Player  │ │ Engine  │ │ Modules │ │ Content  │      │      │
│   │  │ (788L)  │ │ (877L)  │ │         │ │ (LTI)   │      │      │
│   │  └─────────┘ └─────────┘ └─────────┘ └──────────┘      │      │
│   └──────────────────────────────────────────────────────────┘      │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  LEARNING RECORD STORE (LRS)                             │      │
│   │  xAPI Statements → Bookmark/Resume → Progress → Score    │      │
│   │  Multi-device sync → Completion tracking → Certificates  │      │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│   EXTERNAL INTEGRATIONS:                                            │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│   │LinkedIn  │ │ Udemy    │ │ Coursera │ │Pluralsight│             │
│   │Learning  │ │ Business │ │for Biz   │ │/O'Reilly │             │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### Compliance Training & Gamification Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│              COMPLIANCE TRAINING ENGINE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   TRIGGERS:                         REGULATIONS:                    │
│   ├── New Hire                      ├── SOX (financial controls)    │
│   ├── Role Change                   ├── HIPAA (healthcare data)     │
│   ├── Annual Recurrence             ├── OSHA (workplace safety)     │
│   ├── Promotion                     ├── GDPR (data privacy)        │
│   ├── Location Transfer             ├── Anti-Harassment            │
│   └── New Regulation                └── Industry-Specific          │
│                                                                     │
│   AUTO-ASSIGN → DEADLINE → ESCALATION → RESTRICTION                │
│        ↓           ↓          ↓             ↓                      │
│   Rule Engine    7d/3d/1d   Manager →    Access                    │
│   (dept, role,   reminders  HR → Skip    revocation               │
│    location)                 Level       for critical              │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              GAMIFICATION ENGINE                         │      │
│   │                                                          │      │
│   │  Points   →  Badges  →  Leaderboard  →  Rewards         │      │
│   │  (per         (Open       (team,         (swag,          │      │
│   │   activity)    Badges     dept,           PTO,           │      │
│   │                v3.0)      global)         gift cards)    │      │
│   │                                                          │      │
│   │  Streaks → Challenges → Micro-Learning → Social         │      │
│   │  (daily/    (time-       (5-min,          (shout-outs,   │      │
│   │   weekly)    bound)       spaced rep.)     endorsements) │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Time & Attendance Architecture

### Current T&A Platform Inventory

```
┌─────────────────────────────────────────────────────────────────────┐
│                    T&A PLATFORM INVENTORY                           │
├──────────────────────┬──────────────────────────────────────────────┤
│ API Routes           │ 98+ endpoints (30 attendance + 9 shift +    │
│                      │ 20+ leave + 9 overtime + 3 timesheet +      │
│                      │ scheduling + AI forecasting + legacy)       │
│ Prisma Models        │ 21 core (AttendancePunch, AttendanceRecord, │
│                      │ Shift, ShiftAssignment, ShiftRoster, Shift- │
│                      │ SwapRequest, OvertimeRequest, CompOff,      │
│                      │ LeavePolicy, LeaveBalance, LeaveRequest,    │
│                      │ LeaveEncashment, LeaveAccrual + 8 more)     │
│ Services             │ 10+ (AttendanceService 853L, ShiftMgmt      │
│                      │ 390L, OvertimeService 384L, TimeTracking    │
│                      │ 282L + attendance-client 409L + more)       │
│ Frontend Components  │ 10+ (Biometric, BreakCompliance, Geofence,  │
│                      │ LaborCost, VisualScheduleBuilder + more)    │
│ Background Jobs      │ 3+ (leave accrual, payroll, reporting)      │
│ Queue Infrastructure │ RabbitMQ + custom queue service + scheduler  │
│ Shift Types          │ 7 (General, Morning, Evening, Night, Flex,  │
│                      │ Rotational, Ramadan)                        │
│ Leave Types          │ 9 (PL, SL, CL, ML, PTL, CO, LWP, BL, Hajj)│
│ Advanced Features    │ Geofencing, Biometric, Field Force, WFH,    │
│                      │ Regularization, AI Leave Forecasting        │
└──────────────────────┴──────────────────────────────────────────────┘
```

### AI-Powered Scheduling Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                AI-POWERED SCHEDULING ENGINE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DEMAND INPUTS:                    CONSTRAINTS:                    │
│   ├── Historical Patterns           ├── Max Hours (jurisdiction)    │
│   ├── POS / Call Volume             ├── Minimum Rest (11h EU)       │
│   ├── Weather / Events              ├── Fatigue Rules               │
│   ├── Seasonal Trends               ├── Skill Requirements          │
│   └── Business Forecast             ├── CBA / Union Rules           │
│                                     └── Employee Preferences        │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │           OPTIMIZATION ENGINE                            │      │
│   │                                                          │      │
│   │  Minimize:  Cost, Overtime, Understaffing               │      │
│   │  Maximize:  Coverage, Fairness, Preference Match         │      │
│   │  Subject to: Labor Law, CBA, Availability, Skills       │      │
│   │                                                          │      │
│   │  Algorithm: Constraint satisfaction → Genetic algorithm  │      │
│   │             → Local search refinement                    │      │
│   └──────────────────────────────────────────────────────────┘      │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  OUTPUT: Optimized Schedule                              │      │
│   │  ├── Per-employee shift assignments                      │      │
│   │  ├── Fairness score report                               │      │
│   │  ├── Cost projection                                     │      │
│   │  ├── Compliance verification                             │      │
│   │  └── Manager review → Publish → Employee notification    │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Labor Compliance Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LABOR COMPLIANCE ENGINE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   US COMPLIANCE:                                                    │
│   ├── FLSA: Exempt/non-exempt, overtime, minimum wage               │
│   ├── FMLA: 12/26 weeks, 1,250 hours, intermittent tracking       │
│   ├── ADA: Reasonable accommodation, interactive process            │
│   ├── Predictive Scheduling: SF, NYC, OR, Chicago, Seattle         │
│   ├── Meal/Rest Breaks: CA (30m meal + 10m rest), WA, MA, OR      │
│   ├── Child Labor: Age-based limits, work permits                   │
│   └── USERRA: Military leave, reinstatement rights                  │
│                                                                     │
│   EU COMPLIANCE:                                                    │
│   ├── Working Time Directive: 48-hour max, 11-hour rest            │
│   ├── Part-Time Workers Directive                                   │
│   └── Fixed-Term Workers Directive                                  │
│                                                                     │
│   MENA COMPLIANCE:                                                  │
│   ├── UAE: 8-hour day, 48-hour week, Friday rest, Ramadan reduced  │
│   ├── KSA: 8-hour day, Saudization, prayer time                    │
│   └── GCC: Country-specific labor laws                              │
│                                                                     │
│   INDIA COMPLIANCE:                                                 │
│   ├── Shops & Establishments Act (state-level)                      │
│   ├── Factories Act (shift/overtime)                                │
│   └── Maternity Benefit Act (26 weeks)                              │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  VIOLATION DETECTION → ALERT → REMEDIATION → AUDIT      │      │
│   │  Real-time checks on: clock-in/out, schedule publish,    │      │
│   │  overtime approval, leave request, shift assignment       │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Analytics & People Intelligence Architecture

### Current Analytics Platform Inventory

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ANALYTICS PLATFORM INVENTORY                       │
├──────────────────────┬──────────────────────────────────────────────┤
│ API Routes           │ 48 (26 analytics + 12 reports + 6 dash-     │
│                      │ boards + 3 predictive + module-specific)    │
│ Prisma Models        │ 9 (ReportDefinition, ReportExecution,       │
│                      │ DashboardWidget, PredictiveModel, Predict-  │
│                      │ ion, AnalyticsCache, AuditLog + 2 AI)      │
│ Frontend Components  │ 26 (119KB — CustomReportBuilder, People-    │
│                      │ Analytics, DraggableWidgetGrid, 10 widgets) │
│ Core Services        │ 9 (AnalyticsService 667L, ReportService     │
│                      │ 628L, DashboardService 200L, Attrition-     │
│                      │ Prediction 828L, WorkforceAnalytics 847L)   │
│ AI Routes            │ 18+ (attrition, sentiment, anomaly, coach-  │
│                      │ ing, org-health, workforce, leave-forecast) │
│ Report Templates     │ 23 predefined (payroll, attendance, leave,  │
│                      │ headcount, GOSI compliance)                 │
│ Chart Types          │ 9 (BAR, LINE, PIE, DONUT, AREA, SCATTER,   │
│                      │ RADAR, FUNNEL, GAUGE)                      │
│ Export Formats       │ PDF, EXCEL, CSV, JSON                       │
│ ML Models            │ ATTRITION, PERFORMANCE, HIRING_DEMAND,      │
│                      │ SALARY prediction with training pipeline    │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Enterprise Analytics Data Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                   ANALYTICS DATA PLATFORM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DATA SOURCES:                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│   │ AuraOS   │ │ ADP      │ │ Workday  │ │ SAP      │             │
│   │ (OLTP)   │ │ (Import) │ │ (Import) │ │ (Import) │             │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘             │
│        └──────────────┴──────────────┴──────────────┘               │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              ETL / CDC PIPELINE                           │      │
│   │  Extract → Transform → Validate → Load → Index           │      │
│   │  CDC: Real-time change capture → Event stream → Materialize│     │
│   └──────────────────────────────────────────────────────────┘      │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              ANALYTICS DATA STORE (OLAP)                 │      │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │      │
│   │  │ HOT     │  │ WARM    │  │ COLD    │                  │      │
│   │  │ <90 days│  │ 1-3 yrs │  │ 3+ yrs  │                  │      │
│   │  │ RT dash │  │ trends  │  │ archive │                  │      │
│   │  └─────────┘  └─────────┘  └─────────┘                  │      │
│   │  Data Catalog │ Metadata │ Quality Score │ Lineage       │      │
│   └──────────────────────────────────────────────────────────┘      │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              ANALYTICS ACCESS LAYER                      │      │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐      │      │
│   │  │ BI      │ │ NLQ     │ │ SQL IDE │ │ Embedded │      │      │
│   │  │ Builder │ │ "Ask"   │ │ (Power  │ │ Widgets  │      │      │
│   │  │ (D&D)   │ │ (LLM)   │ │  Users) │ │ (iFrame) │      │      │
│   │  └─────────┘ └─────────┘ └─────────┘ └──────────┘      │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### People Modeling & Scenario Planning

```
┌─────────────────────────────────────────────────────────────────────┐
│              WORKFORCE MODELING ENGINE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   SCENARIO TYPES:                                                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │ RIF / Layoff │  │ Reorg /      │  │ M&A          │             │
│   │ Modeling     │  │ Restructure  │  │ Integration  │             │
│   │ (dept, %,    │  │ (merge, flat-│  │ (headcount,  │             │
│   │  severance)  │  │  ten, split) │  │  overlap,    │             │
│   │              │  │              │  │  synergies)  │             │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│          └──────────────────┴──────────────────┘                    │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │              IMPACT ANALYSIS ENGINE                       │      │
│   │  Cost Impact → Headcount → Skill Gaps → Culture Risk     │      │
│   │  Severance   → Span of   → Critical  → Morale          │      │
│   │  Calculation    Control    Roles Lost    Impact           │      │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│   STRATEGIC WORKFORCE PLANNING (3-5 YEAR):                          │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  Demographics → Skill Evolution → Automation Impact      │      │
│   │  (aging,         (emerging tech,   (tasks at risk,       │      │
│   │   retirement)     obsolescence)     reskill timeline)    │      │
│   │                                                          │      │
│   │  Talent Supply → Build/Buy/Borrow → Gap Closure Roadmap │      │
│   │  (pipeline,       Strategy          (quarterly targets,  │      │
│   │   labor market)                      investment plan)    │      │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│   BENCHMARKING:                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│   │ Industry │ │ Market   │ │ Employee │ │ Benefits │             │
│   │ Turnover │ │ Comp     │ │ Exp (GPTW│ │ Competi- │             │
│   │ (NAICS)  │ │ (Mercer) │ │ /NPS)    │ │ tiveness │             │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

### ONA & Compliance Analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│    ORGANIZATIONAL NETWORK ANALYSIS (ONA)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   DATA SOURCES:                     ANALYSIS:                       │
│   ├── Email metadata (not content)  ├── Centrality scoring          │
│   ├── Slack/Teams interaction       ├── Bridge connector ID         │
│   ├── Calendar meeting data         ├── Silo detection              │
│   └── Collaboration tool logs       ├── Influence mapping           │
│                                     ├── Meeting burden analysis     │
│                                     └── Team connectivity score     │
│                                                                     │
│   COMPLIANCE ANALYTICS:                                             │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │  Framework      │ Components                             │      │
│   │  ────────────────┼─────────────────────────────────────── │      │
│   │  SOX             │ Payroll controls, access, SOD          │      │
│   │  SOC 2 Type II   │ Evidence collection, control testing   │      │
│   │  ISO 27001       │ ISMS controls, risk assessment         │      │
│   │  GDPR/CCPA/PDPL  │ Subject requests, retention, consent  │      │
│   │  EEO-1/AAP       │ Demographic reporting, adverse impact  │      │
│   │  Ethics Hotline  │ Case volume, substantiation, trends    │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Admin & Platform Architecture

### Admin Platform Inventory

| Component               | Implementation                                                 | Size         | Status                    |
| ----------------------- | -------------------------------------------------------------- | ------------ | ------------------------- |
| Admin API Routes        | `/api/v1/admin/*` — 15 route files, 9 sub-domains              | 15 endpoints | Production (partial mock) |
| Workflow Engine         | WorkflowService (711L) + Microservice engine + BullMQ worker   | 1,200+ lines | Core functional           |
| WorkflowDesigner        | Drag-and-drop canvas with nodes/edges                          | 425 lines    | UI functional             |
| RBAC System             | 6 roles, 29 resources, 10 action types, permission matrix      | 225 lines    | Enum-based                |
| Multi-Tenant Middleware | `tenant-isolation.ts` — validate, filter, bypass, log          | 306 lines    | Production-ready          |
| API Key Module          | SHA-256 hashing, timing-safe verify, scope-based auth          | 424 lines    | Cryptographically sound   |
| Webhook System          | CRUD + HMAC signing + retry + delivery tracking + microservice | 340+ lines   | DB-backed                 |
| Audit Service           | 63 actions, 4 severity levels, suspicious flagging, SOC 2      | 500 lines    | Redis only (DB not wired) |
| Form Builder            | 11 field types, approval workflow linking, preview renderer    | 353 lines    | No Prisma model           |
| Branding Customizer     | Logo, colors, typography, layout, email, login, CSS            | Config only  | Mock data                 |
| Integration Registry    | 7 connectors, field mappings, auth configs, rate limits        | 862 lines    | In-memory catalog         |
| Settings Routes         | 12 module-specific (payroll, benefits, security, etc.)         | 12 routes    | Functional                |
| Data Import/Export      | Field mapping, validation, status polling, CSV/XLSX            | 2 routes     | Mock processing           |

### Enterprise Admin Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE ADMIN PLATFORM                            │
│                                                                         │
│   PROCESS AUTOMATION ENGINE:                                            │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐       │
│   │ Workflow     │    │ Decision     │    │ SLA & Escalation    │       │
│   │ Designer     │───▶│ Engine       │───▶│ Engine              │       │
│   │              │    │              │    │                     │       │
│   │ • BPMN 2.0   │    │ • DMN Tables │    │ • Timer triggers    │       │
│   │ • Drag-drop  │    │ • FEEL Expr  │    │ • Cron schedules    │       │
│   │ • Parallel   │    │ • Hit Policy │    │ • Escalation chains │       │
│   │ • Sub-process│    │ • Versioned  │    │ • Auto-reassign     │       │
│   └──────┬───────┘    └──────────────┘    └─────────────────────┘       │
│          │                                                              │
│          ▼                                                              │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │ Process Runtime                                               │      │
│   │ ┌────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐ │      │
│   │ │ Start  │→│Approval │→│Condition │→│Webhook │→│  End    │ │      │
│   │ └────────┘ └─────────┘ └──────────┘ └────────┘ └─────────┘ │      │
│   │                                                               │      │
│   │ Delegation Rules:                                             │      │
│   │ • Auto-forward on absence  • Amount-based routing             │      │
│   │ • Department escalation    • Audit trail per delegation       │      │
│   │                                                               │      │
│   │ Process Analytics:                                            │      │
│   │ • Cycle time per node      • Bottleneck heat map              │      │
│   │ • SLA breach rates         • Approval response time           │      │
│   │ • Cost attribution         • Simulation/what-if               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   TENANT ADMINISTRATION:                                                │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Provisioning ──▶ Onboarding Wizard ──▶ Go-Live Readiness    │      │
│   │  │                 │                     │                    │      │
│   │  ├── Admin user    ├── Org structure     ├── Integration test │      │
│   │  ├── Default roles ├── Policy config     ├── Data validation  │      │
│   │  ├── Settings seed ├── Data import       ├── User acceptance  │      │
│   │  └── API keys      └── Branding setup    └── Compliance check │      │
│   │                                                               │      │
│   │  Lifecycle:                                                   │      │
│   │  • Usage metering (users, storage, API calls)                 │      │
│   │  • Billing integration (tiers, invoicing)                     │      │
│   │  • Feature flags (per-tenant, gradual rollout)                │      │
│   │  • Health monitoring (DB pool, job queue, error rates)         │      │
│   │  • Cross-tenant analytics (adoption, churn risk)              │      │
│   │  • Data export/migration (GDPR portability)                   │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   ACCESS GOVERNANCE:                                                    │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  RBAC (Current)          ABAC (Target)                        │      │
│   │  ┌──────────────┐       ┌────────────────────────────────┐   │      │
│   │  │ 6 Roles      │       │ User Attrs + Resource Attrs    │   │      │
│   │  │ 29 Resources │  ───▶ │ + Environment Context          │   │      │
│   │  │ 10 Actions   │       │ = Dynamic Policy Decision      │   │      │
│   │  └──────────────┘       └────────────────────────────────┘   │      │
│   │                                                               │      │
│   │  Field-Level Security:                                        │      │
│   │  • PII masking (SSN partial, email domain-only, salary range) │      │
│   │  • Role-based unmasking with audit                            │      │
│   │  • Encryption-at-rest for sensitive fields                    │      │
│   │                                                               │      │
│   │  Segregation of Duties (SoD):                                 │      │
│   │  • Conflicting role detection       • SOX evidence            │      │
│   │  • Compensating controls            • Real-time enforcement   │      │
│   │                                                               │      │
│   │  Access Certification:                                        │      │
│   │  • Scheduled review campaigns       • Bulk approve/revoke     │      │
│   │  • Manager attestation              • Compliance evidence     │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   CONFIGURATION & CUSTOMIZATION:                                        │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Custom Field Engine:         Custom Object Engine:           │      │
│   │  ┌────────────────────┐      ┌──────────────────────┐        │      │
│   │  │ Add fields to any  │      │ Create new entities   │        │      │
│   │  │ entity via JSON    │      │ with auto-CRUD APIs   │        │      │
│   │  │ column extension   │      │ and relationships     │        │      │
│   │  └────────────────────┘      └──────────────────────┘        │      │
│   │                                                               │      │
│   │  Formula Engine:    Business Rules:      i18n Engine:         │      │
│   │  • Field references • On-change triggers • Language packs     │      │
│   │  • Date arithmetic  • Validations        • Translation memory │      │
│   │  • IF/THEN/ELSE     • Auto-populate      • RTL (Arabic)      │      │
│   │  • Aggregations     • Cross-object       • Hijri calendar     │      │
│   │                                                               │      │
│   │  Page Layout Designer:                                        │      │
│   │  • Drag-and-drop sections  • Role-based layouts               │      │
│   │  • Conditional visibility  • Compact vs detailed views        │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   INTEGRATION PLATFORM (iPaaS):                                         │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌───────────┐    ┌───────────────┐    ┌──────────────────┐  │      │
│   │  │ Event Bus │    │ Marketplace   │    │ Health Monitor   │  │      │
│   │  │           │    │               │    │                  │  │      │
│   │  │ • Pub/Sub │    │ • Browse/     │    │ • Connectivity   │  │      │
│   │  │ • Topics  │    │   Install     │    │ • Error rates    │  │      │
│   │  │ • DLQ     │    │ • OAuth flow  │    │ • Latency        │  │      │
│   │  │ • Replay  │    │ • Versioning  │    │ • SLA tracking   │  │      │
│   │  │ • Schema  │    │ • Certified   │    │ • Auto-disable   │  │      │
│   │  └─────┬─────┘    └───────────────┘    └──────────────────┘  │      │
│   │        │                                                      │      │
│   │        ▼                                                      │      │
│   │  ┌──────────────────────────────────────────────────────┐    │      │
│   │  │ Data Transform → Sync Jobs → Error Handling          │    │      │
│   │  │ • Visual mapping  • CRON       • Exponential backoff │    │      │
│   │  │ • Type conversion • Delta sync • Circuit breaker     │    │      │
│   │  │ • Lookups         • Conflicts  • Dead-letter queue   │    │      │
│   │  └──────────────────────────────────────────────────────┘    │      │
│   │                                                               │      │
│   │  SSO Federation:           OAuth Lifecycle:                   │      │
│   │  • SAML 2.0 IdP           • Encrypted token storage          │      │
│   │  • OIDC discovery          • Auto-refresh before expiry       │      │
│   │  • JIT provisioning        • Rotation policies                │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   DATA GOVERNANCE & COMPLIANCE:                                         │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Audit Persistence:        Data Lifecycle:                    │      │
│   │  ┌──────────────────┐     ┌────────────────────────┐         │      │
│   │  │ Redis (hot)      │     │ Hot → Warm → Cold       │         │      │
│   │  │     ↓             │     │ Retention policies      │         │      │
│   │  │ Prisma AuditLog  │     │ Legal hold override     │         │      │
│   │  │ (partitioned)    │     │ Archival compression    │         │      │
│   │  │     ↓             │     │ Restore on demand       │         │      │
│   │  │ Full-text search │     └────────────────────────┘         │      │
│   │  └──────────────────┘                                        │      │
│   │                                                               │      │
│   │  Privacy Automation:                                          │      │
│   │  ┌──────────────────────────────────────────────────────┐    │      │
│   │  │ DSAR     │ Auto-discover PII, generate access report  │    │      │
│   │  │ Erasure  │ Cascade anonymize, preserve integrity       │    │      │
│   │  │ Consent  │ Granular categories, withdrawal propagation │    │      │
│   │  │ Classify │ AUTO: PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICT │    │      │
│   │  └──────────────────────────────────────────────────────┘    │      │
│   │                                                               │      │
│   │  Compliance Reports:                                          │      │
│   │  ┌──────────────────────────────────────────────────────┐    │      │
│   │  │  Framework      │ Evidence                            │    │      │
│   │  │  ────────────────┼──────────────────────────────────── │    │      │
│   │  │  SOC 2 Type II   │ Access controls, change mgmt        │    │      │
│   │  │  ISO 27001       │ ISMS controls, risk assessment      │    │      │
│   │  │  GDPR Art. 30    │ Processing register, DPIA           │    │      │
│   │  │  CCPA             │ Consumer rights, sale opt-out       │    │      │
│   │  └──────────────────────────────────────────────────────┘    │      │
│   └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Database & Data Platform Architecture

### Database Platform Inventory

| Component        | Implementation                    | Size                        | Status               |
| ---------------- | --------------------------------- | --------------------------- | -------------------- |
| Prisma Schema    | Single monolithic `schema.prisma` | 5,941 lines                 | Needs splitting      |
| Models           | 207 Prisma models, 31 enums       | 207 tables                  | Production           |
| Relations        | `@relation` directives            | 180 (90 bidirectional)      | Functional           |
| Indexes          | `@@index` + `@@unique`            | 465 + 60 = 525              | 54 models un-indexed |
| JSON Columns     | Schemaless `Json` fields          | 115 across 69 models        | Heavy usage          |
| Multi-Tenant     | `tenantId` column                 | 118/207 models (57%)        | App-enforced only    |
| Migrations       | Prisma migrate                    | 6 migrations for 207 models | Needs granularity    |
| Seeds            | Numbered + domain + scripts       | 47 seed files               | Comprehensive        |
| Connection Pool  | Environment-aware config          | PgBouncer guide included    | Config only          |
| Query Monitoring | `$use` slow query middleware      | Warn >100ms/50ms            | Deprecated API       |
| Audit Columns    | `createdBy`/`updatedBy`           | 37 of 207 models            | Sparse               |
| Soft Delete      | `deletedAt`/`isDeleted`           | 0 models                    | NOT IMPLEMENTED      |

### Enterprise Database Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE DATABASE PLATFORM                          │
│                                                                         │
│   SCHEMA GOVERNANCE:                                                    │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Schema Organization (Target):                                │      │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │      │
│   │  │ employee.   │  │ payroll.    │  │ attendance. │          │      │
│   │  │ prisma      │  │ prisma      │  │ prisma      │          │      │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │      │
│   │         │                │                │                   │      │
│   │         └────────────────┴────────────────┘                   │      │
│   │                          │                                    │      │
│   │                   prisma-merge                                │      │
│   │                          │                                    │      │
│   │                   ┌──────▼──────┐                             │      │
│   │                   │ schema.     │                             │      │
│   │                   │ prisma      │  ← Generated (5,941 lines) │      │
│   │                   └─────────────┘                             │      │
│   │                                                               │      │
│   │  Universal Columns (ALL entity models):                       │      │
│   │  • id          String  @id @default(uuid())                   │      │
│   │  • tenantId    String  (118 models)                           │      │
│   │  • createdAt   DateTime @default(now())                       │      │
│   │  • updatedAt   DateTime @updatedAt                            │      │
│   │  • createdBy   String?  → User.id                             │      │
│   │  • updatedBy   String?  → User.id                             │      │
│   │  • deletedAt   DateTime?                                      │      │
│   │  • deletedBy   String?  → User.id                             │      │
│   │  • isDeleted   Boolean  @default(false)                       │      │
│   │                                                               │      │
│   │  Naming Convention (Target):                                  │      │
│   │  • @@map("snake_case_table_names")                            │      │
│   │  • @map("snake_case_column_names")                            │      │
│   │  • Schema CI linting enforces conventions                     │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   DATABASE SECURITY:                                                    │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Layer 1: Connection Security                                 │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ TLS 1.3 │ mTLS (service-to-service) │ Cert rotation   │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Layer 2: Authentication & Credentials                        │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ Vault/Secrets Manager │ Auto-rotation │ Per-service    │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Layer 3: Row-Level Security (RLS)                            │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ SET app.current_tenant_id = 'tenant_123'               │  │      │
│   │  │ CREATE POLICY tenant_isolation ON employees             │  │      │
│   │  │   USING (tenant_id = current_setting('app.tenant_id')) │  │      │
│   │  │ FORCE ROW LEVEL SECURITY (even for owners)             │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Layer 4: Column-Level Encryption                             │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ AES-256-GCM: SSN, bank acct, salary, tax ID           │  │      │
│   │  │ Per-tenant keys in KMS │ Rotation without downtime     │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Layer 5: Audit Triggers                                      │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ PostgreSQL AFTER triggers on critical tables            │  │      │
│   │  │ OLD/NEW row capture → audit_log (async processing)     │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   PERFORMANCE & SCALABILITY:                                            │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Table Partitioning:                                          │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │  Table            │ Strategy    │ Key         │ Cycle  │  │      │
│   │  │  ──────────────────┼─────────────┼─────────────┼─────── │  │      │
│   │  │  AuditLog          │ RANGE       │ timestamp   │ Month  │  │      │
│   │  │  AttendancePunch   │ RANGE       │ clockIn     │ Month  │  │      │
│   │  │  PayrollRun        │ RANGE       │ periodStart │ Quarter│  │      │
│   │  │  WPSRecord         │ RANGE       │ created     │ Month  │  │      │
│   │  │  GOSIRecord        │ RANGE       │ created     │ Month  │  │      │
│   │  │  WebhookLog        │ RANGE       │ createdAt   │ Month  │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Connection Architecture:                                     │      │
│   │  ┌───────────┐    ┌───────────┐    ┌─────────────────────┐  │      │
│   │  │ App       │───▶│ PgBouncer │───▶│ Primary (R/W)       │  │      │
│   │  │ (Prisma)  │    │ (txn mode)│    │ PostgreSQL          │  │      │
│   │  │           │    │ 1000 conn │    │ ┌─────────────────┐ │  │      │
│   │  │ $extends: │    │ pool: 20  │    │ │ Streaming       │ │  │      │
│   │  │ • R/W     │    └───────────┘    │ │ Replication     │ │  │      │
│   │  │   split   │                     │ └────────┬────────┘ │  │      │
│   │  │ • soft    │                     └──────────┼──────────┘  │      │
│   │  │   delete  │                                │              │      │
│   │  │ • audit   │                     ┌──────────▼──────────┐  │      │
│   │  │ • compute │                     │ Replica 1 (Read)    │  │      │
│   │  └───────────┘                     │ Replica 2 (Read)    │  │      │
│   │                                    │ Replica N (Analytics)│  │      │
│   │                                    └─────────────────────┘  │      │
│   │                                                               │      │
│   │  Materialized Views:                                          │      │
│   │  • mv_headcount_by_dept    • mv_leave_utilization             │      │
│   │  • mv_attendance_summary   • mv_recruitment_funnel            │      │
│   │  • mv_payroll_cost_rollup  • mv_benefits_enrollment_stats     │      │
│   │  Refresh: CONCURRENTLY on schedule, stale indicator           │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   MIGRATION & DATA OPERATIONS:                                          │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Migration Pipeline:                                          │      │
│   │  ┌────────┐   ┌─────────┐   ┌────────────┐   ┌───────────┐ │      │
│   │  │  Dev   │──▶│ Staging │──▶│ Canary     │──▶│Production │ │      │
│   │  │        │   │         │   │ (subset of │   │           │ │      │
│   │  │ Auto   │   │ Approval│   │  tenants)  │   │ Approval  │ │      │
│   │  │ apply  │   │ gate    │   │            │   │ gate      │ │      │
│   │  └────────┘   └─────────┘   └────────────┘   └───────────┘ │      │
│   │                                                               │      │
│   │  Zero-Downtime Patterns:                                      │      │
│   │  • CREATE INDEX CONCURRENTLY (no table lock)                  │      │
│   │  • Add column → backfill → add constraint (3-phase)           │      │
│   │  • pgroll for online schema changes                           │      │
│   │  • Feature flags for schema-dependent code                    │      │
│   │                                                               │      │
│   │  Schema Drift Detection:                                      │      │
│   │  • prisma db pull → compare → alert                           │      │
│   │  • Reconcile out-of-band indexes                              │      │
│   │  • Weekly drift report                                        │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   DATA QUALITY & INTEGRITY:                                             │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Constraint Enforcement:                                      │      │
│   │  • CHECK: email format, phone pattern, date ranges            │      │
│   │  • NOT NULL: staged migration with defaults                   │      │
│   │  • UNIQUE: composite constraints for business rules           │      │
│   │  • FK: proper ON DELETE (Cascade/SetNull/Restrict)            │      │
│   │                                                               │      │
│   │  Data Quality Pipelines:                                      │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ Orphan Detection → Consistency Checks → Deduplication  │  │      │
│   │  │     │                    │                     │        │  │      │
│   │  │  Quarantine         Auto-repair            Merge       │  │      │
│   │  │  suspicious         safe mismatches        workflow    │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Prisma $extends Stack:                                       │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ Layer 1: Soft delete filter (isDeleted: false)         │  │      │
│   │  │ Layer 2: Tenant context injection (tenantId)           │  │      │
│   │  │ Layer 3: Audit logging (create/update/delete → log)    │  │      │
│   │  │ Layer 4: Computed fields (fullName, tenure, netPay)    │  │      │
│   │  │ Layer 5: JSON validation (Zod schemas for 115 fields)  │  │      │
│   │  │ Layer 6: Slow query monitoring ($allOperations timing)  │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Job Processing & Event Platform Architecture

### Job & Queue Platform Inventory

| Component           | Implementation                                              | Size               | Status                   |
| ------------------- | ----------------------------------------------------------- | ------------------ | ------------------------ |
| Job Files           | `/lib/jobs/*.ts` — 10 files                                 | 67-124 lines each  | ALL MOCK (no DB queries) |
| RabbitMQ Client     | `rabbitmq.ts` — 3 exchanges, 6 queues, 3 DLQ                | 373 lines          | Connection + retry logic |
| Messaging Service   | `messaging.service.ts` — Redis job metadata, sync fallback  | 320 lines          | Bridge layer             |
| @aura/messaging     | QueueManager — 10 queue configs with TTL/retry/DLQ          | 249 lines (config) | Package ready            |
| BullMQ Workers      | 4 workers across 3 microservices (concurrency: 5/3/10/10)   | 501 lines total    | Production-grade         |
| node-cron Scheduler | `scheduler.ts` — 8 cron jobs, API at `/api/scheduler`       | 547 lines          | In-memory state          |
| Local EventBus      | `eventBus.ts` — wildcard sub, DLQ, 1K history               | 346 lines          | In-memory                |
| Domain EventBus     | `@aura/events` — typed DomainEvent, 10K store               | 143 lines          | Package ready            |
| Domain Events       | employee(9), leave(5), payroll(7)                           | 294 lines          | 23 events defined        |
| Phase 3 Init        | messaging → search → events → scheduler + graceful shutdown | Chain init         | Functional               |

### Enterprise Job Processing Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                ENTERPRISE JOB PROCESSING & EVENT PLATFORM               │
│                                                                         │
│   JOB ORCHESTRATION ENGINE:                                             │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Job Pipeline (DAG-based):                                    │      │
│   │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │      │
│   │  │ Validate │──▶│ Calculate│──▶│ Process  │──▶│ Generate │ │      │
│   │  │ Employees│   │ Gross Pay│   │ Deductions│   │ Payslips │ │      │
│   │  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │      │
│   │       │              │              │              │          │      │
│   │   checkpoint     checkpoint     checkpoint     checkpoint    │      │
│   │                                                               │      │
│   │  Pipeline Templates:                                          │      │
│   │  • Payroll end-to-end (validate → tax → deduct → net → bank) │      │
│   │  • Onboarding (IT → badge → training → buddy → checklist)    │      │
│   │  • Offboarding (revoke → assets → F&F → exit → alumni)       │      │
│   │                                                               │      │
│   │  Execution Guarantees:                                        │      │
│   │  • Distributed lock (Redlock) — no duplicate execution        │      │
│   │  • Idempotency keys — dedup via payload hash                  │      │
│   │  • Configurable timeout per job type                          │      │
│   │  • Chunked processing (1000/batch) with resume                │      │
│   │  • Priority queues: CRITICAL(10) > HIGH(7) > NORMAL(5)       │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   UNIFIED QUEUE ARCHITECTURE:                                           │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌─────────────────────┐    ┌──────────────────────────┐    │      │
│   │  │ RabbitMQ (AMQP)     │    │ BullMQ (Redis)           │    │      │
│   │  │ Cross-service       │    │ Within-service            │    │      │
│   │  │ pub/sub             │    │ job processing            │    │      │
│   │  │                     │    │                           │    │      │
│   │  │ Exchanges:          │    │ Queues:                   │    │      │
│   │  │ • aura.notifications│    │ • metrics-aggregation (5) │    │      │
│   │  │ • aura.documents    │    │ • report-generation (3)   │    │      │
│   │  │ • aura.payroll      │    │ • webhook-delivery (10)   │    │      │
│   │  │ • aura.events       │    │ • workflow-execution (10) │    │      │
│   │  │                     │    │                           │    │      │
│   │  │ DLQ sinks:          │    │ Features:                 │    │      │
│   │  │ • dlq.notifications │    │ • Rate limiter 100/s      │    │      │
│   │  │ • dlq.documents     │    │ • Progress tracking       │    │      │
│   │  │ • dlq.payroll       │    │ • Exponential backoff     │    │      │
│   │  └──────────┬──────────┘    └──────────────┬───────────┘    │      │
│   │             │                               │                │      │
│   │             └───────────┬───────────────────┘                │      │
│   │                         │                                    │      │
│   │                   ┌─────▼─────┐                              │      │
│   │                   │ Unified   │                              │      │
│   │                   │ Monitoring│                              │      │
│   │                   │           │                              │      │
│   │                   │ • Bull Board (BullMQ UI)                 │      │
│   │                   │ • RabbitMQ Management                    │      │
│   │                   │ • Prometheus metrics                     │      │
│   │                   │ • Queue depth alerts                     │      │
│   │                   │ • DLQ consumer workers                   │      │
│   │                   │ • Back-pressure handling                  │      │
│   │                   └───────────┘                              │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   SCHEDULER ENGINE:                                                     │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌───────────────────────────────────────────────────────┐   │      │
│   │  │  Job              │ Cron           │ Schedule          │   │      │
│   │  │  ─────────────────┼────────────────┼────────────────── │   │      │
│   │  │  Payroll check     │ 0 0 * * *      │ Daily midnight    │   │      │
│   │  │  Monthly payroll   │ 0 2 1 * *      │ 1st of month 2AM  │   │      │
│   │  │  Leave accrual     │ 0 1 * * *      │ Daily 1 AM        │   │      │
│   │  │  Attendance check  │ 0 * * * *      │ Every hour        │   │      │
│   │  │  Weekly reports    │ 0 8 * * 1      │ Monday 8 AM       │   │      │
│   │  │  Statutory reports │ 0 23 28 * *    │ 28th of month     │   │      │
│   │  │  Cache warmup      │ 0 */6 * * *    │ Every 6 hours     │   │      │
│   │  │  DB cleanup        │ 0 3 * * *      │ Daily 3 AM        │   │      │
│   │  └───────────────────────────────────────────────────────┘   │      │
│   │                                                               │      │
│   │  Enterprise Enhancements:                                     │      │
│   │  • Distributed lock (Redlock) — one-instance execution        │      │
│   │  • Persistent state (Redis/DB) — survives restarts            │      │
│   │  • Dynamic CRUD via API — no code deployment needed           │      │
│   │  • Timezone-aware — per-tenant "midnight"                     │      │
│   │  • Dependency resolution — statutory waits for payroll        │      │
│   │  • Dry-run simulation — predict next N executions             │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   EVENT-DRIVEN ARCHITECTURE:                                            │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Unified Event Platform (@aura/event-platform):               │      │
│   │  ┌────────────────────────────────────────────────────────┐  │      │
│   │  │ DomainEvent<T>:                                         │  │      │
│   │  │ • eventId (UUID)      • aggregateId                     │  │      │
│   │  │ • eventType           • aggregateType                   │  │      │
│   │  │ • tenantId            • userId                          │  │      │
│   │  │ • correlationId       • causationId                     │  │      │
│   │  │ • version             • metadata (session, IP, UA)      │  │      │
│   │  └────────────────────────────────────────────────────────┘  │      │
│   │                                                               │      │
│   │  Domain Events (23 defined):                                  │      │
│   │  Employee: Created, Updated, Terminated, Promoted, Demoted    │      │
│   │  Leave: Requested, Approved, Rejected, Cancelled, Withdrawn   │      │
│   │  Payroll: Initiated, Calculated, Approved, Processed, Released│      │
│   │                                                               │      │
│   │  Saga Patterns (Cross-Domain):                                │      │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │      │
│   │  │ HR       │─▶│ IT       │─▶│ Payroll  │─▶│ Benefits │   │      │
│   │  │ Employee │  │ Provision│  │ Setup    │  │ Enroll   │   │      │
│   │  │ Created  │  │ Access   │  │ Salary   │  │ Plans    │   │      │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │      │
│   │       │              │              │              │          │      │
│   │  compensate ◄── compensate ◄── compensate ◄── compensate    │      │
│   │  (on failure)   (on failure)   (on failure)   (on failure)   │      │
│   │                                                               │      │
│   │  Event Store:                                                 │      │
│   │  • Append-only with hash chain (tamper-evident)               │      │
│   │  • Event replay and reprocessing                              │      │
│   │  • Schema registry with versioning                            │      │
│   │  • Cross-service propagation via RabbitMQ topics              │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   OBSERVABILITY:                                                        │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │      │
│   │  │ Bull Board     │  │ Prometheus    │  │ OpenTelemetry │   │      │
│   │  │ Queue UI       │  │ Metrics       │  │ Tracing       │   │      │
│   │  │               │  │               │  │               │   │      │
│   │  │ • Job inspect │  │ • Queue depth │  │ • Enqueue →   │   │      │
│   │  │ • Retry/remove│  │ • Throughput  │  │   wait →      │   │      │
│   │  │ • Progress    │  │ • Error rate  │  │   process →   │   │      │
│   │  │ • Payload view│  │ • Latency P99 │  │   complete    │   │      │
│   │  └───────────────┘  └───────────────┘  └───────────────┘   │      │
│   │                                                               │      │
│   │  Alerting Pipeline:                                           │      │
│   │  • P1: Payroll job failure → PagerDuty                        │      │
│   │  • P2: Notification DLQ depth > 0 → Slack                    │      │
│   │  • P3: Report generation slow → email                         │      │
│   │  • SLA monitoring per job type with breach alerting            │      │
│   │  • Cost attribution per tenant for billing                    │      │
│   └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Microservices & Service Mesh Architecture

### Microservices Inventory

| Service              | Port   | Framework    | Status         | Lines  | Workers  | Health                          |
| -------------------- | ------ | ------------ | -------------- | ------ | -------- | ------------------------------- |
| auth-service         | 3001   | Fastify 4.25 | **Production** | 1,200+ | —        | /health /ready /live (DB+Redis) |
| employee-service     | 3002   | Raw HTTP     | **STUB**       | 34     | —        | None                            |
| notification-service | 3003   | Raw HTTP     | **STUB**       | 34     | —        | None                            |
| document-service     | 3004   | Raw HTTP     | **STUB**       | 34     | —        | None                            |
| payroll-service      | 3005   | Raw HTTP     | **STUB**       | 34     | —        | None                            |
| ai-service           | 3006\* | Fastify 4.26 | Functional     | 560+   | —        | /health (basic)                 |
| analytics-service    | 3007   | Fastify 4.26 | Functional     | 420+   | 2 BullMQ | /health (basic)                 |
| integration-service  | 3008   | Fastify 4.26 | Functional     | 695+   | 1 BullMQ | /health (basic)                 |
| scheduling-service   | 3009   | Fastify 4.26 | Functional     | 504+   | —        | /health (basic)                 |
| workflow-service     | 3010   | Fastify 4.26 | Functional     | 718+   | 1 BullMQ | /health (basic)                 |

_\*ai-service currently on 3000 (conflict) — needs reassignment to 3006_

### Enterprise Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│              ENTERPRISE MICROSERVICES & SERVICE MESH                     │
│                                                                         │
│   SERVICE TOPOLOGY:                                                     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                     API GATEWAY (Kong)                       │      │
│   │  • Rate limiting (global + per-service)                      │      │
│   │  • Authentication (JWT validation)                           │      │
│   │  • Request correlation (X-Correlation-ID)                    │      │
│   │  • Traffic splitting (canary/blue-green)                     │      │
│   │  • Prometheus metrics                                        │      │
│   └──────────┬──────────────────────────────────────┬───────────┘      │
│              │          ISTIO SERVICE MESH           │                   │
│              │  • mTLS STRICT (all traffic encrypted)│                   │
│              │  • Outlier detection / circuit break   │                   │
│              │  • Retry policies (3x, 2s timeout)    │                   │
│              │  • Distributed tracing (Datadog)      │                   │
│              ▼                                       ▼                   │
│   ┌─────────────────┐  ┌──────────────────────────────────────┐        │
│   │  SYNC (gRPC)    │  │  ASYNC (RabbitMQ + BullMQ)           │        │
│   │                 │  │                                       │        │
│   │  .proto defs:   │  │  RabbitMQ Exchanges:                  │        │
│   │  • EmployeeSvc  │  │  • aura.notifications (topic)         │        │
│   │  • PayrollSvc   │  │  • aura.documents (direct)            │        │
│   │  • NotifySvc    │  │  • aura.payroll (direct)              │        │
│   │                 │  │  • aura.events (fanout)               │        │
│   │  Features:      │  │                                       │        │
│   │  • Conn pooling │  │  BullMQ Queues:                       │        │
│   │  • Deadlines    │  │  • metrics-aggregation (C:5)          │        │
│   │  • Health proto │  │  • report-generation (C:3)            │        │
│   │  • Proto ver.   │  │  • webhook-delivery (C:10, 100/s)    │        │
│   │                 │  │  • workflow-execution (C:10)           │        │
│   └─────────────────┘  └──────────────────────────────────────┘        │
│                                                                         │
│   SERVICE GRID (10 services):                                           │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│   │  Auth   │ │Employee │ │ Notif.  │ │Document │ │ Payroll │       │
│   │  :3001  │ │  :3002  │ │  :3003  │ │  :3004  │ │  :3005  │       │
│   │ JWT/MFA │ │CRUD/Srch│ │Email/SMS│ │S3/Virus │ │Tax/Calc │       │
│   │ OAuth2  │ │OrgChart │ │Push/FCM │ │Presign  │ │MultiCtry│       │
│   │ SAML    │ │History  │ │Template │ │Version  │ │BankFile │       │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│   │   AI    │ │Analytics│ │ Integr. │ │Schedule │ │Workflow │       │
│   │  :3006  │ │  :3007  │ │  :3008  │ │  :3009  │ │  :3010  │       │
│   │Attrition│ │Headcount│ │Slack    │ │Conflict │ │DAG Exec │       │
│   │Resume   │ │Turnover │ │Teams    │ │ShiftSwap│ │Approval │       │
│   │Predict  │ │PDF/Excel│ │Webhook  │ │Avail.   │ │Parallel │       │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                                         │
│   RESILIENCE PATTERNS:                                                  │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │      │
│   │  │ Circuit  │  │ Retry    │  │ Bulkhead │  │ Timeout  │   │      │
│   │  │ Breaker  │  │ Policy   │  │ Pattern  │  │ Budget   │   │      │
│   │  │ (opossum)│  │          │  │          │  │          │   │      │
│   │  │          │  │ • 3 max  │  │ • Per-dep│  │ • DB: 5s │   │      │
│   │  │ • 5 fail │  │ • Exp.   │  │   pool   │  │ • Redis:2│   │      │
│   │  │ • 30s    │  │   backoff│  │ • Per-   │  │ • API:30s│   │      │
│   │  │   reset  │  │ • Jitter │  │   tenant │  │ • gRPC:10│   │      │
│   │  │ • Half-  │  │ • No 4xx │  │ • Queue  │  │ • Prop-  │   │      │
│   │  │   open:3 │  │   retry  │  │   based  │  │   agate  │   │      │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │      │
│   │                                                               │      │
│   │  Fallback Strategies:                                         │      │
│   │  • employee-svc: cached last-known on DB failure              │      │
│   │  • notif-svc: queue to disk on RabbitMQ failure               │      │
│   │  • doc-svc: local temp storage on S3 failure                  │      │
│   │  • payroll-svc: read-only mode with cached calcs              │      │
│   │  • ai-svc: rule-based when ML model unavailable               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   DEPLOYMENT & INFRASTRUCTURE:                                          │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Kubernetes:                                                  │      │
│   │  ┌──────────────────────────────────────────────────────┐    │      │
│   │  │ Namespace: auraos / auraos-staging / auraos-dev       │    │      │
│   │  │                                                        │    │      │
│   │  │ Per-Service:                                           │    │      │
│   │  │ • Deployment (3+ replicas prod, RollingUpdate)         │    │      │
│   │  │ • HPA (CPU 70%, Memory 80%, custom metrics)            │    │      │
│   │  │ • PDB (minAvailable: 2 for critical services)          │    │      │
│   │  │ • ServiceAccount + RBAC                                │    │      │
│   │  │ • livenessProbe + readinessProbe + startupProbe        │    │      │
│   │  │ • Pod anti-affinity for HA                             │    │      │
│   │  └──────────────────────────────────────────────────────┘    │      │
│   │                                                               │      │
│   │  Helm:                        Terraform:                      │      │
│   │  • Chart per service          • EKS/GKE/AKS cluster           │      │
│   │  • Library chart (common)     • RDS PostgreSQL Multi-AZ       │      │
│   │  • values-{env}.yaml          • ElastiCache Redis cluster     │      │
│   │  • Chart museum/OCI           • Amazon MQ (RabbitMQ)          │      │
│   │                               • S3 + CloudFront               │      │
│   │  CI/CD:                       • IAM + networking              │      │
│   │  • Build → Test → Scan        • State in S3+DynamoDB          │      │
│   │  • Docker build → Push                                        │      │
│   │  • Deploy → Verify                                            │      │
│   │  • Selective per-service                                      │      │
│   │  • Promotion gates                                            │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   CONFIG & SECRETS:                                                     │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌──────────────────┐  ┌───────────────┐  ┌──────────────┐ │      │
│   │  │ HashiCorp Vault  │  │ Unleash       │  │ @aura/config │ │      │
│   │  │ Secrets Manager  │  │ Feature Flags │  │ Typed Config │ │      │
│   │  │                  │  │               │  │              │ │      │
│   │  │ • Dynamic creds  │  │ • Per-tenant  │  │ • Zod valid. │ │      │
│   │  │ • Auto-rotation  │  │ • Per-service │  │ • Fail-fast  │ │      │
│   │  │ • Scoped access  │  │ • Gradual     │  │ • Hot-reload │ │      │
│   │  │ • K8s External   │  │   rollout     │  │ • Env-aware  │ │      │
│   │  │   Secrets        │  │ • Killswitch  │  │ • Audit trail│ │      │
│   │  └──────────────────┘  └───────────────┘  └──────────────┘ │      │
│   └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Enterprise Seed Data & Master Data Management Architecture

> **Gap Reference**: Section 28 — Enterprise Seed Data & Master Data Management (44 tasks)
> **Audit Finding**: 40 seed files (12,127 lines), but 14/15 named seeds target non-existent Prisma models.
> Only 30% of 207 models have seed data. Named seeds not wired to orchestrator.
> **Benchmark**: Workday Prism Analytics, SAP MDG, Oracle Data Hub, Ceridian Reference Data

### 28.1 Seed Orchestration & Schema Alignment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SEED ORCHESTRATION ENGINE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   SEED REGISTRY:                                                        │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  seed-manifest.json                                          │      │
│   │  ┌─────────────────────────────────────────────────────────┐ │      │
│   │  │ {                                                        │ │      │
│   │  │   "seeds": [                                             │ │      │
│   │  │     { "name": "holidays",                                │ │      │
│   │  │       "model": "HolidayCalendar",                        │ │      │
│   │  │       "file": "holiday-calendar.seed.ts",                │ │      │
│   │  │       "depends": ["countries", "tenants"],               │ │      │
│   │  │       "order": 10,                                        │ │      │
│   │  │       "idempotent": true,                                 │ │      │
│   │  │       "schema_validated": true }                          │ │      │
│   │  │   ]                                                       │ │      │
│   │  │ }                                                         │ │      │
│   │  └─────────────────────────────────────────────────────────┘ │      │
│   │                                                               │      │
│   │  Dependency Graph (DAG):                                      │      │
│   │  tenants → countries → currencies → tax-jurisdictions         │      │
│   │       ↘                     ↘                                 │      │
│   │    org-units → departments → positions → employees            │      │
│   │       ↘                                                       │      │
│   │    pay-groups → salary-components → pay-schedules             │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   SCHEMA VALIDATION:                                                    │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  Pre-Seed Checks:                                             │      │
│   │  • Prisma introspect → verify model exists in schema         │      │
│   │  • Column mapping → validate all seed fields match model     │      │
│   │  • FK resolution → confirm referenced records exist          │      │
│   │  • Enum validation → seed values match Prisma enums          │      │
│   │                                                               │      │
│   │  Execution Modes:                                             │      │
│   │  • upsert (default) — idempotent create-or-update            │      │
│   │  • create-only — skip existing records                       │      │
│   │  • replace — truncate + re-seed (dev only)                   │      │
│   │  • incremental — version-based delta seeds                   │      │
│   │                                                               │      │
│   │  CLI: npx prisma db seed --mode=upsert --group=statutory     │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 28.2 GCC & India Statutory Master Data

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STATUTORY MASTER DATA PLATFORM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   GCC STATUTORY (6 countries):                                          │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │      │
│   │  │ UAE 🇦🇪     │  │ KSA 🇸🇦     │  │ Bahrain 🇧🇭 │             │      │
│   │  │            │  │            │  │            │             │      │
│   │  │ • WPS bank │  │ • GOSI     │  │ • SIO      │             │      │
│   │  │   codes    │  │   employer │  │   employer │             │      │
│   │  │ • Free     │  │   12%/     │  │   12%/     │             │      │
│   │  │   zones    │  │   Saudi 22%│  │   worker 7%│             │      │
│   │  │ • MOHRE    │  │ • Nitaqat  │  │ • LMRA     │             │      │
│   │  │   codes    │  │   tiers    │  │   permit   │             │      │
│   │  │ • Gratuity │  │ • EOSB     │  │   types    │             │      │
│   │  │   21d/30d  │  │   formula  │  │ • Gratuity │             │      │
│   │  └────────────┘  └────────────┘  └────────────┘             │      │
│   │                                                               │      │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │      │
│   │  │ Oman 🇴🇲    │  │ Qatar 🇶🇦   │  │ Kuwait 🇰🇼  │             │      │
│   │  │            │  │            │  │            │             │      │
│   │  │ • PASI     │  │ • GRSIA    │  │ • PIFSS    │             │      │
│   │  │   employer │  │   rates    │  │   employer │             │      │
│   │  │   11.5%    │  │ • QFC      │  │   11.5%    │             │      │
│   │  │ • ROP      │  │   vs non-  │  │ • KFAS     │             │      │
│   │  │   permit   │  │   QFC      │  │ • Zakat    │             │      │
│   │  │   types    │  │ • Kafala   │  │ • Indemnity│             │      │
│   │  │ • Omaniz.  │  │   reform   │  │   formula  │             │      │
│   │  └────────────┘  └────────────┘  └────────────┘             │      │
│   │                                                               │      │
│   │  Effective Dating: All rates versioned by effective_from      │      │
│   │  Rate History: Current + historical rates preserved           │      │
│   │  Update Pipeline: govt_gazette → PR → review → seed          │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   INDIA STATUTORY:                                                      │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌─────────────────────┐  ┌─────────────────────┐           │      │
│   │  │ PF (Provident Fund) │  │ ESI (State Insur.)  │           │      │
│   │  │                     │  │                     │           │      │
│   │  │ • Employee 12%      │  │ • Employee 0.75%    │           │      │
│   │  │ • Employer 12%      │  │ • Employer 3.25%    │           │      │
│   │  │   (3.67% EPF +      │  │ • Wage ceiling      │           │      │
│   │  │    8.33% EPS)        │  │   ₹21,000/month    │           │      │
│   │  │ • Admin 0.5%        │  │ • 28 state offices  │           │      │
│   │  │ • EDLI 0.5%         │  │                     │           │      │
│   │  │ • Wage ceiling      │  │                     │           │      │
│   │  │   ₹15,000/month     │  │                     │           │      │
│   │  └─────────────────────┘  └─────────────────────┘           │      │
│   │                                                               │      │
│   │  ┌─────────────────────┐  ┌─────────────────────┐           │      │
│   │  │ TDS (Tax Deduction) │  │ Professional Tax    │           │      │
│   │  │                     │  │                     │           │      │
│   │  │ • Old regime slabs  │  │ • 28 state slabs    │           │      │
│   │  │ • New regime slabs  │  │ • Maharashtra max   │           │      │
│   │  │ • Section 80C-80U   │  │   ₹2,500/year      │           │      │
│   │  │ • HRA exemption     │  │ • Karnataka max     │           │      │
│   │  │ • Standard deduction│  │   ₹2,500/year      │           │      │
│   │  │   ₹50,000           │  │ • Effective dates   │           │      │
│   │  │ • Surcharge tiers   │  │   per state         │           │      │
│   │  └─────────────────────┘  └─────────────────────┘           │      │
│   │                                                               │      │
│   │  Additional: LWF (16 states), Gratuity (15d/26d formula),   │      │
│   │  Bonus Act (8.33%-20%), Minimum Wages (state × industry)    │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 28.3 Master Data Management (MDM) Infrastructure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MASTER DATA MANAGEMENT PLATFORM                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   GLOBAL REFERENCE DATA:                                                │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ISO Standards:           HR-Specific:                        │      │
│   │  • ISO 3166 countries     • ISCO-08 occupation codes          │      │
│   │    (249 + subdivisions)   • ISIC Rev.4 industry codes         │      │
│   │  • ISO 4217 currencies    • SOC occupation codes (US)         │      │
│   │    (180 + decimal rules)  • NAICS industry codes (US)         │      │
│   │  • ISO 639 languages      • EEO-1 job categories             │      │
│   │    (7,000+ codes)         • FLSA exemption statuses           │      │
│   │  • IANA timezones         • Visa/permit type catalogs         │      │
│   │    (400+ zones)           • Employment contract types         │      │
│   │  • UN M49 regions         • Termination reason codes          │      │
│   │                           • Relationship types                │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   MDM INFRASTRUCTURE:                                                   │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  ┌─────────────────────┐                                     │      │
│   │  │ Effective Dating    │                                     │      │
│   │  │                     │                                     │      │
│   │  │ • effective_from    │ ← Every master record has           │      │
│   │  │ • effective_to      │   time-bounded validity             │      │
│   │  │ • is_current (comp.)│ ← Computed column for fast queries  │      │
│   │  │ • version (serial)  │ ← Monotonic version number          │      │
│   │  │ • change_reason     │ ← Audit trail for rate changes      │      │
│   │  └─────────────────────┘                                     │      │
│   │                                                               │      │
│   │  ┌─────────────────────┐  ┌─────────────────────┐           │      │
│   │  │ Golden Record Dedup │  │ Data Lineage        │           │      │
│   │  │                     │  │                     │           │      │
│   │  │ • Fuzzy match       │  │ • Source tracking    │           │      │
│   │  │   (employee names)  │  │   (seed, import,    │           │      │
│   │  │ • Merge rules       │  │    API, migration)   │           │      │
│   │  │   (survivor logic)  │  │ • Transformation     │           │      │
│   │  │ • Cross-entity      │  │   history            │           │      │
│   │  │   matching          │  │ • Impact analysis    │           │      │
│   │  │ • Confidence score  │  │   (who uses this?)   │           │      │
│   │  └─────────────────────┘  └─────────────────────┘           │      │
│   │                                                               │      │
│   │  ┌─────────────────────┐  ┌─────────────────────┐           │      │
│   │  │ Governance Workflow │  │ Data Quality Engine │           │      │
│   │  │                     │  │                     │           │      │
│   │  │ • Steward approval  │  │ • Completeness      │           │      │
│   │  │ • Change request    │  │ • Uniqueness         │           │      │
│   │  │ • Version diff      │  │ • Validity           │           │      │
│   │  │ • Rollback          │  │ • Timeliness         │           │      │
│   │  │ • Bulk review       │  │ • DQ score per model │           │      │
│   │  └─────────────────────┘  └─────────────────────┘           │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
│   DEMO & TEST DATA FACTORIES:                                           │
│   ┌──────────────────────────────────────────────────────────────┐      │
│   │                                                               │      │
│   │  @faker-js/faker + Custom Factories:                          │      │
│   │  • 50-employee "startup" dataset                             │      │
│   │  • 500-employee "mid-market" dataset                         │      │
│   │  • 5,000-employee "enterprise" dataset                       │      │
│   │  • 100,000-employee "stress test" dataset                    │      │
│   │                                                               │      │
│   │  Data Anonymization:                                          │      │
│   │  • Production → sanitized (PII masking)                      │      │
│   │  • Deterministic faker (reproducible)                        │      │
│   │  • Referential integrity preserved                           │      │
│   │  • Statistical distribution maintained                       │      │
│   │                                                               │      │
│   └──────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

---

## Enterprise GAP Closure Reference

> **Full Todolist**: [GAP-100-PERCENT-TODOLIST.md](./GAP-100-PERCENT-TODOLIST.md) v4.12 — 2,183 tasks across 31 sections
> **Overall Progress**: 487/2,183 (22.3%) — Sections 1-2 complete; Sections 3-4 upgraded with 234 enterprise tasks

### Gap Sections by Release Phase

| Phase                         | Sections | Tasks | Domain                                                                                                                                                                                                |
| ----------------------------- | -------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1.0 (67.5%)**              | 1-4      | 721   | Frontend, Backend, Seeds (+128 enterprise), Backend-UI Integration (+106 enterprise, incl. 17 P0 blockers: React Query, Zustand, Socket.IO, react-hook-form, Slack/Teams/DocuSign SDKs not installed) |
| **v2.0 (Enterprise Infra)**   | 5-9      | 378   | DR/HA, MENA/APAC Compliance, AI/ML, Security, DevOps                                                                                                                                                  |
| **v3.0 (Enterprise Modules)** | 10-28    | 1,008 | HR Ops, Payroll, Time, Engagement, Mobile, ESS, Benefits, Recruitment, L&D, Analytics, Admin, Database, Jobs, Microservices, MDM                                                                      |
| **v4.0 (Security & Cloud)**   | 29-31    | 76    | Security Operations & Threat Mgmt, Cloud Infra & FinOps, AI Governance & MLOps                                                                                                                        |

### v4.0 Sections (New — Enterprise Security, Cloud & AI Governance)

- **Section 29: Enterprise Security Operations & Threat Management** (30 tasks) — WAF/DDoS protection, SIEM integration, third-party risk management, data protection & privacy operations
- **Section 30: Cloud Infrastructure, FinOps & Developer Experience** (26 tasks) — Multi-region/CDN architecture, FinOps & cloud cost optimization, developer portal & API economy
- **Section 31: AI Governance, MLOps & Responsible AI** (20 tasks) — ML pipeline & model lifecycle, responsible AI & EU AI Act compliance, bias detection, human-in-the-loop

---

_Architecture Version: 4.2_
_Status: Enterprise Reference Architecture_
_Last Updated: February 2026_
_Classification: Internal — Confidential_
_Modules: 72+ HR modules across 31 enterprise sections_
_Backend: 656 API routes | 207 models | 170+ services | 10 microservices_
_GAP Reference: [GAP-100-PERCENT-TODOLIST.md](./GAP-100-PERCENT-TODOLIST.md) — 2,077 tasks_

**"Configuration is Code, Code is Configuration"**
