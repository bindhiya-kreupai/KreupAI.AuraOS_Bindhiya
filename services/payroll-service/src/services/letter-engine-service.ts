/**
 * Letter Engine Service — HR Letter & Document Generation
 *
 * Generates HR letters from configurable templates with dynamic variable substitution.
 * Supports GCC (UAE, KSA), India, UK, and US legal formats.
 *
 * Templates Supported:
 *  - Offer Letter (salary breakdown, probation, benefits summary)
 *  - Employment Contract (UAE Labour Law / KSA Labour Law / India format)
 *  - Salary Certificate (for bank/visa purposes)
 *  - Experience Letter (on separation)
 *  - Salary Increment Letter
 *  - Promotion Letter
 *  - Warning Letter (1st warning, 2nd warning, final warning)
 *  - Termination Letter
 *  - NOC — No Objection Certificate (GCC-specific)
 *  - Probation Confirmation
 *
 * Variables format: {{variable.path}} — e.g. {{employee.name}}, {{company.name}}
 *
 * Legal References:
 *  UAE: Federal Decree-Law No. 33 of 2021 (UAE Labour Law)
 *  KSA: Saudi Labour Law Royal Decree M/51 (2005) as amended
 *  India: Industrial Employment (Standing Orders) Act 1946, Shops & Establishments Acts
 *  US: At-will employment doctrine, WARN Act (29 USC § 2101)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type LetterCategory = 'onboarding' | 'compensation' | 'separation' | 'compliance' | 'disciplinary';
export type LetterTemplateKey =
  | 'offer_letter'
  | 'employment_contract'
  | 'salary_certificate'
  | 'experience_letter'
  | 'salary_increment'
  | 'promotion_letter'
  | 'warning_letter_1'
  | 'warning_letter_2'
  | 'warning_letter_final'
  | 'termination_letter'
  | 'noc'
  | 'probation_confirmation';

export type SupportedCountry = 'UAE' | 'KSA' | 'IND' | 'GBR' | 'USA' | 'GENERIC';
export type SupportedLanguage = 'en' | 'ar';

export interface LetterTemplate {
  id: string;
  key: LetterTemplateKey;
  category: LetterCategory;
  name: string;
  description: string;
  country: SupportedCountry;
  language: SupportedLanguage;
  version: number;
  isActive: boolean;
  isCustom: boolean;
  htmlContent: string;
  variables: TemplateVariable[];
  requiredVariables: string[];
  legalClause?: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  group: VariableGroup;
  type: 'text' | 'date' | 'currency' | 'number' | 'enum';
  description: string;
  sampleValue: string;
  required: boolean;
}

export type VariableGroup = 'employee' | 'company' | 'compensation' | 'dates' | 'position' | 'legal';

export interface GeneratedLetter {
  id: string;
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  generatedAt: string;
  generatedBy: string;
  htmlContent: string;
  status: 'draft' | 'final' | 'sent' | 'signed';
  sentAt?: string;
  signedAt?: string;
  downloadUrl?: string;
  variables: Record<string, string>;
}

export interface CreateTemplateData {
  key: LetterTemplateKey;
  category: LetterCategory;
  name: string;
  description: string;
  country: SupportedCountry;
  language: SupportedLanguage;
  htmlContent: string;
  requiredVariables: string[];
  legalClause?: string;
}

// ── Variable Definitions ───────────────────────────────────────────────────────

export const ALL_TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Employee
  { key: 'employee.name', label: 'Employee Full Name', group: 'employee', type: 'text', description: 'Employee legal full name', sampleValue: 'Ahmed Al-Mansouri', required: true },
  { key: 'employee.firstName', label: 'First Name', group: 'employee', type: 'text', description: 'Employee first name', sampleValue: 'Ahmed', required: false },
  { key: 'employee.employeeId', label: 'Employee ID', group: 'employee', type: 'text', description: 'Company employee identifier', sampleValue: 'EMP-0201', required: false },
  { key: 'employee.designation', label: 'Job Title / Designation', group: 'employee', type: 'text', description: 'Current job title', sampleValue: 'Senior Software Engineer', required: true },
  { key: 'employee.department', label: 'Department', group: 'employee', type: 'text', description: 'Department name', sampleValue: 'Technology', required: false },
  { key: 'employee.nationality', label: 'Nationality', group: 'employee', type: 'text', description: 'Employee nationality', sampleValue: 'UAE National', required: false },
  { key: 'employee.passportNumber', label: 'Passport Number', group: 'employee', type: 'text', description: 'Passport number for visa/contract', sampleValue: 'A12345678', required: false },
  { key: 'employee.email', label: 'Work Email', group: 'employee', type: 'text', description: 'Corporate email address', sampleValue: 'ahmed@kreupai.com', required: false },

  // Company
  { key: 'company.name', label: 'Company Name', group: 'company', type: 'text', description: 'Legal company name', sampleValue: 'KreupAI Technologies LLC', required: true },
  { key: 'company.address', label: 'Company Address', group: 'company', type: 'text', description: 'Registered address', sampleValue: 'Dubai Internet City, Building 17, Dubai, UAE', required: false },
  { key: 'company.tradeNo', label: 'Trade License / Reg. No.', group: 'company', type: 'text', description: 'Company registration number', sampleValue: 'UAE-LLC-2018-04512', required: false },
  { key: 'company.hrSignatory', label: 'HR Signatory Name', group: 'company', type: 'text', description: 'HR authorised signatory', sampleValue: 'Fatima Al-Rashidi', required: false },
  { key: 'company.hrTitle', label: 'HR Signatory Title', group: 'company', type: 'text', description: 'HR signatory job title', sampleValue: 'Head of Human Resources', required: false },

  // Compensation
  { key: 'compensation.basicSalary', label: 'Basic Salary', group: 'compensation', type: 'currency', description: 'Basic salary amount', sampleValue: '15,000', required: false },
  { key: 'compensation.hra', label: 'Housing Allowance (HRA)', group: 'compensation', type: 'currency', description: 'Housing / rent allowance', sampleValue: '5,000', required: false },
  { key: 'compensation.transportAllowance', label: 'Transport Allowance', group: 'compensation', type: 'currency', description: 'Transport / commute allowance', sampleValue: '2,000', required: false },
  { key: 'compensation.grossSalary', label: 'Total Gross Salary', group: 'compensation', type: 'currency', description: 'Total gross monthly salary', sampleValue: '22,000', required: false },
  { key: 'compensation.currency', label: 'Currency', group: 'compensation', type: 'text', description: 'Salary currency (AED, SAR, INR, USD, GBP)', sampleValue: 'AED', required: false },
  { key: 'compensation.newSalary', label: 'New/Revised Salary', group: 'compensation', type: 'currency', description: 'New salary after revision', sampleValue: '25,000', required: false },
  { key: 'compensation.incrementAmount', label: 'Increment Amount', group: 'compensation', type: 'currency', description: 'Salary increment value', sampleValue: '3,000', required: false },
  { key: 'compensation.incrementPercent', label: 'Increment Percentage', group: 'compensation', type: 'number', description: 'Salary increment in %', sampleValue: '13.6%', required: false },

  // Dates
  { key: 'dates.joiningDate', label: 'Date of Joining', group: 'dates', type: 'date', description: 'Employee joining date', sampleValue: '01 March 2023', required: false },
  { key: 'dates.probationEndDate', label: 'Probation End Date', group: 'dates', type: 'date', description: 'Probation period end date', sampleValue: '31 August 2023', required: false },
  { key: 'dates.effectiveDate', label: 'Effective Date', group: 'dates', type: 'date', description: 'Date letter takes effect', sampleValue: '01 April 2026', required: false },
  { key: 'dates.lastWorkingDay', label: 'Last Working Day', group: 'dates', type: 'date', description: 'Last day of employment', sampleValue: '31 March 2026', required: false },
  { key: 'dates.issueDate', label: 'Letter Issue Date', group: 'dates', type: 'date', description: 'Date letter is issued', sampleValue: '25 February 2026', required: true },
  { key: 'dates.separationDate', label: 'Date of Separation', group: 'dates', type: 'date', description: 'Employment end date', sampleValue: '31 March 2026', required: false },
  { key: 'dates.yearsOfService', label: 'Years of Service', group: 'dates', type: 'text', description: 'Total years employed', sampleValue: '3 years 2 months', required: false },

  // Position
  { key: 'position.newTitle', label: 'New Job Title', group: 'position', type: 'text', description: 'Promoted-to job title', sampleValue: 'Principal Engineer', required: false },
  { key: 'position.previousTitle', label: 'Previous Job Title', group: 'position', type: 'text', description: 'Previous job title', sampleValue: 'Senior Software Engineer', required: false },
  { key: 'position.reportingTo', label: 'Reporting Manager', group: 'position', type: 'text', description: 'Manager name', sampleValue: 'David Chen', required: false },

  // Legal
  { key: 'legal.probationDuration', label: 'Probation Duration', group: 'legal', type: 'text', description: 'Probation period length', sampleValue: '6 months', required: false },
  { key: 'legal.noticePeriod', label: 'Notice Period', group: 'legal', type: 'text', description: 'Notice period required', sampleValue: '30 days', required: false },
  { key: 'legal.warningNumber', label: 'Warning Number', group: 'legal', type: 'enum', description: '1st, 2nd, or Final warning', sampleValue: 'First', required: false },
  { key: 'legal.warningReason', label: 'Warning Reason', group: 'legal', type: 'text', description: 'Reason for disciplinary action', sampleValue: 'Repeated attendance policy violations', required: false },
  { key: 'legal.terminationReason', label: 'Termination Reason', group: 'legal', type: 'text', description: 'Reason for termination', sampleValue: 'Redundancy due to organizational restructuring', required: false },
  { key: 'legal.nocPurpose', label: 'NOC Purpose', group: 'legal', type: 'text', description: 'Reason for No Objection Certificate', sampleValue: 'Visa change of status / sponsorship transfer', required: false },
];

// ── Mock Templates ─────────────────────────────────────────────────────────────

const MOCK_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tpl-001',
    key: 'offer_letter',
    category: 'onboarding',
    name: 'Offer Letter — UAE',
    description: 'Job offer letter with salary breakdown, benefits, and probation period (UAE Labour Law compliant)',
    country: 'UAE',
    language: 'en',
    version: 3,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f; margin: 0;">{{company.name}}</h2>
    <p style="color: #666; margin: 5px 0;">{{company.address}}</p>
    <p style="color: #666; margin: 0;">Trade License: {{company.tradeNo}}</p>
  </div>
  <p style="text-align: right; color: #444;">Date: {{dates.issueDate}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #1e3a5f;">LETTER OF OFFER</h3>
  <p>We are pleased to offer you the position of <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department at {{company.name}}, effective <strong>{{dates.effectiveDate}}</strong>.</p>
  <h4>Compensation Package (Monthly)</h4>
  <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
    <tr style="background: #f0f4f8;"><td style="padding: 8px; border: 1px solid #ddd;">Basic Salary</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.basicSalary}}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;">Housing Allowance</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.hra}}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;">Transport Allowance</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.transportAllowance}}</td></tr>
    <tr style="background: #e8f0fe; font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Total Gross Salary</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.grossSalary}}</td></tr>
  </table>
  <p>You will be subject to a probation period of <strong>{{legal.probationDuration}}</strong> as per Federal Decree-Law No. 33 of 2021 (UAE Labour Law).</p>
  <p>Please sign and return a copy of this letter by {{dates.effectiveDate}} to confirm your acceptance.</p>
  <br/>
  <p>Yours sincerely,</p>
  <br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'employee.designation', 'company.name', 'dates.issueDate', 'dates.effectiveDate', 'compensation.grossSalary'],
    legalClause: 'Federal Decree-Law No. 33 of 2021 (UAE Labour Law)',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    lastUsed: '2026-02-10T10:30:00Z',
  },
  {
    id: 'tpl-002',
    key: 'salary_certificate',
    category: 'compliance',
    name: 'Salary Certificate — UAE',
    description: 'Official salary certificate for bank/visa purposes confirming employment and compensation',
    country: 'UAE',
    language: 'en',
    version: 2,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
    <p style="color: #666;">{{company.address}}</p>
  </div>
  <h3 style="text-align: center; text-decoration: underline; color: #1e3a5f;">SALARY CERTIFICATE</h3>
  <p>To Whom It May Concern,</p>
  <p>This is to certify that <strong>{{employee.name}}</strong> (Passport No. {{employee.passportNumber}}) has been employed with {{company.name}} since <strong>{{dates.joiningDate}}</strong> as <strong>{{employee.designation}}</strong>.</p>
  <p>Their current monthly salary is as follows:</p>
  <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
    <tr style="background: #f0f4f8;"><td style="padding: 8px; border: 1px solid #ddd;">Basic Salary</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.basicSalary}}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;">Housing Allowance</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.hra}}</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;">Transport Allowance</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.transportAllowance}}</td></tr>
    <tr style="background: #e8f0fe; font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Total Gross Salary</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.grossSalary}}</td></tr>
  </table>
  <p>This certificate is issued upon request for <strong>{{legal.nocPurpose}}</strong> purposes only.</p>
  <p>Date: {{dates.issueDate}}</p>
  <br/><br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'employee.designation', 'company.name', 'dates.issueDate', 'dates.joiningDate', 'compensation.grossSalary'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
    lastUsed: '2026-02-20T09:00:00Z',
  },
  {
    id: 'tpl-003',
    key: 'salary_increment',
    category: 'compensation',
    name: 'Salary Increment Letter',
    description: 'Annual or merit-based salary revision letter with previous and new salary details',
    country: 'GENERIC',
    language: 'en',
    version: 2,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <p style="text-align: right;">Date: {{dates.issueDate}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #1e3a5f;">SALARY REVISION LETTER</h3>
  <p>We are pleased to inform you that the Management has approved a salary revision for you, effective <strong>{{dates.effectiveDate}}</strong>.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
    <tr style="background: #f0f4f8;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Component</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Previous</th><th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Revised</th></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;">Gross Monthly Salary</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">{{compensation.currency}} {{compensation.grossSalary}}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #15803d;">{{compensation.currency}} {{compensation.newSalary}}</td></tr>
    <tr style="background: #e8f0fe;"><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Increment</td><td colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #15803d;">{{compensation.currency}} {{compensation.incrementAmount}} ({{compensation.incrementPercent}})</td></tr>
  </table>
  <p>All other terms and conditions of your employment remain unchanged.</p>
  <p>We appreciate your continued contributions and look forward to your ongoing success.</p>
  <br/>
  <p>Yours sincerely,<br/><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'company.name', 'dates.issueDate', 'dates.effectiveDate', 'compensation.grossSalary', 'compensation.newSalary'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
    lastUsed: '2026-01-15T11:00:00Z',
  },
  {
    id: 'tpl-004',
    key: 'promotion_letter',
    category: 'compensation',
    name: 'Promotion Letter',
    description: 'Promotion notification with new title, department, and revised compensation',
    country: 'GENERIC',
    language: 'en',
    version: 1,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <p style="text-align: right;">Date: {{dates.issueDate}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #1e3a5f;">LETTER OF PROMOTION</h3>
  <p>We are delighted to inform you that the Management has approved your promotion from <strong>{{position.previousTitle}}</strong> to <strong>{{position.newTitle}}</strong>, effective <strong>{{dates.effectiveDate}}</strong>.</p>
  <p>Your revised monthly compensation effective from the above date will be <strong>{{compensation.currency}} {{compensation.newSalary}}</strong> gross per month.</p>
  <p>You will report to <strong>{{position.reportingTo}}</strong>. We look forward to your continued dedication and leadership in your new role.</p>
  <br/>
  <p>Congratulations!<br/><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'company.name', 'position.newTitle', 'position.previousTitle', 'dates.issueDate', 'dates.effectiveDate'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'tpl-005',
    key: 'warning_letter_1',
    category: 'disciplinary',
    name: 'First Warning Letter',
    description: 'First formal written warning for employee misconduct or performance issues',
    country: 'GENERIC',
    language: 'en',
    version: 2,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #c0392b; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <p style="text-align: right;">Date: {{dates.issueDate}}</p>
  <p>Employee ID: {{employee.employeeId}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #c0392b;">FIRST FORMAL WARNING LETTER</h3>
  <p>This letter serves as a <strong>First Formal Written Warning</strong> regarding: <em>{{legal.warningReason}}</em>.</p>
  <p>Your conduct/performance as described above is in violation of company policy. We expect immediate and sustained improvement.</p>
  <p>Please note that failure to demonstrate the required improvement may result in further disciplinary action, up to and including termination of employment.</p>
  <p>You are required to sign and return a copy of this letter as acknowledgment of receipt. Signing does not necessarily constitute agreement with the contents.</p>
  <br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}</p>
  <br/>
  <p>_____________________________ &nbsp;&nbsp;&nbsp; _____________<br/>Employee Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'employee.employeeId', 'company.name', 'dates.issueDate', 'legal.warningReason'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'tpl-006',
    key: 'termination_letter',
    category: 'separation',
    name: 'Termination Letter — UAE',
    description: 'Employment termination letter compliant with UAE Labour Law notice requirements',
    country: 'UAE',
    language: 'en',
    version: 2,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
    <p style="color: #666;">{{company.address}}</p>
  </div>
  <p style="text-align: right;">Date: {{dates.issueDate}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #1e3a5f;">NOTICE OF TERMINATION OF EMPLOYMENT</h3>
  <p>We regret to inform you that your employment with {{company.name}} will be terminated effective <strong>{{dates.lastWorkingDay}}</strong>, in accordance with Federal Decree-Law No. 33 of 2021.</p>
  <p><strong>Reason:</strong> {{legal.terminationReason}}</p>
  <p>In accordance with Article 43 of the UAE Labour Law, you will serve a notice period of <strong>{{legal.noticePeriod}}</strong>.</p>
  <p>Your end-of-service entitlements, accrued leave encashment, and final settlement will be processed in accordance with applicable law and company policy.</p>
  <p>Please return all company property, access cards, and confidential materials on or before your last working day.</p>
  <br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'company.name', 'dates.issueDate', 'dates.lastWorkingDay', 'legal.terminationReason', 'legal.noticePeriod'],
    legalClause: 'Federal Decree-Law No. 33 of 2021 (UAE Labour Law), Article 43',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'tpl-007',
    key: 'noc',
    category: 'compliance',
    name: 'No Objection Certificate (NOC) — GCC',
    description: 'NOC for visa change of status, sponsorship transfer, or external activities (GCC-specific)',
    country: 'UAE',
    language: 'en',
    version: 1,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
    <p style="color: #666;">{{company.address}}</p>
  </div>
  <h3 style="text-align: center; text-decoration: underline; color: #1e3a5f;">NO OBJECTION CERTIFICATE</h3>
  <p>To Whom It May Concern,</p>
  <p>This is to certify that <strong>{{employee.name}}</strong> (Passport No. {{employee.passportNumber}}), {{employee.nationality}}, holds the position of <strong>{{employee.designation}}</strong> at {{company.name}} and has been employed with us since <strong>{{dates.joiningDate}}</strong>.</p>
  <p>The company has <strong>NO OBJECTION</strong> to <strong>{{legal.nocPurpose}}</strong>.</p>
  <p>We confirm that {{employee.name}} is in good standing with the company and there are no outstanding liabilities or disciplinary matters against them.</p>
  <p>This certificate is valid for 30 days from the date of issue.</p>
  <p>Date: {{dates.issueDate}}</p>
  <br/><br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'employee.passportNumber', 'employee.nationality', 'employee.designation', 'company.name', 'dates.joiningDate', 'dates.issueDate', 'legal.nocPurpose'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
    lastUsed: '2026-02-18T14:00:00Z',
  },
  {
    id: 'tpl-008',
    key: 'experience_letter',
    category: 'separation',
    name: 'Experience Letter',
    description: 'Experience certificate issued on separation confirming employment history',
    country: 'GENERIC',
    language: 'en',
    version: 1,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <h3 style="text-align: center; text-decoration: underline; color: #1e3a5f;">EXPERIENCE CERTIFICATE</h3>
  <p>To Whom It May Concern,</p>
  <p>This is to certify that <strong>{{employee.name}}</strong> was employed with <strong>{{company.name}}</strong> from <strong>{{dates.joiningDate}}</strong> to <strong>{{dates.separationDate}}</strong>, a total tenure of <strong>{{dates.yearsOfService}}</strong>.</p>
  <p>During their tenure, they served as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> department.</p>
  <p>We found {{employee.firstName}} to be a dedicated professional and wish them success in their future endeavours.</p>
  <p>Date: {{dates.issueDate}}</p>
  <br/><br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'company.name', 'dates.joiningDate', 'dates.separationDate', 'dates.issueDate', 'employee.designation'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'tpl-009',
    key: 'probation_confirmation',
    category: 'onboarding',
    name: 'Probation Confirmation Letter',
    description: 'Confirms successful completion of probation period and permanent employment status',
    country: 'GENERIC',
    language: 'en',
    version: 1,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <p style="text-align: right;">Date: {{dates.issueDate}}</p>
  <p><strong>Dear {{employee.name}},</strong></p>
  <h3 style="color: #1e3a5f;">CONFIRMATION OF EMPLOYMENT</h3>
  <p>We are pleased to inform you that you have successfully completed your probation period of <strong>{{legal.probationDuration}}</strong> effective <strong>{{dates.probationEndDate}}</strong>.</p>
  <p>You are now confirmed as a permanent employee in the role of <strong>{{employee.designation}}</strong> with effect from <strong>{{dates.effectiveDate}}</strong>.</p>
  <p>Your terms and conditions of employment remain as per your original offer letter, unless modified herein.</p>
  <p>We look forward to your continued contributions to {{company.name}}.</p>
  <br/>
  <p>Congratulations!<br/><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'company.name', 'employee.designation', 'dates.issueDate', 'dates.probationEndDate', 'dates.effectiveDate', 'legal.probationDuration'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'tpl-010',
    key: 'employment_contract',
    category: 'onboarding',
    name: 'Employment Contract — KSA',
    description: 'Full employment contract compliant with Saudi Labour Law (Royal Decree M/51)',
    country: 'KSA',
    language: 'en',
    version: 2,
    isActive: true,
    isCustom: false,
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px;">
  <div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px;">
    <h2 style="color: #1e3a5f;">{{company.name}}</h2>
  </div>
  <h3 style="text-align: center; color: #1e3a5f;">EMPLOYMENT CONTRACT</h3>
  <p>This Employment Contract is entered into between <strong>{{company.name}}</strong> (hereinafter "the Employer") and <strong>{{employee.name}}</strong>, Passport No. {{employee.passportNumber}} (hereinafter "the Employee").</p>
  <h4>1. Position & Duties</h4>
  <p>The Employee shall be employed as <strong>{{employee.designation}}</strong> in the {{employee.department}} department.</p>
  <h4>2. Commencement & Duration</h4>
  <p>This contract commences on <strong>{{dates.joiningDate}}</strong> and shall be subject to a probation period of <strong>{{legal.probationDuration}}</strong> as permitted under Saudi Labour Law Article 53.</p>
  <h4>3. Remuneration</h4>
  <p>The Employee shall receive a monthly salary of <strong>SAR {{compensation.grossSalary}}</strong>.</p>
  <h4>4. Notice Period</h4>
  <p>Either party may terminate this contract by giving <strong>{{legal.noticePeriod}}</strong> written notice as per Saudi Labour Law Article 75.</p>
  <h4>5. Governing Law</h4>
  <p>This contract shall be governed by the Saudi Labour Law (Royal Decree M/51 of 2005, as amended).</p>
  <br/>
  <p><strong>{{company.hrSignatory}}</strong><br/>{{company.hrTitle}}<br/>{{company.name}}</p>
  <p><strong>{{employee.name}}</strong><br/>Employee Signature</p>
</div>`,
    variables: ALL_TEMPLATE_VARIABLES,
    requiredVariables: ['employee.name', 'employee.passportNumber', 'employee.designation', 'company.name', 'dates.joiningDate', 'compensation.grossSalary', 'legal.probationDuration', 'legal.noticePeriod'],
    legalClause: 'Saudi Labour Law Royal Decree M/51 (2005), Articles 53 and 75',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-10-01T00:00:00Z',
  },
];

const MOCK_GENERATED_LETTERS: GeneratedLetter[] = [
  {
    id: 'gen-001',
    templateId: 'tpl-002',
    templateName: 'Salary Certificate — UAE',
    employeeId: 'emp-0201',
    employeeName: 'Ahmed Al-Mansouri',
    generatedAt: '2026-02-20T09:15:00Z',
    generatedBy: 'Fatima Al-Rashidi',
    htmlContent: '<p>Generated content...</p>',
    status: 'sent',
    sentAt: '2026-02-20T09:30:00Z',
    variables: { 'employee.name': 'Ahmed Al-Mansouri', 'compensation.grossSalary': '22,000' },
  },
  {
    id: 'gen-002',
    templateId: 'tpl-003',
    templateName: 'Salary Increment Letter',
    employeeId: 'emp-0312',
    employeeName: 'Rajesh Nair',
    generatedAt: '2026-01-15T11:20:00Z',
    generatedBy: 'Priya Krishnamurthy',
    htmlContent: '<p>Generated content...</p>',
    status: 'signed',
    sentAt: '2026-01-15T12:00:00Z',
    signedAt: '2026-01-16T10:00:00Z',
    variables: { 'employee.name': 'Rajesh Nair', 'compensation.newSalary': '2,500,000' },
  },
];

// ── Helper: Variable Substitution ──────────────────────────────────────────────

function substituteVariables(html: string, variables: Record<string, string>): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return variables[trimmedKey] ?? `[${trimmedKey}]`;
  });
}

// ── Service Class ──────────────────────────────────────────────────────────────

export class LetterEngineService {
  private static delay(ms = 400): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  /** Get all letter templates, optionally filtered by country */
  static async getLetterTemplates(country?: SupportedCountry): Promise<LetterTemplate[]> {
    await this.delay();
    if (country) {
      return MOCK_TEMPLATES.filter(t => t.country === country || t.country === 'GENERIC');
    }
    return [...MOCK_TEMPLATES];
  }

  /** Get templates grouped by category */
  static async getTemplatesByCategory(): Promise<Record<LetterCategory, LetterTemplate[]>> {
    await this.delay(200);
    const result = {} as Record<LetterCategory, LetterTemplate[]>;
    MOCK_TEMPLATES.forEach(t => {
      if (!result[t.category]) result[t.category] = [];
      result[t.category].push(t);
    });
    return result;
  }

  /** Generate a letter from a template with employee variables */
  static async generateLetter(
    templateId: string,
    employeeId: string,
    variables: Record<string, string>
  ): Promise<GeneratedLetter> {
    await this.delay(600);

    const template = MOCK_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error(`Template ${templateId} not found`);

    const htmlContent = substituteVariables(template.htmlContent, variables);

    const letter: GeneratedLetter = {
      id: `gen-${Date.now()}`,
      templateId,
      templateName: template.name,
      employeeId,
      employeeName: variables['employee.name'] ?? 'Unknown Employee',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Current User',
      htmlContent,
      status: 'draft',
      variables,
    };

    MOCK_GENERATED_LETTERS.push(letter);
    return letter;
  }

  /** Get all generated letters for an employee */
  static async getGeneratedLetters(employeeId: string): Promise<GeneratedLetter[]> {
    await this.delay(300);
    return MOCK_GENERATED_LETTERS.filter(l => l.employeeId === employeeId);
  }

  /** Get all generated letters (for HR admin view) */
  static async getAllGeneratedLetters(): Promise<GeneratedLetter[]> {
    await this.delay(300);
    return [...MOCK_GENERATED_LETTERS];
  }

  /** Create a custom letter template */
  static async createTemplate(data: CreateTemplateData): Promise<LetterTemplate> {
    await this.delay(600);
    const newTemplate: LetterTemplate = {
      id: `tpl-${Date.now()}`,
      ...data,
      version: 1,
      isActive: true,
      isCustom: true,
      variables: ALL_TEMPLATE_VARIABLES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_TEMPLATES.push(newTemplate);
    return newTemplate;
  }

  /** Update an existing template */
  static async updateTemplate(id: string, data: Partial<LetterTemplate>): Promise<LetterTemplate> {
    await this.delay(500);
    const idx = MOCK_TEMPLATES.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Template ${id} not found`);
    MOCK_TEMPLATES[idx] = {
      ...MOCK_TEMPLATES[idx],
      ...data,
      version: MOCK_TEMPLATES[idx].version + 1,
      updatedAt: new Date().toISOString(),
    };
    return MOCK_TEMPLATES[idx];
  }

  /** Duplicate a template */
  static async duplicateTemplate(id: string): Promise<LetterTemplate> {
    await this.delay(400);
    const original = MOCK_TEMPLATES.find(t => t.id === id);
    if (!original) throw new Error(`Template ${id} not found`);
    const copy: LetterTemplate = {
      ...original,
      id: `tpl-${Date.now()}`,
      name: `${original.name} (Copy)`,
      version: 1,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUsed: undefined,
    };
    MOCK_TEMPLATES.push(copy);
    return copy;
  }

  /** Get available variable groups */
  static getVariableGroups(): Record<VariableGroup, TemplateVariable[]> {
    const groups = {} as Record<VariableGroup, TemplateVariable[]>;
    ALL_TEMPLATE_VARIABLES.forEach(v => {
      if (!groups[v.group]) groups[v.group] = [];
      groups[v.group].push(v);
    });
    return groups;
  }

  /** Mark a generated letter as sent */
  static async markAsSent(letterId: string): Promise<GeneratedLetter> {
    await this.delay(300);
    const idx = MOCK_GENERATED_LETTERS.findIndex(l => l.id === letterId);
    if (idx === -1) throw new Error(`Letter ${letterId} not found`);
    MOCK_GENERATED_LETTERS[idx] = {
      ...MOCK_GENERATED_LETTERS[idx],
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    return MOCK_GENERATED_LETTERS[idx];
  }
}
