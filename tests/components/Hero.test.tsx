import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { Hero } from '@/components/Hero';
import messages from '../../messages/nl.json';

describe('Hero', () => {
  it('renders the hero copy and CTA for the given locale', () => {
    renderWithIntl(<Hero />, 'nl', messages);
    expect(screen.getByText('Kunst op glas,')).toBeInTheDocument();
    expect(screen.getByText('vakkundig gemonteerd')).toBeInTheDocument();
    expect(
      screen.getByText('Gehard veiligheidsglas · 4mm · incl. montagehaken')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Neem contact op' })
    ).toHaveAttribute('href', '#contact');
  });
});
