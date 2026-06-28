import type { ApiErrorEnvelope } from '@/lib/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorEnvelope['error']['details'];

  constructor(status: number, body: ApiErrorEnvelope) {
    super(body.error.message || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details ?? [];
  }

  isUnauthorized(): boolean {
    return this.status === 401 || this.code === 'unauthorized';
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
