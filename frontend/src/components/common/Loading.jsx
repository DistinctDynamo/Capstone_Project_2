import clsx from 'clsx';

const sizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const borderSizes = {
  xs: 'border-2',
  sm: 'border-2',
  md: 'border-3',
  lg: 'border-3',
  xl: 'border-4',
};

// Soccer ball inspired loading spinner
const Loading = ({
  size = 'md',
  className = '',
  text = '',
  variant = 'primary',
}) => {
  const variantColors = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    accent: 'border-accent-500',
    white: 'border-white',
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-3',
        className
      )}
      role="status"
      aria-label={text || 'Loading'}
    >
      <div
        className={clsx(
          sizes[size],
          borderSizes[size],
          'rounded-full border-dark-700 animate-spin',
          variantColors[variant]
        )}
        style={{
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
        }}
      />
      {text && (
        <p className="text-dark-400 text-sm font-medium animate-pulse-soft">
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loading state
export const LoadingPage = ({
  text = 'Loading...',
  minHeight = '60vh',
}) => (
  <div
    className="flex items-center justify-center"
    style={{ minHeight }}
  >
    <Loading size="lg" text={text} />
  </div>
);

// Loading overlay for modals/sections
export const LoadingOverlay = ({
  text = 'Loading...',
  blur = true,
}) => (
  <div
    className={clsx(
      'fixed inset-0 z-50 flex items-center justify-center',
      blur ? 'bg-dark-950/80' : 'bg-dark-950/95'
    )}
  >
    <div className="card p-8 animate-scale-in">
      <Loading size="lg" text={text} />
    </div>
  </div>
);

// Inline loading for buttons or small areas
export const LoadingInline = ({ className = '' }) => (
  <Loading size="sm" className={className} variant="white" />
);

// Skeleton loader for content placeholders
export const Skeleton = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animated = true,
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={clsx(
        'bg-dark-800',
        roundedClasses[rounded],
        animated && 'skeleton',
        className
      )}
      style={{ width, height }}
    />
  );
};

// Skeleton for text lines
export const SkeletonText = ({
  lines = 3,
  className = '',
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'space-y-1.5',
    md: 'space-y-2',
    lg: 'space-y-3',
  };

  return (
    <div className={clsx(spacingClasses[spacing], className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          className={clsx(
            i === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
};

// Skeleton for cards
export const SkeletonCard = ({ className = '' }) => (
  <div className={clsx('card', className)}>
    <div className="flex items-start gap-4">
      <Skeleton width="3rem" height="3rem" rounded="lg" />
      <div className="flex-1">
        <Skeleton height="1.25rem" width="60%" className="mb-2" />
        <Skeleton height="0.875rem" width="40%" />
      </div>
    </div>
    <div className="mt-4">
      <SkeletonText lines={2} />
    </div>
  </div>
);

// Skeleton for table rows
export const SkeletonTableRow = ({
  columns = 5,
  className = '',
}) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton
          height="1rem"
          width={i === 0 ? '70%' : i === columns - 1 ? '50%' : '80%'}
        />
      </td>
    ))}
  </tr>
);

export default Loading;
