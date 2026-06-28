// Mirrors app/schemas/dns_record.py. SOA is read-only (auto-managed by the
// zone-bootstrap helper); the form picker only exposes CreatableRecordType.

export const CREATABLE_RECORD_TYPES = [
  'A',
  'AAAA',
  'CNAME',
  'TXT',
  'MX',
  'NS',
  'PTR',
  'SRV',
  'CAA',
] as const;

export type CreatableRecordType = (typeof CREATABLE_RECORD_TYPES)[number];
export type RecordType = CreatableRecordType | 'SOA';
export type RoutingPolicy = 'SIMPLE';

export interface DnsRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: RecordType;
  ttl: number;
  value: string;
  routing_policy: RoutingPolicy;
  created_at: string;
  updated_at: string;
}

export interface DnsRecordCreatePayload {
  name: string;
  type: CreatableRecordType;
  ttl: number;
  value: string;
  routing_policy?: RoutingPolicy;
}

export interface DnsRecordUpdatePayload {
  ttl?: number;
  value?: string;
}

export interface ListRecordsParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: CreatableRecordType;
  sort?: string;
}
