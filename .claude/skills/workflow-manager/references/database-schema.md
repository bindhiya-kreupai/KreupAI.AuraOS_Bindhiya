# Database Schema Reference (PostgreSQL)

## Core Tables

### workflow_definitions

Stores versioned workflow process definitions.

```sql
CREATE TABLE workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  definition JSONB NOT NULL,
  effective_from TIMESTAMPTZ,
  effective_to TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_process_type_version UNIQUE (process_type, version),
  CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'))
);

CREATE INDEX idx_wf_def_process_type ON workflow_definitions(process_type);
CREATE INDEX idx_wf_def_status ON workflow_definitions(status);
CREATE INDEX idx_wf_def_effective ON workflow_definitions(effective_from, effective_to);
```

### workflow_instances

Runtime workflow instances.

```sql
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
  process_type VARCHAR(100) NOT NULL,
  definition_version INTEGER NOT NULL,
  reference_number VARCHAR(100) UNIQUE,
  document_ref VARCHAR(255),
  document_type VARCHAR(100),

  status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
  current_step_id VARCHAR(100),

  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  snapshot_data JSONB NOT NULL DEFAULT '{}',
  variables JSONB NOT NULL DEFAULT '{}',

  overall_sla_due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  outcome VARCHAR(20),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT chk_instance_status CHECK (status IN (
    'INITIATED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'ON_HOLD',
    'SENT_BACK', 'APPROVED', 'REJECTED', 'CANCELLED', 'FAILED', 'EXCEPTION'
  )),
  CONSTRAINT chk_outcome CHECK (outcome IN ('APPROVED', 'REJECTED', 'CANCELLED', 'FAILED'))
);

CREATE INDEX idx_wf_inst_status ON workflow_instances(status);
CREATE INDEX idx_wf_inst_submitted_by ON workflow_instances(submitted_by);
CREATE INDEX idx_wf_inst_process_type ON workflow_instances(process_type);
CREATE INDEX idx_wf_inst_document ON workflow_instances(document_type, document_ref);
CREATE INDEX idx_wf_inst_current_step ON workflow_instances(current_step_id) WHERE status = 'PENDING_APPROVAL';
```

### workflow_steps

Step execution records.

```sql
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id VARCHAR(100) NOT NULL,
  step_type VARCHAR(50) NOT NULL,
  step_name VARCHAR(255) NOT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  sequence_number INTEGER NOT NULL,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  sla_due_at TIMESTAMPTZ,
  sla_paused_at TIMESTAMPTZ,
  sla_paused_duration_seconds INTEGER DEFAULT 0,

  outcome VARCHAR(20),
  outcome_reason_code VARCHAR(50),
  outcome_comment TEXT,
  outcome_by UUID REFERENCES users(id),

  retry_count INTEGER DEFAULT 0,
  error_details JSONB,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_step_status CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED', 'CANCELLED', 'ON_HOLD'
  )),
  CONSTRAINT chk_step_outcome CHECK (outcome IN ('APPROVED', 'REJECTED', 'SENT_BACK', 'ESCALATED', 'AUTO_CLOSED'))
);

CREATE INDEX idx_wf_step_instance ON workflow_steps(instance_id);
CREATE INDEX idx_wf_step_status ON workflow_steps(status);
CREATE INDEX idx_wf_step_sla ON workflow_steps(sla_due_at) WHERE status IN ('PENDING', 'IN_PROGRESS');
```

### workflow_tasks

Human task assignments (parallel tasks create multiple records per step).

```sql
CREATE TABLE workflow_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,

  assigned_to UUID REFERENCES users(id),
  assigned_role VARCHAR(100),
  assignment_mode VARCHAR(30) NOT NULL,

  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,

  action_taken VARCHAR(30),
  action_reason_code VARCHAR(50),
  action_comment TEXT,
  action_at TIMESTAMPTZ,
  action_by UUID REFERENCES users(id),

  delegated_from UUID REFERENCES users(id),
  delegation_reason TEXT,
  delegation_expires_at TIMESTAMPTZ,

  sla_due_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  escalation_level INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT chk_task_status CHECK (status IN (
    'PENDING', 'CLAIMED', 'COMPLETED', 'DELEGATED', 'REASSIGNED', 'CANCELLED', 'NOT_REQUIRED'
  ))
);

CREATE INDEX idx_wf_task_assigned ON workflow_tasks(assigned_to) WHERE status = 'PENDING';
CREATE INDEX idx_wf_task_role ON workflow_tasks(assigned_role) WHERE status = 'PENDING';
CREATE INDEX idx_wf_task_instance ON workflow_tasks(instance_id);
CREATE INDEX idx_wf_task_step ON workflow_tasks(step_id);
CREATE INDEX idx_wf_task_sla ON workflow_tasks(sla_due_at) WHERE status IN ('PENDING', 'CLAIMED');
```

### workflow_audit_logs

Immutable audit trail.

```sql
CREATE TABLE workflow_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  step_id UUID REFERENCES workflow_steps(id),
  task_id UUID REFERENCES workflow_tasks(id),

  event_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,

  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(20) NOT NULL DEFAULT 'USER',
  actor_ip VARCHAR(45),
  actor_user_agent TEXT,

  previous_state JSONB,
  new_state JSONB,

  reason_code VARCHAR(50),
  comment TEXT,
  attachments JSONB DEFAULT '[]',

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_actor_type CHECK (actor_type IN ('USER', 'SYSTEM', 'SCHEDULER', 'EMAIL', 'API'))
);

CREATE INDEX idx_wf_audit_instance ON workflow_audit_logs(instance_id);
CREATE INDEX idx_wf_audit_actor ON workflow_audit_logs(actor_id);
CREATE INDEX idx_wf_audit_event ON workflow_audit_logs(event_type);
CREATE INDEX idx_wf_audit_created ON workflow_audit_logs(created_at);

-- Prevent updates/deletes
CREATE RULE audit_no_update AS ON UPDATE TO workflow_audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_no_delete AS ON DELETE TO workflow_audit_logs DO INSTEAD NOTHING;
```

### workflow_delegations

Active delegations.

```sql
CREATE TABLE workflow_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),

  delegation_type VARCHAR(30) NOT NULL,
  process_types VARCHAR(100)[] DEFAULT '{}',

  reason TEXT,

  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_delegation_type CHECK (delegation_type IN ('OUT_OF_OFFICE', 'MANUAL', 'TASK_SPECIFIC'))
);

CREATE INDEX idx_wf_delegation_from ON workflow_delegations(from_user_id, is_active);
CREATE INDEX idx_wf_delegation_effective ON workflow_delegations(effective_from, effective_to) WHERE is_active = true;
```

### workflow_comments

Comments and attachments.

```sql
CREATE TABLE workflow_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id),
  parent_id UUID REFERENCES workflow_comments(id),

  comment_type VARCHAR(20) NOT NULL DEFAULT 'COMMENT',
  visibility VARCHAR(20) NOT NULL DEFAULT 'ALL',

  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_comment_type CHECK (comment_type IN ('COMMENT', 'SYSTEM', 'ATTACHMENT')),
  CONSTRAINT chk_visibility CHECK (visibility IN ('ALL', 'APPROVERS_ONLY', 'INTERNAL'))
);

CREATE INDEX idx_wf_comment_instance ON workflow_comments(instance_id);
CREATE INDEX idx_wf_comment_mentions ON workflow_comments USING GIN(mentions);
```

### workflow_attachments

File attachments.

```sql
CREATE TABLE workflow_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id),
  comment_id UUID REFERENCES workflow_comments(id),

  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,

  attachment_type VARCHAR(30) DEFAULT 'SUPPORTING',

  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_attachment_type CHECK (attachment_type IN ('SUPPORTING', 'EVIDENCE', 'RECEIPT', 'APPROVAL_DOCUMENT'))
);

CREATE INDEX idx_wf_attachment_instance ON workflow_attachments(instance_id);
```

---

## Supporting Tables

### workflow_reason_codes

Configurable reason codes.

```sql
CREATE TABLE workflow_reason_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_type VARCHAR(100) NOT NULL,
  action_type VARCHAR(30) NOT NULL,
  code VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  CONSTRAINT uq_reason_code UNIQUE (process_type, action_type, code)
);
```

### workflow_sla_schedules

SLA job schedules.

```sql
CREATE TABLE workflow_sla_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES workflow_tasks(id),
  schedule_type VARCHAR(30) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PENDING',

  CONSTRAINT chk_schedule_type CHECK (schedule_type IN ('REMINDER', 'ESCALATION', 'AUTO_RESUME'))
);

CREATE INDEX idx_wf_sla_scheduled ON workflow_sla_schedules(scheduled_at) WHERE status = 'PENDING';
```

---

## Optimistic Locking

Use `version` column for optimistic locking:

```sql
UPDATE workflow_tasks
SET status = 'COMPLETED',
    action_taken = 'APPROVE',
    version = version + 1,
    updated_at = NOW()
WHERE id = $1 AND version = $2;

-- If affected rows = 0, throw concurrent modification error
```

---

## Idempotency Keys

For system steps:

```sql
CREATE TABLE workflow_idempotency_keys (
  idempotency_key VARCHAR(255) PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  step_id VARCHAR(100) NOT NULL,
  action_id VARCHAR(100) NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_idempotency_expires ON workflow_idempotency_keys(expires_at);
```

---

## Prisma Schema Equivalent

```prisma
model WorkflowDefinition {
  id            String    @id @default(uuid())
  processType   String    @map("process_type")
  name          String
  version       Int       @default(1)
  status        String    @default("DRAFT")
  definition    Json
  effectiveFrom DateTime? @map("effective_from")
  effectiveTo   DateTime? @map("effective_to")
  createdBy     String    @map("created_by")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  instances     WorkflowInstance[]

  @@unique([processType, version])
  @@map("workflow_definitions")
}

model WorkflowInstance {
  id                String    @id @default(uuid())
  definitionId      String    @map("definition_id")
  processType       String    @map("process_type")
  definitionVersion Int       @map("definition_version")
  referenceNumber   String?   @unique @map("reference_number")
  documentRef       String?   @map("document_ref")
  documentType      String?   @map("document_type")
  status            String    @default("INITIATED")
  currentStepId     String?   @map("current_step_id")
  submittedBy       String    @map("submitted_by")
  submittedAt       DateTime  @default(now()) @map("submitted_at")
  snapshotData      Json      @default("{}") @map("snapshot_data")
  variables         Json      @default("{}")
  overallSlaDueAt   DateTime? @map("overall_sla_due_at")
  completedAt       DateTime? @map("completed_at")
  outcome           String?
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  version           Int       @default(1)

  definition        WorkflowDefinition @relation(fields: [definitionId], references: [id])
  steps             WorkflowStep[]
  tasks             WorkflowTask[]
  auditLogs         WorkflowAuditLog[]
  comments          WorkflowComment[]
  attachments       WorkflowAttachment[]

  @@map("workflow_instances")
}

model WorkflowTask {
  id                 String    @id @default(uuid())
  stepId             String    @map("step_id")
  instanceId         String    @map("instance_id")
  assignedTo         String?   @map("assigned_to")
  assignedRole       String?   @map("assigned_role")
  assignmentMode     String    @map("assignment_mode")
  status             String    @default("PENDING")
  claimedBy          String?   @map("claimed_by")
  claimedAt          DateTime? @map("claimed_at")
  actionTaken        String?   @map("action_taken")
  actionReasonCode   String?   @map("action_reason_code")
  actionComment      String?   @map("action_comment")
  actionAt           DateTime? @map("action_at")
  actionBy           String?   @map("action_by")
  delegatedFrom      String?   @map("delegated_from")
  delegationReason   String?   @map("delegation_reason")
  delegationExpiresAt DateTime? @map("delegation_expires_at")
  slaDueAt           DateTime? @map("sla_due_at")
  reminderSentAt     DateTime? @map("reminder_sent_at")
  escalationLevel    Int       @default(0) @map("escalation_level")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  version            Int       @default(1)

  step               WorkflowStep     @relation(fields: [stepId], references: [id], onDelete: Cascade)
  instance           WorkflowInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)

  @@map("workflow_tasks")
}
```
