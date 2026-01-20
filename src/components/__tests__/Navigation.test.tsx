import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../layout/Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the packages module
jest.mock('@/lib/packages', () => ({
  getAllPackages: () => [],
  formatCurrency: (price: number, currency: string) => `${currency} ${price}`,
}));

describe('Navbar Component', () => {
  const renderNavbar = () => {
    return render(<Navbar />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navbar with logo and navigation links', () => {
    renderNavbar();

    // Check for logo
    expect(screen.getByAltText('citymuscattours logo')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tour Packages')).toBeInTheDocument();
    expect(screen.getByText('Car Rental')).toBeInTheDocument();
    expect(screen.getByText('Airport Transport')).toBeInTheDocument();
    expect(screen.getByText('Hotel Booking')).toBeInTheDocument();
  });

  it('should have search functionality', () => {
    renderNavbar();

    // Check for search input (on desktop)
    const searchInput = screen.getByPlaceholderText('Find places and things to do');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
  });

  it('should have book now button', () => {
    renderNavbar();

    const bookButton = screen.getByText('Book Now');
    expect(bookButton).toBeInTheDocument();
    expect(bookButton).toHaveAttribute('href', '/booking');
  });

  it('should have mobile menu toggle', () => {
    renderNavbar();

    const menuButton = screen.getByLabelText('Toggle menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
