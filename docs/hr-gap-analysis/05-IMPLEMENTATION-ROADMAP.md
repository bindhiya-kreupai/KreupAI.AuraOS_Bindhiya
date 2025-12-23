# Implementation Roadmap

**Related Documents:**
- [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
- [Detailed GAP Analysis](./02-DETAILED-GAP-ANALYSIS.md)
- [Labour Law Compliance](./03-LABOUR-LAW-COMPLIANCE.md)
- [Module Connections](./06-MODULE-CONNECTIONS.md)
- [AI/ML Strategy](./07-AI-ML-STRATEGY.md)

---

## Roadmap Overview

This roadmap outlines the phased implementation plan to transform AuraOS into the industry's top MENA/APAC HCM solution.

**Total Duration:** 12 months
**Phases:** 4 major phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AURAOS TRANSFORMATION ROADMAP                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Phase 1: MENA Compliance Foundation (Months 1-3)                          │
│  ═══════════════════════════════════                                       │
│  [█████████████████████] WPS/GOSI Integration                              │
│  [█████████████████████] Labour Law Engine                                 │
│  [█████████████████████] Arabic Localization                               │
│  [█████████████████████] EOSB Calculator                                   │
│                                                                             │
│  Phase 2: Core Enhancement (Months 4-6)                                    │
│  ═════════════════════════════════════                                     │
│  [████████████████████] Payroll Engine v2                                  │
│  [████████████████████] Advanced Leave System                              │
│  [████████████████████] Attendance Enhancement                             │
│  [████████████████████] Mobile App MVP                                     │
│                                                                             │
│  Phase 3: Intelligence Layer (Months 7-9)                                  │
│  ═══════════════════════════════════════                                   │
│  [██████████████████] AI/ML Engine                                         │
│  [██████████████████] Predictive Analytics                                 │
│  [██████████████████] Recruitment AI                                       │
│  [██████████████████] Advanced Reporting                                   │
│                                                                             │
│  Phase 4: Scale & Differentiate (Months 10-12)                            │
│  ════════════════════════════════════════════                              │
│  [████████████████] Integration Marketplace                                │
│  [████████████████] Enterprise Features                                    │
│  [████████████████] Agentic AI                                             │
│  [████████████████] India Expansion                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: MENA Compliance Foundation (Months 1-3)

### Objective
Establish complete compliance infrastructure for UAE and Saudi Arabia, with Arabic localization.

### Sprint 1-2: WPS Integration (UAE)

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| WPS Data Models | Employee WPS fields, bank routing | Critical | Backend |
| SIF File Generator | Standard WPS SIF format output | Critical | Backend |
| WPS Validation Engine | Pre-submission validation | Critical | Backend |
| WPS Dashboard | Status tracking, error handling | Critical | Frontend |
| Bank Integration | WPS agent/bank configurations | High | Backend |

#### Technical Implementation

```typescript
// prisma/schema.prisma additions
model WPSConfiguration {
  id              String   @id @default(cuid())
  tenantId        String
  companyId       String
  wpsAgentCode    String   // MoL agent code
  bankCode        String   // Routing bank code
  molCode         String   // Ministry of Labour code
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  company         Company  @relation(fields: [companyId], references: [id])
}

model WPSSubmission {
  id              String   @id @default(cuid())
  tenantId        String
  payrollRunId    String
  submissionDate  DateTime
  status          WPSStatus @default(PENDING)
  sifFileUrl      String?
  responseFile    String?
  totalRecords    Int
  totalAmount     Decimal
  errors          Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant          Tenant   @relation(fields: [tenantId], references: [id])
  payrollRun      PayrollRun @relation(fields: [payrollRunId], references: [id])
}

enum WPSStatus {
  PENDING
  SUBMITTED
  ACCEPTED
  REJECTED
  PARTIAL
}

// services/wps/wps.service.ts
class WPSService {
  async generateSIFFile(payrollRunId: string): Promise<SIFFile> {
    // Validate payroll data
    // Generate SIF format
    // Store file
    // Return file reference
  }

  async validateWPSCompliance(employeeIds: string[]): Promise<ValidationResult[]> {
    // Check labour card numbers
    // Validate bank accounts
    // Check salary limits
  }

  async submitToWPS(submissionId: string): Promise<SubmissionResult> {
    // Submit to WPS portal/agent
    // Track status
    // Handle response
  }
}
```

#### API Endpoints
```
POST   /api/wps/generate/:payrollRunId
GET    /api/wps/validate/:payrollRunId
POST   /api/wps/submit/:payrollRunId
GET    /api/wps/status/:submissionId
GET    /api/wps/submissions
GET    /api/wps/download/:submissionId
```

### Sprint 3-4: GOSI Integration (KSA)

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| GOSI Contribution Calculator | Saudi/Non-Saudi rates | Critical | Backend |
| GOSI File Generator | GOSI submission format | Critical | Backend |
| Mudad Integration | KSA WPS via Mudad | Critical | Backend |
| Nitaqat Tracking | Saudization ratio monitoring | High | Backend |
| GOSI Dashboard | Contributions, status | High | Frontend |

#### Technical Implementation

```typescript
// services/gosi/gosi.service.ts
class GOSIService {
  calculateContributions(employee: Employee): GOSIContribution {
    const cappedSalary = Math.min(employee.totalSalary, 45000);

    if (employee.nationality === 'SAUDI') {
      return {
        employeePension: cappedSalary * 0.0975,
        employerPension: cappedSalary * 0.0975,
        occupationalHazards: cappedSalary * 0.02,
        saned: {
          employee: cappedSalary * 0.0075,
          employer: cappedSalary * 0.0075
        }
      };
    }
    return {
      employeePension: 0,
      employerPension: 0,
      occupationalHazards: cappedSalary * 0.02,
      saned: { employee: 0, employer: 0 }
    };
  }

  async generateGOSIFile(payrollRunId: string): Promise<GOSIFile> {
    // Generate GOSI submission file
  }

  calculateNitaqat(companyId: string): NitaqatResult {
    // Calculate Saudization ratio
    // Determine Nitaqat band
    // Return recommendations
  }
}
```

### Sprint 5-6: Arabic Localization

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Translation Files | Complete AR translations | Critical | i18n Team |
| RTL CSS Framework | Tailwind RTL setup | Critical | Frontend |
| RTL Components | All UI components RTL | Critical | Frontend |
| Arabic Fonts | Noto Sans Arabic | Critical | Frontend |
| Hijri Calendar | Date picker integration | High | Frontend |
| Arabic Validation | Form validation rules | High | Frontend |

### Sprint 7-8: EOSB & Labour Law Engine

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| EOSB Calculator (UAE) | Gratuity calculations | Critical | Backend |
| EOSB Calculator (KSA) | KSA termination benefits | Critical | Backend |
| Leave Law Engine | Country-specific leave rules | Critical | Backend |
| Working Hours Engine | OT calculations, Ramadan | High | Backend |
| Probation Tracker | Country-specific probation | High | Backend |

---

## Phase 2: Core Enhancement (Months 4-6)

### Objective
Complete payroll processing, advanced leave management, attendance features, and mobile MVP.

### Sprint 9-10: Payroll Engine v2

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Multi-Country Payroll | GCC + India support | Critical | Backend |
| Tax Calculation Engine | Country-specific taxes | Critical | Backend |
| Payslip Generator | PDF with Arabic | Critical | Backend |
| Payroll Approval Workflow | Multi-level approvals | High | Backend |
| Payroll Analytics | Dashboards, reports | High | Frontend |

#### Database Schema

```prisma
model PayrollRun {
  id              String       @id @default(cuid())
  tenantId        String
  companyId       String
  month           String       // YYYY-MM
  status          PayrollStatus
  processedAt     DateTime?
  approvedBy      String?
  totalGross      Decimal
  totalDeductions Decimal
  totalNet        Decimal
  currency        String
  exchangeRate    Decimal      @default(1)

  payslips        Payslip[]
  wpsSubmissions  WPSSubmission[]

  @@index([tenantId, companyId, month])
}

model Payslip {
  id              String       @id @default(cuid())
  payrollRunId    String
  employeeId      String
  month           String
  basicSalary     Decimal
  allowances      Json         // Array of allowance components
  deductions      Json         // Array of deduction components
  grossSalary     Decimal
  totalDeductions Decimal
  netSalary       Decimal
  currency        String
  status          PayslipStatus
  pdfUrl          String?

  payrollRun      PayrollRun   @relation(fields: [payrollRunId], references: [id])
  employee        Employee     @relation(fields: [employeeId], references: [id])
}

model PayComponent {
  id              String       @id @default(cuid())
  tenantId        String
  code            String
  nameEn          String
  nameAr          String
  type            PayComponentType // EARNING, DEDUCTION
  category        String       // FIXED, VARIABLE, STATUTORY
  isStatutory     Boolean      @default(false)
  isTaxable       Boolean      @default(true)
  calculationType String       // FIXED, PERCENTAGE, FORMULA
  formula         String?      // For complex calculations
  isActive        Boolean      @default(true)

  @@unique([tenantId, code])
}
```

### Sprint 11-12: Advanced Leave System

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Leave Accrual Engine | Auto-calculate balances | High | Backend |
| Leave Encashment | Year-end/exit encashment | High | Backend |
| Carry Forward Rules | Policy-based carryover | High | Backend |
| Leave Calendar | Team calendar view | High | Frontend |
| Leave Analytics | Trends, patterns | Medium | Frontend |

#### Technical Implementation

```typescript
// services/leave/leave-accrual.service.ts
class LeaveAccrualService {
  async processMonthlyAccrual(tenantId: string): Promise<AccrualResult[]> {
    const employees = await this.getActiveEmployees(tenantId);
    const policies = await this.getLeavePolicies(tenantId);

    return Promise.all(
      employees.map(emp => this.calculateEmployeeAccrual(emp, policies))
    );
  }

  calculateEmployeeAccrual(employee: Employee, policies: LeavePolicy[]): AccrualResult {
    const yearsOfService = this.calculateServiceYears(employee.joiningDate);

    for (const policy of policies) {
      if (this.isPolicyApplicable(employee, policy)) {
        const accrual = this.getAccrualRate(policy, yearsOfService);
        return {
          employeeId: employee.id,
          leaveTypeId: policy.leaveTypeId,
          accrued: accrual.daysPerMonth,
          balance: employee.currentBalance + accrual.daysPerMonth
        };
      }
    }
  }

  async processYearEndEncashment(tenantId: string): Promise<EncashmentResult[]> {
    // Calculate encashable days
    // Apply encashment policy
    // Generate payroll entries
  }
}
```

### Sprint 13-14: Attendance Enhancement

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Biometric API | Device integration APIs | High | Backend |
| GPS Attendance | Location-based punch | High | Backend |
| Geo-fencing | Office boundary detection | High | Backend |
| Overtime Calculator | Auto OT calculation | High | Backend |
| Regularization Flow | Attendance correction | High | Backend |

### Sprint 15-16: Mobile App MVP

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| React Native Setup | Cross-platform foundation | High | Mobile |
| Employee Dashboard | Home screen with widgets | High | Mobile |
| Leave Module | Apply, view balance | High | Mobile |
| Attendance Module | GPS punch in/out | High | Mobile |
| Approvals | Manager quick approvals | High | Mobile |
| Push Notifications | FCM/APNS integration | High | Mobile |

#### Mobile App Architecture

```
aura-mobile/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx         # Dashboard
│   │   │   ├── attendance.tsx    # Attendance
│   │   │   ├── leave.tsx         # Leave
│   │   │   ├── approvals.tsx     # Approvals (Manager)
│   │   │   └── profile.tsx       # Profile
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── mfa.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── AttendancePunch.tsx
│   │   ├── LeaveBalanceCard.tsx
│   │   ├── ApprovalCard.tsx
│   │   └── ...
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── location.ts
│   │   └── notifications.ts
│   └── store/
│       └── index.ts
├── android/
├── ios/
└── package.json
```

---

## Phase 3: Intelligence Layer (Months 7-9)

### Objective
Implement AI/ML capabilities for predictive analytics, intelligent recruitment, and advanced reporting.

### Sprint 17-18: AI/ML Foundation

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| ML Infrastructure | Python service setup | High | AI Team |
| Data Pipeline | ETL for ML training | High | Data |
| Feature Store | ML feature repository | High | Data |
| Model Registry | MLflow integration | Medium | AI Team |

### Sprint 19-20: Predictive Analytics

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Attrition Model | Predict employee turnover | High | AI Team |
| Performance Predictor | Forecast performance | High | AI Team |
| Workforce Planning | Headcount forecasting | High | AI Team |
| Analytics Dashboard | AI insights display | High | Frontend |

#### ML Models

```python
# services/ai-service/models/attrition.py
class AttritionPredictionModel:
    """
    Predict employee attrition risk using:
    - Tenure, salary, performance history
    - Leave patterns, attendance
    - Team dynamics, manager changes
    """

    def __init__(self):
        self.model = XGBClassifier()
        self.features = [
            'tenure_months',
            'salary_percentile',
            'performance_score',
            'leave_frequency',
            'attendance_rate',
            'team_size',
            'manager_tenure',
            'last_promotion_months',
            'training_hours',
            'engagement_score'
        ]

    def predict(self, employee_data: dict) -> AttritionRisk:
        features = self.extract_features(employee_data)
        probability = self.model.predict_proba(features)[0][1]

        return AttritionRisk(
            employee_id=employee_data['id'],
            risk_score=probability,
            risk_level=self.classify_risk(probability),
            contributing_factors=self.explain_prediction(features),
            recommendations=self.generate_recommendations(probability, features)
        )
```

### Sprint 21-22: Recruitment AI

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Resume Parser | AI text extraction | High | AI Team |
| Candidate Scorer | JD matching algorithm | High | AI Team |
| Interview Scheduler | Calendar integration | High | Backend |
| Job Board Integration | LinkedIn, Bayt APIs | Medium | Backend |

### Sprint 23-24: Advanced Reporting

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Dashboard Builder | Drag-drop widgets | High | Frontend |
| Report Designer | Custom report builder | High | Frontend |
| Scheduled Reports | Email automation | Medium | Backend |
| Export Engine | PDF, Excel, CSV | Medium | Backend |

---

## Phase 4: Scale & Differentiate (Months 10-12)

### Objective
Build integration marketplace, enterprise features, and expand to India market.

### Sprint 25-26: Integration Marketplace

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Connector Framework | Plugin architecture | High | Backend |
| ERP Connectors | SAP, Oracle, Tally | High | Backend |
| Accounting Connectors | QuickBooks, Xero | High | Backend |
| Marketplace UI | App store interface | Medium | Frontend |

### Sprint 27-28: Enterprise Features

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| Multi-Entity | Group company support | High | Backend |
| Advanced Workflow | Complex approval chains | High | Backend |
| Custom Fields | User-defined fields | Medium | Backend |
| API Rate Limiting | Enterprise SLAs | Medium | Backend |

### Sprint 29-30: India Payroll

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| PF/ESI Calculator | Statutory deductions | Critical | Backend |
| TDS Engine | Tax calculation | Critical | Backend |
| Professional Tax | State-wise PT | High | Backend |
| Form 16/12BA | Tax documents | High | Backend |

### Sprint 31-32: Agentic AI

#### Deliverables
| Item | Description | Priority | Owner |
|------|-------------|----------|-------|
| AI Agent Framework | Autonomous task execution | High | AI Team |
| HR Agent | Leave, attendance queries | High | AI Team |
| Recruitment Agent | Candidate screening | Medium | AI Team |
| Analytics Agent | Insight generation | Medium | AI Team |

---

## Resource Requirements

### Team Structure

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|
| Backend Developers | 4 | 4 | 3 | 4 |
| Frontend Developers | 3 | 3 | 3 | 2 |
| Mobile Developers | 0 | 2 | 2 | 1 |
| AI/ML Engineers | 0 | 1 | 3 | 2 |
| DevOps | 1 | 1 | 1 | 1 |
| QA Engineers | 2 | 2 | 2 | 2 |
| Product Manager | 1 | 1 | 1 | 1 |
| UI/UX Designer | 1 | 1 | 1 | 1 |
| **Total** | **12** | **15** | **16** | **14** |

### Technology Stack Additions

| Phase | Technology | Purpose |
|-------|------------|---------|
| Phase 1 | Arabic NLP Libraries | Text processing |
| Phase 1 | PDF Generation (Cairo) | Arabic PDF support |
| Phase 2 | React Native | Mobile app |
| Phase 2 | Redis Queue | Job processing |
| Phase 3 | Python (FastAPI) | AI/ML service |
| Phase 3 | MLflow | Model management |
| Phase 3 | ClickHouse | Analytics warehouse |
| Phase 4 | Apache Kafka | Event streaming |
| Phase 4 | LangChain | Agentic AI |

---

## Success Metrics

### Phase 1 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| WPS Success Rate | 99% | Submissions without errors |
| Arabic UI Coverage | 100% | All visible text translated |
| EOSB Accuracy | 100% | Calculation correctness |
| Labour Law Coverage | 100% | UAE + KSA compliance |

### Phase 2 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Payroll Processing Time | < 2 hours | For 1000 employees |
| Leave Accrual Accuracy | 100% | Automated calculations |
| Mobile App Rating | > 4.0 | App store ratings |
| GPS Punch Accuracy | 99% | Within 50m of location |

### Phase 3 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Attrition Prediction Accuracy | > 80% | AUC score |
| Resume Parsing Accuracy | > 90% | Field extraction |
| Report Generation Time | < 10 sec | Complex reports |
| Dashboard Load Time | < 3 sec | Initial load |

### Phase 4 Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Integration Connectors | 20+ | Available integrations |
| India Statutory Accuracy | 100% | PF/ESI/TDS compliance |
| AI Agent Success Rate | > 90% | Task completion |
| Enterprise Uptime | 99.9% | SLA compliance |

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WPS API changes | Medium | High | Partner with WPS agents |
| Arabic NLP accuracy | Medium | Medium | Use multiple models |
| Mobile performance | Low | Medium | Performance testing |
| ML model drift | Medium | Medium | Continuous retraining |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Labour law changes | High | High | Legal consultant partnership |
| Competition launch | Medium | Medium | Accelerate key features |
| Resource constraints | Medium | High | Cross-training, outsourcing |
| Market adoption | Medium | High | Pilot programs, feedback loops |

---

## Governance

### Review Cadence

| Review Type | Frequency | Participants |
|-------------|-----------|--------------|
| Sprint Review | Bi-weekly | Team + Product |
| Phase Review | Monthly | Leadership |
| Steering Committee | Quarterly | Executive |
| Architecture Review | Monthly | Tech Leads |

### Decision Framework

| Decision Type | Authority | Escalation |
|---------------|-----------|------------|
| Technical Design | Tech Lead | Architect |
| Feature Priority | Product Manager | CPO |
| Resource Allocation | Engineering Manager | CTO |
| Compliance | Legal/Compliance | CEO |

---

**Next:** [Module Connections](./06-MODULE-CONNECTIONS.md)
