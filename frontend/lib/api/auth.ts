import { apiFetch } from '@/lib/api/client';
import type { TokenResponse, User } from '@/lib/types/auth';

export const authApi = {
  login(email: string, password: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },
  logout(): Promise<void> {
    return apiFetch<void>('/api/auth/logout', { method: 'POST' });
  },
  me(): Promise<User> {
    return apiFetch<User>('/api/auth/me');
  },
};
