'use client';

import Button from '@cloudscape-design/components/button';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useRouter } from 'next/navigation';

import { MetricTiles } from '@/features/dashboard/metric-tiles';
import { QuickLinks } from '@/features/dashboard/quick-links';
import { RecentZones } from '@/features/dashboard/recent-zones';
import { useAuth } from '@/providers/auth-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={`Welcome${user ? `, ${user.display_name}` : ''}. Manage your DNS in one place.`}
          actions={
            <Button variant="primary" onClick={() => router.push('/hosted-zones')}>
              Go to hosted zones
            </Button>
          }
        >
          Route 53 dashboard
        </Header>
      }
    >
      <SpaceBetween size="l">
        <MetricTiles />
        <Grid gridDefinition={[{ colspan: { default: 12, l: 8 } }, { colspan: { default: 12, l: 4 } }]}>
          <RecentZones />
          <QuickLinks />
        </Grid>
      </SpaceBetween>
    </ContentLayout>
  );
}
