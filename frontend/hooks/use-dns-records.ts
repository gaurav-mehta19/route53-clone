'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { dnsRecordsApi } from '@/lib/api/dns-records';
import type { ListRecordsParams } from '@/lib/types/dns-record';

export const dnsRecordKeys = {
  all: ['dns-records'] as const,
  forZone: (zoneId: string) => [...dnsRecordKeys.all, 'zone', zoneId] as const,
  list: (zoneId: string, params: ListRecordsParams) =>
    [...dnsRecordKeys.forZone(zoneId), 'list', params] as const,
};

export function useZoneRecords(zoneId: string | null, params: ListRecordsParams) {
  return useQuery({
    queryKey: zoneId
      ? dnsRecordKeys.list(zoneId, params)
      : dnsRecordKeys.list('__none__', params),
    queryFn: () => dnsRecordsApi.listForZone(zoneId as string, params),
    enabled: Boolean(zoneId),
    placeholderData: keepPreviousData,
  });
}
