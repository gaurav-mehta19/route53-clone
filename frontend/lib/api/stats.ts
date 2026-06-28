import { apiFetch } from '@/lib/api/client';
import type { UserStats } from '@/lib/types/stats';

export const statsApi = {
  get(): Promise<UserStats> {
    return apiFetch<UserStats>('/api/stats');
  },
};
