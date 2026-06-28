'use client';

import BreadcrumbGroup, {
  type BreadcrumbGroupProps,
} from '@cloudscape-design/components/breadcrumb-group';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'hosted-zones': 'Hosted zones',
  'traffic-policies': 'Traffic policies',
  'health-checks': 'Health checks',
  resolver: 'Resolver',
  profiles: 'Profiles',
};

function labelFor(segment: string): string {
  return LABELS[segment] ?? segment;
}

export function AppBreadcrumbs() {
  const router = useRouter();
  const pathname = usePathname() ?? '/dashboard';

  const items = useMemo<BreadcrumbGroupProps.Item[]>(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbGroupProps.Item[] = [{ text: 'Route 53', href: '/dashboard' }];
    let acc = '';
    for (const seg of segments) {
      acc += `/${seg}`;
      crumbs.push({ text: labelFor(seg), href: acc });
    }
    return crumbs;
  }, [pathname]);

  return (
    <BreadcrumbGroup
      items={items}
      ariaLabel="Breadcrumbs"
      onFollow={(e) => {
        e.preventDefault();
        router.push(e.detail.href);
      }}
    />
  );
}
