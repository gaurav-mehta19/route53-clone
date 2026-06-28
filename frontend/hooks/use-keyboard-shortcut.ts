'use client';

import { useEffect } from 'react';

interface Options {
  /** Single key, lowercase. */
  key: string;
  enabled?: boolean;
  /** Skip when focus is in any text input — avoids hijacking typing. */
  skipInInputs?: boolean;
}

function isTypingInside(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcut(opts: Options, handler: () => void): void {
  const { key, enabled = true, skipInInputs = true } = opts;
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (skipInInputs && isTypingInside(e.target)) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, enabled, skipInInputs, handler]);
}
