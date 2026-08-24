import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-xl2 bg-white dark:bg-ink-900 shadow-2xl animate-fadeIn`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-4 rounded-t-xl2">
          <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-4 rounded-b-xl2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
