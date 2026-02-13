import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const base = `font-semibold rounded-xl transition-all duration-200 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]`;

  const variants = {
    primary: `bg-brand-400 hover:bg-brand-500 text-black
      shadow-lg shadow-brand-400/20 hover:shadow-brand-400/35`,
    secondary: `bg-navy-700 hover:bg-navy-600 text-slate-100
      border border-navy-600 hover:border-brand-400/30`,
    ghost: 'bg-transparent hover:bg-navy-800 text-slate-300 hover:text-slate-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
