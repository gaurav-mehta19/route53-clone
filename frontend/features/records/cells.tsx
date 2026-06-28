'use client';

import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';

import type { DnsRecord } from '@/lib/types/dns-record';

export function RecordTypeCell({ type }: { type: DnsRecord['type'] }) {
  // Visually distinguish auto-managed apex records (SOA/NS) from user records.
  const color = type === 'SOA' || type === 'NS' ? 'grey' : 'blue';
  return <Badge color={color}>{type}</Badge>;
}

export function RoutingPolicyCell({ policy }: { policy: DnsRecord['routing_policy'] }) {
  return <Badge color="green">{policy}</Badge>;
}

export function ValueCell({ value }: { value: string }) {
  // Multi-line records (NS, MX, SRV, …) are stored newline-separated; render
  // each entry on its own line so the column reads like the Route 53 console.
  const lines = value.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return (
      <Box variant="code" display="inline">
        {value}
      </Box>
    );
  }
  return (
    <Box>
      {lines.map((line, idx) => (
        <Box key={idx} variant="code" display="block">
          {line}
        </Box>
      ))}
    </Box>
  );
}

export function NameCell({ name }: { name: string }) {
  return (
    <Box variant="code" display="inline">
      {name}
    </Box>
  );
}
