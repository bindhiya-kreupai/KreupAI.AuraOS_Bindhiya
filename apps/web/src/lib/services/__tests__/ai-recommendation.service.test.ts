/**
 * AIRecommendationService — pure transition matrix tests. (#98)
 */

import { describe, it, expect } from 'vitest';
import {
  AIRecommendationService,
  InvalidRecommendationTransitionError,
} from '../ai-recommendation.service';

const svc = new AIRecommendationService();

describe('AIRecommendationService transitions', () => {
  it('OPEN → ACCEPTED / DISMISSED / EXPIRED only', () => {
    expect(svc.canTransition('OPEN', 'ACCEPTED')).toBe(true);
    expect(svc.canTransition('OPEN', 'DISMISSED')).toBe(true);
    expect(svc.canTransition('OPEN', 'EXPIRED')).toBe(true);
  });

  it('ACCEPTED is terminal', () => {
    expect(svc.canTransition('ACCEPTED', 'OPEN')).toBe(false);
    expect(svc.canTransition('ACCEPTED', 'DISMISSED')).toBe(false);
    expect(svc.canTransition('ACCEPTED', 'EXPIRED')).toBe(false);
  });

  it('DISMISSED is terminal', () => {
    expect(svc.canTransition('DISMISSED', 'OPEN')).toBe(false);
    expect(svc.canTransition('DISMISSED', 'ACCEPTED')).toBe(false);
  });

  it('EXPIRED is terminal', () => {
    expect(svc.canTransition('EXPIRED', 'OPEN')).toBe(false);
    expect(svc.canTransition('EXPIRED', 'ACCEPTED')).toBe(false);
  });

  it('assertTransition throws InvalidRecommendationTransitionError on illegal moves', () => {
    expect(() => svc.assertTransition('ACCEPTED', 'OPEN')).toThrow(
      InvalidRecommendationTransitionError
    );
    expect(() => svc.assertTransition('EXPIRED', 'ACCEPTED')).toThrow(
      InvalidRecommendationTransitionError
    );
  });
});
