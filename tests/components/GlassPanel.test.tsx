import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassPanel } from '@/components/GlassPanel';

describe('GlassPanel', () => {
  it('renders its children inside a glass panel section', () => {
    render(
      <GlassPanel>
        <p>Panel content</p>
      </GlassPanel>
    );
    const panel = screen.getByTestId('glass-panel');
    expect(panel).toContainElement(screen.getByText('Panel content'));
  });

  it('merges a custom className with the base styles', () => {
    render(
      <GlassPanel className="custom-class">
        <p>Panel content</p>
      </GlassPanel>
    );
    expect(screen.getByTestId('glass-panel')).toHaveClass('custom-class');
  });

  it('applies the id prop to the section for anchor links', () => {
    render(
      <GlassPanel id="contact">
        <p>Panel content</p>
      </GlassPanel>
    );
    expect(screen.getByTestId('glass-panel')).toHaveAttribute('id', 'contact');
  });
});
