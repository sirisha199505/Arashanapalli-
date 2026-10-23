import { useEffect } from 'react';
import Icon from './Icon';

const PLACEMENT = {
  center: 'items-end justify-center sm:items-center sm:p-4',
  right: 'justify-end',
};

const PANEL = {
  center: 'w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh]',
  right: 'h-full w-full max-w-2xl',
};

/** Shared overlay: brand picker (center / bottom sheet on phones) and quote drawer (right). */
export default function Modal({ open, onClose, title, placement = 'center', footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm ${PLACEMENT[placement]}`} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex flex-col border border-line bg-surface shadow-2xl ${PANEL[placement]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
