import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer tracking-tight';

  const variants = {
    primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm shadow-amber-900/10 active:scale-[0.98]',
    secondary: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 focus:ring-stone-400 active:scale-[0.98]',
    dark: 'bg-stone-900 text-white hover:bg-stone-800 focus:ring-stone-700 active:scale-[0.98]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
    success: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-amber-500',
    ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-300'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-4.5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
