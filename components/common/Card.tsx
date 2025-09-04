
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const cursorStyle = onClick ? 'cursor-pointer' : '';
  const transitionStyle = onClick ? 'transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden ${transitionStyle} ${cursorStyle} ${className}`}
      onClick={onClick}
    >
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default Card;
