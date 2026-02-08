import { forwardRef } from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
  xl: 'px-6 py-3 text-base gap-2.5',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-5 h-5',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          'btn',
          variants[variant],
          sizes[size],
          iconOnly && '!px-2',
          'touch-target',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className={clsx('animate-spin', iconSizes[size])}
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {!iconOnly && <span>Loading...</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={clsx('flex-shrink-0', iconSizes[size])}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={clsx('flex-shrink-0', iconSizes[size])}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon button variant for compact actions
export const IconButton = forwardRef(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      'aria-label': ariaLabel,
      className = '',
      ...props
    },
    ref
  ) => {
    const iconButtonSizes = {
      xs: 'w-7 h-7',
      sm: 'w-8 h-8',
      md: 'w-9 h-9',
      lg: 'w-10 h-10',
      xl: 'w-11 h-11',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        className={clsx(
          'btn !p-0 flex items-center justify-center',
          variants[variant],
          iconButtonSizes[size],
          className
        )}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button group for related actions
export const ButtonGroup = ({ children, className = '' }) => (
  <div
    className={clsx(
      'flex items-center',
      '[&>button]:rounded-none',
      '[&>button:first-child]:rounded-l-lg',
      '[&>button:last-child]:rounded-r-lg',
      '[&>button:not(:last-child)]:border-r-0',
      className
    )}
  >
    {children}
  </div>
);

export default Button;
