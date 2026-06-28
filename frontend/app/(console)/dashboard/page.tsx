'use client';

import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';

export default function DashboardPage() {
  return (
    <ContentLayout
      header={<Header variant="h1">Route 53 dashboard</Header>}
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Welcome</Header>}>
          <Box>
            Use the navigation on the left to manage hosted zones and DNS records.
            Dashboard metrics land in Phase 9.
          </Box>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
