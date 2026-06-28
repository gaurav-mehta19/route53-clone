'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { dnsRecordKeys } from '@/hooks/use-dns-records';
import { hostedZoneKeys } from '@/hooks/use-hosted-zones';
import { dnsRecordsApi } from '@/lib/api/dns-records';
import type {
  DnsRecord,
  DnsRecordCreatePayload,
  DnsRecordUpdatePayload,
} from '@/lib/types/dns-record';

interface CreateVars {
  zoneId: string;
  payload: DnsRecordCreatePayload;
}

interface UpdateVars {
  zoneId: string;
  recordId: string;
  payload: DnsRecordUpdatePayload;
}

interface DeleteVars {
  zoneId: string;
  recordId: string;
}

function invalidateZone(
  qc: ReturnType<typeof useQueryClient>,
  zoneId: string,
): void {
  void qc.invalidateQueries({ queryKey: dnsRecordKeys.forZone(zoneId) });
  // record_count on the zone changed; refresh the list too.
  void qc.invalidateQueries({ queryKey: hostedZoneKeys.all });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation<DnsRecord, Error, CreateVars>({
    mutationFn: ({ zoneId, payload }) => dnsRecordsApi.createInZone(zoneId, payload),
    onSuccess: (_rec, vars) => invalidateZone(qc, vars.zoneId),
  });
}

export function useUpdateRecord() {
  const qc = useQueryClient();
  return useMutation<DnsRecord, Error, UpdateVars>({
    mutationFn: ({ recordId, payload }) => dnsRecordsApi.update(recordId, payload),
    onSuccess: (_rec, vars) => invalidateZone(qc, vars.zoneId),
  });
}

export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation<void, Error, DeleteVars>({
    mutationFn: ({ recordId }) => dnsRecordsApi.remove(recordId),
    onMutate: async ({ zoneId, recordId }) => {
      await qc.cancelQueries({ queryKey: dnsRecordKeys.forZone(zoneId) });
      const previous = qc.getQueriesData({ queryKey: dnsRecordKeys.forZone(zoneId) });
      qc.setQueriesData(
        { queryKey: dnsRecordKeys.forZone(zoneId) },
        (data: unknown) => {
          if (!data || typeof data !== 'object' || !('items' in data)) return data;
          const page = data as { items: DnsRecord[]; total: number };
          return { ...page, items: page.items.filter((r) => r.id !== recordId) };
        },
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { previous?: ReturnType<typeof qc.getQueriesData> } | undefined;
      if (ctx?.previous) for (const [k, d] of ctx.previous) qc.setQueryData(k, d);
    },
    onSettled: (_d, _e, vars) => invalidateZone(qc, vars.zoneId),
  });
}
