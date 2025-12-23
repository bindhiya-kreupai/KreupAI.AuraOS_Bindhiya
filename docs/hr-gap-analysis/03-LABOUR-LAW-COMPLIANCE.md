# Labour Law Compliance Requirements

**Related Documents:**
- [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
- [Detailed GAP Analysis](./02-DETAILED-GAP-ANALYSIS.md)
- [Implementation Roadmap](./05-IMPLEMENTATION-ROADMAP.md)
- [Module Connections](./06-MODULE-CONNECTIONS.md)

---

## Overview

This document outlines the labour law compliance requirements for:
1. **United Arab Emirates (UAE)**
2. **Kingdom of Saudi Arabia (KSA)**
3. **Bahrain**
4. **Qatar**
5. **Oman**
6. **Kuwait**
7. **India**

Each section details the statutory requirements that AuraOS must implement for full compliance.

---

## 1. United Arab Emirates (UAE)

### 1.1 Governing Law
- **Federal Decree-Law No. 33 of 2021** (New Labour Law - effective February 2, 2022)
- **Ministerial Resolution No. 1 of 2022** (Implementing Regulations)
- **Wage Protection System (WPS)** regulations

### 1.2 Employment Contract Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Contract Types | Fixed-term contracts mandatory (max 3 years, renewable) | Partial |
| Probation Period | Max 6 months; notice 14-30 days | Partial |
| Employment Categories | Full-time, Part-time, Temporary, Flexible | Implemented |
| Contract Language | Arabic mandatory; English can be supplementary | Missing |
| Contract Registration | Ministry of Human Resources (MOHRE) portal | Missing |

**Implementation Required:**
```typescript
interface UAEContractCompliance {
  contractType: 'FIXED_TERM'; // Only fixed-term allowed since 2022
  maxDurationYears: 3;
  probationPeriod: {
    maxMonths: 6;
    noticePeriod: {
      duringProbation: 14 | 30; // days based on circumstances
    };
  };
  mandatoryLanguage: 'ar';
  mohreRegistration: boolean;
}
```

### 1.3 Working Hours & Overtime

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Standard Hours | 8 hours/day, 48 hours/week | Partial |
| Ramadan Hours | 6 hours/day for Muslims | Missing |
| Friday | Rest day (can be substituted) | Partial |
| Overtime Cap | Max 2 hours/day | Missing |
| Overtime Rate | 125% (normal) to 150% (9pm-4am) | Missing |

**Overtime Calculation Engine:**
```typescript
interface UAEOvertimeCalculation {
  normalOvertime: {
    rate: 1.25; // 125% of hourly wage
    maxHoursPerDay: 2;
  };
  nightOvertime: {
    rate: 1.50; // 150% of hourly wage
    hours: { start: 21, end: 4 }; // 9pm to 4am
  };
  fridayWork: {
    rate: 1.50; // 150% or day off in lieu
  };
  ramadan: {
    reducedHours: 6;
    applicable: 'MUSLIM_EMPLOYEES';
  };
}
```

### 1.4 Leave Entitlements (UAE)

| Leave Type | Entitlement | AuraOS Status |
|------------|-------------|---------------|
| Annual Leave | 30 days (after 1 year), 2 days/month (first year) | Missing |
| Sick Leave | 90 days (15 full pay, 30 half pay, 45 unpaid) | Missing |
| Maternity Leave | 60 days (45 full pay, 15 half pay) + 45 days unpaid | Missing |
| Paternity Leave | 5 days (within 6 months of birth) | Missing |
| Parental Leave | 5 days (for children with disabilities) | Missing |
| Bereavement | 5 days (spouse), 3 days (other relatives) | Missing |
| Study Leave | 10 days/year (for UAE students, 2+ years service) | Missing |
| Hajj Leave | 30 days unpaid (once during employment) | Missing |

**UAE Leave Engine:**
```typescript
interface UAELeaveEngine {
  annualLeave: {
    firstYear: { daysPerMonth: 2 };
    afterOneYear: { daysPerYear: 30 };
    carryForward: { maxDays: 30; expiryMonths: 12 };
    encashment: { allowedOnExit: true; calculation: 'BASIC_SALARY' };
  };
  sickLeave: {
    totalDays: 90;
    fullPay: 15;
    halfPay: 30;
    unpaid: 45;
    medicalCertificateRequired: true;
  };
  maternityLeave: {
    totalDays: 60;
    fullPay: 45;
    halfPay: 15;
    additionalUnpaid: 45;
    eligibility: 'NO_MINIMUM_SERVICE';
  };
  paternityLeave: {
    days: 5;
    withinMonthsOfBirth: 6;
    payType: 'FULL_PAY';
  };
}
```

### 1.5 End of Service Benefits (EOSB) / Gratuity

| Service Period | Calculation | AuraOS Status |
|----------------|-------------|---------------|
| Less than 1 year | No gratuity | Missing |
| 1-5 years | 21 days basic salary per year | Missing |
| Over 5 years | 30 days basic salary per year (after 5th year) | Missing |
| Maximum | Cannot exceed 2 years' total salary | Missing |
| Resignation < 5 years | Reduced entitlement (1/3 if 1-3 yrs, 2/3 if 3-5 yrs) | Missing |

**EOSB Calculator:**
```typescript
interface UAEEOSBCalculator {
  calculate(employee: Employee, terminationType: TerminationType): EOSBResult {
    const years = calculateServiceYears(employee);
    const dailyBasic = employee.basicSalary / 30;

    let gratuity = 0;

    if (years >= 1 && years <= 5) {
      gratuity = years * 21 * dailyBasic;
    } else if (years > 5) {
      gratuity = (5 * 21 * dailyBasic) + ((years - 5) * 30 * dailyBasic);
    }

    // Cap at 2 years salary
    const maxGratuity = employee.basicSalary * 24;
    gratuity = Math.min(gratuity, maxGratuity);

    // Resignation deductions
    if (terminationType === 'RESIGNATION') {
      if (years >= 1 && years < 3) gratuity *= (1/3);
      else if (years >= 3 && years < 5) gratuity *= (2/3);
      // Full gratuity if 5+ years
    }

    return { amount: gratuity, currency: 'AED', breakdown: {...} };
  }
}
```

### 1.6 Wage Protection System (WPS) - UAE

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| WPS Registration | Mandatory for all companies | Missing |
| Salary Payment | Through approved agents/banks | Missing |
| SIF File Generation | Salary Information File format | Missing |
| Payment Timeline | Within 10 days of due date | Missing |
| Penalties | Fines and work permit blocks for non-compliance | N/A |

**WPS Integration:**
```typescript
interface WPSIntegration {
  // SIF File Generation
  generateSIF(payrollRun: PayrollRun): SIFFile {
    return {
      header: {
        employerCode: company.wpsCode,
        bankCode: company.bankCode,
        salaryMonth: payrollRun.month,
        totalRecords: employees.length,
        totalSalary: payrollRun.totalNet
      },
      records: employees.map(emp => ({
        labourCardNumber: emp.labourCardNumber,
        bankRoutingCode: emp.bankRoutingCode,
        accountNumber: emp.accountNumber,
        salaryAmount: emp.netSalary,
        leaveAmount: emp.leaveSalary || 0
      }))
    };
  }

  // Validate WPS Compliance
  validateCompliance(employees: Employee[]): WPSValidationResult {
    const issues = [];
    employees.forEach(emp => {
      if (!emp.labourCardNumber) issues.push({ employee: emp, issue: 'MISSING_LABOUR_CARD' });
      if (!emp.bankAccount) issues.push({ employee: emp, issue: 'MISSING_BANK_ACCOUNT' });
    });
    return { isValid: issues.length === 0, issues };
  }
}
```

---

## 2. Kingdom of Saudi Arabia (KSA)

### 2.1 Governing Law
- **Saudi Labour Law (Royal Decree No. M/51)**
- **GOSI (General Organization for Social Insurance)** regulations
- **Nitaqat (Saudization)** program
- **Mudad (Wage Protection System)** regulations

### 2.2 Employment Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Contract Language | Arabic mandatory | Missing |
| Contract Types | Fixed/Indefinite (non-Saudis: fixed only) | Partial |
| Probation Period | Max 90 days, extendable to 180 days | Missing |
| Iqama Requirement | Work permit linked to employer | Missing |
| Saudization Quota | Nitaqat compliance by industry | Missing |

**KSA Contract Compliance:**
```typescript
interface KSAContractCompliance {
  contractType: 'FIXED_TERM' | 'INDEFINITE';
  nonSaudiRestriction: 'FIXED_TERM_ONLY';
  probationPeriod: {
    maxDays: 90;
    extensionDays: 90; // Total max 180 days
    writtenAgreement: true;
  };
  mandatoryLanguage: 'ar';
  iqamaLinking: {
    required: true;
    transferRestrictions: true;
  };
}
```

### 2.3 Working Hours & Overtime (KSA)

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Standard Hours | 8 hours/day, 48 hours/week | Partial |
| Ramadan Hours | 6 hours/day, 36 hours/week | Missing |
| Friday | Rest day (mandatory) | Partial |
| Overtime Cap | Max 720 hours/year | Missing |
| Overtime Rate | 150% of hourly wage | Missing |

**KSA Overtime Engine:**
```typescript
interface KSAOvertimeEngine {
  standardRate: 1.50; // 150%
  maxAnnualHours: 720;
  ramadan: {
    dailyHours: 6;
    weeklyHours: 36;
  };
  calculation: (hours: number, hourlyRate: number) => hours * hourlyRate * 1.5;
}
```

### 2.4 Leave Entitlements (KSA)

| Leave Type | Entitlement | AuraOS Status |
|------------|-------------|---------------|
| Annual Leave | 21 days (first 5 years), 30 days (after 5 years) | Missing |
| Sick Leave | 30 days full pay, 60 days 75% pay, 30 days unpaid | Missing |
| Maternity Leave | 10 weeks (4 before, 6 after birth) | Missing |
| Paternity Leave | 3 days | Missing |
| Marriage Leave | 5 days | Missing |
| Bereavement | 5 days (spouse/immediate family), 3 days (others) | Missing |
| Hajj Leave | 10-15 days (once, after 2 years) | Missing |
| Iddah Leave | 4 months 10 days (widow) | Missing |

**KSA Leave Engine:**
```typescript
interface KSALeaveEngine {
  annualLeave: {
    first5Years: 21;
    after5Years: 30;
    carryForward: { allowed: true; expiryMonths: 12 };
    encashment: { allowed: true; maxDays: 15 };
  };
  sickLeave: {
    fullPay: 30;
    reducedPay: { days: 60; percentage: 75 };
    unpaid: 30;
    medicalCertificateRequired: true;
  };
  hajjLeave: {
    days: { min: 10; max: 15 };
    oncePerEmployment: true;
    minimumService: 2; // years
    payType: 'FULL_PAY';
  };
  iddahLeave: {
    days: 130; // 4 months 10 days
    eligibility: 'WIDOW_MUSLIM_FEMALE';
    payType: 'FULL_PAY';
  };
}
```

### 2.5 GOSI (Social Insurance) - KSA

| Contribution | Saudi National | Non-Saudi |
|--------------|----------------|-----------|
| Employee Pension | 9.75% | N/A |
| Employer Pension | 9.75% | N/A |
| Occupational Hazards | 2% (employer) | 2% (employer) |
| SANED (Unemployment) | 0.75% each | N/A |

**GOSI Integration:**
```typescript
interface GOSIIntegration {
  calculateContributions(employee: Employee): GOSIContribution {
    const contributableSalary = Math.min(employee.totalSalary, 45000); // Max cap

    if (employee.nationality === 'SAUDI') {
      return {
        employeePension: contributableSalary * 0.0975,
        employerPension: contributableSalary * 0.0975,
        occupationalHazards: contributableSalary * 0.02,
        saned: {
          employee: contributableSalary * 0.0075,
          employer: contributableSalary * 0.0075
        },
        total: {
          employee: contributableSalary * 0.105,
          employer: contributableSalary * 0.1175
        }
      };
    } else {
      return {
        employeePension: 0,
        employerPension: 0,
        occupationalHazards: contributableSalary * 0.02,
        saned: { employee: 0, employer: 0 },
        total: { employee: 0, employer: contributableSalary * 0.02 }
      };
    }
  }

  generateGOSIFile(payrollRun: PayrollRun): GOSIFile;
  validateGOSIRegistration(employees: Employee[]): ValidationResult;
}
```

### 2.6 Saudization (Nitaqat) - KSA

| Nitaqat Band | Description | Requirements |
|--------------|-------------|--------------|
| Platinum | Highest compliance | Above target ratio |
| Green (High/Medium/Low) | Good compliance | Meeting targets |
| Yellow | Warning zone | Below target |
| Red | Non-compliance | Critical - restrictions apply |

**Nitaqat Tracking:**
```typescript
interface NitaqatCompliance {
  calculateRatio(company: Company): NitaqatResult {
    const totalEmployees = company.employees.length;
    const saudiEmployees = company.employees.filter(e => e.nationality === 'SAUDI').length;
    const ratio = saudiEmployees / totalEmployees;

    return {
      currentRatio: ratio,
      requiredRatio: getIndustryRequirement(company.industry, company.size),
      band: determineBand(ratio, company.industry, company.size),
      deficit: calculateDeficit(ratio, requiredRatio, totalEmployees),
      recommendations: generateRecommendations(...)
    };
  }

  trackProgress(): NitaqatDashboard;
  alertOnRiskChange(): void;
}
```

### 2.7 EOSB (KSA)

| Service Period | Resignation | Termination |
|----------------|-------------|-------------|
| < 2 years | Nothing | Half month per year |
| 2-5 years | 1/3 of entitlement | Half month per year |
| 5-10 years | 2/3 of entitlement | Half month per year |
| > 10 years | Full entitlement | Half month (first 5) + full month (after 5) |

---

## 3. Bahrain

### 3.1 Governing Law
- **Labour Law No. 36 of 2012**
- **Social Insurance Organization (SIO)** regulations

### 3.2 Key Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Working Hours | 8 hours/day, 48 hours/week | Partial |
| Overtime | 125% (day), 150% (night/holiday) | Missing |
| Annual Leave | 30 days after 1 year | Missing |
| Sick Leave | 55 days (15 full, 20 half, 20 unpaid) | Missing |
| Maternity | 60 days | Missing |
| SIO Contribution | 7% employee, 12% employer | Missing |
| Gratuity | 15 days per year (first 3), 1 month (after) | Missing |

### 3.3 SIO Contributions

| Type | Employee | Employer |
|------|----------|----------|
| Social Insurance | 7% | 12% |
| Unemployment | 1% | 1% |
| Labour Fund Levy | - | 1% |

---

## 4. Qatar

### 4.1 Governing Law
- **Labour Law No. 14 of 2004**
- **Wage Protection System (WPS)**

### 4.2 Key Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Working Hours | 8 hours/day, 48 hours/week | Partial |
| Ramadan Hours | 6 hours/day, 36 hours/week | Missing |
| Overtime | 125% normal, 150% 9pm-6am | Missing |
| Annual Leave | 3 weeks (first 5 years), 4 weeks (after) | Missing |
| Sick Leave | 2 weeks full, 4 weeks half | Missing |
| Maternity | 50 days | Missing |
| EOSB | 3 weeks per year | Missing |
| WPS | Mandatory electronic salary payment | Missing |

---

## 5. Oman

### 5.1 Governing Law
- **Labour Law (Royal Decree 35/2003)**
- **Public Authority for Social Insurance (PASI)**

### 5.2 Key Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Working Hours | 9 hours/day, 45 hours/week | Partial |
| Ramadan Hours | 6 hours/day | Missing |
| Overtime | 125% (day), 150% (night/holiday) | Missing |
| Annual Leave | 30 days per year | Missing |
| Sick Leave | 10 weeks total (various rates) | Missing |
| Maternity | 50 days | Missing |
| PASI (Omanis) | 7% employee, 11.5% employer | Missing |
| Gratuity (Expats) | 15 days per year | Missing |

---

## 6. Kuwait

### 6.1 Governing Law
- **Labour Law No. 6 of 2010**
- **Public Institution for Social Security (PIFSS)**

### 6.2 Key Requirements

| Requirement | Description | AuraOS Status |
|-------------|-------------|---------------|
| Working Hours | 8 hours/day, 48 hours/week | Partial |
| Ramadan Hours | 6 hours/day, 36 hours/week | Missing |
| Overtime | 125% + 1 hour pay per hour | Missing |
| Annual Leave | 30 days per year | Missing |
| Sick Leave | 75 days (15 full, 10 3/4, 10 half, 10 1/4, 30 unpaid) | Missing |
| Maternity | 70 days | Missing |
| PIFSS (Kuwaitis) | 8% employee, 11.5% employer | Missing |
| Indemnity (Expats) | 15 days per year (first 5), 1 month (after) | Missing |

---

## 7. India

### 7.1 Governing Laws
- **Payment of Wages Act, 1936**
- **Minimum Wages Act, 1948**
- **Employees' Provident Fund Act, 1952**
- **Employees' State Insurance Act, 1948**
- **Payment of Gratuity Act, 1972**
- **Maternity Benefit Act, 1961**
- **Code on Social Security, 2020** (new)
- **Code on Wages, 2019** (new)

### 7.2 Provident Fund (PF)

| Component | Contribution |
|-----------|--------------|
| Employee EPF | 12% of Basic + DA |
| Employer EPF | 3.67% of Basic + DA |
| Employer EPS (Pension) | 8.33% of Basic + DA (max 15,000) |
| Admin Charges | 0.5% employer |
| EDLI (Insurance) | 0.5% employer |

**PF Integration:**
```typescript
interface IndiaProvidentFund {
  calculate(employee: Employee): PFContribution {
    const pfWage = employee.basicSalary + employee.da;
    const cappedWage = Math.min(pfWage, 15000); // EPS cap

    return {
      employee: {
        epf: pfWage * 0.12
      },
      employer: {
        epf: pfWage * 0.0367,
        eps: cappedWage * 0.0833,
        adminCharges: pfWage * 0.005,
        edli: pfWage * 0.005
      },
      total: {
        employee: pfWage * 0.12,
        employer: pfWage * (0.0367 + 0.0833 + 0.005 + 0.005)
      }
    };
  }

  generateECR(): ECRFile; // Electronic Challan cum Return
  validateUAN(employee: Employee): boolean;
}
```

### 7.3 ESI (Employee State Insurance)

| Component | Rate | Applicability |
|-----------|------|---------------|
| Employee | 0.75% | Gross salary ≤ 21,000 |
| Employer | 3.25% | Gross salary ≤ 21,000 |

**ESI Integration:**
```typescript
interface IndiaESI {
  isApplicable(employee: Employee): boolean {
    return employee.grossSalary <= 21000;
  }

  calculate(employee: Employee): ESIContribution {
    if (!this.isApplicable(employee)) return null;

    return {
      employee: employee.grossSalary * 0.0075,
      employer: employee.grossSalary * 0.0325,
      total: employee.grossSalary * 0.04
    };
  }

  generateChallan(): ESIChallan;
}
```

### 7.4 TDS (Tax Deducted at Source)

| Income Slab (Old Regime) | Tax Rate |
|--------------------------|----------|
| Up to 2,50,000 | Nil |
| 2,50,001 - 5,00,000 | 5% |
| 5,00,001 - 10,00,000 | 20% |
| Above 10,00,000 | 30% |

| Income Slab (New Regime 2024) | Tax Rate |
|-------------------------------|----------|
| Up to 3,00,000 | Nil |
| 3,00,001 - 7,00,000 | 5% |
| 7,00,001 - 10,00,000 | 10% |
| 10,00,001 - 12,00,000 | 15% |
| 12,00,001 - 15,00,000 | 20% |
| Above 15,00,000 | 30% |

**TDS Engine:**
```typescript
interface IndiaTDSEngine {
  calculateTDS(employee: Employee, regime: 'OLD' | 'NEW'): TDSResult {
    const taxableIncome = calculateTaxableIncome(employee, regime);
    const tax = calculateTax(taxableIncome, regime);
    const cess = tax * 0.04; // 4% Health & Education Cess

    return {
      grossIncome: employee.annualIncome,
      exemptions: calculateExemptions(employee, regime),
      taxableIncome,
      tax,
      cess,
      totalTax: tax + cess,
      monthlyTDS: (tax + cess) / 12
    };
  }

  processInvestmentDeclaration(declaration: InvestmentDeclaration): TaxSavings;
  generateForm16(employee: Employee, fy: string): Form16;
  generateForm12BA(employee: Employee, fy: string): Form12BA;
}
```

### 7.5 Professional Tax (State-wise)

| State | Maximum Annual | Slabs |
|-------|----------------|-------|
| Maharashtra | 2,500 | Multiple slabs |
| Karnataka | 2,400 | Multiple slabs |
| West Bengal | 2,500 | Multiple slabs |
| Telangana | 2,500 | Multiple slabs |
| Gujarat | 2,500 | Multiple slabs |
| Tamil Nadu | 2,500 | Multiple slabs |

### 7.6 Leave Entitlements (India)

| Leave Type | Entitlement | AuraOS Status |
|------------|-------------|---------------|
| Earned Leave (EL) | 15-30 days/year (state-wise) | Missing |
| Casual Leave (CL) | 6-12 days/year | Missing |
| Sick Leave (SL) | 6-15 days/year | Missing |
| Maternity | 26 weeks | Missing |
| Paternity | 15 days (central govt/some companies) | Missing |
| Public Holidays | 10-15 days (state-wise) | Missing |

### 7.7 Gratuity (India)

| Service | Entitlement |
|---------|-------------|
| After 5 years | 15 days per year of service |
| Maximum | 20 lakh (statutory limit) |
| Calculation | (Last drawn salary × 15 × Years) / 26 |

---

## Implementation Priority Matrix

### Phase 1 - Critical (MENA Launch)

| Country | Requirements | Priority |
|---------|--------------|----------|
| UAE | WPS, EOSB, Leave, Working Hours | Critical |
| KSA | GOSI, Mudad, Nitaqat, EOSB | Critical |
| Bahrain | SIO, Leave, Gratuity | High |

### Phase 2 - High Priority (GCC Expansion)

| Country | Requirements | Priority |
|---------|--------------|----------|
| Qatar | WPS, EOSB, Leave | High |
| Oman | PASI, Gratuity | High |
| Kuwait | PIFSS, Indemnity | High |

### Phase 3 - India Market

| Requirement | Priority |
|-------------|----------|
| PF/EPF/EPS | Critical |
| ESI | Critical |
| TDS | Critical |
| Professional Tax | High |
| Gratuity | High |
| Form 16/12BA | High |

---

## Data Model Requirements

### Labour Law Configuration Table

```prisma
model LabourLawConfig {
  id              String   @id @default(cuid())
  tenantId        String
  country         String   // ISO country code
  effectiveFrom   DateTime
  effectiveTo     DateTime?

  // Working Hours
  standardHoursPerDay    Int
  standardHoursPerWeek   Int
  ramadanHoursPerDay     Int?
  overtimeRateNormal     Decimal
  overtimeRateNight      Decimal
  overtimeRateHoliday    Decimal
  maxOvertimeHoursPerYear Int?

  // Leave Policies
  annualLeaveFirstYear   Int
  annualLeaveAfterYears  Int
  sickLeaveFullPay       Int
  sickLeaveHalfPay       Int
  sickLeaveUnpaid        Int
  maternityLeaveDays     Int
  paternityLeaveDays     Int
  hajjLeaveDays          Int?

  // EOSB/Gratuity
  eosb_first_period_years Int
  eosb_first_period_days  Int
  eosb_after_period_days  Int
  eosb_max_cap            Decimal?

  // Social Insurance
  socialInsurance_employee_rate Decimal?
  socialInsurance_employer_rate Decimal?
  socialInsurance_max_wage      Decimal?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant          Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId, country, effectiveFrom])
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

// Compliance APIs
POST   /api/compliance/eosb/calculate
POST   /api/compliance/overtime/calculate
POST   /api/compliance/leave/validate
GET    /api/compliance/wps/generate/:payrollId
GET    /api/compliance/gosi/generate/:payrollId
GET    /api/compliance/nitaqat/status
GET    /api/compliance/india/pf/ecr/:payrollId
GET    /api/compliance/india/form16/:employeeId/:fy

// Validation APIs
POST   /api/validation/contract/:countryCode
POST   /api/validation/payroll/:countryCode
POST   /api/validation/leave-request/:countryCode
```

---

**Next:** [Bilingual Strategy](./04-BILINGUAL-STRATEGY.md)
