/**
 * @module NotificationTemplatesSeed
 * @description 20+ enterprise notification templates covering leave, payroll,
 *   attendance, HR milestones, compliance, and system events.
 *   Templates are stored in the NotificationTemplate model.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 3
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface NotificationTemplateDef {
  key: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  variables: string[];
}

// ---------------------------------------------------------------------------
// Helper: deterministic id from key (max 36 chars, UUID-safe)
// ---------------------------------------------------------------------------
function keyToId(key: string): string {
  // Produce a stable alphanumeric id from the template key
  const b64 = Buffer.from(key).toString('base64');
  return b64.slice(0, 36).replace(/[^a-zA-Z0-9-]/g, '0');
}

// ---------------------------------------------------------------------------
// Leave Notifications (5 templates)
// ---------------------------------------------------------------------------

const leaveTemplates: NotificationTemplateDef[] = [
  {
    key: 'leave.submitted',
    name: 'Leave Request Submitted',
    subject: 'New Leave Request from {{employeeName}} — {{leaveType}}',
    body: [
      'Dear {{approverName}},',
      '',
      '{{employeeName}} has submitted a {{leaveType}} request for your approval.',
      '',
      'Duration: {{startDate}} to {{endDate}} ({{totalDays}} day(s))',
      'Leave Balance Available: {{availableBalance}} days',
      'Reason: {{reason}}',
      '',
      'Please review and take action within {{slaHours}} hours.',
      'Review Link: {{reviewLink}}',
      '',
      'Regards,',
      'AuraOS HR Platform',
    ].join('\n'),
    category: 'leave',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['approverName', 'employeeName', 'leaveType', 'startDate', 'endDate', 'totalDays', 'availableBalance', 'reason', 'slaHours', 'reviewLink'],
  },
  {
    key: 'leave.approved',
    name: 'Leave Request Approved',
    subject: 'Your {{leaveType}} Leave has been Approved',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{leaveType}} leave request has been approved by {{approverName}}.',
      '',
      'Approved Period: {{startDate}} to {{endDate}} ({{totalDays}} day(s))',
      'Remaining Balance: {{remainingBalance}} days',
      'Comments: {{approverComments}}',
      '',
      'Your out-of-office has been set up. Have a great time off!',
      '',
      'Regards,',
      'AuraOS HR Platform',
    ].join('\n'),
    category: 'leave',
    channels: ['email', 'sms', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'totalDays', 'approverName', 'approverComments', 'remainingBalance'],
  },
  {
    key: 'leave.rejected',
    name: 'Leave Request Rejected',
    subject: 'Your {{leaveType}} Leave Request was Not Approved',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{leaveType}} leave request for {{startDate}} to {{endDate}} has been reviewed.',
      '',
      'Decision: Not Approved',
      'Reason: {{rejectionReason}}',
      'Decided by: {{approverName}}',
      '',
      'If you have questions, please contact your HR Business Partner.',
      'Appeal Link: {{appealLink}}',
      '',
      'Regards,',
      'AuraOS HR Platform',
    ].join('\n'),
    category: 'leave',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'approverName', 'rejectionReason', 'appealLink'],
  },
  {
    key: 'leave.cancelled',
    name: 'Leave Request Cancelled',
    subject: 'Leave Cancellation Confirmed — {{startDate}} to {{endDate}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{leaveType}} leave for {{startDate}} to {{endDate}} has been successfully cancelled.',
      '',
      'Restored to Balance: {{restoredDays}} day(s)',
      'Updated Balance: {{updatedBalance}} days',
      '',
      'Your calendar and out-of-office have been updated accordingly.',
      '',
      'Regards,',
      'AuraOS HR Platform',
    ].join('\n'),
    category: 'leave',
    channels: ['email', 'push', 'in_app'],
    priority: 'medium',
    variables: ['employeeName', 'leaveType', 'startDate', 'endDate', 'restoredDays', 'updatedBalance'],
  },
  {
    key: 'leave.balance_low',
    name: 'Low Leave Balance Alert',
    subject: 'Action Required: Your {{leaveType}} Balance is Running Low',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{leaveType}} balance has fallen to {{remainingDays}} day(s), which is below the recommended threshold.',
      '',
      'Leave Year End: {{leaveYearEnd}}',
      'Balance Expiring: {{expiringDays}} days (carry-forward limit: {{carryForwardLimit}} days)',
      '',
      'Please plan your remaining leaves before {{planByDate}} to avoid losing entitlements.',
      '',
      'View Leave Planner: {{leavePlannerLink}}',
      '',
      'Regards,',
      'AuraOS HR Platform',
    ].join('\n'),
    category: 'leave',
    channels: ['email', 'in_app'],
    priority: 'medium',
    variables: ['employeeName', 'leaveType', 'remainingDays', 'leaveYearEnd', 'expiringDays', 'carryForwardLimit', 'planByDate', 'leavePlannerLink'],
  },
];

// ---------------------------------------------------------------------------
// Payroll Notifications (3 templates)
// ---------------------------------------------------------------------------

const payrollTemplates: NotificationTemplateDef[] = [
  {
    key: 'payroll.processed',
    name: 'Payroll Processed',
    subject: 'Payroll Processed for {{payPeriod}} — {{companyName}}',
    body: [
      'Dear {{recipientName}},',
      '',
      'The payroll for {{payPeriod}} has been successfully processed.',
      '',
      'Total Employees: {{totalEmployees}}',
      'Total Net Pay: {{currency}} {{totalNetPay}}',
      'Payment Date: {{paymentDate}}',
      'Processing Status: {{status}}',
      '',
      'Review the payroll report here: {{reportLink}}',
      '',
      'Regards,',
      'AuraOS Payroll',
    ].join('\n'),
    category: 'payroll',
    channels: ['email', 'in_app'],
    priority: 'high',
    variables: ['recipientName', 'payPeriod', 'companyName', 'totalEmployees', 'currency', 'totalNetPay', 'paymentDate', 'status', 'reportLink'],
  },
  {
    key: 'payroll.payslip_available',
    name: 'Payslip Available',
    subject: 'Your Payslip for {{payPeriod}} is Ready',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your payslip for {{payPeriod}} is now available.',
      '',
      'Gross Salary: {{currency}} {{grossPay}}',
      'Total Deductions: {{currency}} {{totalDeductions}}',
      'Net Pay: {{currency}} {{netPay}}',
      'Payment Date: {{paymentDate}}',
      '',
      'Download your payslip: {{payslipLink}}',
      '',
      'Regards,',
      'AuraOS Payroll',
    ].join('\n'),
    category: 'payroll',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'payPeriod', 'currency', 'grossPay', 'totalDeductions', 'netPay', 'paymentDate', 'payslipLink'],
  },
  {
    key: 'payroll.error',
    name: 'Payroll Processing Error',
    subject: 'URGENT: Payroll Error Detected for {{payPeriod}}',
    body: [
      'Dear {{recipientName}},',
      '',
      'A payroll processing error has been detected for {{payPeriod}}.',
      '',
      'Error Type: {{errorType}}',
      'Affected Employees: {{affectedCount}}',
      'Error Details: {{errorDetails}}',
      'Detected At: {{detectedAt}}',
      '',
      'Please review and resolve immediately: {{errorLink}}',
      '',
      'This requires urgent attention before the payment deadline of {{paymentDeadline}}.',
      '',
      'Regards,',
      'AuraOS Payroll System',
    ].join('\n'),
    category: 'payroll',
    channels: ['email', 'push', 'in_app'],
    priority: 'critical',
    variables: ['recipientName', 'payPeriod', 'errorType', 'affectedCount', 'errorDetails', 'detectedAt', 'errorLink', 'paymentDeadline'],
  },
];

// ---------------------------------------------------------------------------
// Attendance Notifications (3 templates)
// ---------------------------------------------------------------------------

const attendanceTemplates: NotificationTemplateDef[] = [
  {
    key: 'attendance.late_arrival',
    name: 'Late Arrival Alert',
    subject: 'Late Arrival Recorded — {{employeeName}} on {{date}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'A late arrival has been recorded for you on {{date}}.',
      '',
      'Scheduled Start: {{scheduledTime}}',
      'Actual Clock-In: {{actualTime}}',
      'Delay: {{delayMinutes}} minutes',
      '',
      'If this was due to an approved reason, please submit an attendance regularisation request.',
      'Regularise Here: {{regularisationLink}}',
      '',
      'Regards,',
      'AuraOS Attendance',
    ].join('\n'),
    category: 'attendance',
    channels: ['push', 'in_app'],
    priority: 'medium',
    variables: ['employeeName', 'date', 'scheduledTime', 'actualTime', 'delayMinutes', 'regularisationLink'],
  },
  {
    key: 'attendance.early_departure',
    name: 'Early Departure Alert',
    subject: 'Early Departure Recorded — {{employeeName}} on {{date}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'An early departure has been recorded on {{date}}.',
      '',
      'Scheduled End: {{scheduledEndTime}}',
      'Actual Clock-Out: {{actualEndTime}}',
      'Early by: {{earlyMinutes}} minutes',
      '',
      'Please submit an attendance regularisation if this was for an approved reason.',
      'Regularise Here: {{regularisationLink}}',
      '',
      'Regards,',
      'AuraOS Attendance',
    ].join('\n'),
    category: 'attendance',
    channels: ['push', 'in_app'],
    priority: 'medium',
    variables: ['employeeName', 'date', 'scheduledEndTime', 'actualEndTime', 'earlyMinutes', 'regularisationLink'],
  },
  {
    key: 'attendance.absent',
    name: 'Unplanned Absence Alert',
    subject: 'Unplanned Absence Recorded for {{employeeName}} — {{date}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'You were marked absent on {{date}} without an approved leave request.',
      '',
      'This may impact your pay if not regularised.',
      '',
      'Please apply for leave or regularise attendance by {{deadline}}.',
      'Apply Leave: {{leaveLink}} | Regularise: {{regularisationLink}}',
      '',
      'If you are unwell, please submit a sick leave request with medical documentation.',
      '',
      'Regards,',
      'AuraOS HR',
    ].join('\n'),
    category: 'attendance',
    channels: ['email', 'sms', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'date', 'deadline', 'leaveLink', 'regularisationLink'],
  },
];

// ---------------------------------------------------------------------------
// HR Milestone Notifications (4 templates)
// ---------------------------------------------------------------------------

const hrMilestoneTemplates: NotificationTemplateDef[] = [
  {
    key: 'hr.birthday',
    name: 'Employee Birthday',
    subject: 'Happy Birthday {{employeeName}}!',
    body: [
      'Dear {{employeeName}},',
      '',
      'Wishing you a very Happy Birthday from the entire {{companyName}} family!',
      '',
      'May this special day be filled with joy and happiness.',
      'We are grateful for your contributions to the team.',
      '',
      'Best wishes,',
      '{{companyName}} HR Team',
    ].join('\n'),
    category: 'hr',
    channels: ['email', 'in_app'],
    priority: 'low',
    variables: ['employeeName', 'companyName'],
  },
  {
    key: 'hr.work_anniversary',
    name: 'Work Anniversary',
    subject: 'Congratulations on Your {{years}}-Year Anniversary at {{companyName}}!',
    body: [
      'Dear {{employeeName}},',
      '',
      'Today marks your {{years}}-year work anniversary at {{companyName}} — congratulations!',
      '',
      'Your contribution and dedication over the years have made a real difference.',
      'We look forward to many more years of growth together.',
      '',
      'With appreciation,',
      '{{companyName}} Leadership Team',
    ].join('\n'),
    category: 'hr',
    channels: ['email', 'in_app'],
    priority: 'low',
    variables: ['employeeName', 'years', 'companyName'],
  },
  {
    key: 'hr.probation_expiry',
    name: 'Probation Period Expiring',
    subject: 'Action Required: {{employeeName}} — Probation Ends on {{probationEndDate}}',
    body: [
      'Dear {{managerName}},',
      '',
      '{{employeeName}} probation period is ending on {{probationEndDate}}.',
      '',
      'You are required to submit a probation review by {{reviewDeadline}}.',
      '',
      'Please rate their performance and recommend:',
      '  - Confirmation',
      '  - Extension (specify duration)',
      '  - Termination (with HR consultation)',
      '',
      'Start Review: {{reviewLink}}',
      '',
      'Regards,',
      'AuraOS HR',
    ].join('\n'),
    category: 'hr',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['managerName', 'employeeName', 'probationEndDate', 'reviewDeadline', 'reviewLink'],
  },
  {
    key: 'hr.document_expiry',
    name: 'Document Expiry Warning',
    subject: 'Document Expiry Alert: {{documentType}} expires on {{expiryDate}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{documentType}} is expiring on {{expiryDate}} ({{daysRemaining}} days remaining).',
      '',
      'Please upload the renewed document before {{uploadDeadline}} to avoid any service interruption.',
      '',
      'Upload Document: {{uploadLink}}',
      '',
      'Documents required for compliance: {{complianceNote}}',
      '',
      'Regards,',
      'AuraOS HR',
    ].join('\n'),
    category: 'hr',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'documentType', 'expiryDate', 'daysRemaining', 'uploadDeadline', 'uploadLink', 'complianceNote'],
  },
];

// ---------------------------------------------------------------------------
// Compliance Notifications (3 templates)
// ---------------------------------------------------------------------------

const complianceTemplates: NotificationTemplateDef[] = [
  {
    key: 'compliance.training_due',
    name: 'Mandatory Training Due',
    subject: 'Mandatory Training Due: {{courseName}} — Deadline {{deadline}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'You have mandatory training that requires your attention.',
      '',
      'Course: {{courseName}}',
      'Category: {{courseCategory}}',
      'Deadline: {{deadline}}',
      'Progress: {{completionPercentage}}% complete',
      'Estimated Time: {{estimatedHours}} hours remaining',
      '',
      'Non-completion may result in a compliance flag on your profile.',
      '',
      'Start Training: {{trainingLink}}',
      '',
      'Regards,',
      'AuraOS Learning & Compliance',
    ].join('\n'),
    category: 'compliance',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'courseName', 'courseCategory', 'deadline', 'completionPercentage', 'estimatedHours', 'trainingLink'],
  },
  {
    key: 'compliance.certification_expiring',
    name: 'Professional Certification Expiring',
    subject: 'Certification Expiry Alert: {{certificationName}} expires {{expiryDate}}',
    body: [
      'Dear {{employeeName}},',
      '',
      'Your {{certificationName}} certification is expiring on {{expiryDate}}.',
      '',
      'Days Remaining: {{daysRemaining}}',
      'Renewal Deadline: {{renewalDeadline}}',
      'Estimated Renewal Cost: {{renewalCost}}',
      '',
      'Please initiate your renewal and submit evidence to HR by {{uploadDeadline}}.',
      '',
      'Renewal Resources: {{renewalLink}}',
      'Submit Evidence: {{uploadLink}}',
      '',
      'Regards,',
      'AuraOS HR & Compliance',
    ].join('\n'),
    category: 'compliance',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'certificationName', 'expiryDate', 'daysRemaining', 'renewalDeadline', 'renewalCost', 'uploadDeadline', 'renewalLink', 'uploadLink'],
  },
  {
    key: 'compliance.policy_update',
    name: 'Policy Update — Acknowledgement Required',
    subject: 'Policy Update: {{policyName}} — Your Acknowledgement is Required',
    body: [
      'Dear {{employeeName}},',
      '',
      'An important policy has been updated and requires your acknowledgement.',
      '',
      'Policy: {{policyName}}',
      'Effective Date: {{effectiveDate}}',
      'Key Changes: {{changesSummary}}',
      '',
      'Please read the updated policy and acknowledge by {{acknowledgementDeadline}}.',
      '',
      'Read & Acknowledge: {{policyLink}}',
      '',
      'Note: Failure to acknowledge by the deadline will be escalated to your manager.',
      '',
      'Regards,',
      'AuraOS HR',
    ].join('\n'),
    category: 'compliance',
    channels: ['email', 'push', 'in_app'],
    priority: 'high',
    variables: ['employeeName', 'policyName', 'effectiveDate', 'changesSummary', 'acknowledgementDeadline', 'policyLink'],
  },
];

// ---------------------------------------------------------------------------
// System Notifications (2 templates)
// ---------------------------------------------------------------------------

const systemTemplates: NotificationTemplateDef[] = [
  {
    key: 'system.password_expiry',
    name: 'Password Expiry Warning',
    subject: 'Your AuraOS Password Expires in {{daysRemaining}} Days',
    body: [
      'Dear {{userName}},',
      '',
      'Your AuraOS account password will expire in {{daysRemaining}} days (on {{expiryDate}}).',
      '',
      'Please update your password before it expires to avoid account lockout.',
      '',
      'Change Password: {{changePasswordLink}}',
      '',
      'Security Tips:',
      '  - Use a minimum of {{minLength}} characters',
      '  - Include uppercase, lowercase, numbers, and symbols',
      '  - Do not reuse your last {{historyCount}} passwords',
      '',
      'AuraOS Security Team',
    ].join('\n'),
    category: 'system',
    channels: ['email', 'push', 'in_app'],
    priority: 'medium',
    variables: ['userName', 'daysRemaining', 'expiryDate', 'changePasswordLink', 'minLength', 'historyCount'],
  },
  {
    key: 'system.session_timeout',
    name: 'Session Timeout Warning',
    subject: 'Your AuraOS Session is About to Expire',
    body: [
      'Your AuraOS session will expire in {{minutesRemaining}} minutes due to inactivity.',
      '',
      'Click the link below to extend your session:',
      '{{extendSessionLink}}',
      '',
      'If you did not initiate this session, please contact IT Security immediately.',
      '',
      'AuraOS Security',
    ].join('\n'),
    category: 'system',
    channels: ['push', 'in_app'],
    priority: 'medium',
    variables: ['minutesRemaining', 'extendSessionLink'],
  },
];

// ---------------------------------------------------------------------------
// Aggregated templates
// ---------------------------------------------------------------------------

export const notificationTemplates: NotificationTemplateDef[] = [
  ...leaveTemplates,
  ...payrollTemplates,
  ...attendanceTemplates,
  ...hrMilestoneTemplates,
  ...complianceTemplates,
  ...systemTemplates,
];

/**
 * Seed notification templates into the NotificationTemplate model.
 * Uses a deterministic id derived from the template key for idempotency.
 * Idempotent — safe to run multiple times.
 */
export async function seedNotificationTemplates(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding notification templates...');
  let count = 0;

  // Use SYSTEM as tenant for global/default templates
  const SYSTEM_TENANT = 'SYSTEM';

  for (const template of notificationTemplates) {
    const id = keyToId(template.key);
    const category = template.key.split('.')[0] ?? 'system';

    // Seed one record per channel for proper per-channel filtering
    for (const channel of template.channels) {
      const channelKey = `${template.key}:${channel}`;
      const channelId = keyToId(channelKey);

      await prisma.notificationTemplate.upsert({
        where: { id: channelId },
        update: {
          name: `${template.name} (${channel.toUpperCase()})`,
          subject: template.subject,
          body: template.body,
          type: channel,
          category,
          variables: template.variables as unknown as never,
          isActive: true,
        },
        create: {
          id: channelId,
          tenantId: SYSTEM_TENANT,
          name: `${template.name} (${channel.toUpperCase()})`,
          subject: template.subject,
          body: template.body,
          type: channel,
          category,
          variables: template.variables as unknown as never,
          isActive: true,
          createdBy: 'system',
        },
      });
      count++;
    }

    // Also store the master template as a system setting (for runtime resolution)
    const settingKey = `notification_template.${template.key}`;
    await prisma.systemSetting.upsert({
      where: { key: settingKey },
      update: { value: JSON.stringify(template) },
      create: {
        key: settingKey,
        value: JSON.stringify(template),
        group: 'notification_templates',
        description: `Notification template: ${template.name} — channels: ${template.channels.join(', ')}`,
      },
    });
  }

  console.log(`  ✓ Notification templates: ${notificationTemplates.length} templates (${count} channel records) seeded`);
}

// Legacy named export for backward compatibility
export { seedNotificationTemplates as seed };

// Re-export legacy arrays for files that depend on them
export const pushNotificationTemplates = notificationTemplates.filter(t =>
  t.channels.includes('push')
);
export const smsTemplates = notificationTemplates.filter(t =>
  t.channels.includes('sms')
);
export const inAppNotificationTemplates = notificationTemplates.filter(t =>
  t.channels.includes('in_app')
);
