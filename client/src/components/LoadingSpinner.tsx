import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`${sizes[size]} border-2 border-navy-600 border-t-brand-400 rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;
