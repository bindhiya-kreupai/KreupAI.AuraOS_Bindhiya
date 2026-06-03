/**
 * ConsentRecordService — Prisma-free exports + error class shape tests.
 *
 * The service itself relies on Prisma for persistence; here we verify the
 * exported error classes and type-level contract that the routes depend on.
 */

import { describe, it, expect } from 'vitest';
import { ConsentAlreadyRevokedError, ConsentNotGrantedError } from '../consent-record.service';

describe('ConsentRecordService error classes', () => {
  it('ConsentAlreadyRevokedError is a real Error subclass with the id in the message', () => {
    const err = new ConsentAlreadyRevokedError('abc-123');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ConsentAlreadyRevokedError');
    expect(err.message).toMatch(/abc-123/);
  });

  it('ConsentNotGrantedError is a real Error subclass with the id in the message', () => {
    const err = new ConsentNotGrantedError('xyz-789');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ConsentNotGrantedError');
    expect(err.message).toMatch(/xyz-789/);
  });
});
