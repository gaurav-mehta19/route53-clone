'use client';

import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useRouter } from 'next/navigation';

interface QuickLink {
  label: string;
  description: string;
  href: string;
}

const LINKS: QuickLink[] = [
  {
    label: 'Hosted zones',
    description: 'Manage DNS records for a domain.',
    href: '/hosted-zones',
  },
  {
    label: 'Traffic policies',
    description: 'Coming soon — model routing policies as a versioned graph.',
    href: '/traffic-policies',
  },
  {
    label: 'Health checks',
    description: 'Coming soon — monitor endpoint health and reachability.',
    href: '/health-checks',
  },
  {
    label: 'Resolver',
    description: 'Coming soon — forward DNS between VPCs and on-prem networks.',
    href: '/resolver',
  },
];

export function QuickLinks() {
  const router = useRouter();
  return (
    <Container header={<Header variant="h2">Get started</Header>}>
      <SpaceBetween size="m">
        {LINKS.map((link) => (
          <div key={link.href}>
            <Link
              href={link.href}
              fontSize="heading-s"
              onFollow={(e) => {
                e.preventDefault();
                router.push(link.href);
              }}
            >
              {link.label}
            </Link>
            <Box color="text-body-secondary" padding={{ top: 'xxs' }}>
              {link.description}
            </Box>
          </div>
        ))}
      </SpaceBetween>
    </Container>
  );
}
