import React from 'react';

interface SnbLogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'light' | 'dark';
}

export const SnbLogo: React.FC<SnbLogoProps> = ({
  className = '',
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Official attached emblem with transparent background */}
      <img
        src="/images/header-logo.png?v=3"
        alt="Surge Cup 2026 - البنك الأهلي السعودي"
        className="h-8 sm:h-10 w-auto object-contain block transition-all"
        loading="eager"
      />
      {showText && null}
    </div>
  );
};

