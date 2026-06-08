import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Home', () => {
  it('renders the Next.js logo', () => {
    render(<Home />);
    expect(screen.getByAltText('Next.js logo')).toBeInTheDocument();
  });

  it('renders the getting-started heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /to get started, edit the page\.tsx file/i })
    ).toBeInTheDocument();
  });

  it('renders the Templates link with correct href', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /templates/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('vercel.com/templates'));
  });

  it('renders the Learning link with correct href', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /learning/i });
    expect(link).toHaveAttribute('href', expect.stringContaining('nextjs.org/learn'));
  });

  it('renders the Deploy Now link opening in a new tab', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /deploy now/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Documentation link opening in a new tab', () => {
    render(<Home />);
    const link = screen.getByRole('link', { name: /documentation/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
