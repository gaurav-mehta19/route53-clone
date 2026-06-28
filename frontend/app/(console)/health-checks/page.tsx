'use client';

import { ComingSoonPage } from '@/features/coming-soon/coming-soon-page';

export default function HealthChecksPage() {
  return (
    <ComingSoonPage
      title="Health checks"
      description="Monitor the reachability of endpoints from AWS regions worldwide and use the result to drive DNS failover."
      capabilities={[
        'Probe HTTP, HTTPS, and TCP endpoints from multiple regions.',
        'Calculated health checks that combine the result of child checks.',
        'CloudWatch alarms when an endpoint goes unhealthy.',
        'Wire a health check into a failover or weighted record.',
      ]}
    />
  );
}
