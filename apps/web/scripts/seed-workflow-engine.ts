/**
 * AuraOS Workflow Engine — Database Seed Script
 *
 * Creates comprehensive test data directly via Prisma.
 * Run with: npx tsx apps/web/scripts/seed-workflow-engine.ts
 *
 * Creates:
 *   - 7 workflow definitions (leave, expense, purchase, onboarding, doc review, 2 forms)
 *   - 12 workflow instances at various stages
 *   - Workflow steps and tasks
 *   - Audit log entries
 *   - 4 integrations (Slack, SAP, Email, DocuSign)
 *   - Engine settings
 *   - 3 approval chains
 *   - Reason codes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANT = 'ae63d8ef-d01d-49a7-a542-b1256702765d';
const USER = 'seed-user-001';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursFromNow(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d;
}

async function main() {
  console.log('🚀 Seeding Workflow Engine test data...\n');

  // ── 1. WORKFLOW DEFINITIONS ──────────────────────────────────────────

  console.log('📋 Creating workflow definitions...');

  const leaveDef = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'LEAVE_REQUEST',
      name: 'Leave Request Approval',
      description: 'Standard leave request workflow with manager and HR approval',
      trigger: 'MANUAL',
      triggerEvent: JSON.stringify({ notifyEmails: ['hr@company.com'] }),
      nodes: [
        { id: 'start', type: 'trigger', name: 'Employee Submits Request', x: 100, y: 200 },
        { id: 'mgr', type: 'approval', name: 'Manager Approval', x: 300, y: 200, assigneeRole: 'MANAGER' },
        { id: 'hr', type: 'approval', name: 'HR Review', x: 500, y: 200, assigneeRole: 'HR_ADMIN' },
        { id: 'notify', type: 'notification', name: 'Notify Employee', x: 700, y: 200 },
        { id: 'end', type: 'end', name: 'Complete', x: 900, y: 200 },
      ],
      edges: [
        { source: 'start', target: 'mgr' },
        { source: 'mgr', target: 'hr', label: 'Approved' },
        { source: 'hr', target: 'notify', label: 'Approved' },
        { source: 'notify', target: 'end' },
      ],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Leave Request Approval (${leaveDef.id})`);

  const expenseDef = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'EXPENSE_CLAIM',
      name: 'Expense Claim Processing',
      description: 'Multi-level expense approval with auto-routing by amount',
      trigger: 'MANUAL',
      triggerEvent: JSON.stringify({ maxAutoApprove: 500 }),
      nodes: [
        { id: 'start', type: 'trigger', name: 'Submit Expense', x: 100, y: 200 },
        { id: 'cond', type: 'condition', name: 'Amount Check', x: 300, y: 200, config: { expression: 'amount > 500' } },
        { id: 'mgr', type: 'approval', name: 'Manager Approval', x: 500, y: 100 },
        { id: 'fin', type: 'approval', name: 'Finance Director', x: 500, y: 300 },
        { id: 'pay', type: 'action', name: 'Process Payment', x: 700, y: 200 },
        { id: 'end', type: 'end', name: 'Complete', x: 900, y: 200 },
      ],
      edges: [
        { source: 'start', target: 'cond' },
        { source: 'cond', target: 'mgr', label: 'amount <= 500' },
        { source: 'cond', target: 'fin', label: 'amount > 500' },
        { source: 'mgr', target: 'pay', label: 'Approved' },
        { source: 'fin', target: 'pay', label: 'Approved' },
        { source: 'pay', target: 'end' },
      ],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Expense Claim Processing (${expenseDef.id})`);

  const poDef = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'PURCHASE_ORDER',
      name: 'Purchase Order Authorization',
      description: 'PO workflow with budget check and procurement approval',
      trigger: 'MANUAL',
      nodes: [
        { id: 'start', type: 'trigger', name: 'PO Submitted', x: 100, y: 200 },
        { id: 'budget', type: 'action', name: 'Budget Validation', x: 300, y: 200 },
        { id: 'proc', type: 'approval', name: 'Procurement Manager', x: 500, y: 200 },
        { id: 'finance', type: 'approval', name: 'CFO Approval', x: 700, y: 200 },
        { id: 'end', type: 'end', name: 'PO Approved', x: 900, y: 200 },
      ],
      edges: [
        { source: 'start', target: 'budget' },
        { source: 'budget', target: 'proc' },
        { source: 'proc', target: 'finance', label: 'Approved' },
        { source: 'finance', target: 'end', label: 'Approved' },
      ],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Purchase Order Authorization (${poDef.id})`);

  const onboardingDef = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'ONBOARDING',
      name: 'New Employee Onboarding',
      description: 'End-to-end onboarding with IT setup, buddy assignment, and compliance training',
      trigger: 'EVENT',
      triggerEvent: JSON.stringify({ event: 'employee.hired' }),
      nodes: [
        { id: 'start', type: 'trigger', name: 'Hire Confirmed', x: 100, y: 200 },
        { id: 'it', type: 'action', name: 'IT Equipment Setup', x: 300, y: 100 },
        { id: 'buddy', type: 'action', name: 'Assign Buddy', x: 300, y: 300 },
        { id: 'training', type: 'action', name: 'Compliance Training', x: 500, y: 200 },
        { id: 'check', type: 'approval', name: 'Manager Check-in', x: 700, y: 200 },
        { id: 'end', type: 'end', name: 'Onboarding Complete', x: 900, y: 200 },
      ],
      edges: [
        { source: 'start', target: 'it' },
        { source: 'start', target: 'buddy' },
        { source: 'it', target: 'training' },
        { source: 'buddy', target: 'training' },
        { source: 'training', target: 'check' },
        { source: 'check', target: 'end', label: 'Approved' },
      ],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ New Employee Onboarding (${onboardingDef.id})`);

  const docReviewDef = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'GENERIC',
      name: 'Document Review & Publish',
      description: 'Generic document review with reviewer assignment',
      trigger: 'MANUAL',
      nodes: [
        { id: 'start', type: 'trigger', name: 'Document Submitted', x: 100, y: 200 },
        { id: 'review', type: 'approval', name: 'Peer Review', x: 400, y: 200 },
        { id: 'publish', type: 'action', name: 'Publish Document', x: 700, y: 200 },
        { id: 'end', type: 'end', name: 'Published', x: 900, y: 200 },
      ],
      edges: [
        { source: 'start', target: 'review' },
        { source: 'review', target: 'publish', label: 'Approved' },
        { source: 'publish', target: 'end' },
      ],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Document Review & Publish (${docReviewDef.id})`);

  // Form: Employee Feedback
  const feedbackForm = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'FORM',
      name: 'Employee Feedback Form',
      description: 'Quarterly employee feedback collection form',
      trigger: 'MANUAL',
      nodes: [
        { type: '_section', id: 'sec-general', title: 'General Information', description: 'Basic details about the feedback', order: 0 },
        { id: 'f1', type: 'text', name: 'Employee Name', label: 'Employee Name', required: true, sectionId: 'sec-general' },
        { id: 'f2', type: 'date', name: 'Review Period', label: 'Review Period End Date', required: true, sectionId: 'sec-general' },
        { type: '_section', id: 'sec-perf', title: 'Performance Ratings', description: 'Rate across key areas', order: 1 },
        { id: 'f3', type: 'select', name: 'Technical Skills', label: 'Technical Skills', required: true, options: [
          { value: 'exceeds', label: 'Exceeds Expectations' },
          { value: 'meets', label: 'Meets Expectations' },
          { value: 'below', label: 'Below Expectations' },
        ], sectionId: 'sec-perf' },
        { id: 'f4', type: 'select', name: 'Communication', label: 'Communication Skills', required: true, options: [
          { value: 'exceeds', label: 'Exceeds Expectations' },
          { value: 'meets', label: 'Meets Expectations' },
          { value: 'below', label: 'Below Expectations' },
        ], sectionId: 'sec-perf' },
        { id: 'f5', type: 'textarea', name: 'Comments', label: 'Additional Comments', sectionId: 'sec-perf', placeholder: 'Share any additional feedback...' },
      ],
      edges: [{ source: 'f1', target: 'f2' }, { source: 'f3', target: 'f4' }],
      triggerEvent: JSON.stringify({ submissionAction: 'workflow', allowedRoles: ['EMPLOYEE', 'MANAGER'] }),
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Employee Feedback Form (${feedbackForm.id})`);

  // Form: IT Support Request
  const itForm = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'FORM',
      name: 'IT Support Request',
      description: 'IT helpdesk ticket form for hardware/software issues',
      trigger: 'MANUAL',
      nodes: [
        { type: '_section', id: 'sec-issue', title: 'Issue Details', description: 'Describe the problem', order: 0 },
        { id: 'f1', type: 'select', name: 'Category', label: 'Issue Category', required: true, options: [
          { value: 'hardware', label: 'Hardware' },
          { value: 'software', label: 'Software' },
          { value: 'network', label: 'Network' },
          { value: 'access', label: 'Access/Permissions' },
        ], sectionId: 'sec-issue' },
        { id: 'f2', type: 'select', name: 'Priority', label: 'Priority', required: true, options: [
          { value: 'critical', label: 'Critical' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ], sectionId: 'sec-issue' },
        { id: 'f3', type: 'textarea', name: 'Description', label: 'Description', required: true, sectionId: 'sec-issue' },
        { type: '_section', id: 'sec-contact', title: 'Contact Info', order: 1 },
        { id: 'f4', type: 'text', name: 'Extension', label: 'Phone Extension', sectionId: 'sec-contact' },
        { id: 'f5', type: 'file', name: 'Attachment', label: 'Screenshot', sectionId: 'sec-contact' },
      ],
      edges: [],
      triggerEvent: JSON.stringify({ submissionAction: 'save', allowedRoles: ['EMPLOYEE'] }),
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ IT Support Request (${itForm.id})`);

  // ── 2. APPROVAL CHAINS ──────────────────────────────────────────────

  console.log('\n🔗 Creating approval chains...');

  const leaveChain = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'APPROVAL_CHAIN',
      name: 'Standard Leave Approval',
      description: 'Manager → HR → VP for leaves > 5 days',
      trigger: 'MANUAL',
      nodes: [
        { levelNumber: 1, levelName: 'Direct Manager', approvers: [{ type: 'MANAGER' }], requiredApprovals: 1 },
        { levelNumber: 2, levelName: 'HR Admin', approvers: [{ type: 'ROLE', userId: 'hr-admin' }], requiredApprovals: 1 },
        { levelNumber: 3, levelName: 'VP (5+ days)', approvers: [{ type: 'ROLE', userId: 'vp-hr' }], requiredApprovals: 1 },
      ],
      edges: [],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Standard Leave Approval (${leaveChain.id})`);

  const expenseChain = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'APPROVAL_CHAIN',
      name: 'Finance Expense Approval',
      description: 'Manager → Finance Director → CFO for expenses > $5000',
      trigger: 'MANUAL',
      nodes: [
        { levelNumber: 1, levelName: 'Manager', approvers: [{ type: 'MANAGER' }], requiredApprovals: 1 },
        { levelNumber: 2, levelName: 'Finance Director', approvers: [{ type: 'ROLE', userId: 'finance-dir' }], requiredApprovals: 1 },
      ],
      edges: [],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ Finance Expense Approval (${expenseChain.id})`);

  const itChain = await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'APPROVAL_CHAIN',
      name: 'IT Change Request',
      description: 'Tech Lead → Security → CAB for production changes',
      trigger: 'MANUAL',
      nodes: [
        { levelNumber: 1, levelName: 'Tech Lead', approvers: [{ type: 'ROLE', userId: 'tech-lead' }], requiredApprovals: 1 },
        { levelNumber: 2, levelName: 'Security Review', approvers: [{ type: 'ROLE', userId: 'security' }], requiredApprovals: 1 },
        { levelNumber: 3, levelName: 'Change Advisory Board', approvers: [{ type: 'ROLE', userId: 'cab-chair' }], requiredApprovals: 2 },
      ],
      edges: [],
      status: 'ACTIVE',
      isActive: true,
      createdBy: USER,
    },
  });
  console.log(`  ✓ IT Change Request (${itChain.id})`);

  // ── 3. WORKFLOW INSTANCES ───────────────────────────────────────────

  console.log('\n🔄 Creating workflow instances...');

  const defs = [leaveDef, expenseDef, poDef, onboardingDef, docReviewDef];
  const statuses = ['RUNNING', 'RUNNING', 'RUNNING', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'FAILED', 'INITIATED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'RUNNING', 'RUNNING'];
  const submitters = ['John Smith', 'Sarah Chen', 'Mike Johnson', 'Priya Patel', 'Alex Rivera', 'Emma Wilson', 'David Kim', 'Lisa Wang', 'Tom Brown', 'Nina Garcia', 'James Lee', 'Ana Silva'];
  const departments = ['Engineering', 'HR', 'Finance', 'Operations', 'Marketing', 'Legal', 'Sales', 'IT', 'R&D', 'Support', 'Product', 'Design'];

  const instances: Array<{ id: string; defId: string; status: string }> = [];

  for (let i = 0; i < 12; i++) {
    const def = defs[i % defs.length];
    const status = statuses[i];
    const daysBack = Math.floor(Math.random() * 30) + 1;

    const inst = await prisma.workflowInstance.create({
      data: {
        definitionId: def.id,
        tenantId: TENANT,
        processType: def.processType,
        definitionVersion: 1,
        referenceNumber: `WF-${String(i + 1).padStart(4, '0')}`,
        status,
        currentNode: i < 5 ? 'mgr' : i < 8 ? 'hr' : 'start',
        submittedBy: submitters[i],
        submittedAt: daysAgo(daysBack),
        snapshotData: {
          submittedBy: submitters[i],
          department: departments[i],
          priority: ['Low', 'Medium', 'High', 'Critical'][i % 4],
          amount: (i + 1) * 250,
          currency: 'USD',
          startDate: daysAgo(daysBack + 1).toISOString(),
          endDate: daysAgo(daysBack - 5).toISOString(),
        },
        variables: { amount: (i + 1) * 250, currency: 'USD' },
        startedAt: daysAgo(daysBack),
        completedAt: status === 'COMPLETED' || status === 'FAILED' ? daysAgo(daysBack - 2) : null,
        outcome: status === 'COMPLETED' ? 'APPROVED' : status === 'FAILED' ? 'REJECTED' : null,
        triggeredBy: 'SYSTEM',
        createdBy: USER,
      },
    });
    instances.push({ id: inst.id, defId: def.id, status });
    console.log(`  ✓ Instance ${i + 1}: ${def.name} [${status}] (${inst.referenceNumber})`);
  }

  // ── 4. WORKFLOW STEPS ──────────────────────────────────────────────

  console.log('\n📝 Creating workflow steps...');

  const stepTypes = ['APPROVAL', 'NOTIFICATION', 'ACTION', 'CONDITION'];
  let stepCount = 0;
  const allSteps: Array<{ id: string; instanceId: string }> = [];

  for (const inst of instances) {
    const nodeCount = Math.floor(Math.random() * 4) + 2;
    for (let s = 0; s < nodeCount; s++) {
      const stepStatus = inst.status === 'COMPLETED' ? 'COMPLETED'
        : inst.status === 'FAILED' && s === nodeCount - 1 ? 'FAILED'
        : s < nodeCount - 1 ? 'COMPLETED'
        : inst.status === 'RUNNING' ? 'IN_PROGRESS'
        : 'PENDING';

      const step = await prisma.workflowStep.create({
        data: {
          instanceId: inst.id,
          definitionId: inst.defId,
          stepId: `step-${s + 1}`,
          stepType: stepTypes[s % stepTypes.length],
          stepName: ['Manager Approval', 'HR Review', 'Finance Check', 'Notification'][s % 4],
          status: stepStatus,
          sequenceNumber: s,
          startedAt: daysAgo(10 - s * 2),
          completedAt: stepStatus === 'COMPLETED' || stepStatus === 'FAILED' ? daysAgo(10 - s * 2 + 1) : null,
          slaDueAt: hoursFromNow(24 + s * 12),
          outcome: stepStatus === 'COMPLETED' ? 'APPROVED' : stepStatus === 'FAILED' ? 'REJECTED' : null,
          metadata: { assignee: submitters[s % submitters.length] },
        },
      });
      allSteps.push({ id: step.id, instanceId: inst.id });
      stepCount++;
    }
  }
  console.log(`  ✓ ${stepCount} steps created across all instances`);

  // ── 5. TASKS ───────────────────────────────────────────────────────

  console.log('\n📌 Creating tasks...');

  const taskStatuses = ['PENDING', 'PENDING', 'PENDING', 'APPROVED', 'REJECTED', 'DELEGATED', 'ESCALATED'];
  const actions = ['APPROVE', 'REJECT', 'SEND_BACK', 'HOLD', null, null, null];
  let taskCount = 0;

  for (const step of allSteps) {
    const taskStatus = taskStatuses[taskCount % taskStatuses.length];
    const action = actions[taskCount % actions.length];

    await prisma.workflowTask.create({
      data: {
        stepId: step.id,
        instanceId: step.instanceId,
        assignedTo: submitters[taskCount % submitters.length],
        assignedRole: 'MANAGER',
        assignmentMode: 'USER',
        status: taskStatus,
        claimedBy: taskStatus !== 'PENDING' ? submitters[taskCount % submitters.length] : null,
        claimedAt: taskStatus !== 'PENDING' ? daysAgo(5) : null,
        actionTaken: action,
        actionComment: action ? `Reviewed and ${action.toLowerCase()}d` : null,
        actionAt: action ? daysAgo(3) : null,
        actionBy: action ? submitters[taskCount % submitters.length] : null,
        slaDueAt: hoursFromNow(24),
        escalationLevel: taskStatus === 'ESCALATED' ? 1 : 0,
        version: 1,
      },
    });
    taskCount++;
  }
  console.log(`  ✓ ${taskCount} tasks created`);

  // ── 6. AUDIT LOG ENTRIES ───────────────────────────────────────────

  console.log('\n📜 Creating audit log entries...');

  const eventTypes = [
    { eventType: 'WORKFLOW_STARTED', action: 'CREATE' },
    { eventType: 'STEP_COMPLETED', action: 'UPDATE' },
    { eventType: 'TASK_APPROVED', action: 'APPROVE' },
    { eventType: 'TASK_REJECTED', action: 'REJECT' },
    { eventType: 'WORKFLOW_COMPLETED', action: 'COMPLETE' },
    { eventType: 'TASK_DELEGATED', action: 'DELEGATE' },
    { eventType: 'TASK_ESCALATED', action: 'ESCALATE' },
    { eventType: 'WORKFLOW_CANCELLED', action: 'CANCEL' },
  ];

  let auditCount = 0;
  for (const inst of instances) {
    const ev = eventTypes[auditCount % eventTypes.length];
    await prisma.workflowAuditLog.create({
      data: {
        instanceId: inst.id,
        eventType: ev.eventType,
        action: ev.action,
        actorId: submitters[auditCount % submitters.length],
        actorType: 'USER',
        actorIp: '192.168.1.' + (auditCount + 1),
        previousState: { status: 'PENDING' },
        newState: { status: ev.eventType.includes('COMPLETED') ? 'COMPLETED' : 'IN_PROGRESS' },
        comment: `Auto-generated audit entry for ${ev.eventType}`,
        metadata: { source: 'seed-script' },
      },
    });
    auditCount++;
  }
  console.log(`  ✓ ${auditCount} audit log entries`);

  // ── 7. INTEGRATIONS ────────────────────────────────────────────────

  console.log('\n🔌 Creating integrations...');

  const integrations = [
    {
      name: 'Slack Notifications',
      description: 'Send workflow notifications to Slack channels',
      trigger: 'WEBHOOK',
      triggerEvent: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx', channel: '#workflow-alerts' }),
      nodes: ['notify_channel', 'send_dm', 'post_thread'],
      isActive: true,
      status: 'ACTIVE',
    },
    {
      name: 'SAP ERP Sync',
      description: 'Bi-directional sync of purchase orders and employee data with SAP',
      trigger: 'REST_API',
      triggerEvent: JSON.stringify({ baseUrl: 'https://sap-erp.company.com/api/v2', authType: 'OAUTH2', clientId: 'sap-client-001' }),
      nodes: ['sync_po', 'sync_employee', 'check_budget'],
      isActive: true,
      status: 'ACTIVE',
    },
    {
      name: 'Email Service (SMTP)',
      description: 'Send email notifications for approvals and escalations',
      trigger: 'SMTP',
      triggerEvent: JSON.stringify({ host: 'smtp.company.com', port: 587, useTls: true }),
      nodes: ['send_email', 'send_escalation'],
      isActive: true,
      status: 'ACTIVE',
    },
    {
      name: 'DocuSign e-Signatures',
      description: 'Request digital signatures for approved documents',
      trigger: 'REST_API',
      triggerEvent: JSON.stringify({ baseUrl: 'https://demo.docusign.net/restapi/v2.1', authType: 'API_KEY' }),
      nodes: ['request_signature', 'check_status'],
      isActive: false,
      status: 'DRAFT',
    },
  ];

  for (const integ of integrations) {
    await prisma.workflowDefinition.create({
      data: {
        tenantId: TENANT,
        processType: 'INTEGRATION',
        name: integ.name,
        description: integ.description,
        trigger: integ.trigger,
        triggerEvent: integ.triggerEvent,
        nodes: integ.nodes,
        edges: [],
        isActive: integ.isActive,
        status: integ.status,
        createdBy: USER,
      },
    });
    console.log(`  ✓ ${integ.name}`);
  }

  // ── 8. ENGINE SETTINGS ─────────────────────────────────────────────

  console.log('\n⚙️  Saving engine settings...');

  await prisma.workflowDefinition.create({
    data: {
      tenantId: TENANT,
      processType: 'workflow_engine_settings',
      name: 'Workflow Engine Settings',
      trigger: 'SYSTEM',
      triggerEvent: JSON.stringify({
        defaultExecutionTimeout: 72,
        maxConcurrentExecutions: 15,
        enableAutoRetry: true,
        defaultRetryAttempts: 3,
        defaultRetryDelay: 30,
        defaultApprovalTimeout: 48,
        enableAutoEscalation: true,
        defaultEscalationTime: 24,
        allowDelegation: true,
        enableNotifications: true,
        notifyOnApprovalRequest: true,
        notifyOnApprovalDecision: true,
        notifyOnTaskAssignment: true,
        notifyOnWorkflowCompletion: true,
        notifyOnWorkflowFailure: true,
        requireApprovalForPublish: false,
        enableAuditLog: true,
        dataRetentionDays: 365,
        allowExternalIntegrations: true,
        enableVersionControl: true,
        enableDraftMode: true,
        enableTesting: true,
        maxWorkflowNodes: 50,
      }),
      nodes: [],
      edges: [],
      isActive: true,
      status: 'ACTIVE',
      createdBy: USER,
    },
  });
  console.log('  ✓ Settings saved');

  // ── 9. REASON CODES ────────────────────────────────────────────────

  console.log('\n🏷️  Creating reason codes...');

  const reasonCodes = [
    { processType: 'LEAVE_REQUEST', actionType: 'REJECT', code: 'INSUFFICIENT_NOTICE', label: 'Insufficient Notice', sortOrder: 1 },
    { processType: 'LEAVE_REQUEST', actionType: 'REJECT', code: 'BLACKOUT_PERIOD', label: 'Blackout Period', sortOrder: 2 },
    { processType: 'LEAVE_REQUEST', actionType: 'HOLD', code: 'PENDING_DOCUMENTS', label: 'Pending Documents', sortOrder: 1 },
    { processType: 'EXPENSE_CLAIM', actionType: 'REJECT', code: 'MISSING_RECEIPTS', label: 'Missing Receipts', sortOrder: 1 },
    { processType: 'EXPENSE_CLAIM', actionType: 'REJECT', code: 'OVER_BUDGET', label: 'Over Budget', sortOrder: 2 },
    { processType: 'EXPENSE_CLAIM', actionType: 'SEND_BACK', code: 'NEEDS_CORRECTION', label: 'Needs Correction', sortOrder: 1 },
    { processType: 'PURCHASE_ORDER', actionType: 'REJECT', code: 'BUDGET_EXCEEDED', label: 'Budget Exceeded', sortOrder: 1 },
    { processType: 'PURCHASE_ORDER', actionType: 'HOLD', code: 'VENDOR_REVIEW', label: 'Vendor Review Required', sortOrder: 1 },
  ];

  for (const rc of reasonCodes) {
    await prisma.workflowReasonCode.upsert({
      where: { processType_actionType_code: { processType: rc.processType, actionType: rc.actionType, code: rc.code } },
      update: { label: rc.label, sortOrder: rc.sortOrder },
      create: {
        processType: rc.processType,
        actionType: rc.actionType,
        code: rc.code,
        label: rc.label,
        isActive: true,
        sortOrder: rc.sortOrder,
      },
    });
  }
  console.log(`  ✓ ${reasonCodes.length} reason codes`);

  // ── SUMMARY ────────────────────────────────────────────────────────

  const defCount = await prisma.workflowDefinition.count({ where: { tenantId: TENANT } });
  const instCount = await prisma.workflowInstance.count({ where: { tenantId: TENANT } });

  console.log('\n' + '═'.repeat(60));
  console.log('✅ SEED COMPLETE');
  console.log('═'.repeat(60));
  console.log(`  Definitions:    ${defCount}`);
  console.log(`  Instances:      ${instCount}`);
  console.log(`  Steps:          ${stepCount}`);
  console.log(`  Tasks:          ${taskCount}`);
  console.log(`  Audit Entries:  ${auditCount}`);
  console.log(`  Integrations:   ${integrations.length}`);
  console.log(`  Reason Codes:   ${reasonCodes.length}`);
  console.log(`  Approval Chains: 3`);
  console.log('═'.repeat(60));
  console.log('\nPages to test:');
  console.log('  /workflow-engine                     Dashboard');
  console.log('  /workflow-engine/workflow-templates   Template launcher');
  console.log('  /workflow-engine/approval-chains      Multi-level chains');
  console.log('  /workflow-engine/conditional-logic    Condition rules');
  console.log('  /workflow-engine/integration-points   Integrations');
  console.log('  /workflow-engine/workflow-analytics   Analytics');
  console.log('  /workflow-engine/version-control      Version history');
  console.log('  /workflow-engine/escalation-rules     SLA breaches');
  console.log('  /workflow-engine/email-notifications  Settings');
  console.log('  /workflow-engine/testing-mode         Test runner');
  console.log('  /workflow-engine/designer             Visual designer');
  console.log('  /workflow-engine/form-builder         Form builder');
  console.log('  /workflow-engine/ai-path-prediction   Path analysis');
  console.log('  /workflow-engine/sla-tracking         SLA tracking');
  console.log('  /workflow-engine/audit-log            Audit log');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
