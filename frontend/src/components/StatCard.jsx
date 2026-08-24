import React from 'react';

const toneMap = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
};

const StatCard = ({ icon: Icon, label, value, tone = 'brand', sub }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-display font-bold text-ink-900 dark:text-white leading-tight">{value}</p>
      <p className="text-sm text-ink-500 dark:text-ink-400 truncate">{label}</p>
      {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default StatCard;
