'use client';

import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <Box textAlign="center" padding={{ vertical: 'xxl' }} color="inherit">
      <SpaceBetween size="m">
        <div>
          <Box variant="strong" textAlign="center" color="inherit">
            {title}
          </Box>
          {subtitle ? (
            <Box variant="p" padding={{ top: 'xs' }} color="text-body-secondary">
              {subtitle}
            </Box>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </SpaceBetween>
    </Box>
  );
}
