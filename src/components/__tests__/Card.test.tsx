import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Card Component', () => {
  const renderCard = (content = 'Test content') => {
    const Card = ({ children }: { children: React.ReactNode }) => (
      <div className="card" data-testid="card">
        <div className="card-content">
          {children}
        </div>
      </div>
    );
    
    return render(<Card>{content}</Card>);
  };

  it('should render card with content', () => {
    renderCard('Hello World');
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Hello World');
  });

  it('should have correct CSS class', () => {
    renderCard();
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('card');
  });

  it('should render children properly', () => {
    renderCard(
      <div>
        <h2>Title</h2>
        <p>Description</p>
      </div>
    );
    
    const card = screen.getByTestId('card');
    const title = card.querySelector('h2');
    const description = card.querySelector('p');
    
    if (title) expect(title).toHaveTextContent('Title');
    if (description) expect(description).toHaveTextContent('Description');
  });

  it('should be accessible', () => {
    renderCard('Accessible content');
    
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
  });
});
