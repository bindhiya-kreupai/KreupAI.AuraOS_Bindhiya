/**
 * Statutory Report Service — Multi-Jurisdiction Compliance Reports
 *
 * UAE Reports:
 *  - WPS Monthly Submission Summary (MoHRE)
 *  - Gratuity/EOSB Liability Report
 *
 * KSA Reports:
 *  - GOSI Monthly Return (General Organization for Social Insurance)
 *  - SADAD Payment File (online payment gateway)
 *
 * India Reports:
 *  - PF Return ECR format (EPFO portal) — monthly by 15th
 *  - ESI Return (ESIC portal) — half-yearly (Apr-Sep: Nov 11, Oct-Mar: May 11)
 *  - Form 16 (TDS Certificate — annual, by June 15)
 *  - Form 24Q (Quarterly TDS Return — TRACES portal)
 *  - Professional Tax Return — state-wise monthly/annual
 *
 * References:
 *  India PF: EPFO ECR 2.0 Format Guide (2023)
 *  India ESI: ESIC e-Portal Filing Guide
 *  India TDS: CBDT Form 24Q Instruction Manual
 *  UAE WPS: MoHRE SIF Circular (2023)
 *  KSA GOSI: GOSI Online Portal Specification v3.1
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const ReportTypeSchema = z.enum([
  // UAE
  'UAE_WPS_SUMMARY',
  'UAE_GRATUITY_LIABILITY',
  // KSA
  'KSA_GOSI_RETURN',
  'KSA_SADAD_FILE',
  // India
  'INDIA_PF_ECR',
  'INDIA_ESI_RETURN',
  'INDIA_FORM_16',
  'INDIA_FORM_24Q',
  'INDIA_PT_RETURN',
  // Global
  'GLOBAL_COMPLIANCE_SUMMARY',
]);

export const ReportStatusSchema = z.enum([
  'NOT_GENERATED', 'GENERATING', 'GENERATED', 'FILED', 'OVERDUE', 'UPCOMING',
]);

export const GenerateReportSchema = z.object({
  reportType: ReportTypeSchema,
  entityId: z.string().uuid(),
  period: z.string(), // YYYY-MM or YYYY-Q1/Q2/Q3/Q4 or YYYY for annual
  employeeId: z.string().uuid().optional(), // For Form 16 — individual
  state: z.string().optional(), // For Professional Tax — state code
  fiscalYear: z.string().optional(), // e.g. "2025-26"
  requestedByUserId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportStatus = z.infer<typeof ReportStatusSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;

export interface StatutoryReport {
  id: string;
  reportType: ReportType;
  entityId: string;
  period: string;
  status: ReportStatus;
  fileName: string | null;
  fileFormat: string;
  generatedAt: Date | null;
  filedAt: Date | null;
  dueDate: Date;
  requestedByUserId: string;
  summary: ReportSummary;
}

export interface ReportSummary {
  headcount?: number;
  totalAmount?: Decimal;
  currency?: string;
  additionalInfo?: Record<string, string | number>;
}

export interface ComplianceCalendarItem {
  reportType: ReportType;
  reportLabel: string;
  country: string;
  period: string;
  dueDate: Date;
  status: ReportStatus;
  daysRemaining: number;
  filedDate: Date | null;
}

export interface ComplianceStatus {
  country: string;
  period: string;
  totalRequired: number;
  filed: number;
  pending: number;
  overdue: number;
  complianceScore: number; // 0-100
  items: ComplianceCalendarItem[];
}

// ---------------------------------------------------------------------------
// Compliance Calendars — Filing Due Dates
// ---------------------------------------------------------------------------

export const INDIA_FILING_CALENDAR = [
  { reportType: 'INDIA_PF_ECR' as ReportType, label: 'PF ECR (EPFO)', frequency: 'monthly', dueDayOfMonth: 15 },
  { reportType: 'INDIA_ESI_RETURN' as ReportType, label: 'ESI Return (ESIC)', frequency: 'half-yearly', dueMonths: [11, 5] },
  { reportType: 'INDIA_FORM_24Q' as ReportType, label: 'Form 24Q (TDS Quarterly)', frequency: 'quarterly', dueDays: ['Jul 31', 'Oct 31', 'Jan 31', 'May 31'] },
  { reportType: 'INDIA_FORM_16' as ReportType, label: 'Form 16 (Annual TDS Certificate)', frequency: 'annual', dueDate: 'Jun 15' },
  { reportType: 'INDIA_PT_RETURN' as ReportType, label: 'Professional Tax Return', frequency: 'monthly', dueDayOfMonth: 20 },
];

export const UAE_FILING_CALENDAR = [
  { reportType: 'UAE_WPS_SUMMARY' as ReportType, label: 'WPS Salary Submission (MoHRE)', frequency: 'monthly', dueDayOfMonth: 14 },
  { reportType: 'UAE_GRATUITY_LIABILITY' as ReportType, label: 'EOSB Liability Report', frequency: 'annual', dueDate: 'Mar 31' },
];

export const KSA_FILING_CALENDAR = [
  { reportType: 'KSA_GOSI_RETURN' as ReportType, label: 'GOSI Monthly Return', frequency: 'monthly', dueDayOfMonth: 10 },
  { reportType: 'KSA_SADAD_FILE' as ReportType, label: 'SADAD Payment File', frequency: 'monthly', dueDayOfMonth: 10 },
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_REPORTS: StatutoryReport[] = [
  {
    id: 'rpt-pf-2026-01',
    reportType: 'INDIA_PF_ECR',
    entityId: 'entity-001',
    period: '2026-01',
    status: 'FILED',
    fileName: 'ECR_ENTITY001_2026-01.txt',
    fileFormat: 'TXT',
    generatedAt: new Date('2026-02-10'),
    filedAt: new Date('2026-02-12'),
    dueDate: new Date('2026-02-15'),
    requestedByUserId: 'user-001',
    summary: { headcount: 243, totalAmount: new Decimal(3337800), currency: 'INR', additionalInfo: { totalECR: 243, uan_linked: 240, uan_unlinked: 3 } },
  },
  {
    id: 'rpt-esi-2025-h2',
    reportType: 'INDIA_ESI_RETURN',
    entityId: 'entity-001',
    period: '2025-H2',
    status: 'FILED',
    fileName: 'ESI_ENTITY001_2025-H2.pdf',
    fileFormat: 'PDF',
    generatedAt: new Date('2025-11-05'),
    filedAt: new Date('2025-11-08'),
    dueDate: new Date('2025-11-11'),
    requestedByUserId: 'user-001',
    summary: { headcount: 18, totalAmount: new Decimal(145800), currency: 'INR' },
  },
  {
    id: 'rpt-pf-2026-02',
    reportType: 'INDIA_PF_ECR',
    entityId: 'entity-001',
    period: '2026-02',
    status: 'UPCOMING',
    fileName: null,
    fileFormat: 'TXT',
    generatedAt: null,
    filedAt: null,
    dueDate: new Date('2026-03-15'),
    requestedByUserId: '',
    summary: {},
  },
  {
    id: 'rpt-tds-q3-2025',
    reportType: 'INDIA_FORM_24Q',
    entityId: 'entity-001',
    period: '2025-Q3',
    status: 'FILED',
    fileName: 'Form24Q_ENTITY001_Q3_2025-26.zip',
    fileFormat: 'ZIP',
    generatedAt: new Date('2026-01-25'),
    filedAt: new Date('2026-01-28'),
    dueDate: new Date('2026-01-31'),
    requestedByUserId: 'user-001',
    summary: { headcount: 247, totalAmount: new Decimal(29661600), currency: 'INR', additionalInfo: { quarter: 'Q3 (Oct-Dec 2025)', challanCount: 3 } },
  },
];

const MOCK_FORM_16_DATA = {
  employeeId: 'emp-001',
  employeeName: 'Priya Sharma',
  employeePAN: 'ABCDE1234F',
  employerName: 'KreupAI Technologies Pvt Ltd',
  employerTAN: 'MUMB12345A',
  fiscalYear: '2025-26',
  totalGrossIncome: new Decimal(1440000),
  standardDeduction: new Decimal(75000),
  pfDeduction: new Decimal(69120),
  totalTaxableIncome: new Decimal(1295880),
  taxComputed: new Decimal(154176),
  healthEducationCess: new Decimal(6167),
  totalTaxPayable: new Decimal(160343),
  taxDeductedMonthly: [
    { month: 'Apr 2025', tdsDeducted: new Decimal(13362) },
    { month: 'May 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Jun 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Jul 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Aug 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Sep 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Oct 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Nov 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Dec 2025', tdsDeducted: new Decimal(13362) },
    { month: 'Jan 2026', tdsDeducted: new Decimal(13362) },
    { month: 'Feb 2026', tdsDeducted: new Decimal(13362) },
    { month: 'Mar 2026', tdsDeducted: new Decimal(13361) },
  ],
  totalTDSDeducted: new Decimal(160343),
};

// ---------------------------------------------------------------------------
// Statutory Report Service
// ---------------------------------------------------------------------------

export class StatutoryReportService {

  // ─── UAE Reports ────────────────────────────────────────────────────────

  async generateWPSReport(period: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-wps-${period}`,
      reportType: 'UAE_WPS_SUMMARY',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `WPS_SUMMARY_${entityId}_${period}.pdf`,
      fileFormat: 'PDF',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date(new Date().setDate(14)), // 14th of the month
      requestedByUserId: 'user-001',
      summary: {
        headcount: 247,
        totalAmount: new Decimal(487500),
        currency: 'AED',
        additionalInfo: { accepted: 245, rejected: 2, molRefNo: 'MOL1740297600001' },
      },
    };
  }

  async generateGratuityReport(entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-gratuity-${Date.now()}`,
      reportType: 'UAE_GRATUITY_LIABILITY',
      entityId,
      period: '2025',
      status: 'GENERATED',
      fileName: `EOSB_LIABILITY_${entityId}_2025.pdf`,
      fileFormat: 'PDF',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date('2026-03-31'),
      requestedByUserId: 'user-001',
      summary: {
        headcount: 247,
        totalAmount: new Decimal(9840000),
        currency: 'AED',
        additionalInfo: { avgYearsOfService: '3.8', employeesOver5Yrs: 72 },
      },
    };
  }

  // ─── KSA Reports ────────────────────────────────────────────────────────

  async generateGOSIReturn(period: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-gosi-${period}`,
      reportType: 'KSA_GOSI_RETURN',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `GOSI_RETURN_${entityId}_${period}.xml`,
      fileFormat: 'XML',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date(new Date().setDate(10)),
      requestedByUserId: 'user-001',
      summary: {
        headcount: 185,
        totalAmount: new Decimal(1245000),
        currency: 'SAR',
        additionalInfo: { saudiNationals: 82, nonSaudis: 103 },
      },
    };
  }

  async generateSADADFile(period: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-sadad-${period}`,
      reportType: 'KSA_SADAD_FILE',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `SADAD_GOSI_${entityId}_${period}.txt`,
      fileFormat: 'TXT',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date(new Date().setDate(10)),
      requestedByUserId: 'user-001',
      summary: {
        headcount: 185,
        totalAmount: new Decimal(1245000),
        currency: 'SAR',
        additionalInfo: { sadad_reference: `GOSI-${entityId}-${period}` },
      },
    };
  }

  // ─── India Reports ───────────────────────────────────────────────────────

  async generatePFReturn(period: string, entityId: string): Promise<StatutoryReport> {
    const existing = MOCK_REPORTS.find(r => r.reportType === 'INDIA_PF_ECR' && r.period === period);
    if (existing) return existing;

    return {
      id: `rpt-pf-${period}`,
      reportType: 'INDIA_PF_ECR',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `ECR_${entityId}_${period}.txt`,
      fileFormat: 'TXT',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: this.getMonthlyDueDate(period, 15),
      requestedByUserId: 'user-001',
      summary: { headcount: 243, totalAmount: new Decimal(3337800), currency: 'INR' },
    };
  }

  async generateESIReturn(period: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-esi-${period}`,
      reportType: 'INDIA_ESI_RETURN',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `ESI_${entityId}_${period}.xlsx`,
      fileFormat: 'XLSX',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date('2026-05-11'), // Next half-yearly due
      requestedByUserId: 'user-001',
      summary: { headcount: 18, totalAmount: new Decimal(145800), currency: 'INR' },
    };
  }

  async generateForm16(employeeId: string, fiscalYear: string): Promise<typeof MOCK_FORM_16_DATA & { reportId: string }> {
    return { ...MOCK_FORM_16_DATA, reportId: `form16-${employeeId}-${fiscalYear}`, employeeId, fiscalYear };
  }

  async generateForm24Q(quarter: string, fiscalYear: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-24q-${fiscalYear}-${quarter}`,
      reportType: 'INDIA_FORM_24Q',
      entityId,
      period: `${fiscalYear}-${quarter}`,
      status: 'GENERATED',
      fileName: `Form24Q_${entityId}_${fiscalYear}_${quarter}.zip`,
      fileFormat: 'ZIP',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: new Date('2026-05-31'), // Q4 due date
      requestedByUserId: 'user-001',
      summary: { headcount: 247, totalAmount: new Decimal(29661600), currency: 'INR' },
    };
  }

  async generateProfessionalTaxReturn(state: string, period: string, entityId: string): Promise<StatutoryReport> {
    return {
      id: `rpt-pt-${state}-${period}`,
      reportType: 'INDIA_PT_RETURN',
      entityId,
      period,
      status: 'GENERATED',
      fileName: `PT_${state}_${entityId}_${period}.pdf`,
      fileFormat: 'PDF',
      generatedAt: new Date(),
      filedAt: null,
      dueDate: this.getMonthlyDueDate(period, 20),
      requestedByUserId: 'user-001',
      summary: { headcount: 243, totalAmount: new Decimal(48600), currency: 'INR', additionalInfo: { state } },
    };
  }

  // ─── Global Helpers ──────────────────────────────────────────────────────

  async getStatutoryCalendar(country: string, year: number): Promise<ComplianceCalendarItem[]> {
    const today = new Date();
    const items: ComplianceCalendarItem[] = [];

    if (country === 'IN') {
      for (let month = 1; month <= 12; month++) {
        const period = `${year}-${String(month).padStart(2, '0')}`;
        const pfDue = new Date(year, month, 15); // 15th of next month
        const ptDue = new Date(year, month, 20);
        const daysRemainingPF = Math.ceil((pfDue.getTime() - today.getTime()) / 86400000);
        const daysRemainingPT = Math.ceil((ptDue.getTime() - today.getTime()) / 86400000);

        items.push({
          reportType: 'INDIA_PF_ECR', reportLabel: `PF ECR — ${period}`,
          country: 'IN', period, dueDate: pfDue,
          status: pfDue < today ? 'FILED' : daysRemainingPF <= 5 ? 'UPCOMING' : 'NOT_GENERATED',
          daysRemaining: daysRemainingPF, filedDate: pfDue < today ? new Date(pfDue.getTime() - 86400000 * 3) : null,
        });
        items.push({
          reportType: 'INDIA_PT_RETURN', reportLabel: `PT Return — ${period}`,
          country: 'IN', period, dueDate: ptDue,
          status: ptDue < today ? 'FILED' : daysRemainingPT <= 5 ? 'UPCOMING' : 'NOT_GENERATED',
          daysRemaining: daysRemainingPT, filedDate: ptDue < today ? new Date(ptDue.getTime() - 86400000 * 2) : null,
        });
      }

      // Form 24Q quarterly
      const quarters = [
        { period: 'Q1', due: new Date(year, 6, 31) },
        { period: 'Q2', due: new Date(year, 9, 31) },
        { period: 'Q3', due: new Date(year + 1, 0, 31) },
        { period: 'Q4', due: new Date(year + 1, 4, 31) },
      ];
      for (const q of quarters) {
        const days = Math.ceil((q.due.getTime() - today.getTime()) / 86400000);
        items.push({
          reportType: 'INDIA_FORM_24Q', reportLabel: `Form 24Q — ${q.period}`,
          country: 'IN', period: q.period, dueDate: q.due,
          status: q.due < today ? 'FILED' : days <= 7 ? 'UPCOMING' : 'NOT_GENERATED',
          daysRemaining: days, filedDate: q.due < today ? new Date(q.due.getTime() - 86400000 * 5) : null,
        });
      }
    }

    if (country === 'AE') {
      for (let month = 1; month <= 12; month++) {
        const period = `${year}-${String(month).padStart(2, '0')}`;
        const due = new Date(year, month - 1, 14);
        const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        items.push({
          reportType: 'UAE_WPS_SUMMARY', reportLabel: `WPS Submission — ${period}`,
          country: 'AE', period, dueDate: due,
          status: due < today ? 'FILED' : days <= 3 ? 'UPCOMING' : 'NOT_GENERATED',
          daysRemaining: days, filedDate: due < today ? new Date(due.getTime() - 86400000 * 2) : null,
        });
      }
    }

    if (country === 'SA') {
      for (let month = 1; month <= 12; month++) {
        const period = `${year}-${String(month).padStart(2, '0')}`;
        const due = new Date(year, month - 1, 10);
        const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        items.push({
          reportType: 'KSA_GOSI_RETURN', reportLabel: `GOSI Return — ${period}`,
          country: 'SA', period, dueDate: due,
          status: due < today ? 'FILED' : days <= 3 ? 'UPCOMING' : 'NOT_GENERATED',
          daysRemaining: days, filedDate: due < today ? new Date(due.getTime() - 86400000 * 1) : null,
        });
      }
    }

    return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getComplianceStatus(country: string, period: string): Promise<ComplianceStatus> {
    const items = await this.getStatutoryCalendar(country, parseInt(period.split('-')[0]));
    const filtered = items.filter(i => i.period.startsWith(period));
    const filed = filtered.filter(i => i.status === 'FILED').length;
    const overdue = filtered.filter(i => i.status === 'OVERDUE').length;
    const pending = filtered.filter(i => i.status !== 'FILED').length;

    return {
      country,
      period,
      totalRequired: filtered.length,
      filed,
      pending,
      overdue,
      complianceScore: filtered.length > 0 ? Math.round((filed / filtered.length) * 100) : 100,
      items: filtered,
    };
  }

  async getReportHistory(entityId: string): Promise<StatutoryReport[]> {
    return MOCK_REPORTS.filter(r => r.entityId === entityId);
  }

  // Private helpers
  private getMonthlyDueDate(period: string, dueDayOfNextMonth: number): Date {
    const [year, month] = period.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return new Date(nextYear, nextMonth - 1, dueDayOfNextMonth);
  }
}

// Singleton export
export const statutoryReportService = new StatutoryReportService();
