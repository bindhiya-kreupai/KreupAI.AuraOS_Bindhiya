import { PrismaClient } from '@prisma/client';

export interface DocumentTemplate {
  name: string;
  type: string;
  jurisdiction: string;
  placeholders: string[];
  template: string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    name: 'Offer Letter - US',
    type: 'offer_letter',
    jurisdiction: 'US',
    placeholders: [
      'candidateName', 'position', 'department', 'startDate',
      'salary', 'bonus', 'managerName', 'companyName', 'benefits',
      'stockOptions', 'signingBonus', 'responseDeadline',
    ],
    template: `# Offer of Employment

Dear {{candidateName}},

We are pleased to offer you the position of **{{position}}** in the **{{department}}** department at **{{companyName}}**.

## Compensation
- **Base Salary:** \${{salary}} per year
- **Annual Bonus Target:** {{bonus}}%
- **Signing Bonus:** \${{signingBonus}}
- **Stock Options:** {{stockOptions}}

## Start Date
Your anticipated start date is **{{startDate}}**.

## Benefits
{{benefits}}

## Reporting
You will report to **{{managerName}}**.

## At-Will Employment
This offer does not constitute a contract of employment for any specific duration.

Please respond by **{{responseDeadline}}**.

Sincerely,
{{companyName}} HR Team`,
  },
  {
    name: 'Offer Letter - India',
    type: 'offer_letter',
    jurisdiction: 'IN',
    placeholders: [
      'candidateName', 'position', 'department', 'startDate',
      'ctc', 'basicSalary', 'hra', 'specialAllowance',
      'pf', 'gratuity', 'managerName', 'companyName',
      'probationPeriod', 'noticePeriod', 'location',
    ],
    template: `# Offer of Employment

Dear {{candidateName}},

We are pleased to offer you the position of **{{position}}** in the **{{department}}** department at **{{companyName}}**, {{location}}.

## Compensation (Annual)
- **Cost to Company (CTC):** INR {{ctc}}
- **Basic Salary:** INR {{basicSalary}}
- **HRA:** INR {{hra}}
- **Special Allowance:** INR {{specialAllowance}}
- **Employer PF Contribution:** INR {{pf}}
- **Gratuity:** INR {{gratuity}}

## Terms
- **Start Date:** {{startDate}}
- **Probation Period:** {{probationPeriod}} months
- **Notice Period:** {{noticePeriod}} months
- **Reporting Manager:** {{managerName}}

Please sign and return this letter to confirm your acceptance.

Regards,
{{companyName}} HR Department`,
  },
  {
    name: 'Offer Letter - UK',
    type: 'offer_letter',
    jurisdiction: 'UK',
    placeholders: [
      'candidateName', 'position', 'department', 'startDate',
      'salary', 'pensionContribution', 'annualLeave',
      'managerName', 'companyName', 'noticePeriod', 'location',
    ],
    template: `# Offer of Employment

Dear {{candidateName}},

We are delighted to offer you the role of **{{position}}** within the **{{department}}** team at **{{companyName}}**, based in {{location}}.

## Remuneration
- **Annual Salary:** GBP {{salary}}
- **Pension Contribution:** {{pensionContribution}}%
- **Annual Leave:** {{annualLeave}} days (plus bank holidays)

## Terms
- **Start Date:** {{startDate}}
- **Notice Period:** {{noticePeriod}} months
- **Line Manager:** {{managerName}}

This offer is subject to satisfactory references and right-to-work verification.

Kind regards,
{{companyName}} People Team`,
  },
  {
    name: 'Employment Contract - Permanent',
    type: 'employment_contract',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'department', 'startDate',
      'salary', 'currency', 'workingHours', 'noticePeriod',
      'annualLeave', 'companyName', 'location', 'managerName',
      'benefits', 'confidentialityClause', 'nonCompeteClause',
    ],
    template: `# Employment Contract

## Parties
This contract is between **{{companyName}}** (the Employer) and **{{employeeName}}** (the Employee).

## Position and Duties
- **Job Title:** {{position}}
- **Department:** {{department}}
- **Location:** {{location}}
- **Reporting To:** {{managerName}}

## Commencement
Employment begins on **{{startDate}}** and continues indefinitely.

## Remuneration
- **Salary:** {{currency}} {{salary}} per annum, paid monthly
- **Benefits:** {{benefits}}

## Working Hours
Standard working hours are {{workingHours}} per week.

## Leave
Annual leave entitlement: {{annualLeave}} days per calendar year.

## Notice Period
Either party may terminate with {{noticePeriod}} written notice.

## Confidentiality
{{confidentialityClause}}

## Non-Compete
{{nonCompeteClause}}

## Governing Law
This contract is governed by the laws of the applicable jurisdiction.`,
  },
  {
    name: 'Employment Contract - Fixed Term',
    type: 'employment_contract',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'department', 'startDate',
      'endDate', 'salary', 'currency', 'companyName',
      'renewalTerms', 'earlyTerminationClause',
    ],
    template: `# Fixed-Term Employment Contract

## Parties
This contract is between **{{companyName}}** (the Employer) and **{{employeeName}}** (the Employee).

## Position
- **Job Title:** {{position}}
- **Department:** {{department}}

## Term
- **Start Date:** {{startDate}}
- **End Date:** {{endDate}}

## Remuneration
{{currency}} {{salary}} per annum.

## Renewal
{{renewalTerms}}

## Early Termination
{{earlyTerminationClause}}

This contract expires automatically on the end date unless renewed in writing.`,
  },
  {
    name: 'Non-Disclosure Agreement',
    type: 'nda',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'partyName', 'companyName', 'effectiveDate',
      'duration', 'confidentialInfoDefinition',
      'returnObligations', 'jurisdiction',
    ],
    template: `# Non-Disclosure Agreement

**Effective Date:** {{effectiveDate}}

## Parties
- **Disclosing Party:** {{companyName}}
- **Receiving Party:** {{partyName}}

## Confidential Information
{{confidentialInfoDefinition}}

## Obligations
The Receiving Party agrees to:
1. Maintain strict confidentiality
2. Use information solely for authorized purposes
3. Not disclose to third parties without written consent
4. Return all materials upon request

## Duration
This agreement remains in effect for **{{duration}}** from the effective date.

## Return of Materials
{{returnObligations}}

## Governing Law
This agreement is governed by the laws of {{jurisdiction}}.`,
  },
  {
    name: 'Non-Compete Agreement',
    type: 'non_compete',
    jurisdiction: 'US',
    placeholders: [
      'employeeName', 'companyName', 'effectiveDate',
      'restrictionPeriod', 'geographicScope',
      'restrictedActivities', 'consideration',
    ],
    template: `# Non-Compete Agreement

## Parties
- **Company:** {{companyName}}
- **Employee:** {{employeeName}}
- **Effective Date:** {{effectiveDate}}

## Restriction Period
{{restrictionPeriod}} following termination of employment.

## Geographic Scope
{{geographicScope}}

## Restricted Activities
{{restrictedActivities}}

## Consideration
In exchange for these restrictions, the Employee receives: {{consideration}}

## Enforceability
If any provision is found unenforceable, the remainder shall continue in effect.`,
  },
  {
    name: 'Termination Letter - Voluntary',
    type: 'termination_letter',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'lastWorkingDay',
      'resignationDate', 'companyName', 'exitInterviewDate',
      'fnfDate', 'assetReturnInstructions',
    ],
    template: `# Acceptance of Resignation

Dear {{employeeName}},

This letter confirms our acceptance of your resignation from the position of **{{position}}** at **{{companyName}}**, submitted on {{resignationDate}}.

## Last Working Day
Your last day of employment will be **{{lastWorkingDay}}**.

## Exit Process
- **Exit Interview:** {{exitInterviewDate}}
- **Asset Return:** {{assetReturnInstructions}}
- **Final Settlement:** Processed by {{fnfDate}}

We wish you the very best in your future endeavors.

Regards,
Human Resources`,
  },
  {
    name: 'Termination Letter - Involuntary',
    type: 'termination_letter',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'terminationDate',
      'reason', 'severanceDetails', 'companyName',
      'cobraInfo', 'assetReturnInstructions', 'fnfDate',
    ],
    template: `# Notice of Termination

Dear {{employeeName}},

This letter serves as formal notification that your employment as **{{position}}** at **{{companyName}}** is terminated effective **{{terminationDate}}**.

## Reason
{{reason}}

## Severance
{{severanceDetails}}

## Benefits Continuation
{{cobraInfo}}

## Final Settlement
Your final paycheck including accrued PTO will be processed by {{fnfDate}}.

## Company Property
{{assetReturnInstructions}}

Human Resources Department`,
  },
  {
    name: 'Experience Letter',
    type: 'experience_letter',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'department',
      'startDate', 'endDate', 'companyName',
      'responsibilities', 'performance',
    ],
    template: `# Experience Certificate

**To Whom It May Concern**

This is to certify that **{{employeeName}}** was employed with **{{companyName}}** as **{{position}}** in the **{{department}}** department from **{{startDate}}** to **{{endDate}}**.

## Responsibilities
{{responsibilities}}

## Performance
{{performance}}

We wish them continued success in their career.

Authorized Signatory
{{companyName}}`,
  },
  {
    name: 'Policy Acknowledgment Form',
    type: 'policy_acknowledgment',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'employeeId', 'policyName',
      'policyVersion', 'effectiveDate', 'companyName',
      'policyDescription', 'keyPoints', 'acknowledgmentDate',
    ],
    template: `# Policy Acknowledgment Form

## Company
**{{companyName}}**

## Policy Details
- **Policy Name:** {{policyName}}
- **Version:** {{policyVersion}}
- **Effective Date:** {{effectiveDate}}

## Description
{{policyDescription}}

## Key Points
{{keyPoints}}

## Acknowledgment

I, **{{employeeName}}** (Employee ID: {{employeeId}}), hereby acknowledge that:

1. I have received and read the above-referenced policy
2. I understand the contents and requirements of this policy
3. I agree to comply with the guidelines set forth in this policy
4. I understand that failure to comply may result in disciplinary action
5. I have had the opportunity to ask questions about this policy

**Employee Signature:** _________________________

**Date:** {{acknowledgmentDate}}

**Employee Name:** {{employeeName}}

**Employee ID:** {{employeeId}}

---
*This form will be maintained in the employee's personnel file.*`,
  },
  {
    name: 'Probation Confirmation',
    type: 'probation_confirmation',
    jurisdiction: 'GLOBAL',
    placeholders: [
      'employeeName', 'position', 'probationEndDate',
      'confirmationDate', 'revisedSalary', 'currency',
      'companyName', 'managerName',
    ],
    template: `# Probation Completion & Confirmation

Dear {{employeeName}},

We are pleased to confirm that you have successfully completed your probation period as **{{position}}** ending on **{{probationEndDate}}**.

## Confirmation Details
- **Confirmation Date:** {{confirmationDate}}
- **Revised Compensation:** {{currency}} {{revisedSalary}} per annum
- **Reporting Manager:** {{managerName}}

You are now a confirmed employee of **{{companyName}}**. All terms of your employment contract continue to apply.

Congratulations!

HR Department`,
  },
];

export async function seed(prisma: PrismaClient): Promise<void> {
  console.log('Seeding document templates...');

  for (const doc of documentTemplates) {
    await prisma.documentTemplate.upsert({
      where: {
        name_jurisdiction: { name: doc.name, jurisdiction: doc.jurisdiction },
      },
      update: {
        type: doc.type,
        placeholders: JSON.stringify(doc.placeholders),
        template: doc.template,
      },
      create: {
        name: doc.name,
        type: doc.type,
        jurisdiction: doc.jurisdiction,
        placeholders: JSON.stringify(doc.placeholders),
        template: doc.template,
      },
    });
  }

  console.log(`Seeded ${documentTemplates.length} document templates.`);
}
