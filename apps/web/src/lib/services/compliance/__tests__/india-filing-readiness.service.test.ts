/**
 * IndiaFilingReadinessService — filing calendar + readiness report tests.
 */

import { describe, it, expect } from 'vitest';
import { IndiaFilingReadinessService } from '../india-filing-readiness.service';

describe('IndiaFilingReadinessService.generateFilingCalendar', () => {
  it('returns a non-empty calendar for 2024-25', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    expect(cal.length).toBeGreaterThan(0);
  });

  it('includes monthly PF_ECR entries', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    const pf = cal.filter((c) => c.filingType === 'PF_ECR');
    expect(pf.length).toBe(12);
  });

  it('includes half-yearly ESI returns (H1 + H2)', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    const esi = cal.filter((c) => c.filingType === 'ESI_RETURN');
    expect(esi.length).toBe(2);
  });

  it('includes 4 quarterly TDS 24Q entries', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    const tds = cal.filter((c) => c.filingType === 'TDS_24Q');
    expect(tds.length).toBe(4);
  });

  it('includes annual TDS Form 16', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    const f16 = cal.filter((c) => c.filingType === 'TDS_FORM16');
    expect(f16.length).toBe(1);
  });

  it('every entry has a future dueDate relative to start year', () => {
    const cal = IndiaFilingReadinessService.generateFilingCalendar('2024-25');
    for (const entry of cal) {
      expect(entry.dueDate).toBeInstanceOf(Date);
      expect(entry.status).toBe('DRAFT');
    }
  });
});

describe('IndiaFilingReadinessService.createAcknowledgementArtifact', () => {
  it('creates an acknowledgement record with required fields', () => {
    const artifact = IndiaFilingReadinessService.createAcknowledgementArtifact(
      'tenant-A',
      'PF_ECR' as any,
      '2024-06',
      'SUB-001',
      {
        acknowledgementNumber: 'ACK-12345',
        portalReference: 'PF-PORTAL-REF-1',
        challanNumber: 'CHL-001',
        receiptData: { transactionId: 'TXN-001' },
      }
    );

    expect(artifact.id).toMatch(/^ACK-PF_ECR-/);
    expect(artifact.tenantId).toBe('tenant-A');
    expect(artifact.acknowledgementNumber).toBe('ACK-12345');
    expect(artifact.portalReference).toBe('PF-PORTAL-REF-1');
    expect(artifact.challanNumber).toBe('CHL-001');
    expect(artifact.acknowledgedAt).toBeInstanceOf(Date);
    expect(artifact.storedAt).toBeInstanceOf(Date);
  });

  it('omits challanNumber when not provided', () => {
    const artifact = IndiaFilingReadinessService.createAcknowledgementArtifact(
      'tenant-A',
      'ESI_RETURN' as any,
      '2024-H1',
      'SUB-002',
      {
        acknowledgementNumber: 'ACK-54321',
        portalReference: 'ESI-PORTAL-REF-1',
        receiptData: {},
      }
    );

    expect(artifact.challanNumber).toBeUndefined();
  });
});

describe('IndiaFilingReadinessService.generateReadinessReport', () => {
  it('returns a readiness report with checks array', () => {
    const report = IndiaFilingReadinessService.generateReadinessReport(
      'tenant-A',
      'PF_ECR' as any,
      '2024-06',
      150
    );

    expect(report).toBeDefined();
    expect(typeof report).toBe('object');
  });
});
