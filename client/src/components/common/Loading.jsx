import React from 'react';
import { Loader2, Cpu } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 text-slate-400">
      <Loader2 className={`${sizes[size]} animate-spin text-[#35D0BA]`} />
      {text && <p className="text-xs sm:text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};

export const LoadingPage = ({ message = 'Initializing Architecture Advisor...' }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-[#35D0BA]/10 border border-[#35D0BA]/25 text-[#35D0BA]">
        <Cpu className="w-7 h-7 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35D0BA] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#35D0BA]"></span>
        </span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-300 tracking-wide animate-pulse">{message}</p>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
    <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
    <div className="h-16 bg-slate-800/40 rounded w-full"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-7 bg-slate-800 rounded w-20"></div>
      <div className="h-7 bg-slate-800 rounded w-24"></div>
    </div>
  </div>
);

export default LoadingSpinner;
