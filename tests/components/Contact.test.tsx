import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { Contact } from '@/components/Contact';
import messages from '../../messages/nl.json';

describe('Contact', () => {
  it('renders contact details and exposes the #contact anchor', () => {
    renderWithIntl(<Contact />, 'nl', messages);
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'info@glassartanddesign.nl' })
    ).toHaveAttribute('href', 'mailto:info@glassartanddesign.nl');
    expect(screen.getByText(/\+31 \(0\)6 12345678/)).toBeInTheDocument();
    expect(screen.getByTestId('glass-panel')).toHaveAttribute('id', 'contact');
  });
});
