import React from 'react';
import { Search, Plus } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative flex-1 min-w-[200px]">
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9"
    />
  </div>
);

export const SelectFilter = ({ value, onChange, options, placeholder = 'All' }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="input !w-auto capitalize">
    <option value="">{placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt} className="capitalize">
        {opt}
      </option>
    ))}
  </select>
);

export const Toolbar = ({ children }) => (
  <div className="flex flex-wrap items-center gap-3 mb-5">{children}</div>
);

export const PrimaryActionButton = ({ onClick, label, icon: Icon = Plus }) => (
  <button onClick={onClick} className="btn-primary ml-auto">
    <Icon className="h-4 w-4" /> {label}
  </button>
);
