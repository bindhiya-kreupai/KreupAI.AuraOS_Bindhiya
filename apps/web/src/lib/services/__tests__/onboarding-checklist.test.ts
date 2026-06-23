import { describe, it, expect } from 'vitest';
import {
  buildChecklist,
  completionSummary,
  DEFAULT_PRE_JOINING_TEMPLATE,
  DEFAULT_JOINING_DAY_TEMPLATE,
} from '../onboarding-case.service.checklist';

const JOINING = new Date('2026-07-01T00:00:00Z');

describe('buildChecklist — EPIC-06', () => {
  it('emits one item per template entry', () => {
    const items = buildChecklist(JOINING);
    expect(items.length).toBe(
      DEFAULT_PRE_JOINING_TEMPLATE.length + DEFAULT_JOINING_DAY_TEMPLATE.length
    );
  });

  it('orders PRE_JOINING items before JOINING_DAY items', () => {
    const items = buildChecklist(JOINING);
    const preCount = DEFAULT_PRE_JOINING_TEMPLATE.length;
    expect(items.slice(0, preCount).every((i) => i.stage === 'PRE_JOINING')).toBe(true);
    expect(items.slice(preCount).every((i) => i.stage === 'JOINING_DAY')).toBe(true);
  });

  it('computes dueDate from joining + daysFromJoining', () => {
    const items = buildChecklist(JOINING);
    const offer = items.find((i) => i.code === 'OFFER_SIGNED')!;
    // OFFER_SIGNED is -30 days from joining.
    const expected = new Date(JOINING);
    expected.setDate(expected.getDate() - 30);
    expect(offer.dueDate.toISOString()).toBe(expected.toISOString());
  });

  it('defaults every item to PENDING', () => {
    const items = buildChecklist(JOINING);
    expect(items.every((i) => i.status === 'PENDING')).toBe(true);
  });

  it('honours a custom template override', () => {
    const items = buildChecklist(JOINING, {
      preJoiningTemplate: [
        {
          code: 'CUSTOM',
          stage: 'PRE_JOINING',
          label: 'Custom step',
          labelAr: 'خطوة مخصصة',
          owner: 'HR_BUSINESS_PARTNER',
          daysFromJoining: -10,
          severity: 'NORMAL',
          blocksOnJoin: false,
        },
      ],
      joiningDayTemplate: [],
    });
    expect(items).toHaveLength(1);
    expect(items[0].code).toBe('CUSTOM');
  });
});

describe('completionSummary — EPIC-06', () => {
  it('reports zero-progress on a fresh checklist', () => {
    const summary = completionSummary(buildChecklist(JOINING), new Date('2026-06-25'));
    expect(summary.done).toBe(0);
    expect(summary.pending).toBeGreaterThan(0);
    expect(summary.canJoin).toBe(false);
  });

  it('flags overdue when an item is past due', () => {
    const items = buildChecklist(JOINING);
    const summary = completionSummary(items, new Date('2026-08-15')); // way past joining
    expect(summary.overdue).toBeGreaterThan(0);
  });

  it('marks canJoin=true once every blocker is DONE', () => {
    const items = buildChecklist(JOINING).map((i) =>
      i.blocksOnJoin ? { ...i, status: 'DONE' as const } : i
    );
    const summary = completionSummary(items);
    expect(summary.canJoin).toBe(true);
    expect(summary.blockersDone).toBe(summary.blockersTotal);
    expect(summary.pctBlockersComplete).toBe(100);
  });

  it('rolls per-stage counts up correctly', () => {
    const items = buildChecklist(JOINING).map((i) =>
      i.stage === 'PRE_JOINING' ? { ...i, status: 'DONE' as const } : i
    );
    const summary = completionSummary(items);
    expect(summary.byStage.PRE_JOINING.done).toBe(summary.byStage.PRE_JOINING.total);
    expect(summary.byStage.JOINING_DAY.done).toBe(0);
  });

  it('reaches pctComplete=100 when everything is done or skipped', () => {
    const items = buildChecklist(JOINING).map((i) => ({ ...i, status: 'DONE' as const }));
    const summary = completionSummary(items);
    expect(summary.pctComplete).toBe(100);
  });
});
