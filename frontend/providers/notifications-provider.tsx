'use client';

// Lightweight notifications queue rendered as a Cloudscape Flashbar.
// Resource pages call `notify({ type, header, content })` after mutations.

import Flashbar, { type FlashbarProps } from '@cloudscape-design/components/flashbar';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type Item = FlashbarProps.MessageDefinition;
type NewItem = Omit<Item, 'id' | 'dismissible' | 'onDismiss'>;

interface NotificationsContextValue {
  notify: (item: NewItem) => void;
  items: Item[];
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const notify = useCallback(
    (incoming: NewItem) => {
      const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const item: Item = {
        id,
        dismissible: true,
        onDismiss: () => remove(id),
        ...incoming,
      };
      setItems((prev) => [...prev, item]);
    },
    [remove],
  );

  const value = useMemo(() => ({ notify, items }), [notify, items]);

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
  return ctx;
}

export function NotificationsFlashbar() {
  const { items } = useNotifications();
  return <Flashbar items={items} stackItems />;
}
