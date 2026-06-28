'use client';

// Lets a page register a friendly label for a path segment, so the
// deep route /hosted-zones/Z3KX… shows "example.com." in the breadcrumb
// instead of the raw zone id.

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Labels = Record<string, string>;

interface BreadcrumbContextValue {
  labels: Labels;
  set: (key: string, label: string | null | undefined) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Labels>({});

  const set = (key: string, label: string | null | undefined) => {
    setLabels((prev) => {
      if (label == null) {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (prev[key] === label) return prev;
      return { ...prev, [key]: label };
    });
  };

  return (
    <BreadcrumbContext.Provider value={{ labels, set }}>{children}</BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbLabels(): Labels {
  return useContext(BreadcrumbContext)?.labels ?? {};
}

export function useRegisterBreadcrumb(key: string, label: string | null | undefined): void {
  const ctx = useContext(BreadcrumbContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.set(key, label);
    return () => ctx.set(key, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, label]);
}
