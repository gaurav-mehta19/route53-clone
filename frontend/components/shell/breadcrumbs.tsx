'use client';

import BreadcrumbGroup, {
  type BreadcrumbGroupProps,
} from '@cloudscape-design/components/breadcrumb-group';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { useBreadcrumbLabels } from '@/providers/breadcrumb-provider';

const STATIC_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'hosted-zones': 'Hosted zones',
  'traffic-policies': 'Traffic policies',
  'health-checks': 'Health checks',
  resolver: 'Resolver',
  profiles: 'Profiles',
};

export function AppBreadcrumbs() {
  const router = useRouter();
  const pathname = usePathname() ?? '/dashboard';
  const dynamicLabels = useBreadcrumbLabels();

  const items = useMemo<BreadcrumbGroupProps.Item[]>(() => {
    const segments = pathname.split('/').filter(Boolean);
    const crumbs: BreadcrumbGroupProps.Item[] = [{ text: 'Route 53', href: '/dashboard' }];
    let acc = '';
    for (const seg of segments) {
      acc += `/${seg}`;
      const text = dynamicLabels[seg] ?? STATIC_LABELS[seg] ?? seg;
      crumbs.push({ text, href: acc });
    }
    return crumbs;
  }, [pathname, dynamicLabels]);

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
