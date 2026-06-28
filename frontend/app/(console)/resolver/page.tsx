'use client';

import { ComingSoonPage } from '@/features/coming-soon/coming-soon-page';

export default function ResolverPage() {
  return (
    <ComingSoonPage
      title="Resolver"
      description="Forward DNS queries between VPCs and on-prem networks using inbound and outbound resolver endpoints."
      capabilities={[
        'Inbound endpoints accept queries from on-prem resolvers.',
        'Outbound endpoints forward queries to on-prem name servers.',
        'Resolver rules route queries by domain to specific targets.',
        'Query logging for inspection and audit.',
      ]}
    />
  );
}
