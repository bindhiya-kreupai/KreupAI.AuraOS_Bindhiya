import { describe, it, expect, beforeAll } from 'vitest';
import {
  renderForm,
  findMissingRequiredFields,
  signFormSubmission,
  verifyFormSubmissionSignature,
  type FormField,
} from '../conditional-logic.service';

beforeAll(() => {
  // Provide a deterministic HMAC secret for the signing tests.
  process.env.SIGNATURE_HMAC_SECRET = 'test-hmac-secret-1234567890-test-hmac-secret-1234567890';
});

const fields: FormField[] = [
  { code: 'country', label: 'Country', type: 'select' },
  {
    code: 'state',
    label: 'State',
    type: 'select',
    visibleWhen: 'values.country == "IN"',
  },
  {
    code: 'iqamaNumber',
    label: 'Iqama',
    type: 'text',
    visibleWhen: 'values.country == "SA"',
    requiredWhen: 'true',
  },
  {
    code: 'attachReceipt',
    label: 'Attach receipt',
    type: 'boolean',
  },
  {
    code: 'receiptFile',
    label: 'Receipt file',
    type: 'attachment',
    requiredWhen: 'values.attachReceipt && values.amount > 1000',
  },
  { code: 'amount', label: 'Amount', type: 'number' },
];

describe('renderForm — EPIC-33-S01 conditional logic', () => {
  it('shows the state field only when country=IN', () => {
    const india = renderForm(fields, { country: 'IN' });
    const ksa = renderForm(fields, { country: 'SA' });
    expect(india.fields.find((s) => s.code === 'state')!.visible).toBe(true);
    expect(ksa.fields.find((s) => s.code === 'state')!.visible).toBe(false);
  });

  it('marks iqama required only when visible (KSA)', () => {
    const ksa = renderForm(fields, { country: 'SA' });
    const iqama = ksa.fields.find((s) => s.code === 'iqamaNumber')!;
    expect(iqama.visible).toBe(true);
    expect(iqama.required).toBe(true);
  });

  it('iqama is NOT required when invisible', () => {
    const ind = renderForm(fields, { country: 'IN' });
    const iqama = ind.fields.find((s) => s.code === 'iqamaNumber')!;
    expect(iqama.visible).toBe(false);
    expect(iqama.required).toBe(false);
  });

  it('receipt-file required when both flags trip', () => {
    const r = renderForm(fields, { country: 'IN', attachReceipt: true, amount: 2000 });
    expect(r.fields.find((s) => s.code === 'receiptFile')!.required).toBe(true);
  });

  it('receipt-file NOT required when amount is below threshold', () => {
    const r = renderForm(fields, { country: 'IN', attachReceipt: true, amount: 500 });
    expect(r.fields.find((s) => s.code === 'receiptFile')!.required).toBe(false);
  });

  it('captures malformed expression error in reasons[] without throwing', () => {
    const bad: FormField[] = [
      { code: 'x', label: 'X', type: 'text', visibleWhen: 'values.country == ' /* malformed */ },
    ];
    const r = renderForm(bad, {});
    expect(r.fields[0].reasons.some((s) => /error/.test(s))).toBe(true);
  });
});

describe('findMissingRequiredFields', () => {
  it('flags required-but-empty fields', () => {
    const render = renderForm(fields, { country: 'SA' });
    const missing = findMissingRequiredFields(render, { country: 'SA' });
    expect(missing).toContain('iqamaNumber');
  });

  it('does not flag invisible required fields', () => {
    const render = renderForm(fields, { country: 'IN' });
    const missing = findMissingRequiredFields(render, { country: 'IN' });
    expect(missing).not.toContain('iqamaNumber');
  });

  it('treats empty arrays as missing', () => {
    const f: FormField[] = [
      { code: 'tags', label: 'Tags', type: 'multiselect', requiredWhen: 'true' },
    ];
    const render = renderForm(f, {});
    const missing = findMissingRequiredFields(render, { tags: [] });
    expect(missing).toEqual(['tags']);
  });
});

describe('signFormSubmission — EPIC-33-S05 cryptographic e-sig', () => {
  it('produces a verifiable HMAC signature', () => {
    const sig = signFormSubmission({
      formId: 'F1',
      submissionId: 'S1',
      stage: 'HR_REVIEW',
      actorId: 'user-1',
      contentHash: 'a'.repeat(64),
    });
    expect(typeof sig).toBe('string');
    expect(sig.length).toBeGreaterThan(40);
    expect(verifyFormSubmissionSignature(sig)).toBe(true);
  });

  it('rejects a tampered signature', () => {
    const sig = signFormSubmission({
      formId: 'F1',
      submissionId: 'S1',
      stage: 'HR_REVIEW',
      actorId: 'user-1',
      contentHash: 'a'.repeat(64),
    });
    const tampered = sig.replace(/.$/, sig.endsWith('A') ? 'B' : 'A');
    expect(verifyFormSubmissionSignature(tampered)).toBe(false);
  });
});
