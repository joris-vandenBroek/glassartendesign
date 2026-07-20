import { describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useOverlayDismiss } from '@/lib/useOverlayDismiss';

function Harness({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);

  useOverlayDismiss({ isOpen, onClose, containerRef, initialFocusRef });

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={containerRef} data-testid="harness">
      <button ref={initialFocusRef} data-testid="first">
        First
      </button>
      <button data-testid="last">Last</button>
    </div>
  );
}

describe('useOverlayDismiss', () => {
  it('focuses the initial-focus element when isOpen is true', () => {
    render(<Harness isOpen onClose={vi.fn()} />);
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(<Harness isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab focus, wrapping from the last to the first focusable element', () => {
    render(<Harness isOpen onClose={vi.fn()} />);
    screen.getByTestId('last').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('traps Shift+Tab focus, wrapping from the first to the last focusable element', () => {
    render(<Harness isOpen onClose={vi.fn()} />);
    screen.getByTestId('first').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('last')).toHaveFocus();
  });

  it('restores focus to the previously focused element once isOpen becomes false', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    const { rerender } = render(<Harness isOpen onClose={vi.fn()} />);
    expect(screen.getByTestId('first')).toHaveFocus();

    rerender(<Harness isOpen={false} onClose={vi.fn()} />);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
