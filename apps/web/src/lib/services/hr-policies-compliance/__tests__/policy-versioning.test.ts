import { describe, it, expect } from 'vitest';
import { computePolicyContentHash } from '../policy-versioning.service';

/**
 * EPIC-32 closure tests — pure content-hash semantics.
 *
 * The DB-driven publish() / acknowledge() / verifyAcknowledgement() flow
 * is wired straight to prisma + auditService; integration coverage will
 * grow with a real DB harness. The hash arithmetic is the load-bearing
 * non-repudiation piece, so it gets its own dedicated tests here.
 */

const BASE = {
  title: 'Code of Conduct',
  version: '1.0',
  contentMarkdown: '# Code of Conduct\nBe professional.',
};

describe('computePolicyContentHash — EPIC-32 non-repudiation', () => {
  it('produces a stable hash for identical inputs', () => {
    const a = computePolicyContentHash(BASE);
    const b = computePolicyContentHash({ ...BASE });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes the hash when contentMarkdown changes', () => {
    const a = computePolicyContentHash(BASE);
    const b = computePolicyContentHash({
      ...BASE,
      contentMarkdown: BASE.contentMarkdown + ' Updated.',
    });
    expect(a).not.toBe(b);
  });

  it('changes the hash when the version string changes (even if content is unchanged)', () => {
    const a = computePolicyContentHash(BASE);
    const b = computePolicyContentHash({ ...BASE, version: '1.1' });
    expect(a).not.toBe(b);
  });

  it('changes the hash when the title changes', () => {
    const a = computePolicyContentHash(BASE);
    const b = computePolicyContentHash({ ...BASE, title: 'Updated Title' });
    expect(a).not.toBe(b);
  });

  it('treats leading / trailing whitespace as semantically equivalent', () => {
    const a = computePolicyContentHash(BASE);
    const b = computePolicyContentHash({
      ...BASE,
      title: '  Code of Conduct  ',
      contentMarkdown: '\n\n# Code of Conduct\nBe professional.\n\n',
    });
    expect(a).toBe(b);
  });

  it('keeps the hash deterministic across multiple calls', () => {
    const hashes = new Set<string>();
    for (let i = 0; i < 100; i++) hashes.add(computePolicyContentHash(BASE));
    expect(hashes.size).toBe(1);
  });
});
