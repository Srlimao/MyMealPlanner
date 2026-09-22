import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-neutral-700 active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
