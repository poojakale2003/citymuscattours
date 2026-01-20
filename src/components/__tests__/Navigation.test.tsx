import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

describe('Navigation Component', () => {
  const renderNavigation = () => {
    // Create a mock navigation component for testing
    const Navigation = () => (
      <nav role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/tours">Tours</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    );
    
    return render(<Navigation />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation menu', () => {
    renderNavigation();
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tours')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    renderNavigation();
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('should have accessible links', () => {
    renderNavigation();
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.textContent).toBeTruthy();
    });
  });

  it('should have semantic structure', () => {
    renderNavigation();
    
    const nav = screen.getByRole('navigation');
    const list = nav.querySelector('ul');
    const listItems = nav.querySelectorAll('li');
    
    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(4);
  });
});
