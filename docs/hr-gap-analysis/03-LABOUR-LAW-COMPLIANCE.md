# Labour Law Compliance Requirements (2024-2025 Update)

**Related Documents:**
- [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
- [Detailed GAP Analysis](./02-DETAILED-GAP-ANALYSIS.md)
- [Implementation Roadmap](./05-IMPLEMENTATION-ROADMAP.md)
- [Module Connections](./06-MODULE-CONNECTIONS.md)

**Last Updated:** December 2025
**Regulatory Sources:** Official government portals and legal advisories

---

## Overview

This document outlines the **critical** labour law compliance requirements for:
1. **United Arab Emirates (UAE)** - WPS Upgrade December 2025
2. **Kingdom of Saudi Arabia (KSA)** - New Social Insurance Law July 2025
3. **Bahrain** - New End-of-Service System March 2024
4. **Qatar** - WPS and Labour Law compliance
5. **Oman** - Social Protection Fund January 2024
6. **Kuwait** - PIFSS and AS'HAL Portal November 2025
7. **India** - New Labour Codes November 2025

Each section details statutory requirements that AuraOS **MUST** implement for full compliance.

---

## 1. United Arab Emirates (UAE)

### 1.1 Governing Law
- **Federal Decree-Law No. 33 of 2021** (Labour Law - effective February 2, 2022)
- **Federal Decree-Law No. 9 of 2024** (Amendment - limitation period extended)
- **Wage Protection System (WPS)** regulations - **UPGRADED December 2025**
- **Ministerial Resolution No. 1 of 2022** (Implementing Regulations)

### 1.2 Critical: WPS Upgrade December 2025

> **⚠️ CRITICAL COMPLIANCE DEADLINE**

The Ministry of Human Resources and Emiratisation (MoHRE), in partnership with the Central Bank of UAE and Al Etihad Payments, has **upgraded the Wage Protection System** to a fully digitized, API-driven platform.

| Requirement | Old System | New System (Dec 2025) |
|-------------|------------|----------------------|
| File Format | SIF Upload | API-driven |
| Payment Method | Bank cycles | Aani Instant Payments |
| Compliance Checks | Manual | Real-time automated |
| Domestic Cards | N/A | Jaywan integration |
| Coverage | ~95% workers | 99% private sector |
| Monthly Volume | N/A | AED 35+ billion |

**Critical Implementation:**
```typescript
interface UAEWPSUpgrade {
  // NEW: API-driven integration
  api: {
    endpoint: string; // MoHRE API endpoint
    authentication: 'OAuth2' | 'API_KEY';
    realTimeValidation: boolean; // Must be true
  };

  // NEW: Aani instant payments
  paymentMethod: 'AANI_INSTANT' | 'BANK_TRANSFER' | 'JAYWAN_CARD';

  // Enforcement timeline
  enforcement: {
    day15Deadline: Date; // Salary due date
    day16Suspension: boolean; // Auto-suspend new permits if unpaid
  };

  // Minimum requirements
  minimumBankTransfer: 0.80; // 80% to bank account
  maxDelayDays: 15;
}
```

**Penalties for Non-Compliance:**
- Fines and automatic suspension of new work permits on Day 16
- Visa bans
- Business license suspension

### 1.3 Emiratisation Requirements (2024-2025)

| Company Size | 2024 Requirement | 2025 Requirement |
|--------------|------------------|------------------|
| 50+ employees | 2% annual increase in skilled Emiratis | Continued 2% increase |
| 20-49 employees | 1 Emirati by end of 2024 | 2 Emiratis by end of 2025 |

**Tracking Required:**
```typescript
interface EmiratisationTracking {
  totalEmployees: number;
  emiratiCount: number;
  skilledEmiratiCount: number;
  currentRatio: number;
  requiredRatio: number;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  deadline: Date;
}
```

### 1.4 Employment Contract Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Contract Types | Fixed-term contracts mandatory (max 3 years, renewable) | Partial |
| Probation Period | Max 6 months; notice 14-30 days during probation | Partial |
| Employment Categories | Full-time, Part-time, Temporary, Flexible | Implemented |
| Contract Language | Arabic mandatory; English supplementary | Missing |
| Contract Registration | MOHRE portal integration | Missing |
| Limitation Period | 2 years from termination to file claim (Aug 2024) | N/A |

### 1.5 Working Hours & Overtime

| Requirement | Rate/Rule | AuraOS Status |
|-------------|-----------|---------------|
| Standard Hours | 8 hours/day, 48 hours/week | Partial |
| Ramadan Hours | 6 hours/day for Muslim employees | Missing |
| Overtime Cap | Max 2 hours/day | Missing |
| Overtime Rate (Day) | 125% of hourly wage | Missing |
| Overtime Rate (Night) | 150% (9pm-4am) | Missing |
| Friday Work | 150% or day off in lieu | Missing |

### 1.6 Leave Entitlements (UAE)

| Leave Type | Entitlement | AuraOS Status |
|------------|-------------|---------------|
| Annual Leave (First Year) | 2 days per month | Missing |
| Annual Leave (After 1 Year) | 30 days | Missing |
| Sick Leave | 90 days (15 full, 30 half, 45 unpaid) | Missing |
| Maternity Leave | 60 days (45 full, 15 half) + 45 unpaid option | Missing |
| Paternity Leave | 5 days (within 6 months of birth) | Missing |
| Parental Leave | 5 days (children with disabilities) | Missing |
| Bereavement | 5 days (spouse), 3 days (others) | Missing |
| Study Leave | 10 days/year (UAE students, 2+ years service) | Missing |
| Hajj Leave | 30 days unpaid (once during employment) | Missing |

### 1.7 End of Service Benefits (EOSB) / Gratuity

| Service Period | Calculation | Resignation Adjustment |
|----------------|-------------|------------------------|
| < 1 year | No gratuity | N/A |
| 1-5 years | 21 days basic salary per year | 1-3 yrs: 1/3, 3-5 yrs: 2/3 |
| > 5 years | 30 days per year (after 5th year) | Full entitlement |
| Maximum | Cannot exceed 2 years' total salary | N/A |

**EOSB Calculator:**
```typescript
function calculateUAEEOSB(
  basicSalary: number,
  serviceYears: number,
  terminationType: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT'
): number {
  const dailyBasic = basicSalary / 30;
  let gratuity = 0;

  if (serviceYears < 1) return 0;

  if (serviceYears <= 5) {
    gratuity = serviceYears * 21 * dailyBasic;
  } else {
    gratuity = (5 * 21 * dailyBasic) + ((serviceYears - 5) * 30 * dailyBasic);
  }

  // Cap at 2 years salary
  gratuity = Math.min(gratuity, basicSalary * 24);

  // Resignation deductions
  if (terminationType === 'RESIGNATION') {
    if (serviceYears >= 1 && serviceYears < 3) gratuity *= (1/3);
    else if (serviceYears >= 3 && serviceYears < 5) gratuity *= (2/3);
  }

  return gratuity;
}
```

---

## 2. Kingdom of Saudi Arabia (KSA)

### 2.1 Governing Law
- **Saudi Labour Law (Royal Decree No. M/51)** - Amended August 2024
- **GOSI (General Organization for Social Insurance)** - **NEW LAW July 2025**
- **Nitaqat (Saudization)** program
- **Mudad (Wage Protection System)** regulations
- **Qiwa Platform** - Employment contract authentication

### 2.2 Critical: New Social Insurance Law (July 3, 2025)

> **⚠️ CRITICAL COMPLIANCE DEADLINE**

The new Social Insurance Law came into force on July 3, 2025.

| Category | Old System | New System (July 2025) |
|----------|------------|------------------------|
| Retirement Age (New Entrants) | 60 | 65 |
| Contribution Rate | Fixed | Gradual increase 0.5% annually |
| Non-Saudi Coverage | Occupational hazards only | Expanded coverage |

**GOSI Contribution Rates:**

| Component | Saudi (Employee) | Saudi (Employer) | Non-Saudi (Employer Only) |
|-----------|------------------|------------------|---------------------------|
| Annuities (Pension) | 9.75% | 9.75% | N/A |
| Occupational Hazards | - | 2% | 2% |
| SANED (Unemployment) | 0.75% | 0.75% | N/A |
| **Total** | **10.5%** | **12.5%** | **2%** |

**Salary Cap:** SAR 45,000/month

**NEW: Gradual Contribution Increase (New Entrants from July 2025):**
| Year | Additional Rate |
|------|-----------------|
| Year 1 | Base rate |
| Year 2 | +0.5% |
| Year 3 | +1.0% |
| Year 4 | +1.5% |
| Year 5+ | +2.0% total |

### 2.3 Critical: Qiwa Employment Contract Authentication

**Phase 1 (October 6, 2025):** New and updated contracts
**Phase 2 (March 6, 2026):** Existing fixed-term contracts
**Phase 3 (August 6, 2026):** Existing open-ended contracts

Required fields in authenticated contracts:
- National Address (employer and employee)
- Landline number
- General manager's contact information
- Mobile number and email (employee)

### 2.4 Mudad WPS Compliance

| Requirement | Description |
|-------------|-------------|
| Platform | Mudad integration mandatory |
| Payment | Via Saudi-licensed bank |
| Format | SAR currency only |
| Deadline | By 15th of following month |
| Penalty | SAR 3,000 per affected worker |

### 2.5 Nitaqat (Saudization) Requirements

| Nitaqat Band | Status | Implications |
|--------------|--------|--------------|
| Platinum | Highest compliance | Full benefits, priority services |
| Green (High/Medium/Low) | Compliant | Normal operations |
| Yellow | Warning | Reduced services, no new visas |
| Red | Non-compliant | Visa blocks, penalties |

**Tracking Required:**
```typescript
interface NitaqatCompliance {
  industry: string;
  companySize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'GIANT';
  saudiEmployees: number;
  totalEmployees: number;
  currentRatio: number;
  requiredRatio: number;
  band: 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_MED' | 'GREEN_LOW' | 'YELLOW' | 'RED';
  recommendations: string[];
}
```

### 2.6 Leave Entitlements (KSA)

| Leave Type | Entitlement | AuraOS Status |
|------------|-------------|---------------|
| Annual Leave (First 5 years) | 21 days | Missing |
| Annual Leave (After 5 years) | 30 days | Missing |
| Sick Leave | 30 full + 60 @ 75% + 30 unpaid | Missing |
| Maternity Leave | 10 weeks (4 before, 6 after) | Missing |
| Paternity Leave | 3 days | Missing |
| Marriage Leave | 5 days | Missing |
| Bereavement | 5 days (spouse/immediate), 3 days (others) | Missing |
| Hajj Leave | 10-15 days (once, after 2 years) | Missing |
| Iddah Leave | 4 months 10 days (Muslim widow) | Missing |

### 2.7 EOSB/Gratuity (KSA)

| Service Period | Resignation | Termination |
|----------------|-------------|-------------|
| < 2 years | Nothing | Half month per year |
| 2-5 years | 1/3 entitlement | Half month per year |
| 5-10 years | 2/3 entitlement | Half month per year |
| > 10 years | Full entitlement | Half month (first 5) + full month (after) |

---

## 3. Bahrain

### 3.1 Governing Law
- **Labour Law No. 36 of 2012**
- **Social Insurance Organization (SIO)** - **NEW END-OF-SERVICE SYSTEM March 2024**
- **Resolution No. 109 of 2023** (Leaving Indemnity Resolution)

### 3.2 Critical: New End-of-Service System (March 2024)

> **⚠️ ACTIVE REQUIREMENT**

Effective March 1, 2024, employers must make **monthly payments** to SIO for all non-Bahraini employees' end-of-service entitlements.

| Service Period | Contribution Rate | Payment Deadline |
|----------------|-------------------|------------------|
| First 3 years | 4.2% of wage | 15th of each month |
| After 3 years | 8.4% of wage | 15th of each month |

**Penalties:**
- Late payment: 5% interest on monthly contributions
- Non-compliance: BHD 100-150 fine (doubles on repeat)

**Pre-March 2024 Entitlements:** Still paid directly by employer to employee

### 3.3 Social Insurance Contributions (Bahraini Workers)

| Type | Employee | Employer |
|------|----------|----------|
| Social Insurance | 7% | 12% |
| Unemployment | 1% | 1% |
| Labour Fund Levy | - | 1% |

**Note:** Employer contribution for Bahraini workers increased to 16% from January 2024, increasing 1% annually until reaching 20% by January 2028.

### 3.4 Leave Entitlements (Bahrain)

| Leave Type | Entitlement |
|------------|-------------|
| Annual Leave | 30 days after 1 year |
| Sick Leave | 55 days (15 full, 20 half, 20 unpaid) |
| Maternity | 60 days |
| Working Hours | 8 hours/day, 48 hours/week |
| Overtime (Day) | 125% |
| Overtime (Night/Holiday) | 150% |

### 3.5 Gratuity (Old System - Pre March 2024 service)

| Service Period | Rate |
|----------------|------|
| First 3 years | 15 days per year |
| After 3 years | 1 month per year |

---

## 4. Qatar

### 4.1 Governing Law
- **Labour Law No. 14 of 2004**
- **Wage Protection System (WPS)** - MOLSA regulated
- **Minimum Wage Law (March 2021)**

### 4.2 WPS Compliance

| Requirement | Detail |
|-------------|--------|
| Mandatory | All private sector (except govt, embassies, petroleum) |
| Format | Salary Information File (SIF) per Qatar Central Bank |
| Deadline | Within 7 days of due date |
| Penalty | Imprisonment up to 1 month + QAR 2,000-6,000 per employee |
| Payment | Qatari Riyal (QAR) only |

**Payment Frequency:**
- Monthly/annual contracts: At least once per month
- Other contracts: At least every two weeks

### 4.3 Minimum Wage (Since March 2021)

| Component | Amount (QAR) |
|-----------|--------------|
| Basic Salary | 1,000 |
| Housing Allowance | 500 (if not provided) |
| Food Allowance | 300 (if not provided) |
| **Total** | **1,800** |

### 4.4 Working Hours & Overtime

| Category | Rate/Rule |
|----------|-----------|
| Standard Hours | 8 hours/day, 48 hours/week |
| Ramadan Hours | 6 hours/day, 36 hours/week |
| Overtime (Day) | +25% of basic wage |
| Overtime (Night 9pm-3am) | +50% of basic wage |
| Friday/Rest Day Work | Basic + 150% or substitute day |

### 4.5 Leave Entitlements (Qatar)

| Leave Type | Entitlement |
|------------|-------------|
| Annual Leave (First 5 years) | 3 weeks |
| Annual Leave (After 5 years) | 4 weeks |
| Sick Leave | 2 weeks full + 4 weeks half |
| Maternity | 50 days |

### 4.6 End of Service Gratuity (Qatar)

Minimum 3 weeks' basic wage for every completed year of service (Article 54).

---

## 5. Oman

### 5.1 Governing Law
- **Labour Law (Royal Decree 35/2003)**
- **Social Protection Law (Royal Decree 52/2023)** - **NEW January 2024**
- **Social Protection Fund (SPF)** - Replaced PASI

### 5.2 Critical: Social Protection Fund (January 2024)

> **⚠️ ACTIVE REQUIREMENT**

New unified Social Protection Fund replacing PASI, with phased implementation.

**Contribution Rates (Effective January 2024):**

| Insurance Type | Employee | Employer | Effective |
|----------------|----------|----------|-----------|
| Old Age, Disability, Death | 6.5% | 9.5% | Jan 2024 |
| Work Injuries | - | 1% | Jan 2024 |
| Employment Security | 0.5% | 0.5% | Jan 2024 |
| Maternity Leaves | - | 1% | July 2024 |
| Sick/Other Leaves | - | 1% | July 2025 |

**Salary Cap:** OMR 3,000/month

**NEW: Non-Omani Employee Savings System:**
- 9% of monthly salary mandatory savings
- Replaces traditional end-of-service gratuity
- Implementation expected: Mid-2026

### 5.3 Minimum Wage (Omanis Only)

| Component | Amount (OMR) |
|-----------|--------------|
| Basic Salary | 225 |
| Allowances | 100 |
| **Total** | **325** |

**Note:** Under review for potential increase to OMR 360-400

### 5.4 Leave Entitlements (Oman)

| Leave Type | Entitlement |
|------------|-------------|
| Annual Leave | 30 days per year |
| Sick Leave | 10 weeks total (various rates) |
| Maternity | 50 days |
| Working Hours | 9 hours/day, 45 hours/week |
| Ramadan Hours | 6 hours/day |
| Overtime (Day) | 125% |
| Overtime (Night/Holiday) | 150% |

### 5.5 Gratuity (Expatriates - Until New System)

15 days per year of service

---

## 6. Kuwait

### 6.1 Governing Law
- **Labour Law No. 6 of 2010**
- **Public Institution for Social Security (PIFSS)**
- **AS'HAL Portal** - **NEW November 2025**

### 6.2 PIFSS (Social Security) Contributions

**For Kuwaiti Employees:**

| Component | Employee | Employer |
|-----------|----------|----------|
| Base Contribution | 8% | 11.5% |
| Additional (on first KWD 1,500) | 2.5% | - |

**Salary Cap:** KWD 2,750/month
**Payment Deadline:** 15th of following month
**Registration Deadline:** 10 days from employment start

**Note:** Expatriates are exempt from PIFSS but receive end-of-service indemnity.

### 6.3 Critical: AS'HAL Portal (November 2025)

> **⚠️ UPCOMING REQUIREMENT**

New mandatory salary reporting platform for compliance.

| Requirement | Detail |
|-------------|--------|
| Launch Date | November 2025 |
| Purpose | Salary reporting compliance |
| Payment | Kuwait-based bank, local currency |
| Method | Electronic transfer only |

### 6.4 Dhaman Health Insurance (Expanding)

Mandatory health insurance scheme for expatriate workers in private sector - monitor for 2025 full rollout specifics.

### 6.5 Working Hours & Overtime

| Category | Rate/Rule |
|----------|-----------|
| Standard Hours | 8 hours/day, 48 hours/week |
| Ramadan Hours | 6 hours/day, 36 hours/week |
| Overtime | 125% + 1 hour pay per hour |

### 6.6 Leave Entitlements (Kuwait)

| Leave Type | Entitlement |
|------------|-------------|
| Annual Leave | 30 days per year |
| Sick Leave | 75 days (15 full, 10 @75%, 10 @50%, 10 @25%, 30 unpaid) |
| Maternity | 70 days |

### 6.7 End of Service Indemnity (Expatriates)

| Service Period | Rate |
|----------------|------|
| First 5 years | 15 days per year |
| After 5 years | 1 month per year |

---

## 7. India

### 7.1 Governing Laws

> **⚠️ CRITICAL: NEW LABOUR CODES ACTIVE November 2025**

All four national labour codes are now in force as of November 21, 2025:
- **Code on Wages, 2019**
- **Code on Social Security, 2020**
- **Industrial Relations Code, 2020**
- **Occupational Safety, Health and Working Conditions Code, 2020**

**Impact:** Replaces 29 legacy labour laws with a unified framework.

### 7.2 Provident Fund (EPF)

| Component | Rate | Base |
|-----------|------|------|
| Employee EPF | 12% | Basic + DA |
| Employer EPF | 3.67% | Basic + DA |
| Employer EPS (Pension) | 8.33% | Basic + DA (max ₹15,000) |
| Admin Charges | 0.5% | Employer |
| EDLI (Insurance) | 0.5% | Employer |

**Applicability:** All establishments with 20+ employees
**Deposit Deadline:** 21st of each month
**Penalty:** Interest and fines for late payment

### 7.3 ESI (Employee State Insurance)

| Component | Rate | Applicability |
|-----------|------|---------------|
| Employee | 0.75% | Gross salary ≤ ₹21,000 |
| Employer | 3.25% | Gross salary ≤ ₹21,000 |

**Note:** ₹25,000 limit for persons with disabilities
**Applicability:** Establishments with 10+ employees

### 7.4 TDS (Tax Deducted at Source)

**New Tax Regime (2024-25):**

| Income Slab (₹) | Tax Rate |
|-----------------|----------|
| Up to 3,00,000 | Nil |
| 3,00,001 - 7,00,000 | 5% |
| 7,00,001 - 10,00,000 | 10% |
| 10,00,001 - 12,00,000 | 15% |
| 12,00,001 - 15,00,000 | 20% |
| Above 15,00,000 | 30% |

**Plus:** 4% Health & Education Cess on total tax

**Deposit Deadline:** 7th of following month
**Forms:** 24Q, 26Q quarterly returns; Form 16 annual

### 7.5 Professional Tax (State-wise)

| State | Maximum Annual (₹) |
|-------|-------------------|
| Maharashtra | 2,500 |
| Karnataka | 2,400 |
| West Bengal | 2,500 |
| Telangana | 2,500 |
| Gujarat | 2,500 |
| Tamil Nadu | 2,500 |

### 7.6 Gratuity

| Component | Detail |
|-----------|--------|
| Eligibility | 5+ years continuous service |
| Calculation | (Last drawn salary × 15 × Years) / 26 |
| Maximum | ₹20 lakh (statutory limit) |

### 7.7 Payment of Wages

| Company Size | Payment Deadline |
|--------------|------------------|
| < 1,000 employees | 7th of each month |
| ≥ 1,000 employees | 10th of each month |
| Applicability | Employees earning ≤ ₹24,000/month |

### 7.8 Key Changes Under New Labour Codes

1. **Unified Coverage:** EPF now applies universally to all 20+ employee establishments
2. **Fixed-Term Contracts:** Entitled to EPF, ESI, bonus, and gratuity (pro-rata)
3. **Digital Registers:** Mandatory digital maintenance of statutory registers
4. **Health Checks:** Annual health checks mandatory for workers 40+
5. **Revised Wage Definition:** Affects PF, ESI, bonus calculations

---

## Implementation Priority Matrix

### Phase 1 - Critical (MENA Launch Ready)

| Country | Requirements | Priority | Deadline |
|---------|--------------|----------|----------|
| **UAE** | WPS API Integration | P0 | Dec 2025 |
| **UAE** | EOSB Calculator | P0 | Q1 2025 |
| **UAE** | Emiratisation Tracking | P1 | Q1 2025 |
| **KSA** | GOSI Integration | P0 | July 2025 |
| **KSA** | Mudad WPS | P0 | Q1 2025 |
| **KSA** | Nitaqat Tracking | P1 | Q2 2025 |
| **KSA** | Qiwa Contract Authentication | P1 | Oct 2025 |

### Phase 2 - High Priority (GCC Expansion)

| Country | Requirements | Priority | Timeline |
|---------|--------------|----------|----------|
| **Bahrain** | SIO End-of-Service Contributions | P1 | Active |
| **Bahrain** | GOSI Integration | P1 | Q2 2025 |
| **Qatar** | WPS/SIF Generation | P1 | Q2 2025 |
| **Qatar** | Minimum Wage Validation | P2 | Q2 2025 |
| **Oman** | SPF Integration | P1 | Q2 2025 |
| **Oman** | Non-Omani Savings System | P2 | Mid-2026 |
| **Kuwait** | PIFSS Integration | P1 | Q3 2025 |
| **Kuwait** | AS'HAL Portal | P1 | Nov 2025 |

### Phase 3 - India Market Entry

| Requirement | Priority | Timeline |
|-------------|----------|----------|
| EPF/EPS Calculations | P0 | Q2 2025 |
| ESI Calculations | P0 | Q2 2025 |
| TDS Engine (Both Regimes) | P0 | Q2 2025 |
| Professional Tax (All States) | P1 | Q2 2025 |
| Gratuity Calculator | P1 | Q2 2025 |
| Form 16/12BA Generation | P1 | Q3 2025 |
| ECR File Generation | P1 | Q3 2025 |

---

## Data Model Requirements

### Labour Law Configuration

```prisma
model LabourLawConfig {
  id              String   @id @default(cuid())
  tenantId        String
  countryCode     String   // ISO country code
  effectiveFrom   DateTime
  effectiveTo     DateTime?

  // Working Hours
  standardHoursPerDay    Int
  standardHoursPerWeek   Int
  ramadanHoursPerDay     Int?

  // Overtime Rates
  overtimeRateNormal     Decimal
  overtimeRateNight      Decimal
  overtimeRateHoliday    Decimal
  maxOvertimeHoursPerYear Int?

  // Leave Configuration
  annualLeaveFirstYear   Int
  annualLeaveStandard    Int
  sickLeaveFullPay       Int
  sickLeaveHalfPay       Int
  sickLeaveUnpaid        Int
  maternityLeaveDays     Int
  paternityLeaveDays     Int
  hajjLeaveDays          Int?

  // EOSB/Gratuity
  eosbFirstPeriodYears   Int
  eosbFirstPeriodDays    Int
  eosbAfterPeriodDays    Int
  eosbMaxCap             Decimal?

  // Social Insurance
  socialInsuranceEmployeeRate Decimal?
  socialInsuranceEmployerRate Decimal?
  socialInsuranceMaxWage      Decimal?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId, countryCode, effectiveFrom])
}

model WPSConfiguration {
  id              String   @id @default(cuid())
  tenantId        String
  companyId       String
  countryCode     String   // UAE, KSA, QAT, etc.
  wpsAgentCode    String?
  bankCode        String
  routingNumber   String?
  apiEndpoint     String?  // For UAE 2025 upgrade
  apiKey          String?
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId, countryCode])
}

model SocialInsuranceSubmission {
  id              String   @id @default(cuid())
  tenantId        String
  payrollRunId    String
  countryCode     String
  submissionType  String   // GOSI, SIO, PIFSS, SPF, etc.
  month           String   // YYYY-MM
  status          String   // PENDING, SUBMITTED, ACCEPTED, REJECTED
  fileUrl         String?
  totalContributions Decimal
  employeeCount   Int
  submittedAt     DateTime?
  responseData    Json?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([tenantId, countryCode, month])
}
```

---

## API Endpoints Required

```typescript
// Labour Law APIs
GET    /api/labour-law/countries
GET    /api/labour-law/countries/:code
GET    /api/labour-law/countries/:code/leave-policies
GET    /api/labour-law/countries/:code/working-hours
GET    /api/labour-law/countries/:code/social-insurance
GET    /api/labour-law/countries/:code/minimum-wage

// WPS APIs (UAE, KSA, Qatar)
POST   /api/wps/generate/:payrollRunId
POST   /api/wps/validate/:payrollRunId
POST   /api/wps/submit/:payrollRunId       // New API-driven for UAE 2025
GET    /api/wps/status/:submissionId
GET    /api/wps/history

// Social Insurance APIs (All GCC)
POST   /api/social-insurance/calculate/:country
POST   /api/social-insurance/generate/:country/:payrollId
POST   /api/social-insurance/submit/:country/:payrollId
GET    /api/social-insurance/status/:submissionId

// EOSB/Gratuity APIs
POST   /api/eosb/calculate
POST   /api/eosb/simulate
GET    /api/eosb/employee/:employeeId

// India Statutory APIs
POST   /api/india/pf/calculate
POST   /api/india/esi/calculate
POST   /api/india/tds/calculate
GET    /api/india/pf/ecr/:payrollId
GET    /api/india/form16/:employeeId/:financialYear
GET    /api/india/form12ba/:employeeId/:financialYear

// Compliance Tracking APIs
GET    /api/compliance/emiratisation
GET    /api/compliance/saudization
GET    /api/compliance/dashboard/:country
POST   /api/compliance/validate/:country
```

---

## Sources & References

### UAE
- [UAE Labour Law 2025](https://payrollmiddleeast.com/uae-new-employment-labour-law/)
- [WPS Upgrade December 2025](https://www.greythr.com/middle-east/blog/uae-new-labour-law-december-2025-wps-upgrade/)
- [MOHRE Official Portal](https://www.mohre.gov.ae/en/laws-and-regulations/laws.aspx)

### Saudi Arabia
- [Saudi Labour Law Updates 2025](https://tascoutsourcing.sa/en/insights/saudi-labour-law-updates-2025)
- [New Social Insurance Law](https://mercans.com/resources/statutory-alerts/saudi-arabia-new-social-security-law-3-july-2025/)
- [Qiwa Platform Requirements](https://www.dentons.com/en/insights/alerts/2024/september/18/amendments-to-the-kingdom-of-saudi-arabia-labor-law-key-changes-for-employers-in-the-ksa-for-2025)

### Bahrain
- [End-of-Service System March 2024](https://www.ey.com/en_gl/technical/tax-alerts/bahrain-implements-new-end-of-service-benefit-system-from-1-marc)
- [SIO Contribution Changes](https://mercans.com/resources/statutory-alerts/the-kingdom-of-bahrain-social-security-change/)

### Other GCC
- [Qatar Labour Law](https://truein.com/gcc-blogs/qatar-employment-laws)
- [Oman Social Protection Fund](https://mercans.com/resources/statutory-alerts/oman-announces-new-social-security-law/)
- [Kuwait PIFSS](https://akriviahcm.com/resources/global-payroll/guides/kuwait)

### India
- [New Labour Codes 2025](https://payroll.org/news-resources/news/news-detail/2025/12/17/india-s-new-labour-codes-are-in-force-payroll-teams-must-act)
- [EPF/ESI Compliance](https://empxtrack.com/blog/esi-pf-statutory-compliance/)
- [TDS Rates 2024-25](https://quikchex.in/statutory-compliance-in-hr/)

---

**Next:** [Bilingual Strategy](./04-BILINGUAL-STRATEGY.md)
