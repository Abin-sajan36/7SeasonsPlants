import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  isLight?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
  isLight = false,
}) => {
  const sizeClasses = {
    sm: 'w-28 md:w-32',
    md: 'w-36 md:w-48',
    lg: 'w-56 md:w-64',
    xl: 'w-72 md:w-80',
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <img 
        src="/logo-flawless2.png" 
        alt="7SEASONS by Mannaratharayil Gardens LLP Logo"
        className={`${sizeClasses[size]} h-auto object-contain drop-shadow-sm`}
      />
    </div>
  );
};
