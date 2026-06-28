import { apiFetch } from '@/lib/api/client';
import type { Page } from '@/lib/types/api';
import type {
  DnsRecord,
  DnsRecordCreatePayload,
  DnsRecordUpdatePayload,
  ListRecordsParams,
} from '@/lib/types/dns-record';

export const dnsRecordsApi = {
  listForZone(zoneId: string, params: ListRecordsParams = {}): Promise<Page<DnsRecord>> {
    return apiFetch<Page<DnsRecord>>(`/api/hosted-zones/${zoneId}/records`, {
      query: { ...params },
    });
  },
  createInZone(zoneId: string, payload: DnsRecordCreatePayload): Promise<DnsRecord> {
    return apiFetch<DnsRecord>(`/api/hosted-zones/${zoneId}/records`, {
      method: 'POST',
      body: payload,
    });
  },
  update(recordId: string, payload: DnsRecordUpdatePayload): Promise<DnsRecord> {
    return apiFetch<DnsRecord>(`/api/records/${recordId}`, { method: 'PATCH', body: payload });
  },
  remove(recordId: string): Promise<void> {
    return apiFetch<void>(`/api/records/${recordId}`, { method: 'DELETE' });
  },
};
