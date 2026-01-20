import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card bg-white rounded-lg shadow-md ${className}`.trim()} data-testid="card">
      <div className="card-content p-4">
        {children}
      </div>
    </div>
  );
}