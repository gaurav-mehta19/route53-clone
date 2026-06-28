'use client';

import { ComingSoonPage } from '@/features/coming-soon/coming-soon-page';

export default function TrafficPoliciesPage() {
  return (
    <ComingSoonPage
      title="Traffic policies"
      description="Build a versioned DNS routing graph that combines weighted, latency-based, failover, and geolocation rules into a single policy."
      capabilities={[
        'Author traffic policies in a visual graph editor.',
        'Version policies and roll changes back to a prior version.',
        'Apply a policy to multiple records across hosted zones.',
        'Track which records a policy currently powers.',
      ]}
    />
  );
}
