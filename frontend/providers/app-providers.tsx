'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from '@/providers/auth-provider';
import { BreadcrumbProvider } from '@/providers/breadcrumb-provider';
import { NotificationsProvider } from '@/providers/notifications-provider';
import { QueryProvider } from '@/providers/query-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <BreadcrumbProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </BreadcrumbProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
