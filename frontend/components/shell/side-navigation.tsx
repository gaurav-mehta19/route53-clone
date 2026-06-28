'use client';

import SideNavigation, {
  type SideNavigationProps,
} from '@cloudscape-design/components/side-navigation';
import { usePathname, useRouter } from 'next/navigation';

const ITEMS: SideNavigationProps.Item[] = [
  { type: 'link', text: 'Dashboard', href: '/dashboard' },
  { type: 'divider' },
  { type: 'link', text: 'Hosted zones', href: '/hosted-zones' },
  { type: 'link', text: 'Traffic policies', href: '/traffic-policies' },
  { type: 'link', text: 'Health checks', href: '/health-checks' },
  { type: 'divider' },
  { type: 'link', text: 'Resolver', href: '/resolver' },
  { type: 'link', text: 'Profiles', href: '/profiles' },
];

export function AppSideNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SideNavigation
      header={{ text: 'Route 53', href: '/dashboard' }}
      activeHref={pathname ?? '/dashboard'}
      items={ITEMS}
      onFollow={(e) => {
        if (e.detail.external) return;
        e.preventDefault();
        router.push(e.detail.href);
      }}
    />
  );
}
