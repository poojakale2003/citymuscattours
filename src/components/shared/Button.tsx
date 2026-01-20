import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | string;
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const baseClasses = 'btn transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'btn-primary bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'btn-secondary bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  };

  const classes = `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.primary} ${className}`.trim();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      data-testid="button"
    >
      {children}
    </button>
  );
}