'use client';

// Thin wrapper over Cloudscape Header so every page gets a consistent
// title/description/counter/actions layout without re-importing 4 pieces.

import Header, { type HeaderProps } from '@cloudscape-design/components/header';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  counter?: string;
  actions?: ReactNode;
  variant?: HeaderProps['variant'];
}

export function PageHeader({
  title,
  description,
  counter,
  actions,
  variant = 'h1',
}: PageHeaderProps) {
  return (
    <Header
      variant={variant}
      counter={counter}
      description={description}
      actions={actions}
    >
      {title}
    </Header>
  );
}
