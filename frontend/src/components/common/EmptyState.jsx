import { FiInbox } from 'react-icons/fi';
import clsx from 'clsx';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No data found',
  description = 'There is nothing to display at the moment.',
  action,
  actionLabel = 'Get Started',
  actionVariant = 'primary',
  secondaryAction,
  secondaryActionLabel,
  className = '',
  size = 'md',
  iconColor = 'default',
}) => {
  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      iconWrapper: 'w-12 h-12 mb-3',
      icon: 'w-6 h-6',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12 px-6',
      iconWrapper: 'w-16 h-16 mb-4',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      iconWrapper: 'w-20 h-20 mb-5',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const iconColors = {
    default: {
      bg: 'bg-dark-800',
      border: 'border-dark-700',
      icon: 'text-dark-400',
    },
    primary: {
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
      icon: 'text-primary-400',
    },
    secondary: {
      bg: 'bg-secondary-500/10',
      border: 'border-secondary-500/20',
      icon: 'text-secondary-400',
    },
    success: {
      bg: 'bg-success-500/10',
      border: 'border-success-500/20',
      icon: 'text-success-400',
    },
  };

  const sizes = sizeClasses[size];
  const colors = iconColors[iconColor];

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      <div
        className={clsx(
          'rounded-full flex items-center justify-center border',
          sizes.iconWrapper,
          colors.bg,
          colors.border
        )}
      >
        <Icon className={clsx(sizes.icon, colors.icon)} />
      </div>

      <h3
        className={clsx(
          'font-semibold text-white mb-1.5',
          sizes.title
        )}
      >
        {title}
      </h3>

      <p
        className={clsx(
          'text-dark-400 max-w-sm mb-5',
          sizes.description
        )}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            <Button
              onClick={secondaryAction}
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryActionLabel}
            </Button>
          )}
          {action && (
            <Button
              onClick={action}
              variant={actionVariant}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized empty states
export const EmptySearch = ({
  query,
  onClear,
  className = '',
}) => (
  <EmptyState
    icon={FiInbox}
    title="No results found"
    description={
      query
        ? `No results for "${query}". Try adjusting your search.`
        : 'Try adjusting your filters or search query.'
    }
    action={onClear}
    actionLabel="Clear Search"
    actionVariant="secondary"
    className={className}
  />
);

export const EmptyList = ({
  itemName = 'items',
  action,
  actionLabel,
  className = '',
}) => (
  <EmptyState
    title={`No ${itemName} yet`}
    description={`Get started by creating your first ${itemName.replace(/s$/, '')}.`}
    action={action}
    actionLabel={actionLabel || `Create ${itemName.replace(/s$/, '')}`}
    className={className}
  />
);

export default EmptyState;
