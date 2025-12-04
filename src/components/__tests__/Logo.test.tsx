import { render, screen } from '@testing-library/react';
import Logo from '../shared/Logo';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('Logo component', () => {
  it('should render logo component', () => {
    render(<Logo />);
    const image = screen.getByAltText('citymuscattours logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/logo.jpg');
  });

  it('should have sr-only text', () => {
    render(<Logo />);
    const srText = screen.getByText('citymuscattours');
    expect(srText).toHaveClass('sr-only');
  });
});

