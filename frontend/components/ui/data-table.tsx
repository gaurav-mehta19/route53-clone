'use client';

// Reusable server-side DataTable used by hosted-zones and records.
// Pagination, sorting, filtering, and selection are all driven by props;
// the parent owns the URL/query state and is the source of truth.

import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Pagination from '@cloudscape-design/components/pagination';
import Table, { type TableProps } from '@cloudscape-design/components/table';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { SearchFilter } from '@/components/ui/search-filter';

export interface DataTableProps<T> {
  items: T[];
  columnDefinitions: TableProps.ColumnDefinition<T>[];
  trackBy: keyof T | ((item: T) => string);
  header: ReactNode;

  loading?: boolean;
  loadingText?: string;
  error?: Error | null;
  onRetry?: () => void;

  // Server-side pagination.
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;

  // Server-side filter.
  filteringText: string;
  onFilteringTextChange: (text: string) => void;
  filteringPlaceholder?: string;
  secondaryFilterControls?: ReactNode;

  // Server-side sort.
  sortingColumn?: TableProps.SortingColumn<T>;
  sortingDescending?: boolean;
  onSortingChange?: (state: { sortingColumn: TableProps.SortingColumn<T>; isDescending: boolean }) => void;

  // Selection.
  selectionType?: TableProps.SelectionType;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;

  emptyTitle?: string;
  emptySubtitle?: ReactNode;
  emptyAction?: ReactNode;
}

function resolveKey<T>(trackBy: keyof T | ((item: T) => string), item: T): string {
  if (typeof trackBy === 'function') return trackBy(item);
  return String(item[trackBy]);
}

export function DataTable<T>(props: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(props.totalCount / Math.max(1, props.pageSize)));
  const empty = props.error ? (
    <Alert
      type="error"
      header="Could not load data"
      action={props.onRetry ? <Button onClick={props.onRetry}>Retry</Button> : null}
    >
      {props.error.message}
    </Alert>
  ) : (
    <EmptyState
      title={props.emptyTitle ?? 'No matching results'}
      subtitle={props.emptySubtitle}
      action={props.emptyAction}
    />
  );

  return (
    <Table<T>
      items={props.items}
      columnDefinitions={props.columnDefinitions}
      trackBy={(item) => resolveKey(props.trackBy, item)}
      header={props.header}
      loading={props.loading}
      loadingText={props.loadingText ?? 'Loading…'}
      empty={empty}
      stickyHeader
      variant="full-page"
      resizableColumns
      wrapLines={false}
      selectionType={props.selectionType}
      selectedItems={props.selectedItems}
      onSelectionChange={(e) => props.onSelectionChange?.(e.detail.selectedItems)}
      sortingColumn={props.sortingColumn}
      sortingDescending={props.sortingDescending}
      onSortingChange={(e) =>
        props.onSortingChange?.({
          sortingColumn: e.detail.sortingColumn,
          isDescending: Boolean(e.detail.isDescending),
        })
      }
      filter={
        <SearchFilter
          filteringText={props.filteringText}
          onFilteringTextChange={props.onFilteringTextChange}
          placeholder={props.filteringPlaceholder}
          countText={`${props.totalCount} match${props.totalCount === 1 ? '' : 'es'}`}
          secondaryControls={props.secondaryFilterControls}
        />
      }
      pagination={
        <Pagination
          currentPageIndex={props.page}
          pagesCount={totalPages}
          onChange={(e) => props.onPageChange(e.detail.currentPageIndex)}
        />
      }
    />
  );
}
