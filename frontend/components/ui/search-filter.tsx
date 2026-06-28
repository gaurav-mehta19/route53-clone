'use client';

// Server-side search input + an optional slot for secondary filters
// (e.g. a record-type Select). Rendered above DataTable rows.

import Grid from '@cloudscape-design/components/grid';
import TextFilter from '@cloudscape-design/components/text-filter';
import type { ReactNode } from 'react';

interface SearchFilterProps {
  filteringText: string;
  onFilteringTextChange: (value: string) => void;
  placeholder?: string;
  countText?: string;
  secondaryControls?: ReactNode;
}

export function SearchFilter({
  filteringText,
  onFilteringTextChange,
  placeholder = 'Find resources',
  countText,
  secondaryControls,
}: SearchFilterProps) {
  if (!secondaryControls) {
    return (
      <TextFilter
        filteringText={filteringText}
        onChange={(e) => onFilteringTextChange(e.detail.filteringText)}
        filteringPlaceholder={placeholder}
        countText={countText}
      />
    );
  }
  return (
    <Grid gridDefinition={[{ colspan: { default: 12, xs: 8 } }, { colspan: { default: 12, xs: 4 } }]}>
      <TextFilter
        filteringText={filteringText}
        onChange={(e) => onFilteringTextChange(e.detail.filteringText)}
        filteringPlaceholder={placeholder}
        countText={countText}
      />
      <div>{secondaryControls}</div>
    </Grid>
  );
}
