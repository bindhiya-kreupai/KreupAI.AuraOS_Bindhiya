import { describe, it, expect } from 'vitest';
import {
  evaluateAppealSlaCadence,
  evaluateEvidenceChainOfCustody,
  evaluateHearingNoticeCompleteness,
  generateDisciplinaryLetter,
  type EvidenceItem,
  type HearingNotice,
} from '../disciplinary-residuals.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-26 evidence chain-of-custody', () => {
  it('passes a clean chain', () => {
    const item: EvidenceItem = {
      evidenceId: 'EV1',
      seizedAt: new Date('2026-06-10T08:00:00Z'),
      seizedBy: 'u-officer',
      currentCustodian: 'u-vault',
      transfers: [
        {
          fromUserId: 'u-officer',
          toUserId: 'u-vault',
          transferredAt: new Date('2026-06-10T10:00:00Z'),
          signedByRecipient: true,
        },
      ],
    };
    const r = evaluateEvidenceChainOfCustody([item]);
    expect(r.totals.integrityPct).toBe(100);
    expect(r.failures.length).toBe(0);
  });

  it('flags UNSIGNED_TRANSFER', () => {
    const r = evaluateEvidenceChainOfCustody([
      {
        evidenceId: 'EV1',
        seizedAt: new Date('2026-06-10T08:00:00Z'),
        seizedBy: 'u-officer',
        currentCustodian: 'u-vault',
        transfers: [
          {
            fromUserId: 'u-officer',
            toUserId: 'u-vault',
            transferredAt: new Date('2026-06-10T10:00:00Z'),
            signedByRecipient: false,
          },
        ],
      },
    ]);
    expect(r.failures.some((f) => f.code === 'UNSIGNED_TRANSFER')).toBe(true);
  });

  it('flags CUSTODY_GAP when transfer.from does not match prior holder', () => {
    const r = evaluateEvidenceChainOfCustody([
      {
        evidenceId: 'EV1',
        seizedAt: new Date('2026-06-10T08:00:00Z'),
        seizedBy: 'u-officer',
        currentCustodian: 'u-vault',
        transfers: [
          {
            fromUserId: 'u-stranger', // gap
            toUserId: 'u-vault',
            transferredAt: new Date('2026-06-10T10:00:00Z'),
            signedByRecipient: true,
          },
        ],
      },
    ]);
    expect(r.failures.some((f) => f.code === 'CUSTODY_GAP')).toBe(true);
  });

  it('flags HAND_OFF_DELAYED when first transfer > 24h after seizure', () => {
    const r = evaluateEvidenceChainOfCustody([
      {
        evidenceId: 'EV1',
        seizedAt: new Date('2026-06-10T08:00:00Z'),
        seizedBy: 'u-officer',
        currentCustodian: 'u-vault',
        transfers: [
          {
            fromUserId: 'u-officer',
            toUserId: 'u-vault',
            transferredAt: new Date('2026-06-12T08:00:00Z'),
            signedByRecipient: true,
          },
        ],
      },
    ]);
    expect(r.failures.some((f) => f.code === 'HAND_OFF_DELAYED')).toBe(true);
  });

  it('flags CUSTODIAN_MISMATCH', () => {
    const r = evaluateEvidenceChainOfCustody([
      {
        evidenceId: 'EV1',
        seizedAt: new Date('2026-06-10T08:00:00Z'),
        seizedBy: 'u-officer',
        currentCustodian: 'u-someone-else',
        transfers: [
          {
            fromUserId: 'u-officer',
            toUserId: 'u-vault',
            transferredAt: new Date('2026-06-10T10:00:00Z'),
            signedByRecipient: true,
          },
        ],
      },
    ]);
    expect(r.failures.some((f) => f.code === 'CUSTODIAN_MISMATCH')).toBe(true);
  });
});

describe('EPIC-26 hearing-notice completeness', () => {
  const complete: HearingNotice = {
    noticeId: 'N1',
    hearingDate: new Date('2026-06-20'),
    hearingTime: '10:00',
    venue: 'HR Room 1',
    allegations: [{ en: 'Tardiness', ar: 'تأخر' }],
    rightToRepresentation: true,
    rightToRespondInWriting: true,
    rightToCallWitnesses: true,
    noticePeriodDays: 5,
    servedBilingually: true,
  };

  it('passes complete notice', () => {
    const r = evaluateHearingNoticeCompleteness(complete);
    expect(r.pass).toBe(true);
    expect(r.completenessPct).toBe(100);
  });

  it('flags MISSING_DATE as CRITICAL', () => {
    const r = evaluateHearingNoticeCompleteness({ ...complete, hearingDate: undefined });
    expect(r.issues.some((i) => i.code === 'MISSING_DATE' && i.severity === 'CRITICAL')).toBe(true);
    expect(r.pass).toBe(false);
  });

  it('flags MISSING_ALLEGATIONS', () => {
    const r = evaluateHearingNoticeCompleteness({ ...complete, allegations: [] });
    expect(r.issues.some((i) => i.code === 'MISSING_ALLEGATIONS')).toBe(true);
  });

  it('flags INSUFFICIENT_NOTICE_PERIOD', () => {
    const r = evaluateHearingNoticeCompleteness({ ...complete, noticePeriodDays: 1 });
    expect(r.issues.some((i) => i.code === 'INSUFFICIENT_NOTICE_PERIOD')).toBe(true);
  });

  it('flags NOT_BILINGUAL', () => {
    const r = evaluateHearingNoticeCompleteness({ ...complete, servedBilingually: false });
    expect(r.issues.some((i) => i.code === 'NOT_BILINGUAL')).toBe(true);
  });
});

describe('EPIC-26 appeal SLA cadence', () => {
  it('flags ACK_BREACH', () => {
    const r = evaluateAppealSlaCadence({
      appeals: [
        {
          appealId: 'A1',
          employeeId: 'E1',
          filedAt: new Date('2026-06-01'),
          status: 'OPEN',
        },
      ],
      asOf: NOW,
    });
    expect(r.breaches.some((b) => b.code === 'ACK_BREACH')).toBe(true);
  });

  it('flags RESOLVE_BREACH as CRITICAL', () => {
    const r = evaluateAppealSlaCadence({
      appeals: [
        {
          appealId: 'A1',
          employeeId: 'E1',
          filedAt: new Date('2026-05-01'),
          acknowledgedAt: new Date('2026-05-02'),
          status: 'ACKNOWLEDGED',
        },
      ],
      asOf: NOW,
    });
    const breach = r.breaches.find((b) => b.code === 'RESOLVE_BREACH')!;
    expect(breach.severity).toBe('CRITICAL');
  });

  it('reports compliance when resolved within SLA', () => {
    const r = evaluateAppealSlaCadence({
      appeals: [
        {
          appealId: 'A1',
          employeeId: 'E1',
          filedAt: new Date('2026-06-15'),
          acknowledgedAt: new Date('2026-06-16'),
          resolvedAt: new Date('2026-06-16'),
          status: 'RESOLVED',
        },
      ],
      asOf: NOW,
    });
    expect(r.totals.compliancePct).toBe(100);
  });

  it('ignores WITHDRAWN appeals', () => {
    const r = evaluateAppealSlaCadence({
      appeals: [
        {
          appealId: 'A1',
          employeeId: 'E1',
          filedAt: new Date('2026-01-01'),
          status: 'WITHDRAWN',
        },
      ],
      asOf: NOW,
    });
    expect(r.totals.appealsChecked).toBe(0);
    expect(r.totals.breaches).toBe(0);
  });
});

describe('EPIC-26 disciplinary letter generator', () => {
  const base = {
    actionType: 'WRITTEN_WARNING' as const,
    employeeName: 'John Doe',
    employeeNameAr: 'جون دو',
    employeeId: 'EMP-1',
    misconductSummary: 'Repeated tardiness',
    misconductSummaryAr: 'تأخر متكرر',
    effectiveDate: new Date('2026-06-20'),
    issuedBy: 'HR Manager',
  };

  it('produces bilingual subject and body', () => {
    const l = generateDisciplinaryLetter(base);
    expect(l.subject).toContain('Written Warning');
    expect(l.subjectAr).toContain('إنذار خطي');
    expect(l.body).toContain('John Doe');
    expect(l.bodyAr).toContain('جون دو');
  });

  it('includes suspension days when SUSPENSION', () => {
    const l = generateDisciplinaryLetter({
      ...base,
      actionType: 'SUSPENSION',
      suspensionDays: 3,
    });
    expect(l.body).toContain('3 day');
    expect(l.bodyAr).toContain('3');
  });

  it('includes deduction % when SALARY_DEDUCTION', () => {
    const l = generateDisciplinaryLetter({
      ...base,
      actionType: 'SALARY_DEDUCTION',
      salaryDeductionPct: 5,
    });
    expect(l.body).toContain('5%');
    expect(l.bodyAr).toContain('5%');
  });

  it('uses default legal reference when none supplied', () => {
    const l = generateDisciplinaryLetter(base);
    expect(l.body).toContain('applicable labour law');
  });

  it('uses explicit legal reference when supplied', () => {
    const l = generateDisciplinaryLetter({
      ...base,
      legalReference: 'UAE Federal Decree 33/2021 §39',
    });
    expect(l.body).toContain('UAE Federal Decree 33/2021 §39');
  });
});
