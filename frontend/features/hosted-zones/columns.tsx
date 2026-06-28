'use client';

// Column definitions for the hosted-zones DataTable. Order + labels match the
// Route 53 console: Domain name, Type, Created by, Record count, Description,
// Hosted zone ID.

import type { TableProps } from '@cloudscape-design/components/table';

import { CommentCell, ZoneIdCell, ZoneNameCell, ZoneTypeCell } from '@/features/hosted-zones/cells';
import type { HostedZone } from '@/lib/types/hosted-zone';

export function buildZoneColumns(currentUserId: number): TableProps.ColumnDefinition<HostedZone>[] {
  return [
    {
      id: 'name',
      header: 'Domain name',
      cell: (zone) => <ZoneNameCell zone={zone} />,
      sortingField: 'name',
      minWidth: 220,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (zone) => <ZoneTypeCell type={zone.type} />,
      sortingField: 'type',
      width: 110,
    },
    {
      id: 'created_by',
      header: 'Created by',
      cell: (zone) => (zone.created_by === currentUserId ? 'You' : `User #${zone.created_by}`),
      width: 140,
    },
    {
      id: 'record_count',
      header: 'Record count',
      cell: (zone) => zone.record_count,
      sortingField: 'record_count',
      width: 140,
    },
    {
      id: 'comment',
      header: 'Description',
      cell: (zone) => <CommentCell comment={zone.comment} />,
      minWidth: 180,
    },
    {
      id: 'id',
      header: 'Hosted zone ID',
      cell: (zone) => <ZoneIdCell id={zone.id} />,
      minWidth: 260,
    },
  ];
}
