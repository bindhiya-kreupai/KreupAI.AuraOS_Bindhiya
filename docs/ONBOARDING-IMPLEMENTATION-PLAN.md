# Onboarding Module - Implementation Plan

**Created:** December 26, 2024
**Status:** Planning Phase

---

## Current State Analysis

### ✅ What Exists

1. **Service Layer** - Fully implemented with 14 comprehensive service classes
   - OnboardingProgramService
   - OnboardingInstanceService
   - OnboardingTaskService
   - OnboardingDocumentService
   - OnboardingEquipmentService
   - OnboardingAccessService
   - OnboardingTrainingService
   - BuddyAssignmentService
   - Day30_60_90PlanService
   - OnboardingSurveyService
   - FeedbackService
   - PreBoardingService
   - OnboardingAnalyticsService
   - OnboardingSettingsService

2. **Type Definitions** - 650+ lines of comprehensive TypeScript interfaces

3. **API Routes** - 14 route files created but using mock data
   - `/api/onboarding/programs`
   - `/api/onboarding/instances`
   - `/api/onboarding/tasks`
   - `/api/onboarding/documents`
   - `/api/onboarding/equipment`
   - `/api/onboarding/access`
   - `/api/onboarding/training`
   - `/api/onboarding/buddies`
   - `/api/onboarding/day-plans`
   - `/api/onboarding/surveys`
   - `/api/onboarding/feedback`
   - `/api/onboarding/pre-boarding`
   - `/api/onboarding/analytics`
   - `/api/onboarding/settings`

4. **UI Pages** - 5 feature pages created
   - Pre-boarding
   - First Day Experience
   - Induction Program
   - Buddy Assignment
   - 30-60-90 Day Plan

### ❌ What's Missing

1. **Prisma Database Models** - No onboarding models in schema yet
2. **Real Database Integration** - APIs return empty mock data
3. **Seed Data** - No test data for development
4. **UI-to-API Connection** - Unknown if pages are fetching data

---

## Recommended Approach: MVP First

Given the complexity (14 services, extensive type definitions), we should implement in **2 Waves**:

### **Wave 1: Core Onboarding Features (MVP)**

Focus on the 4 essential features from the GPS document:

#### 1. **Onboarding Programs** (Template Management)
- **Database Model:**
  - OnboardingProgram (id, name, description, department, durationDays, isTemplate, createdAt)
  - Simple program/template management

- **API Endpoints:**
  - `GET /api/onboarding/programs` - List programs
  - `POST /api/onboarding/programs` - Create program
  - `PUT /api/onboarding/programs/:id` - Update program

- **UI Features:**
  - View program templates
  - Create new programs
  - Edit program details

#### 2. **Task Management** (Onboarding Checklists)
- **Database Models:**
  - OnboardingInstance (id, programId, employeeId, status, progress, startDate)
  - OnboardingTask (id, instanceId, taskName, status, dueDate, responsibleParty)

- **API Endpoints:**
  - `GET /api/onboarding/instances` - List onboarding instances
  - `POST /api/onboarding/instances` - Create instance
  - `PUT /api/onboarding/tasks/:id/status` - Update task status

- **UI Features:**
  - Kanban board for task tracking
  - Task completion/status updates
  - Progress tracking

#### 3. **Equipment Allocation**
- **Database Model:**
  - OnboardingEquipment (id, instanceId, equipmentName, status, requestedDate, assignedDate)

- **API Endpoints:**
  - `GET /api/onboarding/equipment` - List equipment requests
  - `POST /api/onboarding/equipment/request` - Request equipment
  - `PUT /api/onboarding/equipment/:id/assign` - Assign equipment

- **UI Features:**
  - Equipment request list
  - Status tracking (requested → approved → assigned)
  - Assignment workflow

#### 4. **New Hire Training** (Induction Programs)
- **Database Model:**
  - OnboardingTraining (id, instanceId, moduleName, type, status, scheduledDate, completedDate)

- **API Endpoints:**
  - `GET /api/onboarding/training` - List training modules
  - `POST /api/onboarding/training/schedule` - Schedule training
  - `PUT /api/onboarding/training/:id/complete` - Mark complete

- **UI Features:**
  - Training schedule view
  - Training completion tracking
  - Calendar integration

---

### **Wave 2: Advanced Features** (Future Enhancement)

Implement after Wave 1 is stable:

- Pre-boarding packages & materials
- Buddy assignment & matching
- 30-60-90 day plans & reviews
- Document collection & verification
- Access provisioning
- Surveys & feedback
- Analytics dashboard
- Settings & notifications

---

## Wave 1 Implementation Steps

### Step 1: Create Simplified Prisma Schema

```prisma
model OnboardingProgram {
  id              String              @id @default(uuid())
  tenantId        String
  programCode     String
  programName     String
  description     String?
  department      String?
  durationDays    Int                 @default(90)
  isTemplate      Boolean             @default(true)
  isActive        Boolean             @default(true)
  createdBy       String
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  instances       OnboardingInstance[]

  @@unique([tenantId, programCode])
  @@index([tenantId, isActive])
}

model OnboardingInstance {
  id                      String              @id @default(uuid())
  tenantId                String
  onboardingCode          String
  programId               String
  program                 OnboardingProgram   @relation(fields: [programId], references: [id])
  employeeId              String
  employeeName            String
  email                   String
  departmentId            String
  departmentName          String
  managerId               String
  managerName             String
  hireDate                DateTime
  startDate               DateTime
  status                  String              @default("not_started") // not_started, in_progress, completed
  progress                Int                 @default(0)
  currentPhase            String?
  completedTasks          Int                 @default(0)
  totalTasks              Int                 @default(0)
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  tasks                   OnboardingTask[]
  equipment               OnboardingEquipment[]
  training                OnboardingTraining[]

  @@unique([tenantId, onboardingCode])
  @@index([tenantId, status])
  @@index([tenantId, employeeId])
}

model OnboardingTask {
  id                  String              @id @default(uuid())
  tenantId            String
  instanceId          String
  instance            OnboardingInstance  @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  taskName            String
  description         String?
  category            String              // documentation, equipment, access, training, etc.
  phase               String              // pre_boarding, first_day, first_week, etc.
  responsibleParty    String              // hr, it, manager, new_hire
  priority            String              @default("medium") // critical, high, medium, low
  status              String              @default("pending") // pending, in_progress, completed, overdue
  dueDate             DateTime
  completedDate       DateTime?
  completedBy         String?
  isMandatory         Boolean             @default(false)
  displayOrder        Int
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([tenantId, instanceId, status])
  @@index([tenantId, responsibleParty, status])
}

model OnboardingEquipment {
  id                  String              @id @default(uuid())
  tenantId            String
  instanceId          String
  instance            OnboardingInstance  @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  equipmentName       String
  equipmentType       String
  description         String?
  quantity            Int                 @default(1)
  status              String              @default("requested") // requested, approved, ordered, assigned
  requestedDate       DateTime
  requestedBy         String
  approvedDate        DateTime?
  approvedBy          String?
  assignedDate        DateTime?
  assetTag            String?
  notes               String?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([tenantId, instanceId, status])
}

model OnboardingTraining {
  id                  String              @id @default(uuid())
  tenantId            String
  instanceId          String
  instance            OnboardingInstance  @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  moduleName          String
  description         String?
  type                String              // orientation, compliance, technical, safety
  phase               String              // first_day, first_week, first_month
  deliveryMode        String              // in_person, virtual, e_learning
  status              String              @default("pending") // pending, scheduled, completed
  durationHours       Float
  scheduledDate       DateTime?
  completedDate       DateTime?
  instructor          String?
  location            String?
  meetingLink         String?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  @@index([tenantId, instanceId, status])
}
```

### Step 2: Generate Prisma Client & Run Migration

```bash
npx prisma generate
npx prisma db push
```

### Step 3: Update API Routes with Real Database Queries

Convert mock data to Prisma queries in:
- `/api/onboarding/programs/route.ts`
- `/api/onboarding/instances/route.ts`
- `/api/onboarding/tasks/route.ts`
- `/api/onboarding/equipment/route.ts`
- `/api/onboarding/training/route.ts`

### Step 4: Create Seed Data

Create `seed-onboarding-mvp.ts` with:
- 2 onboarding programs (Engineering, Sales)
- 3 onboarding instances (active employees)
- 15 tasks per instance
- 5 equipment requests
- 6 training modules

### Step 5: Verify UI Connectivity

Check and fix UI pages to ensure they fetch and display real data:
- Pre-boarding page
- Task management page
- Equipment allocation page
- Training/induction page

---

## Success Metrics for Wave 1

- ✅ 5 database models created and migrated
- ✅ 5 API endpoints returning real database data
- ✅ Seed data populating test instances
- ✅ 4 UI pages displaying live data
- ✅ CRUD operations working for programs, instances, tasks
- ✅ Task status updates reflected in database
- ✅ Equipment workflow functional
- ✅ Training scheduling working

---

## Timeline Estimate

**Wave 1 (MVP):**
- Database Schema: 1 hour
- API Integration: 2 hours
- Seed Data: 1 hour
- UI Verification: 1 hour
- Testing: 1 hour
- **Total: 6 hours**

**Wave 2 (Advanced Features):**
- Additional models: 2 hours
- Complex APIs: 3 hours
- Advanced UI: 2 hours
- **Total: 7 hours**

---

## Decision Required

**Shall we proceed with Wave 1 MVP implementation?**

This will give you:
1. Functional onboarding program management
2. Task tracking with Kanban board
3. Equipment allocation workflow
4. Training/induction scheduling

With database backend, real APIs, and seed data for testing.

**Alternative:** Implement the full comprehensive system (all 14 services) - estimated 15-20 hours of work.

---

**Next Steps:** Awaiting your decision to proceed with Wave 1 MVP or full implementation.
