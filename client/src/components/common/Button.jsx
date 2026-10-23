import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  onClick,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden tracking-tight';

  const variants = {
    primary: 'bg-gradient-to-r from-[#28A899] to-[#35D0BA] hover:from-[#35D0BA] hover:to-[#36BFC7] text-[#0B0D0F] font-semibold shadow-sm hover:shadow-md hover:shadow-[#35D0BA]/20 hover:-translate-y-0.5 focus:ring-[#35D0BA] border border-[#35D0BA]/40 active:translate-y-0',
    secondary: 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800 hover:border-slate-700 focus:ring-slate-500 hover:-translate-y-0.5 active:translate-y-0',
    outline: 'bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-slate-100 focus:ring-slate-500 hover:-translate-y-0.5 active:translate-y-0',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500/30 shadow-sm hover:shadow-rose-500/20 focus:ring-rose-500 hover:-translate-y-0.5 active:translate-y-0',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 focus:ring-slate-500',
    success: 'bg-emerald-600/90 hover:bg-emerald-600 text-white border border-emerald-500/30 shadow-sm focus:ring-emerald-500 hover:-translate-y-0.5 active:translate-y-0',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2 font-semibold',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : Icon
        ? <Icon className="w-3.5 h-3.5 shrink-0" />
        : null}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
