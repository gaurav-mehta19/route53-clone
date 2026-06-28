'use client';

// Cloudscape-native dark mode. applyMode flips the visual mode globally;
// we just persist the user's choice to localStorage so a refresh keeps it.

import { Mode, applyMode } from '@cloudscape-design/global-styles';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'r53.theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(): Theme {
  if (typeof window === 'undefined') return 'light';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = readStored();
    queueMicrotask(() => {
      applyMode(stored === 'dark' ? Mode.Dark : Mode.Light);
      setTheme(stored);
    });
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyMode(next === 'dark' ? Mode.Dark : Mode.Light);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
