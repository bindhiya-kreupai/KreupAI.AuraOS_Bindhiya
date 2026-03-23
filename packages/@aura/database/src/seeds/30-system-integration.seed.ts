/**
 * @module SystemIntegrationSeed
 * @description Seed data for System Integration models — Workflows, Reports,
 *   Dashboards, Predictive Analytics, AI Agent, Analytics Cache, Webhooks,
 *   API Keys, Notifications, and Device Tokens.
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@prisma/client';

/** Pick from array by index (wraps around) */
const pick = <T>(arr: T[], idx: number): T => arr[idx % arr.length];

export async function seedSystemIntegration(prisma: PrismaClient, tenantId: string) {
  console.log('  Seeding System Integration data...');

  // ── Fetch prerequisite users and employees ──
  const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
  const employees = await prisma.employee.findMany({ where: { tenantId }, take: 10 });

  if (users.length === 0) {
    console.warn('  No users found for tenant. Skipping system integration seed.');
    return;
  }

  const primaryUser = pick(users, 0);
  const secondaryUser = pick(users, 1);
  const thirdUser = pick(users, 2);

  const primaryEmployeeId = employees[0]?.id ?? 'emp-001';
  const secondaryEmployeeId = employees[1]?.id ?? 'emp-002';
  const thirdEmployeeId = employees[2]?.id ?? 'emp-003';
  const fourthEmployeeId = employees[3]?.id ?? 'emp-004';

  // ============================================================================
  // 1. WORKFLOW DEFINITIONS (3 records)
  // ============================================================================
  console.log('    - Creating workflow definitions...');

  const leaveApprovalWorkflow = await (async () => {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { tenantId, name: 'Leave Approval Workflow' },
    });
    if (existing) return existing;
    return prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: 'Leave Approval Workflow',
        description: 'Automated leave request routing through manager and HR approval chain',
        trigger: 'EVENT',
        triggerEvent: 'leave.requested',
        nodes: [
          { id: 'start', type: 'START', config: {}, position: { x: 0, y: 0 } },
          { id: 'check_balance', type: 'CONDITION', config: { field: 'leaveBalance', operator: 'gte', value: 'requestedDays' }, position: { x: 200, y: 0 } },
          { id: 'manager_review', type: 'APPROVAL', config: { approverRole: 'MANAGER', timeoutHours: 48 }, position: { x: 400, y: 0 } },
          { id: 'notify_employee', type: 'NOTIFICATION', config: { template: 'leave_decision', channel: 'email' }, position: { x: 600, y: 0 } },
          { id: 'end', type: 'END', config: {}, position: { x: 800, y: 0 } },
        ],
        edges: [
          { source: 'start', target: 'check_balance', condition: null },
          { source: 'check_balance', target: 'manager_review', condition: 'balance_sufficient' },
          { source: 'check_balance', target: 'notify_employee', condition: 'balance_insufficient' },
          { source: 'manager_review', target: 'notify_employee', condition: 'approved' },
          { source: 'manager_review', target: 'notify_employee', condition: 'rejected' },
          { source: 'notify_employee', target: 'end', condition: null },
        ],
        isActive: true,
        version: 1,
        createdBy: primaryUser.id,
      },
    });
  })();

  const payrollApprovalWorkflow = await (async () => {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { tenantId, name: 'Payroll Approval Workflow' },
    });
    if (existing) return existing;
    return prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: 'Payroll Approval Workflow',
        description: 'Manual payroll run approval through finance and management chain',
        trigger: 'MANUAL',
        triggerEvent: null,
        nodes: [
          { id: 'start', type: 'START', config: {}, position: { x: 0, y: 0 } },
          { id: 'finance_review', type: 'APPROVAL', config: { approverRole: 'FINANCE_MANAGER', timeoutHours: 72 }, position: { x: 200, y: 0 } },
          { id: 'cfo_approval', type: 'APPROVAL', config: { approverRole: 'CFO', timeoutHours: 48 }, position: { x: 400, y: 0 } },
          { id: 'notify_payroll_team', type: 'NOTIFICATION', config: { template: 'payroll_approved', channel: 'email' }, position: { x: 600, y: 0 } },
          { id: 'end', type: 'END', config: {}, position: { x: 800, y: 0 } },
        ],
        edges: [
          { source: 'start', target: 'finance_review', condition: null },
          { source: 'finance_review', target: 'cfo_approval', condition: 'approved' },
          { source: 'finance_review', target: 'notify_payroll_team', condition: 'rejected' },
          { source: 'cfo_approval', target: 'notify_payroll_team', condition: null },
          { source: 'notify_payroll_team', target: 'end', condition: null },
        ],
        isActive: true,
        version: 1,
        createdBy: primaryUser.id,
      },
    });
  })();

  const onboardingWorkflow = await (async () => {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { tenantId, name: 'Employee Onboarding Workflow' },
    });
    if (existing) return existing;
    return prisma.workflowDefinition.create({
      data: {
        tenantId,
        name: 'Employee Onboarding Workflow',
        description: 'Comprehensive new hire onboarding process including IT setup, HR orientation, and team introduction',
        trigger: 'EVENT',
        triggerEvent: 'employee.created',
        nodes: [
          { id: 'start', type: 'START', config: {}, position: { x: 0, y: 0 } },
          { id: 'it_setup', type: 'TASK', config: { assignee: 'IT_TEAM', description: 'Provision laptop, email, and system access', dueDays: 2 }, position: { x: 200, y: -100 } },
          { id: 'hr_orientation', type: 'TASK', config: { assignee: 'HR_TEAM', description: 'Schedule orientation and benefits enrollment', dueDays: 3 }, position: { x: 200, y: 100 } },
          { id: 'team_intro', type: 'TASK', config: { assignee: 'MANAGER', description: 'Introduce to team and assign buddy', dueDays: 1 }, position: { x: 400, y: 0 } },
          { id: 'welcome_notification', type: 'NOTIFICATION', config: { template: 'welcome_email', channel: 'email' }, position: { x: 600, y: 0 } },
          { id: 'end', type: 'END', config: {}, position: { x: 800, y: 0 } },
        ],
        edges: [
          { source: 'start', target: 'it_setup', condition: null },
          { source: 'start', target: 'hr_orientation', condition: null },
          { source: 'it_setup', target: 'team_intro', condition: 'completed' },
          { source: 'hr_orientation', target: 'team_intro', condition: 'completed' },
          { source: 'team_intro', target: 'welcome_notification', condition: null },
          { source: 'welcome_notification', target: 'end', condition: null },
        ],
        isActive: true,
        version: 1,
        createdBy: primaryUser.id,
      },
    });
  })();

  // ============================================================================
  // 2. WORKFLOW INSTANCES (3 records)
  // ============================================================================
  console.log('    - Creating workflow instances...');

  // COMPLETED instance
  const existingInstance1 = await prisma.workflowInstance.findFirst({
    where: { tenantId, definitionId: leaveApprovalWorkflow.id, status: 'COMPLETED' },
  });
  if (!existingInstance1) {
    await prisma.workflowInstance.create({
      data: {
        definitionId: leaveApprovalWorkflow.id,
        tenantId,
        status: 'COMPLETED',
        currentNode: 'end',
        context: {
          leaveRequestId: 'lr-2024-001',
          employeeId: primaryEmployeeId,
          leaveType: 'Annual',
          startDate: '2024-12-20',
          endDate: '2024-12-27',
          approvedBy: secondaryUser.id,
        },
        startedAt: new Date('2024-12-15T09:00:00Z'),
        completedAt: new Date('2024-12-16T14:30:00Z'),
        triggeredBy: primaryUser.id,
      },
    });
  }

  // RUNNING instance
  const existingInstance2 = await prisma.workflowInstance.findFirst({
    where: { tenantId, definitionId: payrollApprovalWorkflow.id, status: 'RUNNING' },
  });
  if (!existingInstance2) {
    await prisma.workflowInstance.create({
      data: {
        definitionId: payrollApprovalWorkflow.id,
        tenantId,
        status: 'RUNNING',
        currentNode: 'cfo_approval',
        context: {
          payrollRunId: 'pr-2024-12',
          period: '2024-12',
          totalGross: 4250000,
          totalNet: 3357500,
          employeeCount: 285,
          currency: 'AED',
        },
        startedAt: new Date('2024-12-22T08:00:00Z'),
        triggeredBy: secondaryUser.id,
      },
    });
  }

  // FAILED instance
  const existingInstance3 = await prisma.workflowInstance.findFirst({
    where: { tenantId, definitionId: onboardingWorkflow.id, status: 'FAILED' },
  });
  if (!existingInstance3) {
    await prisma.workflowInstance.create({
      data: {
        definitionId: onboardingWorkflow.id,
        tenantId,
        status: 'FAILED',
        currentNode: 'it_setup',
        context: {
          employeeId: thirdEmployeeId,
          employeeName: 'New Hire',
          failureReason: 'IT provisioning system unavailable',
        },
        error: 'External service timeout: IT provisioning API returned 503 after 3 retry attempts',
        startedAt: new Date('2024-12-20T10:00:00Z'),
        triggeredBy: thirdUser.id,
      },
    });
  }

  // ============================================================================
  // 3. REPORT DEFINITIONS (3 records)
  // ============================================================================
  console.log('    - Creating report definitions...');

  const reportDefs = [
    {
      code: 'RPT-HEADCOUNT',
      name: 'Headcount by Department',
      description: 'Organization-wide headcount analysis by department, location, and employment type',
      category: 'HR',
      dataSource: 'Employee',
      columns: [
        { field: 'department', label: 'Department', type: 'string', aggregation: null },
        { field: 'location', label: 'Location', type: 'string', aggregation: null },
        { field: 'employmentType', label: 'Type', type: 'string', aggregation: null },
        { field: 'count', label: 'Headcount', type: 'number', aggregation: 'COUNT' },
      ],
      filters: [
        { field: 'status', operator: 'eq', value: 'ACTIVE' },
        { field: 'joiningDate', operator: 'gte', value: '2023-01-01' },
      ],
      chartType: 'BAR',
      isPublic: true,
      isScheduled: true,
    },
    {
      code: 'RPT-PAYROLL-SUMMARY',
      name: 'Payroll Summary',
      description: 'Monthly payroll summary with gross pay, deductions, and net pay breakdown',
      category: 'PAYROLL',
      dataSource: 'PayrollRun',
      columns: [
        { field: 'payPeriod', label: 'Pay Period', type: 'date', aggregation: null },
        { field: 'totalGross', label: 'Gross Pay', type: 'currency', aggregation: 'SUM' },
        { field: 'totalDeductions', label: 'Deductions', type: 'currency', aggregation: 'SUM' },
        { field: 'totalNet', label: 'Net Pay', type: 'currency', aggregation: 'SUM' },
        { field: 'employeeCount', label: 'Employees', type: 'number', aggregation: 'COUNT' },
      ],
      filters: [
        { field: 'status', operator: 'eq', value: 'FINALIZED' },
      ],
      chartType: 'LINE',
      isPublic: false,
      isScheduled: true,
    },
    {
      code: 'RPT-LEAVE-BALANCE',
      name: 'Leave Balance Report',
      description: 'Leave balance and utilization analysis across departments with absence rate calculations',
      category: 'LEAVE',
      dataSource: 'LeaveBalance',
      columns: [
        { field: 'leaveType', label: 'Leave Type', type: 'string', aggregation: null },
        { field: 'department', label: 'Department', type: 'string', aggregation: null },
        { field: 'totalEntitled', label: 'Entitled Days', type: 'number', aggregation: 'SUM' },
        { field: 'totalUsed', label: 'Used Days', type: 'number', aggregation: 'SUM' },
        { field: 'remainingBalance', label: 'Remaining', type: 'number', aggregation: 'SUM' },
      ],
      filters: [
        { field: 'year', operator: 'eq', value: '2024' },
        { field: 'status', operator: 'in', value: ['ACTIVE'] },
      ],
      chartType: 'PIE',
      isPublic: true,
      isScheduled: false,
    },
  ];

  const createdReports: Record<string, string> = {};
  for (const def of reportDefs) {
    const existing = await prisma.reportDefinition.findFirst({
      where: { tenantId, code: def.code },
    });
    if (existing) {
      createdReports[def.code] = existing.id;
      continue;
    }
    const report = await prisma.reportDefinition.create({
      data: {
        tenantId,
        code: def.code,
        name: def.name,
        description: def.description,
        category: def.category,
        dataSource: def.dataSource,
        columns: def.columns,
        filters: def.filters,
        chartType: def.chartType,
        isPublic: def.isPublic,
        createdBy: primaryUser.id,
        isScheduled: def.isScheduled,
      },
    });
    createdReports[def.code] = report.id;
  }

  // ============================================================================
  // 4. REPORT EXECUTIONS (3 records)
  // ============================================================================
  console.log('    - Creating report executions...');

  const reportExecutionDefs = [
    {
      reportCode: 'RPT-HEADCOUNT',
      executedBy: primaryUser.id,
      parameters: { department: 'all', asOfDate: '2024-12-01' },
      status: 'COMPLETED',
      recordCount: 347,
      executionTime: 1250,
      exportFormat: 'EXCEL',
    },
    {
      reportCode: 'RPT-PAYROLL-SUMMARY',
      executedBy: secondaryUser.id,
      parameters: { payPeriod: '2024-11', currency: 'AED' },
      status: 'COMPLETED',
      recordCount: 285,
      executionTime: 3420,
      exportFormat: 'PDF',
    },
    {
      reportCode: 'RPT-LEAVE-BALANCE',
      executedBy: primaryUser.id,
      parameters: { year: '2024', department: 'all' },
      status: 'COMPLETED',
      recordCount: 1240,
      executionTime: 890,
      exportFormat: 'CSV',
    },
  ];

  for (const exec of reportExecutionDefs) {
    const reportId = createdReports[exec.reportCode];
    if (!reportId) continue;

    const existing = await prisma.reportExecution.findFirst({
      where: { reportId, executedBy: exec.executedBy, status: exec.status },
    });
    if (!existing) {
      await prisma.reportExecution.create({
        data: {
          reportId,
          tenantId,
          executedBy: exec.executedBy,
          parameters: exec.parameters,
          status: exec.status,
          recordCount: exec.recordCount,
          executionTime: exec.executionTime,
          exportFormat: exec.exportFormat,
        },
      });
    }
  }

  // ============================================================================
  // 5. DASHBOARD WIDGETS (4 records)
  // ============================================================================
  console.log('    - Creating dashboard widgets...');

  const widgetDefs = [
    {
      code: 'WDG-EMPLOYEE-COUNT',
      title: 'Employee Count',
      type: 'KPI',
      dataSource: '/api/v1/analytics/headcount',
      config: {
        metric: 'totalActiveEmployees',
        trend: 'monthly',
        format: 'number',
        icon: 'Users',
        thresholds: { warning: 300, critical: 250 },
      },
      position: { row: 0, col: 0, width: 3, height: 1 },
    },
    {
      code: 'WDG-ATTENDANCE-TREND',
      title: 'Attendance Trend',
      type: 'CHART',
      dataSource: '/api/v1/analytics/attendance-trend',
      config: {
        chartType: 'area',
        metrics: ['presentRate', 'lateRate', 'absentRate'],
        period: 'last-30-days',
        showMovingAverage: true,
        movingAverageDays: 7,
      },
      position: { row: 0, col: 3, width: 5, height: 2 },
    },
    {
      code: 'WDG-RECENT-HIRES',
      title: 'Recent Hires',
      type: 'TABLE',
      dataSource: '/api/v1/analytics/recent-hires',
      config: {
        columns: ['employeeName', 'department', 'position', 'joiningDate', 'status'],
        sortBy: 'joiningDate',
        sortDirection: 'desc',
        pageSize: 10,
        showPagination: true,
      },
      position: { row: 2, col: 0, width: 6, height: 2 },
    },
    {
      code: 'WDG-PENDING-APPROVALS',
      title: 'Pending Approvals',
      type: 'LIST',
      dataSource: '/api/v1/analytics/pending-approvals',
      config: {
        categories: ['leave', 'expense', 'overtime', 'regularization'],
        showCount: true,
        showUrgent: true,
        maxItems: 15,
      },
      position: { row: 2, col: 6, width: 6, height: 2 },
    },
  ];

  for (const def of widgetDefs) {
    const existing = await prisma.dashboardWidget.findFirst({
      where: { tenantId, code: def.code },
    });
    if (!existing) {
      await prisma.dashboardWidget.create({
        data: {
          tenantId,
          code: def.code,
          title: def.title,
          type: def.type,
          dataSource: def.dataSource,
          config: def.config,
          position: def.position,
          isActive: true,
        },
      });
    }
  }

  // ============================================================================
  // 6. CUSTOM REPORTS (2 records)
  // ============================================================================
  console.log('    - Creating custom reports...');

  const customReportDefs = [
    {
      name: 'Employee Directory Report',
      dataSource: 'employees',
      columns: [
        { field: 'employeeCode', label: 'Employee Code', type: 'string' },
        { field: 'fullName', label: 'Full Name', type: 'string' },
        { field: 'department', label: 'Department', type: 'string' },
        { field: 'designation', label: 'Designation', type: 'string' },
        { field: 'email', label: 'Email', type: 'string' },
        { field: 'phone', label: 'Phone', type: 'string' },
        { field: 'joiningDate', label: 'Joining Date', type: 'date' },
        { field: 'status', label: 'Status', type: 'string' },
      ],
      filters: [
        { field: 'status', operator: 'eq', value: 'ACTIVE' },
      ],
      chartType: 'table',
    },
    {
      name: 'Payroll Cost Analysis',
      dataSource: 'payroll',
      columns: [
        { field: 'department', label: 'Department', type: 'string' },
        { field: 'headcount', label: 'Headcount', type: 'number' },
        { field: 'totalBasicSalary', label: 'Total Basic', type: 'currency' },
        { field: 'totalAllowances', label: 'Total Allowances', type: 'currency' },
        { field: 'totalDeductions', label: 'Total Deductions', type: 'currency' },
        { field: 'totalNetPay', label: 'Total Net Pay', type: 'currency' },
        { field: 'avgCostPerEmployee', label: 'Avg Cost/Employee', type: 'currency' },
      ],
      filters: [
        { field: 'payPeriod', operator: 'eq', value: '2024-12' },
        { field: 'status', operator: 'eq', value: 'FINALIZED' },
      ],
      chartType: 'bar',
    },
  ];

  for (const def of customReportDefs) {
    const existing = await prisma.customReport.findFirst({
      where: { tenantId, name: def.name },
    });
    if (!existing) {
      await prisma.customReport.create({
        data: {
          tenantId,
          name: def.name,
          dataSource: def.dataSource,
          columns: def.columns,
          filters: def.filters,
          chartType: def.chartType,
          createdBy: primaryUser.id,
        },
      });
    }
  }

  // ============================================================================
  // 7. PREDICTIVE MODELS (2 records)
  // ============================================================================
  console.log('    - Creating predictive models...');

  const predictiveModelDefs = [
    {
      code: 'MDL-ATTRITION',
      name: 'Attrition Risk Model',
      description: 'Predicts employee flight risk based on engagement scores, tenure, compensation, and recent activity patterns',
      modelType: 'ATTRITION',
      algorithm: 'RANDOM_FOREST',
      status: 'DEPLOYED',
      trainingDataset: {
        source: 'Employee',
        dateRange: { from: '2020-01-01', to: '2024-06-30' },
        sampleSize: 12500,
        splitRatio: { train: 0.8, test: 0.2 },
      },
      features: [
        { name: 'tenure_months', type: 'numeric', importance: 0.18 },
        { name: 'engagement_score', type: 'numeric', importance: 0.22 },
        { name: 'salary_competitiveness', type: 'numeric', importance: 0.15 },
        { name: 'promotion_recency_months', type: 'numeric', importance: 0.12 },
        { name: 'manager_rating', type: 'numeric', importance: 0.10 },
        { name: 'overtime_hours_avg', type: 'numeric', importance: 0.08 },
        { name: 'department', type: 'categorical', importance: 0.07 },
        { name: 'commute_distance', type: 'numeric', importance: 0.05 },
        { name: 'training_hours_ytd', type: 'numeric', importance: 0.03 },
      ],
      targetVariable: 'is_attrited',
      version: '2.1.0',
      accuracy: 0.87,
    },
    {
      code: 'MDL-PERFORMANCE',
      name: 'Performance Prediction Model',
      description: 'Forecasts quarterly performance ratings based on productivity metrics, peer reviews, and goal completion rates',
      modelType: 'PERFORMANCE',
      algorithm: 'LINEAR_REGRESSION',
      status: 'TRAINING',
      trainingDataset: {
        source: 'PerformanceReview',
        dateRange: { from: '2021-01-01', to: '2024-09-30' },
        sampleSize: 8200,
        splitRatio: { train: 0.75, test: 0.25 },
      },
      features: [
        { name: 'goal_completion_rate', type: 'numeric', importance: 0.25 },
        { name: 'peer_review_avg', type: 'numeric', importance: 0.18 },
        { name: 'training_completion', type: 'numeric', importance: 0.12 },
        { name: 'attendance_rate', type: 'numeric', importance: 0.10 },
        { name: 'project_delivery_rate', type: 'numeric', importance: 0.14 },
        { name: 'mentorship_hours', type: 'numeric', importance: 0.06 },
        { name: 'tenure_months', type: 'numeric', importance: 0.08 },
        { name: 'grade_level', type: 'categorical', importance: 0.07 },
      ],
      targetVariable: 'performance_score',
      version: '1.3.0',
      accuracy: 0.82,
    },
  ];

  const createdModels: Record<string, string> = {};
  for (const def of predictiveModelDefs) {
    const existing = await prisma.predictiveModel.findFirst({
      where: { tenantId, code: def.code },
    });
    if (existing) {
      createdModels[def.code] = existing.id;
      continue;
    }
    const model = await prisma.predictiveModel.create({
      data: {
        tenantId,
        code: def.code,
        name: def.name,
        description: def.description,
        modelType: def.modelType,
        algorithm: def.algorithm,
        trainingDataset: def.trainingDataset,
        features: def.features,
        targetVariable: def.targetVariable,
        version: def.version,
        accuracy: def.accuracy,
        status: def.status,
        deployedAt: def.status === 'DEPLOYED' ? new Date('2024-10-01T00:00:00Z') : undefined,
        trainedAt: def.status === 'DEPLOYED' ? new Date('2024-09-28T00:00:00Z') : undefined,
        trainingRecords: def.trainingDataset.sampleSize,
        createdBy: primaryUser.id,
      },
    });
    createdModels[def.code] = model.id;
  }

  // ============================================================================
  // 8. PREDICTIONS (4 records)
  // ============================================================================
  console.log('    - Creating predictions...');

  const attritionModelId = createdModels['MDL-ATTRITION'];
  const performanceModelId = createdModels['MDL-PERFORMANCE'];

  if (attritionModelId) {
    // Attrition prediction — low risk employee
    const existing1 = await prisma.prediction.findFirst({
      where: { modelId: attritionModelId, tenantId, entityId: primaryEmployeeId },
    });
    if (!existing1) {
      await prisma.prediction.create({
        data: {
          modelId: attritionModelId,
          tenantId,
          entityType: 'EMPLOYEE',
          entityId: primaryEmployeeId,
          predictedValue: 0.15,
          confidence: 0.91,
          predictedDate: new Date('2025-03-31'),
          inputFeatures: {
            tenure_months: 36,
            engagement_score: 4.2,
            salary_competitiveness: 1.05,
            promotion_recency_months: 8,
            manager_rating: 4.5,
            overtime_hours_avg: 6,
            department: 'Engineering',
            commute_distance: 12,
            training_hours_ytd: 40,
          },
        },
      });
    }

    // Attrition prediction — high risk employee
    const existing2 = await prisma.prediction.findFirst({
      where: { modelId: attritionModelId, tenantId, entityId: secondaryEmployeeId },
    });
    if (!existing2) {
      await prisma.prediction.create({
        data: {
          modelId: attritionModelId,
          tenantId,
          entityType: 'EMPLOYEE',
          entityId: secondaryEmployeeId,
          predictedValue: 0.72,
          confidence: 0.84,
          predictedDate: new Date('2025-03-31'),
          inputFeatures: {
            tenure_months: 14,
            engagement_score: 2.8,
            salary_competitiveness: 0.88,
            promotion_recency_months: 14,
            manager_rating: 3.0,
            overtime_hours_avg: 18,
            department: 'Sales',
            commute_distance: 45,
            training_hours_ytd: 8,
          },
        },
      });
    }

    // Attrition prediction — moderate risk employee
    const existing3 = await prisma.prediction.findFirst({
      where: { modelId: attritionModelId, tenantId, entityId: thirdEmployeeId },
    });
    if (!existing3) {
      await prisma.prediction.create({
        data: {
          modelId: attritionModelId,
          tenantId,
          entityType: 'EMPLOYEE',
          entityId: thirdEmployeeId,
          predictedValue: 0.42,
          confidence: 0.78,
          predictedDate: new Date('2025-03-31'),
          inputFeatures: {
            tenure_months: 22,
            engagement_score: 3.4,
            salary_competitiveness: 0.95,
            promotion_recency_months: 22,
            manager_rating: 3.5,
            overtime_hours_avg: 12,
            department: 'Marketing',
            commute_distance: 28,
            training_hours_ytd: 16,
          },
        },
      });
    }
  }

  if (performanceModelId) {
    // Performance prediction
    const existing4 = await prisma.prediction.findFirst({
      where: { modelId: performanceModelId, tenantId, entityId: fourthEmployeeId },
    });
    if (!existing4) {
      await prisma.prediction.create({
        data: {
          modelId: performanceModelId,
          tenantId,
          entityType: 'EMPLOYEE',
          entityId: fourthEmployeeId,
          predictedValue: 4.3,
          confidence: 0.88,
          predictedDate: new Date('2025-03-31'),
          inputFeatures: {
            goal_completion_rate: 0.92,
            peer_review_avg: 4.1,
            training_completion: 0.85,
            attendance_rate: 0.97,
            project_delivery_rate: 0.88,
            mentorship_hours: 24,
            tenure_months: 36,
            grade_level: 'Senior',
          },
        },
      });
    }
  }

  // ============================================================================
  // 9. AI AGENT CONVERSATIONS (2 records) + MESSAGES (4-6 records)
  // ============================================================================
  console.log('    - Creating AI agent conversations...');

  // HR_ASSISTANT conversation
  let hrConversation = await prisma.aIAgentConversation.findFirst({
    where: { tenantId, userId: primaryUser.id, agentType: 'HR_ASSISTANT' },
  });

  if (!hrConversation) {
    hrConversation = await prisma.aIAgentConversation.create({
      data: {
        tenantId,
        userId: primaryUser.id,
        title: 'Leave Policy Inquiry',
        agentType: 'HR_ASSISTANT',
        sessionId: `session_hr_assistant_${primaryUser.id.slice(0, 8)}`,
        status: 'ACTIVE',
      },
    });

    await prisma.aIAgentMessage.createMany({
      data: [
        {
          conversationId: hrConversation.id,
          role: 'USER',
          content: 'What is the annual leave entitlement for employees who have completed 2 years of service?',
          tokens: 22,
        },
        {
          conversationId: hrConversation.id,
          role: 'ASSISTANT',
          content: 'According to the company leave policy, employees who have completed 2 years of continuous service are entitled to 24 working days of annual leave per year. This is an increase from the standard 21 days for employees in their first two years. The leave accrues monthly at a rate of 2 days per month and can be carried forward up to a maximum of 10 days into the next calendar year.',
          tokens: 85,
          model: 'claude-3-opus',
          actionTaken: 'QUERY_DATABASE',
          actionResult: { table: 'LeavePolicy', query: 'annual_leave_entitlement', recordsFound: 1 },
        },
        {
          conversationId: hrConversation.id,
          role: 'USER',
          content: 'Can I carry forward unused leave to the following year? Is there a maximum limit?',
          tokens: 18,
        },
        {
          conversationId: hrConversation.id,
          role: 'ASSISTANT',
          content: 'Yes, you can carry forward unused annual leave. The maximum carry-forward is 10 working days, which must be utilized within the first quarter (Q1) of the following year. Any unused carry-forward leave beyond March 31st will be forfeited unless approved by your department head. Additionally, if you have more than 10 days remaining at year-end, you may be eligible for leave encashment at your basic salary rate for up to 5 days, subject to HR approval.',
          tokens: 102,
          model: 'claude-3-opus',
          actionTaken: 'QUERY_DATABASE',
          actionResult: { table: 'LeavePolicy', query: 'carry_forward_rules', recordsFound: 1 },
        },
      ],
    });
  }

  // POLICY_ADVISOR conversation
  let policyConversation = await prisma.aIAgentConversation.findFirst({
    where: { tenantId, userId: secondaryUser.id, agentType: 'POLICY_ADVISOR' },
  });

  if (!policyConversation) {
    policyConversation = await prisma.aIAgentConversation.create({
      data: {
        tenantId,
        userId: secondaryUser.id,
        title: 'Remote Work Policy Clarification',
        agentType: 'POLICY_ADVISOR',
        sessionId: `session_policy_advisor_${secondaryUser.id.slice(0, 8)}`,
        status: 'ACTIVE',
      },
    });

    await prisma.aIAgentMessage.createMany({
      data: [
        {
          conversationId: policyConversation.id,
          role: 'USER',
          content: 'What is our company policy on remote work? How many days per week can I work from home?',
          tokens: 24,
        },
        {
          conversationId: policyConversation.id,
          role: 'ASSISTANT',
          content: 'Based on the current Flexible Work Arrangement Policy (FWA-2024-v3), eligible employees can work remotely up to 2 days per week, subject to manager approval. The policy requires a minimum of 3 in-office days per week for collaboration. Departments may have specific arrangements — for example, Engineering teams may work remotely up to 3 days per week during non-sprint weeks. All remote work requests must be submitted through the ESS portal at least 24 hours in advance.',
          tokens: 112,
          model: 'claude-3-opus',
          actionTaken: 'QUERY_DATABASE',
          actionResult: { table: 'PolicyDocument', query: 'remote_work_policy', recordsFound: 1 },
        },
      ],
    });
  }

  // ============================================================================
  // 10. ANALYTICS CACHE (2 records)
  // ============================================================================
  console.log('    - Creating analytics cache entries...');

  const now = new Date();
  const cacheDefs = [
    {
      cacheKey: 'dashboard:headcount:summary',
      category: 'DASHBOARD',
      data: {
        totalActive: 347,
        totalInactive: 23,
        newHiresThisMonth: 12,
        exitThisMonth: 3,
        byDepartment: {
          Engineering: 98,
          Sales: 62,
          HR: 28,
          Finance: 35,
          Operations: 67,
          Marketing: 42,
          Legal: 15,
        },
        changeFromLastMonth: 2.4,
      },
      recordCount: 370,
    },
    {
      cacheKey: 'report:payroll:monthly:2024-11',
      category: 'REPORT',
      data: {
        payPeriod: '2024-11',
        totalGrossPay: 4250000,
        totalDeductions: 892500,
        totalNetPay: 3357500,
        currency: 'AED',
        employeeCount: 285,
        averageGross: 14912.28,
        byDepartment: {
          Engineering: { gross: 1450000, net: 1147500, headcount: 98 },
          Sales: { gross: 820000, net: 648500, headcount: 62 },
          Operations: { gross: 780000, net: 616800, headcount: 67 },
        },
      },
      recordCount: 285,
    },
  ];

  for (const def of cacheDefs) {
    const existing = await prisma.analyticsCache.findFirst({
      where: { tenantId, cacheKey: def.cacheKey },
    });
    if (!existing) {
      await prisma.analyticsCache.create({
        data: {
          tenantId,
          cacheKey: def.cacheKey,
          category: def.category,
          data: def.data,
          generatedAt: now,
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
          recordCount: def.recordCount,
        },
      });
    }
  }

  // ============================================================================
  // 11. WEBHOOKS (2 records)
  // ============================================================================
  console.log('    - Creating webhooks...');

  const webhookDefs = [
    {
      url: 'https://erp.kreupai.com/webhooks/employee-events',
      events: ['employee.created', 'employee.updated', 'employee.terminated', 'employee.promoted'],
      secret: 'whsec_kreupai_employee_events_2024_prod',
    },
    {
      url: 'https://slack-bot.kreupai.com/webhooks/leave-events',
      events: ['leave.requested', 'leave.approved', 'leave.rejected', 'leave.cancelled'],
      secret: 'whsec_kreupai_leave_events_2024_prod',
    },
  ];

  const createdWebhooks: string[] = [];
  for (const def of webhookDefs) {
    const existing = await prisma.webhook.findFirst({
      where: { tenantId, url: def.url },
    });
    if (existing) {
      createdWebhooks.push(existing.id);
      continue;
    }
    const webhook = await prisma.webhook.create({
      data: {
        tenantId,
        url: def.url,
        events: def.events,
        secret: def.secret,
        isActive: true,
        createdBy: primaryUser.id,
      },
    });
    createdWebhooks.push(webhook.id);
  }

  // ============================================================================
  // 12. WEBHOOK LOGS (3 records)
  // ============================================================================
  console.log('    - Creating webhook logs...');

  if (createdWebhooks.length > 0) {
    const webhookLogDefs = [
      {
        webhookId: pick(createdWebhooks, 0),
        event: 'employee.created',
        payload: {
          eventId: 'evt_2024_12_001',
          timestamp: '2024-12-18T10:30:00Z',
          data: { employeeId: primaryEmployeeId, employeeCode: 'EMP-001', action: 'created' },
        },
        statusCode: 200,
        success: true,
        attempts: 1,
      },
      {
        webhookId: pick(createdWebhooks, 0),
        event: 'employee.terminated',
        payload: {
          eventId: 'evt_2024_12_002',
          timestamp: '2024-12-20T16:00:00Z',
          data: { employeeId: secondaryEmployeeId, employeeCode: 'EMP-002', action: 'terminated', reason: 'resignation' },
        },
        statusCode: 200,
        success: true,
        attempts: 1,
      },
      {
        webhookId: pick(createdWebhooks, 1),
        event: 'leave.requested',
        payload: {
          eventId: 'evt_2024_12_003',
          timestamp: '2024-12-19T09:15:00Z',
          data: { leaveRequestId: 'lr-2024-089', employeeId: thirdEmployeeId, type: 'Annual', days: 5 },
        },
        statusCode: 502,
        success: false,
        attempts: 3,
      },
    ];

    for (const def of webhookLogDefs) {
      const existing = await prisma.webhookLog.findFirst({
        where: {
          webhookId: def.webhookId,
          event: def.event,
          success: def.success,
        },
      });
      if (!existing) {
        await prisma.webhookLog.create({
          data: {
            webhookId: def.webhookId,
            event: def.event,
            payload: def.payload,
            statusCode: def.statusCode,
            success: def.success,
            attempts: def.attempts,
          },
        });
      }
    }
  }

  // ============================================================================
  // 13. API KEYS (2 records)
  // ============================================================================
  console.log('    - Creating API keys...');

  const apiKeyDefs = [
    {
      name: 'Integration API Key',
      keyHash: 'sha256_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      prefix: 'aura_sk_',
      scopes: ['read:employees', 'read:payroll', 'read:attendance', 'read:leave', 'write:webhooks'],
    },
    {
      name: 'Reporting API Key',
      keyHash: 'sha256_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4',
      prefix: 'aura_sk_',
      scopes: ['read:reports', 'read:analytics', 'read:dashboards', 'execute:reports'],
    },
  ];

  for (const def of apiKeyDefs) {
    const existing = await prisma.aPIKey.findFirst({
      where: { tenantId, name: def.name },
    });
    if (!existing) {
      await prisma.aPIKey.create({
        data: {
          tenantId,
          name: def.name,
          keyHash: def.keyHash,
          prefix: def.prefix,
          scopes: def.scopes,
          isActive: true,
          createdBy: primaryUser.id,
        },
      });
    }
  }

  // ============================================================================
  // 14. NOTIFICATIONS (4 records)
  // ============================================================================
  console.log('    - Creating notifications...');

  const notificationDefs = [
    {
      title: 'System Maintenance Scheduled',
      body: 'AuraOS will undergo scheduled maintenance on Saturday, December 28th from 02:00 to 06:00 GST. Please save your work before the maintenance window.',
      type: 'system',
      priority: 'high',
      status: 'sent',
    },
    {
      title: 'Leave Request Approved',
      body: 'Your annual leave request from December 20 to December 27 (5 working days) has been approved by your manager. Your updated leave balance is 16 days.',
      type: 'leave',
      priority: 'medium',
      status: 'sent',
    },
    {
      title: 'December Payroll Processed',
      body: 'Your December 2024 payroll has been processed. Salary will be credited to your bank account within 2 business days. View your payslip in the ESS portal.',
      type: 'payroll',
      priority: 'medium',
      status: 'sent',
    },
    {
      title: 'Happy Birthday!',
      body: 'Wishing you a wonderful birthday! Your team and the entire organization wish you the very best. Enjoy your special day!',
      type: 'hr',
      priority: 'low',
      status: 'draft',
    },
  ];

  const createdNotifications: string[] = [];
  for (const def of notificationDefs) {
    const existing = await prisma.notification.findFirst({
      where: { tenantId, title: def.title },
    });
    if (existing) {
      createdNotifications.push(existing.id);
      continue;
    }
    const notification = await prisma.notification.create({
      data: {
        tenantId,
        title: def.title,
        body: def.body,
        type: def.type,
        priority: def.priority,
        status: def.status,
        sentAt: def.status === 'sent' ? new Date() : undefined,
        sentCount: def.status === 'sent' ? users.length : 0,
        createdBy: primaryUser.id,
      },
    });
    createdNotifications.push(notification.id);
  }

  // ============================================================================
  // 15. NOTIFICATION RECIPIENTS (6 records)
  // ============================================================================
  console.log('    - Creating notification recipients...');

  // Distribute 6 recipients across the notifications (2 per notification for first 3)
  const recipientAssignments = [
    { notifIdx: 0, userIdx: 0, channel: 'push', status: 'delivered' },
    { notifIdx: 0, userIdx: 1, channel: 'email', status: 'delivered' },
    { notifIdx: 1, userIdx: 0, channel: 'push', status: 'delivered' },
    { notifIdx: 1, userIdx: 2, channel: 'email', status: 'read' },
    { notifIdx: 2, userIdx: 0, channel: 'push', status: 'delivered' },
    { notifIdx: 2, userIdx: 1, channel: 'push', status: 'pending' },
  ];

  for (const assignment of recipientAssignments) {
    const notificationId = createdNotifications[assignment.notifIdx];
    const user = pick(users, assignment.userIdx);
    if (!notificationId) continue;

    const existing = await prisma.notificationRecipient.findFirst({
      where: { notificationId, userId: user.id, channel: assignment.channel },
    });
    if (!existing) {
      await prisma.notificationRecipient.create({
        data: {
          notificationId,
          userId: user.id,
          status: assignment.status,
          deliveredAt: assignment.status !== 'pending' ? new Date() : undefined,
          readAt: assignment.status === 'read' ? new Date() : undefined,
          isRead: assignment.status === 'read',
          channel: assignment.channel,
        },
      });
    }
  }

  // ============================================================================
  // 16. NOTIFICATION TEMPLATES (3 records)
  // ============================================================================
  console.log('    - Creating notification templates...');

  const templateDefs = [
    {
      name: 'Leave Approval Notification',
      subject: 'Your leave request has been approved',
      body: 'Dear {{employeeName}}, your {{leaveType}} leave from {{startDate}} to {{endDate}} ({{totalDays}} days) has been approved by {{approverName}}. Your updated leave balance is {{remainingBalance}} days.',
      type: 'email',
      category: 'leave',
    },
    {
      name: 'Payroll Slip Notification',
      subject: 'Your payslip for {{payPeriod}} is ready',
      body: 'Dear {{employeeName}}, your payslip for {{payPeriod}} has been generated. Net salary: {{currency}} {{netSalary}}. Expected credit date: {{creditDate}}. View your detailed payslip at {{payslipUrl}}.',
      type: 'email',
      category: 'payroll',
    },
    {
      name: 'Birthday Wishes',
      subject: 'Happy Birthday, {{employeeName}}!',
      body: 'Dear {{employeeName}}, the entire {{companyName}} family wishes you a very Happy Birthday! We hope this year brings you great success, happiness, and wonderful achievements. Enjoy your special day!',
      type: 'push',
      category: 'hr',
    },
  ];

  for (const def of templateDefs) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: { tenantId, name: def.name },
    });
    if (!existing) {
      await prisma.notificationTemplate.create({
        data: {
          tenantId,
          name: def.name,
          subject: def.subject,
          body: def.body,
          type: def.type,
          category: def.category,
          isActive: true,
          createdBy: primaryUser.id,
        },
      });
    }
  }

  // ============================================================================
  // 17. NOTIFICATION PREFERENCES (3 records)
  // ============================================================================
  console.log('    - Creating notification preferences...');

  const preferenceConfigs = [
    { userIdx: 0, category: 'leave', emailEnabled: true, pushEnabled: true, smsEnabled: false, inAppEnabled: true },
    { userIdx: 1, category: 'payroll', emailEnabled: true, pushEnabled: true, smsEnabled: true, inAppEnabled: true },
    { userIdx: 2, category: 'system', emailEnabled: true, pushEnabled: false, smsEnabled: true, inAppEnabled: true },
  ];

  for (const pref of preferenceConfigs) {
    const user = pick(users, pref.userIdx);
    const existing = await prisma.notificationPreference.findFirst({
      where: { userId: user.id, category: pref.category },
    });
    if (!existing) {
      await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          tenantId,
          category: pref.category,
          emailEnabled: pref.emailEnabled,
          pushEnabled: pref.pushEnabled,
          smsEnabled: pref.smsEnabled,
          inAppEnabled: pref.inAppEnabled,
        },
      });
    }
  }

  // ============================================================================
  // 18. DEVICE TOKENS (2 records)
  // ============================================================================
  console.log('    - Creating device tokens...');

  const deviceDefs = [
    { userId: primaryUser.id, token: 'ExponentPushToken[aAbBcCdDeEfFgGhHiIjJ01]', platform: 'ios' },
    { userId: secondaryUser.id, token: 'ExponentPushToken[kKlLmMnNoOpPqQrRsStT02]', platform: 'android' },
  ];

  for (const def of deviceDefs) {
    const existing = await prisma.deviceToken.findFirst({
      where: { userId: def.userId, token: def.token },
    });
    if (!existing) {
      await prisma.deviceToken.create({
        data: {
          userId: def.userId,
          tenantId,
          token: def.token,
          platform: def.platform,
          tokenType: 'expo',
          isActive: true,
        },
      });
    }
  }

  console.log('  System Integration data seeded successfully');
}

// Run if executed directly
if (require.main === module) {
  const _prisma = new PrismaClient();
  const tenantId = process.argv[2] || 'default-tenant';
  seedSystemIntegration(_prisma, tenantId)
    .catch((e) => {
      console.error('Error seeding system integration:', e);
      process.exit(1);
    })
    .finally(async () => {
      await _prisma.$disconnect();
    });
}
