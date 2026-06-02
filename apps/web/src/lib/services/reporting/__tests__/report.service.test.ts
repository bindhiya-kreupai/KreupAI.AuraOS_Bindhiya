/**
 * ReportService — unit tests against the actual API.
 * Targets `src/lib/services/reporting/report.service.ts`.
 *
 * Most methods are pure functions over the `REPORT_TEMPLATES` array
 * (no prisma calls), so testing is straightforward.
 */

import { describe, it, expect } from 'vitest';
import { ReportService } from '../report.service';

describe('ReportService.getTemplates', () => {
  it('returns the full template list when no filters', async () => {
    const templates = await ReportService.getTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('filters by type', async () => {
    const templates = await ReportService.getTemplates('PAYROLL' as any);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((t) => t.type === 'PAYROLL')).toBe(true);
  });

  it('filters by category', async () => {
    const all = await ReportService.getTemplates();
    const someCategory = all[0].category;
    const filtered = await ReportService.getTemplates(undefined, someCategory);
    expect(filtered.every((t) => t.category === someCategory)).toBe(true);
  });

  it('returns empty array when no template matches', async () => {
    const templates = await ReportService.getTemplates('NONEXISTENT_TYPE' as any);
    expect(templates).toEqual([]);
  });
});

describe('ReportService.getTemplateById', () => {
  it('returns the matching template', async () => {
    const t = await ReportService.getTemplateById('tpl_payroll_summary');
    expect(t).not.toBeNull();
    expect(t?.id).toBe('tpl_payroll_summary');
  });

  it('returns null for unknown ID', async () => {
    const t = await ReportService.getTemplateById('tpl_nonexistent');
    expect(t).toBeNull();
  });
});

describe('ReportService.createFromTemplate', () => {
  it('throws when template not found', async () => {
    await expect(
      ReportService.createFromTemplate('tenant-A', 'tpl_unknown', 'Q1 Report', 'user-1')
    ).rejects.toThrow('Template tpl_unknown not found');
  });

  it('creates a new report from a known template', async () => {
    const report = await ReportService.createFromTemplate(
      'tenant-A',
      'tpl_payroll_summary',
      'Monthly Payroll - Jun',
      'user-1'
    );

    expect(report.tenantId).toBe('tenant-A');
    expect(report.name).toBe('Monthly Payroll - Jun');
    expect(report.template).toBe('tpl_payroll_summary');
    expect(report.createdBy).toBe('user-1');
    expect(report.defaultFormat).toBe('PDF');
    expect(report.availableFormats).toContain('PDF');
    expect(report.availableFormats).toContain('EXCEL');
    expect(report.availableFormats).toContain('CSV');
    expect(report.visibility).toBe('PRIVATE');
    expect(report.id).toMatch(/^rpt_/);
  });

  it('respects user customizations over template defaults', async () => {
    const report = await ReportService.createFromTemplate(
      'tenant-A',
      'tpl_payroll_summary',
      'Custom Report',
      'user-1',
      { visibility: 'PUBLIC' as any, defaultFormat: 'CSV' as any }
    );

    expect(report.visibility).toBe('PUBLIC');
    expect(report.defaultFormat).toBe('CSV');
  });

  it('inherits structural defaults from template (columns, dataSource)', async () => {
    const report = await ReportService.createFromTemplate(
      'tenant-A',
      'tpl_payroll_summary',
      'Test',
      'user-1'
    );

    expect(report.columns.length).toBeGreaterThan(0);
    expect(report.dataSource.primary).toBe('payroll_runs');
  });
});

describe('ReportService.getCategories', () => {
  it('returns a list of category objects', () => {
    const cats = ReportService.getCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats[0]).toHaveProperty('id');
    expect(cats[0]).toHaveProperty('name');
    expect(cats[0]).toHaveProperty('nameAr');
    expect(cats[0]).toHaveProperty('icon');
  });
});

describe('ReportService.scheduleReport', () => {
  it('returns a ReportSchedule with generated id', async () => {
    const report = await ReportService.createFromTemplate(
      'tenant-A',
      'tpl_payroll_summary',
      'Test',
      'user-1'
    );

    const sched = await ReportService.scheduleReport(report, {
      tenantId: 'tenant-A',
      frequency: 'DAILY' as any,
      time: '08:00',
      recipients: ['admin@example.com'],
    } as any);

    expect(sched.reportId).toBe(report.id);
    expect(sched.id).toMatch(/^sch_/);
    expect(sched.createdAt).toBeInstanceOf(Date);
    expect(sched.updatedAt).toBeInstanceOf(Date);
  });
});
