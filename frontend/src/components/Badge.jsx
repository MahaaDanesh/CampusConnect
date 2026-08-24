import React from 'react';

const colorMap = {
  // roles
  student: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  faculty: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  admin: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  // statuses
  open: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  'in-progress': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  claimed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  closed: 'bg-ink-200 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
  upcoming: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  ongoing: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  // priority
  low: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  // lost/found
  lost: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  found: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  default: 'bg-ink-100 text-ink-600 dark:bg-ink-700 dark:text-ink-300',
};

const Badge = ({ children, tone, className = '' }) => {
  const key = (tone || String(children)).toString().toLowerCase();
  const classes = colorMap[key] || colorMap.default;
  return <span className={`badge capitalize ${classes} ${className}`}>{children}</span>;
};

export default Badge;
