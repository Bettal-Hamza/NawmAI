import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-navy-800 rounded-2xl border border-navy-700 p-6
        ${hover
          ? 'hover:border-brand-400/25 hover:shadow-lg hover:shadow-brand-400/5 hover:scale-[1.015] transition-all duration-200'
          : 'transition-colors duration-200'
        }
        ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
