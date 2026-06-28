'use client';

import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Link from '@cloudscape-design/components/link';
import Spinner from '@cloudscape-design/components/spinner';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/ui/empty-state';
import { useHostedZones } from '@/hooks/use-hosted-zones';

export function RecentZones() {
  const router = useRouter();
  const query = useHostedZones({ page: 1, page_size: 5, sort: 'created_at:desc' });
  const items = query.data?.items ?? [];

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <Link
              href="/hosted-zones"
              onFollow={(e) => {
                e.preventDefault();
                router.push('/hosted-zones');
              }}
            >
              View all hosted zones
            </Link>
          }
        >
          Recent hosted zones
        </Header>
      }
    >
      {query.isLoading ? (
        <Box textAlign="center" padding="m">
          <Spinner />
        </Box>
      ) : items.length === 0 ? (
        <EmptyState
          title="No hosted zones yet"
          subtitle="Create your first hosted zone to start managing DNS records."
        />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {items.map((zone) => (
              <tr key={zone.id} style={{ borderTop: '1px solid var(--color-border-divider-default, #e9ebed)' }}>
                <td style={{ padding: '8px 0' }}>
                  <Link
                    href={`/hosted-zones/${zone.id}`}
                    onFollow={(e) => {
                      e.preventDefault();
                      router.push(`/hosted-zones/${zone.id}`);
                    }}
                  >
                    {zone.name}
                  </Link>
                </td>
                <td style={{ padding: '8px 0', width: 90 }}>
                  <Badge color={zone.type === 'PUBLIC' ? 'blue' : 'grey'}>{zone.type}</Badge>
                </td>
                <td style={{ padding: '8px 0', width: 120 }}>
                  <Box color="text-body-secondary">{zone.record_count} records</Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  );
}
