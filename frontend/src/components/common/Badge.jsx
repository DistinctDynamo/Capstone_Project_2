const variants = {
  primary: 'badge-primary',
  accent: 'badge-accent',
  gray: 'badge-gray',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  dot = false,
}) => {
  return (
    <span className={`${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span
          className={`
            w-2 h-2 rounded-full
            ${variant === 'primary' ? 'bg-primary-400' : ''}
            ${variant === 'accent' ? 'bg-accent-400' : ''}
            ${variant === 'gray' ? 'bg-dark-400' : ''}
            ${variant === 'success' ? 'bg-green-400' : ''}
            ${variant === 'warning' ? 'bg-yellow-400' : ''}
            ${variant === 'danger' ? 'bg-red-400' : ''}
          `}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
