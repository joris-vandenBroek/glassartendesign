import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithIntl } from '../test-utils';
import { WhyUs } from '@/components/WhyUs';
import messages from '../../messages/nl.json';

describe('WhyUs', () => {
  it('renders the section title', () => {
    renderWithIntl(<WhyUs />, 'nl', messages);
    expect(screen.getByText('Waarom Glassart & Design')).toBeInTheDocument();
  });

  it('renders all 5 USP icons with their labels', () => {
    renderWithIntl(<WhyUs />, 'nl', messages);
    expect(screen.getByTestId('usp-quality')).toHaveTextContent('Gallery Quality');
    expect(screen.getByTestId('usp-safetyGlass')).toHaveTextContent('4mm Veiligheidsglas');
    expect(screen.getByTestId('usp-uvResistant')).toHaveTextContent('UV-bestendig & kleurvast');
    expect(screen.getByTestId('usp-sharpDetails')).toHaveTextContent('Haarscherpe details');
    expect(screen.getByTestId('usp-durable')).toHaveTextContent('Duurzaam & milieuvriendelijk');
  });

  it('renders all 6 materials with name and description', () => {
    renderWithIntl(<WhyUs />, 'nl', messages);
    expect(screen.getAllByTestId(/^material-/)).toHaveLength(6);
    expect(screen.getByTestId('material-safety-glass')).toHaveTextContent('4mm Veiligheidsglas');
    expect(screen.getByTestId('material-safety-glass')).toHaveTextContent('Onze specialiteit');
    expect(screen.getByTestId('material-dibond')).toHaveTextContent('Dibond 3mm');
    expect(screen.getByTestId('material-acoustic-fabric')).toHaveTextContent('Akoestische stof');
  });
});
