// Zod schemas for hosted-zone forms. Rules mirror app/schemas/hosted_zone.py
// so the frontend rejects bad input before the API rejects it.

import { z } from 'zod';

const DOMAIN_RE =
  /^(?=.{1,253}\.?$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$/i;

export const hostedZoneCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Domain name is required.')
    .max(253, 'Domain name is too long.')
    .refine((v) => DOMAIN_RE.test(v.endsWith('.') ? v : `${v}.`), {
      message: 'Enter a valid domain (e.g. example.com).',
    }),
  type: z.enum(['PUBLIC', 'PRIVATE']),
  comment: z.string().max(1024, 'Description is too long.').optional().nullable(),
});

export const hostedZoneUpdateSchema = z.object({
  comment: z.string().max(1024, 'Description is too long.').nullable(),
});

export type HostedZoneCreateInput = z.infer<typeof hostedZoneCreateSchema>;
export type HostedZoneUpdateInput = z.infer<typeof hostedZoneUpdateSchema>;
