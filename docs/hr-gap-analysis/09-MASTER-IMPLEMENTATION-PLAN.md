# AuraOS Master Implementation Plan

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Strategic Roadmap for Industry Leadership
**Target:** Achieve #1 MENA/APAC HCM Solution Status

---

## Executive Vision

Transform AuraOS from a **strong foundation** with 15 complete modules and 728 UI pages into the **industry-leading MENA/APAC HCM solution**, competing directly with Darwinbox while offering superior regional compliance and Arabic-first design.

### Strategic Goals

| Goal | Current State | Target State | Timeline |
|------|---------------|--------------|----------|
| GCC Compliance | 30% | 100% | 6 months |
| India Market Ready | 0% | 100% | 6 months |
| AI Capabilities | Basic | Advanced | 12 months |
| Mobile Experience | Responsive | Native | 6 months |
| Arabic Excellence | 50% | 100% | 3 months |

---

## Critical Success Factors

### 1. Regulatory Compliance (MUST HAVE)

| Country | Critical Deadline | Requirement | Status |
|---------|-------------------|-------------|--------|
| 🇦🇪 UAE | December 2025 | WPS API Integration | 🔴 Not Started |
| 🇸🇦 KSA | July 2025 | GOSI New Law | 🔴 Not Started |
| 🇸🇦 KSA | October 2025 | Qiwa Authentication | 🔴 Not Started |
| 🇰🇼 Kuwait | November 2025 | AS'HAL Portal | 🔴 Not Started |
| 🇮🇳 India | Active | New Labour Codes | 🔴 Not Started |
| 🇧🇭 Bahrain | Active | SIO Contributions | 🔴 Not Started |

### 2. Competitive Parity (HIGH PRIORITY)

| Feature | Oracle HCM | SAP SF | Darwinbox | AuraOS Target |
|---------|------------|--------|-----------|---------------|
| AI Chatbot | ✅ | ✅ Joule | ✅ | Q3 2025 |
| Agentic AI | ✅ | ✅ | ✅ | Q4 2025 |
| Native Mobile | ✅ | ✅ | ✅ | Q2 2025 |
| Predictive Analytics | ✅ | ✅ | ✅ | Q3 2025 |

### 3. Market Differentiation (STRATEGIC)

| Differentiator | Strategy |
|----------------|----------|
| Arabic-First Design | Complete RTL, Hijri calendar, Arabic NLP |
| GCC Compliance Depth | Deeper than global competitors |
| Price-Performance | Enterprise features at mid-market pricing |
| MENA-Specific Features | Ramadan, Hajj, Emiratisation, Nitaqat |

---

## Phase 1: MENA Compliance Foundation (Months 1-3)

### Objective
Establish complete compliance infrastructure for UAE and KSA, with full Arabic localization.

### Sprint Breakdown

#### Sprint 1-2: UAE WPS Integration (Weeks 1-4)

**Priority: P0 - Critical**

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| WPS Data Models | Employee WPS fields, bank routing, labour card | Backend | 🔴 |
| WPS API Client | New API-driven integration (Dec 2025 upgrade) | Backend | 🔴 |
| SIF File Generator | Legacy format for backward compatibility | Backend | 🔴 |
| Aani Payment Integration | Instant payment support | Backend | 🔴 |
| WPS Validation Engine | Real-time compliance checks | Backend | 🔴 |
| WPS Dashboard | Status tracking, error handling | Frontend | 🔴 |
| Emiratisation Tracker | Quota monitoring and alerts | Full Stack | 🔴 |

**Technical Requirements:**
```typescript
// WPS Configuration for UAE 2025
interface UAEWPSConfig {
  // API Integration (NEW December 2025)
  apiEndpoint: string;
  authType: 'OAUTH2' | 'API_KEY';
  realTimeValidation: true;

  // Payment Methods
  paymentMethods: ['AANI_INSTANT', 'BANK_TRANSFER', 'JAYWAN_CARD'];

  // Enforcement
  salaryDeadline: 15; // Day of month
  autoSuspensionDay: 16; // Permit suspension

  // Compliance
  minBankTransferPercent: 80;
  maxDelayDays: 15;
}

// Emiratisation Tracking
interface EmiratisationConfig {
  companySize: 'SMALL_20_49' | 'MEDIUM_50_PLUS';
  requirements: {
    'SMALL_20_49': { 2024: 1, 2025: 2 };
    'MEDIUM_50_PLUS': { annualIncreasePercent: 2 };
  };
}
```

**API Endpoints:**
```
POST /api/wps/uae/generate/:payrollRunId
POST /api/wps/uae/validate/:payrollRunId
POST /api/wps/uae/submit/:payrollRunId
GET  /api/wps/uae/status/:submissionId
GET  /api/compliance/uae/emiratisation
```

#### Sprint 3-4: KSA GOSI & Mudad (Weeks 5-8)

**Priority: P0 - Critical**

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| GOSI Contribution Calculator | Saudi/Non-Saudi rates with 2025 changes | Backend | 🔴 |
| GOSI File Generator | GOSI submission format | Backend | 🔴 |
| Mudad WPS Integration | KSA wage protection | Backend | 🔴 |
| Nitaqat Tracking | Saudization ratio monitoring | Backend | 🔴 |
| Qiwa Contract Module | Authentication preparation | Backend | 🔴 |
| GOSI Dashboard | Contributions, compliance status | Frontend | 🔴 |

**GOSI Calculation Engine:**
```typescript
interface GOSICalculator {
  // New Law July 2025 Rates
  calculateContributions(employee: Employee): GOSIContribution {
    const cap = 45000; // SAR max
    const salary = Math.min(employee.totalSalary, cap);

    if (employee.nationality === 'SAUDI') {
      // Check if new entrant (after July 2024)
      const isNewEntrant = employee.startDate > new Date('2024-07-03');
      const additionalRate = isNewEntrant ? getGradualIncrease(employee) : 0;

      return {
        employee: {
          pension: salary * 0.0975,
          saned: salary * 0.0075,
          additional: salary * additionalRate,
          total: salary * (0.105 + additionalRate)
        },
        employer: {
          pension: salary * 0.0975,
          occupationalHazards: salary * 0.02,
          saned: salary * 0.0075,
          additional: salary * additionalRate,
          total: salary * (0.125 + additionalRate)
        }
      };
    } else {
      return {
        employee: { total: 0 },
        employer: { occupationalHazards: salary * 0.02, total: salary * 0.02 }
      };
    }
  }
}
```

#### Sprint 5-6: Complete Arabic Localization (Weeks 9-12)

**Priority: P0 - Critical**

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| Complete Arabic Translations | All 46 modules, 728 pages | i18n Team | 🔴 |
| RTL CSS Framework | Tailwind RTL optimization | Frontend | 🔴 |
| RTL Component Library | All UI components | Frontend | 🔴 |
| Hijri Calendar | Date picker with dual calendar | Frontend | 🔴 |
| Arabic Form Validation | Names, phone, Emirates ID, Iqama | Frontend | 🔴 |
| Arabic Fonts | Noto Sans Arabic integration | Frontend | 🔴 |
| Arabic Email Templates | All notification templates | Backend | 🔴 |

**Translation Files Structure:**
```
packages/@aura/i18n/src/locales/
├── ar-SA/              # Saudi Arabic
│   ├── common.json
│   ├── employee.json
│   ├── payroll.json
│   ├── leave.json
│   ├── attendance.json
│   ├── recruitment.json
│   ├── performance.json
│   ├── compliance.json  # NEW: GOSI, Nitaqat terms
│   └── ...
├── ar-AE/              # UAE Arabic (inherits ar-SA with overrides)
│   ├── common.json
│   └── compliance.json  # NEW: WPS, Emiratisation terms
└── ar/                 # Generic Arabic fallback
```

---

## Phase 2: Core Enhancement (Months 4-6)

### Objective
Complete payroll engines, advanced leave/attendance, and mobile MVP.

#### Sprint 7-8: Multi-Country Payroll Engine (Weeks 13-16)

**Priority: P1 - High**

| Deliverable | Description | Countries | Status |
|-------------|-------------|-----------|--------|
| GCC Payroll Engine | EOSB, Gratuity, Leave Salary | All GCC | 🔴 |
| Bahrain SIO Integration | Monthly end-of-service contributions | Bahrain | 🔴 |
| Qatar WPS | SIF generation per Qatar Central Bank | Qatar | 🔴 |
| Oman SPF | Social Protection Fund contributions | Oman | 🔴 |
| Kuwait PIFSS | Social security for Kuwaitis | Kuwait | 🔴 |
| Multi-Currency | AED, SAR, BHD, QAR, OMR, KWD | All | 🔴 |

**EOSB Calculator (All GCC):**
```typescript
interface EOSBCalculator {
  calculate(
    country: 'UAE' | 'KSA' | 'BHR' | 'QAT' | 'OMN' | 'KWT',
    employee: Employee,
    terminationType: TerminationType
  ): EOSBResult;
}

// Country-specific rules
const EOSBRules: Record<string, EOSBRule> = {
  UAE: {
    minServiceYears: 1,
    firstPeriodYears: 5,
    firstPeriodDaysPerYear: 21,
    afterPeriodDaysPerYear: 30,
    maxCap: 24, // months of basic salary
    resignationDeductions: { '1-3': 0.33, '3-5': 0.67, '5+': 1 }
  },
  KSA: {
    minServiceYears: 2, // for resignation
    firstPeriodYears: 5,
    firstPeriodDaysPerYear: 15, // half month
    afterPeriodDaysPerYear: 30, // full month
    resignationDeductions: { '0-2': 0, '2-5': 0.33, '5-10': 0.67, '10+': 1 }
  },
  // ... other countries
};
```

#### Sprint 9-10: India Statutory Compliance (Weeks 17-20)

**Priority: P0 - Critical for India Market**

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| EPF Calculator | Employee + Employer contributions | Backend | 🔴 |
| EPS Calculator | Pension scheme | Backend | 🔴 |
| ESI Calculator | State insurance contributions | Backend | 🔴 |
| TDS Engine | Old & New tax regime | Backend | 🔴 |
| Professional Tax | All Indian states | Backend | 🔴 |
| India Gratuity | 5-year calculation | Backend | 🔴 |
| Form 16 Generator | Annual tax certificate | Backend | 🔴 |
| ECR File Generator | PF electronic challan | Backend | 🔴 |

**India Payroll Engine:**
```typescript
interface IndiaPayrollEngine {
  // EPF Calculation
  calculatePF(employee: Employee): PFContribution {
    const pfWage = employee.basicSalary + employee.da;
    const epsCap = 15000;

    return {
      employee: { epf: pfWage * 0.12 },
      employer: {
        epf: pfWage * 0.0367,
        eps: Math.min(pfWage, epsCap) * 0.0833,
        admin: pfWage * 0.005,
        edli: pfWage * 0.005
      }
    };
  }

  // ESI Calculation
  calculateESI(employee: Employee): ESIContribution | null {
    if (employee.grossSalary > 21000) return null;

    return {
      employee: employee.grossSalary * 0.0075,
      employer: employee.grossSalary * 0.0325
    };
  }

  // TDS Calculation
  calculateTDS(employee: Employee, regime: 'OLD' | 'NEW'): TDSResult;

  // Statutory Forms
  generateForm16(employee: Employee, fy: string): Form16;
  generateECR(payrollRun: PayrollRun): ECRFile;
}
```

#### Sprint 11-12: Mobile App MVP (Weeks 21-24)

**Priority: P1 - High**

| Deliverable | Description | Platform | Status |
|-------------|-------------|----------|--------|
| React Native Setup | Cross-platform foundation | iOS/Android | 🔴 |
| Authentication | Biometric, JWT, MFA | Mobile | 🔴 |
| Employee Dashboard | Widgets, notifications | Mobile | 🔴 |
| Leave Module | Apply, balance, history | Mobile | 🔴 |
| Attendance Module | GPS punch, geofencing | Mobile | 🔴 |
| Payslip Viewer | PDF view and download | Mobile | 🔴 |
| Manager Approvals | One-tap approvals | Mobile | 🔴 |
| Push Notifications | FCM/APNS integration | Mobile | 🔴 |

**Mobile App Structure:**
```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── mfa.tsx
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx
│   │   │   ├── attendance.tsx
│   │   │   ├── leave.tsx
│   │   │   ├── approvals.tsx      # Manager only
│   │   │   └── profile.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── AttendancePunch.tsx    # GPS + Geofence
│   │   ├── LeaveRequestForm.tsx
│   │   ├── ApprovalCard.tsx
│   │   └── PayslipViewer.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── location.ts
│   │   └── notifications.ts
│   └── hooks/
│       ├── useAttendance.ts
│       └── useApprovals.ts
├── android/
├── ios/
└── package.json
```

---

## Phase 3: Intelligence Layer (Months 7-9)

### Objective
Implement AI/ML capabilities for predictive analytics and intelligent recruitment.

#### Sprint 13-14: AI/ML Foundation (Weeks 25-28)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| ML Service Setup | Python FastAPI service | AI Team | 🔴 |
| Data Pipeline | ETL for training data | Data | 🔴 |
| Feature Store | ML feature repository | Data | 🔴 |
| Model Registry | MLflow integration | AI Team | 🔴 |

#### Sprint 15-16: Predictive Analytics (Weeks 29-32)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| Attrition Model | Employee turnover prediction | AI Team | 🔴 |
| Performance Predictor | Performance forecasting | AI Team | 🔴 |
| Workforce Planning | Headcount forecasting | AI Team | 🔴 |
| AI Dashboard | Insights visualization | Frontend | 🔴 |

**AI Models:**
```python
# Attrition Prediction Model
class AttritionPredictor:
    features = [
        'tenure_months', 'salary_percentile', 'performance_score',
        'leave_frequency', 'attendance_rate', 'team_size',
        'manager_tenure', 'last_promotion_months', 'training_hours',
        'engagement_score', 'overtime_hours', 'travel_frequency'
    ]

    def predict(self, employee_data: dict) -> AttritionRisk:
        probability = self.model.predict_proba(features)[0][1]
        return AttritionRisk(
            risk_score=probability,
            risk_level='HIGH' if probability > 0.7 else 'MEDIUM' if probability > 0.4 else 'LOW',
            contributing_factors=self.explain(features),
            recommendations=self.recommend(probability, features)
        )
```

#### Sprint 17-18: Recruitment AI (Weeks 33-36)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| Resume Parser | AI-powered extraction (EN/AR) | AI Team | 🔴 |
| Candidate Scorer | JD matching algorithm | AI Team | 🔴 |
| Interview Scheduler | Calendar integration | Backend | 🔴 |
| Job Board Integration | LinkedIn, Indeed, Bayt, Naukri | Backend | 🔴 |

---

## Phase 4: Scale & Differentiate (Months 10-12)

### Objective
Build integration marketplace, enterprise features, and agentic AI.

#### Sprint 19-20: Integration Marketplace (Weeks 37-40)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| Connector Framework | Plugin architecture | Backend | 🔴 |
| ERP Connectors | SAP, Oracle, Tally | Backend | 🔴 |
| Accounting Connectors | QuickBooks, Xero, Zoho | Backend | 🔴 |
| Biometric Connectors | ZKTeco, Suprema | Backend | 🔴 |
| Marketplace UI | App store interface | Frontend | 🔴 |

#### Sprint 21-22: Enterprise Features (Weeks 41-44)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| Multi-Entity Support | Group company management | Backend | 🔴 |
| Advanced Workflows | Complex approval chains | Backend | 🔴 |
| Custom Fields | User-defined fields | Backend | 🔴 |
| Enterprise SSO | SAML, LDAP, Azure AD | Backend | 🔴 |
| API Rate Limiting | Enterprise SLAs | Backend | 🔴 |

#### Sprint 23-24: Agentic AI (Weeks 45-48)

| Deliverable | Description | Owner | Status |
|-------------|-------------|-------|--------|
| AI Agent Framework | LangChain integration | AI Team | 🔴 |
| HR Agent | Leave, attendance, policy queries | AI Team | 🔴 |
| Recruitment Agent | Candidate screening automation | AI Team | 🔴 |
| Analytics Agent | Automated insight generation | AI Team | 🔴 |
| Arabic Chatbot | Arabic NLP for HR queries | AI Team | 🔴 |

---

## Module Connection Map

### Core HR → All Modules

```
                    ┌──────────────────────────────────────────────┐
                    │               CORE HR (Foundation)           │
                    │  Employee Master → All modules reference     │
                    └───────────┬──────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────────────┐
        │                       │                               │
        ▼                       ▼                               ▼
┌───────────────┐      ┌───────────────┐               ┌───────────────┐
│   PAYROLL     │      │    LEAVE      │               │  ATTENDANCE   │
│ - WPS/GOSI    │◄────►│ - Accrual     │◄─────────────►│ - GPS Punch   │
│ - EOSB        │      │ - Encashment  │               │ - Overtime    │
│ - Tax (India) │      │ - Policies    │               │ - Shifts      │
└───────┬───────┘      └───────────────┘               └───────────────┘
        │
        ▼
┌───────────────┐      ┌───────────────┐               ┌───────────────┐
│  COMPLIANCE   │      │ RECRUITMENT   │               │  PERFORMANCE  │
│ - Emiratisation│     │ - AI Screening│               │ - Reviews     │
│ - Nitaqat     │      │ - Onboarding  │──────────────►│ - Goals       │
│ - Labour Law  │      │ - Career Site │               │ - 360 FB      │
└───────────────┘      └───────────────┘               └───────────────┘
        │                                                      │
        ▼                                                      ▼
┌───────────────┐      ┌───────────────┐               ┌───────────────┐
│   ANALYTICS   │◄─────│   AI/ML       │◄──────────────│   LEARNING    │
│ - Dashboards  │      │ - Attrition   │               │ - Courses     │
│ - Reports     │      │ - Predictions │               │ - Skills      │
│ - Insights    │      │ - Agents      │               │ - Certs       │
└───────────────┘      └───────────────┘               └───────────────┘
```

### Data Flow: Payroll → Compliance

```
Payroll Run                 Compliance Submission
    │                              ▲
    ▼                              │
Calculate Salaries ─────► Generate WPS/GOSI File
    │                              │
    ▼                              ▼
Apply Deductions ◄─────── Validate Compliance
    │                              │
    ▼                              ▼
Generate Payslips         Submit to Government
    │                              │
    ▼                              ▼
Bank Transfer ───────────► Track Status
```

---

## Resource Requirements

### Team Structure by Phase

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Total FTEs |
|------|---------|---------|---------|---------|------------|
| Backend Engineers | 4 | 4 | 3 | 4 | 4-5 |
| Frontend Engineers | 3 | 2 | 2 | 2 | 2-3 |
| Mobile Engineers | 0 | 2 | 2 | 1 | 2 |
| AI/ML Engineers | 0 | 1 | 3 | 2 | 2-3 |
| DevOps Engineer | 1 | 1 | 1 | 1 | 1 |
| QA Engineers | 2 | 2 | 2 | 2 | 2 |
| Product Manager | 1 | 1 | 1 | 1 | 1 |
| UI/UX Designer | 1 | 1 | 1 | 1 | 1 |
| i18n/Translation | 2 | 1 | 0 | 0 | 1 |
| **Total** | **14** | **15** | **15** | **14** | **16-18** |

### Technology Additions

| Phase | Technology | Purpose |
|-------|------------|---------|
| 1 | Tailwind RTL Plugin | Arabic layout |
| 1 | hijri-converter | Islamic calendar |
| 1 | Cairo (PDF) | Arabic PDF generation |
| 2 | React Native | Mobile app |
| 2 | Expo | Mobile development |
| 2 | Redis | Job queues |
| 3 | Python FastAPI | AI/ML service |
| 3 | MLflow | Model management |
| 3 | Scikit-learn/XGBoost | ML models |
| 4 | LangChain | Agentic AI |
| 4 | Apache Kafka | Event streaming |

---

## Success Metrics

### Phase 1 (Months 1-3)

| Metric | Target | Measurement |
|--------|--------|-------------|
| WPS Submission Success | 99% | No rejected submissions |
| Arabic UI Coverage | 100% | All text translated |
| EOSB Calculation Accuracy | 100% | Verified against manual |
| GOSI Integration | Live | Successful test submission |

### Phase 2 (Months 4-6)

| Metric | Target | Measurement |
|--------|--------|-------------|
| India Statutory Accuracy | 100% | PF/ESI/TDS verified |
| Mobile App Launch | iOS + Android | App store listings |
| App Store Rating | > 4.0 | User reviews |
| Payroll Processing Time | < 2 hours | 1000 employees |

### Phase 3 (Months 7-9)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Attrition Prediction AUC | > 0.80 | Model accuracy |
| Resume Parsing Accuracy | > 90% | Field extraction |
| AI Response Time | < 2 sec | Query to response |

### Phase 4 (Months 10-12)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Integration Connectors | 20+ | Available integrations |
| Agentic AI Success | > 90% | Task completion rate |
| Enterprise Uptime | 99.9% | SLA compliance |

---

## Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WPS API changes (UAE) | High | Critical | Early engagement with MoHRE partners |
| GOSI integration complexity | Medium | High | Partner with Saudi system integrators |
| Arabic NLP accuracy | Medium | Medium | Use multiple models, human review |
| Mobile performance | Low | Medium | Extensive device testing |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Labour law changes | High | High | Legal consultant partnership |
| Competitor acceleration | Medium | High | Accelerate Phase 1 & 2 |
| Resource constraints | Medium | High | Cross-training, strategic outsourcing |
| India market complexity | Medium | Medium | Dedicated India team |

---

## Governance & Review

### Review Cadence

| Review Type | Frequency | Participants |
|-------------|-----------|--------------|
| Daily Standup | Daily | Dev Team |
| Sprint Review | Bi-weekly | Team + Product |
| Phase Review | Monthly | Leadership |
| Steering Committee | Quarterly | Executive |
| Architecture Review | Monthly | Tech Leads |
| Compliance Review | Monthly | Legal + Product |

### Escalation Path

```
Development Team → Tech Lead → Engineering Manager → CTO → CEO
                                      ↓
                              Product Manager → CPO
                                      ↓
                              Legal/Compliance
```

---

## Quick Reference: Critical Paths

### UAE Market Launch (Minimum Viable)
1. ✅ WPS API Integration
2. ✅ EOSB Calculator
3. ✅ Arabic UI (Core modules)
4. ✅ Emiratisation Tracking

### KSA Market Launch (Minimum Viable)
1. ✅ GOSI Integration
2. ✅ Mudad WPS
3. ✅ EOSB Calculator (KSA rules)
4. ✅ Nitaqat Tracking
5. ✅ Qiwa Contract Support

### India Market Launch (Minimum Viable)
1. ✅ EPF/EPS Calculator
2. ✅ ESI Calculator
3. ✅ TDS Engine (Both regimes)
4. ✅ Professional Tax (Major states)
5. ✅ Form 16 Generation

---

## Appendix: Key Contacts & Resources

### Regulatory Bodies

| Country | Body | Purpose |
|---------|------|---------|
| UAE | MOHRE | WPS, Labour Law |
| UAE | Central Bank | WPS Banking |
| KSA | GOSI | Social Insurance |
| KSA | MHRSD | Mudad, Qiwa |
| India | EPFO | Provident Fund |
| India | ESIC | State Insurance |

### External Partners (To Engage)

| Partner Type | Purpose |
|--------------|---------|
| WPS Agent (UAE) | SIF processing, bank integration |
| System Integrator (KSA) | GOSI, Mudad connectivity |
| Legal Consultant (GCC) | Labour law compliance verification |
| Tax Consultant (India) | TDS, statutory compliance |

---

**Document Owner:** Product & Engineering Team
**Review Cycle:** Weekly during active development
**Last Updated:** December 23, 2025
