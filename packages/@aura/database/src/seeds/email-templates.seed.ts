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

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding email templates...');

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {
        subject: template.subject,
        body: template.body,
        category: template.category,
      },
      create: {
        slug: template.slug,
        subject: template.subject,
        body: template.body,
        category: template.category,
      },
    });
  }

  console.log(`Seeded ${emailTemplates.length} email templates.`);
}
