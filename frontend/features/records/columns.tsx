'use client';

// Route 53 column order on the records page:
// Record name | Type | Routing policy | Value/Route traffic to | TTL.

import type { TableProps } from '@cloudscape-design/components/table';

import { NameCell, RecordTypeCell, RoutingPolicyCell, ValueCell } from '@/features/records/cells';
import type { DnsRecord } from '@/lib/types/dns-record';

export const RECORD_COLUMNS: TableProps.ColumnDefinition<DnsRecord>[] = [
  {
    id: 'name',
    header: 'Record name',
    cell: (rec) => <NameCell name={rec.name} />,
    sortingField: 'name',
    minWidth: 220,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (rec) => <RecordTypeCell type={rec.type} />,
    sortingField: 'type',
    width: 110,
  },
  {
    id: 'routing_policy',
    header: 'Routing policy',
    cell: (rec) => <RoutingPolicyCell policy={rec.routing_policy} />,
    width: 150,
  },
  {
    id: 'value',
    header: 'Value/Route traffic to',
    cell: (rec) => <ValueCell value={rec.value} />,
    minWidth: 320,
  },
  {
    id: 'ttl',
    header: 'TTL (seconds)',
    cell: (rec) => rec.ttl,
    sortingField: 'ttl',
    width: 140,
  },
];
