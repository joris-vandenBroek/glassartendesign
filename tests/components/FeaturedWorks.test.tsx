import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { FeaturedWorks } from '@/components/FeaturedWorks';
import messages from '../../messages/nl.json';

describe('FeaturedWorks', () => {
  it('renders the section label and 3 placeholder tiles', () => {
    renderWithIntl(<FeaturedWorks />, 'nl', messages);
    expect(screen.getByText('Uitgelichte werken')).toBeInTheDocument();
    expect(screen.getAllByTestId('work-placeholder')).toHaveLength(3);
  });
});
