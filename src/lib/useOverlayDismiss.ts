'use client';

import { useEffect, useRef, type RefObject } from 'react';

interface UseOverlayDismissOptions {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement>;
  initialFocusRef: RefObject<HTMLElement>;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useOverlayDismiss({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
}: UseOverlayDismissOptions): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = containerRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        );
        if (!focusable || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, containerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen, initialFocusRef]);
}
