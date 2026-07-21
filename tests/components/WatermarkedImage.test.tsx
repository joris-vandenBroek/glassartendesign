import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WatermarkedImage } from '@/components/WatermarkedImage';

describe('WatermarkedImage', () => {
  it('renders the image with the given src and alt text', () => {
    render(<WatermarkedImage src="https://example.com/foto.jpg" alt="Een kunstwerk" />);
    const img = screen.getByRole('img', { name: 'Een kunstwerk' });
    expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });

  it('renders a non-interactive watermark overlay with the copyright text', () => {
    render(<WatermarkedImage src="https://example.com/foto.jpg" alt="Een kunstwerk" />);
    const overlay = screen.getByTestId('watermark-overlay');
    expect(overlay).toHaveTextContent('© Glassart & Design');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies an extra className to the wrapper when given', () => {
    render(<WatermarkedImage src="https://example.com/foto.jpg" alt="Een kunstwerk" className="h-12 w-12" />);
    expect(screen.getByTestId('watermarked-image')).toHaveClass('h-12', 'w-12');
  });
});
