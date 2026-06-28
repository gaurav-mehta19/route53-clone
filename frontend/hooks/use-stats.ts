'use client';

import { useQuery } from '@tanstack/react-query';

import { statsApi } from '@/lib/api/stats';

export const statsKeys = {
  all: ['stats'] as const,
};

export function useStats() {
  return useQuery({
    queryKey: statsKeys.all,
    queryFn: () => statsApi.get(),
  });
}
