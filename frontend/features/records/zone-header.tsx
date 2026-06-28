'use client';

import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import CopyToClipboard from '@cloudscape-design/components/copy-to-clipboard';
import Header from '@cloudscape-design/components/header';

import type { HostedZone } from '@/lib/types/hosted-zone';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <Box>{children}</Box>
    </div>
  );
}

export function ZoneHeader({ zone }: { zone: HostedZone }) {
  return (
    <Container header={<Header variant="h2">Hosted zone details</Header>}>
      <ColumnLayout columns={4} variant="text-grid">
        <Field label="Hosted zone ID">
          <Box variant="code" display="inline">
            {zone.id}
          </Box>{' '}
          <CopyToClipboard
            copyButtonAriaLabel="Copy hosted zone ID"
            copyErrorText="Failed to copy"
            copySuccessText="Copied"
            textToCopy={zone.id}
            variant="icon"
          />
        </Field>
        <Field label="Type">
          <Badge color={zone.type === 'PUBLIC' ? 'blue' : 'grey'}>{zone.type}</Badge>
        </Field>
        <Field label="Record count">{zone.record_count}</Field>
        <Field label="Description">{zone.comment ?? '—'}</Field>
      </ColumnLayout>
    </Container>
  );
}
