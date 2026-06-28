'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { hostedZonesApi } from '@/lib/api/hosted-zones';
import type { ListZonesParams } from '@/lib/types/hosted-zone';

export const hostedZoneKeys = {
  all: ['hosted-zones'] as const,
  list: (params: ListZonesParams) => [...hostedZoneKeys.all, 'list', params] as const,
  detail: (zoneId: string) => [...hostedZoneKeys.all, 'detail', zoneId] as const,
};

export function useHostedZones(params: ListZonesParams) {
  return useQuery({
    queryKey: hostedZoneKeys.list(params),
    queryFn: () => hostedZonesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useHostedZone(zoneId: string | null) {
  return useQuery({
    queryKey: zoneId ? hostedZoneKeys.detail(zoneId) : hostedZoneKeys.detail('__none__'),
    queryFn: () => hostedZonesApi.get(zoneId as string),
    enabled: Boolean(zoneId),
  });
}
