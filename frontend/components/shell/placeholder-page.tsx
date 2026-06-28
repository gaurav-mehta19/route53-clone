'use client';

// Shared "Coming soon" placeholder reused by sections that land in later phases.
// Keeps the chrome consistent so navigation feels solid even pre-Phase 9.

import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import Container from '@cloudscape-design/components/container';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <ContentLayout header={<Header variant="h1">{title}</Header>}>
      <Container>
        <Box textAlign="center" padding="xxl" color="text-body-secondary">
          <b>Coming soon.</b>
          {description ? (
            <Box variant="p" padding={{ top: 's' }}>
              {description}
            </Box>
          ) : null}
        </Box>
      </Container>
    </ContentLayout>
  );
}
