'use client';

import { ComingSoonPage } from '@/features/coming-soon/coming-soon-page';

export default function ProfilesPage() {
  return (
    <ComingSoonPage
      title="Profiles"
      description="Reuse a single DNS configuration — private hosted zones, resolver rules, and DNS Firewall associations — across many VPCs."
      capabilities={[
        'Bundle private zones and resolver rules into a named profile.',
        'Attach a profile to multiple VPCs in one action.',
        'Share profiles across accounts using AWS RAM.',
        'Version profile changes and roll them out gradually.',
      ]}
    />
  );
}
