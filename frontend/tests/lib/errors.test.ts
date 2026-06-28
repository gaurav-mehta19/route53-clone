import { describe, expect, it } from 'vitest';

import { ApiError, isApiError } from '@/lib/api/errors';

describe('ApiError', () => {
  it('exposes status, code, message, and details from the envelope', () => {
    const err = new ApiError(409, {
      error: {
        code: 'conflict',
        message: 'A PUBLIC zone named example.com. already exists.',
        details: [],
      },
    });
    expect(err.status).toBe(409);
    expect(err.code).toBe('conflict');
    expect(err.message).toBe('A PUBLIC zone named example.com. already exists.');
    expect(err.details).toEqual([]);
    expect(err.name).toBe('ApiError');
  });

  it('falls back to HTTP <status> when the envelope is missing a message', () => {
    const err = new ApiError(500, {
      error: { code: 'internal_error', message: '', details: [] },
    });
    expect(err.message).toBe('HTTP 500');
  });

  it('isUnauthorized() recognises 401 and explicit unauthorized code', () => {
    const a = new ApiError(401, { error: { code: 'http_401', message: 'x', details: [] } });
    const b = new ApiError(403, { error: { code: 'unauthorized', message: 'x', details: [] } });
    const c = new ApiError(403, { error: { code: 'forbidden', message: 'x', details: [] } });
    expect(a.isUnauthorized()).toBe(true);
    expect(b.isUnauthorized()).toBe(true);
    expect(c.isUnauthorized()).toBe(false);
  });

  it('isApiError narrows correctly', () => {
    const err = new ApiError(404, { error: { code: 'not_found', message: 'gone', details: [] } });
    expect(isApiError(err)).toBe(true);
    expect(isApiError(new Error('plain'))).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
