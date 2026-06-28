import { describe, expect, it } from 'vitest';

import { hostedZoneCreateSchema } from '@/lib/validation/hosted-zone';
import { dnsRecordCreateSchema } from '@/lib/validation/dns-record';

describe('hostedZoneCreateSchema', () => {
  it('accepts a valid domain and defaults type to required field', () => {
    const result = hostedZoneCreateSchema.safeParse({
      name: 'example.com',
      type: 'PUBLIC',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an obviously malformed domain', () => {
    const result = hostedZoneCreateSchema.safeParse({
      name: 'not a domain',
      type: 'PUBLIC',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown zone type', () => {
    const result = hostedZoneCreateSchema.safeParse({
      name: 'example.com',
      type: 'WAT',
    });
    expect(result.success).toBe(false);
  });
});

describe('dnsRecordCreateSchema', () => {
  it('coerces TTL strings into ints in range', () => {
    const result = dnsRecordCreateSchema.safeParse({
      name: 'www',
      type: 'A',
      ttl: '300',
      value: '10.0.0.1',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.ttl).toBe(300);
  });

  it('rejects TTL above the one-week cap', () => {
    const result = dnsRecordCreateSchema.safeParse({
      name: 'www',
      type: 'A',
      ttl: '700000',
      value: '10.0.0.1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an SOA type (only Creatable types allowed in the picker)', () => {
    const result = dnsRecordCreateSchema.safeParse({
      name: 'example.com.',
      type: 'SOA',
      ttl: 300,
      value: 'whatever',
    });
    expect(result.success).toBe(false);
  });
});
