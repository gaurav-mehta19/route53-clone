import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

function press(key: string, target?: HTMLElement) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  if (target) {
    Object.defineProperty(event, 'target', { value: target });
  }
  window.dispatchEvent(event);
}

describe('useKeyboardShortcut', () => {
  it('fires the handler when the key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'c' }, handler));
    press('c');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'c' }, handler));
    press('x');
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects the enabled flag', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'c', enabled: false }, handler));
    press('c');
    expect(handler).not.toHaveBeenCalled();
  });

  it('skips when typing inside an input', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'c' }, handler));
    const input = document.createElement('input');
    document.body.appendChild(input);
    press('c', input);
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
