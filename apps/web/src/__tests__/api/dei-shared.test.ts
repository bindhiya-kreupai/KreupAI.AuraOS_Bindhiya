/**
 * DEI API shared helpers — unit tests.
 * Verifies bilingual (en/ar) error envelopes required by repo conventions.
 */
import { describe, it, expect } from 'vitest';
import { deiError, DEI_ERRORS } from '@/app/api/dei/_shared';

async function body(res: Response) {
  return (await res.json()) as {
    success: boolean;
    error: { code: string; message: string; messageAr: string };
  };
}

describe('DEI shared error helpers', () => {
  it('deiError returns a bilingual error envelope with the given status', async () => {
    const res = deiError('Nope', 'لا', 418, 'E_TEA');
    expect(res.status).toBe(418);
    const json = await body(res);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('E_TEA');
    expect(json.error.message).toBe('Nope');
    expect(json.error.messageAr).toBe('لا');
  });

  it('forbidden() is 403 and bilingual', async () => {
    const res = DEI_ERRORS.forbidden();
    expect(res.status).toBe(403);
    const json = await body(res);
    expect(json.error.message.length).toBeGreaterThan(0);
    expect(json.error.messageAr.length).toBeGreaterThan(0);
  });

  it('notFound() interpolates the resource name and stays bilingual', async () => {
    const res = DEI_ERRORS.notFound('Survey');
    expect(res.status).toBe(404);
    const json = await body(res);
    expect(json.error.message).toBe('Survey not found');
    expect(json.error.messageAr.length).toBeGreaterThan(0);
  });

  it('badRequest() defaults and custom messages are both bilingual', async () => {
    const def = await body(DEI_ERRORS.badRequest());
    expect(def.error.message.length).toBeGreaterThan(0);
    expect(def.error.messageAr.length).toBeGreaterThan(0);

    const custom = await body(DEI_ERRORS.badRequest('Title required', 'العنوان مطلوب'));
    expect(custom.error.message).toBe('Title required');
    expect(custom.error.messageAr).toBe('العنوان مطلوب');
  });

  it('every canonical error carries both message and messageAr', async () => {
    const responses = [
      DEI_ERRORS.forbidden(),
      DEI_ERRORS.notFound(),
      DEI_ERRORS.badRequest(),
      DEI_ERRORS.server(),
    ];
    for (const res of responses) {
      const json = await body(res);
      expect(json.error).toHaveProperty('message');
      expect(json.error).toHaveProperty('messageAr');
      expect(typeof json.error.message).toBe('string');
      expect(typeof json.error.messageAr).toBe('string');
    }
  });
});
