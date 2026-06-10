import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

vi.mock('@/components/ConverterShell', () => ({
  default: () => <div data-testid="converter-shell" />,
}));

vi.mock('@/components/AdBanner', () => ({
  default: () => <div data-testid="ad-banner" />,
}));

describe('Home', () => {
  it('renders the CurrencyXchange brand', () => {
    render(<Home />);
    expect(screen.getByText('Currency')).toBeInTheDocument();
    expect(screen.getByText('Xchange')).toBeInTheDocument();
  });

  it('renders the main heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /currency converter/i, level: 1 })
    ).toBeInTheDocument();
  });

  it('renders the converter shell', () => {
    render(<Home />);
    expect(screen.getByTestId('converter-shell')).toBeInTheDocument();
  });

  it('renders the features section', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /why currencyxchange/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Real-Time Rates')).toBeInTheDocument();
    expect(screen.getByText('160+ Currencies')).toBeInTheDocument();
    expect(screen.getByText('Fast & Free')).toBeInTheDocument();
  });

  it('renders ad banners', () => {
    render(<Home />);
    expect(screen.getAllByTestId('ad-banner')).toHaveLength(3);
  });
});
