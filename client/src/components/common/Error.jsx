import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import Button from './Button';

export const ErrorAlert = ({ message = 'An error occurred', title = 'Error', onRetry }) => {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start space-x-3 text-rose-300">
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/80 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="text-rose-300 hover:bg-rose-500/20 hover:text-rose-100"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export const ErrorPage = ({ message = 'Failed to load requested resource', onRetry }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
        <XCircle className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-100">Something went wrong</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorAlert;
