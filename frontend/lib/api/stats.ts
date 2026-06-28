import { apiFetch } from '@/lib/api/client';
import type { Activity, UserStats } from '@/lib/types/stats';

export const statsApi = {
  get(): Promise<UserStats> {
    return apiFetch<UserStats>('/api/stats');
  },
  activity(days = 7): Promise<Activity> {
    return apiFetch<Activity>('/api/stats/activity', { query: { days } });
  },
};
