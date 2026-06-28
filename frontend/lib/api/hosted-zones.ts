import { apiFetch } from '@/lib/api/client';
import type { Page } from '@/lib/types/api';
import type {
  HostedZone,
  HostedZoneCreatePayload,
  HostedZoneUpdatePayload,
  ListZonesParams,
} from '@/lib/types/hosted-zone';

export const hostedZonesApi = {
  list(params: ListZonesParams = {}): Promise<Page<HostedZone>> {
    return apiFetch<Page<HostedZone>>('/api/hosted-zones', {
      query: { ...params },
    });
  },
  get(zoneId: string): Promise<HostedZone> {
    return apiFetch<HostedZone>(`/api/hosted-zones/${zoneId}`);
  },
  create(payload: HostedZoneCreatePayload): Promise<HostedZone> {
    return apiFetch<HostedZone>('/api/hosted-zones', { method: 'POST', body: payload });
  },
  update(zoneId: string, payload: HostedZoneUpdatePayload): Promise<HostedZone> {
    return apiFetch<HostedZone>(`/api/hosted-zones/${zoneId}`, {
      method: 'PATCH',
      body: payload,
    });
  },
  remove(zoneId: string): Promise<void> {
    return apiFetch<void>(`/api/hosted-zones/${zoneId}`, { method: 'DELETE' });
  },
};
