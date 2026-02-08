import clsx from 'clsx';

const variants = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  gray: 'badge-gray',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const dotColors = {
  primary: 'bg-primary-400',
  secondary: 'bg-secondary-400',
  accent: 'bg-accent-400',
  gray: 'bg-dark-400',
  success: 'bg-success-400',
  warning: 'bg-warning-400',
  danger: 'bg-danger-400',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  pill = true,
  className = '',
  ...props
}) => {
  return (
    <span
      className={clsx(
        'badge',
        variants[variant],
        sizes[size],
        pill ? 'rounded-full' : 'rounded-md',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColors[variant]
          )}
        />
      )}
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

// Count badge for notifications
export const CountBadge = ({
  count,
  max = 99,
  variant = 'danger',
  size = 'sm',
  className = '',
}) => {
  if (!count || count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center font-bold rounded-full min-w-[18px] h-[18px] px-1',
        size === 'xs' && 'min-w-[14px] h-[14px] text-[9px]',
        size === 'sm' && 'min-w-[18px] h-[18px] text-[10px]',
        size === 'md' && 'min-w-[20px] h-[20px] text-xs',
        variant === 'danger' && 'bg-danger-500 text-white',
        variant === 'primary' && 'bg-primary-500 text-white',
        variant === 'secondary' && 'bg-secondary-500 text-white',
        variant === 'warning' && 'bg-warning-500 text-dark-900',
        className
      )}
    >
      {displayCount}
    </span>
  );
};

// Status badge with standardized states
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'gray', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    approved: { variant: 'success', label: 'Approved', dot: true },
    rejected: { variant: 'danger', label: 'Rejected', dot: true },
    banned: { variant: 'danger', label: 'Banned', dot: true },
    online: { variant: 'success', label: 'Online', dot: true },
    offline: { variant: 'gray', label: 'Offline', dot: true },
    away: { variant: 'warning', label: 'Away', dot: true },
    busy: { variant: 'danger', label: 'Busy', dot: true },
  };

  const config = statusConfig[status?.toLowerCase()] || {
    variant: 'gray',
    label: status,
    dot: false,
  };

  return (
    <Badge
      variant={config.variant}
      size="sm"
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default Badge;
