/**
 * Tests for the competency-library API validators + bilingual validateBody
 * helper (AURA-047). Pure functions — no DB.
 */
import { describe, it, expect } from 'vitest';
import {
  CreateCompetencySchema,
  CreateCategorySchema,
  CreateFrameworkSchema,
  SubmitResultsSchema,
  validateBody,
} from '../competency-library-api';

describe('validateBody', () => {
  it('returns parsed data on a valid competency payload', () => {
    const result = validateBody(CreateCompetencySchema, {
      name: 'Software Development',
      categoryId: 'cat-123',
    });
    expect(result.response).toBeUndefined();
    expect(result.data?.name).toBe('Software Development');
    expect(result.data?.categoryId).toBe('cat-123');
  });

  it('rejects a competency missing name/categoryId with a bilingual 400', async () => {
    const result = validateBody(CreateCompetencySchema, { name: '' });
    expect(result.data).toBeUndefined();
    expect(result.response).toBeDefined();
    expect(result.response!.status).toBe(400);

    const json: any = await result.response!.json();
    expect(json.success).toBe(false);
    // Bilingual error contract (rule 4).
    expect(json.message).toBeTruthy();
    expect(json.messageAr).toBeTruthy();
    expect(Array.isArray(json.details)).toBe(true);
    const fields = json.details.map((d: any) => d.field);
    expect(fields).toContain('name');
    expect(fields).toContain('categoryId');
  });

  it('requires a code for categories', () => {
    const bad = validateBody(CreateCategorySchema, { name: 'Technical' });
    expect(bad.response).toBeDefined();
    const good = validateBody(CreateCategorySchema, { name: 'Technical', code: 'TECH' });
    expect(good.data?.code).toBe('TECH');
  });

  it('requires at least one framework level', () => {
    const bad = validateBody(CreateFrameworkSchema, { name: 'FW', levels: [] });
    expect(bad.response).toBeDefined();
    const good = validateBody(CreateFrameworkSchema, {
      name: 'FW',
      levels: [{ name: 'L1' }],
    });
    expect(good.data?.levels?.length).toBe(1);
  });

  it('requires competencyId + ratingLevelId per submitted result', () => {
    const bad = validateBody(SubmitResultsSchema, {
      results: [{ competencyId: 'c1' }],
    });
    expect(bad.response).toBeDefined();
    const good = validateBody(SubmitResultsSchema, {
      results: [{ competencyId: 'c1', ratingLevelId: 'l1' }],
    });
    expect(good.data?.results.length).toBe(1);
  });
});
