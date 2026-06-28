'use client';

import Button from '@cloudscape-design/components/button';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TableProps } from '@cloudscape-design/components/table';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { RECORD_COLUMNS } from '@/features/records/columns';
import { CreateRecordModal } from '@/features/records/create-record-modal';
import { DeleteRecordModal } from '@/features/records/delete-record-modal';
import { EditRecordModal } from '@/features/records/edit-record-modal';
import { useZoneRecords } from '@/hooks/use-dns-records';
import {
  CREATABLE_RECORD_TYPES,
  type CreatableRecordType,
  type DnsRecord,
} from '@/lib/types/dns-record';
import type { HostedZone } from '@/lib/types/hosted-zone';

const PAGE_SIZE = 25;
const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...CREATABLE_RECORD_TYPES.map((t) => ({ value: t, label: t })),
];

export function RecordsTable({ zone }: { zone: HostedZone }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CreatableRecordType>('all');
  const [sortField, setSortField] = useState('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [selected, setSelected] = useState<DnsRecord[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DnsRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DnsRecord | null>(null);

  const query = useZoneRecords(zone.id, {
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    sort: `${sortField}:${sortDesc ? 'desc' : 'asc'}`,
  });

  const sortingColumn = useMemo(
    () => RECORD_COLUMNS.find((c) => c.sortingField === sortField) ?? RECORD_COLUMNS[0],
    [sortField],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const onlySelected = selected[0] ?? null;

  return (
    <>
      <DataTable<DnsRecord>
        items={items}
        columnDefinitions={RECORD_COLUMNS}
        trackBy="id"
        loading={query.isLoading || query.isFetching}
        loadingText="Loading records"
        error={query.error}
        onRetry={() => query.refetch()}
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={total}
        onPageChange={setPage}
        filteringText={search}
        onFilteringTextChange={(v) => {
          setPage(1);
          setSearch(v);
        }}
        filteringPlaceholder="Find records by name or value"
        secondaryFilterControls={
          <Select
            selectedOption={TYPE_OPTIONS.find((o) => o.value === typeFilter) ?? TYPE_OPTIONS[0]!}
            options={TYPE_OPTIONS}
            onChange={(e) => {
              const v = e.detail.selectedOption.value as 'all' | CreatableRecordType;
              setTypeFilter(v);
              setPage(1);
            }}
          />
        }
        sortingColumn={sortingColumn as TableProps.SortingColumn<DnsRecord>}
        sortingDescending={sortDesc}
        onSortingChange={(state) => {
          const field = state.sortingColumn.sortingField;
          if (field) {
            setSortField(field);
            setSortDesc(state.isDescending);
          }
        }}
        selectionType="single"
        selectedItems={selected}
        onSelectionChange={setSelected}
        emptyTitle="No records"
        emptySubtitle="Add an A, CNAME, MX or other record to this zone."
        emptyAction={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            Create record
          </Button>
        }
        header={
          <PageHeader
            title="Records"
            counter={query.data ? `(${total})` : undefined}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button iconName="refresh" onClick={() => query.refetch()} ariaLabel="Refresh" />
                <Button disabled={!onlySelected} onClick={() => setEditTarget(onlySelected)}>
                  Edit
                </Button>
                <Button
                  disabled={!onlySelected}
                  onClick={() => setDeleteTarget(onlySelected)}
                >
                  Delete
                </Button>
                <Button variant="primary" onClick={() => setCreateOpen(true)}>
                  Create record
                </Button>
              </SpaceBetween>
            }
          />
        }
      />

      <CreateRecordModal zone={createOpen ? zone : null} onDismiss={() => setCreateOpen(false)} />
      <EditRecordModal record={editTarget} onDismiss={() => setEditTarget(null)} />
      <DeleteRecordModal
        record={deleteTarget}
        onDismiss={() => {
          setDeleteTarget(null);
          setSelected([]);
        }}
      />
    </>
  );
}
