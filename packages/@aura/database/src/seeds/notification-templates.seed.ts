import { PrismaClient } from '@prisma/client';

export interface NotificationTemplate {
  channel: string;
  event: string;
  title: string;
  body: string;
  variables: string[];
}

export const pushNotificationTemplates: NotificationTemplate[] = [
  {
    channel: 'push',
    event: 'leave.approved',
    title: 'Leave Approved',
    body: 'Your {{leaveType}} leave from {{startDate}} to {{endDate}} has been approved by {{approverName}}.',
    variables: ['leaveType', 'startDate', 'endDate', 'approverName'],
  },
  {
    channel: 'push',
    event: 'leave.rejected',
    title: 'Leave Not Approved',
    body: 'Your {{leaveType}} leave request for {{startDate}} - {{endDate}} was not approved. Reason: {{reason}}',
    variables: ['leaveType', 'startDate', 'endDate', 'reason'],
  },
  {
    channel: 'push',
    event: 'attendance.clockin_reminder',
    title: 'Clock-In Reminder',
    body: 'Good morning, {{firstName}}! Remember to clock in for your shift starting at {{shiftTime}}.',
    variables: ['firstName', 'shiftTime'],
  },
  {
    channel: 'push',
    event: 'payroll.processed',
    title: 'Salary Credited',
    body: 'Your salary of {{currency}}{{amount}} for {{payPeriod}} has been credited to your account.',
    variables: ['currency', 'amount', 'payPeriod'],
  },
  {
    channel: 'push',
    event: 'task.assigned',
    title: 'New Task Assigned',
    body: '{{assignerName}} assigned you a new task: "{{taskTitle}}". Due by {{dueDate}}.',
    variables: ['assignerName', 'taskTitle', 'dueDate'],
  },
  {
    channel: 'push',
    event: 'recognition.received',
    title: 'You Got Recognized!',
    body: '{{senderName}} recognized you for {{category}}: "{{message}}"',
    variables: ['senderName', 'category', 'message'],
  },
  {
    channel: 'push',
    event: 'meeting.reminder',
    title: 'Meeting in {{minutes}} min',
    body: '"{{meetingTitle}}" starts in {{minutes}} minutes. {{location}}',
    variables: ['meetingTitle', 'minutes', 'location'],
  },
  {
    channel: 'push',
    event: 'expense.approved',
    title: 'Expense Approved',
    body: 'Your expense claim of {{currency}}{{amount}} for "{{description}}" has been approved.',
    variables: ['currency', 'amount', 'description'],
  },
  {
    channel: 'push',
    event: 'document.requires_signature',
    title: 'Document Awaiting Signature',
    body: '"{{documentName}}" requires your signature. Submitted by {{senderName}}.',
    variables: ['documentName', 'senderName'],
  },
  {
    channel: 'push',
    event: 'training.due',
    title: 'Training Due Soon',
    body: 'Mandatory training "{{courseName}}" is due by {{dueDate}}. {{progress}}% complete.',
    variables: ['courseName', 'dueDate', 'progress'],
  },
];

export const smsTemplates: NotificationTemplate[] = [
  {
    channel: 'sms',
    event: 'otp.verification',
    title: 'OTP Verification',
    body: '{{otp}} is your {{appName}} verification code. Valid for {{expiryMinutes}} minutes. Do not share this code.',
    variables: ['otp', 'appName', 'expiryMinutes'],
  },
  {
    channel: 'sms',
    event: 'attendance.absent',
    title: 'Absence Alert',
    body: 'Hi {{firstName}}, you have not clocked in today at {{companyName}}. Please contact your manager if you are unable to attend.',
    variables: ['firstName', 'companyName'],
  },
  {
    channel: 'sms',
    event: 'emergency.alert',
    title: 'Emergency Alert',
    body: 'URGENT from {{companyName}}: {{alertMessage}}. {{actionRequired}}',
    variables: ['companyName', 'alertMessage', 'actionRequired'],
  },
  {
    channel: 'sms',
    event: 'shift.change',
    title: 'Shift Change',
    body: 'Hi {{firstName}}, your shift on {{date}} has been changed to {{newShiftTime}}. Reply CONFIRM to acknowledge.',
    variables: ['firstName', 'date', 'newShiftTime'],
  },
  {
    channel: 'sms',
    event: 'payroll.credited',
    title: 'Salary Credit',
    body: '{{companyName}}: Your salary of {{currency}}{{amount}} for {{period}} has been credited to your account ending {{accountLast4}}.',
    variables: ['companyName', 'currency', 'amount', 'period', 'accountLast4'],
  },
];

export const inAppNotificationTemplates: NotificationTemplate[] = [
  {
    channel: 'in_app',
    event: 'onboarding.welcome',
    title: 'Welcome to {{companyName}}!',
    body: 'We are excited to have you on board, {{firstName}}! Start by completing your profile and reviewing your onboarding tasks.',
    variables: ['companyName', 'firstName'],
  },
  {
    channel: 'in_app',
    event: 'onboarding.task_complete',
    title: 'Onboarding Progress',
    body: 'Great job! You have completed {{completedCount}} of {{totalCount}} onboarding tasks. {{nextTask}} is next.',
    variables: ['completedCount', 'totalCount', 'nextTask'],
  },
  {
    channel: 'in_app',
    event: 'leave.balance_low',
    title: 'Low Leave Balance',
    body: 'Your {{leaveType}} balance is {{remainingDays}} day(s). Consider planning ahead for the rest of the year.',
    variables: ['leaveType', 'remainingDays'],
  },
  {
    channel: 'in_app',
    event: 'performance.goal_due',
    title: 'Goal Check-In Due',
    body: 'Your goal "{{goalTitle}}" is due for a progress update. Current status: {{currentStatus}}.',
    variables: ['goalTitle', 'currentStatus'],
  },
  {
    channel: 'in_app',
    event: 'performance.review_available',
    title: 'Performance Review Available',
    body: 'Your {{reviewPeriod}} performance review is ready. Your overall rating: {{rating}}/5.',
    variables: ['reviewPeriod', 'rating'],
  },
  {
    channel: 'in_app',
    event: 'team.member_joined',
    title: 'New Team Member',
    body: '{{newMemberName}} has joined the {{teamName}} team as {{position}}. Give them a warm welcome!',
    variables: ['newMemberName', 'teamName', 'position'],
  },
  {
    channel: 'in_app',
    event: 'team.member_leaving',
    title: 'Team Update',
    body: '{{memberName}} will be leaving the {{teamName}} team on {{lastDay}}. Knowledge transfer is in progress.',
    variables: ['memberName', 'teamName', 'lastDay'],
  },
  {
    channel: 'in_app',
    event: 'policy.updated',
    title: 'Policy Update',
    body: 'The "{{policyName}}" policy has been updated. Key change: {{changeSummary}}. Please review and acknowledge.',
    variables: ['policyName', 'changeSummary'],
  },
  {
    channel: 'in_app',
    event: 'benefits.enrollment_open',
    title: 'Open Enrollment Started',
    body: 'The {{enrollmentPeriod}} benefits enrollment is now open. Deadline: {{deadline}}. Review your options.',
    variables: ['enrollmentPeriod', 'deadline'],
  },
  {
    channel: 'in_app',
    event: 'expense.reimbursed',
    title: 'Expense Reimbursed',
    body: 'Your expense claim "{{description}}" of {{currency}}{{amount}} has been reimbursed to your account.',
    variables: ['description', 'currency', 'amount'],
  },
  {
    channel: 'in_app',
    event: 'training.completed',
    title: 'Course Completed',
    body: 'Congratulations! You have completed "{{courseName}}" with a score of {{score}}%. Certificate available.',
    variables: ['courseName', 'score'],
  },
  {
    channel: 'in_app',
    event: 'announcement.company',
    title: '{{announcementTitle}}',
    body: '{{announcementPreview}} - from {{authorName}}, {{authorRole}}',
    variables: ['announcementTitle', 'announcementPreview', 'authorName', 'authorRole'],
  },
  {
    channel: 'in_app',
    event: 'birthday.colleague',
    title: 'Birthday Today!',
    body: 'It is {{colleagueName}} from {{department}} birthday today! Send them your wishes.',
    variables: ['colleagueName', 'department'],
  },
  {
    channel: 'in_app',
    event: 'anniversary.work',
    title: 'Work Anniversary',
    body: 'Congratulations, {{firstName}}! Today marks your {{years}}-year anniversary at {{companyName}}.',
    variables: ['firstName', 'years', 'companyName'],
  },
  {
    channel: 'in_app',
    event: 'approval.pending',
    title: 'Pending Approval',
    body: 'You have {{count}} pending approval(s): {{summary}}. Oldest request is {{oldestDays}} day(s) old.',
    variables: ['count', 'summary', 'oldestDays'],
  },
];

export const notificationTemplates: NotificationTemplate[] = [
  ...pushNotificationTemplates,
  ...smsTemplates,
  ...inAppNotificationTemplates,
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding notification templates...');

  for (const template of notificationTemplates) {
    const key = `${template.channel}_${template.event}`;
    await prisma.notificationTemplate.upsert({
      where: { key },
      update: {
        channel: template.channel,
        event: template.event,
        title: template.title,
        body: template.body,
        variables: JSON.stringify(template.variables),
      },
      create: {
        key,
        channel: template.channel,
        event: template.event,
        title: template.title,
        body: template.body,
        variables: JSON.stringify(template.variables),
      },
    });
  }

  console.log(`Seeded ${notificationTemplates.length} notification templates (${pushNotificationTemplates.length} push, ${smsTemplates.length} SMS, ${inAppNotificationTemplates.length} in-app).`);
}
