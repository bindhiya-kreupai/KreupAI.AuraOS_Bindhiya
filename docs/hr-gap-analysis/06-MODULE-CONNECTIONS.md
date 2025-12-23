# Module Connections & Integration Map

**Related Documents:**
- [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
- [Detailed GAP Analysis](./02-DETAILED-GAP-ANALYSIS.md)
- [Implementation Roadmap](./05-IMPLEMENTATION-ROADMAP.md)

---

## Overview

This document maps the interconnections between AuraOS modules, identifying integration points, data flows, and dependencies that must be considered during development.

---

## Module Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AURAOS MODULE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   Core HR   │────▶│  Org Design │────▶│ Job Library │────▶│ Competency  │   │
│  │  (Employee) │     │             │     │             │     │   Library   │   │
│  └──────┬──────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘   │
│         │                                        │                    │         │
│         │         ┌──────────────────────────────┼────────────────────┘         │
│         │         │                              │                              │
│         ▼         ▼                              ▼                              │
│  ┌─────────────────────┐              ┌─────────────────────┐                  │
│  │     Recruitment     │─────────────▶│     Onboarding      │                  │
│  │  (Hire-to-Retire)   │              │                     │                  │
│  └──────────┬──────────┘              └──────────┬──────────┘                  │
│             │                                     │                             │
│             ▼                                     ▼                             │
│  ┌──────────────────────────────────────────────────────────────────────┐      │
│  │                        EMPLOYEE LIFECYCLE                             │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │      │
│  │  │Attendance│  │  Leave   │  │  Payroll │  │Performance│  │  L&D   │ │      │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───┬────┘ │      │
│  │       │             │             │               │             │      │      │
│  │       └─────────────┴──────┬──────┴───────────────┴─────────────┘      │      │
│  │                            │                                           │      │
│  │                            ▼                                           │      │
│  │                   ┌─────────────────┐                                  │      │
│  │                   │  Compensation   │                                  │      │
│  │                   │   & Benefits    │                                  │      │
│  │                   └────────┬────────┘                                  │      │
│  │                            │                                           │      │
│  └────────────────────────────┼───────────────────────────────────────────┘      │
│                               │                                                   │
│                               ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                      WORKFORCE MANAGEMENT                            │        │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐│        │
│  │  │ Workforce │  │ Succession│  │  Career   │  │       DEI         ││        │
│  │  │ Planning  │  │ Planning  │  │ Planning  │  │                   ││        │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────────────┘│        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                               │                                                   │
│                               ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                         EXIT MANAGEMENT                              │        │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐   │        │
│  │  │  Offboarding  │───▶│     EOSB      │───▶│   Final Payroll   │   │        │
│  │  └───────────────┘    └───────────────┘    └───────────────────┘   │        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐        │
│  │                       CROSS-CUTTING CONCERNS                         │        │
│  │  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────┐│        │
│  │  │ Reports │  │ Workflows │  │  Audit   │  │ Notif.   │  │  AI   ││        │
│  │  │Analytics│  │ Approvals │  │ Security │  │  Alerts  │  │Engine ││        │
│  │  └─────────┘  └───────────┘  └──────────┘  └──────────┘  └───────┘│        │
│  └─────────────────────────────────────────────────────────────────────┘        │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Module Connections

### 1. Core HR → Multiple Modules

The Core HR (Employee) module is the central hub connecting to all other modules.

```
Core HR (Employee)
├── → Payroll
│   ├── Employee basic salary
│   ├── Bank account details
│   ├── Tax identification
│   └── Employment type (affects statutory deductions)
│
├── → Leave Management
│   ├── Leave eligibility (based on tenure)
│   ├── Leave policy assignment
│   └── Leave balance tracking
│
├── → Attendance
│   ├── Shift assignment
│   ├── Work location
│   └── Manager for approvals
│
├── → Performance
│   ├── Goals assignment
│   ├── Review cycles
│   └── Performance ratings
│
├── → Competency Library
│   ├── Role-competency mapping
│   ├── Skill assessments
│   └── Gap analysis
│
├── → Recruitment
│   ├── Referral tracking
│   ├── Internal job applications
│   └── Interviewer assignments
│
└── → Offboarding
    ├── Exit formalities
    ├── EOSB calculation
    └── Final settlement
```

**Database Relations:**
```prisma
model Employee {
  id              String        @id @default(cuid())
  tenantId        String

  // Payroll relations
  payslips        Payslip[]
  bankAccounts    BankAccount[]
  taxDetails      EmployeeTax?

  // Leave relations
  leaveBalances   LeaveBalance[]
  leaveRequests   LeaveRequest[]

  // Attendance relations
  shiftAssignment ShiftAssignment?
  attendances     Attendance[]

  // Performance relations
  goals           Goal[]
  reviews         PerformanceReview[]

  // Competency relations
  skillAssessments SkillAssessment[]
  developmentPlans DevelopmentPlan[]

  // ... other fields
}
```

---

### 2. Payroll → Connected Modules

```
Payroll
├── ← Attendance
│   ├── Overtime hours
│   ├── Late deductions
│   └── Shift allowances
│
├── ← Leave Management
│   ├── Leave salary (annual leave encashment)
│   ├── Leave without pay deductions
│   └── Leave balance for final settlement
│
├── ← Performance
│   ├── Performance bonuses
│   └── Increment recommendations
│
├── ← Compensation
│   ├── Salary structures
│   ├── Pay components
│   └── Variable pay
│
├── → WPS (UAE)
│   ├── SIF file generation
│   └── Salary transfer tracking
│
├── → GOSI (KSA)
│   ├── Contribution calculations
│   └── GOSI file generation
│
├── → India Statutory
│   ├── PF/ESI deductions
│   ├── TDS calculations
│   └── Form 16 generation
│
└── → Finance/Accounting
    ├── Payroll journal entries
    ├── Cost center allocation
    └── Bank reconciliation
```

**Data Flow Example:**
```typescript
// Payroll processing flow
async function processPayroll(payrollRunId: string): Promise<PayrollResult> {
  // 1. Get attendance data
  const attendanceData = await attendanceService.getMonthlyAttendance(payrollRunId);

  // 2. Get leave data
  const leaveData = await leaveService.getMonthlyLeaveImpact(payrollRunId);

  // 3. Get performance bonuses
  const bonuses = await performanceService.getPayableBonuses(payrollRunId);

  // 4. Get compensation structure
  const salaryStructures = await compensationService.getSalaryStructures(payrollRunId);

  // 5. Calculate gross salary
  const grossCalculations = calculateGross(salaryStructures, attendanceData, bonuses);

  // 6. Apply leave impact
  const leaveAdjusted = applyLeaveDeductions(grossCalculations, leaveData);

  // 7. Calculate statutory deductions
  const withStatutory = await calculateStatutory(leaveAdjusted);

  // 8. Generate payslips
  const payslips = await generatePayslips(withStatutory);

  // 9. Generate WPS/GOSI files if applicable
  await generateComplianceFiles(payrollRunId);

  return { payslips, summary: calculateSummary(payslips) };
}
```

---

### 3. Leave Management → Connected Modules

```
Leave Management
├── ← Core HR
│   ├── Employee eligibility
│   ├── Tenure for accrual
│   └── Leave policy assignment
│
├── → Payroll
│   ├── Leave encashment payments
│   └── LOP deductions
│
├── → Attendance
│   ├── Leave days exclusion
│   └── Half-day leave tracking
│
├── → Calendar
│   ├── Team availability
│   └── Holiday overlaps
│
├── → Workflow
│   ├── Approval chain
│   └── Delegation rules
│
└── → Compliance
    ├── Country-specific rules
    ├── Maximum accumulation
    └── Mandatory utilization
```

**Integration Points:**
```typescript
// Leave request processing
async function processLeaveRequest(request: LeaveRequest): Promise<LeaveResult> {
  // 1. Validate against HR policies
  const policyValidation = await validateAgainstPolicy(request);

  // 2. Check attendance impact
  const attendanceCheck = await checkAttendanceConflicts(request);

  // 3. Check team calendar
  const calendarCheck = await checkTeamAvailability(request);

  // 4. Apply country-specific rules
  const complianceCheck = await validateCountryRules(request);

  // 5. Calculate balance impact
  const balanceImpact = await calculateBalanceImpact(request);

  // 6. Route for approval
  const approvalChain = await getApprovalChain(request);

  return {
    isValid: allChecksPass([policyValidation, attendanceCheck, calendarCheck, complianceCheck]),
    balanceImpact,
    approvalChain,
    validationResults: { policyValidation, attendanceCheck, calendarCheck, complianceCheck }
  };
}
```

---

### 4. Attendance → Connected Modules

```
Attendance
├── ← Core HR
│   ├── Employee shift assignment
│   ├── Work location
│   └── Manager (for regularization)
│
├── ← Leave Management
│   ├── Leave days (exclude from attendance)
│   └── Compensatory off
│
├── → Payroll
│   ├── Overtime hours
│   ├── Late/early deductions
│   └── Shift allowances
│
├── → Biometric Devices
│   ├── Punch data ingestion
│   └── Device sync status
│
├── → Mobile App
│   ├── GPS-based attendance
│   └── Facial recognition
│
└── → Analytics
    ├── Attendance trends
    ├── Punctuality metrics
    └── Overtime analysis
```

---

### 5. Performance → Connected Modules

```
Performance
├── ← Core HR
│   ├── Employee details
│   ├── Manager relationship
│   └── Role/competencies
│
├── ← Competency Library
│   ├── Required competencies
│   ├── Skill assessments
│   └── Gap analysis
│
├── → Payroll
│   ├── Performance bonuses
│   ├── Merit increases
│   └── Variable pay
│
├── → Compensation
│   ├── Increment recommendations
│   └── Promotion salary adjustments
│
├── → L&D
│   ├── Training recommendations
│   ├── Development plans
│   └── Skill improvement tracking
│
├── → Succession Planning
│   ├── High potential identification
│   └── Leadership readiness
│
└── → Career Planning
    ├── Career progression
    └── Role suitability
```

---

### 6. Recruitment → Connected Modules

```
Recruitment
├── ← Job Library
│   ├── Job profiles
│   ├── Competency requirements
│   └── Salary bands
│
├── ← Org Design
│   ├── Position requisitions
│   └── Headcount planning
│
├── ← Core HR
│   ├── Interviewer availability
│   └── Hiring manager details
│
├── → Onboarding
│   ├── Candidate → Employee transition
│   ├── Offer details
│   └── Joining date
│
├── → External Integrations
│   ├── Job boards (LinkedIn, Indeed, Bayt)
│   ├── Background verification
│   └── Assessment platforms
│
└── → Analytics
    ├── Time-to-hire
    ├── Cost-per-hire
    └── Source effectiveness
```

---

### 7. Compensation & Benefits → Connected Modules

```
Compensation
├── ← Core HR
│   ├── Employee grade
│   ├── Experience
│   └── Location
│
├── ← Job Library
│   ├── Salary bands
│   ├── Grade structures
│   └── Market benchmarks
│
├── ← Performance
│   ├── Increment recommendations
│   ├── Bonus eligibility
│   └── Promotion adjustments
│
├── → Payroll
│   ├── Salary components
│   ├── Allowances
│   └── Deductions
│
├── → Benefits
│   ├── Insurance plans
│   ├── Retirement plans
│   └── Wellness programs
│
└── → Budgeting
    ├── Salary budgets
    ├── Increment budgets
    └── Variable pay budgets
```

---

### 8. Offboarding → Connected Modules

```
Offboarding
├── ← Core HR
│   ├── Employee details
│   ├── Tenure calculation
│   └── Exit reason
│
├── → Leave Management
│   ├── Leave balance encashment
│   └── Leave adjustment
│
├── → Payroll
│   ├── Final settlement
│   ├── Full & final calculation
│   └── EOSB/Gratuity
│
├── → Compliance
│   ├── EOSB calculation (country-specific)
│   ├── Notice period handling
│   └── Statutory clearances
│
├── → IT Assets
│   ├── Asset recovery
│   └── Access revocation
│
├── → Documentation
│   ├── Experience letter
│   ├── Relieving letter
│   └── Tax documents
│
└── → Analytics
    ├── Attrition analysis
    ├── Exit interview insights
    └── Retention metrics
```

---

## Cross-Module Event Flow

### Employee Lifecycle Events

```typescript
// Event-driven architecture for module integration
interface EmployeeLifecycleEvent {
  eventType: EmployeeEventType;
  employeeId: string;
  tenantId: string;
  timestamp: Date;
  payload: Record<string, any>;
  source: ModuleName;
  targets: ModuleName[];
}

enum EmployeeEventType {
  // Recruitment → Onboarding
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  CANDIDATE_JOINED = 'CANDIDATE_JOINED',

  // Onboarding → Core HR
  EMPLOYEE_CREATED = 'EMPLOYEE_CREATED',
  PROBATION_STARTED = 'PROBATION_STARTED',

  // Core HR → Multiple
  EMPLOYEE_CONFIRMED = 'EMPLOYEE_CONFIRMED',
  EMPLOYEE_PROMOTED = 'EMPLOYEE_PROMOTED',
  EMPLOYEE_TRANSFERRED = 'EMPLOYEE_TRANSFERRED',
  SALARY_REVISED = 'SALARY_REVISED',

  // Attendance → Payroll
  OVERTIME_LOGGED = 'OVERTIME_LOGGED',
  ATTENDANCE_FINALIZED = 'ATTENDANCE_FINALIZED',

  // Leave → Multiple
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_ENCASHED = 'LEAVE_ENCASHED',

  // Performance → Multiple
  REVIEW_COMPLETED = 'REVIEW_COMPLETED',
  BONUS_APPROVED = 'BONUS_APPROVED',
  INCREMENT_PROCESSED = 'INCREMENT_PROCESSED',

  // Offboarding
  RESIGNATION_SUBMITTED = 'RESIGNATION_SUBMITTED',
  TERMINATION_INITIATED = 'TERMINATION_INITIATED',
  EXIT_COMPLETED = 'EXIT_COMPLETED',
  FINAL_SETTLEMENT_PROCESSED = 'FINAL_SETTLEMENT_PROCESSED'
}

// Event handlers
const eventHandlers: Record<EmployeeEventType, ModuleName[]> = {
  [EmployeeEventType.EMPLOYEE_CREATED]: [
    'LEAVE_MANAGEMENT',    // Initialize leave balances
    'ATTENDANCE',          // Assign shift
    'PAYROLL',            // Setup salary structure
    'COMPETENCY',         // Map role competencies
    'NOTIFICATIONS'       // Welcome communications
  ],

  [EmployeeEventType.LEAVE_APPROVED]: [
    'ATTENDANCE',         // Mark leave days
    'CALENDAR',          // Update team calendar
    'NOTIFICATIONS'      // Notify team
  ],

  [EmployeeEventType.RESIGNATION_SUBMITTED]: [
    'WORKFLOW',          // Initiate exit workflow
    'LEAVE_MANAGEMENT',  // Calculate encashable balance
    'PAYROLL',          // Prepare final settlement
    'IT_ASSETS',        // Asset recovery initiation
    'NOTIFICATIONS'     // Notify stakeholders
  ],

  // ... other event mappings
};
```

---

## Integration API Contracts

### Module-to-Module APIs

```typescript
// Internal service interfaces

// Payroll Service - required data from other modules
interface PayrollModuleRequirements {
  fromAttendance: {
    getOvertimeHours(employeeId: string, month: string): Promise<OvertimeData>;
    getLateDeductions(employeeId: string, month: string): Promise<DeductionData>;
  };
  fromLeave: {
    getLeaveWithoutPay(employeeId: string, month: string): Promise<LWPData>;
    getEncashableDays(employeeId: string): Promise<EncashmentData>;
  };
  fromPerformance: {
    getPayableBonuses(employeeId: string, month: string): Promise<BonusData>;
  };
  fromCompensation: {
    getSalaryStructure(employeeId: string): Promise<SalaryStructure>;
  };
}

// Leave Service - required data from other modules
interface LeaveModuleRequirements {
  fromCoreHR: {
    getEmployeeTenure(employeeId: string): Promise<TenureData>;
    getLeavePolicy(employeeId: string): Promise<LeavePolicy>;
  };
  fromAttendance: {
    validateNoShiftConflict(employeeId: string, dates: Date[]): Promise<boolean>;
  };
  fromCompliance: {
    getCountryLeaveRules(country: string): Promise<LeaveRules>;
  };
}

// EOSB Service - required data for calculation
interface EOSBModuleRequirements {
  fromCoreHR: {
    getEmployeeDetails(employeeId: string): Promise<Employee>;
    getServiceDuration(employeeId: string): Promise<ServiceDuration>;
    getTerminationType(employeeId: string): Promise<TerminationType>;
  };
  fromPayroll: {
    getBasicSalary(employeeId: string): Promise<number>;
    getLastDrawnSalary(employeeId: string): Promise<SalaryDetails>;
  };
  fromLeave: {
    getLeaveBalance(employeeId: string): Promise<LeaveBalance>;
    getEncashableBalance(employeeId: string): Promise<number>;
  };
  fromCompliance: {
    getEOSBRules(country: string): Promise<EOSBRules>;
  };
}
```

---

## Data Consistency Requirements

### Transactional Boundaries

```typescript
// Transactions that span multiple modules
const crossModuleTransactions = {
  // Salary revision - updates multiple modules atomically
  salaryRevision: {
    modules: ['CORE_HR', 'COMPENSATION', 'PAYROLL'],
    operations: [
      'Update employee salary in Core HR',
      'Update compensation history',
      'Update payroll salary structure',
      'Recalculate future payslips if any'
    ],
    rollbackStrategy: 'SAGA_PATTERN'
  },

  // Leave encashment - affects leave and payroll
  leaveEncashment: {
    modules: ['LEAVE_MANAGEMENT', 'PAYROLL'],
    operations: [
      'Deduct leave balance',
      'Create payroll entry for encashment amount',
      'Update leave history'
    ],
    rollbackStrategy: 'SAGA_PATTERN'
  },

  // Final settlement - complex multi-module transaction
  finalSettlement: {
    modules: ['OFFBOARDING', 'LEAVE_MANAGEMENT', 'PAYROLL', 'COMPLIANCE'],
    operations: [
      'Calculate leave encashment',
      'Calculate EOSB/Gratuity',
      'Calculate final salary',
      'Apply statutory deductions',
      'Generate full & final statement',
      'Update WPS/GOSI if applicable'
    ],
    rollbackStrategy: 'SAGA_WITH_COMPENSATION'
  }
};
```

---

## Module Dependency Matrix

| Module | Depends On | Depended By |
|--------|------------|-------------|
| Core HR | Master Data, Org Design | All modules |
| Payroll | Core HR, Attendance, Leave, Compensation | WPS, GOSI, Finance |
| Leave | Core HR, Compliance | Payroll, Attendance, Calendar |
| Attendance | Core HR, Leave | Payroll, Analytics |
| Performance | Core HR, Competency | Payroll, L&D, Succession |
| Recruitment | Job Library, Org Design | Onboarding |
| Onboarding | Recruitment | Core HR |
| Offboarding | Core HR | Payroll, Leave, IT Assets |
| Compensation | Core HR, Job Library | Payroll, Performance |
| Competency | Job Library | Performance, L&D, Recruitment |
| Compliance | Master Data | Payroll, Leave, EOSB |

---

## Implementation Guidelines

### Adding New Module Integrations

1. **Define Events**
   - Create event types in `EmployeeEventType` enum
   - Define event payload structure
   - Register event handlers

2. **Define Contracts**
   - Create interface for required data
   - Implement service methods
   - Add validation

3. **Handle Failures**
   - Implement retry logic
   - Add compensation actions
   - Log for debugging

4. **Test Integration**
   - Unit test each module
   - Integration test cross-module flows
   - Load test critical paths

---

**Next:** [AI/ML Strategy](./07-AI-ML-STRATEGY.md)
