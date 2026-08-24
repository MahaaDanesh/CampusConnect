import React from 'react';
import { Loader2, Inbox, AlertTriangle, RefreshCcw } from 'lucide-react';

export const Spinner = ({ className = '' }) => (
  <Loader2 className={`animate-spin ${className}`} />
);

export const PageLoader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink-400">
    <Spinner className="h-7 w-7 text-brand-500" />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({ icon: Icon = Inbox, title = 'Nothing here yet', description = '', action = null }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-ink-200 dark:border-ink-700 py-16 px-6 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-400">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-display font-semibold text-ink-700 dark:text-ink-100">{title}</h3>
    {description && <p className="max-w-sm text-sm text-ink-400">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 py-16 px-6 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-500">
      <AlertTriangle className="h-6 w-6" />
    </div>
    <h3 className="font-display font-semibold text-red-700 dark:text-red-300">Couldn't load this</h3>
    <p className="max-w-sm text-sm text-red-500 dark:text-red-400">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary mt-1">
        <RefreshCcw className="h-4 w-4" /> Try again
      </button>
    )}
  </div>
);

export const InlineSpinner = ({ label = 'Loading' }) => (
  <div className="flex items-center gap-2 text-sm text-ink-400 py-6 justify-center">
    <Spinner className="h-4 w-4" /> {label}
  </div>
);
