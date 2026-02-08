import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import clsx from 'clsx';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = 'text',
      className = '',
      containerClassName = '',
      inputClassName = '',
      size = 'md',
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizeClasses = {
      sm: 'py-1.5 text-sm',
      md: 'py-2 text-sm',
      lg: 'py-2.5 text-base',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label className="flex items-center gap-1 text-sm font-medium text-dark-200 mb-1.5">
            {label}
            {required && <span className="text-danger-400">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none',
                iconSizes[size]
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              error ? 'input-error' : 'input',
              sizeClasses[size],
              className,
              inputClassName
            )}
            style={{
              paddingLeft: leftIcon ? '2.5rem' : '0.875rem',
              paddingRight: rightIcon || isPassword || error ? '2.5rem' : '0.875rem',
            }}
            {...props}
          />
          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && !isPassword && (
              <FiAlertCircle className={clsx('text-danger-400', iconSizes[size])} />
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-dark-500 hover:text-dark-300 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <FiEyeOff className={iconSizes[size]} />
                ) : (
                  <FiEye className={iconSizes[size]} />
                )}
              </button>
            )}
            {rightIcon && !isPassword && (
              <div className={clsx('text-dark-500', iconSizes[size])}>
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-danger-400' : 'text-dark-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      containerClassName = '',
      required = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label className="flex items-center gap-1 text-sm font-medium text-dark-200 mb-1.5">
            {label}
            {required && <span className="text-danger-400">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            error ? 'input-error' : 'input',
            'resize-y min-h-[80px]',
            className
          )}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-danger-400' : 'text-dark-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select component
export const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = 'Select...',
      className = '',
      containerClassName = '',
      required = false,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'py-1.5 text-sm',
      md: 'py-2 text-sm',
      lg: 'py-2.5 text-base',
    };

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label className="flex items-center gap-1 text-sm font-medium text-dark-200 mb-1.5">
            {label}
            {required && <span className="text-danger-400">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            error ? 'input-error' : 'input',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p
            className={clsx(
              'mt-1.5 text-sm',
              error ? 'text-danger-400' : 'text-dark-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Checkbox component
export const Checkbox = forwardRef(
  ({ label, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <label
        className={clsx(
          'flex items-center gap-2.5 cursor-pointer group',
          containerClassName
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            'w-4 h-4 rounded border-2 border-dark-600 bg-dark-900',
            'checked:bg-primary-500 checked:border-primary-500',
            'focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
            'transition-colors cursor-pointer',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-dark-200 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Input;
