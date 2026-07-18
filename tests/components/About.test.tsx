import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { About } from '@/components/About';
import messages from '../../messages/nl.json';

describe('About', () => {
  it('renders the about label and text for the given locale', () => {
    renderWithIntl(<About />, 'nl', messages);
    expect(screen.getByText('Over ons')).toBeInTheDocument();
    expect(
      screen.getByText(/Glassart and Design vervaardigt kunstwerken/)
    ).toBeInTheDocument();
  });
});
