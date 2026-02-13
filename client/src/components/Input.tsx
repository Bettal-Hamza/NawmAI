import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        className={`bg-navy-700 border border-navy-600 rounded-xl px-4 py-3 text-slate-100
          placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:ring-2
          focus:ring-brand-400/25 transition-all duration-200 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
