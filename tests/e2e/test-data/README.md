# E2E Test Data Management
**Owner:** Dev B (QA Specialist)
**Purpose:** Define test data requirements and seeding strategies for E2E tests
**Last Updated:** December 27, 2024

---

## Overview

This document defines the test data structure, seeding strategies, and management approaches for E2E testing of AuraOS HCM modules.

---

## Test Data Principles

### 1. Data Isolation
- Each test should use isolated data
- No dependencies between tests
- Data reset after each test suite

### 2. Data Consistency
- Use factories for predictable data generation
- Consistent naming conventions
- Reproducible across environments

### 3. Data Realism
- Data should reflect real-world scenarios
- Include edge cases
- Cover all user personas

---

## Test User Personas

### Employees

| User ID | Name | Email | Role | Department | Manager |
|---------|------|-------|------|------------|---------|
| emp-001 | John Doe | john.doe@test.com | Software Engineer | Engineering | mgr-001 |
| emp-002 | Alice Smith | alice.smith@test.com | Product Manager | Product | mgr-002 |
| emp-003 | Bob Johnson | bob.johnson@test.com | QA Engineer | Engineering | mgr-001 |
| emp-004 | Carol White | carol.white@test.com | Designer | Design | mgr-003 |
| emp-005 | David Brown | david.brown@test.com | Marketing Specialist | Marketing | mgr-002 |
| emp-006 | Emma Davis | emma.davis@test.com | Sales Representative | Sales | mgr-003 |
| emp-007 | Frank Miller | frank.miller@test.com | HR Coordinator | HR | mgr-004 |
| emp-008 | Grace Wilson | grace.wilson@test.com | Finance Analyst | Finance | mgr-004 |
| emp-009 | Henry Taylor | henry.taylor@test.com | Operations Manager | Operations | mgr-002 |
| emp-010 | Ivy Anderson | ivy.anderson@test.com | Customer Success | Support | mgr-003 |

### Managers

| User ID | Name | Email | Role | Department | Reports |
|---------|------|-------|------|------------|---------|
| mgr-001 | Jane Manager | jane.manager@test.com | Engineering Manager | Engineering | 2 |
| mgr-002 | Tom Lead | tom.lead@test.com | Product Lead | Product | 3 |
| mgr-003 | Sarah Director | sarah.director@test.com | Design Director | Design | 3 |
| mgr-004 | Mike Executive | mike.executive@test.com | VP Operations | Operations | 2 |

### HR/Admin Users

| User ID | Name | Email | Role | Permissions |
|---------|------|-------|------|-------------|
| hr-001 | Sarah HR | sarah.hr@test.com | HR Manager | Full HR access |
| hr-002 | Lisa Admin | lisa.admin@test.com | HR Admin | HR operations |
| admin-001 | Super Admin | admin@test.com | Super Admin | Full system access |

---

## Leave Management Test Data

### Leave Types and Balances

```typescript
export const leaveTypes = [
  {
    id: 'annual',
    name: 'Annual Leave',
    defaultBalance: 20,
    carryForward: true,
    maxCarryForward: 5,
  },
  {
    id: 'sick',
    name: 'Sick Leave',
    defaultBalance: 10,
    carryForward: false,
    requiresDocument: true, // if > 2 days
  },
  {
    id: 'casual',
    name: 'Casual Leave',
    defaultBalance: 5,
    carryForward: false,
  },
  {
    id: 'maternity',
    name: 'Maternity Leave',
    defaultBalance: 90,
    carryForward: false,
    eligibility: 'female',
  },
  {
    id: 'paternity',
    name: 'Paternity Leave',
    defaultBalance: 14,
    carryForward: false,
    eligibility: 'male',
  },
];
```

### Sample Leave Requests

```typescript
export const leaveRequests = [
  {
    id: 'leave-001',
    employeeId: 'emp-001',
    leaveType: 'annual',
    startDate: '2025-03-15',
    endDate: '2025-03-19',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    managerId: 'mgr-001',
  },
  {
    id: 'leave-002',
    employeeId: 'emp-002',
    leaveType: 'sick',
    startDate: '2025-02-10',
    endDate: '2025-02-10',
    days: 1,
    reason: 'Medical appointment',
    status: 'approved',
    managerId: 'mgr-002',
    approvedAt: '2025-02-08T10:00:00Z',
  },
  {
    id: 'leave-003',
    employeeId: 'emp-003',
    leaveType: 'casual',
    startDate: '2025-02-20',
    endDate: '2025-02-20',
    days: 1,
    reason: 'Personal work',
    status: 'rejected',
    managerId: 'mgr-001',
    rejectedAt: '2025-02-18T14:30:00Z',
    rejectionReason: 'Project deadline approaching',
  },
];
```

### Leave Balance Snapshots

```typescript
export const leaveBalances = [
  {
    employeeId: 'emp-001',
    annual: { total: 20, used: 5, available: 15 },
    sick: { total: 10, used: 2, available: 8 },
    casual: { total: 5, used: 1, available: 4 },
  },
  {
    employeeId: 'emp-002',
    annual: { total: 20, used: 0, available: 20 },
    sick: { total: 10, used: 1, available: 9 },
    casual: { total: 5, used: 0, available: 5 },
  },
];
```

---

## Recruitment Test Data

### Job Postings

```typescript
export const jobPostings = [
  {
    id: 'job-001',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 120000,
    salaryMax: 160000,
    description: 'We are seeking an experienced software engineer to join our backend team...',
    requirements: '5+ years of experience in backend development, proficiency in Node.js...',
    benefits: 'Health insurance, 401k, stock options, flexible hours',
    status: 'active',
    postedBy: 'hr-001',
    postedAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'job-002',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 100000,
    salaryMax: 130000,
    description: 'Looking for a product manager to drive product strategy...',
    requirements: '3+ years of product management experience, strong analytical skills...',
    status: 'active',
    postedBy: 'hr-001',
    postedAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'job-003',
    title: 'UX Designer',
    department: 'Design',
    location: 'New York, NY',
    jobType: 'full-time',
    experienceLevel: 'mid',
    status: 'closed',
    postedBy: 'hr-001',
    closedAt: '2025-01-25T16:00:00Z',
    closedReason: 'Position filled',
  },
];
```

### Candidate Applications

```typescript
export const applications = [
  {
    id: 'app-001',
    jobId: 'job-001',
    candidateName: 'Michael Candidate',
    candidateEmail: 'michael.candidate@email.com',
    candidatePhone: '+1-555-0101',
    resumeUrl: '/test-data/resumes/michael-candidate.pdf',
    coverLetter: 'I am excited to apply for the Senior Software Engineer position...',
    status: 'shortlisted',
    appliedAt: '2025-01-16T12:00:00Z',
    shortlistedAt: '2025-01-18T10:00:00Z',
  },
  {
    id: 'app-002',
    jobId: 'job-001',
    candidateName: 'Sarah Developer',
    candidateEmail: 'sarah.dev@email.com',
    candidatePhone: '+1-555-0102',
    resumeUrl: '/test-data/resumes/sarah-developer.pdf',
    status: 'interview-scheduled',
    appliedAt: '2025-01-17T09:00:00Z',
    interviewDate: '2025-02-01T10:00:00Z',
  },
  {
    id: 'app-003',
    jobId: 'job-001',
    candidateName: 'Tom Applicant',
    candidateEmail: 'tom.applicant@email.com',
    candidatePhone: '+1-555-0103',
    status: 'rejected',
    appliedAt: '2025-01-18T14:00:00Z',
    rejectedAt: '2025-01-19T11:00:00Z',
    rejectionReason: 'Experience level doesn\'t match requirements',
  },
];
```

### Interview Schedules

```typescript
export const interviews = [
  {
    id: 'interview-001',
    applicationId: 'app-002',
    candidateName: 'Sarah Developer',
    date: '2025-02-01',
    time: '10:00 AM',
    duration: '60 minutes',
    interviewType: 'video',
    interviewers: ['mgr-001', 'emp-001'],
    location: 'Zoom',
    agenda: 'Technical assessment and cultural fit',
    status: 'scheduled',
  },
];
```

---

## Performance Management Test Data

### Performance Goals

```typescript
export const goals = [
  {
    id: 'goal-001',
    employeeId: 'emp-001',
    title: 'Improve API response time by 30%',
    description: 'Optimize database queries and implement caching',
    category: 'individual',
    priority: 'high',
    dueDate: '2025-06-30',
    keyResults: [
      'Reduce average response time from 500ms to 350ms',
      'Implement Redis caching for frequently accessed data',
      'Optimize top 10 slowest queries',
    ],
    progress: 40,
    status: 'in-progress',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'goal-002',
    employeeId: 'emp-001',
    title: 'Mentor junior developer',
    description: 'Provide guidance and code reviews to new team member',
    category: 'team',
    priority: 'medium',
    dueDate: '2025-12-31',
    keyResults: [
      'Conduct weekly 1-on-1s',
      'Review all PRs from junior developer',
      'Pair programming sessions twice per month',
    ],
    progress: 25,
    status: 'in-progress',
    createdAt: '2025-01-15T09:00:00Z',
  },
];
```

### Performance Reviews

```typescript
export const performanceReviews = [
  {
    id: 'review-001',
    employeeId: 'emp-001',
    managerId: 'mgr-001',
    reviewPeriod: 'Q4 2024',
    overallRating: 4,
    strengths: 'Strong technical skills, proactive problem-solver, good collaboration',
    areasForImprovement: 'Could improve code documentation, time management on large projects',
    achievements: 'Successfully optimized API reducing response time by 35%, mentored junior developer',
    futureGoals: 'Lead next major feature development, improve system design skills',
    comments: 'Excellent performance this quarter',
    status: 'completed',
    submittedAt: '2025-01-05T10:00:00Z',
    acknowledgedAt: '2025-01-06T14:00:00Z',
  },
];
```

### 1-on-1 Meetings

```typescript
export const oneOnOneMeetings = [
  {
    id: 'meeting-001',
    employeeId: 'emp-001',
    managerId: 'mgr-001',
    title: 'Weekly 1-on-1 with John',
    date: '2025-02-05',
    time: '14:00',
    duration: '30 minutes',
    meetingType: 'one-on-one',
    agenda: 'Progress update, roadblock discussion, goal review',
    location: 'Conference Room A',
    status: 'scheduled',
    scheduledAt: '2025-01-29T10:00:00Z',
  },
  {
    id: 'meeting-002',
    employeeId: 'emp-001',
    managerId: 'mgr-001',
    title: 'Weekly 1-on-1 with John',
    date: '2025-01-29',
    time: '14:00',
    duration: '30 minutes',
    meetingType: 'one-on-one',
    notes: 'Discussed API optimization progress. Alex is on track with caching implementation.',
    actionItems: '1. Schedule DB optimization training, 2. Pair with senior engineer for query review',
    status: 'completed',
    completedAt: '2025-01-29T14:30:00Z',
  },
];
```

---

## Data Seeding Strategies

### Strategy 1: SQL Seed Scripts

Create SQL scripts to populate test database:

```sql
-- users.seed.sql
INSERT INTO users (id, email, name, role, department, manager_id) VALUES
('emp-001', 'john.doe@test.com', 'John Doe', 'employee', 'Engineering', 'mgr-001'),
('emp-002', 'alice.smith@test.com', 'Alice Smith', 'employee', 'Product', 'mgr-002'),
-- ... more users
```

**Pros:**
- Fast execution
- Database-agnostic (with minor tweaks)
- Easy to version control

**Cons:**
- Bypasses application logic
- May miss validation rules
- Hard to maintain relationships

---

### Strategy 2: API-Based Seeding

Use API endpoints to seed data:

```typescript
// seed-via-api.ts
async function seedUsers() {
  for (const user of testUsers) {
    await fetch('https://test.auraos.com/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }
}
```

**Pros:**
- Uses application logic
- Validates data
- Tests API endpoints

**Cons:**
- Slower execution
- Requires API to be working
- May trigger side effects (emails, etc.)

---

### Strategy 3: Playwright Fixtures (Recommended)

Use Playwright's fixture system:

```typescript
// fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  testEmployee: async ({ page }, use) => {
    // Create test employee via API
    const employee = await createTestEmployee({
      name: 'John Doe',
      email: 'john.doe@test.com',
    });

    await use(employee);

    // Cleanup after test
    await deleteTestEmployee(employee.id);
  },

  testLeaveRequest: async ({ testEmployee }, use) => {
    const leaveRequest = await createLeaveRequest({
      employeeId: testEmployee.id,
      leaveType: 'annual',
      startDate: '2025-03-15',
      endDate: '2025-03-19',
    });

    await use(leaveRequest);

    // Cleanup
    await deleteLeaveRequest(leaveRequest.id);
  },
});
```

**Pros:**
- Automatic cleanup
- Test isolation
- Reusable across tests
- TypeScript support

**Cons:**
- Requires Playwright knowledge
- Initial setup complexity

---

## Data Management Best Practices

### 1. Unique Identifiers

Use predictable but unique IDs:

```typescript
const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### 2. Data Reset

Reset test data between test runs:

```bash
# Reset script
pnpm test:e2e:reset-db
```

### 3. Data Versioning

Version test data with your codebase:

```
tests/e2e/test-data/
├── v1/
│   ├── users.json
│   ├── leave-requests.json
│   └── job-postings.json
└── v2/
    ├── users.json
    └── ...
```

### 4. Environment Variables

Configure test data via environment:

```bash
TEST_ENV=staging
TEST_DATA_VERSION=v2
TEST_DATA_CLEANUP=true
```

---

## File Structure

```
tests/e2e/test-data/
├── README.md                    (This file)
├── factories/
│   ├── employee.factory.ts      (Employee data generator)
│   ├── leave.factory.ts         (Leave request generator)
│   ├── recruitment.factory.ts   (Job posting & application generator)
│   └── performance.factory.ts   (Goals & reviews generator)
├── fixtures/
│   ├── users.fixture.ts         (Playwright fixtures for users)
│   ├── leave.fixture.ts         (Playwright fixtures for leave)
│   ├── recruitment.fixture.ts   (Playwright fixtures for recruitment)
│   └── performance.fixture.ts   (Playwright fixtures for performance)
├── seeds/
│   ├── users.seed.sql           (SQL seed script for users)
│   ├── leave.seed.sql           (SQL seed for leave data)
│   └── seed-all.ts              (Master seed script)
└── mock-data/
    ├── resumes/                 (Sample PDF resumes)
    ├── documents/               (Sample documents)
    └── images/                  (Sample profile images)
```

---

## Next Steps

1. **Week 5:** Implement test data factories
2. **Week 5:** Create Playwright fixtures
3. **Week 6:** Develop seed scripts
4. **Week 6:** Test data cleanup automation
5. **Week 7:** Data versioning system
6. **Week 8:** Performance optimization for data seeding

---

**End of Test Data Documentation**

*This structure will be implemented during Weeks 5-8 E2E Testing phase.*
