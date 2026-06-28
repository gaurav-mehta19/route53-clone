'use client';

// Top-of-dashboard KPI tiles. Pull totals from the same hosted-zones
// endpoint the rest of the app uses — paginated count + a single
// large-page fetch for the record_count sum (good up to 200 zones,
// which is plenty for a demo console).

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';

import { useHostedZones } from '@/hooks/use-hosted-zones';

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <Box variant="awsui-value-large" color="text-status-info">
        {value}
      </Box>
    </div>
  );
}

export function MetricTiles() {
  const all = useHostedZones({ page: 1, page_size: 200 });
  const totals = all.data;
  const items = totals?.items ?? [];

  const total = totals?.total ?? 0;
  const publicCount = items.filter((z) => z.type === 'PUBLIC').length;
  const privateCount = items.filter((z) => z.type === 'PRIVATE').length;
  const recordTotal = items.reduce((sum, z) => sum + z.record_count, 0);

  const loadingDash = '—';

  return (
    <Container>
      <ColumnLayout columns={4} variant="text-grid">
        <Tile label="Hosted zones" value={all.isLoading ? loadingDash : total} />
        <Tile label="Public zones" value={all.isLoading ? loadingDash : publicCount} />
        <Tile label="Private zones" value={all.isLoading ? loadingDash : privateCount} />
        <Tile label="DNS records" value={all.isLoading ? loadingDash : recordTotal} />
      </ColumnLayout>
    </Container>
  );
}
