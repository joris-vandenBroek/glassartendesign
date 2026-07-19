import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/Logo';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Logo', () => {
  it('links to the homepage and shows the wordmark', () => {
    render(<Logo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('href', '/');
    expect(logo).toHaveTextContent('GLASSART');
    expect(logo).toHaveTextContent('& DESIGN');
  });
});
