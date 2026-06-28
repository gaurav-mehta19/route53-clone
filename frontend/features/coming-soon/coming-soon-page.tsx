'use client';

// Richer "Coming soon" treatment for sections that aren't part of the
// records-management slice this clone implements. Each page still gets
// a real Route 53-style title + description, an info callout, and a
// concise capability list so the chrome doesn't feel like a stub.

import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface ComingSoonPageProps {
  title: string;
  /** One-paragraph description of what this Route 53 feature does in real AWS. */
  description: string;
  /** Bulleted capabilities — keep each entry to a short phrase. */
  capabilities: string[];
}

export function ComingSoonPage({ title, description, capabilities }: ComingSoonPageProps) {
  return (
    <ContentLayout header={<Header variant="h1" description={description}>{title}</Header>}>
      <SpaceBetween size="l">
        <Alert type="info" header="Not yet implemented in this clone">
          This section mirrors the layout of the real AWS Route 53 console but is not
          wired up. The clone focuses on hosted zones and DNS records.
        </Alert>
        <Container header={<Header variant="h2">What this would do</Header>}>
          <ColumnLayout columns={2}>
            {capabilities.map((cap) => (
              <div key={cap}>
                <Box variant="strong">•</Box> {cap}
              </div>
            ))}
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
