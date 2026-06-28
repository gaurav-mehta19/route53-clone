'use client';

import ContentLayout from '@cloudscape-design/components/content-layout';

import { HostedZonesTable } from '@/features/hosted-zones/zone-table';

export default function HostedZonesPage() {
  // The table renders its own PageHeader inside the DataTable's header slot
  // (matches Cloudscape's full-page table pattern), so ContentLayout is empty.
  return (
    <ContentLayout>
      <HostedZonesTable />
    </ContentLayout>
  );
}
