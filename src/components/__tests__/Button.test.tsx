import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../shared/Button';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | string;
  className?: string;
}

describe('Button Component', () => {
  const renderButton = (props: Partial<ButtonProps> = {}) => {
    return render(<Button {...props} />);
  };

  it('should render button with text', () => {
    renderButton({ children: 'Click me' });
    
    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    renderButton({ children: 'Click me', onClick: handleClick });
    
    const button = screen.getByTestId('button');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    renderButton({ children: 'Disabled', disabled: true });
    
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('should not be disabled when disabled prop is false', () => {
    renderButton({ children: 'Enabled', disabled: false });
    
    const button = screen.getByTestId('button');
    expect(button).not.toBeDisabled();
  });

  it('should apply correct variant class', () => {
    renderButton({ children: 'Primary', variant: 'primary' });

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  it('should apply secondary variant class', () => {
    renderButton({ children: 'Secondary', variant: 'secondary' });

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('btn', 'btn-secondary');
  });

  it('should have proper button role', () => {
    renderButton({ children: 'Submit' });
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    const handleClick = jest.fn();
    renderButton({ children: 'Submit', onClick: handleClick });
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});
