/**
 * PredictionResultService — pure scoring/banding tests. (#98)
 */

import { describe, it, expect } from 'vitest';
import { PredictionResultService, ScoreOutOfRangeError } from '../prediction-result.service';

const svc = new PredictionResultService();

describe('PredictionResultService.scoreToBand', () => {
  it('LOW for scores < 0.25', () => {
    expect(svc.scoreToBand(0)).toBe('LOW');
    expect(svc.scoreToBand(0.24)).toBe('LOW');
  });

  it('MEDIUM for [0.25, 0.5)', () => {
    expect(svc.scoreToBand(0.25)).toBe('MEDIUM');
    expect(svc.scoreToBand(0.49)).toBe('MEDIUM');
  });

  it('HIGH for [0.5, 0.75)', () => {
    expect(svc.scoreToBand(0.5)).toBe('HIGH');
    expect(svc.scoreToBand(0.74)).toBe('HIGH');
  });

  it('CRITICAL for >= 0.75', () => {
    expect(svc.scoreToBand(0.75)).toBe('CRITICAL');
    expect(svc.scoreToBand(1)).toBe('CRITICAL');
  });
});

describe('PredictionResultService.isClassifier', () => {
  it('returns true for classifier models', () => {
    expect(svc.isClassifier('ATTRITION_RISK')).toBe(true);
    expect(svc.isClassifier('PROMOTION_READINESS')).toBe(true);
  });

  it('returns false for regressor models', () => {
    expect(svc.isClassifier('TIME_TO_HIRE')).toBe(false);
    expect(svc.isClassifier('PERF_FORECAST')).toBe(false);
    expect(svc.isClassifier('SOURCING_FUNNEL')).toBe(false);
  });
});

describe('ScoreOutOfRangeError', () => {
  it('is a real Error subclass with the score in the message', () => {
    const err = new ScoreOutOfRangeError(1.5);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ScoreOutOfRangeError');
    expect(err.message).toMatch(/1\.5/);
  });
});
