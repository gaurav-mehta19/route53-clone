'use client';

// The hosted-zones page is essentially this component. Holds the page-local
// state (page/sort/filter/selection), drives the DataTable, and orchestrates
// the create/edit/delete modal lifecycle.

import Button from '@cloudscape-design/components/button';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TableProps } from '@cloudscape-design/components/table';
import { useMemo, useState } from 'react';

import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { buildZoneColumns } from '@/features/hosted-zones/columns';
import { CreateZoneModal } from '@/features/hosted-zones/create-zone-modal';
import { DeleteZoneModal } from '@/features/hosted-zones/delete-zone-modal';
import { EditZoneModal } from '@/features/hosted-zones/edit-zone-modal';
import { useHostedZones } from '@/hooks/use-hosted-zones';
import type { HostedZone, ZoneType } from '@/lib/types/hosted-zone';
import { useAuth } from '@/providers/auth-provider';

const PAGE_SIZE = 25;
const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
];

export function HostedZonesTable() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ZoneType>('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);
  const [selected, setSelected] = useState<HostedZone[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HostedZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HostedZone | null>(null);

  const query = useHostedZones({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    sort: `${sortField}:${sortDesc ? 'desc' : 'asc'}`,
  });

  const columns = useMemo(() => buildZoneColumns(user?.id ?? -1), [user?.id]);
  const sortingColumn = useMemo(
    () => columns.find((c) => c.sortingField === sortField) ?? columns[0],
    [columns, sortField],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const onlySelected = selected[0] ?? null;

  return (
    <>
      <DataTable<HostedZone>
        items={items}
        columnDefinitions={columns}
        trackBy="id"
        loading={query.isLoading || query.isFetching}
        loadingText="Loading hosted zones"
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
        filteringPlaceholder="Find hosted zones"
        secondaryFilterControls={
          <Select
            selectedOption={TYPE_OPTIONS.find((o) => o.value === typeFilter) ?? TYPE_OPTIONS[0]!}
            options={TYPE_OPTIONS}
            onChange={(e) => {
              const v = e.detail.selectedOption.value as 'all' | ZoneType;
              setTypeFilter(v);
              setPage(1);
            }}
          />
        }
        sortingColumn={sortingColumn as TableProps.SortingColumn<HostedZone>}
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
        emptyTitle="No hosted zones"
        emptySubtitle="Create your first hosted zone to start managing DNS records."
        emptyAction={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            Create hosted zone
          </Button>
        }
        header={
          <PageHeader
            title="Hosted zones"
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
                  Create hosted zone
                </Button>
              </SpaceBetween>
            }
          />
        }
      />

      <CreateZoneModal visible={createOpen} onDismiss={() => setCreateOpen(false)} />
      <EditZoneModal zone={editTarget} onDismiss={() => setEditTarget(null)} />
      <DeleteZoneModal
        zone={deleteTarget}
        onDismiss={() => {
          setDeleteTarget(null);
          setSelected([]);
        }}
      />
    </>
  );
}
