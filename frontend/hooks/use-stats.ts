'use client';

import { useQuery } from '@tanstack/react-query';

import { statsApi } from '@/lib/api/stats';

export const statsKeys = {
  all: ['stats'] as const,
  activity: (days: number) => ['stats', 'activity', days] as const,
};

export function useStats() {
  return useQuery({
    queryKey: statsKeys.all,
    queryFn: () => statsApi.get(),
  });
}

export function useActivity(days = 7) {
  return useQuery({
    queryKey: statsKeys.activity(days),
    queryFn: () => statsApi.activity(days),
  });
}
