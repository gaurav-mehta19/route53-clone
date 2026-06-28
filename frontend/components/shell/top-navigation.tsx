'use client';

import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/providers/auth-provider';

export function AppTopNavigation() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <TopNavigation
      identity={{
        href: '/dashboard',
        title: 'AWS Console (Clone)',
        onFollow: (e) => {
          e.preventDefault();
          router.push('/dashboard');
        },
      }}
      utilities={[
        { type: 'button', text: 'us-east-1', iconName: 'globe' },
        {
          type: 'menu-dropdown',
          text: user?.display_name ?? 'Account',
          description: user?.email,
          iconName: 'user-profile',
          items: [
            { id: 'logout', text: 'Sign out' },
          ],
          onItemClick: (e) => {
            if (e.detail.id === 'logout') {
              void logout().then(() => router.push('/login'));
            }
          },
        },
      ]}
    />
  );
}
