'use client';

// Top-of-dashboard KPI tiles. Totals come from the dedicated /api/stats
// endpoint so the dashboard works correctly regardless of how many zones
// the user owns (the earlier client-side sum capped at 200 zones).

import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';

import { useStats } from '@/hooks/use-stats';

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
  const { data, isLoading } = useStats();
  const dash = '—';
  return (
    <Container>
      <ColumnLayout columns={4} variant="text-grid">
        <Tile label="Hosted zones" value={isLoading || !data ? dash : data.total_zones} />
        <Tile label="Public zones" value={isLoading || !data ? dash : data.public_zones} />
        <Tile label="Private zones" value={isLoading || !data ? dash : data.private_zones} />
        <Tile label="DNS records" value={isLoading || !data ? dash : data.total_records} />
      </ColumnLayout>
    </Container>
  );
}
