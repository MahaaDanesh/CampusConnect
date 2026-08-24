import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        className="btn-ghost !px-2.5"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-ink-500 dark:text-ink-400">
        Page <span className="font-medium text-ink-800 dark:text-ink-100">{page}</span> of {pages}
      </span>
      <button
        className="btn-ghost !px-2.5"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
