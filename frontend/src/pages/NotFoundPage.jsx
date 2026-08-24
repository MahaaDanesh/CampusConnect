import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 dark:bg-ink-950 px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
      <Compass className="h-8 w-8" />
    </div>
    <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">Page not found</h1>
    <p className="max-w-sm text-sm text-ink-500">The page you're looking for doesn't exist or may have been moved.</p>
    <Link to="/dashboard" className="btn-primary mt-2">
      Back to dashboard
    </Link>
  </div>
);

export default NotFoundPage;
