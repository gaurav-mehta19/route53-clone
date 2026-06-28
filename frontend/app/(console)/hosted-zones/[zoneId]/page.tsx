'use client';

import Alert from '@cloudscape-design/components/alert';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import { use } from 'react';

import { RecordsTable } from '@/features/records/records-table';
import { ZoneHeader } from '@/features/records/zone-header';
import { useHostedZone } from '@/hooks/use-hosted-zones';
import { useRegisterBreadcrumb } from '@/providers/breadcrumb-provider';

interface PageProps {
  params: Promise<{ zoneId: string }>;
}

export default function HostedZoneDetailPage({ params }: PageProps) {
  const { zoneId } = use(params);
  const { data: zone, error, isLoading } = useHostedZone(zoneId);

  // Replace the raw zone id in the breadcrumb with the domain name once loaded.
  useRegisterBreadcrumb(zoneId, zone?.name ?? null);

  if (isLoading) {
    return (
      <ContentLayout header={<Header variant="h1">Hosted zone</Header>}>
        <Spinner size="large" />
      </ContentLayout>
    );
  }

  if (error || !zone) {
    return (
      <ContentLayout header={<Header variant="h1">Hosted zone not found</Header>}>
        <Alert type="error" header="Could not load hosted zone">
          {error?.message ?? 'The hosted zone may have been deleted.'}
        </Alert>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout header={<Header variant="h1">{zone.name}</Header>}>
      <SpaceBetween size="l">
        <ZoneHeader zone={zone} />
        <RecordsTable zone={zone} />
      </SpaceBetween>
    </ContentLayout>
  );
}
