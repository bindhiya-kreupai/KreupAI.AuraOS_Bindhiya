import { PrismaClient } from '@prisma/client';

export interface EmailTemplate {
  slug: string;
  subject: string;
  body: string;
  category: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    slug: 'welcome-new-hire',
    subject: 'Welcome to {{companyName}}, {{firstName}}!',
    body: `Dear {{firstName}},

Welcome to **{{companyName}}**! We are thrilled to have you join our team as **{{position}}** in the **{{department}}** department.

Your start date is **{{startDate}}**, and your manager **{{managerName}}** is looking forward to meeting you.

## Before Your First Day
- Complete your pre-boarding paperwork: {{preBoardingLink}}
- Review our employee handbook: {{handbookLink}}
- Set up your accounts using the credentials sent separately

## What to Expect on Day 1
- Arrive at {{officeLocation}} by {{arrivalTime}}
- Bring a valid photo ID for verification
- Your buddy **{{buddyName}}** will greet you

If you have any questions, reach out to {{hrContactEmail}}.

Best regards,
{{companyName}} People Team`,
    category: 'onboarding',
  },
  {
    slug: 'onboarding-day-1',
    subject: 'Day 1 Checklist - {{firstName}}',
    body: `Hi {{firstName}},

Congratulations on your first day at {{companyName}}! Here is your Day 1 checklist:

## Morning
- [ ] Check in at reception and collect your ID badge
- [ ] Meet your manager {{managerName}} at {{meetingTime}}
- [ ] Complete IT setup with {{itContactName}}
- [ ] Tour of the office with your buddy {{buddyName}}

## Afternoon
- [ ] Attend orientation session at {{orientationTime}}
- [ ] Complete mandatory compliance training
- [ ] Set up direct deposit: {{payrollLink}}
- [ ] Enroll in benefits: {{benefitsLink}}

## Tools & Access
- Email: {{workEmail}}
- Slack workspace: {{slackLink}}
- HR Portal: {{hrPortalLink}}
- VPN Setup: {{vpnGuideLink}}

Your first week schedule is attached. Do not hesitate to ask questions!

Cheers,
{{companyName}} HR`,
    category: 'onboarding',
  },
  {
    slug: 'onboarding-week-1-checklist',
    subject: 'Week 1 Checklist - How\'s it going, {{firstName}}?',
    body: `Hi {{firstName}},

You have completed your first week at **{{companyName}}**! Here is your Week 1 checklist to make sure everything is on track:

## Completed This Week
- [ ] All Day 1 tasks completed
- [ ] IT equipment set up and working
- [ ] Access to all required systems confirmed
- [ ] Met key team members and stakeholders
- [ ] Attended all scheduled orientation sessions

## This Week's Goals
- [ ] Complete all mandatory compliance trainings: {{complianceTrainingLink}}
- [ ] Review team documentation and processes
- [ ] Set up 1:1 recurring meeting with {{managerName}}
- [ ] Familiarize yourself with current projects
- [ ] Complete your profile in the HR portal: {{profileLink}}

## Key Contacts
- Manager: {{managerName}} ({{managerEmail}})
- Buddy: {{buddyName}} ({{buddyEmail}})
- HR: {{hrContactName}} ({{hrEmail}})
- IT Support: {{itSupportEmail}}

## Feedback
How was your first week? Share your thoughts: {{feedbackLink}}

We are glad to have you on the team!
{{companyName}} People Team`,
    category: 'onboarding',
  },
  {
    slug: 'leave-request-notification',
    subject: 'Leave Request from {{employeeName}} - {{leaveType}}',
    body: `Hi {{approverName}},

**{{employeeName}}** has submitted a leave request that requires your approval.

## Leave Details
- **Type:** {{leaveType}}
- **From:** {{startDate}}
- **To:** {{endDate}}
- **Duration:** {{duration}} day(s)
- **Reason:** {{reason}}

## Team Impact
- Current team availability: {{teamAvailability}}
- Pending deliverables: {{pendingItems}}

Please review and take action:
- Approve: {{approveLink}}
- Reject: {{rejectLink}}

This request will auto-escalate if not actioned within {{escalationHours}} hours.

Regards,
HR System`,
    category: 'leave',
  },
  {
    slug: 'leave-approved',
    subject: 'Leave Approved: {{leaveType}} ({{startDate}} - {{endDate}})',
    body: `Hi {{employeeName}},

Your leave request has been **approved** by {{approverName}}.

## Details
- **Type:** {{leaveType}}
- **From:** {{startDate}}
- **To:** {{endDate}}
- **Duration:** {{duration}} day(s)

## Remaining Balances
- Annual Leave: {{annualLeaveBalance}} days
- Sick Leave: {{sickLeaveBalance}} days
- Personal Leave: {{personalLeaveBalance}} days

Please ensure your responsibilities are covered. Your out-of-office delegate is {{delegateName}}.

Enjoy your time off!
HR System`,
    category: 'leave',
  },
  {
    slug: 'leave-rejected',
    subject: 'Leave Request Update: Not Approved',
    body: `Hi {{employeeName}},

Unfortunately, your leave request has not been approved.

## Request Details
- **Type:** {{leaveType}}
- **From:** {{startDate}}
- **To:** {{endDate}}

## Reason for Rejection
{{rejectionReason}}

## Next Steps
- Discuss alternative dates with your manager {{managerName}}
- Submit a new request: {{leavePortalLink}}
- Contact HR if you have questions: {{hrEmail}}

Regards,
HR System`,
    category: 'leave',
  },
  {
    slug: 'performance-review-initiation',
    subject: 'Performance Review Cycle Started: {{reviewPeriod}}',
    body: `Hi {{employeeName}},

The **{{reviewPeriod}}** performance review cycle has been initiated.

## Timeline
- **Self-Assessment Due:** {{selfAssessmentDeadline}}
- **Manager Review Due:** {{managerReviewDeadline}}
- **Calibration:** {{calibrationDate}}
- **Feedback Meetings:** {{feedbackPeriod}}

## Your Tasks
1. Complete your self-assessment: {{selfAssessmentLink}}
2. Review your goals from the last period
3. Document key achievements and challenges
4. Identify development areas and career aspirations
5. Gather any supporting evidence or metrics

## Review Criteria
{{reviewCriteria}}

## Tips for a Great Self-Assessment
- Be specific with examples and data
- Highlight impact, not just activities
- Be honest about challenges faced
- Propose actionable development goals

Start your self-assessment: {{selfAssessmentLink}}

If you have questions about the process, contact {{hrEmail}}.

People Operations Team`,
    category: 'performance',
  },
  {
    slug: 'performance-review-reminder',
    subject: 'Performance Review Due: {{reviewPeriod}}',
    body: `Hi {{managerName}},

This is a reminder that performance reviews for the **{{reviewPeriod}}** cycle are due by **{{dueDate}}**.

## Pending Reviews
{{pendingReviewsList}}

## Review Checklist
- [ ] Review employee self-assessments
- [ ] Complete competency ratings
- [ ] Document key achievements and areas for improvement
- [ ] Set goals for the next period
- [ ] Schedule 1:1 feedback meetings

Access the review portal: {{reviewPortalLink}}

**{{completedCount}}/{{totalCount}}** reviews in your team are complete.

Please complete all reviews by the deadline to ensure timely processing.

Thank you,
People Operations`,
    category: 'performance',
  },
  {
    slug: 'recognition-received',
    subject: 'You received recognition from {{senderName}}!',
    body: `Hi {{recipientName}},

Great news! **{{senderName}}** has recognized you for your outstanding work.

## Recognition Details
- **Category:** {{recognitionCategory}}
- **Value:** {{companyValue}}
- **Points Awarded:** {{points}}

## Message from {{senderName}}
"{{personalMessage}}"

{{#if rewardAmount}}
You have also received a reward of {{currency}}{{rewardAmount}}!
{{/if}}

Your total recognition points: {{totalPoints}}
Redeem rewards: {{rewardsLink}}

Keep up the amazing work!
{{companyName}} Team`,
    category: 'recognition',
  },
  {
    slug: 'birthday-greeting',
    subject: 'Happy Birthday, {{firstName}}! 🎂',
    body: `Dear {{firstName}},

Wishing you a very **Happy Birthday** from everyone at {{companyName}}!

We hope you have a wonderful day filled with joy and celebration.

{{#if birthdayPolicy}}
As part of our birthday policy, you are entitled to:
- {{birthdayBenefit}}
{{/if}}

Best wishes from your team in {{department}}!

Warm regards,
{{companyName}} Team`,
    category: 'engagement',
  },
  {
    slug: 'payroll-processed',
    subject: 'Payslip Available - {{payPeriod}}',
    body: `Hi {{employeeName}},

Your payroll for **{{payPeriod}}** has been processed.

## Summary
- **Gross Pay:** {{currency}}{{grossPay}}
- **Total Deductions:** {{currency}}{{totalDeductions}}
- **Net Pay:** {{currency}}{{netPay}}
- **Payment Date:** {{paymentDate}}
- **Payment Method:** {{paymentMethod}}

## Deductions Breakdown
- Tax: {{currency}}{{taxAmount}}
- Social Security/PF: {{currency}}{{socialSecurity}}
- Health Insurance: {{currency}}{{healthInsurance}}
- Other: {{currency}}{{otherDeductions}}

View your detailed payslip: {{payslipLink}}

If you have questions about your pay, contact {{payrollEmail}}.

Regards,
Payroll Department`,
    category: 'payroll',
  },
  {
    slug: 'password-reset',
    subject: 'Password Reset Request - {{appName}}',
    body: `Hi {{userName}},

We received a request to reset your password for {{appName}}.

Click the link below to set a new password:
{{resetLink}}

This link expires in **{{expiryMinutes}} minutes**.

If you did not request this reset, please:
1. Ignore this email
2. Report it to {{securityEmail}}
3. Ensure your account is secure

For security, never share this link with anyone.

{{appName}} Security Team`,
    category: 'security',
  },
  {
    slug: 'account-locked',
    subject: 'Security Alert: Your Account Has Been Locked',
    body: `Hi {{userName}},

Your account on **{{appName}}** has been **locked** due to multiple failed login attempts.

## Details
- **Time:** {{lockTime}}
- **Failed Attempts:** {{failedAttempts}}
- **IP Address:** {{ipAddress}}
- **Location:** {{location}}

## What To Do
1. If this was you: Wait {{lockoutDuration}} minutes and try again, or reset your password: {{resetLink}}
2. If this was NOT you: Your account may be compromised. Please:
   - Reset your password immediately: {{resetLink}}
   - Enable two-factor authentication
   - Report this to security: {{securityEmail}}

## Unlock Your Account
If you need immediate access, contact your IT administrator or call {{supportPhone}}.

Your account will automatically unlock after {{lockoutDuration}} minutes.

{{appName}} Security Team`,
    category: 'security',
  },
  {
    slug: 'document-expiry-warning',
    subject: 'Document Expiring Soon: {{documentName}}',
    body: `Hi {{employeeName}},

This is a reminder that the following document is expiring soon:

## Document Details
- **Document:** {{documentName}}
- **Type:** {{documentType}}
- **Expiry Date:** {{expiryDate}}
- **Days Remaining:** {{daysRemaining}}

## Action Required
Please upload a renewed version of this document before the expiry date to avoid any compliance issues.

Upload here: {{uploadLink}}

## Impact if Not Renewed
{{complianceImpact}}

## Documents Expiring Soon
{{#each expiringDocuments}}
- {{documentName}}: expires {{expiryDate}}
{{/each}}

If you need assistance, contact HR at {{hrEmail}}.

Regards,
HR Compliance Team`,
    category: 'compliance',
  },
  {
    slug: 'benefits-enrollment-reminder',
    subject: 'Action Required: Benefits Enrollment Closes {{deadline}}',
    body: `Hi {{employeeName}},

This is a reminder that the **{{enrollmentPeriod}}** benefits enrollment window closes on **{{deadline}}**.

## Available Plans
{{#each plans}}
- **{{planName}}**: {{planDescription}} ({{currency}}{{monthlyCost}}/month)
{{/each}}

## Your Current Elections
{{currentElections}}

## Important Notes
- Changes take effect {{effectiveDate}}
- Failing to enroll means {{defaultAction}}
- Life events can trigger special enrollment

Enroll now: {{enrollmentLink}}

Questions? Contact {{benefitsEmail}} or call {{benefitsPhone}}.

HR Benefits Team`,
    category: 'benefits',
  },
];

/**
 * NOTE: EmailTemplate is not a dedicated Prisma model.
 * Templates are stored in SystemSetting under the `email_templates` group
 * until an EmailTemplate model is added to the schema.
 */
export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding email templates...');

  for (const template of emailTemplates) {
    const key = `email_template.${template.slug}`;
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(template) },
      create: {
        key,
        value: JSON.stringify(template),
        group: 'email_templates',
        description: `Email template: ${template.subject}`,
      },
    });
  }

  console.log(`Seeded ${emailTemplates.length} email templates.`);
}
