import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import clsx from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)]',
  };

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        handleClose();
      }
    };

    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus?.();
      }
    };
  }, [isOpen, handleClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/85 animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={clsx(
          'relative w-full',
          sizes[size],
          'bg-dark-900 border border-dark-800 rounded-xl shadow-2xl',
          'animate-scale-in',
          'max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-dark-800 flex-shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-white tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-dark-400 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 -mr-1.5 -mt-1 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close modal"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={clsx(
            'flex-1 overflow-y-auto px-5 py-4',
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal footer for action buttons
const ModalActions = ({
  children,
  className = '',
  align = 'right',
  border = true,
}) => (
  <div
    className={clsx(
      'flex items-center gap-3 px-5 py-4 flex-shrink-0',
      border && 'border-t border-dark-800',
      align === 'right' && 'justify-end',
      align === 'left' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'between' && 'justify-between',
      className
    )}
  >
    {children}
  </div>
);

// Confirmation modal helper
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon: Icon,
}) => {
  const variantColors = {
    danger: {
      bg: 'bg-danger-500/15',
      border: 'border-danger-500/30',
      icon: 'text-danger-400',
    },
    warning: {
      bg: 'bg-warning-500/15',
      border: 'border-warning-500/30',
      icon: 'text-warning-400',
    },
    primary: {
      bg: 'bg-primary-500/15',
      border: 'border-primary-500/30',
      icon: 'text-primary-400',
    },
  };

  const colors = variantColors[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        {Icon && (
          <div
            className={clsx(
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border',
              colors.bg,
              colors.border
            )}
          >
            <Icon className={clsx('w-7 h-7', colors.icon)} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-dark-400 text-sm">{message}</p>
      </div>
      <ModalActions>
        <button
          onClick={onClose}
          disabled={isLoading}
          className="btn btn-ghost flex-1 sm:flex-none"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={clsx(
            'btn flex-1 sm:flex-none',
            variant === 'danger' && 'btn-danger',
            variant === 'warning' && 'btn-accent',
            variant === 'primary' && 'btn-primary'
          )}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading...
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </ModalActions>
    </Modal>
  );
};

Modal.Actions = ModalActions;

export default Modal;
