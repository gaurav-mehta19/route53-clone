// Per-record-type placeholder and one-line hint for the Value field.
// Drives the "Route traffic to" affordance in the create/edit forms.

import type { CreatableRecordType } from '@/lib/types/dns-record';

interface TypeHelp {
  placeholder: string;
  hint: string;
  multiline: boolean;
}

export const TYPE_HELP: Record<CreatableRecordType, TypeHelp> = {
  A: {
    placeholder: '203.0.113.10',
    hint: 'An IPv4 address.',
    multiline: false,
  },
  AAAA: {
    placeholder: '2001:db8::1',
    hint: 'An IPv6 address.',
    multiline: false,
  },
  CNAME: {
    placeholder: 'target.example.com.',
    hint: 'A hostname. Not allowed at the zone apex.',
    multiline: false,
  },
  TXT: {
    placeholder: '"v=spf1 include:_spf.example.com ~all"',
    hint: 'One or more quoted strings (each up to 255 characters).',
    multiline: true,
  },
  MX: {
    placeholder: '10 mail.example.com.',
    hint: 'Each line: priority (0–65535) and mail hostname.',
    multiline: true,
  },
  NS: {
    placeholder: 'ns1.example.com.\nns2.example.com.',
    hint: 'One hostname per line.',
    multiline: true,
  },
  PTR: {
    placeholder: 'host.example.com.',
    hint: 'A hostname.',
    multiline: false,
  },
  SRV: {
    placeholder: '10 5 5060 sip.example.com.',
    hint: 'Each line: priority weight port target.',
    multiline: true,
  },
  CAA: {
    placeholder: '0 issue "letsencrypt.org"',
    hint: 'Each line: flags (0–255), tag (issue/issuewild/iodef), value.',
    multiline: true,
  },
};
