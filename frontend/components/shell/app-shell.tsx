'use client';

import AppLayout from '@cloudscape-design/components/app-layout';
import Spinner from '@cloudscape-design/components/spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { AppBreadcrumbs } from '@/components/shell/breadcrumbs';
import { AppSideNavigation } from '@/components/shell/side-navigation';
import { AppTopNavigation } from '@/components/shell/top-navigation';
import { NotificationsFlashbar } from '@/providers/notifications-provider';
import { useAuth } from '@/providers/auth-provider';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <>
      <AppTopNavigation />
      <AppLayout
        navigation={<AppSideNavigation />}
        breadcrumbs={<AppBreadcrumbs />}
        notifications={<NotificationsFlashbar />}
        toolsHide
        contentType="default"
        content={children}
      />
    </>
  );
}
