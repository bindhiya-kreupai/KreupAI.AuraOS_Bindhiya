# 🌟 AURA - Master Instructions & Technology Stack
## *The Definitive Guide for Building AURA HCM Platform*

---

## 📋 DOCUMENT AUTHORITY
**THIS IS THE MASTER REFERENCE DOCUMENT**
- Every file MUST include a reference to this document
- All code MUST comply with these standards
- Any deviation requires written approval
- Version: 1.0.0
- Last Updated: 2024

```javascript
/**
 * @project AURA HCM Platform
 * @document docs/AURA-MASTER-INSTRUCTIONS.md
 * @version 1.0.0
 * @compliance Mandatory
 */
```

---

## 🎯 PRODUCT IDENTITY

### Official Naming
```yaml
Product Name: AURA
Full Name: AURA - Intelligent Human Capital Platform
Company: KreupAI
Repository: kreupai-hcm
Domain: aura.hr
AI Assistant: AURA AI
Tagline: "The Intelligence Around Your Workforce"
```

### Branding Rules
- **ALWAYS** use "AURA" in uppercase for the product
- **NEVER** use "Aura" or "aura" except in code variables
- **Repository** remains `kreupai-hcm` for technical purposes
- **Package names** use `@aura/module-name` format

---

## 💻 TECHNOLOGY STACK

### Core Technologies

#### Frontend Stack
```yaml
Framework:
  Primary: Next.js 14+ (App Router)
  Reason: "SSR, SSG, ISR, and excellent DX"
  
UI Framework:
  Primary: React 18+
  State: Zustand + React Query (TanStack Query)
  Forms: React Hook Form + Zod
  
Styling:
  Primary: Tailwind CSS 3.4+
  Components: Shadcn/ui (Base components)
  Animations: Framer Motion
  Icons: Lucide React
  
Language:
  Primary: TypeScript 5.3+
  Config: Strict mode enabled
  
Build Tools:
  Bundler: Turbo (Monorepo)
  Package Manager: pnpm
  Linting: ESLint + Prettier
  Git Hooks: Husky + lint-staged
```

#### Backend Stack
```yaml
Runtime:
  Primary: Node.js 20 LTS
  Alternative: Bun (for performance-critical services)
  
Framework:
  Primary: NestJS 10+
  Reason: "Enterprise-grade, modular, TypeScript-first"
  
API Layer:
  REST: NestJS Controllers
  GraphQL: Apollo Server + TypeGraphQL
  WebSocket: Socket.io
  
Microservices:
  Communication: gRPC
  Message Queue: RabbitMQ
  Event Streaming: Apache Kafka
  Service Mesh: Istio
  
Authentication:
  JWT: jsonwebtoken
  OAuth: Passport.js
  MFA: Speakeasy (TOTP)
  Session: Redis
```

#### Database Stack
```yaml
Primary Database:
  Engine: PostgreSQL 16
  ORM: Prisma 5+
  Migrations: Prisma Migrate
  Connection Pool: PgBouncer
  
Document Store:
  Engine: MongoDB 7
  ODM: Mongoose
  Use Cases: "Logs, configurations, flexible schemas"
  
Cache Layer:
  Primary: Redis 7+
  Use Cases: "Sessions, cache, real-time, queues"
  Client: ioredis
  
Search Engine:
  Primary: Elasticsearch 8+
  Use Cases: "Full-text search, analytics"
  Client: @elastic/elasticsearch
  
Time Series:
  Engine: InfluxDB
  Use Cases: "Attendance, metrics, monitoring"
  
Vector Database:
  Engine: Pinecone / Weaviate
  Use Cases: "AI embeddings, semantic search"
```

#### AI/ML Stack
```yaml
LLM Integration:
  Primary: OpenAI GPT-4
  Fallback: Anthropic Claude
  Local: Llama 2 (via Ollama)
  
ML Framework:
  Training: TensorFlow.js / PyTorch
  Inference: ONNX Runtime
  AutoML: AutoGluon
  
NLP:
  Library: Natural (Node.js)
  Python: spaCy + Transformers
  
Computer Vision:
  OCR: Tesseract.js
  Face Recognition: face-api.js
  
Embeddings:
  Model: OpenAI Ada-002
  Storage: Pinecone
```

#### DevOps & Infrastructure
```yaml
Containerization:
  Runtime: Docker
  Orchestration: Kubernetes (K8s)
  Registry: Harbor / DockerHub
  
CI/CD:
  Pipeline: GitHub Actions
  Alternative: GitLab CI
  Deployment: ArgoCD
  
Cloud Providers:
  Primary: AWS
  Secondary: Azure
  CDN: CloudFlare
  
Infrastructure as Code:
  Primary: Terraform
  Configuration: Ansible
  Secrets: HashiCorp Vault
  
Monitoring:
  APM: DataDog / New Relic
  Logging: ELK Stack
  Metrics: Prometheus + Grafana
  Tracing: Jaeger
  Error: Sentry
```

#### Mobile Stack
```yaml
Framework:
  Primary: React Native + Expo
  Reason: "Code sharing with web, OTA updates"
  
State Management:
  Primary: Zustand
  Persist: MMKV
  
Navigation:
  Library: React Navigation 6
  
Native Modules:
  Biometric: expo-local-authentication
  Camera: expo-camera
  Location: expo-location
  Notifications: expo-notifications
```

---

## 📁 PROJECT STRUCTURE

### Monorepo Organization
```
kreupai-hcm/
├── apps/
│   ├── web/                    # Next.js main application
│   │   ├── src/
│   │   │   ├── app/            # App router pages
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # Base UI components
│   │   │   │   ├── modules/    # Feature components
│   │   │   │   └── layouts/    # Layout components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── services/       # API services
│   │   │   ├── types/          # TypeScript types
│   │   │   └── styles/         # Global styles
│   │   └── public/             # Static assets
│   ├── mobile/                 # React Native app
│   └── admin/                  # Admin dashboard
│
├── services/                   # Microservices
│   ├── config-service/         # Configuration service
│   ├── auth-service/           # Authentication service
│   ├── employee-service/       # Employee management
│   ├── payroll-service/        # Payroll processing
│   ├── ai-service/             # AI/ML service
│   ├── notification-service/   # Notifications
│   └── gateway/                # API Gateway
│
├── packages/                   # Shared packages
│   ├── @aura/ui/              # UI component library
│   ├── @aura/config/          # Shared configuration
│   ├── @aura/types/           # Shared TypeScript types
│   ├── @aura/utils/           # Shared utilities
│   ├── @aura/database/        # Database schemas
│   └── @aura/i18n/            # Internationalization
│
├── infrastructure/             # IaC and DevOps
│   ├── terraform/             # Infrastructure definitions
│   ├── kubernetes/            # K8s manifests
│   ├── docker/                # Dockerfiles
│   └── scripts/               # Automation scripts
│
├── docs/                      # Documentation
│   ├── AURA-MASTER-INSTRUCTIONS.md  # THIS FILE
│   ├── architecture/         # Architecture docs
│   ├── api/                  # API documentation
│   └── guides/               # User guides
│
├── tests/                     # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
│
├── .github/                  # GitHub configuration
│   ├── workflows/           # GitHub Actions
│   └── ISSUE_TEMPLATE/      # Issue templates
│
├── turbo.json               # Turborepo config
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # pnpm workspace config
└── docker-compose.yml       # Local development
```

---

## 🎨 CODING STANDARDS

### File Header Template
**EVERY FILE MUST START WITH THIS HEADER:**

```typescript
/**
 * @module ModuleName
 * @description Brief description of the file's purpose
 * @author Developer Name
 * @date YYYY-MM-DD
 * @version 1.0.0
 * 
 * @project AURA HCM Platform
 * @copyright KreupAI 2024
 * @reference docs/AURA-MASTER-INSTRUCTIONS.md
 * 
 * @aiFeatures List AI features used in this file
 * @configuration References config keys used
 */
```

### TypeScript Standards
```typescript
// ✅ ALWAYS use TypeScript strict mode
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// ✅ ALWAYS define interfaces for data structures
interface AuraEmployee {
  id: string;
  tenantId: string;
  code: string;
  profile: AuraEmployeeProfile;
  metadata: AuraMetadata;
}

// ✅ ALWAYS use enums from configuration service
const leaveTypes = await configService.getListItems('LEAVE_TYPES');

// ❌ NEVER hardcode enums
enum LeaveType { // FORBIDDEN!
  SICK = 'SICK'
}

// ✅ ALWAYS use proper error handling
try {
  const result = await auraService.process();
} catch (error) {
  logger.error('AURA_ERROR', { error, context });
  throw new AuraException(error);
}
```

### React Component Standards
```tsx
/**
 * @component AuraEmployeeCard
 * @module Employee
 */
import { FC, memo } from 'react';
import { useAuraConfig } from '@/hooks/useAuraConfig';
import { useAuraTranslation } from '@/hooks/useAuraTranslation';

interface AuraEmployeeCardProps {
  employeeId: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const AuraEmployeeCard: FC<AuraEmployeeCardProps> = memo(({ 
  employeeId,
  variant = 'default' 
}) => {
  const { t } = useAuraTranslation();
  const config = useAuraConfig();
  
  // Component logic
  
  return (
    <div className="aura-card" data-testid="aura-employee-card">
      {/* Component JSX */}
    </div>
  );
});

AuraEmployeeCard.displayName = 'AuraEmployeeCard';
```

### API Endpoint Standards
```typescript
/**
 * @controller EmployeeController
 * @route /api/v1/employees
 */
@Controller('employees')
@ApiTags('employees')
@UseGuards(AuraAuthGuard)
export class EmployeeController {
  
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @AuraPermission('employee.list.read')
  async findAll(
    @Query() query: PaginationDto,
    @AuraContext() context: AuraRequestContext
  ): Promise<AuraResponse<Employee[]>> {
    return this.employeeService.findAll(query, context);
  }
}
```

### Database Naming Conventions
```sql
-- Tables: snake_case, plural
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  employee_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes: idx_table_columns
CREATE INDEX idx_employees_tenant_code ON employees(tenant_id, employee_code);

-- Foreign keys: fk_table_reference
ALTER TABLE employees 
  ADD CONSTRAINT fk_employees_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Views: vw_description
CREATE VIEW vw_active_employees AS ...;

-- Functions: fn_action_description
CREATE FUNCTION fn_calculate_leave_balance(...);
```

---

## 🔧 CONFIGURATION STANDARDS

### Environment Variables
```bash
# AURA Environment Configuration
# NEVER commit .env files

# System
AURA_ENV=production
AURA_VERSION=1.0.0
AURA_TENANT_MODE=multi

# Database
AURA_DB_HOST=localhost
AURA_DB_PORT=5432
AURA_DB_NAME=aura_hcm
AURA_DB_USER=aura_user
AURA_DB_PASS=secure_password
AURA_DB_SSL=true

# Redis
AURA_REDIS_HOST=localhost
AURA_REDIS_PORT=6379
AURA_REDIS_PASS=secure_password

# AI Services
AURA_OPENAI_KEY=sk-...
AURA_AI_MODEL=gpt-4-turbo
AURA_EMBEDDINGS_MODEL=ada-002

# Security
AURA_JWT_SECRET=secure_jwt_secret
AURA_ENCRYPTION_KEY=secure_encryption_key
AURA_HASH_ROUNDS=10

# Features
AURA_FEATURE_AI=true
AURA_FEATURE_MOBILE=true
AURA_FEATURE_OFFLINE=true
```

### Configuration Service Usage
```typescript
// ALWAYS use configuration service
const dateFormat = await auraConfig.get('dateFormat', 'SYSTEM');
const currency = await auraConfig.get('currency', 'FINANCE');

// NEVER hardcode configurations
const dateFormat = 'MM/DD/YYYY'; // ❌ FORBIDDEN
```

---

## 🌍 INTERNATIONALIZATION

### Translation Keys Format
```yaml
# Pattern: module.feature.element.state
# Example: employee.profile.button.save

employee:
  profile:
    title: "Employee Profile"
    button:
      save: "Save"
      cancel: "Cancel"
    message:
      success: "Profile saved successfully"
      error: "Failed to save profile"
```

### Usage in Code
```typescript
// Always use translation service
const message = t('employee.profile.message.success');

// Never hardcode strings
const message = 'Profile saved successfully'; // ❌ FORBIDDEN
```

---

## 🧪 TESTING STANDARDS

### Test File Structure
```typescript
/**
 * @test EmployeeService
 * @type unit|integration|e2e
 */
describe('AURA: EmployeeService', () => {
  describe('Configuration Compliance', () => {
    it('should load employee types from configuration', async () => {
      // Test implementation
    });
  });
  
  describe('Multi-tenant Isolation', () => {
    it('should isolate data per tenant', async () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements
```yaml
minimum_coverage:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%
  
critical_modules: # 90% minimum
  - auth-service
  - payroll-service
  - config-service
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Git Branch Strategy
```bash
main                # Production-ready code
├── develop        # Development branch
│   ├── feature/*  # New features
│   ├── fix/*      # Bug fixes
│   └── chore/*    # Maintenance tasks
├── release/*      # Release preparation
└── hotfix/*       # Production fixes
```

### Commit Message Format
```bash
# Format: type(scope): subject
# Types: feat, fix, docs, style, refactor, test, chore

feat(employee): add biometric authentication
fix(payroll): correct tax calculation for UAE
docs(api): update employee endpoint documentation
```

### PR Template
```markdown
## 🎯 Purpose
Brief description of changes

## 📋 Checklist
- [ ] Follows AURA-MASTER-INSTRUCTIONS.md
- [ ] Includes file header with reference
- [ ] No hardcoded values
- [ ] Uses configuration service
- [ ] Includes tests
- [ ] Updates documentation

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📸 Screenshots
If applicable
```

---

## 🔐 SECURITY STANDARDS

### Security Checklist
```yaml
authentication:
  - JWT with refresh tokens
  - Multi-factor authentication
  - Session management
  - Password complexity rules

authorization:
  - Role-based access control (RBAC)
  - Attribute-based access control (ABAC)
  - Row-level security
  - Field-level encryption

data_protection:
  - Encryption at rest
  - Encryption in transit (TLS 1.3)
  - PII field encryption
  - Secure key management

compliance:
  - GDPR compliance
  - HIPAA ready
  - SOC 2 Type II
  - ISO 27001
```

---

## 📊 PERFORMANCE STANDARDS

### Performance Targets
```yaml
api_response_time:
  p50: < 100ms
  p95: < 500ms
  p99: < 1000ms

page_load_time:
  first_contentful_paint: < 1.5s
  time_to_interactive: < 3.0s
  largest_contentful_paint: < 2.5s

database_queries:
  simple_select: < 10ms
  complex_join: < 100ms
  bulk_operation: < 1000ms

concurrent_users:
  minimum: 10,000
  target: 50,000
  peak: 100,000
```

---

## 🎯 AI INTEGRATION STANDARDS

### AI Service Usage
```typescript
/**
 * All AI features must:
 * 1. Have fallback mechanisms
 * 2. Log predictions for audit
 * 3. Allow manual override
 * 4. Explain decisions
 */

const prediction = await auraAI.predict({
  model: 'attrition',
  input: employeeData,
  explain: true,
  fallback: 'manual'
});

// Always provide explanation
if (prediction.confidence < 0.8) {
  logger.warn('Low confidence prediction', {
    prediction,
    explanation: prediction.explanation
  });
}
```

---

## 🚨 CRITICAL RULES

### NEVER DO THIS
```typescript
// ❌ Hardcoded values
const LEAVE_TYPES = ['SICK', 'CASUAL'];

// ❌ Direct database queries in components
const employees = await db.query('SELECT * FROM employees');

// ❌ Synchronous operations
const data = fs.readFileSync('file.txt');

// ❌ Untyped variables
let data: any;

// ❌ Console.log in production
console.log('Debug info');

// ❌ Hardcoded strings
const message = "Welcome to AURA";

// ❌ Direct API calls from frontend
fetch('http://localhost:3000/api/employees');
```

### ALWAYS DO THIS
```typescript
// ✅ Configuration-driven
const leaveTypes = await auraConfig.getListItems('LEAVE_TYPES');

// ✅ Service layer abstraction
const employees = await employeeService.findAll();

// ✅ Asynchronous operations
const data = await fs.promises.readFile('file.txt');

// ✅ Strongly typed
interface EmployeeData { /* ... */ }

// ✅ Proper logging
logger.info('AURA_EVENT', { context });

// ✅ Internationalized
const message = t('welcome.message');

// ✅ API service abstraction
const employees = await auraAPI.employees.list();
```

---

## 📦 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Configuration verified
- [ ] Database migrations ready
- [ ] Rollback plan prepared

### Deployment
- [ ] Blue-green deployment
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] Logs aggregating
- [ ] Alerts configured

### Post-deployment
- [ ] Smoke tests passed
- [ ] Performance monitoring
- [ ] Error rate monitoring
- [ ] User acceptance verified

---

## 📚 REFERENCE DOCUMENTS

All developers MUST be familiar with:
1. **This Document** - AURA-MASTER-INSTRUCTIONS.md
2. **Features Document** - 394 features specification
3. **Architecture Document** - Solution architecture
4. **UI/UX Guidelines** - Aurora design system
5. **API Documentation** - OpenAPI specification

---

## 🎯 SUCCESS METRICS

### Code Quality
- **Zero hardcoded values**
- **100% configuration-driven**
- **Full TypeScript coverage**
- **80%+ test coverage**

### Performance
- **Sub-second API responses**
- **3-second page loads**
- **99.9% uptime**

### Scalability
- **10,000+ concurrent users**
- **1M+ employee records**
- **100+ tenants**

---

## 📝 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial master instructions |

---

## ✅ DEVELOPER AGREEMENT

By working on AURA, you agree to:
1. Follow ALL standards in this document
2. Reference this document in every file
3. Never hardcode values
4. Always use configuration services
5. Write tests for all features
6. Document all changes
7. Maintain code quality standards

---

**"AURA - Where Intelligence Meets Excellence"**

*END OF MASTER INSTRUCTIONS*