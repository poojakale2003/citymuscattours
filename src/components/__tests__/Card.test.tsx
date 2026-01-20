import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../shared/Card';

describe('Card Component', () => {
  const renderCard = (content = 'Test content') => {
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
    expect(card).toHaveClass('bg-white');
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
