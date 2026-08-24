import React from 'react';
import Modal from './Modal.jsx';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 text-red-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm text-ink-600 dark:text-ink-300 pt-2">{description}</p>
    </div>
    <div className="mt-6 flex justify-end gap-2">
      <button className="btn-secondary" onClick={onClose} disabled={loading}>
        Cancel
      </button>
      <button className="btn-danger" onClick={onConfirm} disabled={loading}>
        {loading ? 'Working...' : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
