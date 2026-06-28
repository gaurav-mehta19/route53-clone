'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from '@/providers/auth-provider';
import { BreadcrumbProvider } from '@/providers/breadcrumb-provider';
import { NotificationsProvider } from '@/providers/notifications-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <BreadcrumbProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </BreadcrumbProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
