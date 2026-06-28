export type ZoneType = 'PUBLIC' | 'PRIVATE';

export interface HostedZone {
  id: string;
  name: string;
  type: ZoneType;
  comment: string | null;
  record_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreatePayload {
  name: string;
  type: ZoneType;
  comment?: string | null;
}

export interface HostedZoneUpdatePayload {
  comment: string | null;
}

export interface ListZonesParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: ZoneType;
  sort?: string;
}
