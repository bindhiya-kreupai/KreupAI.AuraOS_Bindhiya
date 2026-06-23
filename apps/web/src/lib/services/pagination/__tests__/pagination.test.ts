import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalisePaging,
  prismaPageArgs,
  prismaOrderBy,
  buildPaginatedResult,
  buildPaginationMeta,
} from '../index';

describe('normalisePaging', () => {
  it('applies defaults when input is undefined', () => {
    const p = normalisePaging(undefined);
    expect(p.page).toBe(1);
    expect(p.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(p.skip).toBe(0);
    expect(p.take).toBe(DEFAULT_PAGE_SIZE);
    expect(p.sort).toEqual([]);
  });

  it('clamps page < 1 to 1', () => {
    expect(normalisePaging({ page: 0 }).page).toBe(1);
    expect(normalisePaging({ page: -50 }).page).toBe(1);
  });

  it('clamps pageSize to [1, MAX_PAGE_SIZE]', () => {
    expect(normalisePaging({ pageSize: 0 }).pageSize).toBe(1);
    expect(normalisePaging({ pageSize: -10 }).pageSize).toBe(1);
    expect(normalisePaging({ pageSize: 10_000 }).pageSize).toBe(MAX_PAGE_SIZE);
  });

  it('floors fractional page / pageSize values', () => {
    const p = normalisePaging({ page: 2.9, pageSize: 25.6 });
    expect(p.page).toBe(2);
    expect(p.pageSize).toBe(25);
  });

  it('computes skip from page and pageSize', () => {
    const p = normalisePaging({ page: 3, pageSize: 20 });
    expect(p.skip).toBe(40);
    expect(p.take).toBe(20);
  });

  it('normalises sort direction (anything other than "asc" → "desc")', () => {
    const p = normalisePaging({
      sort: [{ field: 'createdAt', dir: 'asc' }, { field: 'name', dir: 'desc' }, { field: 'id' }],
    });
    expect(p.sort).toEqual([
      { field: 'createdAt', dir: 'asc' },
      { field: 'name', dir: 'desc' },
      { field: 'id', dir: 'desc' },
    ]);
  });

  it('ignores non-finite page / pageSize values', () => {
    const p = normalisePaging({ page: NaN, pageSize: Infinity });
    expect(p.page).toBe(1);
    expect(p.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe('prismaPageArgs', () => {
  it('returns skip and take only', () => {
    const p = normalisePaging({ page: 4, pageSize: 25 });
    expect(prismaPageArgs(p)).toEqual({ skip: 75, take: 25 });
  });
});

describe('prismaOrderBy', () => {
  it('returns undefined when no sort is set', () => {
    const p = normalisePaging({});
    expect(prismaOrderBy(p)).toBeUndefined();
  });

  it('maps sort entries to prisma orderBy array', () => {
    const p = normalisePaging({
      sort: [
        { field: 'createdAt', dir: 'desc' },
        { field: 'name', dir: 'asc' },
      ],
    });
    expect(prismaOrderBy(p)).toEqual([{ createdAt: 'desc' }, { name: 'asc' }]);
  });
});

describe('buildPaginatedResult', () => {
  it('packs items, total and computes hasNextPage', () => {
    const p = normalisePaging({ page: 1, pageSize: 10 });
    const res = buildPaginatedResult([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 25, p);
    expect(res.items.length).toBe(10);
    expect(res.total).toBe(25);
    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(10);
    expect(res.hasNextPage).toBe(true);
  });

  it('reports hasNextPage false on the final page', () => {
    const p = normalisePaging({ page: 3, pageSize: 10 });
    const res = buildPaginatedResult([21, 22, 23, 24, 25], 25, p);
    expect(res.hasNextPage).toBe(false);
  });

  it('handles empty pages cleanly', () => {
    const p = normalisePaging({ page: 50, pageSize: 10 });
    const res = buildPaginatedResult([], 25, p);
    expect(res.items).toEqual([]);
    expect(res.hasNextPage).toBe(false);
  });
});

describe('buildPaginationMeta', () => {
  it('computes totalPages and hasNextPage', () => {
    const p = normalisePaging({ page: 1, pageSize: 10 });
    const meta = buildPaginationMeta(25, p);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
  });

  it('reports totalPages = 1 when total is 0', () => {
    const p = normalisePaging({ page: 1, pageSize: 10 });
    const meta = buildPaginationMeta(0, p);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasNextPage).toBe(false);
  });

  it('hasNextPage false on the last page', () => {
    const p = normalisePaging({ page: 3, pageSize: 10 });
    const meta = buildPaginationMeta(25, p);
    expect(meta.hasNextPage).toBe(false);
  });
});
