# 🏗️ KreupAI.HCM - Solution Architecture & Configuration Guidelines

## 📋 Document Purpose
This document serves as the **single source of truth** for all architectural decisions, configuration standards, and implementation guidelines for KreupAI.HCM. Every feature implementation MUST reference and comply with these standards.

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
  
  private interpolate(
    template: string, 
    variables: Record<string, any>
  ): string {
    return template.replace(
      /\{\{(\w+)\}\}/g,
      (match, key) => variables[key] || match
    );
  }
}

// Usage
const message = await translationService.getTranslation(
  'welcome.message',
  'ar-SA',
  { name: 'أحمد', count: 5 }
);
```

### Number & Currency Formatting

#### Dynamic Currency Configuration
```typescript
interface CurrencyConfig {
  code: string;              // 'AED', 'USD'
  symbol: string;            // 'د.إ', '$'
  name_key: string;          // Translation key
  decimal_places: number;    // 2, 3
  decimal_separator: string; // '.', ','
  thousand_separator: string;// ',', ' '
  symbol_position: 'before' | 'after' | 'before_space' | 'after_space';
  negative_format: string;   // '-{amount}', '({amount})'
  rounding_mode: 'UP' | 'DOWN' | 'HALF_UP' | 'HALF_DOWN';
}

class CurrencyFormatter {
  format(
    amount: number,
    currencyCode: string,
    locale: string
  ): string {
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
  updateConfiguration(
    module: String!
    key: String!
    value: JSON!
  ): Configuration
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
    key_rotation: 90_days
    fields:
      - salary_amount
      - bank_account_number
      - national_id
      - passport_number
  
  in_transit:
    protocol: TLS 1.3
    cipher_suites:
      - TLS_AES_256_GCM_SHA384
      - TLS_CHACHA20_POLY1305_SHA256
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
    description: "Global system configurations"
    overridable: false
    
  2_tenant:
    description: "Organization-level configurations"
    overridable: true
    
  3_module:
    description: "Module-specific configurations"
    overridable: true
    
  4_role:
    description: "Role-based configurations"
    overridable: true
    
  5_user:
    description: "User preferences"
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
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
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
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  tenantId: string;
  userId?: string;
  sessionId: string;
  requestId: string;
  module: string;
  action: string;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    message: string;
    stack: string;
    code: string;
  };
}

// Structured Logging
logger.info({
  module: 'PAYROLL',
  action: 'PROCESS_SALARY',
  message: 'Salary processing started',
  metadata: {
    employeeCount: 1500,
    payrollMonth: '2024-01',
    currency: 'AED'
  }
});
```

### Metrics Collection

```yaml
metrics:
  business:
    - payroll.processing.time
    - employee.onboarding.duration
    - leave.approval.sla
    
  technical:
    - api.response.time
    - database.query.duration
    - cache.hit.ratio
    
  infrastructure:
    - cpu.utilization
    - memory.usage
    - disk.io
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

### Configuration Testing

```typescript
describe('Configuration Service', () => {
  it('should return tenant-specific configuration', async () => {
    const config = await configService.get(
      'dateFormat',
      'COMMON',
      'DD/MM/YYYY',
      { tenantId: 'tenant-001' }
    );
    expect(config).toBe('MM/DD/YYYY');
  });
  
  it('should handle RTL languages correctly', async () => {
    const translation = await configService.translate(
      'welcome.message',
      'ar-SA',
      { name: 'أحمد' }
    );
    expect(translation).toContain('مرحباً');
  });
  
  it('should format currency based on configuration', async () => {
    const formatted = await configService.formatCurrency(
      1234.56,
      'AED'
    );
    expect(formatted).toBe('د.إ 1,234.56');
  });
});
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up configuration database schema
- [ ] Create configuration service
- [ ] Implement language pack system
- [ ] Set up list management (enum replacement)
- [ ] Create tenant isolation mechanism

### Phase 2: Internationalization
- [ ] Implement translation service
- [ ] Add RTL/LTR support
- [ ] Create currency formatting service
- [ ] Add date/time formatting
- [ ] Implement number formatting

### Phase 3: Security
- [ ] Implement JWT with configuration context
- [ ] Set up row-level security
- [ ] Add field-level encryption
- [ ] Implement audit logging

### Phase 4: API Layer
- [ ] Create REST API structure
- [ ] Add GraphQL support (optional)
- [ ] Implement API versioning
- [ ] Add rate limiting

### Phase 5: Deployment
- [ ] Create Docker containers
- [ ] Set up Kubernetes configs
- [ ] Implement health checks
- [ ] Add monitoring/logging

---

## 🚫 ANTI-PATTERNS TO AVOID

### Never Do This:
```typescript
// ❌ Hardcoded values
const LEAVE_TYPES = ['SICK', 'CASUAL', 'ANNUAL'];

// ❌ Fixed language strings
const message = "Welcome to KreupAI";

// ❌ Hardcoded currency
const salary = "$" + amount;

// ❌ Fixed date format
const formatted = moment(date).format('MM/DD/YYYY');

// ❌ Enum in code
enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
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
```

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

  async get<T>(
    key: string,
    module: string,
    defaultValue?: T,
    context?: ConfigContext
  ): Promise<T> {
    // Check cache first
    const cacheKey = `${context?.tenantId}:${module}:${key}`;
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached) return cached;

    // Query database with hierarchy
    const configs = await this.configRepo
      .createQueryBuilder('config')
      .where('config.tenant_id = :tenantId', { 
        tenantId: context?.tenantId 
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

  async getListItems(
    listType: string,
    context?: ConfigContext
  ): Promise<ListItem[]> {
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
      listType
    ]);
    
    return results.map(r => ({
      code: r.list_code,
      name: r.display_name || r.list_code,
      attributes: r.attributes,
      parentCode: r.parent_code
    }));
  }

  async formatCurrency(
    amount: number,
    currencyCode?: string,
    context?: ConfigContext
  ): Promise<string> {
    const currency = currencyCode || context?.currency || 'USD';
    const config = await this.get<CurrencyConfig>(
      'CURRENCY_CONFIG',
      'FINANCE',
      null,
      context
    );
    
    // Apply formatting based on configuration
    const formatter = new CurrencyFormatter(config[currency]);
    return formatter.format(amount);
  }
}
```

---

## 🎯 SUCCESS CRITERIA

### A properly configured system will:
1. **Never have hardcoded values** - Everything comes from configuration
2. **Support unlimited languages** - Including RTL languages seamlessly
3. **Handle any currency** - With proper formatting and precision
4. **Scale to thousands of tenants** - With complete data isolation
5. **Allow runtime configuration changes** - Without code deployment
6. **Provide complete audit trail** - Every change tracked
7. **Support offline operation** - Configuration cached locally
8. **Enable A/B testing** - Through feature flags
9. **Maintain backward compatibility** - Through versioning
10. **Perform at scale** - Sub-second response times

---

## 📝 FINAL NOTES

This architecture ensures:
- **Complete Configurability**: Nothing is hardcoded
- **True Multi-tenancy**: Complete isolation and customization
- **International Readiness**: Any language, any currency, any region
- **Enterprise Scale**: Handles millions of employees across thousands of organizations
- **Future Proof**: Easy to extend without breaking existing functionality

**Every single feature implementation MUST reference this document and follow these patterns.**

---

*Architecture Version: 1.0*  
*Status: Master Reference Document*  
*Last Updated: 2024*

**"Configuration is Code, Code is Configuration"**