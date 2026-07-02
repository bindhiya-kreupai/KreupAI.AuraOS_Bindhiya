import { describe, expect, it } from 'vitest';

import { average, costDeltaPercentage, median, spanStatus } from '@/lib/services/org-design';

describe('org-design pure helpers', () => {
  describe('median', () => {
    it('returns 0 for an empty list', () => {
      expect(median([])).toBe(0);
    });

    it('returns the middle value for odd-length lists', () => {
      expect(median([3, 1, 2])).toBe(2);
    });

    it('averages the two middle values for even-length lists', () => {
      expect(median([1, 2, 3, 4])).toBe(2.5);
    });
  });

  describe('average', () => {
    it('returns 0 for an empty list', () => {
      expect(average([])).toBe(0);
    });

    it('computes the arithmetic mean', () => {
      expect(average([2, 4, 6])).toBe(4);
    });
  });

  describe('spanStatus', () => {
    it('flags spans below the ideal minimum as too narrow', () => {
      expect(spanStatus(2)).toBe('too_narrow');
    });

    it('flags spans within the ideal range as optimal', () => {
      expect(spanStatus(5)).toBe('optimal');
    });

    it('flags spans above the ideal maximum as too wide', () => {
      expect(spanStatus(9)).toBe('too_wide');
    });

    it('honours custom ideal bounds', () => {
      expect(spanStatus(9, 8, 12)).toBe('optimal');
    });
  });

  describe('costDeltaPercentage', () => {
    it('returns 0 when the current cost is zero (avoids divide-by-zero)', () => {
      expect(costDeltaPercentage(0, 100)).toBe(0);
    });

    it('computes a positive percentage increase', () => {
      expect(costDeltaPercentage(100, 150)).toBe(50);
    });

    it('computes a negative percentage decrease', () => {
      expect(costDeltaPercentage(200, 150)).toBe(-25);
    });
  });
});
