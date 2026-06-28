'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hostedZoneKeys } from '@/hooks/use-hosted-zones';
import { hostedZonesApi } from '@/lib/api/hosted-zones';
import type {
  HostedZone,
  HostedZoneCreatePayload,
  HostedZoneUpdatePayload,
} from '@/lib/types/hosted-zone';

export function useCreateHostedZone() {
  const qc = useQueryClient();
  return useMutation<HostedZone, Error, HostedZoneCreatePayload>({
    mutationFn: (payload) => hostedZonesApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hostedZoneKeys.all });
    },
  });
}

export function useUpdateHostedZone() {
  const qc = useQueryClient();
  return useMutation<
    HostedZone,
    Error,
    { zoneId: string; payload: HostedZoneUpdatePayload }
  >({
    mutationFn: ({ zoneId, payload }) => hostedZonesApi.update(zoneId, payload),
    onSuccess: (zone) => {
      void qc.invalidateQueries({ queryKey: hostedZoneKeys.all });
      qc.setQueryData(hostedZoneKeys.detail(zone.id), zone);
    },
  });
}

export function useDeleteHostedZone() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (zoneId) => hostedZonesApi.remove(zoneId),
    // Optimistic remove: drop the row from current list pages so the UI
    // updates the instant the user confirms.
    onMutate: async (zoneId) => {
      await qc.cancelQueries({ queryKey: hostedZoneKeys.all });
      const previous = qc.getQueriesData({ queryKey: hostedZoneKeys.all });
      qc.setQueriesData(
        { queryKey: hostedZoneKeys.all },
        (data: unknown) => {
          if (!data || typeof data !== 'object' || !('items' in data)) return data;
          const page = data as { items: HostedZone[]; total: number };
          return { ...page, items: page.items.filter((z) => z.id !== zoneId) };
        },
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      const ctx = context as { previous?: ReturnType<typeof qc.getQueriesData> } | undefined;
      if (ctx?.previous) {
        for (const [key, data] of ctx.previous) qc.setQueryData(key, data);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: hostedZoneKeys.all });
    },
  });
}
