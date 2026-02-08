import clsx from 'clsx';

const variants = {
  default: 'card',
  hover: 'card card-hover',
  interactive: 'card card-interactive',
  accent: 'card card-accent',
  'accent-secondary': 'card card-accent-secondary',
};

const Card = ({
  children,
  variant = 'default',
  className = '',
  as: Component = 'div',
  noPadding = false,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        variants[variant],
        noPadding && '!p-0',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardHeader = ({ children, className = '', border = true }) => (
  <div
    className={clsx(
      'px-5 py-4',
      border && 'border-b border-dark-800',
      className
    )}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className = '', as: Tag = 'h3' }) => (
  <Tag
    className={clsx(
      'text-lg font-semibold text-white tracking-tight',
      className
    )}
  >
    {children}
  </Tag>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={clsx('text-dark-400 text-sm mt-1', className)}>
    {children}
  </p>
);

const CardContent = ({ children, className = '', padding = true }) => (
  <div className={clsx(padding && 'p-5', className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', border = true }) => (
  <div
    className={clsx(
      'px-5 py-4',
      border && 'border-t border-dark-800',
      className
    )}
  >
    {children}
  </div>
);

// Stat card for dashboard numbers
const CardStat = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  trendUp,
  accentColor = 'primary',
  className = '',
}) => {
  const accentColors = {
    primary: {
      bg: 'bg-primary-500/15',
      text: 'text-primary-400',
      border: 'border-primary-500/30',
    },
    secondary: {
      bg: 'bg-secondary-500/15',
      text: 'text-secondary-400',
      border: 'border-secondary-500/30',
    },
    accent: {
      bg: 'bg-accent-500/15',
      text: 'text-accent-400',
      border: 'border-accent-500/30',
    },
    success: {
      bg: 'bg-success-500/15',
      text: 'text-success-400',
      border: 'border-success-500/30',
    },
    warning: {
      bg: 'bg-warning-500/15',
      text: 'text-warning-400',
      border: 'border-warning-500/30',
    },
  };

  const colors = accentColors[accentColor];

  return (
    <div className={clsx('card relative overflow-hidden', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="stat-label mb-2">{label}</p>
          <p className="stat-value">{value}</p>
          {subValue && (
            <p className={clsx('text-sm mt-1', colors.text)}>{subValue}</p>
          )}
          {trend && (
            <div
              className={clsx(
                'flex items-center gap-1 text-sm mt-2',
                trendUp ? 'text-success-400' : 'text-danger-400'
              )}
            >
              <span>{trendUp ? '+' : ''}{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              colors.bg,
              'border',
              colors.border
            )}
          >
            <Icon className={clsx('w-6 h-6', colors.text)} />
          </div>
        )}
      </div>
      {/* Accent bottom border */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 h-0.5',
          accentColor === 'primary' && 'bg-gradient-to-r from-primary-500 to-primary-400',
          accentColor === 'secondary' && 'bg-gradient-to-r from-secondary-500 to-secondary-400',
          accentColor === 'accent' && 'bg-gradient-to-r from-accent-500 to-accent-400',
          accentColor === 'success' && 'bg-gradient-to-r from-success-500 to-success-400',
          accentColor === 'warning' && 'bg-gradient-to-r from-warning-500 to-warning-400'
        )}
      />
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
Card.Stat = CardStat;

export default Card;
