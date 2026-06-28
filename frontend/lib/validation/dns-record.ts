// Light-touch zod for the records form: enforce required + bounds locally,
// defer per-type value rules to the backend (the validators registry there
// is the source of truth, and its errors are surfaced verbatim in the form).

import { z } from 'zod';

import { CREATABLE_RECORD_TYPES } from '@/lib/types/dns-record';

export const dnsRecordCreateSchema = z.object({
  name: z.string().trim().min(1, 'Record name is required.').max(255),
  type: z.enum(CREATABLE_RECORD_TYPES),
  ttl: z.coerce
    .number()
    .int('TTL must be an integer.')
    .min(0, 'TTL must be at least 0.')
    .max(604_800, 'TTL must be at most 604800 (one week).'),
  value: z.string().trim().min(1, 'Value is required.'),
});

export const dnsRecordUpdateSchema = z.object({
  ttl: z.coerce.number().int().min(0).max(604_800).optional(),
  value: z.string().trim().min(1).optional(),
});

export type DnsRecordCreateInput = z.infer<typeof dnsRecordCreateSchema>;
