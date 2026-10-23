import React from 'react';

export const Card = ({ children, className = '', hover = false, glow = false, ...props }) => {
  return (
    <div
      className={`
        relative bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-sm
        transition-all duration-200
        ${hover ? 'hover:border-[#35D0BA]/35 hover:-translate-y-0.5 hover:shadow-md cursor-default' : ''}
        ${glow ? 'glow-teal border-[#35D0BA]/30' : ''}
        ${className}
      `}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1 mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-sm sm:text-base font-semibold text-slate-100 tracking-tight ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-slate-400 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between pt-4 mt-4 border-t border-slate-800 ${className}`}>
    {children}
  </div>
);

export default Card;
